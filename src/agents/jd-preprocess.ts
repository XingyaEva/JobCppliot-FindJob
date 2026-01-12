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

// 图片识别 Prompt
const IMAGE_SYSTEM_PROMPT = `你是一个专业的文字识别专家。

## 任务
请识别图片中的招聘岗位描述(JD)文字内容，并完整输出。

## 要求
1. 完整识别图片中的所有文字内容
2. 保持原有的段落结构和层次
3. 区分"岗位职责"、"任职要求"、"加分项"等不同部分
4. 忽略与岗位描述无关的内容（如广告、导航栏等）
5. 如果图片中包含公司名称和岗位名称，请保留

## 输出格式
直接输出识别到的JD文本内容，保持原有格式。`;

const IMAGE_USER_PROMPT = `请识别这张招聘JD截图中的所有文字内容。`;

// 文本清洗 Prompt
const TEXT_SYSTEM_PROMPT = `你是一个专业的文本处理专家。

## 任务
请清洗和规范化用户提供的招聘岗位描述(JD)文本。

## 清洗规则
1. 去除多余的空白字符和换行
2. 修正明显的格式问题
3. 保持"岗位职责"、"任职要求"、"加分项"等结构
4. 去除无关内容（如"点击投递"、"分享"等操作提示）
5. 保留公司名称、岗位名称、薪资、地点等关键信息
6. 如果内容已经比较规范，可以直接返回原文

## 输出格式
直接输出清洗后的JD文本内容。`;

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
      cleanedText = await chatWithImage(
        IMAGE_SYSTEM_PROMPT,
        IMAGE_USER_PROMPT,
        input.imageUrl,
        { model: MODELS.VISION }
      );
    } else {
      // 文本模式：使用 qwen-turbo 进行清洗
      if (!input.content) {
        throw new Error('文本模式需要提供 content');
      }

      console.log('[JD预处理] 使用文本清洗模式');
      cleanedText = await chat(
        TEXT_SYSTEM_PROMPT,
        `请清洗以下JD文本：\n\n${input.content}`,
        { model: MODELS.FAST }
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
