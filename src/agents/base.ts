/**
 * Agent 基类
 */

import { chat, chatWithImage, parseJsonResponse, AGENT_MODELS } from '../core/api-client';
import type { AgentResult, AgentStatus } from '../types';

export interface AgentConfig {
  name: string;
  description: string;
  model?: string;
  jsonMode?: boolean;
}

export abstract class BaseAgent<TInput, TOutput> {
  protected config: AgentConfig;
  protected status: AgentStatus = 'pending';
  protected startTime: number = 0;

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
   * 获取模型名称
   */
  protected getModel(): string {
    return this.config.model || AGENT_MODELS[this.config.name as keyof typeof AGENT_MODELS] || 'gpt-4o';
  }

  /**
   * 执行Agent
   */
  async run(input: TInput): Promise<AgentResult<TOutput>> {
    this.status = 'running';
    this.startTime = Date.now();

    try {
      const systemPrompt = this.getSystemPrompt();
      const userMessage = this.buildUserMessage(input);
      const model = this.getModel();

      console.log(`[${this.name}] 开始执行，模型: ${model}`);

      const response = await chat(systemPrompt, userMessage, {
        model,
        jsonMode: this.config.jsonMode,
      });

      const output = this.parseOutput(response);
      const duration_ms = Date.now() - this.startTime;

      this.status = 'completed';
      console.log(`[${this.name}] 执行完成，耗时: ${duration_ms}ms`);

      return {
        success: true,
        data: output,
        duration_ms,
      };
    } catch (error) {
      this.status = 'error';
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`[${this.name}] 执行失败:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration_ms: Date.now() - this.startTime,
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
  async run(input: TInput): Promise<AgentResult<TOutput>> {
    this.status = 'running';
    this.startTime = Date.now();

    try {
      const systemPrompt = this.getSystemPrompt();
      const userText = this.buildUserText(input);
      const model = this.getModel();

      console.log(`[${this.name}] 开始执行（图片模式），模型: ${model}`);

      const response = await chatWithImage(systemPrompt, userText, input.imageUrl, {
        model,
        jsonMode: this.config.jsonMode,
      });

      const output = this.parseOutput(response);
      const duration_ms = Date.now() - this.startTime;

      this.status = 'completed';
      console.log(`[${this.name}] 执行完成，耗时: ${duration_ms}ms`);

      return {
        success: true,
        data: output,
        duration_ms,
      };
    } catch (error) {
      this.status = 'error';
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error(`[${this.name}] 执行失败:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        duration_ms: Date.now() - this.startTime,
      };
    }
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
