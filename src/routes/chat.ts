/**
 * 全局对话 Agent 路由
 * 
 * POST /api/chat - SSE 流式对话
 * 
 * 使用百炼 qwen-plus，支持上下文感知和联网搜索
 */

import { Hono } from 'hono';
import { getAgentConfig, getAPIConfig } from '../core/llm/config';

const chatRoutes = new Hono();

/** 页面上下文映射 */
const PAGE_CONTEXTS: Record<string, { label: string; description: string; capabilities: string }> = {
  '/': {
    label: '首页',
    description: '用户在首页查看求职整体状态和冥想式引导界面',
    capabilities: '分析求职进度、给出今日建议、规划下一步行动',
  },
  '/opportunities': {
    label: '机会探索',
    description: '用户在浏览和分析求职机会，包括岗位和公司信息',
    capabilities: '分析岗位JD、评估匹配度、比较不同机会、给出投递建议',
  },
  '/assets': {
    label: '资产管理',
    description: '用户在管理求职资产，包括简历、项目素材和成就证据',
    capabilities: '优化简历表达、提取STAR素材、补充成就证据、建议简历结构调整',
  },
  '/interviews': {
    label: '面试准备',
    description: '用户在准备面试，包括题库练习、模拟面试和复盘',
    capabilities: '生成面试题目、模拟面试对话、点评回答质量、制定准备计划',
  },
  '/decisions': {
    label: 'Offer决策',
    description: '用户在进行Offer对比和决策分析',
    capabilities: '对比Offer条件、薪资谈判建议、分析长期职业发展、给出选择建议',
  },
  '/growth': {
    label: '技能成长',
    description: '用户在管理技能提升和学习计划',
    capabilities: '分析技能差距、推荐学习路径、制定周学习计划、评估成长进度',
  },
  '/monitor': {
    label: '数据监控',
    description: '用户在查看求职数据驾驶舱和关键指标',
    capabilities: '解读数据趋势、分析异常指标、优化投递策略、评估求职效率',
  },
};

/** 构建 system prompt */
function buildSystemPrompt(page: string, pageData?: any): string {
  const ctx = PAGE_CONTEXTS[page] || PAGE_CONTEXTS['/'];

  let prompt = `你是 FindJob AI 求职助手，一个专业、温暖、实用的求职全流程AI顾问。

## 你的性格
- 专业但不生硬，像一个经验丰富的职业顾问朋友
- 回答简洁有重点，避免空洞的套话
- 善于给出具体可执行的建议
- 适当使用 emoji 让对话更轻松

## 当前上下文
用户正在「${ctx.label}」页面。${ctx.description}。

## 你的能力
在当前页面，你可以帮助用户：${ctx.capabilities}。

## 回答要求
1. 用中文回答
2. 回答控制在 200 字以内，除非用户要求详细展开
3. 给建议时用编号列表，方便用户执行
4. 如果用户问的内容超出当前页面范围，友好引导到对应页面
5. 不要编造数据，如果不确定就说明`;

  // 注入页面数据上下文
  if (pageData) {
    if (pageData.resumeName) {
      prompt += `\n\n## 用户数据\n当前简历：${pageData.resumeName}`;
      if (pageData.resumeSections) {
        prompt += `\n简历包含模块：${pageData.resumeSections}`;
      }
    }
    if (pageData.jobTitle) {
      prompt += `\n当前关注岗位：${pageData.jobTitle}`;
    }
    if (pageData.skills) {
      prompt += `\n用户技能：${pageData.skills}`;
    }
  }

  return prompt;
}

/**
 * POST /api/chat - 流式对话
 */
chatRoutes.post('/chat', async (c) => {
  try {
    const body = await c.req.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return c.json({ success: false, error: '消息不能为空' }, 400);
    }

    // 获取 chat-agent 配置
    const config = getAgentConfig('chat-agent');
    const apiConfig = getAPIConfig(config.provider);

    // 构建完整消息列表
    const page = context?.page || '/';
    const systemPrompt = buildSystemPrompt(page, context?.pageData);

    // 限制历史消息数量（最近 20 条）
    const recentMessages = messages.slice(-20);

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages,
    ];

    console.log(`[Chat Agent] 对话请求 | 页面: ${page} | 消息数: ${recentMessages.length} | 模型: ${config.model}`);

    // 调用百炼 SSE 流式接口
    const requestBody: any = {
      model: config.model,
      messages: fullMessages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 4096,
      stream: true,
    };

    if (config.enableSearch) {
      requestBody.enable_search = true;
    }

    const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Chat Agent] API 错误: ${response.status} ${errorText}`);
      return c.json({ success: false, error: `模型调用失败: ${response.status}` }, 500);
    }

    // 转发 SSE 流
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 异步处理流
    (async () => {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') {
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
              // 检查是否结束
              if (parsed.choices?.[0]?.finish_reason === 'stop') {
                await writer.write(encoder.encode('data: [DONE]\n\n'));
              }
            } catch (e) {
              // 跳过无法解析的行
            }
          }
        }
      } catch (err) {
        console.error('[Chat Agent] 流处理错误:', err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Chat Agent] 错误:', error);
    return c.json({ success: false, error: '对话服务异常' }, 500);
  }
});

export default chatRoutes;
