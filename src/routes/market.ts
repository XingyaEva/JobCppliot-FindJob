/**
 * Market Research API Routes
 */

import { Hono } from 'hono';
import { runMarketResearch } from '../agents/market-research';
import { callLLM } from '../core/llm/client';

const marketRoutes = new Hono();

/**
 * POST /research - Run market research for a job query
 */
marketRoutes.post('/research', async (c) => {
  try {
    const { query } = await c.req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return c.json({ success: false, error: '请输入搜索关键词' }, 400);
    }

    console.log(`[Market API] Research request: ${query}`);

    const data = await runMarketResearch(query.trim());

    return c.json({
      success: true,
      data: data,
    });

  } catch (error: any) {
    console.error('[Market API] Research failed:', error);
    return c.json({
      success: false,
      error: error.message || '市场调研失败',
    }, 500);
  }
});

/**
 * POST /chat - Contextual chat for market exploration
 */
marketRoutes.post('/chat', async (c) => {
  try {
    const { message, context } = await c.req.json();

    if (!message) {
      return c.json({ success: false, error: '消息不能为空' }, 400);
    }

    // Determine role based on context
    let roleName = '市场分析师';
    let systemContext = '';

    if (context?.phase === 'explore' && !context?.searchQuery) {
      roleName = '职业顾问';
      systemContext = `你是一位资深的职业规划顾问，正在帮助用户探索职业方向。
用户还没有明确的求职目标，你需要通过对话了解他们的背景、兴趣和优势，给出建议。
保持亲切、专业的语气，像一位经验丰富的导师。`;
    } else if (context?.focusedJob) {
      roleName = '市场分析师';
      systemContext = `你是一位资深的就业市场分析师，正在帮助用户分析具体岗位。
当前关注的岗位: ${JSON.stringify(context.focusedJob)}
${context.marketOverview ? '市场概览: ' + JSON.stringify(context.marketOverview) : ''}
基于岗位信息给出专业分析和建议。`;
    } else if (context?.searchQuery) {
      roleName = '市场分析师';
      systemContext = `你是一位资深的就业市场分析师，正在帮用户分析「${context.searchQuery}」的就业市场。
${context.marketOverview ? '已有市场数据: ' + JSON.stringify(context.marketOverview) : ''}
基于市场数据和你的专业知识回答用户问题。`;
    } else {
      roleName = '职业顾问';
      systemContext = `你是一位资深的职业规划顾问，帮助用户进行职业探索和规划。
保持亲切专业的语气。`;
    }

    const fullSystem = `${systemContext}

回答要求：
1. 简洁有力，每次回复控制在150字以内
2. 使用HTML格式（<b>加粗</b>、<br>换行），不要用markdown
3. 适当给出1-3个后续建议方向
4. 如果用户的问题需要搜索数据支持，告知可以在搜索框输入关键词获取最新市场数据`;

    const response = await callLLM({
      messages: [
        { role: 'system', content: fullSystem },
        { role: 'user', content: message },
      ],
      agentId: 'market-research',
      jsonMode: false,
    });

    return c.json({
      success: true,
      reply: response.content,
      roleName: roleName,
      actions: [],
    });

  } catch (error: any) {
    console.error('[Market API] Chat failed:', error);
    return c.json({
      success: false,
      error: error.message || '对话失败',
    }, 500);
  }
});

export default marketRoutes;
