/**
 * A 维度分析 Agent
 * 分析岗位定位：技术栈、产品类型、业务领域、团队阶段
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { A_ANALYSIS_PROMPT } from '../core/prompt-templates';
import type { AgentResult, StructuredJD, AAnalysis } from '../types';

/** A维度分析输入 */
export interface AAnalysisInput {
  structuredJD: StructuredJD;
  rawText: string;
}

// 使用优化后的 Prompt
const SYSTEM_PROMPT = A_ANALYSIS_PROMPT;

/**
 * 执行A维度分析
 */
export async function executeAAnalysis(
  input: AAnalysisInput
): Promise<AgentResult<AAnalysis>> {
  const startTime = Date.now();

  try {
    console.log('[A维度分析] 开始分析岗位定位');

    // 构建用户消息
    const userMessage = `请对以下岗位进行A维度分析：

## 岗位基本信息
- 岗位名称：${input.structuredJD.title}
- 公司：${input.structuredJD.company}
- 地点：${input.structuredJD.location}

## 岗位职责
${input.structuredJD.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 任职要求
${input.structuredJD.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 加分项
${input.structuredJD.preferred.length > 0 
  ? input.structuredJD.preferred.map((p, i) => `${i + 1}. ${p}`).join('\n')
  : '无'}

## 原始JD文本（供参考）
${input.rawText.substring(0, 2000)}`;

    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { model: MODELS.MEDIUM, jsonMode: true }
    );

    // 解析JSON响应
    const analysis = parseJsonResponse<AAnalysis>(response);

    // 数据验证和默认值
    const result: AAnalysis = {
      A1_tech_stack: {
        keywords: Array.isArray(analysis.A1_tech_stack?.keywords) 
          ? analysis.A1_tech_stack.keywords 
          : [],
        density: analysis.A1_tech_stack?.density || '中',
        summary: analysis.A1_tech_stack?.summary || '技术栈信息不足',
      },
      A2_product_type: {
        type: analysis.A2_product_type?.type || '未知',
        reason: analysis.A2_product_type?.reason || '信息不足',
      },
      A3_business_domain: {
        primary: analysis.A3_business_domain?.primary || '未知',
        secondary: Array.isArray(analysis.A3_business_domain?.secondary)
          ? analysis.A3_business_domain.secondary
          : [],
        summary: analysis.A3_business_domain?.summary || '业务领域信息不足',
      },
      A4_team_stage: {
        stage: analysis.A4_team_stage?.stage || '未知',
        evidence: analysis.A4_team_stage?.evidence || '信息不足',
        summary: analysis.A4_team_stage?.summary || '团队阶段信息不足',
      },
    };

    console.log('[A维度分析] 分析完成');

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[A维度分析] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
