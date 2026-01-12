/**
 * 公司分析 Agent
 * ToB/ToC 分流 + AI场景分析 + 竞品分析
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import { COMPANY_ANALYZE_PROMPT } from '../core/prompt-templates';
import type { AgentResult, AAnalysis, BAnalysis } from '../types';

/** 公司分析输入 */
export interface CompanyAnalyzeInput {
  company: string;
  title: string;
  structured_jd: {
    responsibilities: string[];
    requirements: string[];
    preferred: string[];
  };
  a_analysis: AAnalysis;
  b_analysis: BAnalysis;
}

/** 公司分析输出 */
export interface CompanyAnalyzeOutput {
  company_profile: {
    name: string;
    industry: string;
    stage: string;           // 初创/成长/成熟
    scale: string;           // 规模描述
    main_products: string[]; // 主要产品
    business_model: string;  // ToB/ToC/双边
  };
  ai_scenarios: {
    current_ai_usage: string[];           // 当前AI应用场景
    potential_ai_opportunities: string[]; // 潜在AI机会
    industry_ai_trends: string[];         // 行业AI趋势
    role_ai_focus: string;                // 该岗位的AI工作重点
  };
  competitor_analysis: {
    direct_competitors: Array<{
      name: string;
      description: string;
    }>;
    competitive_position: string;
    differentiation_points: string[];
  };
  interview_insights: {
    company_culture: string;
    key_challenges: string[];
    growth_opportunities: string[];
    interview_tips: string[];
  };
  summary: string; // 一句话总结
}

// 使用优化后的 Prompt
const SYSTEM_PROMPT = COMPANY_ANALYZE_PROMPT;

const SYSTEM_PROMPT_LEGACY = `你是一个资深的行业分析师和求职顾问，擅长分析公司背景、AI应用场景和竞争格局。

## 任务
基于提供的公司名称和岗位信息，进行全面的公司分析，帮助求职者了解公司背景和面试准备方向。

## 分析框架

### 1. 公司画像
- 判断公司所属行业和发展阶段
- 分析主要产品和业务模式（ToB/ToC/平台）
- 评估公司规模和市场地位

### 2. AI场景分析（重点）
- 分析该公司当前的AI应用场景
- 挖掘该岗位可能涉及的AI工作内容
- 结合行业趋势预测AI发展方向
- 给出该岗位的AI工作重点

### 3. 竞品分析
- 识别主要竞争对手（2-3个）
- 分析公司的竞争优势和差异化
- 了解行业竞争格局

### 4. 面试洞察
- 推测公司文化和价值观
- 分析该岗位可能面临的挑战
- 挖掘成长和发展机会
- 给出面试准备建议

## 输出 JSON Schema
{
  "company_profile": {
    "name": "公司名称",
    "industry": "所属行业",
    "stage": "初创期/成长期/成熟期",
    "scale": "规模描述（如：大厂/独角兽/中型企业）",
    "main_products": ["产品1", "产品2"],
    "business_model": "ToB/ToC/ToB+ToC/平台型"
  },
  "ai_scenarios": {
    "current_ai_usage": ["AI应用场景1", "AI应用场景2"],
    "potential_ai_opportunities": ["AI机会1", "AI机会2"],
    "industry_ai_trends": ["趋势1", "趋势2"],
    "role_ai_focus": "该岗位AI工作重点描述"
  },
  "competitor_analysis": {
    "direct_competitors": [
      {"name": "竞品名", "description": "一句话描述"}
    ],
    "competitive_position": "竞争地位描述",
    "differentiation_points": ["差异化1", "差异化2"]
  },
  "interview_insights": {
    "company_culture": "公司文化描述",
    "key_challenges": ["挑战1", "挑战2"],
    "growth_opportunities": ["机会1", "机会2"],
    "interview_tips": ["建议1", "建议2"]
  },
  "summary": "一句话总结公司和岗位特点"
}

## 分析原则
1. **基于事实**：尽量基于已知信息推断，不要凭空编造
2. **实用导向**：分析结果要对面试准备有实际帮助
3. **AI聚焦**：重点分析AI相关内容，这是核心价值
4. **简洁有力**：每个要点简明扼要，便于记忆

## 注意事项
- 如果公司信息有限，基于行业通用情况进行合理推断
- AI场景分析要结合岗位职责，具体且有针对性
- 面试建议要可执行，不要泛泛而谈
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行公司分析
 */
export async function executeCompanyAnalyze(
  input: CompanyAnalyzeInput
): Promise<AgentResult<CompanyAnalyzeOutput>> {
  const startTime = Date.now();

  try {
    console.log('[公司分析] 开始分析:', input.company);

    // 构建用户消息
    const userMessage = `请分析以下公司和岗位：

