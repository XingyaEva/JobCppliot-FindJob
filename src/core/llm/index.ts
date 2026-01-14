/**
 * LLM 模块统一导出
 * 
 * 使用示例：
 * 
 * ```typescript
 * import { chat, chatJSON, callLLM, getAgentConfig } from '@/core/llm';
 * 
 * // 方式1：简单文本对话（按 Agent 配置）
 * const result = await chat(systemPrompt, userPrompt, 'jd-structure');
 * 
 * // 方式2：JSON 结构化输出
 * const data = await chatJSON<MyType>(systemPrompt, userPrompt, 'jd-analysis-a');
 * 
 * // 方式3：完整控制
 * const response = await callLLM({
 *   messages: [...],
 *   agentId: 'interview-prep',
 *   enableSearch: true,
 * });
 * ```
 */

// 导出类型
export * from './types';

// 导出配置
export { 
  API_CONFIGS, 
  AGENT_CONFIGS, 
  DEFAULT_CONFIG,
  MODELS,
  getAgentConfig,
  getAPIConfig,
} from './config';

// 导出客户端函数
export { 
  callLLM, 
  callVisionLLM,
  callLLMWithRetry,
} from './client';

// ==================== 便捷函数 ====================

import { callLLM, callVisionLLM, callLLMWithRetry } from './client';
import { ChatMessage, LLMResponse } from './types';

/**
 * 简单文本对话
 * 
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户输入
 * @param agentId 可选，Agent ID，用于自动选择模型配置
 * @returns 模型响应文本
 * 
 * @example
 * const result = await chat('你是一个分析助手', '分析这段文本', 'jd-structure');
 */
export async function chat(
  systemPrompt: string,
  userPrompt: string,
  agentId?: string
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  const response = await callLLM({ messages, agentId });
  return response.content;
}

/**
 * JSON 结构化输出对话
 * 
 * @param systemPrompt 系统提示词（应包含 JSON 格式说明）
 * @param userPrompt 用户输入
 * @param agentId 可选，Agent ID
 * @returns 解析后的 JSON 对象
 * 
 * @example
 * interface JDData { title: string; company: string; }
 * const data = await chatJSON<JDData>(systemPrompt, jdText, 'jd-structure');
 */
export async function chatJSON<T = any>(
  systemPrompt: string,
  userPrompt: string,
  agentId?: string
): Promise<T> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  const response = await callLLM({ messages, agentId, jsonMode: true });
  
  try {
    return JSON.parse(response.content) as T;
  } catch (error) {
    // 尝试从响应中提取 JSON
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        // 继续抛出错误
      }
    }
    console.error('[LLM] JSON 解析失败，原始内容:', response.content.substring(0, 500));
    throw new Error(`JSON 解析失败: ${(error as Error).message}`);
  }
}

/**
 * 带图像的对话（用于简历截图解析等）
 * 
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户输入
 * @param imageUrl 图片 URL 或 base64
 * @param agentId 可选，Agent ID（默认使用视觉模型）
 * @returns 模型响应文本
 * 
 * @example
 * const result = await chatWithImage(
 *   '解析这份简历截图',
 *   '提取所有信息',
 *   'data:image/png;base64,...',
 *   'resume-parse-image'
 * );
 */
export async function chatWithImage(
  systemPrompt: string,
  userPrompt: string,
  imageUrl: string,
  agentId?: string
): Promise<string> {
  const response = await callVisionLLM({
    systemPrompt,
    userPrompt,
    imageUrl,
    agentId: agentId || 'resume-parse-image',
  });
  return response.content;
}

/**
 * 带图像的 JSON 输出对话
 * 
 * @example
 * const data = await chatWithImageJSON<ResumeData>(
 *   systemPrompt,
 *   '解析简历信息',
 *   imageUrl,
 *   'resume-parse-image'
 * );
 */
export async function chatWithImageJSON<T = any>(
  systemPrompt: string,
  userPrompt: string,
  imageUrl: string,
  agentId?: string
): Promise<T> {
  const response = await callVisionLLM({
    systemPrompt,
    userPrompt,
    imageUrl,
    agentId: agentId || 'resume-parse-image',
    jsonMode: true,
  });
  
  try {
    return JSON.parse(response.content) as T;
  } catch (error) {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch {
        // 继续抛出错误
      }
    }
    console.error('[LLM] JSON 解析失败，原始内容:', response.content.substring(0, 500));
    throw new Error(`JSON 解析失败: ${(error as Error).message}`);
  }
}

/**
 * 带联网搜索的对话（用于面试准备、简历优化等）
 * 
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户输入
 * @param agentId Agent ID
 * @param searchStrategy 搜索策略：'turbo'(快速), 'max'(全面), 'agent'(智能)
 * @returns 模型响应文本
 * 
 * @example
 * const result = await chatWithSearch(
 *   '你是一个面试准备助手',
 *   '帮我准备阿里巴巴的产品经理面试',
 *   'interview-prep',
 *   'max'
 * );
 */
export async function chatWithSearch(
  systemPrompt: string,
  userPrompt: string,
  agentId: string,
  searchStrategy: 'turbo' | 'max' | 'agent' = 'max'
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  const response = await callLLM({
    messages,
    agentId,
    enableSearch: true,
    searchStrategy,
  });
  
  return response.content;
}

/**
 * 获取完整 LLM 响应（包含 usage 等元数据）
 * 
 * @example
 * const response = await chatFull(systemPrompt, userPrompt, 'jd-structure');
 * console.log(`使用了 ${response.usage?.totalTokens} tokens`);
 */
export async function chatFull(
  systemPrompt: string,
  userPrompt: string,
  agentId?: string
): Promise<LLMResponse> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  return callLLM({ messages, agentId });
}

/**
 * 带重试的简单对话
 * 
 * @example
 * const result = await chatWithRetry(systemPrompt, userPrompt, 'jd-structure', 3);
 */
export async function chatWithRetry(
  systemPrompt: string,
  userPrompt: string,
  agentId?: string,
  maxRetries: number = 3
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  
  const response = await callLLMWithRetry({ messages, agentId }, maxRetries);
  return response.content;
}
