/**
 * 岗位相关 API 路由
 */

import { Hono } from 'hono';
import { DAGExecutor } from '../core/dag-executor';
import { jobStorage, generateId, now } from '../core/storage';
import { executeJDPreprocess, type JDPreprocessInput } from '../agents/jd-preprocess';
import { executeJDStructure } from '../agents/jd-structure';
import { executeAAnalysis } from '../agents/jd-analysis-a';
import { executeBAnalysis } from '../agents/jd-analysis-b';
import type { Job, StructuredJD, AAnalysis, DAGState } from '../types';

const jobRoutes = new Hono();

// 存储进行中的DAG状态（内存缓存）
const dagStates = new Map<string, DAGState>();

/**
 * 创建JD解析DAG并执行
 */
async function runJDParseDAG(
  input: JDPreprocessInput,
  jobId: string,
  onStateChange?: (state: DAGState) => void
): Promise<{
  success: boolean;
  cleanedText?: string;
  structuredJD?: StructuredJD;
  aAnalysis?: AAnalysis;
  bAnalysis?: any;
  error?: string;
}> {
  const dag = new DAGExecutor();
  
  // 存储中间结果
  let cleanedText = '';
  let structuredJD: StructuredJD | undefined;
  let aAnalysis: AAnalysis | undefined;

  // 添加节点
  dag.addNode({
    id: 'preprocess',
    name: 'JD预处理',
    agent: 'jd-preprocess',
    dependencies: [],
    execute: async () => {
      const result = await executeJDPreprocess(input);
      if (result.success && result.data) {
        cleanedText = result.data.cleanedText;
      }
      return result;
    },
  });

  dag.addNode({
    id: 'structure',
    name: 'JD结构化',
    agent: 'jd-structure',
    dependencies: ['preprocess'],
    execute: async () => {
      const result = await executeJDStructure({ cleanedText });
      if (result.success && result.data) {
        structuredJD = result.data;
      }
      return result;
    },
  });

  dag.addNode({
    id: 'analysis-a',
    name: 'A维度分析',
    agent: 'jd-analysis-a',
    dependencies: ['structure'],
    execute: async () => {
      if (!structuredJD) {
        return { success: false, error: '缺少结构化JD' };
      }
      const result = await executeAAnalysis({ structuredJD, rawText: cleanedText });
      if (result.success && result.data) {
        aAnalysis = result.data;
      }
      return result;
    },
  });

  dag.addNode({
    id: 'analysis-b',
    name: 'B维度分析',
    agent: 'jd-analysis-b',
    dependencies: ['structure', 'analysis-a'],
    execute: async () => {
      if (!structuredJD || !aAnalysis) {
        return { success: false, error: '缺少前置分析结果' };
      }
      return await executeBAnalysis({ structuredJD, aAnalysis, rawText: cleanedText });
    },
  });

  // 监听状态变化
  dag.onStateChange((state) => {
    dagStates.set(jobId, state);
    if (onStateChange) {
      onStateChange(state);
    }
  });

  // 执行DAG
  const finalState = await dag.execute();
  dagStates.set(jobId, finalState);

  // 收集结果
  const results = dag.getResults();
  
  if (finalState.error) {
    return { success: false, error: finalState.error };
  }

  return {
    success: true,
    cleanedText,
    structuredJD: results['structure'],
    aAnalysis: results['analysis-a'],
    bAnalysis: results['analysis-b'],
  };
}

/**
 * POST /api/job/parse - 开始解析JD
 */
