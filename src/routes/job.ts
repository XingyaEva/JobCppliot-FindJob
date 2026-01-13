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
import { 
  scrapeJobUrl, 
  validateUrl, 
  identifyPlatform, 
  getSupportedPlatforms,
  setPlatformCookie,
  getPlatformCookie,
  getAllCookies
} from '../core/scraper';

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
  metrics?: any[];
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
  
  // 获取评测数据
  const metrics = dag.getMetrics();
  
  if (finalState.error) {
    return { success: false, error: finalState.error, metrics };
  }

  return {
    success: true,
    cleanedText,
    structuredJD: results['structure'],
    aAnalysis: results['analysis-a'],
    bAnalysis: results['analysis-b'],
    metrics,
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
 * 校验 URL 格式
 */
function validateJobUrl(url: string | undefined): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: true }; // 空值有效（选填字段）
  }
  
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: '链接必须以 http:// 或 https:// 开头' };
    }
    // 基本长度限制
    if (url.length > 2048) {
      return { valid: false, error: '链接长度不能超过2048字符' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: '请输入有效的链接格式' };
  }
}

/**
 * POST /api/job/parse-sync - 同步解析JD（等待完成）
 */
jobRoutes.post('/parse-sync', async (c) => {
  try {
    const body = await c.req.json();
    const { type, content, imageUrl, jobUrl } = body;

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

    // 校验岗位链接
    const urlValidation = validateJobUrl(jobUrl);
    if (!urlValidation.valid) {
      return c.json({ success: false, error: urlValidation.error }, 400);
    }

    const jobId = generateId();
    console.log(`[API] 同步解析JD，ID: ${jobId}, 类型: ${type}, 链接: ${jobUrl || '无'}`);

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
      job_url: jobUrl?.trim() || undefined,  // 新增：岗位链接
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
      metrics: result.metrics,
    });
  } catch (error) {
    console.error('[API] 同步解析失败:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, 500);
  }
});

// ============ 静态路由（必须放在动态路由之前） ============

/**
 * GET /api/job/platforms - 获取支持的平台列表
 */
jobRoutes.get('/platforms', async (c) => {
  const platforms = getSupportedPlatforms();
  const cookies = getAllCookies();
  
  return c.json({
    success: true,
    platforms: platforms.map(p => ({
      ...p,
      hasCookie: cookies[p.name] || false,
    })),
  });
});

/**
 * GET /api/job/cookie - 获取已设置的 Cookie 状态
 */
