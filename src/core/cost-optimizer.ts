/**
 * 成本优化模块
 * 提供模型成本估算、智能选择策略和预警功能
 */

import { MODELS } from './api-client';

/** 模型定价配置（单位：USD per 1M tokens） */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI 模型
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4.1': { input: 2.00, output: 8.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  
  // Qwen 模型
  'qwen-turbo': { input: 0.003, output: 0.006 },  // per 1K tokens
  'qwen-max': { input: 0.02, output: 0.06 },      // per 1K tokens
  
  // DeepSeek 模型
  'deepseek-v3': { input: 0.27, output: 1.10 },
};

/** 将 Qwen 价格转换为每百万 Token */
const QWEN_MULTIPLIER = 1000;

/** 获取模型实际价格（统一为 per 1M tokens） */
export function getModelPricing(model: string): { input: number; output: number } {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    // 默认使用 gpt-4o 的价格作为保守估计
    return MODEL_PRICING['gpt-4o'];
  }
  
  // Qwen 模型价格需要转换
  if (model.startsWith('qwen')) {
    return {
      input: pricing.input * QWEN_MULTIPLIER,
      output: pricing.output * QWEN_MULTIPLIER,
    };
  }
  
  return pricing;
}

/** 估算成本（USD） */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = getModelPricing(model);
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/** 模型性能配置 */
export interface ModelProfile {
  name: string;
  tier: 'fast' | 'medium' | 'high';
  avgLatency: number;      // 平均延迟 (ms)
  costPerCall: number;     // 平均每次调用成本 (USD)
  qualityScore: number;    // 质量评分 (0-100)
  bestFor: string[];       // 最适合的场景
}

/** 模型性能配置库 */
export const MODEL_PROFILES: Record<string, ModelProfile> = {
  'gpt-4o': {
    name: 'GPT-4o',
    tier: 'high',
    avgLatency: 3000,
    costPerCall: 0.01,
    qualityScore: 95,
    bestFor: ['复杂推理', '图像识别', '创意写作'],
  },
  'gpt-4.1': {
    name: 'GPT-4.1',
    tier: 'high',
    avgLatency: 4000,
    costPerCall: 0.008,
    qualityScore: 92,
    bestFor: ['复杂分析', 'JSON输出', '长文本处理'],
  },
  'qwen-turbo': {
    name: 'Qwen Turbo',
    tier: 'fast',
    avgLatency: 1000,
    costPerCall: 0.0001,
    qualityScore: 75,
    bestFor: ['简单任务', '文本清洗', '快速响应'],
  },
  'qwen-max': {
    name: 'Qwen Max',
    tier: 'medium',
    avgLatency: 2000,
    costPerCall: 0.001,
    qualityScore: 85,
    bestFor: ['中等复杂度', '结构化输出', '中文处理'],
  },
  'deepseek-v3': {
    name: 'DeepSeek V3',
    tier: 'medium',
    avgLatency: 2500,
    costPerCall: 0.002,
    qualityScore: 88,
    bestFor: ['代码生成', '逻辑推理', '性价比高'],
  },
};

/** Agent 推荐模型配置 */
export const AGENT_MODEL_RECOMMENDATIONS: Record<string, {
  default: string;
  alternatives: string[];
  minQuality: number;
}> = {
  'jd-preprocess': {
    default: MODELS.FAST,
    alternatives: [MODELS.MEDIUM],
    minQuality: 70,
  },
  'jd-structure': {
    default: MODELS.MEDIUM,
    alternatives: [MODELS.FAST, MODELS.HIGH],
    minQuality: 80,
  },
  'jd-analysis-a': {
    default: MODELS.MEDIUM,
    alternatives: [MODELS.HIGH],
    minQuality: 80,
  },
  'jd-analysis-b': {
    default: MODELS.HIGH,
    alternatives: [MODELS.MEDIUM, MODELS.DEEPSEEK],
    minQuality: 85,
  },
  'resume-preprocess': {
    default: MODELS.FAST,
    alternatives: [MODELS.MEDIUM],
    minQuality: 70,
  },
  'resume-parse': {
    default: MODELS.MEDIUM,
    alternatives: [MODELS.HIGH],
    minQuality: 80,
  },
  'match-evaluate': {
    default: MODELS.HIGH,
    alternatives: [MODELS.MEDIUM, MODELS.DEEPSEEK],
    minQuality: 85,
  },
  'company-analyze': {
    default: MODELS.HIGH,
    alternatives: [MODELS.MEDIUM, MODELS.DEEPSEEK],
    minQuality: 85,
  },
  'interview-prep': {
    default: MODELS.HIGH,
    alternatives: [MODELS.MEDIUM],
    minQuality: 85,
  },
  'resume-optimize': {
    default: MODELS.HIGH,
    alternatives: [MODELS.MEDIUM],
    minQuality: 85,
  },
};

/** 成本优化策略 */
export type CostStrategy = 'quality' | 'balanced' | 'economy';

/** 成本优化器配置 */
export interface CostOptimizerConfig {
  strategy: CostStrategy;
  dailyBudget?: number;        // 每日预算 (USD)
  warningThreshold?: number;   // 预警阈值 (占比)
  enableFallback?: boolean;    // 启用降级策略
}

/** 成本优化器 */
export class CostOptimizer {
  private config: CostOptimizerConfig;
  private dailySpent: number = 0;
  private lastResetDate: string = '';
  
