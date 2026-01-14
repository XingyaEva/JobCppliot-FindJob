/**
 * LLM 模块类型定义
 * 
 * 支持多 API 通道（阿里云百炼、VectorEngine）
 * 每个 Agent 可独立配置模型和参数
 */

/** API 提供商 */
export type APIProvider = 'dashscope' | 'vectorengine';

/** API 配置 */
export interface APIConfig {
  baseUrl: string;
  apiKey: string;
}

/** 搜索策略（百炼联网搜索） */
export type SearchStrategy = 'turbo' | 'max' | 'agent';

/** Agent LLM 配置 */
export interface AgentLLMConfig {
  /** API 提供商 */
  provider: APIProvider;
  /** 模型名称 */
  model: string;
  /** 是否开启联网搜索（仅百炼支持） */
  enableSearch?: boolean;
  /** 搜索策略 */
  searchStrategy?: SearchStrategy;
  /** 温度参数 */
  temperature?: number;
  /** 最大输出 Token */
  maxTokens?: number;
  /** 是否强制 JSON 输出 */
  jsonMode?: boolean;
}

/** 聊天消息内容项 */
export interface MessageContentItem {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

/** 聊天消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | MessageContentItem[];
}

/** LLM 调用参数 */
export interface LLMCallParams {
  /** 消息列表 */
  messages: ChatMessage[];
  /** Agent ID（自动读取对应配置） */
  agentId?: string;
  /** 手动指定 API 提供商（优先级高于 agentId） */
  provider?: APIProvider;
  /** 手动指定模型（优先级高于 agentId） */
  model?: string;
  /** 是否开启联网搜索 */
  enableSearch?: boolean;
  /** 搜索策略 */
  searchStrategy?: SearchStrategy;
  /** 温度参数 */
  temperature?: number;
  /** 最大输出 Token */
  maxTokens?: number;
  /** 是否强制 JSON 输出 */
  jsonMode?: boolean;
}

/** Token 使用统计 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** LLM 响应 */
export interface LLMResponse {
  /** 响应内容 */
  content: string;
  /** Token 使用统计 */
  usage?: TokenUsage;
  /** 使用的 API 提供商 */
  provider: APIProvider;
  /** 使用的模型 */
  model: string;
  /** 是否使用了联网搜索 */
  usedSearch?: boolean;
}

/** 原始 API 响应 */
export interface RawAPIResponse {
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
