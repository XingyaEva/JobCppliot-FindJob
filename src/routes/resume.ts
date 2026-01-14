/**
 * 简历相关 API 路由
 */

import { Hono } from 'hono';
import { DAGExecutor } from '../core/dag-executor';
import { resumeStorage, resumeVersionStorage, matchStorage, jobStorage, generateId, now } from '../core/storage';
import { executeResumePreprocess, type ResumePreprocessInput } from '../agents/resume-preprocess';
import { executeResumeParse, type ResumeParseOutput } from '../agents/resume-parse';
import { executeMatchEvaluate } from '../agents/match-evaluate';
import { executeResumeVersion } from '../agents/resume-version';
import { 
  getUploadUrlAndParse, 
  waitForBatchCompletion, 
  parseDocumentByUrl,
  type MinerUTaskState 
} from '../core/mineru-client';
import type { Resume, ResumeVersion, Match, DAGState } from '../types';

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
  metrics?: any[];
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
  
  // 获取评测数据
  const metrics = dag.getMetrics();

  if (finalState.error) {
    return { success: false, error: finalState.error, metrics };
  }

  return {
    success: true,
    cleanedText,
    parsedResume: results['parse'],
    metrics,
  };
}

// ==================== MinerU 文档解析 API ====================

/**
 * POST /api/resume/mineru/upload - 上传文件到 MinerU（后端代理）
 * 
 * 方案 A：前端将文件传到后端，后端代理上传到 MinerU OSS
 * 解决 CORS 跨域问题
 */
