/**
 * Resume Version Agent
 * Phase 7: JD 定向简历生成
 * 
 * 根据 JD 分析结果和简历能力画像，生成定向简历版本
 */

import { chat, parseJsonResponse } from '../core/api-client';
import type { Resume, Job, JDTargetedResumeResult, ResumeContent, AgentResult } from '../types';

// 输入类型
export interface ResumeVersionInput {
  resume: Resume;           // 原始简历
  job: Job;                 // 目标岗位（含 A/B 分析结果）
  customSuggestions?: string;  // 用户自定义建议
}

// 输出类型
export interface ResumeVersionOutput {
  suggestions: {
    keyword_enhancements: string[];   // 关键词强化
    experience_reorder: string[];     // 经历排序建议
    content_adjustments: string[];    // 内容调整建议
    weakened_items: string[];         // 弱化/删除建议
  };
  optimized_content: ResumeContent;   // 优化后的简历内容
  match_improvement: string;          // 预估匹配度提升
  version_tag: string;                // 建议的版本标签
}

// 系统提示词
const SYSTEM_PROMPT = `你是资深简历优化专家，擅长根据目标岗位的要求定制简历版本。

## 任务
根据目标岗位的 JD 分析结果（A/B 维度）和候选人的简历能力画像，生成一份针对性优化的简历版本。

## 分析维度
- A1_tech_stack: 技术栈关键词
- A2_product_type: 产品类型（ToB/ToC/平台型等）
- A3_business_domain: 业务领域
- A4_team_stage: 团队阶段（0-1/成长期/成熟期）
- B1_industry_requirement: 行业背景要求
- B2_tech_requirement: 技术深度要求
- B3_product_experience: 产品经验类型
- B4_capability_requirement: 核心能力要求

## 优化策略
1. **关键词注入**: 将 JD 中的关键技术/产品词汇融入简历描述
2. **经历排序**: 将最匹配的经历放在前面
3. **内容强化**: 突出与岗位需求匹配的成果和能力
4. **弱化/删除**: 隐藏或精简与目标岗位不相关的内容

## 输出要求
以 JSON 格式输出，包含：
1. suggestions: 优化建议详情
2. optimized_content: 完整的优化后简历内容
3. match_improvement: 预估匹配度提升描述
4. version_tag: 建议的版本标签（如"AI产品经理-保险"）

注意：
- 保持简历内容真实，只做表达优化，不虚构经历
- 数字和成果要保持原有数据
- 优化后的描述要自然流畅，不要堆砌关键词`;

/**
 * 执行 JD 定向简历生成
 */
