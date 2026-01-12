/**
 * 简历解析 Agent
 * 将清洗后的简历文本提取为结构化数据，并生成能力标签
 */

import { chat, parseJsonResponse, MODELS } from '../core/api-client';
import type { AgentResult, Resume } from '../types';

/** 解析输入 */
export interface ResumeParseInput {
  cleanedText: string;
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

// 系统提示词
const SYSTEM_PROMPT = `你是一个专业的简历分析专家，擅长从简历中提取结构化信息和能力标签。

## 任务
请将用户提供的简历文本提取为结构化JSON格式，并生成能力标签。

## 输出JSON Schema
{
  "basic_info": {
    "name": "姓名",
    "contact": "联系方式（邮箱/电话）",
    "target_position": "目标岗位/求职意向"
  },
  "education": [
    {
      "school": "学校名称",
      "major": "专业",
      "degree": "学历（本科/硕士/博士）",
      "duration": "时间段"
    }
  ],
  "work_experience": [
    {
      "company": "公司名称",
      "position": "职位",
      "duration": "时间段",
      "description": "工作描述（合并为一段）"
    }
  ],
  "projects": [
    {
      "name": "项目名称",
      "role": "担任角色",
      "duration": "时间段",
      "description": "项目描述",
      "achievements": ["成果1", "成果2"],
      "tech_stack": ["技术1", "技术2"]
    }
  ],
  "skills": ["技能1", "技能2", ...],
  "ability_tags": {
    "industry": ["行业标签1", "行业标签2"],
    "technology": ["技术标签1", "技术标签2"],
    "product": ["产品标签1", "产品标签2"],
    "capability": ["能力标签1", "能力标签2"]
  }
}

## 能力标签提取规则

### industry（行业标签）
从工作经历中提取所涉及的行业，如：
- 金融科技、银行、保险、证券
- 电商、零售、新零售
- 医疗健康、医药
- 教育、在线教育
- 企业服务、SaaS
- 社交、内容、娱乐
- 物流、供应链
- 制造、工业互联网

### technology（技术标签）
从技能和项目中提取技术能力，如：
- 编程语言：Python、Java、SQL等
- AI相关：机器学习、NLP、CV、大模型
- 数据：数据分析、数据挖掘、BI
- 其他：云计算、微服务、数据库等

### product（产品标签）
从经历中提取产品类型经验，如：
- ToB、ToC、ToG
- SaaS、PaaS、平台型
- 移动端、Web端、小程序
- 0-1经验、全周期经验
- 数据产品、AI产品、工具产品

### capability（能力标签）
从经历中提取核心能力，如：
- 需求分析、产品设计、原型设计
- 项目管理、跨部门协作
- 数据驱动、A/B测试
- 用户研究、竞品分析
- 商业分析、战略规划

## 注意事项
- 每个字段尽量从简历中提取，没有的填空字符串或空数组
- 能力标签要基于简历内容推断，不要凭空编造
- 标签要简洁，每个标签2-6个字
- 直接输出JSON，不要添加markdown代码块`;

/**
 * 执行简历解析
 */
export async function executeResumeParse(
  input: ResumeParseInput
): Promise<AgentResult<ResumeParseOutput>> {
  const startTime = Date.now();

  try {
    console.log('[简历解析] 开始提取结构化信息');

    const response = await chat(
      SYSTEM_PROMPT,
      `请将以下简历文本提取为结构化JSON，并生成能力标签：\n\n${input.cleanedText}`,
      { model: MODELS.MEDIUM, jsonMode: true }
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
