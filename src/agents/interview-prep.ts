/**
 * 面试准备 Agent
 * 生成自我介绍、项目推荐、面试题目和PREP回答
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { INTERVIEW_PREP_PROMPT } from '../core/prompt-templates';
import type { AgentResult, Resume, Match } from '../types';
import type { CompanyAnalyzeOutput } from './company-analyze';

/** 面试准备输入 */
export interface InterviewPrepInput {
  job: {
    title: string;
    company: string;
    structured_jd: {
      responsibilities: string[];
      requirements: string[];
      preferred: string[];
    };
  };
  resume: {
    basic_info: Resume['basic_info'];
    education: Resume['education'];
    work_experience: Resume['work_experience'];
    projects: Resume['projects'];
    skills: Resume['skills'];
    ability_tags: Resume['ability_tags'];
  };
  match: {
    match_level: string;
    match_score: number;
    strengths: string[];
    gaps: string[];
  };
  company_analysis: CompanyAnalyzeOutput;
}

/** PREP结构回答 */
export interface PREPAnswer {
  point: string;           // 观点/结论
  reason: string;          // 原因
  example: string;         // 例子/证据
  point_reiterate: string; // 重申观点
}

/** 面试准备输出 */
export interface InterviewPrepOutput {
  self_introduction: {
    version_1min: string;    // 1分钟版本
    version_2min: string;    // 2分钟版本
    key_points: string[];    // 关键亮点
    delivery_tips: string[]; // 表达建议
  };
  project_recommendations: Array<{
    project_name: string;
    match_reason: string;         // 为什么推荐这个项目
    focus_points: string[];       // 讲述侧重点
    expected_questions: string[]; // 可能追问
    story_outline: string;        // 故事大纲
  }>;
  interview_questions: {
    about_you: Array<{            // 关于你
      question: string;
      category: string;           // 分类：经历/能力/性格
      prep_answer: PREPAnswer;
    }>;
    about_company: Array<{        // 关于他（公司/岗位）
      question: string;
      category: string;           // 分类：理解/动机/规划
      prep_answer: PREPAnswer;
    }>;
    about_future: Array<{         // 关于未来
      question: string;
      category: string;           // 分类：职业规划/行业趋势/个人成长
      prep_answer: PREPAnswer;
    }>;
  };
  overall_strategy: {
    impression_goal: string;       // 希望留下的印象
    key_messages: string[];        // 核心信息点
    avoid_topics: string[];        // 避免的话题
    closing_questions: string[];   // 反问面试官的问题
  };
}

// 使用优化后的 Prompt
const SYSTEM_PROMPT = INTERVIEW_PREP_PROMPT;

const SYSTEM_PROMPT_LEGACY = `你是一个资深的面试教练，擅长帮助求职者准备面试。你需要根据岗位要求、简历内容和匹配分析，生成个性化的面试准备材料。

## 任务
生成完整的面试准备材料，包括：
1. 自我介绍（1分钟和2分钟版本）
2. 项目推荐（1-2个最匹配的项目）
3. 面试题目预测和PREP回答
4. 整体面试策略

## 自我介绍撰写原则
- **1分钟版本**：开场+核心经历+求职动机，150-200字
- **2分钟版本**：开场+核心经历+亮点项目+求职动机+收尾，300-400字
- 突出与目标岗位的匹配点
- 使用数字量化成果
- 避免"我觉得"等弱化表达

## 项目推荐原则
- 选择与目标岗位最相关的1-2个项目
- 提供STAR法则的讲述框架
- 预测面试官可能的追问
- 准备可量化的成果数据

## 面试题目分类

### 关于你（about_you）
- 经历类：过去做过什么
- 能力类：擅长什么
- 性格类：是什么样的人

### 关于他（about_company）
- 理解类：对公司/产品/岗位的理解
- 动机类：为什么选择这里
- 规划类：来了想做什么

### 关于未来（about_future）
- 职业规划类：未来3-5年规划
- 行业趋势类：对行业的看法
- 个人成长类：想学习提升什么

## PREP回答结构
- **P**oint（观点）：直接回答问题，给出明确立场
- **R**eason（原因）：解释为什么这么认为
- **E**xample（例子）：用具体案例支撑
- **P**oint（重申）：总结强化观点

## 输出 JSON Schema
{
  "self_introduction": {
    "version_1min": "1分钟自我介绍文本",
    "version_2min": "2分钟自我介绍文本",
    "key_points": ["亮点1", "亮点2"],
    "delivery_tips": ["表达建议1", "表达建议2"]
  },
  "project_recommendations": [
    {
      "project_name": "项目名称",
      "match_reason": "推荐原因",
      "focus_points": ["侧重点1", "侧重点2"],
      "expected_questions": ["追问1", "追问2"],
      "story_outline": "STAR故事大纲"
    }
  ],
  "interview_questions": {
    "about_you": [
      {
        "question": "问题",
        "category": "经历/能力/性格",
        "prep_answer": {
          "point": "观点",
          "reason": "原因",
          "example": "例子",
          "point_reiterate": "重申"
        }
      }
    ],
    "about_company": [...],
    "about_future": [...]
  },
  "overall_strategy": {
    "impression_goal": "希望留下的印象",
    "key_messages": ["核心信息1", "核心信息2"],
    "avoid_topics": ["避免话题1"],
    "closing_questions": ["反问1", "反问2"]
  }
}

## 注意事项
- 自我介绍要自然流畅，像真人说话
- PREP回答要具体，避免空泛
- 例子要来自简历中的真实经历
- 每类面试题生成2-3个最关键的问题
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行面试准备
 */
export async function executeInterviewPrep(
  input: InterviewPrepInput
): Promise<AgentResult<InterviewPrepOutput>> {
  const startTime = Date.now();

  try {
    console.log('[面试准备] 开始生成面试准备材料');

    // 构建用户消息
    const userMessage = `请为以下求职者生成面试准备材料：

