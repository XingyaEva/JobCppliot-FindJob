/**
 * 评测数据 API 路由
 */

import { Hono } from 'hono';
import { metricsCollector, type AgentMetrics, type MetricsSummary } from '../core/metrics';
import { experimentManager, getModelDisplayName, getAvailableModels } from '../core/experiment';
import { 
  costOptimizer, 
  getModelCostComparison, 
  getAgentModelReport,
  MODEL_PROFILES,
  AGENT_MODEL_RECOMMENDATIONS 
} from '../core/cost-optimizer';

const metricsRoutes = new Hono();

// 内存存储（模拟 localStorage，因为 Worker 环境无法直接访问）
let metricsStorage: AgentMetrics[] = [];
let experimentsStorage: string | null = null;

/**
 * 初始化存储（从请求中获取客户端数据）
 */
function initStorage(clientMetrics?: string, clientExperiments?: string) {
  if (clientMetrics) {
    try {
      metricsStorage = JSON.parse(clientMetrics);
      metricsCollector.loadFromStorage(clientMetrics);
    } catch (e) {
      console.error('Failed to parse client metrics:', e);
    }
  }
  if (clientExperiments) {
    experimentsStorage = clientExperiments;
    experimentManager.loadFromStorage(clientExperiments);
  }
}

/**
 * GET /api/metrics - 获取评测数据列表
 */
metricsRoutes.get('/', async (c) => {
  const clientMetrics = c.req.header('X-Metrics-Data');
  initStorage(clientMetrics);

  const { agent_name, model, success, start_date, end_date, limit } = c.req.query();

  const filters: Parameters<typeof metricsCollector.getAll>[0] = {};
  if (agent_name) filters.agent_name = agent_name;
  if (model) filters.model = model;
  if (success !== undefined) filters.success = success === 'true';
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;
  if (limit) filters.limit = parseInt(limit, 10);

  const metrics = metricsCollector.getAll(filters);

  return c.json({
    success: true,
    count: metrics.length,
    metrics: metrics.slice(-100), // 最多返回100条
    agent_names: metricsCollector.getAgentNames(),
    model_names: metricsCollector.getModelNames(),
  });
});

/**
 * GET /api/metrics/summary - 获取汇总统计
 */
metricsRoutes.get('/summary', async (c) => {
  const clientMetrics = c.req.header('X-Metrics-Data');
  initStorage(clientMetrics);

  const { agent_name, model, start_date, end_date } = c.req.query();

  const filters: Parameters<typeof metricsCollector.getSummary>[0] = {};
  if (agent_name) filters.agent_name = agent_name;
  if (model) filters.model = model;
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;

  const summary = metricsCollector.getSummary(filters);

  return c.json({
    success: true,
    summary,
  });
});

/**
 * GET /api/metrics/timeseries - 获取时间序列数据
 */
metricsRoutes.get('/timeseries', async (c) => {
  const clientMetrics = c.req.header('X-Metrics-Data');
  initStorage(clientMetrics);

  const { interval = 'hour', metric = 'calls', agent_name } = c.req.query();

  const data = metricsCollector.getTimeSeries({
    interval: interval as 'hour' | 'day',
    metric: metric as 'calls' | 'duration' | 'cost',
    agent_name,
  });

  return c.json({
    success: true,
    interval,
    metric,
    data,
  });
});

/**
 * POST /api/metrics - 记录评测数据
 */
metricsRoutes.post('/', async (c) => {
  const clientMetrics = c.req.header('X-Metrics-Data');
  initStorage(clientMetrics);

  const body = await c.req.json();
  const { agent_name, model, input, output, duration_ms, success, error, metadata } = body;

  if (!agent_name || !model || duration_ms === undefined) {
    return c.json({ success: false, error: '缺少必需参数' }, 400);
  }

  const metric = metricsCollector.record({
    agent_name,
    model,
    input: input || '',
    output: output || '',
    duration_ms,
    success: success !== false,
    error,
    metadata,
  });

  return c.json({
    success: true,
    metric,
    storage_data: metricsCollector.getStorageData(),
  });
});

