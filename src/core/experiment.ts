/**
 * A/B 测试实验配置管理
 * 
 * 支持对不同 Agent 使用不同模型进行对比实验
 */

import { MODELS } from './api-client';

/**
 * 实验配置
 */
export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  agent_name: string;
  // 控制组（默认模型）
  control: {
    model: string;
    weight: number; // 流量权重 0-100
  };
  // 实验组
  treatment: {
    model: string;
    weight: number;
  };
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 实验结果对比
 */
export interface ExperimentResult {
  experiment_id: string;
  control: {
    model: string;
    calls: number;
    success_rate: number;
    avg_duration_ms: number;
    avg_cost_usd: number;
  };
  treatment: {
    model: string;
    calls: number;
    success_rate: number;
    avg_duration_ms: number;
    avg_cost_usd: number;
  };
  // 对比差异
  diff: {
    success_rate_delta: number; // 正数表示实验组更好
    duration_delta_pct: number; // 负数表示实验组更快
    cost_delta_pct: number; // 负数表示实验组更便宜
  };
  statistical_significance?: boolean;
}

/**
 * 预定义的实验模板
 */
export const EXPERIMENT_TEMPLATES: Omit<ExperimentConfig, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'JD B维度分析: GPT-4.1 vs DeepSeek',
    description: '对比 GPT-4.1 和 DeepSeek-V3 在 JD B维度分析中的表现',
    agent_name: 'jd-analysis-b',
    control: { model: MODELS.HIGH, weight: 50 },
    treatment: { model: MODELS.DEEPSEEK, weight: 50 },
    enabled: false,
  },
  {
    name: '匹配评估: GPT-4.1 vs Qwen-Max',
    description: '对比高端模型和中端模型在匹配评估中的质量差异',
    agent_name: 'match-evaluate',
    control: { model: MODELS.HIGH, weight: 50 },
    treatment: { model: MODELS.MEDIUM, weight: 50 },
    enabled: false,
  },
  {
    name: '简历优化: GPT-4.1 vs DeepSeek',
    description: '对比生成质量和成本效益',
    agent_name: 'resume-optimize',
    control: { model: MODELS.HIGH, weight: 50 },
    treatment: { model: MODELS.DEEPSEEK, weight: 50 },
    enabled: false,
  },
  {
    name: '面试准备: GPT-4.1 vs DeepSeek',
    description: '对比面试材料生成质量',
    agent_name: 'interview-prep',
    control: { model: MODELS.HIGH, weight: 50 },
    treatment: { model: MODELS.DEEPSEEK, weight: 50 },
    enabled: false,
  },
  {
    name: 'JD 结构化: Qwen-Max vs DeepSeek',
    description: '对比中端模型的结构化能力',
    agent_name: 'jd-structure',
    control: { model: MODELS.MEDIUM, weight: 50 },
    treatment: { model: MODELS.DEEPSEEK, weight: 50 },
    enabled: false,
  },
];

/**
 * 实验管理器
 */
class ExperimentManager {
  private experiments: Map<string, ExperimentConfig> = new Map();
  private readonly STORAGE_KEY = 'jobcopilot_experiments';

  constructor() {
    // 初始化预定义实验
    this.initDefaultExperiments();
  }

  /**
   * 初始化默认实验
   */
  private initDefaultExperiments(): void {
    EXPERIMENT_TEMPLATES.forEach((template, index) => {
      const id = `exp_${index + 1}`;
      const now = new Date().toISOString();
      this.experiments.set(id, {
        ...template,
        id,
        created_at: now,
        updated_at: now,
      });
    });
  }

  /**
   * 从存储加载
   */
  loadFromStorage(data: string | null): void {
    if (data) {
      try {
        const parsed = JSON.parse(data) as ExperimentConfig[];
        parsed.forEach(exp => {
          this.experiments.set(exp.id, exp);
        });
      } catch (e) {
        console.error('Failed to parse experiments data:', e);
      }
    }
  }

  /**
   * 获取存储数据
   */
  getStorageData(): string {
    return JSON.stringify(Array.from(this.experiments.values()));
  }

  /**
   * 获取所有实验
   */
  getAll(): ExperimentConfig[] {
    return Array.from(this.experiments.values());
  }

  /**
   * 获取单个实验
   */
  get(id: string): ExperimentConfig | undefined {
    return this.experiments.get(id);
  }

  /**
   * 获取 Agent 的活跃实验
   */
  getActiveForAgent(agentName: string): ExperimentConfig | undefined {
    return Array.from(this.experiments.values()).find(
      exp => exp.agent_name === agentName && exp.enabled
    );
  }

  /**
   * 根据权重选择实验组
   */
  selectGroup(experiment: ExperimentConfig): 'control' | 'treatment' {
    const random = Math.random() * 100;
    return random < experiment.control.weight ? 'control' : 'treatment';
  }

  /**
   * 获取 Agent 应使用的模型
   * 如果有活跃实验，根据权重随机选择；否则返回 null（使用默认模型）
   */
  getModelForAgent(agentName: string): { model: string; experimentId: string; group: 'control' | 'treatment' } | null {
    const experiment = this.getActiveForAgent(agentName);
    if (!experiment) {
      return null;
    }

    const group = this.selectGroup(experiment);
    const model = group === 'control' ? experiment.control.model : experiment.treatment.model;

    return {
      model,
      experimentId: experiment.id,
      group,
    };
  }

  /**
   * 启用/禁用实验
   */
  setEnabled(id: string, enabled: boolean): boolean {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      return false;
    }

    // 如果启用，先禁用同一 Agent 的其他实验
    if (enabled) {
      this.experiments.forEach((exp, expId) => {
        if (exp.agent_name === experiment.agent_name && expId !== id) {
          exp.enabled = false;
          exp.updated_at = new Date().toISOString();
        }
      });
    }

    experiment.enabled = enabled;
    experiment.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * 更新实验配置
   */
  update(id: string, updates: Partial<Pick<ExperimentConfig, 'name' | 'description' | 'control' | 'treatment'>>): boolean {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      return false;
    }

    Object.assign(experiment, updates);
    experiment.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * 创建新实验
   */
  create(config: Omit<ExperimentConfig, 'id' | 'created_at' | 'updated_at'>): ExperimentConfig {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();
    const experiment: ExperimentConfig = {
      ...config,
      id,
      created_at: now,
      updated_at: now,
    };
    this.experiments.set(id, experiment);
    return experiment;
  }

  /**
   * 删除实验
   */
  delete(id: string): boolean {
    return this.experiments.delete(id);
  }
}

// 导出单例
export const experimentManager = new ExperimentManager();

/**
 * 获取模型显示名称
 */
export function getModelDisplayName(model: string): string {
  const names: Record<string, string> = {
    'gpt-4.1': 'GPT-4.1',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'qwen-max': 'Qwen-Max',
    'qwen-turbo': 'Qwen-Turbo',
    'deepseek-v3': 'DeepSeek-V3',
    'deepseek-chat': 'DeepSeek-Chat',
  };
  return names[model] || model;
}

/**
 * 获取所有可用模型
 */
export function getAvailableModels(): Array<{ value: string; label: string }> {
  return [
    { value: MODELS.HIGH, label: 'GPT-4.1 (高质量)' },
    { value: MODELS.VISION, label: 'GPT-4o (视觉)' },
    { value: MODELS.MEDIUM, label: 'Qwen-Max (中等)' },
    { value: MODELS.FAST, label: 'Qwen-Turbo (快速)' },
    { value: MODELS.DEEPSEEK, label: 'DeepSeek-V3 (高性价比)' },
  ];
}
