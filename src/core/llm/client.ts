/**
 * LLM 统一调用客户端
 * 
 * 支持多 API 通道，按 Agent 自动选择配置
 */

import { 
  APIProvider, 
  AgentLLMConfig, 
  ChatMessage, 
  LLMCallParams, 
  LLMResponse,
  RawAPIResponse,
} from './types';
import { API_CONFIGS, DEFAULT_CONFIG, getAgentConfig } from './config';

/**
 * 统一 LLM 调用函数
 * 
 * 使用方式：
 * 1. 按 Agent 调用（推荐）：callLLM({ messages, agentId: 'jd-structure' })
 * 2. 手动指定：callLLM({ messages, provider: 'dashscope', model: 'qwen-max' })
 * 3. 使用默认配置：callLLM({ messages })
 */
export async function callLLM(params: LLMCallParams): Promise<LLMResponse> {
  // 确定配置：手动指定 > Agent 配置 > 默认配置
  let config: AgentLLMConfig;
  
  if (params.provider && params.model) {
    // 手动指定配置
    config = {
      provider: params.provider,
      model: params.model,
      enableSearch: params.enableSearch,
      searchStrategy: params.searchStrategy,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
      jsonMode: params.jsonMode,
    };
  } else if (params.agentId) {
    // 使用 Agent 配置
    config = getAgentConfig(params.agentId);
    
    // 允许部分覆盖
    if (params.enableSearch !== undefined) config.enableSearch = params.enableSearch;
    if (params.searchStrategy !== undefined) config.searchStrategy = params.searchStrategy;
    if (params.temperature !== undefined) config.temperature = params.temperature;
    if (params.maxTokens !== undefined) config.maxTokens = params.maxTokens;
    if (params.jsonMode !== undefined) config.jsonMode = params.jsonMode;
  } else {
    // 使用默认配置
    config = { ...DEFAULT_CONFIG };
    if (params.enableSearch !== undefined) config.enableSearch = params.enableSearch;
    if (params.temperature !== undefined) config.temperature = params.temperature;
    if (params.maxTokens !== undefined) config.maxTokens = params.maxTokens;
    if (params.jsonMode !== undefined) config.jsonMode = params.jsonMode;
  }
  
  const apiConfig = API_CONFIGS[config.provider];
  
  const searchInfo = config.enableSearch ? ' [联网搜索]' : '';
  console.log(`[LLM] 调用 ${config.provider}/${config.model}${searchInfo}`);
  
  // 构建请求体
  const requestBody: any = {
    model: config.model,
    messages: params.messages,
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens ?? 4096,
  };
  
  // JSON 模式
  if (config.jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }
  
  // 联网搜索（百炼特有）
  if (config.provider === 'dashscope' && config.enableSearch) {
    requestBody.enable_search = true;
    if (config.searchStrategy) {
      requestBody.search_options = {
        search_strategy: config.searchStrategy,
      };
    }
  }
  
  try {
    const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 错误 (${response.status}): ${errorText}`);
    }
    
    const data: RawAPIResponse = await response.json();
    
    const content = data.choices[0]?.message?.content || '';
    
    console.log(`[LLM] 响应成功，内容长度: ${content.length}`);
    
    return {
      content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      provider: config.provider,
      model: config.model,
      usedSearch: config.enableSearch,
    };
  } catch (error) {
    console.error(`[LLM] 调用失败:`, error);
    throw error;
  }
}

/**
 * 带视觉能力的 LLM 调用
 */
export async function callVisionLLM(params: {
  systemPrompt: string;
  userPrompt: string;
  imageUrl: string;
  agentId?: string;
  jsonMode?: boolean;
}): Promise<LLMResponse> {
  const config = params.agentId 
    ? getAgentConfig(params.agentId)
    : { ...DEFAULT_CONFIG, model: 'qwen-vl-max' };
  
  const messages: ChatMessage[] = [
    { role: 'system', content: params.systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: params.userPrompt },
        { type: 'image_url', image_url: { url: params.imageUrl } },
      ],
    },
  ];
  
  return callLLM({
    messages,
    provider: config.provider,
    model: config.model,
    jsonMode: params.jsonMode ?? config.jsonMode,
  });
}

/**
 * 带重试的 LLM 调用
 */
export async function callLLMWithRetry(
  params: LLMCallParams,
  maxRetries: number = 3
): Promise<LLMResponse> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callLLM(params);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[LLM] 调用失败 (尝试 ${i + 1}/${maxRetries}):`, error);
      
      // 等待后重试（指数退避）
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError || new Error('LLM 调用失败');
}
