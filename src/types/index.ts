/**
 * Job Copilot - 类型定义
 */

// ==================== 岗位相关 ====================

/** 结构化JD */
export interface StructuredJD {
  title: string;
  company: string;
  location: string;
  salary: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  others: string;
}

/** A维度分析结果 */
export interface AAnalysis {
  A1_tech_stack: {
    keywords: string[];
    density: '高' | '中' | '低';
    summary: string;
  };
  A2_product_type: {
    type: string;
    reason: string;
  };
  A3_business_domain: {
    primary: string;
    secondary: string[];
    summary: string;
  };
  A4_team_stage: {
    stage: string;
    evidence: string;
    summary: string;
  };
}

/** B维度分析结果 */
export interface BAnalysis {
  B1_industry_requirement: {
    required: boolean;
    preferred: boolean;
    years: string;
    specific_industry: string;
    summary: string;
  };
  B2_tech_requirement: {
    education: string;
    tech_depth: {
      '了解': string[];
      '熟悉': string[];
      '精通': string[];
    };
    summary: string;
  };
  B3_product_experience: {
    product_types: string[];
    need_full_cycle: boolean;
    need_0to1: boolean;
    summary: string;
  };
  B4_capability_requirement: {
    capabilities: Array<{
      name: string;
      detail: string;
    }>;
    summary: string;
  };
}

/** 岗位数据 */
export interface Job {
  id: string;
  title: string;
  company: string;
  job_url?: string;           // 岗位原始链接（选填）
  raw_content: string;
  source_type: 'image' | 'text';
  image_url?: string;
  structured_jd?: StructuredJD;
  a_analysis?: AAnalysis;
  b_analysis?: BAnalysis;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 简历相关 ====================

/** 项目经历 */
export interface Project {
  name: string;
  role: string;
  duration: string;
  description: string;
  achievements: string[];
  tech_stack: string[];
}

/** 工作经历 */
export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

/** 教育背景 */
export interface Education {
  school: string;
  major: string;
  degree: string;
  duration: string;
}

/** 能力标签 */
export interface AbilityTags {
  industry: string[];
  technology: string[];
  product: string[];
  capability: string[];
}

/** 简历内容（可独立存储的结构化内容） */
export interface ResumeContent {
  basic_info: {
    name: string;
    contact: string;
    target_position: string;
  };
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  skills: string[];
  ability_tags: AbilityTags;
}

/** 简历数据（扩展版 - 支持版本管理） */
export interface Resume {
  id: string;
  // 基础信息
  name: string;                      // 简历名称（如"产品经理简历"）
  basic_info: {
    name: string;
    contact: string;
    target_position: string;
  };
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  skills: string[];
  ability_tags: AbilityTags;
  raw_content: string;
  
  // 版本管理字段
  base_resume_id?: string;           // 基础版本ID（null表示主版本）
  version: number;                   // 版本号
  version_tag?: string;              // 版本标签（如"基础版"/"AI产品经理-保险"）
  linked_jd_ids: string[];           // 关联的岗位ID列表
  is_master: boolean;                // 是否为主版本
  
