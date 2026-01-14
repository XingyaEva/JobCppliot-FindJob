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
 * 清理和格式化 MinerU Markdown 输出
 * 解决标题混乱、段落不分隔等问题
 */
function cleanMarkdown(markdown: string): string {
  let cleaned = markdown;
  
  // 1. 移除图片标记（不影响解析）
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '');
  
  // 2. 规范标题格式：确保标题前后有空行
  cleaned = cleaned.replace(/^(#{1,6}\s+.+)$/gm, '\n$1\n');
  
  // 3. 分离混在一起的标题和内容
  // 例如："2024.08-至今\n\n采购管理实施顾问冶金行业事业部" 
  // 应该分开显示公司、职位、部门
  cleaned = cleaned.replace(/^([0-9]{4}\.[0-9]{1,2}\s*-\s*.+)$/gm, '\n**时间**: $1\n');
  
  // 4. 识别并标记职位/角色信息（通常在时间后面）
  // 例如："采购管理实施顾问冶金行业事业部"
  cleaned = cleaned.replace(/^([^#\n]+顾问|[^#\n]+经理|[^#\n]+专员|[^#\n]+实习生)(.*)$/gm, '**职位**: $1 $2\n');
  
  // 5. 识别并标记地点信息（城市名）
  cleaned = cleaned.replace(/^(北京|上海|广州|深圳|杭州|成都|南京|武汉|西安|苏州|厦门|雅加达|德州|枣庄|张家港|济南|青岛|郑州|长沙|重庆|天津)$/gm, '**地点**: $1\n');
  
  // 6. 合并多余的空行（最多保留2个换行）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // 7. 确保关键字段有明确标识
  cleaned = cleaned.replace(/^([^:\n]+)：([^:\n]+)$/gm, '- **$1**: $2');
  
  return cleaned.trim();
}

/**
 * 执行简历解析
 */
export async function executeResumeParse(
  input: ResumeParseInput
): Promise<AgentResult<ResumeParseOutput>> {
  const startTime = Date.now();

  try {
    console.log('[简历解析] 开始提取结构化信息');

    // 清理Markdown格式，提升LLM理解能力
    const cleanedContent = cleanMarkdown(input.cleanedText);
    console.log('[简历解析] Markdown清理完成，原始长度:', input.cleanedText.length, '清理后:', cleanedContent.length);

    // 构建提示词，包含文件名提示（如果有）
    let userPrompt = `请将以下简历文本提取为结构化JSON，并生成能力标签。

**重要提示**：
1. 姓名通常在文档最开头（第一行或前几行）
2. 完整提取所有工作经历的详细描述，不要遗漏任何内容
3. 项目经验如果在工作经历中，也需要单独提取到projects数组
4. 每个工作经历的description字段应该包含完整的职责和成果描述`;
    
    if (input.fileName && input.fileName.length >= 2) {
      userPrompt += `\n5. 文件名为 "${input.fileName}"，其中可能包含姓名，请优先验证`;
    }
    
    userPrompt += `\n\n简历内容：\n\n${cleanedContent}`;

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
