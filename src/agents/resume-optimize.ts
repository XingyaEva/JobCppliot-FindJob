/**
 * 简历优化 Agent
 * 关键词注入 + 差距弥补 + 亮点强化
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import type { AgentResult, Resume, AAnalysis, BAnalysis } from '../types';

/** 简历优化输入 */
export interface ResumeOptimizeInput {
  resume: {
    basic_info: Resume['basic_info'];
    education: Resume['education'];
    work_experience: Resume['work_experience'];
    projects: Resume['projects'];
    skills: Resume['skills'];
    ability_tags: Resume['ability_tags'];
  };
  job: {
    title: string;
    company: string;
    structured_jd: {
      responsibilities: string[];
      requirements: string[];
      preferred: string[];
    };
    a_analysis: AAnalysis;
    b_analysis: BAnalysis;
  };
  match: {
    match_level: string;
    match_score: number;
    strengths: string[];
    gaps: string[];
  };
  user_suggestions?: string;  // 用户自定义修改建议
}

/** 优化后的段落 */
export interface OptimizedSection {
  original: string;
  optimized: string;
  changes: string[];
  matched_requirements: string[];
  keywords_added?: string[];
}

/** 简历优化输出 */
export interface ResumeOptimizeOutput {
  optimization_summary: string;
  
  sections: {
    summary?: OptimizedSection;
    work_experience: Array<{
      company: string;
      position: string;
      original: string;
      optimized: string;
      changes: string[];
      matched_requirements: string[];
      keywords_added: string[];
    }>;
    projects: Array<{
      name: string;
      original: string;
      optimized: string;
      changes: string[];
      matched_requirements: string[];
      keywords_added: string[];
    }>;
    skills?: {
      original: string[];
      optimized: string[];
      added: string[];
      emphasized: string[];
      changes: string[];
    };
  };
  
  optimization_effect: {
    keywords_coverage: string;
    gaps_addressed: string[];
    highlights_strengthened: string[];
    estimated_match_improvement: string;
  };
}

// 系统提示词
const SYSTEM_PROMPT = `你是一个资深的简历优化专家，擅长根据目标岗位优化简历内容，提升匹配度。

## 任务
根据目标岗位的JD分析结果和匹配评估，优化简历的各个部分，使其更符合岗位要求。

## 优化原则

### 1. 关键词注入
- 从JD中提取关键技术词汇、能力词汇
- 自然地融入简历描述中
- 避免堆砌，保持语句通顺

### 2. 差距弥补
- 针对匹配分析中的gaps，调整表述
- 用相关经验来弥补不足
- 不编造经历，只优化表述方式

### 3. 亮点强化
- 突出与岗位匹配的优势
- 添加量化数据（如提升30%、服务100万用户）
- 使用STAR法则优化项目描述

### 4. 表述优化
- 使用主动动词开头（主导、推动、优化、搭建）
- 结构清晰：做了什么 + 怎么做的 + 取得什么成果
- 避免模糊表述（如"参与"改为"负责"）

## 输出 JSON Schema
{
  "optimization_summary": "整体优化思路，100字以内",
  "sections": {
    "summary": {
      "original": "原始求职意向/个人摘要",
      "optimized": "优化后的版本",
      "changes": ["修改说明1", "修改说明2"],
      "matched_requirements": ["对应的JD要求1", "对应的JD要求2"]
    },
    "work_experience": [
      {
        "company": "公司名",
        "position": "职位",
        "original": "原始工作描述",
        "optimized": "优化后的描述",
        "changes": ["修改说明"],
        "matched_requirements": ["对应的JD要求"],
        "keywords_added": ["注入的关键词"]
      }
    ],
    "projects": [
      {
        "name": "项目名",
        "original": "原始项目描述",
        "optimized": "优化后的描述",
        "changes": ["修改说明"],
        "matched_requirements": ["对应的JD要求"],
        "keywords_added": ["注入的关键词"]
      }
    ],
    "skills": {
      "original": ["原技能1", "原技能2"],
      "optimized": ["优化后技能1", "优化后技能2"],
      "added": ["新增技能"],
      "emphasized": ["强调的技能"],
      "changes": ["技能部分的修改说明"]
    }
  },
  "optimization_effect": {
    "keywords_coverage": "关键词覆盖率变化，如'从60%提升至85%'",
    "gaps_addressed": ["弥补的差距1", "弥补的差距2"],
    "highlights_strengthened": ["强化的亮点1", "强化的亮点2"],
    "estimated_match_improvement": "预估匹配度提升，如'+10-15分'"
  }
}

## 注意事项
1. 保持真实性，不编造经历
2. 优化后的内容要比原始内容更有说服力
3. 每个修改都要有明确的理由
4. 关注JD中的"硬性要求"优先优化
5. 如果用户提供了修改建议，优先考虑用户建议
6. 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行简历优化
 */
export async function executeResumeOptimize(
  input: ResumeOptimizeInput
): Promise<AgentResult<ResumeOptimizeOutput>> {
  const startTime = Date.now();

  try {
    console.log('[简历优化] 开始优化简历');

    // 构建用户消息
    const userMessage = `请优化以下简历，使其更匹配目标岗位：

## 目标岗位
- 岗位：${input.job.title}
- 公司：${input.job.company}

