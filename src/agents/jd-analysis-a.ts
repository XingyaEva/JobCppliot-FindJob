/**
 * A 维度分析 Agent
 * 分析岗位定位：技术栈、产品类型、业务领域、团队阶段
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import type { AgentResult, StructuredJD, AAnalysis } from '../types';

/** A维度分析输入 */
export interface AAnalysisInput {
  structuredJD: StructuredJD;
  rawText: string;
}

// 系统提示词
const SYSTEM_PROMPT = `你是一个资深的招聘分析专家，擅长从岗位描述中提取关键信息并进行深度分析。

## 任务
对岗位描述进行A维度分析（岗位定位），包含以下4个子维度：

### A1 - 技术栈分析
分析JD中提到的技术关键词，判断技术密度。
- 提取所有技术相关关键词（编程语言、框架、工具、方法论等）
- 判断技术密度：高（10+个技术词）、中（5-10个）、低（<5个）
- 总结技术栈特点

### A2 - 产品类型判断
判断这个岗位所在的产品类型。
- 类型选项：ToB、ToC、ToG、平台型、工具型、数据产品、AI产品、其他
- 给出判断依据

### A3 - 业务领域分析
分析岗位所属的业务领域。
- 识别主要业务领域（如金融、电商、医疗、教育等）
- 识别次要/关联领域
- 总结领域特点

### A4 - 团队阶段判断
判断团队/产品所处的发展阶段。
- 阶段选项：初创期(0-1)、成长期(1-N)、成熟期、转型期
- 提供判断依据（从JD中找证据）
- 总结阶段特点

## 输出JSON Schema
{
  "A1_tech_stack": {
    "keywords": ["关键词1", "关键词2", ...],
    "density": "高/中/低",
    "summary": "人话总结，50字以内"
  },
  "A2_product_type": {
    "type": "产品类型",
    "reason": "判断依据，50字以内"
  },
  "A3_business_domain": {
    "primary": "主要业务领域",
    "secondary": ["次要领域1", "次要领域2"],
    "summary": "人话总结，50字以内"
  },
  "A4_team_stage": {
    "stage": "团队阶段",
    "evidence": "从JD中找到的证据",
    "summary": "人话总结，50字以内"
  }
}

## 注意事项
- 分析要基于JD原文，不要臆测
- summary字段用通俗易懂的语言，帮助求职者快速理解
- 如果某个维度信息不足，如实说明，不要编造
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行A维度分析
 */
export async function executeAAnalysis(
  input: AAnalysisInput
): Promise<AgentResult<AAnalysis>> {
  const startTime = Date.now();

  try {
    console.log('[A维度分析] 开始分析岗位定位');

    // 构建用户消息
    const userMessage = `请对以下岗位进行A维度分析：

## 岗位基本信息
- 岗位名称：${input.structuredJD.title}
- 公司：${input.structuredJD.company}
- 地点：${input.structuredJD.location}

## 岗位职责
${input.structuredJD.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 任职要求
${input.structuredJD.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 加分项
${input.structuredJD.preferred.length > 0 
  ? input.structuredJD.preferred.map((p, i) => `${i + 1}. ${p}`).join('\n')
  : '无'}

## 原始JD文本（供参考）
${input.rawText.substring(0, 2000)}`;

    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { model: MODELS.MEDIUM, jsonMode: true }
    );

    // 解析JSON响应
    const analysis = parseJsonResponse<AAnalysis>(response);

    // 数据验证和默认值
    const result: AAnalysis = {
      A1_tech_stack: {
        keywords: Array.isArray(analysis.A1_tech_stack?.keywords) 
          ? analysis.A1_tech_stack.keywords 
          : [],
        density: analysis.A1_tech_stack?.density || '中',
        summary: analysis.A1_tech_stack?.summary || '技术栈信息不足',
      },
      A2_product_type: {
        type: analysis.A2_product_type?.type || '未知',
        reason: analysis.A2_product_type?.reason || '信息不足',
      },
      A3_business_domain: {
        primary: analysis.A3_business_domain?.primary || '未知',
        secondary: Array.isArray(analysis.A3_business_domain?.secondary)
          ? analysis.A3_business_domain.secondary
          : [],
        summary: analysis.A3_business_domain?.summary || '业务领域信息不足',
      },
      A4_team_stage: {
        stage: analysis.A4_team_stage?.stage || '未知',
        evidence: analysis.A4_team_stage?.evidence || '信息不足',
        summary: analysis.A4_team_stage?.summary || '团队阶段信息不足',
      },
    };

    console.log('[A维度分析] 分析完成');

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[A维度分析] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
