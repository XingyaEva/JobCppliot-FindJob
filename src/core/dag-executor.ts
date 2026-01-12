/**
 * DAG 执行器
 * 管理多Agent的依赖关系和并行执行
 */

import type { DAGNode, DAGState, AgentStatus, AgentResult } from '../types';

/** DAG节点配置 */
export interface DAGNodeConfig {
  id: string;
  name: string;
  agent: string;
  dependencies: string[];
  execute: (inputs: Record<string, any>) => Promise<AgentResult>;
}

/** DAG执行器 */
export class DAGExecutor {
  private nodes: Map<string, DAGNodeConfig> = new Map();
  private results: Map<string, AgentResult> = new Map();
  private status: Map<string, AgentStatus> = new Map();
  private listeners: Array<(state: DAGState) => void> = [];

  constructor() {}

  /**
   * 添加节点
   */
  addNode(config: DAGNodeConfig): this {
    this.nodes.set(config.id, config);
    this.status.set(config.id, 'pending');
    return this;
  }

  /**
   * 添加状态变更监听器
   */
  onStateChange(listener: (state: DAGState) => void): this {
    this.listeners.push(listener);
    return this;
  }

  /**
   * 获取当前状态
   */
  getState(): DAGState {
    const nodes: DAGNode[] = Array.from(this.nodes.values()).map(config => ({
      id: config.id,
      name: config.name,
      agent: config.agent,
      dependencies: config.dependencies,
      status: this.status.get(config.id) || 'pending',
      result: this.results.get(config.id),
    }));

    const completedCount = nodes.filter(n => n.status === 'completed').length;
    const errorCount = nodes.filter(n => n.status === 'error').length;
    const totalPhases = this.calculatePhases();
    const currentPhase = this.getCurrentPhase();

    return {
      nodes,
      current_phase: currentPhase,
      total_phases: totalPhases,
      is_complete: completedCount + errorCount === nodes.length,
      error: errorCount > 0 ? this.getFirstError() : undefined,
    };
  }

  /**
   * 计算阶段数（基于依赖深度）
   */
  private calculatePhases(): number {
    const depths = new Map<string, number>();
    
    const getDepth = (nodeId: string): number => {
      if (depths.has(nodeId)) return depths.get(nodeId)!;
      
      const node = this.nodes.get(nodeId);
      if (!node || node.dependencies.length === 0) {
        depths.set(nodeId, 1);
        return 1;
      }
      
      const maxDepDep = Math.max(...node.dependencies.map(getDepth));
      const depth = maxDepDep + 1;
      depths.set(nodeId, depth);
      return depth;
    };

    this.nodes.forEach((_, id) => getDepth(id));
    return Math.max(...Array.from(depths.values()), 0);
  }

  /**
   * 获取当前阶段
   */
  private getCurrentPhase(): number {
    const depths = new Map<string, number>();
    
    const getDepth = (nodeId: string): number => {
      if (depths.has(nodeId)) return depths.get(nodeId)!;
      const node = this.nodes.get(nodeId);
      if (!node || node.dependencies.length === 0) {
        depths.set(nodeId, 1);
        return 1;
      }
      const maxDepDep = Math.max(...node.dependencies.map(getDepth));
      depths.set(nodeId, maxDepDep + 1);
      return maxDepDep + 1;
    };

    this.nodes.forEach((_, id) => getDepth(id));
    
    // 找到当前正在执行或待执行的最小阶段
    let minPendingPhase = Infinity;
    this.nodes.forEach((_, id) => {
      const status = this.status.get(id);
      if (status === 'pending' || status === 'running') {
        minPendingPhase = Math.min(minPendingPhase, depths.get(id) || 1);
      }
    });

    return minPendingPhase === Infinity ? this.calculatePhases() : minPendingPhase;
  }

  /**
   * 获取第一个错误
   */
  private getFirstError(): string | undefined {
    for (const [id, result] of this.results) {
      if (!result.success && result.error) {
        const node = this.nodes.get(id);
        return `${node?.name || id}: ${result.error}`;
      }
    }
    return undefined;
  }

  /**
   * 通知状态变更
   */
  private notifyStateChange(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * 检查节点是否可以执行
   */
  private canExecute(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    // 检查自身状态
    if (this.status.get(nodeId) !== 'pending') return false;
    
    // 检查所有依赖是否完成
    for (const depId of node.dependencies) {
      const depStatus = this.status.get(depId);
      if (depStatus !== 'completed') return false;
    }
    
    return true;
  }

  /**
   * 获取节点的输入（来自依赖的输出）
   */
  private getNodeInputs(nodeId: string): Record<string, any> {
    const node = this.nodes.get(nodeId);
    if (!node) return {};
    
    const inputs: Record<string, any> = {};
    for (const depId of node.dependencies) {
      const result = this.results.get(depId);
      if (result?.success && result.data) {
        inputs[depId] = result.data;
      }
    }
    return inputs;
  }

  /**
   * 执行单个节点
   */
  private async executeNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    this.status.set(nodeId, 'running');
    this.notifyStateChange();

    try {
      const inputs = this.getNodeInputs(nodeId);
      console.log(`[DAG] 开始执行节点: ${node.name}`);
      
      const result = await node.execute(inputs);
      this.results.set(nodeId, result);
      this.status.set(nodeId, result.success ? 'completed' : 'error');
      
      console.log(`[DAG] 节点完成: ${node.name}, 成功: ${result.success}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.results.set(nodeId, { success: false, error: errorMessage });
      this.status.set(nodeId, 'error');
      console.error(`[DAG] 节点失败: ${node.name}`, error);
    }

    this.notifyStateChange();
  }

  /**
   * 执行DAG
   */
  async execute(initialInput?: any): Promise<DAGState> {
    console.log('[DAG] 开始执行');
    
    // 如果有初始输入，存储为特殊结果
    if (initialInput !== undefined) {
      this.results.set('__input__', { success: true, data: initialInput });
    }

    // 循环直到所有节点完成或出错
    while (true) {
      // 找出所有可以执行的节点
      const executableNodes: string[] = [];
      this.nodes.forEach((_, id) => {
        if (this.canExecute(id)) {
          executableNodes.push(id);
        }
      });

      // 如果没有可执行的节点，结束
      if (executableNodes.length === 0) break;

      // 并行执行所有可执行节点
      console.log(`[DAG] 并行执行节点: ${executableNodes.join(', ')}`);
      await Promise.all(executableNodes.map(id => this.executeNode(id)));

      // 检查是否有错误（可选：遇到错误立即停止）
      const hasError = Array.from(this.status.values()).some(s => s === 'error');
      if (hasError) {
        console.log('[DAG] 检测到错误，停止执行');
        break;
      }
    }

    const finalState = this.getState();
    console.log('[DAG] 执行完成', finalState);
    return finalState;
  }

  /**
   * 获取所有结果
   */
  getResults(): Record<string, any> {
    const results: Record<string, any> = {};
    this.results.forEach((result, id) => {
      if (result.success && result.data) {
        results[id] = result.data;
      }
    });
    return results;
  }

  /**
   * 获取指定节点的结果
   */
  getNodeResult<T = any>(nodeId: string): T | undefined {
    const result = this.results.get(nodeId);
    return result?.success ? result.data : undefined;
  }

  /**
   * 重置执行器
   */
  reset(): void {
    this.results.clear();
    this.status.forEach((_, id) => this.status.set(id, 'pending'));
    this.notifyStateChange();
  }
}

/**
 * 创建JD解析DAG
 */
export function createJDParseDAG(): DAGExecutor {
  return new DAGExecutor();
}
