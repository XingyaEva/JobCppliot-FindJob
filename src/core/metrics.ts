/**
 * Agent 评测数据收集器
 * 
 * 收集 Agent 执行的性能、质量、成本数据
 */

// 模型价格配置 (USD per 1M tokens)
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4.1': { input: 2.00, output: 8.00 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'qwen-max': { input: 0.02 * 1000, output: 0.06 * 1000 }, // 转换为 per 1M
  'qwen-turbo': { input: 0.003 * 1000, output: 0.006 * 1000 },
  'deepseek-v3': { input: 0.27, output: 1.10 },
  'deepseek-chat': { input: 0.14, output: 0.28 },
};

// 默认 token 估算 (字符数 / 4)
const DEFAULT_CHARS_PER_TOKEN = 4;

/**
 * Agent 执行指标
 */
export interface AgentMetrics {
  id: string;
  agent_name: string;
  model: string;
  input_chars: number;
  output_chars: number;
  input_tokens_est: number;
  output_tokens_est: number;
  duration_ms: number;
  cost_usd_est: number;
  success: boolean;
  error?: string;
  timestamp: string;
  // 额外元数据
  metadata?: {
    job_id?: string;
    resume_id?: string;
    experiment_id?: string;
    experiment_group?: string;
  };
}

/**
 * 汇总统计
 */
export interface MetricsSummary {
  total_calls: number;
  success_count: number;
  error_count: number;
  success_rate: number;
  total_duration_ms: number;
  avg_duration_ms: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_usd: number;
  by_agent: Record<string, {
    calls: number;
    success_rate: number;
    avg_duration_ms: number;
    total_cost_usd: number;
  }>;
  by_model: Record<string, {
    calls: number;
    total_tokens: number;
    total_cost_usd: number;
  }>;
  time_range: {
    start: string;
    end: string;
  };
}

/**
 * 评测数据管理器
 */
class MetricsCollector {
  private metrics: AgentMetrics[] = [];
  private readonly STORAGE_KEY = 'jobcopilot_metrics';
  private readonly MAX_RECORDS = 1000; // 最多保留1000条记录

  constructor() {
    // 在 Worker 环境中不自动加载
  }

  /**
   * 从存储加载数据（需要在请求上下文中调用）
   */
  loadFromStorage(storageData: string | null): void {
    if (storageData) {
      try {
        this.metrics = JSON.parse(storageData);
      } catch (e) {
        console.error('Failed to parse metrics data:', e);
        this.metrics = [];
      }
    }
  }

