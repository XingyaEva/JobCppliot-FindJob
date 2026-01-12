/**
 * JD 结构化 Agent
 * 将清洗后的JD文本提取为结构化数据
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import type { AgentResult, StructuredJD } from '../types';

/** 结构化输入 */
export interface JDStructureInput {
  cleanedText: string;
}

// 系统提示词
const SYSTEM_PROMPT = `你是一个专业的招聘信息分析专家。

## 任务
请将用户提供的岗位描述(JD)文本提取为结构化JSON格式。

## 输出JSON Schema
{
  "title": "岗位名称",
  "company": "公司名称",
  "location": "工作地点",
  "salary": "薪资范围",
  "responsibilities": ["岗位职责1", "岗位职责2", ...],
  "requirements": ["任职要求1", "任职要求2", ...],
  "preferred": ["加分项1", "加分项2", ...],
  "others": "其他补充信息"
}

## 提取规则
1. **title**: 提取明确的岗位名称，如"AI产品经理"、"高级后端工程师"
2. **company**: 提取公司名称，如果没有明确提到则填"未知"
3. **location**: 提取工作地点，可能包含城市、区域，如"北京-海淀"
4. **salary**: 提取薪资范围，如"25-50K·14薪"，没有则填"面议"
5. **responsibilities**: 提取"岗位职责"、"工作内容"等部分的条目
6. **requirements**: 提取"任职要求"、"岗位要求"、"必备条件"等部分的条目
7. **preferred**: 提取"加分项"、"优先考虑"、"有以下经验者优先"等条目
8. **others**: 其他未分类的重要信息，如福利待遇、团队介绍等

## 注意事项
- 每个条目保持原意，可适当精简
- 如果某个字段在JD中没有，使用空字符串或空数组
- 确保输出是有效的JSON格式
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行JD结构化
 */
export async function executeJDStructure(
  input: JDStructureInput
): Promise<AgentResult<StructuredJD>> {
  const startTime = Date.now();

  try {
    console.log('[JD结构化] 开始提取结构化信息');

    const response = await chat(
      SYSTEM_PROMPT,
      `请将以下JD文本提取为结构化JSON：\n\n${input.cleanedText}`,
      { model: MODELS.MEDIUM, jsonMode: true }
    );

    // 解析JSON响应
    const structured = parseJsonResponse<StructuredJD>(response);

    // 数据验证和默认值
    const result: StructuredJD = {
      title: structured.title || '未知岗位',
      company: structured.company || '未知公司',
      location: structured.location || '未知',
      salary: structured.salary || '面议',
      responsibilities: Array.isArray(structured.responsibilities) ? structured.responsibilities : [],
      requirements: Array.isArray(structured.requirements) ? structured.requirements : [],
      preferred: Array.isArray(structured.preferred) ? structured.preferred : [],
      others: structured.others || '',
    };

    console.log('[JD结构化] 提取完成:', result.title, '@', result.company);

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[JD结构化] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