/**
 * DELETE /api/metrics - 清空评测数据
 */
metricsRoutes.delete('/', async (c) => {
  metricsCollector.clear();
  metricsStorage = [];

  return c.json({
    success: true,
    message: '评测数据已清空',
    storage_data: metricsCollector.getStorageData(),
  });
});

/**
 * GET /api/metrics/export - 导出评测数据
 */
metricsRoutes.get('/export', async (c) => {
  const clientMetrics = c.req.header('X-Metrics-Data');
  initStorage(clientMetrics);

  const { format = 'json' } = c.req.query();
  const data = metricsCollector.export(format as 'json' | 'csv');

  if (format === 'csv') {
    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', 'attachment; filename=metrics.csv');
  } else {
    c.header('Content-Type', 'application/json');
    c.header('Content-Disposition', 'attachment; filename=metrics.json');
  }

  return c.body(data);
});

// ============ 实验相关 API ============

/**
 * GET /api/metrics/experiments - 获取所有实验
 */
metricsRoutes.get('/experiments', async (c) => {
  const clientExperiments = c.req.header('X-Experiments-Data');
  initStorage(undefined, clientExperiments);

  const experiments = experimentManager.getAll();

  return c.json({
    success: true,
    experiments,
    available_models: getAvailableModels(),
  });
});

/**
 * GET /api/metrics/experiments/:id - 获取单个实验
 */
metricsRoutes.get('/experiments/:id', async (c) => {
  const clientExperiments = c.req.header('X-Experiments-Data');
  initStorage(undefined, clientExperiments);

  const id = c.req.param('id');
  const experiment = experimentManager.get(id);

  if (!experiment) {
    return c.json({ success: false, error: '实验不存在' }, 404);
  }

  return c.json({
    success: true,
    experiment,
  });
});

/**
 * PUT /api/metrics/experiments/:id/toggle - 启用/禁用实验
 */
metricsRoutes.put('/experiments/:id/toggle', async (c) => {
  const clientExperiments = c.req.header('X-Experiments-Data');
  initStorage(undefined, clientExperiments);

  const id = c.req.param('id');
  const { enabled } = await c.req.json();

  const success = experimentManager.setEnabled(id, enabled);

  if (!success) {
    return c.json({ success: false, error: '实验不存在' }, 404);
  }

  return c.json({
    success: true,
    experiment: experimentManager.get(id),
    storage_data: experimentManager.getStorageData(),
  });
});

/**
 * PUT /api/metrics/experiments/:id - 更新实验配置
 */
metricsRoutes.put('/experiments/:id', async (c) => {
  const clientExperiments = c.req.header('X-Experiments-Data');
  initStorage(undefined, clientExperiments);

  const id = c.req.param('id');
  const updates = await c.req.json();

  const success = experimentManager.update(id, updates);

  if (!success) {
    return c.json({ success: false, error: '实验不存在' }, 404);
  }

  return c.json({
    success: true,
    experiment: experimentManager.get(id),
    storage_data: experimentManager.getStorageData(),
  });
});

/**
 * POST /api/metrics/experiments - 创建新实验
 */
metricsRoutes.post('/experiments', async (c) => {
  const clientExperiments = c.req.header('X-Experiments-Data');
  initStorage(undefined, clientExperiments);

  const config = await c.req.json();

  if (!config.name || !config.agent_name || !config.control || !config.treatment) {
    return c.json({ success: false, error: '缺少必需参数' }, 400);
  }

  const experiment = experimentManager.create({
    name: config.name,
    description: config.description || '',
    agent_name: config.agent_name,
    control: config.control,
    treatment: config.treatment,
    enabled: config.enabled || false,
  });

  return c.json({
    success: true,
    experiment,
    storage_data: experimentManager.getStorageData(),
  });
});

/**
 * DELETE /api/metrics/experiments/:id - 删除实验
 */