  /**
   * 获取存储数据字符串
   */
  getStorageData(): string {
    return JSON.stringify(this.metrics);
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 估算 token 数量
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / DEFAULT_CHARS_PER_TOKEN);
  }

  /**
   * 计算成本
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[model] || { input: 2.0, output: 8.0 }; // 默认使用 gpt-4.1 价格
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  /**
   * 记录 Agent 执行指标
   */
  record(params: {
    agent_name: string;
    model: string;
    input: string;
    output: string;
    duration_ms: number;
    success: boolean;
    error?: string;
    metadata?: AgentMetrics['metadata'];
  }): AgentMetrics {
    const inputTokens = this.estimateTokens(params.input);
    const outputTokens = this.estimateTokens(params.output);
    const cost = this.calculateCost(params.model, inputTokens, outputTokens);

    const metric: AgentMetrics = {
      id: this.generateId(),
      agent_name: params.agent_name,
      model: params.model,
      input_chars: params.input.length,
      output_chars: params.output.length,
      input_tokens_est: inputTokens,
      output_tokens_est: outputTokens,
      duration_ms: params.duration_ms,
      cost_usd_est: cost,
      success: params.success,
      error: params.error,
      timestamp: new Date().toISOString(),
      metadata: params.metadata,
    };

    this.metrics.push(metric);

    // 限制记录数量
    if (this.metrics.length > this.MAX_RECORDS) {
      this.metrics = this.metrics.slice(-this.MAX_RECORDS);
    }

    return metric;
  }

  /**
   * 获取所有指标
   */
  getAll(filters?: {
    agent_name?: string;
    model?: string;
    success?: boolean;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): AgentMetrics[] {
    let result = [...this.metrics];

    if (filters) {
      if (filters.agent_name) {
        result = result.filter(m => m.agent_name === filters.agent_name);
      }
      if (filters.model) {
        result = result.filter(m => m.model === filters.model);
      }
      if (filters.success !== undefined) {
        result = result.filter(m => m.success === filters.success);
      }
      if (filters.start_date) {
        result = result.filter(m => m.timestamp >= filters.start_date!);
      }
      if (filters.end_date) {
        result = result.filter(m => m.timestamp <= filters.end_date!);
      }
      if (filters.limit) {
        result = result.slice(-filters.limit);
      }
    }

    return result;
  }

  /**
   * 获取汇总统计
   */
  getSummary(filters?: {
    agent_name?: string;
    model?: string;
    start_date?: string;
    end_date?: string;
  }): MetricsSummary {
    const metrics = this.getAll(filters);

    if (metrics.length === 0) {
      return {
        total_calls: 0,
        success_count: 0,
        error_count: 0,
        success_rate: 0,
        total_duration_ms: 0,
        avg_duration_ms: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_usd: 0,
        by_agent: {},
        by_model: {},
        time_range: { start: '', end: '' },
      };
    }

    const successCount = metrics.filter(m => m.success).length;
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration_ms, 0);
    const totalInputTokens = metrics.reduce((sum, m) => sum + m.input_tokens_est, 0);
    const totalOutputTokens = metrics.reduce((sum, m) => sum + m.output_tokens_est, 0);
    const totalCost = metrics.reduce((sum, m) => sum + m.cost_usd_est, 0);

    // 按 Agent 分组统计
    const byAgent: MetricsSummary['by_agent'] = {};
    const agentGroups = new Map<string, AgentMetrics[]>();
    metrics.forEach(m => {
      if (!agentGroups.has(m.agent_name)) {
        agentGroups.set(m.agent_name, []);
      }
      agentGroups.get(m.agent_name)!.push(m);
    });
    agentGroups.forEach((items, name) => {
      const agentSuccess = items.filter(m => m.success).length;
      const agentDuration = items.reduce((sum, m) => sum + m.duration_ms, 0);
      const agentCost = items.reduce((sum, m) => sum + m.cost_usd_est, 0);
      byAgent[name] = {
        calls: items.length,
        success_rate: items.length > 0 ? agentSuccess / items.length : 0,
        avg_duration_ms: items.length > 0 ? agentDuration / items.length : 0,
        total_cost_usd: agentCost,
      };
    });

    // 按模型分组统计
    const byModel: MetricsSummary['by_model'] = {};
    const modelGroups = new Map<string, AgentMetrics[]>();
    metrics.forEach(m => {
      if (!modelGroups.has(m.model)) {
        modelGroups.set(m.model, []);
      }
      modelGroups.get(m.model)!.push(m);
    });
    modelGroups.forEach((items, model) => {
      const modelTokens = items.reduce((sum, m) => sum + m.input_tokens_est + m.output_tokens_est, 0);
      const modelCost = items.reduce((sum, m) => sum + m.cost_usd_est, 0);
      byModel[model] = {
        calls: items.length,
        total_tokens: modelTokens,
        total_cost_usd: modelCost,
      };
    });

    // 时间范围
    const timestamps = metrics.map(m => m.timestamp).sort();

    return {
      total_calls: metrics.length,
      success_count: successCount,
      error_count: metrics.length - successCount,
      success_rate: metrics.length > 0 ? successCount / metrics.length : 0,
      total_duration_ms: totalDuration,
      avg_duration_ms: metrics.length > 0 ? totalDuration / metrics.length : 0,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
      total_cost_usd: totalCost,
      by_agent: byAgent,
      by_model: byModel,
      time_range: {
        start: timestamps[0] || '',
        end: timestamps[timestamps.length - 1] || '',
      },
    };
  }

  /**
   * 获取时间序列数据（用于图表）
   */
  getTimeSeries(options: {
    interval: 'hour' | 'day';
    metric: 'calls' | 'duration' | 'cost';
    agent_name?: string;
  }): Array<{ time: string; value: number }> {
    const metrics = this.getAll({ agent_name: options.agent_name });
    const grouped = new Map<string, number>();

    metrics.forEach(m => {
      const date = new Date(m.timestamp);
      let key: string;
      
      if (options.interval === 'hour') {
        key = `${date.toISOString().slice(0, 13)}:00`;
      } else {
        key = date.toISOString().slice(0, 10);
      }

      const currentValue = grouped.get(key) || 0;
      let addValue: number;
      
      switch (options.metric) {
        case 'calls':
          addValue = 1;
          break;
        case 'duration':
          addValue = m.duration_ms;
          break;
        case 'cost':
          addValue = m.cost_usd_est;
          break;
        default:
          addValue = 1;
      }
      
      grouped.set(key, currentValue + addValue);
    });

    return Array.from(grouped.entries())
      .map(([time, value]) => ({ time, value }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  /**
   * 清空数据
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * 导出数据
   */
  export(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.metrics, null, 2);
    }

    // CSV 格式
    const headers = [
      'id', 'agent_name', 'model', 'input_chars', 'output_chars',
      'input_tokens_est', 'output_tokens_est', 'duration_ms',
      'cost_usd_est', 'success', 'error', 'timestamp'
    ];
    
    const rows = this.metrics.map(m => [
      m.id, m.agent_name, m.model, m.input_chars, m.output_chars,
      m.input_tokens_est, m.output_tokens_est, m.duration_ms,
      m.cost_usd_est.toFixed(6), m.success, m.error || '', m.timestamp
    ].map(v => `"${v}"`).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * 获取 Agent 列表
   */
  getAgentNames(): string[] {
    return [...new Set(this.metrics.map(m => m.agent_name))];
  }

  /**
   * 获取模型列表
   */
  getModelNames(): string[] {
    return [...new Set(this.metrics.map(m => m.model))];
  }
}

// 导出单例
export const metricsCollector = new MetricsCollector();

/**
 * 评测装饰器 - 包装 Agent 执行函数
 */
export function withMetrics<TInput, TOutput>(
  agentName: string,
  model: string,
  executeFn: (input: TInput) => Promise<{ success: boolean; data?: TOutput; error?: string; duration_ms: number }>,
  inputSerializer: (input: TInput) => string = JSON.stringify,
  outputSerializer: (output: TOutput | undefined) => string = (o) => o ? JSON.stringify(o) : ''
): (input: TInput, metadata?: AgentMetrics['metadata']) => Promise<{ success: boolean; data?: TOutput; error?: string; duration_ms: number; metrics?: AgentMetrics }> {
  return async (input: TInput, metadata?: AgentMetrics['metadata']) => {
    const inputStr = inputSerializer(input);
    const startTime = Date.now();
    
    try {
      const result = await executeFn(input);
      const outputStr = outputSerializer(result.data);
      
      const metrics = metricsCollector.record({
        agent_name: agentName,
        model,
        input: inputStr,
        output: outputStr,
        duration_ms: result.duration_ms,
        success: result.success,
        error: result.error,
        metadata,
      });

      return { ...result, metrics };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      const duration_ms = Date.now() - startTime;
      
      const metrics = metricsCollector.record({
        agent_name: agentName,
        model,
        input: inputStr,
        output: '',
        duration_ms,
        success: false,
        error: errorMsg,
        metadata,
      });

      return { success: false, error: errorMsg, duration_ms, metrics };
    }
  };
}