  constructor(config: CostOptimizerConfig = { strategy: 'balanced' }) {
    this.config = {
      dailyBudget: 1.0,        // 默认 $1/天
      warningThreshold: 0.8,   // 80% 预警
      enableFallback: true,
      ...config,
    };
  }
  
  /** 重置每日计数器 */
  private checkAndResetDaily(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastResetDate !== today) {
      this.dailySpent = 0;
      this.lastResetDate = today;
    }
  }
  
  /** 为 Agent 选择最优模型 */
  selectModelForAgent(agentName: string): string {
    this.checkAndResetDaily();
    
    const recommendation = AGENT_MODEL_RECOMMENDATIONS[agentName];
    if (!recommendation) {
      return MODELS.MEDIUM;  // 默认中等
    }
    
    // 根据策略选择模型
    switch (this.config.strategy) {
      case 'quality':
        // 优先质量：使用推荐的默认模型或更高质量
        return recommendation.default;
        
      case 'economy':
        // 优先成本：尝试使用替代模型中成本最低的
        return this.findCheapestModel(recommendation) || recommendation.default;
        
      case 'balanced':
      default:
        // 平衡策略：检查预算，动态选择
        if (this.isNearBudgetLimit()) {
          return this.findCheapestModel(recommendation) || recommendation.default;
        }
        return recommendation.default;
    }
  }
  
  /** 查找成本最低的满足质量要求的模型 */
  private findCheapestModel(recommendation: typeof AGENT_MODEL_RECOMMENDATIONS[string]): string | null {
    const candidates = [recommendation.default, ...recommendation.alternatives];
    
    let cheapest: { model: string; cost: number } | null = null;
    
    for (const model of candidates) {
      const profile = MODEL_PROFILES[model];
      if (!profile) continue;
      
      // 检查质量是否满足最低要求
      if (profile.qualityScore < recommendation.minQuality) continue;
      
      if (!cheapest || profile.costPerCall < cheapest.cost) {
        cheapest = { model, cost: profile.costPerCall };
      }
    }
    
    return cheapest?.model || null;
  }
  
  /** 检查是否接近预算上限 */
  isNearBudgetLimit(): boolean {
    this.checkAndResetDaily();
    
    if (!this.config.dailyBudget) return false;
    
    const threshold = this.config.warningThreshold || 0.8;
    return this.dailySpent >= this.config.dailyBudget * threshold;
  }
  
  /** 检查是否超出预算 */
  isOverBudget(): boolean {
    this.checkAndResetDaily();
    
    if (!this.config.dailyBudget) return false;
    return this.dailySpent >= this.config.dailyBudget;
  }
  
  /** 记录成本 */
  recordCost(cost: number): void {
    this.checkAndResetDaily();
    this.dailySpent += cost;
  }
  
  /** 获取今日消费统计 */
  getDailyStats(): {
    spent: number;
    budget: number;
    percentage: number;
    isWarning: boolean;
    isOverBudget: boolean;
  } {
    this.checkAndResetDaily();
    
    const budget = this.config.dailyBudget || 0;
    const percentage = budget > 0 ? (this.dailySpent / budget) * 100 : 0;
    
    return {
      spent: this.dailySpent,
      budget,
      percentage,
      isWarning: this.isNearBudgetLimit(),
      isOverBudget: this.isOverBudget(),
    };
  }
  
  /** 估算 Token 数量（简单估算） */
  static estimateTokens(text: string): number {
    // 简单估算：中文约 2 字符/token，英文约 4 字符/token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    
    return Math.ceil(chineseChars / 2 + otherChars / 4);
  }
  
  /** 估算调用成本 */
  static estimateCallCost(
    model: string,
    inputText: string,
    expectedOutputLength: number = 1000
  ): number {
    const inputTokens = CostOptimizer.estimateTokens(inputText);
    const outputTokens = Math.ceil(expectedOutputLength / 3);  // 假设平均3字符/token
    
    return estimateCost(model, inputTokens, outputTokens);
  }
}

/** 全局成本优化器实例 */
export const costOptimizer = new CostOptimizer({ strategy: 'balanced' });

/** 获取模型成本对比报告 */
export function getModelCostComparison(): Array<{
  model: string;
  tier: string;
  inputCost: string;
  outputCost: string;
  avgCallCost: string;
  qualityScore: number;
}> {
  return Object.entries(MODEL_PROFILES).map(([model, profile]) => {
    const pricing = getModelPricing(model);
    return {
      model: profile.name,
      tier: profile.tier,
      inputCost: `$${pricing.input.toFixed(3)}/1M`,
      outputCost: `$${pricing.output.toFixed(3)}/1M`,
      avgCallCost: `$${profile.costPerCall.toFixed(4)}`,
      qualityScore: profile.qualityScore,
    };
  });
}

/** 获取 Agent 推荐模型报告 */
export function getAgentModelReport(): Array<{
  agent: string;
  currentModel: string;
  alternatives: string[];
  estimatedCost: string;
}> {
  return Object.entries(AGENT_MODEL_RECOMMENDATIONS).map(([agent, rec]) => {
    const profile = MODEL_PROFILES[rec.default];
    return {
      agent,
      currentModel: profile?.name || rec.default,
      alternatives: rec.alternatives,
      estimatedCost: profile ? `$${profile.costPerCall.toFixed(4)}/call` : 'N/A',
    };
  });
}
