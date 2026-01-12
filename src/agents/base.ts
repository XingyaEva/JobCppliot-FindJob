/**
 * Agent 基类
 * 
 * 包含评测数据收集功能
 */

import { chat, chatWithImage, parseJsonResponse, AGENT_MODELS } from '../core/api-client';
import { metricsCollector, type AgentMetrics } from '../core/metrics';
import { experimentManager } from '../core/experiment';
import type { AgentResult, AgentStatus } from '../types';

export interface AgentConfig {
  name: string;
  description: string;
  model?: string;
  jsonMode?: boolean;
}

/**
 * 扩展的 Agent 结果，包含评测数据
 */
export interface AgentResultWithMetrics<T> extends AgentResult<T> {
  metrics?: {
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
    experiment?: {
      id: string;
      group: 'control' | 'treatment';
    };
  };
}

export abstract class BaseAgent<TInput, TOutput> {
  protected config: AgentConfig;
  protected status: AgentStatus = 'pending';
  protected startTime: number = 0;
  protected inputMessage: string = '';
  protected outputContent: string = '';

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * 获取Agent名称
   */
  get name(): string {
    return this.config.name;
  }

  /**
   * 获取Agent状态
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * 获取系统提示词（子类实现）
   */
  protected abstract getSystemPrompt(): string;

  /**
   * 构建用户消息（子类实现）
   */
  protected abstract buildUserMessage(input: TInput): string;

  /**
   * 解析输出（子类实现）
   */
  protected abstract parseOutput(content: string): TOutput;

  /**
   * 获取模型名称（支持实验配置）
   */
  protected getModel(): { model: string; experiment?: { id: string; group: 'control' | 'treatment' } } {
    // 检查是否有活跃的实验
    const experimentResult = experimentManager.getModelForAgent(this.config.name);
    if (experimentResult) {
      return {
        model: experimentResult.model,
        experiment: {
          id: experimentResult.experimentId,
          group: experimentResult.group,
        },
      };
    }

    // 使用默认模型
    const model = this.config.model || AGENT_MODELS[this.config.name as keyof typeof AGENT_MODELS] || 'gpt-4o';
    return { model };
  }

  /**
   * 估算 token 数量
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * 计算成本
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4.1': { input: 2.00, output: 8.00 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'qwen-max': { input: 20, output: 60 },
      'qwen-turbo': { input: 3, output: 6 },
      'deepseek-v3': { input: 0.27, output: 1.10 },
    };
    const price = pricing[model] || { input: 2.0, output: 8.0 };
    return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  }

  /**
   * 生成评测数据
   */
  private generateMetrics(
    model: string,
    duration_ms: number,
    success: boolean,
    error?: string,
    experiment?: { id: string; group: 'control' | 'treatment' }
  ): AgentResultWithMetrics<TOutput>['metrics'] {
    const inputTokens = this.estimateTokens(this.inputMessage);
    const outputTokens = this.estimateTokens(this.outputContent);
    const cost = this.calculateCost(model, inputTokens, outputTokens);

    return {
      agent_name: this.name,
      model,
      input_chars: this.inputMessage.length,
      output_chars: this.outputContent.length,
      input_tokens_est: inputTokens,
      output_tokens_est: outputTokens,
      duration_ms,
      cost_usd_est: cost,
      success,
      error,
      timestamp: new Date().toISOString(),
      experiment,
    };
  }