  // 状态
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

/** 简历版本记录 */
export interface ResumeVersion {
  id: string;
  resume_id: string;                 // 所属简历ID
  version: number;                   // 版本号
  version_tag?: string;              // 版本标签
  content: ResumeContent;            // 简历内容快照
  linked_jd_id?: string;             // 如果是JD定向版，关联的岗位ID
  changes_summary?: string;          // AI生成的变更摘要
  created_by: 'manual' | 'auto' | 'agent';  // 创建方式
  created_at: string;
}

/** JD定向简历生成结果 */
export interface JDTargetedResumeResult {
  resume_id: string;
  job_id: string;
  suggestions: {
    keyword_enhancements: string[];   // 关键词强化
    experience_reorder: string[];     // 经历排序建议
    content_adjustments: string[];    // 内容调整建议
    weakened_items: string[];         // 弱化/删除建议
  };
  optimized_content: ResumeContent;   // 优化后的简历内容
  match_improvement: string;          // 预估匹配度提升
}

// ==================== 匹配相关 ====================

/** 维度匹配详情 */
export interface DimensionMatch {
  status: '✅' | '⚠️' | '❌';
  jd_requirement: string;
  resume_match: string;
  gap_analysis: string;
}

/** 匹配等级 */
export type MatchLevel = '非常匹配' | '比较匹配' | '匹配度还可以' | '不是很匹配' | '不匹配';

/** 匹配记录 */
export interface Match {
  id: string;
  job_id: string;
  resume_id: string;
  match_level: MatchLevel;
  match_score: number;
  dimension_match: {
    A3_business_domain?: DimensionMatch;
    B1_industry?: DimensionMatch;
    B2_tech?: DimensionMatch;
    B3_product?: DimensionMatch;
    B4_capability?: DimensionMatch;
  };
  strengths: string[];
  gaps: string[];
  interview_focus_suggestion: string;
  created_at: string;
}

// ==================== 面试准备相关 ====================

/** PREP回答结构 */
export interface PREPAnswer {
  P_point: string;
  R_reason: string;
  E_example: string;
  P_restate: string;
  extension: string;
}

/** 面试题 */
export interface InterviewQuestion {
  question: string;
  prep_answer: PREPAnswer;
}

/** 自我介绍结构 */
export interface SelfIntroduction {
  duration: string;
  content: string;
  structure: Array<{
    part: string;
    content: string;
    match_point: string;
  }>;
}

/** 项目推荐 */
export interface ProjectRecommendation {
  project_name: string;
  why_choose: string;
  focus_points: string[];
  match_B4: string[];
}

/** 面试准备 */
export interface InterviewPrep {
  id: string;
  job_id: string;
  resume_id: string;
  self_introduction: SelfIntroduction;
  project_selection: {
    recommended_projects: ProjectRecommendation[];
  };
  interview_questions: {
    about_you: InterviewQuestion[];
    about_company: InterviewQuestion[];
    about_future: InterviewQuestion[];
  };
  company_analysis?: CompanyAnalysis;
  created_at: string;
}

// ==================== 公司分析相关 ====================

/** AI场景分析 */
export interface AIScenario {
  scenario: string;
  pain_point: string;
  ai_solution: string;
  value: string;
}

/** 公司分析 */
export interface CompanyAnalysis {
  company_type: 'ToB' | 'ToC';
  company_overview: {
    main_business: string;
    team_focus: string;
    market_position: string;
  };
  ai_scenarios?: AIScenario[];
  competitors?: Array<{
    name: string;
    comparison: string;
  }>;
  interview_insights: Array<{
    question: string;
    answer_points: string[];
  }>;
}

// ==================== 简历优化相关 ====================

/** 优化后的段落 */
export interface OptimizedSection {
  original: string;
  optimized: string;
  changes: string[];
  match_points?: string[];
}

/** 简历优化记录 */
export interface ResumeOptimization {
  id: string;
  job_id: string;
  resume_id: string;
  user_suggestions: string;
  optimization_summary: string;
  optimized_sections: {
    summary?: OptimizedSection;
    work_experience?: OptimizedSection[];
    projects?: OptimizedSection[];
    skills?: OptimizedSection;
  };
  keyword_injection: string[];
  before_after_comparison: {
    estimated_match_improvement: string;
    key_improvements: string[];
  };
  created_at: string;
}

// ==================== Agent相关 ====================

/** Agent状态 */
export type AgentStatus = 'pending' | 'running' | 'completed' | 'error';

/** Agent执行结果 */
export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration_ms?: number;
}

/** DAG节点 */
export interface DAGNode {
  id: string;
  name: string;
  agent: string;
  dependencies: string[];
  status: AgentStatus;
  result?: AgentResult;
}

/** DAG执行状态 */
export interface DAGState {
  nodes: DAGNode[];
  current_phase: number;
  total_phases: number;
  is_complete: boolean;
  error?: string;
}