resumeRoutes.post('/mineru/upload', async (c) => {
  try {
    // 获取 multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const isOcrStr = formData.get('isOcr') as string | null;
    const isOcr = isOcrStr === 'true';

    if (!file) {
      return c.json({ success: false, error: '缺少文件' }, 400);
    }

    const fileName = file.name;
    console.log(`[MinerU] 开始处理文件: ${fileName}, 大小: ${file.size} bytes`);

    // 步骤1: 获取上传 URL
    // 默认开启 OCR，因为简历头部通常有复杂布局（姓名+照片+联系方式）
    // VLM 模型可能跳过这些特殊区域（如从 Y=148 开始），导致个人信息丢失
    const enableOcr = isOcr !== false;  // 除非明确禁用，否则默认开启
    console.log(`[MinerU] 步骤1: 申请上传 URL... (OCR: ${enableOcr})`);
    const urlResult = await getUploadUrlAndParse(fileName, {
      isOcr: enableOcr,
      enableTable: true,
      modelVersion: 'vlm',
    });

    if (!urlResult.success || !urlResult.uploadUrl || !urlResult.batchId) {
      return c.json({ success: false, error: urlResult.error || '获取上传URL失败' }, 500);
    }

    console.log(`[MinerU] 上传 URL 获取成功，batch_id: ${urlResult.batchId}`);

    // 步骤2: 代理上传文件到 MinerU OSS
    console.log(`[MinerU] 步骤2: 上传文件到 MinerU OSS...`);
    const fileBuffer = await file.arrayBuffer();
    
    const uploadRes = await fetch(urlResult.uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error(`[MinerU] 上传失败: ${uploadRes.status} - ${errorText}`);
      return c.json({ success: false, error: `文件上传失败: ${uploadRes.status}` }, 500);
    }

    console.log(`[MinerU] 文件上传成功，等待解析...`);

    // 返回 batchId，让前端轮询解析结果
    return c.json({
      success: true,
      batchId: urlResult.batchId,
      fileName: fileName,
      message: '文件上传成功，请轮询解析结果',
    });
  } catch (error) {
    console.error('[MinerU] 上传处理失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * POST /api/resume/mineru/parse - 轮询 MinerU 解析结果并结构化
 * 
 * 在文件上传成功后调用，等待解析完成
 */
resumeRoutes.post('/mineru/parse', async (c) => {
  try {
    const body = await c.req.json();
    const { batchId, fileName } = body;

    if (!batchId || !fileName) {
      return c.json({ success: false, error: '缺少 batchId 或 fileName 参数' }, 400);
    }

    console.log(`[MinerU] 步骤3: 轮询解析结果，batch_id: ${batchId}, 文件: ${fileName}`);

    // 等待 MinerU 解析完成
    const mineruResult = await waitForBatchCompletion(batchId, fileName, (progress) => {
      console.log(`[MinerU] 解析进度: ${progress.state}, ${progress.extractedPages || 0}/${progress.totalPages || '?'}`);
    });

    if (!mineruResult.success) {
      return c.json({ success: false, error: mineruResult.error }, 500);
    }

    console.log(`[MinerU] 步骤4: 文档解析完成，开始结构化处理...`);

    // 使用解析后的 Markdown 进行简历结构化
    const cleanedText = mineruResult.markdown || '';
    
    if (cleanedText.length < 50) {
      return c.json({ success: false, error: '文档内容过短或解析失败' }, 400);
    }

    // 调用简历解析 Agent 进行结构化
    const parseResult = await executeResumeParse({ cleanedText });

    if (!parseResult.success) {
      return c.json({ success: false, error: parseResult.error }, 500);
    }

    const resumeId = generateId();
    
    // 创建简历记录
    const resume: Resume = {
      id: resumeId,
      name: parseResult.data!.basic_info?.name || '未命名简历',
      basic_info: parseResult.data!.basic_info,
      education: parseResult.data!.education,
      work_experience: parseResult.data!.work_experience,
      projects: parseResult.data!.projects,
      skills: parseResult.data!.skills,
      ability_tags: parseResult.data!.ability_tags,
      raw_content: cleanedText,
      version: 1,
      version_tag: '基础版',
      linked_jd_ids: [],
      is_master: true,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };

    console.log(`[MinerU] 简历结构化完成，ID: ${resumeId}, 姓名: ${resume.basic_info?.name}`);

    return c.json({
      success: true,
      resumeId,
      resume,
      zipUrl: mineruResult.zipUrl,
    });
  } catch (error) {
    console.error('[MinerU] 解析处理失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * POST /api/resume/mineru/parse-by-url - 通过 URL 解析文档
 * 
 * 适用于文件已有在线 URL 的场景
 */
resumeRoutes.post('/mineru/parse-by-url', async (c) => {
  try {
    const body = await c.req.json();
    const { fileUrl, isOcr } = body;

    if (!fileUrl) {
      return c.json({ success: false, error: '缺少 fileUrl 参数' }, 400);
    }

    // 调用 MinerU 解析
    // 默认开启 OCR，解决简历头部复杂布局导致的信息丢失问题
    const enableOcr = isOcr !== false;  // 除非明确禁用，否则默认开启
    console.log(`[MinerU] 通过 URL 解析文档 (OCR: ${enableOcr}): ${fileUrl}`);
    
    const mineruResult = await parseDocumentByUrl(fileUrl, {
      isOcr: enableOcr,
      enableTable: true,
      modelVersion: 'vlm',
    }, (progress) => {
      console.log(`[MinerU] 解析进度: ${progress.state}`);
    });

    if (!mineruResult.success) {
      return c.json({ success: false, error: mineruResult.error }, 500);
    }

    const cleanedText = mineruResult.markdown || '';
    
    if (cleanedText.length < 50) {
      return c.json({ success: false, error: '文档内容过短或解析失败' }, 400);
    }

    // 调用简历解析 Agent 进行结构化
    const parseResult = await executeResumeParse({ cleanedText });

    if (!parseResult.success) {
      return c.json({ success: false, error: parseResult.error }, 500);
    }

    const resumeId = generateId();
    
    const resume: Resume = {
      id: resumeId,
      name: parseResult.data!.basic_info?.name || '未命名简历',
      basic_info: parseResult.data!.basic_info,
      education: parseResult.data!.education,
      work_experience: parseResult.data!.work_experience,
      projects: parseResult.data!.projects,
      skills: parseResult.data!.skills,
      ability_tags: parseResult.data!.ability_tags,
      raw_content: cleanedText,
      version: 1,
      version_tag: '基础版',
      linked_jd_ids: [],
      is_master: true,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };

    console.log(`[MinerU] 简历解析完成，ID: ${resumeId}`);

    return c.json({
      success: true,
      resumeId,
      resume,
      zipUrl: mineruResult.zipUrl,
    });
  } catch (error) {
    console.error('[MinerU] URL 解析失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

// ==================== 原有简历解析 API ====================

/**
 * POST /api/resume/parse - 解析简历（原有逻辑，保留文本模式）
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

    // 创建完整的简历记录（支持版本管理）
    const resume: Resume = {
      id: resumeId,
      name: result.parsedResume!.basic_info?.name || '未命名简历',
      basic_info: result.parsedResume!.basic_info,
      education: result.parsedResume!.education,
      work_experience: result.parsedResume!.work_experience,
      projects: result.parsedResume!.projects,
      skills: result.parsedResume!.skills,
      ability_tags: result.parsedResume!.ability_tags,
      raw_content: result.cleanedText || content || '',
      // 版本管理字段
      version: 1,
      version_tag: '基础版',
      linked_jd_ids: [],
      is_master: true,
      // 状态
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
      metrics: result.metrics,
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
  const stats = resumeStorage.getStats();

  return c.json({
    success: true,
    resumes,
    total: resumes.length,
    stats,
  });
});

/**
 * PUT /api/resume/:id - 更新简历（自动创建版本）
 */
resumeRoutes.put('/:id', async (c) => {
  try {
    const resumeId = c.req.param('id');
    const body = await c.req.json();
    const { createVersion = true, version_tag } = body;

    const resume = resumeStorage.getById(resumeId);
    if (!resume) {
      return c.json({ success: false, error: '未找到简历' }, 404);
    }

    // 更新简历
    const updates: Partial<Resume> = {};
    if (body.name) updates.name = body.name;
    if (body.basic_info) updates.basic_info = body.basic_info;
    if (body.education) updates.education = body.education;
    if (body.work_experience) updates.work_experience = body.work_experience;
    if (body.projects) updates.projects = body.projects;
    if (body.skills) updates.skills = body.skills;
    if (body.ability_tags) updates.ability_tags = body.ability_tags;
    if (version_tag) updates.version_tag = version_tag;

    const updatedResume = resumeStorage.update(resumeId, updates, createVersion);

    return c.json({
      success: true,
      resume: updatedResume,
    });
  } catch (error) {
    console.error('[API] 更新简历失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * POST /api/resume/:id/version - 手动创建版本
 */
resumeRoutes.post('/:id/version', async (c) => {
  try {
    const resumeId = c.req.param('id');
    const body = await c.req.json();
    const { tag, linked_jd_id } = body;

    const version = resumeVersionStorage.createWithTag(
      resumeId,
      tag || `版本 ${new Date().toLocaleDateString()}`,
      linked_jd_id
    );

    if (!version) {
      return c.json({ success: false, error: '未找到简历' }, 404);
    }

    return c.json({
      success: true,
      version,
    });
  } catch (error) {
    console.error('[API] 创建版本失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
});

/**
 * GET /api/resume/:id/versions - 获取版本历史
 */
resumeRoutes.get('/:id/versions', async (c) => {
  const resumeId = c.req.param('id');
  const versions = resumeVersionStorage.getByResumeId(resumeId);

  return c.json({
    success: true,
    versions,
    total: versions.length,
  });
});

/**
 * POST /api/resume/:id/link/:jobId - 关联简历到岗位
 */
resumeRoutes.post('/:id/link/:jobId', async (c) => {
  const resumeId = c.req.param('id');
  const jobId = c.req.param('jobId');

  const resume = resumeStorage.linkToJob(resumeId, jobId);
  if (!resume) {
    return c.json({ success: false, error: '未找到简历' }, 404);
  }

  return c.json({
    success: true,
    resume,
  });
});

/**
 * DELETE /api/resume/:id/link/:jobId - 取消关联
 */
resumeRoutes.delete('/:id/link/:jobId', async (c) => {
  const resumeId = c.req.param('id');
  const jobId = c.req.param('jobId');

  const resume = resumeStorage.unlinkFromJob(resumeId, jobId);
  if (!resume) {
    return c.json({ success: false, error: '未找到简历' }, 404);
  }

  return c.json({
    success: true,
    resume,
  });
});

/**
 * GET /api/resume/by-job/:jobId - 获取岗位关联的简历
 */
resumeRoutes.get('/by-job/:jobId', async (c) => {
  const jobId = c.req.param('jobId');
  const resumes = resumeStorage.getByJobId(jobId);

  return c.json({
    success: true,
    resumes,
    total: resumes.length,
  });
});

/**
 * POST /api/job/:jobId/generate-resume - 为岗位生成定向简历
 * 
 * Phase 7: JD 定向简历生成
 */
export async function generateTargetedResume(c: any) {
  try {
    const jobId = c.req.param('jobId');
    const body = await c.req.json();
    const { resumeId, customSuggestions } = body;

    // 获取岗位信息
    const job = jobStorage.getById(jobId);
    if (!job) {
      return c.json({ success: false, error: '未找到岗位' }, 404);
    }

    if (!job.a_analysis || !job.b_analysis) {
      return c.json({ success: false, error: '岗位分析未完成，请先完成岗位解析' }, 400);
    }

    // 获取简历
    const resume = resumeId 
      ? resumeStorage.getById(resumeId)
      : resumeStorage.getCurrent();

    if (!resume) {
      return c.json({ success: false, error: '未找到简历，请先上传简历' }, 400);
    }

    console.log(`[API] 开始生成定向简历 - 岗位: ${job.title}, 简历: ${resume.basic_info?.name}`);

    // 调用 Agent
    const result = await executeResumeVersion({
      resume,
      job,
      customSuggestions,
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    // 创建新的简历版本
    const newVersion = (resume.version || 1) + 1;
    const newResume: Resume = {
      ...resume,
      id: generateId(),
      name: `${resume.name || resume.basic_info?.name} - ${result.data!.version_tag}`,
      base_resume_id: resume.id,
      version: newVersion,
      version_tag: result.data!.version_tag,
      linked_jd_ids: [jobId],
      is_master: false,
      basic_info: result.data!.optimized_content.basic_info || resume.basic_info,
      education: result.data!.optimized_content.education || resume.education,
      work_experience: result.data!.optimized_content.work_experience || resume.work_experience,
      projects: result.data!.optimized_content.projects || resume.projects,
      skills: result.data!.optimized_content.skills || resume.skills,
      ability_tags: result.data!.optimized_content.ability_tags || resume.ability_tags,
      status: 'completed',
      created_at: now(),
      updated_at: now(),
    };

    // 保存新简历（不通过 storage.create 以避免重复创建版本）
    const resumes = resumeStorage.getAll();
    resumes.unshift(newResume);
    const { setStorageData, STORAGE_KEYS } = await import('../core/storage');
    setStorageData(STORAGE_KEYS.RESUMES, resumes);

    // 创建版本记录
    resumeVersionStorage.createFromResume(
      newResume,
      'agent',
      jobId,
      `AI 为「${job.title}」岗位生成的定向简历`
    );

    // 关联原简历到岗位
    resumeStorage.linkToJob(resume.id, jobId);

    console.log(`[API] 定向简历生成完成，新简历 ID: ${newResume.id}`);

    return c.json({
      success: true,
      resume: newResume,
      suggestions: result.data!.suggestions,
      match_improvement: result.data!.match_improvement,
      duration_ms: result.duration_ms,
    });
  } catch (error) {
    console.error('[API] 定向简历生成失败:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, 500);
  }
}

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
      metrics: result.metrics,
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