  /**
   * 执行Agent
   */
  async run(input: TInput): Promise<AgentResultWithMetrics<TOutput>> {
    this.status = 'running';
    this.startTime = Date.now();

    const { model, experiment } = this.getModel();

    try {
      const systemPrompt = this.getSystemPrompt();
      const userMessage = this.buildUserMessage(input);
      this.inputMessage = systemPrompt + '\n' + userMessage;

      console.log(`[${this.name}] 开始执行，模型: ${model}${experiment ? ` (实验: ${experiment.id}, 组: ${experiment.group})` : ''}`);

      const response = await chat(systemPrompt, userMessage, {
        model,
        jsonMode: this.config.jsonMode,
      });

      this.outputContent = response;
      const output = this.parseOutput(response);
      const duration_ms = Date.now() - this.startTime;

      this.status = 'completed';
      console.log(`[${this.name}] 执行完成，耗时: ${duration_ms}ms`);

      return {
        success: true,
        data: output,
        duration_ms,
        metrics: this.generateMetrics(model, duration_ms, true, undefined, experiment),
      };
    } catch (error) {
      this.status = 'error';
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const duration_ms = Date.now() - this.startTime;
      console.error(`[${this.name}] 执行失败:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration_ms,
        metrics: this.generateMetrics(model, duration_ms, false, errorMessage, experiment),
      };
    }
  }
}

/**
 * 支持图片输入的Agent基类
 */
export abstract class VisionAgent<TInput extends { imageUrl: string }, TOutput> extends BaseAgent<TInput, TOutput> {
  /**
   * 构建用户文本消息（子类实现）
   */
  protected abstract buildUserText(input: TInput): string;

  /**
   * 重写buildUserMessage（不使用）
   */
  protected buildUserMessage(_input: TInput): string {
    return '';
  }

  /**
   * 执行Agent（带图片）
   */
  async run(input: TInput): Promise<AgentResultWithMetrics<TOutput>> {
    this.status = 'running';
    this.startTime = Date.now();

    const { model, experiment } = this.getModel();

    try {
      const systemPrompt = this.getSystemPrompt();
      const userText = this.buildUserText(input);
      this.inputMessage = systemPrompt + '\n' + userText + '\n[IMAGE]';

      console.log(`[${this.name}] 开始执行（图片模式），模型: ${model}${experiment ? ` (实验: ${experiment.id}, 组: ${experiment.group})` : ''}`);

      const response = await chatWithImage(systemPrompt, userText, input.imageUrl, {
        model,
        jsonMode: this.config.jsonMode,
      });

      this.outputContent = response;
      const output = this.parseOutput(response);
      const duration_ms = Date.now() - this.startTime;

      this.status = 'completed';
      console.log(`[${this.name}] 执行完成，耗时: ${duration_ms}ms`);

      return {
        success: true,
        data: output,
        duration_ms,
        metrics: this.generateMetrics(model, duration_ms, true, undefined, experiment),
      };
    } catch (error) {
      this.status = 'error';
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const duration_ms = Date.now() - this.startTime;
      console.error(`[${this.name}] 执行失败:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration_ms,
        metrics: this.generateMetrics(model, duration_ms, false, errorMessage, experiment),
      };
    }
  }

  /**
   * 估算 token 数量
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * 计算成本
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4.1': { input: 2.00, output: 8.00 },
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'qwen-max': { input: 20, output: 60 },
      'qwen-turbo': { input: 3, output: 6 },
      'deepseek-v3': { input: 0.27, output: 1.10 },
    };
    const price = pricing[model] || { input: 2.0, output: 8.0 };
    return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
  }

  /**
   * 生成评测数据
   */
  private generateMetrics(
    model: string,
    duration_ms: number,
    success: boolean,
    error?: string,
    experiment?: { id: string; group: 'control' | 'treatment' }
  ): AgentResultWithMetrics<TOutput>['metrics'] {
    const inputTokens = this.estimateTokens(this.inputMessage);
    const outputTokens = this.estimateTokens(this.outputContent);
    const cost = this.calculateCost(model, inputTokens, outputTokens);

    return {
      agent_name: this.name,
      model,
      input_chars: this.inputMessage.length,
      output_chars: this.outputContent.length,
      input_tokens_est: inputTokens,
      output_tokens_est: outputTokens,
      duration_ms,
      cost_usd_est: cost,
      success,
      error,
      timestamp: new Date().toISOString(),
      experiment,
    };
  }
}

/**
 * 工厂函数：创建简单的文本Agent
 */
export function createTextAgent<TInput, TOutput>(
  name: string,
  description: string,
  systemPrompt: string,
  buildMessage: (input: TInput) => string,
  parseOutput: (content: string) => TOutput,
  options: { model?: string; jsonMode?: boolean } = {}
): BaseAgent<TInput, TOutput> {
  return new (class extends BaseAgent<TInput, TOutput> {
    protected getSystemPrompt(): string {
      return systemPrompt;
    }
    protected buildUserMessage(input: TInput): string {
      return buildMessage(input);
    }
    protected parseOutput(content: string): TOutput {
      return parseOutput(content);
    }
  })({
    name,
    description,
    ...options,
  });
}

// 导出类型
export type { AgentMetrics };
