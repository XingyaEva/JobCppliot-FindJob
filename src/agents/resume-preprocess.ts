/**
 * 简历预处理 Agent
 * 处理PDF/Word文件或文本输入，输出清洗后的简历文本
 */

import { chat, chatWithImage, MODELS } from '../core/api-client';
import type { AgentResult } from '../types';

/** 预处理输入 */
export interface ResumePreprocessInput {
  type: 'text' | 'file';
  content?: string;      // type=text 时的原始文本
  fileData?: string;     // type=file 时的 Base64 数据
  fileName?: string;     // 文件名（用于判断类型）
}

/** 预处理输出 */
export interface ResumePreprocessOutput {
  cleanedText: string;
  sourceType: 'text' | 'file';
}

// 图片/PDF识别 Prompt
const IMAGE_SYSTEM_PROMPT = `你是一个专业的简历识别专家。

## 任务
请识别图片中的简历内容，完整提取所有文字信息。

## 要求
1. 完整识别简历中的所有内容
2. 保持原有的结构和层次（基本信息、教育背景、工作经历、项目经历、技能等）
3. 准确识别姓名、联系方式、学校、公司、职位等关键信息
4. 保留项目描述、工作职责、成果数据等详细内容

## 输出格式
直接输出识别到的简历文本内容，保持原有结构。`;

// 文本清洗 Prompt
const TEXT_SYSTEM_PROMPT = `你是一个专业的简历处理专家。

## 任务
请清洗和规范化用户提供的简历文本。

## 清洗规则
1. 去除多余的空白字符和换行
2. 修正明显的格式问题
3. 保持简历的结构（基本信息、教育背景、工作经历、项目经历、技能等）
4. 去除无关内容（如页眉页脚、水印文字等）
5. 保留所有关键信息

## 输出格式
直接输出清洗后的简历文本内容。`;

/**
 * 执行简历预处理
 */
export async function executeResumePreprocess(
  input: ResumePreprocessInput
): Promise<AgentResult<ResumePreprocessOutput>> {
  const startTime = Date.now();

  try {
    let cleanedText: string;

    if (input.type === 'file') {
      // 文件模式：使用 gpt-4o 进行识别
      if (!input.fileData) {
        throw new Error('文件模式需要提供 fileData');
      }

      console.log('[简历预处理] 使用文件识别模式');
      
      // 构建图片URL（Base64格式）
      const mimeType = input.fileName?.toLowerCase().endsWith('.pdf') 
        ? 'application/pdf' 
        : 'image/png';
      const imageUrl = `data:${mimeType};base64,${input.fileData}`;

      // 使用 resume-parse-image Agent 配置
      cleanedText = await chatWithImage(
        IMAGE_SYSTEM_PROMPT,
        '请识别这份简历中的所有内容。',
        imageUrl,
        { agentId: 'resume-parse-image' }
      );
    } else {
      // 文本模式：使用 qwen-turbo 进行清洗
      if (!input.content) {
        throw new Error('文本模式需要提供 content');
      }

      console.log('[简历预处理] 使用文本清洗模式');
      // 使用 jd-preprocess Agent 配置 (快速文本清洗)
      cleanedText = await chat(
        TEXT_SYSTEM_PROMPT,
        `请清洗以下简历文本：\n\n${input.content}`,
        { agentId: 'jd-preprocess' }
      );
    }

    // 基本清洗
    cleanedText = cleanedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error('识别或清洗后的简历内容过短，请检查输入');
    }

    return {
      success: true,
      data: {
        cleanedText,
        sourceType: input.type,
      },
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[简历预处理] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