jobRoutes.post('/parse', async (c) => {
  try {
    const body = await c.req.json();
    const { type, content, imageUrl } = body;

    // 验证输入
    if (!type || (type !== 'text' && type !== 'image')) {
      return c.json({ success: false, error: '无效的type参数，必须是text或image' }, 400);
    }

    if (type === 'text' && !content) {
      return c.json({ success: false, error: '文本模式需要提供content' }, 400);
    }

    if (type === 'image' && !imageUrl) {
      return c.json({ success: false, error: '图片模式需要提供imageUrl' }, 400);
    }

    // 创建岗位记录
    const jobId = generateId();
    const job: Job = {
      id: jobId,
      title: '解析中...',
      company: '解析中...',
      raw_content: content || '',
      source_type: type,
      image_url: imageUrl,
      status: 'processing',
      created_at: now(),
      updated_at: now(),
    };

    // 保存初始记录
    const jobs = jobStorage.getAll();
    jobs.unshift(job);
    jobStorage.create ? null : null; // 使用内存存储

    console.log(`[API] 开始解析JD，ID: ${jobId}, 类型: ${type}`);

    // 异步执行DAG（不阻塞响应）
    const parsePromise = runJDParseDAG(
      { type, content, imageUrl },
      jobId
    ).then((result) => {
      // 更新岗位记录
      if (result.success) {
        job.title = result.structuredJD?.title || '未知岗位';
        job.company = result.structuredJD?.company || '未知公司';
        job.raw_content = result.cleanedText || job.raw_content;
        job.structured_jd = result.structuredJD;
        job.a_analysis = result.aAnalysis;
        job.b_analysis = result.bAnalysis;
        job.status = 'completed';
      } else {
        job.status = 'error';
        job.error_message = result.error;
      }
      job.updated_at = now();
      
      console.log(`[API] JD解析完成，ID: ${jobId}, 状态: ${job.status}`);
    }).catch((error) => {
      job.status = 'error';
      job.error_message = error.message;
      job.updated_at = now();
      console.error(`[API] JD解析异常，ID: ${jobId}`, error);
    });

    // 存储promise引用（用于同步等待）
    (job as any)._parsePromise = parsePromise;

    // 返回立即响应
    return c.json({
      success: true,
      jobId,
      status: 'processing',
      message: '解析已开始，请通过 /api/job/:id/status 查询进度',
    });
  } catch (error) {
    console.error('[API] 解析请求失败:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, 500);
  }
});

/**
 * POST /api/job/parse-sync - 同步解析JD（等待完成）
 */
jobRoutes.post('/parse-sync', async (c) => {
  try {
    const body = await c.req.json();
    const { type, content, imageUrl } = body;

    // 验证输入
    if (!type || (type !== 'text' && type !== 'image')) {
      return c.json({ success: false, error: '无效的type参数' }, 400);
    }

    if (type === 'text' && !content) {
      return c.json({ success: false, error: '文本模式需要提供content' }, 400);
    }

    if (type === 'image' && !imageUrl) {
      return c.json({ success: false, error: '图片模式需要提供imageUrl' }, 400);
    }

    const jobId = generateId();
    console.log(`[API] 同步解析JD，ID: ${jobId}, 类型: ${type}`);

    // 执行DAG（同步等待）
    const result = await runJDParseDAG(
      { type, content, imageUrl },
      jobId
    );

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    // 创建完整的岗位记录
    const job: Job = {
      id: jobId,
      title: result.structuredJD?.title || '未知岗位',
      company: result.structuredJD?.company || '未知公司',
      raw_content: result.cleanedText || content || '',
      source_type: type,
      image_url: imageUrl,
      structured_jd: result.structuredJD,
      a_analysis: result.aAnalysis,
      b_analysis: result.bAnalysis,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };

    console.log(`[API] 同步解析完成，ID: ${jobId}`);

    return c.json({
      success: true,
      job,
      dagState: dagStates.get(jobId),
    });
  } catch (error) {
    console.error('[API] 同步解析失败:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, 500);
  }
});

/**
 * GET /api/job/:id/status - 获取解析状态
 */
jobRoutes.get('/:id/status', async (c) => {
  const jobId = c.req.param('id');
  
  const dagState = dagStates.get(jobId);
  if (!dagState) {
    return c.json({ success: false, error: '未找到解析任务' }, 404);
  }

  return c.json({
    success: true,
    jobId,
    dagState,
  });
});

/**
 * GET /api/job/:id - 获取岗位详情
 */
jobRoutes.get('/:id', async (c) => {
  const jobId = c.req.param('id');
  
  // 从内存中查找（这里需要更好的存储方案）
  const job = jobStorage.getById(jobId);
  
  if (!job) {
    return c.json({ success: false, error: '未找到岗位' }, 404);
  }

  return c.json({
    success: true,
    job,
  });
});

/**
 * GET /api/jobs - 获取岗位列表
 */
jobRoutes.get('/', async (c) => {
  const jobs = jobStorage.getAll();
  
  return c.json({
    success: true,
    jobs,
    total: jobs.length,
  });
});

/**
 * DELETE /api/job/:id - 删除岗位
 */
jobRoutes.delete('/:id', async (c) => {
  const jobId = c.req.param('id');
  
  const deleted = jobStorage.delete(jobId);
  dagStates.delete(jobId);

  if (!deleted) {
    return c.json({ success: false, error: '未找到岗位' }, 404);
  }

  return c.json({ success: true });
});

export default jobRoutes;
