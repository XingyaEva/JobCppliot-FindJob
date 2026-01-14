/**
 * 简历解析 Agent
 * 将清洗后的简历文本提取为结构化数据，并生成能力标签
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { RESUME_PARSE_PROMPT } from '../core/prompt-templates';
import type { AgentResult, Resume } from '../types';

/** 解析输入 */
export interface ResumeParseInput {
  cleanedText: string;
  fileName?: string;  // 可选：文件名中提取的可能姓名，作为辅助信息
}

/** 解析输出（不含id等元数据） */
export interface ResumeParseOutput {
  basic_info: {
    name: string;
    contact: string;
    target_position: string;
  };
  education: Array<{
    school: string;
    major: string;
    degree: string;
    duration: string;
  }>;
  work_experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    role: string;
    duration: string;
    description: string;
    achievements: string[];
    tech_stack: string[];
  }>;
  skills: string[];
  ability_tags: {
    industry: string[];
    technology: string[];
    product: string[];
    capability: string[];
  };
}

// 使用优化后的 Prompt
const SYSTEM_PROMPT = RESUME_PARSE_PROMPT;

/**
 * 执行简历解析
 */
export async function executeResumeParse(
  input: ResumeParseInput
): Promise<AgentResult<ResumeParseOutput>> {
  const startTime = Date.now();

  try {
    console.log('[简历解析] 开始提取结构化信息');

    // 构建提示词，包含文件名提示（如果有）
    let userPrompt = `请将以下简历文本提取为结构化JSON，并生成能力标签。`;
    
    if (input.fileName && input.fileName.length >= 2) {
      userPrompt += `\n\n**文件名提示**：文件名为 "${input.fileName}"，其中可能包含姓名信息，请结合文档内容进行验证。`;
    }
    
    userPrompt += `\n\n${input.cleanedText}`;

    // 使用 resume-parse Agent 配置
    const response = await chat(
      SYSTEM_PROMPT,
      userPrompt,
      { agentId: 'resume-parse', jsonMode: true }
    );

    // 解析JSON响应
    const parsed = parseJsonResponse<ResumeParseOutput>(response);

    // 数据验证和默认值
    const result: ResumeParseOutput = {
      basic_info: {
        name: parsed.basic_info?.name || '未知',
        contact: parsed.basic_info?.contact || '',
        target_position: parsed.basic_info?.target_position || '',
      },
      education: Array.isArray(parsed.education) ? parsed.education : [],
      work_experience: Array.isArray(parsed.work_experience) ? parsed.work_experience : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects.map(p => ({
        name: p.name || '',
        role: p.role || '',
        duration: p.duration || '',
        description: p.description || '',
        achievements: Array.isArray(p.achievements) ? p.achievements : [],
        tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack : [],
      })) : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      ability_tags: {
        industry: Array.isArray(parsed.ability_tags?.industry) ? parsed.ability_tags.industry : [],
        technology: Array.isArray(parsed.ability_tags?.technology) ? parsed.ability_tags.technology : [],
        product: Array.isArray(parsed.ability_tags?.product) ? parsed.ability_tags.product : [],
        capability: Array.isArray(parsed.ability_tags?.capability) ? parsed.ability_tags.capability : [],
      },
    };

    console.log('[简历解析] 提取完成:', result.basic_info.name);

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[简历解析] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