## 目标岗位
- 岗位：${input.job.title}
- 公司：${input.job.company}

### 岗位职责
${input.job.structured_jd.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### 岗位要求
${input.job.structured_jd.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## 求职者简历

### 基本信息
- 姓名：${input.resume.basic_info.name}
- 目标岗位：${input.resume.basic_info.target_position || '未指定'}

### 教育背景
${input.resume.education.map(e => `- ${e.school} | ${e.major} | ${e.degree} | ${e.duration}`).join('\n') || '无'}

### 工作经历
${input.resume.work_experience.map(w => `**${w.company} | ${w.position} | ${w.duration}**
${w.description}`).join('\n\n') || '无'}

### 项目经历
${input.resume.projects.map(p => `**${p.name}** | ${p.role} | ${p.duration}
描述：${p.description}
成果：${p.achievements.join('、') || '无'}
技术：${p.tech_stack.join('、') || '无'}`).join('\n\n') || '无'}

### 技能
${input.resume.skills.join('、') || '无'}

### 能力标签
- 行业：${input.resume.ability_tags.industry.join('、') || '无'}
- 技术：${input.resume.ability_tags.technology.join('、') || '无'}
- 产品：${input.resume.ability_tags.product.join('、') || '无'}
- 能力：${input.resume.ability_tags.capability.join('、') || '无'}

---

## 匹配分析结果
- 匹配度：${input.match.match_level} (${input.match.match_score}分)
- 优势：${input.match.strengths.join('、') || '无'}
- 差距：${input.match.gaps.join('、') || '无'}

---

## 公司分析结果
- 公司：${input.company_analysis.company_profile.name}
- 行业：${input.company_analysis.company_profile.industry}
- 阶段：${input.company_analysis.company_profile.stage}
- 业务模式：${input.company_analysis.company_profile.business_model}
- AI重点：${input.company_analysis.ai_scenarios.role_ai_focus}
- 公司文化：${input.company_analysis.interview_insights.company_culture}
- 面试建议：${input.company_analysis.interview_insights.interview_tips.join('；')}`;

    // 使用 interview-prep Agent 配置（启用联网搜索）
    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { agentId: 'interview-prep', jsonMode: true }
    );

    // 解析JSON响应
    const prep = parseJsonResponse<InterviewPrepOutput>(response);

    // 数据验证和默认值
    const result: InterviewPrepOutput = {
      self_introduction: {
        version_1min: prep.self_introduction?.version_1min || '',
        version_2min: prep.self_introduction?.version_2min || '',
        key_points: Array.isArray(prep.self_introduction?.key_points)
          ? prep.self_introduction.key_points : [],
        delivery_tips: Array.isArray(prep.self_introduction?.delivery_tips)
          ? prep.self_introduction.delivery_tips : [],
      },
      project_recommendations: Array.isArray(prep.project_recommendations)
        ? prep.project_recommendations.map(p => ({
            project_name: p.project_name || '',
            match_reason: p.match_reason || '',
            focus_points: Array.isArray(p.focus_points) ? p.focus_points : [],
            expected_questions: Array.isArray(p.expected_questions) ? p.expected_questions : [],
            story_outline: p.story_outline || '',
          }))
        : [],
      interview_questions: {
        about_you: Array.isArray(prep.interview_questions?.about_you)
          ? prep.interview_questions.about_you.map(q => ({
              question: q.question || '',
              category: q.category || '经历',
              prep_answer: {
                point: q.prep_answer?.point || '',
                reason: q.prep_answer?.reason || '',
                example: q.prep_answer?.example || '',
                point_reiterate: q.prep_answer?.point_reiterate || '',
              },
            }))
          : [],
        about_company: Array.isArray(prep.interview_questions?.about_company)
          ? prep.interview_questions.about_company.map(q => ({
              question: q.question || '',
              category: q.category || '理解',
              prep_answer: {
                point: q.prep_answer?.point || '',
                reason: q.prep_answer?.reason || '',
                example: q.prep_answer?.example || '',
                point_reiterate: q.prep_answer?.point_reiterate || '',
              },
            }))
          : [],
        about_future: Array.isArray(prep.interview_questions?.about_future)
          ? prep.interview_questions.about_future.map(q => ({
              question: q.question || '',
              category: q.category || '职业规划',
              prep_answer: {
                point: q.prep_answer?.point || '',
                reason: q.prep_answer?.reason || '',
                example: q.prep_answer?.example || '',
                point_reiterate: q.prep_answer?.point_reiterate || '',
              },
            }))
          : [],
      },
      overall_strategy: {
        impression_goal: prep.overall_strategy?.impression_goal || '',
        key_messages: Array.isArray(prep.overall_strategy?.key_messages)
          ? prep.overall_strategy.key_messages : [],
        avoid_topics: Array.isArray(prep.overall_strategy?.avoid_topics)
          ? prep.overall_strategy.avoid_topics : [],
        closing_questions: Array.isArray(prep.overall_strategy?.closing_questions)
          ? prep.overall_strategy.closing_questions : [],
      },
    };

    console.log('[面试准备] 生成完成');

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[面试准备] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