export async function executeResumeVersion(
  input: ResumeVersionInput
): Promise<AgentResult<ResumeVersionOutput>> {
  const startTime = Date.now();
  
  console.log(`[Agent] 开始生成定向简历 - 岗位: ${input.job.title}, 公司: ${input.job.company}`);
  
  try {
    const { resume, job, customSuggestions } = input;
    
    // 构建用户消息
    const userMessage = `
## 目标岗位信息

**岗位名称**: ${job.title}
**公司**: ${job.company}
**薪资**: ${job.structured_jd?.salary || '面议'}

### 岗位职责
${job.structured_jd?.responsibilities?.map((r, i) => `${i + 1}. ${r}`).join('\n') || '无'}

### 任职要求
${job.structured_jd?.requirements?.map((r, i) => `${i + 1}. ${r}`).join('\n') || '无'}

### 加分项
${job.structured_jd?.preferred?.join('、') || '无'}

---

## A 维度分析结果

### A1 技术栈
- 关键词: ${job.a_analysis?.A1_tech_stack?.keywords?.join('、') || '无'}
- 技术密度: ${job.a_analysis?.A1_tech_stack?.density || '未知'}
- 总结: ${job.a_analysis?.A1_tech_stack?.summary || ''}

### A2 产品类型
- 类型: ${job.a_analysis?.A2_product_type?.type || '未知'}
- 原因: ${job.a_analysis?.A2_product_type?.reason || ''}

### A3 业务领域
- 主领域: ${job.a_analysis?.A3_business_domain?.primary || '未知'}
- 相关领域: ${job.a_analysis?.A3_business_domain?.secondary?.join('、') || '无'}
- 总结: ${job.a_analysis?.A3_business_domain?.summary || ''}

### A4 团队阶段
- 阶段: ${job.a_analysis?.A4_team_stage?.stage || '未知'}
- 证据: ${job.a_analysis?.A4_team_stage?.evidence || ''}

---

## B 维度分析结果

### B1 行业背景要求
- 是否必需: ${job.b_analysis?.B1_industry_requirement?.required ? '是' : '否'}
- 偏好: ${job.b_analysis?.B1_industry_requirement?.preferred ? '有偏好' : '无偏好'}
- 年限: ${job.b_analysis?.B1_industry_requirement?.years || '不限'}
- 特定行业: ${job.b_analysis?.B1_industry_requirement?.specific_industry || '无'}
- 总结: ${job.b_analysis?.B1_industry_requirement?.summary || ''}

### B2 技术背景要求
- 学历: ${job.b_analysis?.B2_tech_requirement?.education || '不限'}
- 了解: ${job.b_analysis?.B2_tech_requirement?.tech_depth?.['了解']?.join('、') || '无'}
- 熟悉: ${job.b_analysis?.B2_tech_requirement?.tech_depth?.['熟悉']?.join('、') || '无'}
- 精通: ${job.b_analysis?.B2_tech_requirement?.tech_depth?.['精通']?.join('、') || '无'}
- 总结: ${job.b_analysis?.B2_tech_requirement?.summary || ''}

### B3 产品经验
- 产品类型: ${job.b_analysis?.B3_product_experience?.product_types?.join('、') || '不限'}
- 全周期经验: ${job.b_analysis?.B3_product_experience?.need_full_cycle ? '需要' : '不要求'}
- 0-1经验: ${job.b_analysis?.B3_product_experience?.need_0to1 ? '需要' : '不要求'}
- 总结: ${job.b_analysis?.B3_product_experience?.summary || ''}

### B4 核心能力
${job.b_analysis?.B4_capability_requirement?.capabilities?.map(cap => `- ${cap.name}: ${cap.detail}`).join('\n') || '无'}
- 总结: ${job.b_analysis?.B4_capability_requirement?.summary || ''}

---

## 候选人简历

### 基本信息
- 姓名: ${resume.basic_info?.name || '未知'}
- 目标岗位: ${resume.basic_info?.target_position || '未指定'}

### 能力标签
- 行业: ${resume.ability_tags?.industry?.join('、') || '无'}
- 技术: ${resume.ability_tags?.technology?.join('、') || '无'}
- 产品: ${resume.ability_tags?.product?.join('、') || '无'}
- 能力: ${resume.ability_tags?.capability?.join('、') || '无'}

### 教育背景
${resume.education?.map(edu => `- ${edu.school} | ${edu.major} | ${edu.degree} | ${edu.duration}`).join('\n') || '无'}

### 工作经历
${resume.work_experience?.map(exp => 
  `**${exp.company} | ${exp.position} | ${exp.duration}**\n${exp.description || ''}`
).join('\n\n') || '无'}

### 项目经历
${resume.projects?.map(proj =>
  `**${proj.name} | ${proj.role} | ${proj.duration}**\n${proj.description || ''}\n- 成果: ${proj.achievements?.join('、') || '无'}\n- 技术: ${proj.tech_stack?.join('、') || '无'}`
).join('\n\n') || '无'}

### 专业技能
${resume.skills?.join('、') || '无'}

---

${customSuggestions ? `## 用户自定义优化建议\n${customSuggestions}\n\n---` : ''}

请根据以上信息，生成针对该岗位优化的简历版本。输出 JSON 格式。`;

    // 调用 LLM
    const response = await chat(SYSTEM_PROMPT, userMessage, {
      agentId: 'resume-version',
      jsonMode: true,
    });

    // 解析结果
    const result = parseJsonResponse<ResumeVersionOutput>(response);
    
    // 确保结构完整
    const output: ResumeVersionOutput = {
      suggestions: {
        keyword_enhancements: result.suggestions?.keyword_enhancements || [],
        experience_reorder: result.suggestions?.experience_reorder || [],
        content_adjustments: result.suggestions?.content_adjustments || [],
        weakened_items: result.suggestions?.weakened_items || [],
      },
      optimized_content: result.optimized_content || {
        basic_info: resume.basic_info,
        education: resume.education,
        work_experience: resume.work_experience,
        projects: resume.projects,
        skills: resume.skills,
        ability_tags: resume.ability_tags,
      },
      match_improvement: result.match_improvement || '预估提升 10-20%',
      version_tag: result.version_tag || `${job.title}-${job.company}`.substring(0, 30),
    };

    const duration = Date.now() - startTime;
    console.log(`[Agent] 定向简历生成完成，耗时: ${duration}ms`);

    return {
      success: true,
      data: output,
      duration_ms: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Agent] 定向简历生成失败:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      duration_ms: duration,
    };
  }
}
