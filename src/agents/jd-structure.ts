/**
 * JD 结构化 Agent
 * 将清洗后的JD文本提取为结构化数据
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { JD_STRUCTURE_PROMPT } from '../core/prompt-templates';
import type { AgentResult, StructuredJD } from '../types';

/** 结构化输入 */
export interface JDStructureInput {
  cleanedText: string;
}

// 使用优化后的 Prompt
const SYSTEM_PROMPT = JD_STRUCTURE_PROMPT;

/**
 * 执行JD结构化
 */
export async function executeJDStructure(
  input: JDStructureInput
): Promise<AgentResult<StructuredJD>> {
  const startTime = Date.now();

  try {
    console.log('[JD结构化] 开始提取结构化信息');

    // 使用 jd-structure Agent 配置
    const response = await chat(
      SYSTEM_PROMPT,
      `请将以下JD文本提取为结构化JSON：\n\n${input.cleanedText}`,
      { agentId: 'jd-structure', jsonMode: true }
    );

    // 解析JSON响应
    const structured = parseJsonResponse<StructuredJD>(response);

    // 数据验证和默认值
    const result: StructuredJD = {
      title: structured.title || '未知岗位',
      company: structured.company || '未知公司',
      location: structured.location || '未知',
      salary: structured.salary || '面议',
      responsibilities: Array.isArray(structured.responsibilities) ? structured.responsibilities : [],
      requirements: Array.isArray(structured.requirements) ? structured.requirements : [],
      preferred: Array.isArray(structured.preferred) ? structured.preferred : [],
      others: structured.others || '',
    };

    console.log('[JD结构化] 提取完成:', result.title, '@', result.company);

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[JD结构化] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
