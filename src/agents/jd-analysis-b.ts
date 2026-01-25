/**
 * B 维度分析 Agent
 * 深度拆解隐性需求：行业背景、技术背景、产品经验、产品能力
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { B_ANALYSIS_PROMPT } from '../core/prompt-templates';
import type { AgentResult, StructuredJD, AAnalysis, BAnalysis } from '../types';

/** B维度分析输入 */
export interface BAnalysisInput {
  structuredJD: StructuredJD;
  aAnalysis: AAnalysis;
  rawText: string;
}

// 使用优化后的 Prompt
const SYSTEM_PROMPT = B_ANALYSIS_PROMPT;

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

    // 使用 jd-analysis-b Agent 配置
    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { agentId: 'jd-analysis-b', jsonMode: true }
    );

    // 解析JSON响应
    const analysis = parseJsonResponse<BAnalysis>(response);

    /**
     * 数据格式标准化函数
     * 将字符串转换为数组（兼容LLM返回的不同格式）
     */
    function toStringArray(val: unknown): string[] {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(item => typeof item === 'string');
      if (typeof val === 'string') {
        // 处理逗号分隔的字符串，如 "AI, SaaS" -> ["AI", "SaaS"]
        return val.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
      }
      return [];
    }

    /**
     * 标准化能力列表
     * 将纯字符串数组转换为对象数组
     */
    function normalizeCapabilities(caps: unknown): Array<{name: string; detail: string}> {
      if (!caps) return [];
      if (!Array.isArray(caps)) return [];
      
      return caps.map(cap => {
        // 如果已经是对象格式，保持不变
        if (typeof cap === 'object' && cap !== null && 'name' in cap) {
          return {
            name: String(cap.name || ''),
            detail: String((cap as any).detail || '')
          };
        }
        // 如果是纯字符串，转换为对象格式
        if (typeof cap === 'string') {
          return {
            name: cap,
            detail: ''
          };
        }
        return { name: '', detail: '' };
      }).filter(cap => cap.name); // 过滤掉空名称的能力
    }

    // 数据验证和默认值（含格式标准化）
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
          '了解': toStringArray(analysis.B2_tech_requirement?.tech_depth?.['了解']),
          '熟悉': toStringArray(analysis.B2_tech_requirement?.tech_depth?.['熟悉']),
          '精通': toStringArray(analysis.B2_tech_requirement?.tech_depth?.['精通']),
        },
        summary: analysis.B2_tech_requirement?.summary || 'JD未明确提及技术要求',
      },
      B3_product_experience: {
        product_types: toStringArray(analysis.B3_product_experience?.product_types),
        need_full_cycle: analysis.B3_product_experience?.need_full_cycle ?? false,
        need_0to1: analysis.B3_product_experience?.need_0to1 ?? false,
        summary: analysis.B3_product_experience?.summary || 'JD未明确提及产品经验要求',
      },
      B4_capability_requirement: {
        capabilities: normalizeCapabilities(analysis.B4_capability_requirement?.capabilities),
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
