/**
 * 匹配评估 Agent
 * 基于简历和JD分析结果，进行多维度匹配评估
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { MATCH_EVALUATE_PROMPT } from '../core/prompt-templates';
import { experimentManager } from '../core/experiment';
import type { AgentResult, Resume, AAnalysis, BAnalysis, Match, MatchLevel, DimensionMatch } from '../types';
import type { AgentResultWithMetrics } from './base';

/** 匹配评估输入 */
export interface MatchEvaluateInput {
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
}

/** 匹配评估输出 */
export interface MatchEvaluateOutput {
  match_level: MatchLevel;
  match_score: number;
  dimension_match: {
    A3_business_domain?: DimensionMatch;
    B1_industry?: DimensionMatch;
    B2_tech?: DimensionMatch;
    B3_product?: DimensionMatch;
    B4_capability?: DimensionMatch;
  };
  strengths: string[];
  gaps: string[];
  interview_focus_suggestion: string;
}

// 系统提示词
const SYSTEM_PROMPT = `你是一个资深的招聘匹配分析专家，擅长评估候选人与岗位的匹配度。

## 任务
基于提供的简历信息和岗位分析结果，进行多维度匹配评估。

## 匹配度等级规则（严格遵循）
| 等级 | 条件 |
|------|------|
| 非常匹配 | A3业务领域一致 + B1-B4全部满足(4项) |
| 比较匹配 | A3一致 + B1-B4满足3项 |
| 匹配度还可以 | A3相关 + B1-B4满足2项 |
| 不是很匹配 | A3不相关 或 B1-B4仅满足1项 |
| 不匹配 | B1-B4均不满足 |

## 维度匹配判断标准

### A3 业务领域
- ✅ 匹配：简历行业经验与岗位业务领域一致
- ⚠️ 部分：有相关行业经验但不完全一致
- ❌ 不匹配：没有相关行业经验

### B1 行业背景
- ✅ 匹配：满足行业经验年限要求
- ⚠️ 部分：有经验但年限不足，或行业相关但不完全对口
- ❌ 不匹配：完全没有相关行业经验（如果是硬性要求）

### B2 技术背景
- ✅ 匹配：学历达标 + 技术能力基本符合
- ⚠️ 部分：学历或技术能力有一项不足
- ❌ 不匹配：学历和技术能力都不符合

### B3 产品经验
- ✅ 匹配：产品类型经验匹配 + 全周期/0-1经验符合要求
- ⚠️ 部分：产品类型相关但细分领域不同，或缺少全周期/0-1经验
- ❌ 不匹配：产品类型完全不同

### B4 产品能力
- ✅ 匹配：核心能力要求全部具备
- ⚠️ 部分：具备大部分能力，有1-2项欠缺
- ❌ 不匹配：核心能力缺失较多

## 输出JSON Schema
{
  "match_level": "非常匹配/比较匹配/匹配度还可以/不是很匹配/不匹配",
  "match_score": 0-100的数字,
  "dimension_match": {
    "A3_business_domain": {
      "status": "✅/⚠️/❌",
      "jd_requirement": "JD要求的业务领域",
      "resume_match": "简历中的相关经验",
      "gap_analysis": "差距分析或匹配说明"
    },
    "B1_industry": {
      "status": "✅/⚠️/❌",
      "jd_requirement": "JD的行业要求",
      "resume_match": "简历中的行业经验",
      "gap_analysis": "差距分析"
    },
    "B2_tech": {
      "status": "✅/⚠️/❌",
      "jd_requirement": "JD的技术要求",
      "resume_match": "简历中的技术能力",
      "gap_analysis": "差距分析"
    },
    "B3_product": {
      "status": "✅/⚠️/❌",
      "jd_requirement": "JD的产品经验要求",
      "resume_match": "简历中的产品经验",
      "gap_analysis": "差距分析"
    },
    "B4_capability": {
      "status": "✅/⚠️/❌",
      "jd_requirement": "JD的能力要求",
      "resume_match": "简历中展现的能力",
      "gap_analysis": "差距分析"
    }
  },
  "strengths": ["优势1", "优势2", "优势3"],
  "gaps": ["差距1", "差距2"],
  "interview_focus_suggestion": "面试重点建议，100字以内"
}

## 分析原则
1. **客观评估**：基于简历内容进行判断，不要过度推断
2. **实用导向**：分析结果要对求职者有实际指导意义
3. **差距明确**：明确指出差距所在，便于针对性准备
4. **建议具体**：面试建议要具体可执行

## 注意事项
- match_score 要与 match_level 一致（非常匹配85-100，比较匹配70-84，还可以55-69，不太匹配40-54，不匹配0-39）
- strengths 至少列出2-3条真实的优势
- gaps 如实列出需要弥补的差距，没有明显差距可以为空数组
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行匹配评估
 */
export async function executeMatchEvaluate(
  input: MatchEvaluateInput
): Promise<AgentResultWithMetrics<MatchEvaluateOutput>> {
  const startTime = Date.now();
  const agentName = 'match-evaluate';
  
  // 检查实验配置
  const experimentResult = experimentManager.getModelForAgent(agentName);
  const model = experimentResult?.model || MODELS.HIGH;
  
  let inputMessage = '';
  let outputContent = '';

  try {
    console.log(`[匹配评估] 开始评估简历与岗位的匹配度，模型: ${model}`);

    // 构建用户消息
    const userMessage = `请评估以下简历与岗位的匹配度：

## 岗位信息
- 岗位名称：${input.job.title}
- 公司：${input.job.company}