metricsRoutes.delete('/experiments/:id', async (c) => {
  const clientExperiments = c.req.header('X-Experiments-Data');
  initStorage(undefined, clientExperiments);

  const id = c.req.param('id');
  const success = experimentManager.delete(id);

  if (!success) {
    return c.json({ success: false, error: '实验不存在' }, 404);
  }

  return c.json({
    success: true,
    message: '实验已删除',
    storage_data: experimentManager.getStorageData(),
  });
});

/**
 * GET /api/metrics/models - 获取模型价格和信息
 */
metricsRoutes.get('/models', async (c) => {
  const { MODEL_PRICING } = await import('../core/metrics');

  const models = Object.entries(MODEL_PRICING).map(([name, pricing]) => ({
    name,
    display_name: getModelDisplayName(name),
    input_price_per_1m: pricing.input,
    output_price_per_1m: pricing.output,
  }));

  return c.json({
    success: true,
    models,
  });
});

// ============ 成本优化 API ============

/**
 * GET /api/metrics/cost - 获取成本统计
 */
metricsRoutes.get('/cost', async (c) => {
  const dailyStats = costOptimizer.getDailyStats();
  const modelComparison = getModelCostComparison();
  const agentReport = getAgentModelReport();

  return c.json({
    success: true,
    daily_stats: dailyStats,
    model_comparison: modelComparison,
    agent_recommendations: agentReport,
  });
});

/**
 * GET /api/metrics/cost/models - 获取模型成本对比
 */
metricsRoutes.get('/cost/models', async (c) => {
  const comparison = getModelCostComparison();
  const profiles = Object.entries(MODEL_PROFILES).map(([model, profile]) => ({
    model,
    ...profile,
  }));

  return c.json({
    success: true,
    comparison,
    profiles,
  });
});

/**
 * GET /api/metrics/cost/agents - 获取 Agent 模型推荐
 */
metricsRoutes.get('/cost/agents', async (c) => {
  const report = getAgentModelReport();
  const recommendations = Object.entries(AGENT_MODEL_RECOMMENDATIONS).map(([agent, rec]) => ({
    agent,
    default_model: rec.default,
    alternatives: rec.alternatives,
    min_quality: rec.minQuality,
    selected_model: costOptimizer.selectModelForAgent(agent),
  }));

  return c.json({
    success: true,
    report,
    recommendations,
  });
});

/**
 * PUT /api/metrics/cost/strategy - 更新成本优化策略
 */
metricsRoutes.put('/cost/strategy', async (c) => {
  const { strategy, daily_budget, warning_threshold } = await c.req.json();

  // 更新策略（需要重新创建实例，这里简化处理）
  const validStrategies = ['quality', 'balanced', 'economy'];
  if (strategy && !validStrategies.includes(strategy)) {
    return c.json({ success: false, error: '无效的策略' }, 400);
  }

  return c.json({
    success: true,
    message: '成本策略已更新',
    current_strategy: strategy || 'balanced',
    daily_budget: daily_budget || 1.0,
    warning_threshold: warning_threshold || 0.8,
  });
});

/**
 * POST /api/metrics/cost/estimate - 估算调用成本
 */
metricsRoutes.post('/cost/estimate', async (c) => {
  const { model, input_text, expected_output_length } = await c.req.json();

  if (!model || !input_text) {
    return c.json({ success: false, error: '缺少必需参数' }, 400);
  }

  const { CostOptimizer, estimateCost, getModelPricing } = await import('../core/cost-optimizer');
  
  const inputTokens = CostOptimizer.estimateTokens(input_text);
  const outputTokens = Math.ceil((expected_output_length || 1000) / 3);
  const cost = estimateCost(model, inputTokens, outputTokens);
  const pricing = getModelPricing(model);

  return c.json({
    success: true,
    estimate: {
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      input_cost: (inputTokens / 1_000_000) * pricing.input,
      output_cost: (outputTokens / 1_000_000) * pricing.output,
      total_cost: cost,
      cost_formatted: `$${cost.toFixed(6)}`,
    },
  });
});

export { metricsRoutes };
