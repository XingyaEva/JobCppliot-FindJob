/**
 * API 客户端（兼容层）
 * 
 * 保持原有接口不变，底层使用新的 LLM 模块
 * 这样现有 Agent 代码无需修改即可使用双通道系统
 */

import { 
  callLLM, 
  callVisionLLM, 
  callLLMWithRetry,
  getAgentConfig,
  MODELS as LLM_MODELS,
} from './llm';
import type { ChatMessage as LLMChatMessage, APIProvider } from './llm/types';

// ==================== 兼容性导出 ====================

// 模型配置（兼容旧代码）
export const MODELS = {
  // 图片理解 - 使用百炼视觉模型
  VISION: LLM_MODELS.QWEN_VL_MAX,
  // 快速文本处理
  FAST: LLM_MODELS.QWEN_TURBO,
  // 中等复杂度
  MEDIUM: LLM_MODELS.QWEN_PLUS,
  // 高质量生成
  HIGH: LLM_MODELS.QWEN_MAX,
  // DeepSeek (高性价比)
  DEEPSEEK: 'deepseek-v3',
} as const;

// Agent 模型映射（兼容旧代码）
// 实际模型由 AGENT_CONFIGS 控制，这里只是保持接口一致
export const AGENT_MODELS = {
  'jd-preprocess-image': LLM_MODELS.QWEN_VL_MAX,
  'jd-preprocess-text': LLM_MODELS.QWEN_TURBO,
  'jd-structure': LLM_MODELS.QWEN_PLUS,
  'jd-analysis-a': LLM_MODELS.QWEN_MAX,
  'jd-analysis-b': LLM_MODELS.QWEN_MAX,
  'resume-parse': LLM_MODELS.QWEN_PLUS,
  'match-evaluate': LLM_MODELS.QWEN_MAX,
  'company-analyze': LLM_MODELS.QWEN_PLUS,
  'resume-optimize': LLM_MODELS.QWEN_PLUS,
  'interview-prep': LLM_MODELS.QWEN_PLUS,
  'router': LLM_MODELS.QWEN_TURBO,
} as const;

// API 配置（兼容旧代码调试）
export const API_CONFIG = {
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: '[已迁移到 LLM 模块]',
  defaultModel: LLM_MODELS.QWEN_PLUS,
  timeout: 120000,
};

/** 聊天消息（兼容旧类型） */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

/** API响应（兼容旧类型） */
export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 根据模型名称推断 Agent ID 和 Provider
 */
function inferProviderFromModel(model?: string): { provider?: APIProvider; agentId?: string } {
  if (!model) return {};
  
  // VectorEngine 特有模型
  if (model.startsWith('gpt-') || model.startsWith('deepseek-') || model.startsWith('gemini-')) {
    return { provider: 'vectorengine' };
  }
  
  // 百炼模型
  if (model.startsWith('qwen') || model.startsWith('qwq')) {
    return { provider: 'dashscope' };
  }
  
  return {};
}

/**
 * 调用 Chat API（兼容旧接口）
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' | 'text' };
  } = {}
): Promise<ChatResponse> {
  const { model, temperature, max_tokens, response_format } = options;
  const { provider } = inferProviderFromModel(model);

  // 转换消息格式
  const llmMessages: LLMChatMessage[] = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await callLLM({
    messages: llmMessages,
    provider,
    model,
    temperature,
    maxTokens: max_tokens,
    jsonMode: response_format?.type === 'json_object',
  });

  // 转换为旧格式响应
  return {
    id: `chat-${Date.now()}`,
    choices: [{
      message: {
        role: 'assistant',
        content: response.content,
      },
      finish_reason: 'stop',
    }],
    usage: response.usage ? {
      prompt_tokens: response.usage.promptTokens,
      completion_tokens: response.usage.completionTokens,
      total_tokens: response.usage.totalTokens,
    } : undefined,
  };
}

/**
 * 简化的文本对话（兼容旧接口）
 * 
 * 优先使用 Agent 配置，支持手动指定模型覆盖
 */
export async function chat(
  systemPrompt: string,
  userMessage: string,
  options: {
    model?: string;
    jsonMode?: boolean;
    agentId?: string;  // 新增：支持直接指定 Agent
  } = {}
): Promise<string> {
  const { model, jsonMode = false, agentId } = options;
  const { provider } = inferProviderFromModel(model);

  const messages: LLMChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const response = await callLLM({
    messages,
    agentId,
    provider,
    model,
    jsonMode,
  });

  return response.content;
}

/**
 * 图片理解对话（兼容旧接口）
 */
export async function chatWithImage(
  systemPrompt: string,
  userText: string,
  imageUrl: string,
  options: {
    model?: string;
    jsonMode?: boolean;
    agentId?: string;  // 新增：支持直接指定 Agent
  } = {}
): Promise<string> {
  const { model, jsonMode = false, agentId } = options;

  const response = await callVisionLLM({
    systemPrompt,
    userPrompt: userText,
    imageUrl,
    agentId: agentId || 'resume-parse-image',
    jsonMode,
  });

  return response.content;
}

/**
 * 解析JSON响应（带容错）
 */
export function parseJsonResponse<T>(content: string): T {
  // 尝试直接解析
  try {
    return JSON.parse(content);
  } catch (e) {
    // 尝试提取JSON块
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    // 尝试提取 { } 内容
    const braceMatch = content.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      return JSON.parse(braceMatch[0]);
    }
    
    throw new Error('无法解析JSON响应');
  }
}

/**
 * 带重试的API调用（兼容旧接口）
 */
export async function chatWithRetry(
  systemPrompt: string,
  userMessage: string,
  options: {
    model?: string;
    jsonMode?: boolean;
    maxRetries?: number;
    agentId?: string;  // 新增：支持直接指定 Agent
  } = {}
): Promise<string> {
  const { maxRetries = 3, model, jsonMode, agentId } = options;
  const { provider } = inferProviderFromModel(model);

  const messages: LLMChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const response = await callLLMWithRetry({
    messages,
    agentId,
    provider,
    model,
    jsonMode,
  }, maxRetries);

  return response.content;
}

// ==================== 新增：便捷函数 ====================

/**
 * 按 Agent 配置调用（推荐使用）
 * 
 * @example
 * const result = await chatByAgent('jd-structure', systemPrompt, userMessage);
 */
export async function chatByAgent(
  agentId: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  return chat(systemPrompt, userMessage, { agentId });
}

/**
 * 带联网搜索的对话
 * 
 * @example
 * const result = await chatWithSearch('interview-prep', systemPrompt, userMessage);
 */
export async function chatWithSearch(
  agentId: string,
  systemPrompt: string,
  userMessage: string,
  searchStrategy: 'turbo' | 'max' | 'agent' = 'max'
): Promise<string> {
  const messages: LLMChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const response = await callLLM({
    messages,
    agentId,
    enableSearch: true,
    searchStrategy,
  });

  return response.content;
}
