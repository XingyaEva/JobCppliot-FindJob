/**
 * 简历相关 API 路由
 */

import { Hono } from 'hono';
import { DAGExecutor } from '../core/dag-executor';
import { resumeStorage, matchStorage, jobStorage, generateId, now } from '../core/storage';
import { executeResumePreprocess, type ResumePreprocessInput } from '../agents/resume-preprocess';
import { executeResumeParse, type ResumeParseOutput } from '../agents/resume-parse';
import { executeMatchEvaluate } from '../agents/match-evaluate';
import type { Resume, Match, DAGState } from '../types';

const resumeRoutes = new Hono();

// 存储进行中的DAG状态（内存缓存）
const dagStates = new Map<string, DAGState>();

/**
 * 创建简历解析DAG并执行
 */
async function runResumeParseDAG(
  input: ResumePreprocessInput,
  resumeId: string
): Promise<{
  success: boolean;
  cleanedText?: string;
  parsedResume?: ResumeParseOutput;
  error?: string;
}> {
  const dag = new DAGExecutor();

  // 存储中间结果
  let cleanedText = '';

  // 添加节点
  dag.addNode({
    id: 'preprocess',
    name: '简历预处理',
    agent: 'resume-preprocess',
    dependencies: [],
    execute: async () => {
      const result = await executeResumePreprocess(input);
      if (result.success && result.data) {
        cleanedText = result.data.cleanedText;
      }
      return result;
    },
  });

  dag.addNode({
    id: 'parse',
    name: '简历解析',
    agent: 'resume-parse',
    dependencies: ['preprocess'],
    execute: async () => {
      return await executeResumeParse({ cleanedText });
    },
  });

  // 监听状态变化
  dag.onStateChange((state) => {
    dagStates.set(resumeId, state);
  });

  // 执行DAG
  const finalState = await dag.execute();
  dagStates.set(resumeId, finalState);

  // 收集结果
  const results = dag.getResults();

  if (finalState.error) {
    return { success: false, error: finalState.error };
  }

  return {
    success: true,
    cleanedText,
    parsedResume: results['parse'],
  };
}

/**
 * POST /api/resume/parse - 解析简历
 */
resumeRoutes.post('/parse', async (c) => {
  try {
    const body = await c.req.json();
    const { type, content, fileData, fileName } = body;

    // 验证输入
    if (!type || (type !== 'text' && type !== 'file')) {
      return c.json({ success: false, error: '无效的type参数，必须是text或file' }, 400);
    }

    if (type === 'text' && !content) {
      return c.json({ success: false, error: '文本模式需要提供content' }, 400);
    }

    if (type === 'file' && !fileData) {
      return c.json({ success: false, error: '文件模式需要提供fileData' }, 400);
    }

    const resumeId = generateId();
    console.log(`[API] 开始解析简历，ID: ${resumeId}, 类型: ${type}`);

    // 执行DAG（同步等待）
    const result = await runResumeParseDAG(
      { type, content, fileData, fileName },
      resumeId
    );

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    // 创建完整的简历记录
    const resume: Resume = {
      id: resumeId,
      basic_info: result.parsedResume!.basic_info,
      education: result.parsedResume!.education,
      work_experience: result.parsedResume!.work_experience,
      projects: result.parsedResume!.projects,
      skills: result.parsedResume!.skills,
      ability_tags: result.parsedResume!.ability_tags,
      raw_content: result.cleanedText || content || '',
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };

    console.log(`[API] 简历解析完成，ID: ${resumeId}, 姓名: ${resume.basic_info.name}`);

    return c.json({
      success: true,
      resumeId,
      resume,
      dagState: dagStates.get(resumeId),
    });
  } catch (error) {
    console.error('[API] 简历解析失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * GET /api/resume - 获取当前简历
 */
resumeRoutes.get('/', async (c) => {
  const resume = resumeStorage.getCurrent();

  if (!resume) {
    return c.json({
      success: true,
      resume: null,
      message: '暂无简历',
    });
  }

  return c.json({
    success: true,
    resume,
  });
});

/**
 * GET /api/resume/:id - 获取简历详情
 */
resumeRoutes.get('/:id', async (c) => {
  const resumeId = c.req.param('id');
  const resume = resumeStorage.getById(resumeId);

  if (!resume) {
    return c.json({ success: false, error: '未找到简历' }, 404);
  }

  return c.json({
    success: true,
    resume,
  });
});

/**
 * DELETE /api/resume/:id - 删除简历
 */
resumeRoutes.delete('/:id', async (c) => {
  const resumeId = c.req.param('id');
  const deleted = resumeStorage.delete(resumeId);

  if (!deleted) {
    return c.json({ success: false, error: '未找到简历' }, 404);
  }

  return c.json({ success: true });
});

/**
 * GET /api/resumes - 获取简历列表
 */
resumeRoutes.get('s', async (c) => {
  const resumes = resumeStorage.getAll();

  return c.json({
    success: true,
    resumes,
    total: resumes.length,
  });
});

export default resumeRoutes;

// ==================== 匹配相关路由（挂载在job路由下） ====================

export const matchRoutes = new Hono();

/**
 * POST /api/job/:id/match - 执行匹配评估
 */
matchRoutes.post('/:id/match', async (c) => {
  try {
    const jobId = c.req.param('id');
    const body = await c.req.json();
    const { resumeId } = body;

    // 获取岗位信息
    const job = jobStorage.getById(jobId);
    if (!job) {
      return c.json({ success: false, error: '未找到岗位' }, 404);
    }

    if (!job.structured_jd || !job.a_analysis || !job.b_analysis) {
      return c.json({ success: false, error: '岗位分析未完成' }, 400);
    }

    // 获取简历信息
    const resume = resumeId 
      ? resumeStorage.getById(resumeId)
      : resumeStorage.getCurrent();

    if (!resume) {
      return c.json({ success: false, error: '未找到简历，请先上传简历' }, 400);
    }

    console.log(`[API] 开始匹配评估，岗位: ${job.title}, 简历: ${resume.basic_info.name}`);

    // 执行匹配评估
    const result = await executeMatchEvaluate({
      resume: {
        basic_info: resume.basic_info,
        education: resume.education,
        work_experience: resume.work_experience,
        projects: resume.projects,
        skills: resume.skills,
        ability_tags: resume.ability_tags,
      },
      job: {
        title: job.title,
        company: job.company,
        structured_jd: {
          responsibilities: job.structured_jd.responsibilities,
          requirements: job.structured_jd.requirements,
          preferred: job.structured_jd.preferred,
        },
        a_analysis: job.a_analysis,
        b_analysis: job.b_analysis,
      },
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    // 创建匹配记录
    const match: Match = {
      id: generateId(),
      job_id: jobId,
      resume_id: resume.id,
      match_level: result.data!.match_level,
      match_score: result.data!.match_score,
      dimension_match: result.data!.dimension_match,
      strengths: result.data!.strengths,
      gaps: result.data!.gaps,
      interview_focus_suggestion: result.data!.interview_focus_suggestion,
      created_at: now(),
    };

    console.log(`[API] 匹配评估完成，等级: ${match.match_level}, 分数: ${match.match_score}`);

    return c.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error('[API] 匹配评估失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * GET /api/job/:id/match - 获取匹配结果
 */
matchRoutes.get('/:id/match', async (c) => {
  const jobId = c.req.param('id');
  const match = matchStorage.getByJobId(jobId);

  if (!match) {
    return c.json({
      success: true,
      match: null,
      message: '暂无匹配记录',
    });
  }

  return c.json({
    success: true,
    match,
  });
});