jobRoutes.get('/cookie', async (c) => {
  const cookies = getAllCookies();
  const platforms = getSupportedPlatforms();
  
  return c.json({
    success: true,
    cookies: platforms.map(p => ({
      platform: p.name,
      displayName: p.displayName,
      hasSet: cookies[p.name] || false,
    })),
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

// ============ 动态路由 ============

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
 * PUT /api/job/:id - 更新岗位信息（目前支持更新链接）
 */
jobRoutes.put('/:id', async (c) => {
  const jobId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { job_url } = body;
    
    // 校验岗位链接
    const urlValidation = validateJobUrl(job_url);
    if (!urlValidation.valid) {
      return c.json({ success: false, error: urlValidation.error }, 400);
    }
    
    // 从内存中查找岗位
    const job = jobStorage.getById(jobId);
    if (!job) {
      return c.json({ success: false, error: '未找到岗位' }, 404);
    }
    
    // 更新岗位链接
    job.job_url = job_url?.trim() || undefined;
    job.updated_at = now();
    
    // 保存更新
    jobStorage.update(jobId, job);
    
    console.log(`[API] 岗位链接已更新，ID: ${jobId}, 链接: ${job.job_url || '无'}`);
    
    return c.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('[API] 更新岗位失败:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, 500);
  }
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

// ============ URL 爬虫相关 API ============

/**
 * POST /api/job/parse-url - 通过 URL 爬取并解析 JD
 */
jobRoutes.post('/parse-url', async (c) => {
  try {
    const body = await c.req.json();
    const { url, debug } = body;

    // 验证 URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return c.json({ success: false, error: urlValidation.error }, 400);
    }

    // 识别平台
    const platform = identifyPlatform(url);
    if (!platform) {
      return c.json({ 
        success: false, 
        error: '暂不支持该平台，目前支持：Boss直聘、拉勾、猎聘' 
      }, 400);
    }

    const jobId = generateId();
    console.log(`[API] URL解析开始，ID: ${jobId}, URL: ${url}, 平台: ${platform.displayName}`);

    // 获取平台 Cookie（如果有）
    const cookie = getPlatformCookie(platform.name);

    // 步骤1：爬取页面内容
    const scrapeResult = await scrapeJobUrl(url, { cookie, debug });
    
    if (!scrapeResult.success || !scrapeResult.data) {
      console.error(`[API] URL爬取失败，ID: ${jobId}`, scrapeResult.error);
      return c.json({ 
        success: false, 
        error: scrapeResult.error || '爬取失败',
        meta: scrapeResult.meta,
      }, 400);
    }

    console.log(`[API] URL爬取成功，ID: ${jobId}, 耗时: ${scrapeResult.meta.fetchTime}ms`);

    // 步骤2：执行 JD 解析 DAG
    const result = await runJDParseDAG(
      { 
        type: 'text', 
        content: scrapeResult.data.jdContent 
      },
      jobId
    );

    if (!result.success) {
      console.error(`[API] JD解析失败，ID: ${jobId}`, result.error);
      return c.json({ 
        success: false, 
        error: result.error,
        scrapeData: scrapeResult.data,
        meta: scrapeResult.meta,
      }, 500);
    }

    // 创建完整的岗位记录
    const job: Job = {
      id: jobId,
      title: result.structuredJD?.title || scrapeResult.data.title || '未知岗位',
      company: result.structuredJD?.company || scrapeResult.data.company || '未知公司',
      job_url: url,  // 保存原始 URL
      raw_content: result.cleanedText || scrapeResult.data.jdContent,
      source_type: 'url',
      structured_jd: result.structuredJD ? {
        ...result.structuredJD,
        // 补充爬取到的信息
        salary: result.structuredJD.salary || scrapeResult.data.salary || undefined,
        location: result.structuredJD.location || scrapeResult.data.location || undefined,
      } : undefined,
      a_analysis: result.aAnalysis,
      b_analysis: result.bAnalysis,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };

    console.log(`[API] URL解析完成，ID: ${jobId}, 标题: ${job.title}, 公司: ${job.company}`);

    return c.json({
      success: true,
      job,
      dagState: dagStates.get(jobId),
      metrics: result.metrics,
      scrapeMeta: scrapeResult.meta,
    });
  } catch (error) {
    console.error('[API] URL解析异常:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }, 500);
  }
});

/**
 * POST /api/job/validate-url - 验证 URL 是否支持爬取
 */
jobRoutes.post('/validate-url', async (c) => {
  try {
    const body = await c.req.json();
    const { url } = body;

    const validation = validateUrl(url);
    if (!validation.valid) {
      return c.json({ 
        valid: false, 
        error: validation.error 
      });
    }

    const platform = identifyPlatform(url);
    return c.json({
      valid: true,
      platform: platform ? {
        name: platform.name,
        displayName: platform.displayName,
        requiresCookie: platform.requiresCookie,
        hasCookie: !!getPlatformCookie(platform.name),
      } : null,
    });
  } catch (error) {
    return c.json({ 
      valid: false, 
      error: error instanceof Error ? error.message : '验证失败' 
    });
  }
});

/**
 * POST /api/job/cookie - 设置平台 Cookie
 */
jobRoutes.post('/cookie', async (c) => {
  try {
    const body = await c.req.json();
    const { platform, cookie } = body;

    if (!platform || !cookie) {
      return c.json({ 
        success: false, 
        error: '请提供 platform 和 cookie' 
      }, 400);
    }

    // 验证平台是否支持
    const platforms = getSupportedPlatforms();
    const validPlatform = platforms.find(p => p.name === platform);
    if (!validPlatform) {
      return c.json({ 
        success: false, 
        error: `不支持的平台: ${platform}` 
      }, 400);
    }

    // 保存 Cookie
    setPlatformCookie(platform, cookie);

    console.log(`[API] Cookie已设置，平台: ${platform}`);

    return c.json({
      success: true,
      message: `${validPlatform.displayName} Cookie 设置成功`,
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '设置失败' 
    }, 500);
  }
});

/**
 * DELETE /api/job/cookie/:platform - 删除平台 Cookie
 */
jobRoutes.delete('/cookie/:platform', async (c) => {
  const platform = c.req.param('platform');
  
  const platforms = getSupportedPlatforms();
  const validPlatform = platforms.find(p => p.name === platform);
  if (!validPlatform) {
    return c.json({ 
      success: false, 
      error: `不支持的平台: ${platform}` 
    }, 404);
  }

  // 清除 Cookie（设置为空）
  setPlatformCookie(platform, '');

  console.log(`[API] Cookie已删除，平台: ${platform}`);

  return c.json({
    success: true,
    message: `${validPlatform.displayName} Cookie 已删除`,
  });
});

export default jobRoutes;