## 基本信息
- 公司名称：${input.company}
- 岗位名称：${input.title}

## 岗位职责
${input.structured_jd.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 岗位要求
${input.structured_jd.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 加分项
${input.structured_jd.preferred.length > 0 ? input.structured_jd.preferred.map((p, i) => `${i + 1}. ${p}`).join('\n') : '无'}

## A维度分析结果
- A1 技术栈：${input.a_analysis.A1_tech_stack.keywords.join('、')} (密度: ${input.a_analysis.A1_tech_stack.density})
- A2 产品类型：${input.a_analysis.A2_product_type.type}
- A3 业务领域：主要 ${input.a_analysis.A3_business_domain.primary}，次要 ${input.a_analysis.A3_business_domain.secondary.join('、') || '无'}
- A4 团队阶段：${input.a_analysis.A4_team_stage.stage}

## B维度分析结果
- B1 行业要求：${input.b_analysis.B1_industry_requirement.specific_industry}，${input.b_analysis.B1_industry_requirement.years}
- B2 技术要求：${input.b_analysis.B2_tech_requirement.education}
- B3 产品经验：${input.b_analysis.B3_product_experience.product_types.join('、')}
- B4 核心能力：${input.b_analysis.B4_capability_requirement.capabilities.map(c => c.name).join('、')}`;

    const response = await chat(
      SYSTEM_PROMPT,
      userMessage,
      { model: MODELS.HIGH, jsonMode: true }
    );

    // 解析JSON响应
    const analysis = parseJsonResponse<CompanyAnalyzeOutput>(response);

    // 数据验证和默认值
    const result: CompanyAnalyzeOutput = {
      company_profile: {
        name: analysis.company_profile?.name || input.company,
        industry: analysis.company_profile?.industry || '互联网',
        stage: analysis.company_profile?.stage || '成长期',
        scale: analysis.company_profile?.scale || '未知',
        main_products: Array.isArray(analysis.company_profile?.main_products) 
          ? analysis.company_profile.main_products : [],
        business_model: analysis.company_profile?.business_model || 'ToB+ToC',
      },
      ai_scenarios: {
        current_ai_usage: Array.isArray(analysis.ai_scenarios?.current_ai_usage)
          ? analysis.ai_scenarios.current_ai_usage : [],
        potential_ai_opportunities: Array.isArray(analysis.ai_scenarios?.potential_ai_opportunities)
          ? analysis.ai_scenarios.potential_ai_opportunities : [],
        industry_ai_trends: Array.isArray(analysis.ai_scenarios?.industry_ai_trends)
          ? analysis.ai_scenarios.industry_ai_trends : [],
        role_ai_focus: analysis.ai_scenarios?.role_ai_focus || '',
      },
      competitor_analysis: {
        direct_competitors: Array.isArray(analysis.competitor_analysis?.direct_competitors)
          ? analysis.competitor_analysis.direct_competitors : [],
        competitive_position: analysis.competitor_analysis?.competitive_position || '',
        differentiation_points: Array.isArray(analysis.competitor_analysis?.differentiation_points)
          ? analysis.competitor_analysis.differentiation_points : [],
      },
      interview_insights: {
        company_culture: analysis.interview_insights?.company_culture || '',
        key_challenges: Array.isArray(analysis.interview_insights?.key_challenges)
          ? analysis.interview_insights.key_challenges : [],
        growth_opportunities: Array.isArray(analysis.interview_insights?.growth_opportunities)
          ? analysis.interview_insights.growth_opportunities : [],
        interview_tips: Array.isArray(analysis.interview_insights?.interview_tips)
          ? analysis.interview_insights.interview_tips : [],
      },
      summary: analysis.summary || '',
    };

    console.log('[公司分析] 分析完成:', result.company_profile.name);

    return {
      success: true,
      data: result,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('[公司分析] 执行失败:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    };
  }
}
