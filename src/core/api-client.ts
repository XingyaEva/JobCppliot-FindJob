/**
 * Vectorengine API 客户端
 */

// API 配置
const API_CONFIG = {
  baseUrl: 'https://api.vectorengine.ai',
  apiKey: 'sk-3LLX8OkNZqTFKwCqxEXnMjMfgJmNEopXTn5tWP99f8l6t533',
  defaultModel: 'gpt-4o',
  timeout: 120000, // 2分钟超时
};

// 模型配置
export const MODELS = {
  // 图片理解
  VISION: 'gpt-4o',
  // 快速文本处理 (使用qwen-turbo替代qwen-mt-turbo)
  FAST: 'qwen-turbo',
  // 中等复杂度
  MEDIUM: 'qwen-max',
  // 高质量生成
  HIGH: 'gpt-4.1',
  // DeepSeek (高性价比)
  DEEPSEEK: 'deepseek-v3',
} as const;

// 模型别名（用于Agent选择）
export const AGENT_MODELS = {
  'jd-preprocess-image': MODELS.VISION,
  'jd-preprocess-text': MODELS.FAST,
  'jd-structure': MODELS.MEDIUM,
  'jd-analysis-a': MODELS.MEDIUM,
  'jd-analysis-b': MODELS.HIGH,
  'resume-parse': MODELS.MEDIUM,
  'match-evaluate': MODELS.HIGH,
  'company-analyze': MODELS.HIGH,
  'resume-optimize': MODELS.HIGH,
  'interview-prep': MODELS.HIGH,
  'router': MODELS.FAST,
} as const;

/** 聊天消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

/** API响应 */
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
 * 调用 Vectorengine Chat API
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
  const {
    model = API_CONFIG.defaultModel,
    temperature = 0.7,
    max_tokens = 4096,
    response_format,
  } = options;

  const requestBody: any = {
    model,
    messages,
    temperature,
    max_tokens,
  };

  if (response_format) {
    requestBody.response_format = response_format;
  }

  const response = await fetch(`${API_CONFIG.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API调用失败: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * 简化的文本对话
 */
export async function chat(
  systemPrompt: string,
  userMessage: string,
  options: {
    model?: string;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  const { model, jsonMode = false } = options;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  const response = await chatCompletion(messages, {
    model,
    response_format: jsonMode ? { type: 'json_object' } : undefined,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * 图片理解对话
 */
export async function chatWithImage(
  systemPrompt: string,
  userText: string,
  imageUrl: string,
  options: {
    model?: string;
    jsonMode?: boolean;
  } = {}
): Promise<string> {
  const { model = MODELS.VISION, jsonMode = false } = options;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: [
        { type: 'text', text: userText },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
  ];

  const response = await chatCompletion(messages, {
    model,
    response_format: jsonMode ? { type: 'json_object' } : undefined,
  });

  return response.choices[0]?.message?.content || '';
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
 * 带重试的API调用
 */
export async function chatWithRetry(
  systemPrompt: string,
  userMessage: string,
  options: {
    model?: string;
    jsonMode?: boolean;
    maxRetries?: number;
  } = {}
): Promise<string> {
  const { maxRetries = 3, ...chatOptions } = options;
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chat(systemPrompt, userMessage, chatOptions);
    } catch (error) {
      lastError = error as Error;
      console.warn(`API调用失败 (尝试 ${i + 1}/${maxRetries}):`, error);
      
      // 等待后重试
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError || new Error('API调用失败');
}

// 导出配置（用于调试）
export { API_CONFIG };