### A维度分析结果
- A3 业务领域：${input.job.a_analysis.A3_business_domain.primary}（次要：${input.job.a_analysis.A3_business_domain.secondary.join('、') || '无'}）

### B维度分析结果
- B1 行业要求：${input.job.b_analysis.B1_industry_requirement.required ? '必需' : '优先'} ${input.job.b_analysis.B1_industry_requirement.specific_industry}，${input.job.b_analysis.B1_industry_requirement.years}
- B2 技术要求：${input.job.b_analysis.B2_tech_requirement.education}，熟悉${input.job.b_analysis.B2_tech_requirement.tech_depth['熟悉']?.join('、') || '无'}
- B3 产品经验：${input.job.b_analysis.B3_product_experience.product_types.join('、')}，全周期${input.job.b_analysis.B3_product_experience.need_full_cycle ? '需要' : '不需要'}，0-1${input.job.b_analysis.B3_product_experience.need_0to1 ? '需要' : '不需要'}
- B4 产品能力：${input.job.b_analysis.B4_capability_requirement.capabilities.map(c => c.name).join('、')}

### 岗位要求
${input.job.structured_jd.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### 加分项
${input.job.structured_jd.preferred.length > 0 ? input.job.structured_jd.preferred.map((p, i) => `${i + 1}. ${p}`).join('\n') : '无'}

---

## 简历信息
- 姓名：${input.resume.basic_info.name}
- 目标岗位：${input.resume.basic_info.target_position || '未指定'}

### 教育背景
${input.resume.education.map(e => `- ${e.school} | ${e.major} | ${e.degree} | ${e.duration}`).join('\n') || '无'}

### 工作经历
${input.resume.work_experience.map(w => `- ${w.company} | ${w.position} | ${w.duration}\n  ${w.description}`).join('\n\n') || '无'}

### 项目经历
${input.resume.projects.map(p => `- ${p.name} | ${p.role} | ${p.duration}\n  ${p.description}\n  成果：${p.achievements.join('、') || '无'}\n  技术：${p.tech_stack.join('、') || '无'}`).join('\n\n') || '无'}

### 技能
${input.resume.skills.join('、') || '无'}

### 能力标签
- 行业：${input.resume.ability_tags.industry.join('、') || '无'}
- 技术：${input.resume.ability_tags.technology.join('、') || '无'}
- 产品：${input.resume.ability_tags.product.join('、') || '无'}
- 能力：${input.resume.ability_tags.capability.join('、') || '无'}`;

    inputMessage = SYSTEM_PROMPT + '\n' + userMessage;

    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { model, jsonMode: true }
    );
    
    outputContent = response;

    // 解析JSON响应
    const evaluation = parseJsonResponse<MatchEvaluateOutput>(response);

    // 数据验证和默认值
    const result: MatchEvaluateOutput = {
      match_level: evaluation.match_level || '匹配度还可以',
      match_score: typeof evaluation.match_score === 'number' ? evaluation.match_score : 50,
      dimension_match: {
        A3_business_domain: evaluation.dimension_match?.A3_business_domain || {
          status: '⚠️',
          jd_requirement: '',
          resume_match: '',
          gap_analysis: '',
        },
        B1_industry: evaluation.dimension_match?.B1_industry || {
          status: '⚠️',
          jd_requirement: '',
          resume_match: '',
          gap_analysis: '',
        },
        B2_tech: evaluation.dimension_match?.B2_tech || {
          status: '⚠️',
          jd_requirement: '',
          resume_match: '',
          gap_analysis: '',
        },
        B3_product: evaluation.dimension_match?.B3_product || {
          status: '⚠️',
          jd_requirement: '',
          resume_match: '',
          gap_analysis: '',
        },
        B4_capability: evaluation.dimension_match?.B4_capability || {
          status: '⚠️',
          jd_requirement: '',
          resume_match: '',
          gap_analysis: '',
        },
      },
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
      gaps: Array.isArray(evaluation.gaps) ? evaluation.gaps : [],
      interview_focus_suggestion: evaluation.interview_focus_suggestion || '',
    };

    const duration_ms = Date.now() - startTime;
    console.log('[匹配评估] 评估完成:', result.match_level, result.match_score, `耗时: ${duration_ms}ms`);

    // 生成评测数据
    const inputTokens = Math.ceil(inputMessage.length / 4);
    const outputTokens = Math.ceil(outputContent.length / 4);
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4.1': { input: 2.00, output: 8.00 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'qwen-max': { input: 20, output: 60 },
      'deepseek-v3': { input: 0.27, output: 1.10 },
    };
    const price = pricing[model] || { input: 2.0, output: 8.0 };
    const cost = (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;

    return {
      success: true,
      data: result,
      duration_ms,
      metrics: {
        agent_name: agentName,
        model,
        input_chars: inputMessage.length,
        output_chars: outputContent.length,
        input_tokens_est: inputTokens,
        output_tokens_est: outputTokens,
        duration_ms,
        cost_usd_est: cost,
        success: true,
        timestamp: new Date().toISOString(),
        experiment: experimentResult ? {
          id: experimentResult.experimentId,
          group: experimentResult.group,
        } : undefined,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    const duration_ms = Date.now() - startTime;
    console.error('[匹配评估] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms,
      metrics: {
        agent_name: agentName,
        model,
        input_chars: inputMessage.length,
        output_chars: 0,
        input_tokens_est: Math.ceil(inputMessage.length / 4),
        output_tokens_est: 0,
        duration_ms,
        cost_usd_est: 0,
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
