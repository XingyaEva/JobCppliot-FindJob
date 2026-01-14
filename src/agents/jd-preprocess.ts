/**
 * JD 预处理 Agent
 * 图片: 使用 gpt-4o 进行 OCR 识别
 * 文本: 使用 qwen-turbo 进行文本清洗
 */

import { chat, chatWithImage, MODELS } from '../core/api-client';
import type { AgentResult } from '../types';

/** 预处理输入 */
export interface JDPreprocessInput {
  type: 'image' | 'text';
  content?: string;      // type=text 时的原始文本
  imageUrl?: string;     // type=image 时的图片URL
}

/** 预处理输出 */
export interface JDPreprocessOutput {
  cleanedText: string;   // 清洗后的JD文本
  sourceType: 'image' | 'text';
}

import { JD_PREPROCESS_PROMPT_IMAGE, JD_PREPROCESS_PROMPT_TEXT } from '../core/prompt-templates';

// 使用优化后的 Prompt
const IMAGE_SYSTEM_PROMPT = JD_PREPROCESS_PROMPT_IMAGE;

const IMAGE_USER_PROMPT = `请识别这张招聘JD截图中的所有文字内容。`;
const TEXT_SYSTEM_PROMPT = JD_PREPROCESS_PROMPT_TEXT;

/**
 * 执行JD预处理
 */
export async function executeJDPreprocess(
  input: JDPreprocessInput
): Promise<AgentResult<JDPreprocessOutput>> {
  const startTime = Date.now();

  try {
    let cleanedText: string;

    if (input.type === 'image') {
      // 图片模式：使用 gpt-4o 进行 OCR
      if (!input.imageUrl) {
        throw new Error('图片模式需要提供 imageUrl');
      }

      console.log('[JD预处理] 使用图片识别模式');
      // 使用 jd-preprocess-image Agent 配置
      cleanedText = await chatWithImage(
        IMAGE_SYSTEM_PROMPT,
        IMAGE_USER_PROMPT,
        input.imageUrl,
        { agentId: 'jd-preprocess-image' }
      );
    } else {
      // 文本模式：使用 qwen-turbo 进行清洗
      if (!input.content) {
        throw new Error('文本模式需要提供 content');
      }

      console.log('[JD预处理] 使用文本清洗模式');
      // 使用 jd-preprocess Agent 配置
      cleanedText = await chat(
        TEXT_SYSTEM_PROMPT,
        `请清洗以下JD文本：\n\n${input.content}`,
        { agentId: 'jd-preprocess' }
      );
    }

    // 基本清洗
    cleanedText = cleanedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error('识别或清洗后的文本内容过短，请检查输入');
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
    console.error('[JD预处理] 执行失败:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