### 岗位要求
${input.job.structured_jd.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### 加分项
${input.job.structured_jd.preferred.length > 0 ? input.job.structured_jd.preferred.map((p, i) => `${i + 1}. ${p}`).join('\n') : '无'}

### A维度分析
- 技术栈：${input.job.a_analysis.A1_tech_stack.keywords.join('、')}
- 产品类型：${input.job.a_analysis.A2_product_type.type}
- 业务领域：${input.job.a_analysis.A3_business_domain.primary}

### B维度分析
- 行业要求：${input.job.b_analysis.B1_industry_requirement.specific_industry}
- 技术要求：${input.job.b_analysis.B2_tech_requirement.education}，${Object.entries(input.job.b_analysis.B2_tech_requirement.tech_depth).map(([level, techs]) => `${level}: ${(techs as string[]).join('、')}`).join('；')}
- 产品经验：${input.job.b_analysis.B3_product_experience.product_types.join('、')}
- 核心能力：${input.job.b_analysis.B4_capability_requirement.capabilities.map(c => c.name).join('、')}

---

## 匹配分析结果
- 匹配度：${input.match.match_level} (${input.match.match_score}分)
- 优势：${input.match.strengths.join('、') || '无'}
- 差距：${input.match.gaps.join('、') || '无'}

---

## 原始简历

### 基本信息
- 姓名：${input.resume.basic_info.name}
- 目标岗位：${input.resume.basic_info.target_position || '未指定'}

### 工作经历
${input.resume.work_experience.map(w => `**${w.company} | ${w.position} | ${w.duration}**
${w.description}`).join('\n\n') || '无工作经历'}

### 项目经历
${input.resume.projects.map(p => `**${p.name}** | ${p.role} | ${p.duration}
描述：${p.description}
成果：${p.achievements.join('、') || '无'}
技术：${p.tech_stack.join('、') || '无'}`).join('\n\n') || '无项目经历'}

### 技能
${input.resume.skills.join('、') || '无'}

### 能力标签
- 行业：${input.resume.ability_tags.industry.join('、') || '无'}
- 技术：${input.resume.ability_tags.technology.join('、') || '无'}
- 产品：${input.resume.ability_tags.product.join('、') || '无'}
- 能力：${input.resume.ability_tags.capability.join('、') || '无'}

${input.user_suggestions ? `---

## 用户修改建议
${input.user_suggestions}

请根据以上用户建议，重点调整相关内容。` : ''}`;

    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { model: MODELS.HIGH, jsonMode: true }
    );

    // 解析JSON响应
    const optimization = parseJsonResponse<ResumeOptimizeOutput>(response);

    // 数据验证和默认值
    const result: ResumeOptimizeOutput = {
      optimization_summary: optimization.optimization_summary || '根据目标岗位优化简历内容',
      sections: {
        summary: optimization.sections?.summary ? {
          original: optimization.sections.summary.original || '',
          optimized: optimization.sections.summary.optimized || '',
          changes: Array.isArray(optimization.sections.summary.changes) 
            ? optimization.sections.summary.changes : [],
          matched_requirements: Array.isArray(optimization.sections.summary.matched_requirements)
            ? optimization.sections.summary.matched_requirements : [],
        } : undefined,
        work_experience: Array.isArray(optimization.sections?.work_experience)
          ? optimization.sections.work_experience.map(w => ({
              company: w.company || '',
              position: w.position || '',
              original: w.original || '',
              optimized: w.optimized || '',
              changes: Array.isArray(w.changes) ? w.changes : [],
              matched_requirements: Array.isArray(w.matched_requirements) ? w.matched_requirements : [],
              keywords_added: Array.isArray(w.keywords_added) ? w.keywords_added : [],
            }))
          : [],
        projects: Array.isArray(optimization.sections?.projects)
          ? optimization.sections.projects.map(p => ({
              name: p.name || '',
              original: p.original || '',
              optimized: p.optimized || '',
              changes: Array.isArray(p.changes) ? p.changes : [],
              matched_requirements: Array.isArray(p.matched_requirements) ? p.matched_requirements : [],
              keywords_added: Array.isArray(p.keywords_added) ? p.keywords_added : [],
            }))
          : [],
        skills: optimization.sections?.skills ? {
          original: Array.isArray(optimization.sections.skills.original) 
            ? optimization.sections.skills.original : [],
          optimized: Array.isArray(optimization.sections.skills.optimized)
            ? optimization.sections.skills.optimized : [],
          added: Array.isArray(optimization.sections.skills.added)
            ? optimization.sections.skills.added : [],
          emphasized: Array.isArray(optimization.sections.skills.emphasized)
            ? optimization.sections.skills.emphasized : [],
          changes: Array.isArray(optimization.sections.skills.changes)
            ? optimization.sections.skills.changes : [],
        } : undefined,
      },
      optimization_effect: {
        keywords_coverage: optimization.optimization_effect?.keywords_coverage || '',
        gaps_addressed: Array.isArray(optimization.optimization_effect?.gaps_addressed)
          ? optimization.optimization_effect.gaps_addressed : [],
        highlights_strengthened: Array.isArray(optimization.optimization_effect?.highlights_strengthened)
          ? optimization.optimization_effect.highlights_strengthened : [],
        estimated_match_improvement: optimization.optimization_effect?.estimated_match_improvement || '',
      },
    };

    console.log('[简历优化] 优化完成');

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[简历优化] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
