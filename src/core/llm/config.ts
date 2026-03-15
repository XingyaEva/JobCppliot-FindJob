/**
 * LLM 配置文件
 * 
 * 管理 API 通道配置和各 Agent 的模型配置
 * 修改此文件即可切换任意 Agent 的 API 和模型
 * 
 * [2026-02-23] dashscope 账户欠费，临时切换到 vectorengine
 * [2026-03-09] dashscope 恢复，全部切回阿里云百炼
 *   gpt-4.1 → qwen-max / qwen-plus
 *   gpt-4o  → qwen-vl-max
 *   deepseek-v3 → qwen-turbo
 *   联网搜索重新开启
 */

import { APIProvider, APIConfig, AgentLLMConfig } from './types';

/**
 * API 通道配置
 */
export const API_CONFIGS: Record<APIProvider, APIConfig> = {
  // 阿里云百炼（当前主用）
  dashscope: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: 'sk-ee50dbd52a5e4ac3af58c2c90b4200ed',
  },
  // VectorEngine（备用）
  vectorengine: {
    baseUrl: 'https://api.vectorengine.ai/v1',
    apiKey: 'sk-3LLX8OkNZqTFKwCqxEXnMjMfgJmNEopXTn5tWP99f8l6t533',
  },
};

/**
 * 模型常量（便于引用）
 */
export const MODELS = {
  // 阿里云百炼模型（当前主用）
  QWEN_MAX: 'qwen-max',           // 最强推理
  QWEN_PLUS: 'qwen-plus',         // 均衡型
  QWEN_TURBO: 'qwen-turbo',       // 快速型
  QWEN_FLASH: 'qwen-flash',       // 极速型
  QWEN_LONG: 'qwen-long',         // 长文本
  QWEN_VL_MAX: 'qwen-vl-max',     // 视觉理解
  QWEN_VL_PLUS: 'qwen-vl-plus',   // 视觉理解(快)
  QWQ_PLUS: 'qwq-plus',           // 深度推理
  
  // VectorEngine 模型（备用）
  GPT_4O: 'gpt-4o',               // OpenAI 视觉
  GPT_4_1: 'gpt-4.1',             // OpenAI 高质量
  DEEPSEEK_V3: 'deepseek-v3',     // DeepSeek 快速
} as const;

/**
 * 默认配置（未指定 Agent 时使用）
 * 使用百炼 qwen-plus 作为默认
 */
export const DEFAULT_CONFIG: AgentLLMConfig = {
  provider: 'dashscope',
  model: MODELS.QWEN_PLUS,
  enableSearch: false,
  temperature: 0.7,
  maxTokens: 4096,
  jsonMode: false,
};

/**
 * Agent 专属配置
 * 
 * 每个 Agent 可独立配置：
 * - provider: API 通道
 * - model: 使用的模型
 * - enableSearch: 是否联网搜索（百炼支持）
 * - temperature: 温度参数
 * - maxTokens: 最大输出
 * - jsonMode: JSON 输出模式
 * 
 * [2026-03-09] 全部切回百炼，联网搜索重新开启
 *   deepseek-v3 → qwen-turbo（快速/低成本）
 *   gpt-4.1     → qwen-plus（均衡）/ qwen-max（高质量分析）
 *   gpt-4o      → qwen-vl-max（视觉理解）
 */
export const AGENT_CONFIGS: Record<string, AgentLLMConfig> = {
  // ==================== JD 解析链路 ====================
  
  /** JD 预处理（文本清洗） */
  'jd-preprocess': {
    provider: 'dashscope',
    model: MODELS.QWEN_TURBO,
    temperature: 0.3,
    maxTokens: 2048,
  },
  
  /** JD 预处理（图片识别） */
  'jd-preprocess-image': {
    provider: 'dashscope',
    model: MODELS.QWEN_VL_MAX,
    temperature: 0.3,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  /** JD 结构化提取 */
  'jd-structure': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    temperature: 0.5,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  /** JD A维度分析（产品类型、技术栈等） */
  'jd-analysis-a': {
    provider: 'dashscope',
    model: MODELS.QWEN_MAX,
    temperature: 0.7,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  /** JD B维度分析（行业、商业模式等） */
  'jd-analysis-b': {
    provider: 'dashscope',
    model: MODELS.QWEN_MAX,
    temperature: 0.7,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  // ==================== 简历解析 ====================
  
  /** 简历解析（文本） */
  'resume-parse': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    temperature: 0.5,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  /** 简历解析（截图） */
  'resume-parse-image': {
    provider: 'dashscope',
    model: MODELS.QWEN_VL_MAX,
    temperature: 0.5,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  // ==================== 匹配分析 ====================
  
  /** 匹配度评估 */
  'match-evaluate': {
    provider: 'dashscope',
    model: MODELS.QWEN_MAX,
    temperature: 0.7,
    maxTokens: 8192,
    jsonMode: true,
  },
  
  // ==================== 市场调研（Phase A 新增） ====================
  
  /** 市场调研Agent（搜索结果→结构化分析） */
  'market-research': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    enableSearch: true,
    temperature: 0.5,
    maxTokens: 8192,
    jsonMode: true,
  },

  // ==================== 联网搜索场景 ====================
  
  /** 面试准备 */
  'interview-prep': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    enableSearch: true,
    temperature: 0.7,
    maxTokens: 8192,
  },
  
  /** 简历优化 */
  'resume-optimize': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    enableSearch: true,
    temperature: 0.7,
    maxTokens: 8192,
  },
  
  // ==================== 其他 ====================
  
  /** 公司分析 */
  'company-analyze': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    enableSearch: true,
    temperature: 0.7,
    maxTokens: 4096,
  },
  
  /** 路由/分类（快速判断） */
  'router': {
    provider: 'dashscope',
    model: MODELS.QWEN_TURBO,
    temperature: 0.3,
    maxTokens: 1024,
  },
  
  // ==================== Phase 7 新增 ====================
  
  /** 简历版本生成（JD定向简历） */
  'resume-version': {
    provider: 'dashscope',
    model: MODELS.QWEN_MAX,
    temperature: 0.7,
    maxTokens: 8192,
    jsonMode: true,
  },
  
  // ==================== Phase 8 新增 ====================
  
  /** 面试教练（回答点评） */
  'interview-coach': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    temperature: 0.7,
    maxTokens: 4096,
    jsonMode: true,
  },
  
  // ==================== 对话 Agent（新增） ====================
  
  /** 全局对话助手 */
  'chat-agent': {
    provider: 'dashscope',
    model: MODELS.QWEN_PLUS,
    enableSearch: true,
    temperature: 0.7,
    maxTokens: 4096,
  },
};

/**
 * 获取 Agent 配置（合并默认值）
 */
export function getAgentConfig(agentId: string): AgentLLMConfig {
  const agentConfig = AGENT_CONFIGS[agentId];
  
  if (!agentConfig) {
    console.warn(`[LLM] 未找到 Agent "${agentId}" 的配置，使用默认配置`);
    return { ...DEFAULT_CONFIG };
  }
  
  return {
    ...DEFAULT_CONFIG,
    ...agentConfig,
  };
}

/**
 * 获取 API 配置
 */
export function getAPIConfig(provider: APIProvider): APIConfig {
  return API_CONFIGS[provider];
}

/**
 * 列出所有 Agent 配置（调试用）
 */
export function listAgentConfigs(): Record<string, AgentLLMConfig> {
  return { ...AGENT_CONFIGS };
}
