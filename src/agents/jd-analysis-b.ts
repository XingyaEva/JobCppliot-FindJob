/**
 * B 维度分析 Agent
 * 深度拆解隐性需求：行业背景、技术背景、产品经验、产品能力
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import type { AgentResult, StructuredJD, AAnalysis, BAnalysis } from '../types';

/** B维度分析输入 */
export interface BAnalysisInput {
  structuredJD: StructuredJD;
  aAnalysis: AAnalysis;
  rawText: string;
}

// 系统提示词
const SYSTEM_PROMPT = `你是一个资深的招聘分析专家，擅长挖掘岗位描述中的隐性需求。

## 任务
对岗位描述进行B维度分析（隐性需求深度拆解），包含以下4个子维度：

### B1 - 行业背景要求
分析JD对候选人行业背景的要求。
- 判断行业经验是"硬性要求"还是"优先考虑"
- 提取具体的行业要求（如金融、电商、医疗等）
- 分析需要多少年的行业经验
- 给出总结建议

### B2 - 技术背景要求
分析JD对候选人技术能力的要求。
- 提取学历要求
- 区分技术深度要求：了解级、熟悉级、精通级
- 判断是要求"技术广度"还是"技术深度"
- 给出总结建议

### B3 - 产品经验要求
分析JD对候选人产品经验的要求。
- 提取需要的产品类型经验（ToB/ToC/平台/工具等）
- 判断是否需要全周期经验（需求→设计→开发→上线→迭代）
- 判断是否需要0-1经验（从零搭建产品）
- 给出总结建议

### B4 - 产品能力要求
深度拆解JD中对产品能力的具体要求。
- 提取每一条能力要求，并解释其真实含义
- 能力可能包括：需求分析、产品设计、数据分析、项目管理、沟通协调、商业思维等
- 对每条能力给出具体说明
- 给出总结建议

## 输出JSON Schema
{
  "B1_industry_requirement": {
    "required": true/false,
    "preferred": true/false,
    "years": "X年以上/不限",
    "specific_industry": "具体行业",
    "summary": "人话总结，说明行业背景的重要性，50字以内"
  },
  "B2_tech_requirement": {
    "education": "学历要求",
    "tech_depth": {
      "了解": ["技术1", "技术2"],
      "熟悉": ["技术3", "技术4"],
      "精通": ["技术5"]
    },
    "summary": "人话总结，说明技术要求特点，50字以内"
  },
  "B3_product_experience": {
    "product_types": ["产品类型1", "产品类型2"],
    "need_full_cycle": true/false,
    "need_0to1": true/false,
    "summary": "人话总结，说明产品经验要求，50字以内"
  },
  "B4_capability_requirement": {
    "capabilities": [
      {"name": "能力名称", "detail": "具体说明，这条能力要求什么"},
      ...
    ],
    "summary": "人话总结，说明核心能力要求，50字以内"
  }
}

## 分析原则
1. **挖掘隐性需求**：不只看字面意思，要理解背后的真实要求
2. **区分硬性/软性**：帮助求职者判断哪些是必须满足的
3. **实用导向**：总结要对求职者有实际指导意义
4. **基于原文**：所有分析都要有JD原文支撑

## 注意事项
- 如果某个维度信息不足，如实说明"JD未明确提及"
- summary字段用通俗易懂的语言
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行B维度分析
 */
export async function executeBAnalysis(
  input: BAnalysisInput
): Promise<AgentResult<BAnalysis>> {
  const startTime = Date.now();

  try {
    console.log('[B维度分析] 开始深度拆解隐性需求');

    // 构建用户消息
    const userMessage = `请对以下岗位进行B维度分析（隐性需求深度拆解）：

## 岗位基本信息
- 岗位名称：${input.structuredJD.title}
- 公司：${input.structuredJD.company}
- 产品类型：${input.aAnalysis.A2_product_type.type}
- 业务领域：${input.aAnalysis.A3_business_domain.primary}
- 团队阶段：${input.aAnalysis.A4_team_stage.stage}

## 岗位职责
${input.structuredJD.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 任职要求
${input.structuredJD.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 加分项
${input.structuredJD.preferred.length > 0 
  ? input.structuredJD.preferred.map((p, i) => `${i + 1}. ${p}`).join('\n')
  : '无'}

## A维度分析结果（供参考）
- 技术栈：${input.aAnalysis.A1_tech_stack.keywords.join(', ')}
- 技术密度：${input.aAnalysis.A1_tech_stack.density}

## 原始JD文本（供参考）
${input.rawText.substring(0, 2000)}`;

    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { model: MODELS.HIGH, jsonMode: true }
    );

    // 解析JSON响应
    const analysis = parseJsonResponse<BAnalysis>(response);

    // 数据验证和默认值
    const result: BAnalysis = {
      B1_industry_requirement: {
        required: analysis.B1_industry_requirement?.required ?? false,
        preferred: analysis.B1_industry_requirement?.preferred ?? false,
        years: analysis.B1_industry_requirement?.years || '不限',
        specific_industry: analysis.B1_industry_requirement?.specific_industry || '不限',
        summary: analysis.B1_industry_requirement?.summary || 'JD未明确提及行业要求',
      },
      B2_tech_requirement: {
        education: analysis.B2_tech_requirement?.education || '不限',
        tech_depth: {
          '了解': analysis.B2_tech_requirement?.tech_depth?.['了解'] || [],
          '熟悉': analysis.B2_tech_requirement?.tech_depth?.['熟悉'] || [],
          '精通': analysis.B2_tech_requirement?.tech_depth?.['精通'] || [],
        },
        summary: analysis.B2_tech_requirement?.summary || 'JD未明确提及技术要求',
      },
      B3_product_experience: {
        product_types: Array.isArray(analysis.B3_product_experience?.product_types)
          ? analysis.B3_product_experience.product_types
          : [],
        need_full_cycle: analysis.B3_product_experience?.need_full_cycle ?? false,
        need_0to1: analysis.B3_product_experience?.need_0to1 ?? false,
        summary: analysis.B3_product_experience?.summary || 'JD未明确提及产品经验要求',
      },
      B4_capability_requirement: {
        capabilities: Array.isArray(analysis.B4_capability_requirement?.capabilities)
          ? analysis.B4_capability_requirement.capabilities
          : [],
        summary: analysis.B4_capability_requirement?.summary || 'JD未明确提及能力要求',
      },
    };

    console.log('[B维度分析] 分析完成');

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[B维度分析] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
