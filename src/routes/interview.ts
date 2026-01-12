/**
 * 面试准备相关 API 路由
 */

import { Hono } from 'hono';
import { executeCompanyAnalyze, type CompanyAnalyzeOutput } from '../agents/company-analyze';
import { executeInterviewPrep, type InterviewPrepOutput } from '../agents/interview-prep';
import type { Job, Resume, Match, InterviewPrep } from '../types';

const interviewRoutes = new Hono();

// 内存存储（生产环境应使用 KV 或 D1）
const interviewStore = new Map<string, {
  job_id: string;
  company_analysis: CompanyAnalyzeOutput;
  interview_prep: InterviewPrepOutput;
  created_at: string;
}>();

/**
 * POST /api/job/:id/interview
 * 生成面试准备材料（包括公司分析和面试准备）
 */
interviewRoutes.post('/:id/interview', async (c) => {
  const jobId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { resumeId, job, resume, match } = body;

    // 验证必需参数
    if (!job || !resume || !match) {
      return c.json({
        success: false,
        error: '缺少必需参数：job, resume, match',
      }, 400);
    }

    console.log('[面试准备API] 开始生成面试准备材料:', jobId);

    // 步骤1: 执行公司分析
    console.log('[面试准备API] 步骤1: 公司分析');
    const companyResult = await executeCompanyAnalyze({
      company: job.company,
      title: job.title,
      structured_jd: job.structured_jd,
      a_analysis: job.a_analysis,
      b_analysis: job.b_analysis,
    });

    if (!companyResult.success || !companyResult.data) {
      return c.json({
        success: false,
        error: '公司分析失败: ' + companyResult.error,
        phase: 'company_analysis',
      }, 500);
    }

    // 步骤2: 执行面试准备
    console.log('[面试准备API] 步骤2: 面试准备');
    const prepResult = await executeInterviewPrep({
      job: {
        title: job.title,
        company: job.company,
        structured_jd: job.structured_jd,
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
      company_analysis: companyResult.data,
    });

    if (!prepResult.success || !prepResult.data) {
      return c.json({
        success: false,
        error: '面试准备生成失败: ' + prepResult.error,
        phase: 'interview_prep',
        company_analysis: companyResult.data,
      }, 500);
    }

    // 存储结果
    const interviewData = {
      job_id: jobId,
      company_analysis: companyResult.data,
      interview_prep: prepResult.data,
      created_at: new Date().toISOString(),
    };
    interviewStore.set(jobId, interviewData);

    console.log('[面试准备API] 生成完成');

    return c.json({
      success: true,
      job_id: jobId,
      company_analysis: companyResult.data,
      interview_prep: prepResult.data,
      duration: {
        company_analysis_ms: companyResult.duration_ms,
        interview_prep_ms: prepResult.duration_ms,
        total_ms: (companyResult.duration_ms || 0) + (prepResult.duration_ms || 0),
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[面试准备API] 错误:', errorMessage);
    return c.json({
      success: false,
      error: errorMessage,
    }, 500);
  }
});

/**
 * GET /api/job/:id/interview
 * 获取已生成的面试准备材料
 */
interviewRoutes.get('/:id/interview', async (c) => {
  const jobId = c.req.param('id');
  
  const data = interviewStore.get(jobId);
  
  if (!data) {
    return c.json({
      success: false,
      error: '未找到面试准备材料，请先生成',
    }, 404);
  }

  return c.json({
    success: true,
    ...data,
  });
});

/**
 * GET /api/job/:id/company
 * 仅获取公司分析结果
 */
interviewRoutes.get('/:id/company', async (c) => {
  const jobId = c.req.param('id');
  
  const data = interviewStore.get(jobId);
  
  if (!data) {
    return c.json({
      success: false,
      error: '未找到公司分析结果',
    }, 404);
  }

  return c.json({
    success: true,
    company_analysis: data.company_analysis,
  });
});

/**
 * POST /api/job/:id/company
 * 单独执行公司分析
 */
interviewRoutes.post('/:id/company', async (c) => {
  const jobId = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { job } = body;

    if (!job) {
      return c.json({
        success: false,
        error: '缺少必需参数：job',
      }, 400);
    }

    const result = await executeCompanyAnalyze({
      company: job.company,
      title: job.title,
      structured_jd: job.structured_jd,
      a_analysis: job.a_analysis,
      b_analysis: job.b_analysis,
    });

    if (!result.success) {
      return c.json({
        success: false,
        error: result.error,
      }, 500);
    }

    return c.json({
      success: true,
      company_analysis: result.data,
      duration_ms: result.duration_ms,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return c.json({
      success: false,
      error: errorMessage,
    }, 500);
  }
});

export default interviewRoutes;
