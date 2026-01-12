/**
 * 简历优化相关 API 路由
 */

import { Hono } from 'hono';
import { executeResumeOptimize, type ResumeOptimizeOutput } from '../agents/resume-optimize';

const optimizeRoutes = new Hono();

// 内存存储（生产环境应使用 KV 或 D1）
const optimizeStore = new Map<string, {
  id: string;
  job_id: string;
  resume_id: string;
  optimization: ResumeOptimizeOutput;
  user_suggestions?: string;
  created_at: string;
  updated_at: string;
}>();

/**
 * POST /api/job/:id/optimize
 * 执行简历优化
 */
optimizeRoutes.post('/:id/optimize', async (c) => {
  const jobId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { job, resume, match, userSuggestions } = body;

    // 验证必需参数
    if (!job || !resume || !match) {
      return c.json({
        success: false,
        error: '缺少必需参数：job, resume, match',
      }, 400);
    }

    console.log('[简历优化API] 开始优化:', jobId);

    // 执行简历优化
    const result = await executeResumeOptimize({
      job: {
        title: job.title,
        company: job.company,
        structured_jd: job.structured_jd,
        a_analysis: job.a_analysis,
        b_analysis: job.b_analysis,
      },
      resume: {
        basic_info: resume.basic_info,
        education: resume.education || [],
        work_experience: resume.work_experience || [],
        projects: resume.projects || [],
        skills: resume.skills || [],
        ability_tags: resume.ability_tags || {
          industry: [],
          technology: [],
          product: [],
          capability: [],
        },
      },
      match: {
        match_level: match.match_level,
        match_score: match.match_score,
        strengths: match.strengths || [],
        gaps: match.gaps || [],
      },
      user_suggestions: userSuggestions,
    });

    if (!result.success || !result.data) {
      return c.json({
        success: false,
        error: '简历优化失败: ' + result.error,
      }, 500);
    }

    // 存储结果
    const optimizationId = `${jobId}_${Date.now()}`;
    const optimizationRecord = {
      id: optimizationId,
      job_id: jobId,
      resume_id: resume.id || 'unknown',
      optimization: result.data,
      user_suggestions: userSuggestions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    optimizeStore.set(jobId, optimizationRecord);

    console.log('[简历优化API] 优化完成');

    return c.json({
      success: true,
      optimization: optimizationRecord,
      duration_ms: result.duration_ms,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[简历优化API] 错误:', errorMessage);
    return c.json({
      success: false,
      error: errorMessage,
    }, 500);
  }
});

/**
 * GET /api/job/:id/optimize
 * 获取已生成的优化结果
 */
optimizeRoutes.get('/:id/optimize', async (c) => {
  const jobId = c.req.param('id');
  
  const data = optimizeStore.get(jobId);
  
  if (!data) {
    return c.json({
      success: false,
      error: '未找到优化结果，请先执行优化',
    }, 404);
  }

  return c.json({
    success: true,
    optimization: data,
  });
});

/**
 * POST /api/job/:id/optimize/regenerate
 * 根据用户建议重新优化
 */
optimizeRoutes.post('/:id/optimize/regenerate', async (c) => {
  const jobId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { job, resume, match, userSuggestions } = body;

    if (!userSuggestions) {
      return c.json({
        success: false,
        error: '请提供修改建议',
      }, 400);
    }

    if (!job || !resume || !match) {
      return c.json({
        success: false,
        error: '缺少必需参数：job, resume, match',
      }, 400);
    }

    console.log('[简历优化API] 根据用户建议重新优化:', userSuggestions);

    // 执行简历优化（带用户建议）
    const result = await executeResumeOptimize({
      job: {
        title: job.title,
        company: job.company,
        structured_jd: job.structured_jd,
        a_analysis: job.a_analysis,
        b_analysis: job.b_analysis,
      },
      resume: {
        basic_info: resume.basic_info,
        education: resume.education || [],
        work_experience: resume.work_experience || [],
        projects: resume.projects || [],
        skills: resume.skills || [],
        ability_tags: resume.ability_tags || {
          industry: [],
          technology: [],
          product: [],
          capability: [],
        },
      },
      match: {
        match_level: match.match_level,
        match_score: match.match_score,
        strengths: match.strengths || [],
        gaps: match.gaps || [],
      },
      user_suggestions: userSuggestions,
    });

    if (!result.success || !result.data) {
      return c.json({
        success: false,
        error: '重新优化失败: ' + result.error,
      }, 500);
    }

    // 更新存储
    const optimizationId = `${jobId}_${Date.now()}`;
    const optimizationRecord = {
      id: optimizationId,
      job_id: jobId,
      resume_id: resume.id || 'unknown',
      optimization: result.data,
      user_suggestions: userSuggestions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    optimizeStore.set(jobId, optimizationRecord);

    return c.json({
      success: true,
      optimization: optimizationRecord,
      duration_ms: result.duration_ms,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[简历优化API] 重新优化错误:', errorMessage);
    return c.json({
      success: false,
      error: errorMessage,
    }, 500);
  }
});

export default optimizeRoutes;
