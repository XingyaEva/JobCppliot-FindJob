/**
 * Interview Coach Agent
 * 
 * AI 面试教练，对用户的面试回答进行专业点评
 * - 支持基于 JD 的针对性点评
 * - 支持通用面试辅导
 * - 提供结构化反馈（必改项、优化建议、表达润色）
 */

import { callLLM } from '../core/llm/client';
import { AICoachFeedback, CoachRequest, CoachResponse } from '../types';

const AGENT_ID = 'interview-coach';

/**
 * 获取面试教练点评
 */
export async function getInterviewCoaching(request: CoachRequest): Promise<CoachResponse> {
  const { question, answer, mode, job_context } = request;
  
  // 构建上下文信息
  const contextInfo = mode === 'jd_based' && job_context 
    ? `
【目标岗位信息】
- 职位：${job_context.title}
- 公司：${job_context.company}
- 核心要求：${job_context.requirements.join('、')}

请结合以上岗位要求，给出针对性的点评和建议。`
    : '请从通用面试角度进行点评。';

  const prompt = `你是一位资深的面试教练，拥有丰富的招聘和候选人辅导经验。
请对以下面试问答进行专业点评。

${contextInfo}

【面试问题】
${question}

【候选人回答】
${answer}

请按以下 JSON 格式输出点评结果：

{
  "feedback": {
    "must_fix": ["必改项1 - 回答中存在的明显问题或错误，需要立即修正", "必改项2..."],
    "suggestions": ["优化建议1 - 可以加强的地方", "优化建议2..."],
    "polish": ["表达润色1 - 更专业或更有吸引力的表达方式", "表达润色2..."],
    "overall_score": 7,
    "highlights": ["亮点1 - 回答中做得好的地方", "亮点2..."],
    "improvement_direction": "整体改进方向的简要说明"
  },
  "improved_answer": "根据以上反馈优化后的完整回答示例（可选，如果原回答已经很好可以不提供）"
}

评分标准（1-10分）：
- 1-3分：回答有严重问题，需要完全重写
- 4-5分：回答勉强及格，需要较大改进
- 6-7分：回答合格，有优化空间
- 8-9分：回答优秀，小幅润色即可
- 10分：回答完美

点评要求：
1. must_fix：指出回答中的硬伤，如逻辑错误、与岗位要求相悖、态度问题等
2. suggestions：给出可操作的优化建议，帮助候选人提升回答质量
3. polish：提供更专业的表达方式或更有吸引力的措辞
4. highlights：肯定做得好的地方，增强候选人信心
5. improvement_direction：一句话总结最需要改进的方向

请确保输出有效的 JSON 格式。`;

  const response = await callLLM({
    agentId: AGENT_ID,
    messages: [{ role: 'user', content: prompt }],
  });

  // 解析响应
  try {
    // 提取 JSON
    let jsonStr = response.content || '';
    
    // 尝试提取 JSON 块
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // 尝试直接解析
      const startIndex = jsonStr.indexOf('{');
      const endIndex = jsonStr.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = jsonStr.slice(startIndex, endIndex + 1);
      }
    }
    
    const result = JSON.parse(jsonStr);
    
    return {
      feedback: {
        must_fix: result.feedback?.must_fix || [],
        suggestions: result.feedback?.suggestions || [],
        polish: result.feedback?.polish || [],
        overall_score: result.feedback?.overall_score || 5,
        highlights: result.feedback?.highlights || [],
        improvement_direction: result.feedback?.improvement_direction || '继续优化回答的结构和内容',
      },
      improved_answer: result.improved_answer,
    };
  } catch (error) {
    console.error('[InterviewCoach] Failed to parse response:', error);
    
    // 返回默认反馈
    return {
      feedback: {
        must_fix: ['AI 解析失败，请重试'],
        suggestions: ['建议使用 STAR 或 PREP 结构组织回答'],
        polish: [],
        overall_score: 0,
        highlights: [],
        improvement_direction: '请重新提交获取点评',
      },
    };
  }
}

/**
 * 批量点评多个问答
 */
export async function batchCoaching(
  requests: CoachRequest[]
): Promise<CoachResponse[]> {
  const results = await Promise.all(
    requests.map(req => getInterviewCoaching(req))
  );
  return results;
}

/**
 * 生成面试问题建议（基于JD）
 */
export async function suggestQuestions(
  jobTitle: string,
  company: string,
  requirements: string[],
  category?: string
): Promise<string[]> {
  const categoryHint = category 
    ? `请重点生成「${category}」类型的问题。` 
    : '';

  const prompt = `你是一位资深的招聘面试官。
请根据以下岗位信息，生成可能会被问到的面试问题。

【岗位信息】
- 职位：${jobTitle}
- 公司：${company}
- 核心要求：${requirements.join('、')}

${categoryHint}

请按以下 JSON 格式输出：

{
  "questions": [
    "面试问题1",
    "面试问题2",
    "面试问题3",
    "面试问题4",
    "面试问题5"
  ]
}

要求：
1. 问题应与岗位要求紧密相关
2. 包含不同类型的问题（技术/行为/情景等）
3. 问题应该是面试中高频出现的
4. 每个问题清晰明确

请确保输出有效的 JSON 格式。`;

  const response = await callLLM({
    agentId: AGENT_ID,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    let jsonStr = response.content || '';
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const startIndex = jsonStr.indexOf('{');
      const endIndex = jsonStr.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1) {
        jsonStr = jsonStr.slice(startIndex, endIndex + 1);
      }
    }
    
    const result = JSON.parse(jsonStr);
    return result.questions || [];
  } catch (error) {
    console.error('[InterviewCoach] Failed to parse questions:', error);
    return [];
  }
}
