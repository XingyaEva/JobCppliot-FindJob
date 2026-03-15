/**
 * FindJob - 前端 API 类型定义
 *
 * 与后端 src/types/index.ts 对应，但精简为前端所需的字段。
 * 后续可通过 codegen 自动生成。
 */

// ==================== 通用 ====================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 岗位 ====================

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
    capabilities: Array<{ name: string; detail: string }>;
    summary: string;
  };
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Job {
  id: string;
  title: string;
  company: string;
  job_url?: string;
  raw_content: string;
  source_type: 'image' | 'text';
  image_url?: string;
  structured_jd?: StructuredJD;
  a_analysis?: AAnalysis;
  b_analysis?: BAnalysis;
  status: JobStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

/** JD 解析请求 */
export interface ParseJDRequest {
  type: 'text' | 'image';
  content?: string;
  imageUrl?: string;
}

/** JD URL 解析请求 */
export interface ParseJDUrlRequest {
  url: string;
  platform?: string;
}

/** 异步任务 */
export interface AsyncTask {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  result?: Job;
  error?: string;
}

// ==================== 简历 ====================

export interface Education {
  school: string;
  major: string;
  degree: string;
  duration: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface Project {
  name: string;
  role: string;
  duration: string;
  description: string;
  achievements: string[];
  tech_stack: string[];
}

export interface AbilityTags {
  industry: string[];
  technology: string[];
  product: string[];
  capability: string[];
}

export type ResumeStatus = 'pending' | 'processing' | 'parsing' | 'completed' | 'error';

export interface Resume {
  id: string;
  name: string;
  original_file_name?: string;
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
  base_resume_id?: string;
  version: number;
  version_tag?: string;
  linked_jd_ids: string[];
  is_master: boolean;
  status: ResumeStatus;
  error_message?: string;
  progress_percent?: number;
  progress_message?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 匹配 ====================

export interface DimensionMatch {
  status: '✅' | '⚠️' | '❌';
  jd_requirement: string;
  resume_match: string;
  gap_analysis: string;
}

export type MatchLevel = '非常匹配' | '比较匹配' | '匹配度还可以' | '不是很匹配' | '不匹配';

export interface MatchResult {
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
}

// ==================== 面试准备 ====================

export interface PREPAnswer {
  P_point: string;
  R_reason: string;
  E_example: string;
  P_restate: string;
  extension: string;
}

export interface InterviewQuestion {
  question: string;
  prep_answer: PREPAnswer;
}

export interface SelfIntroduction {
  duration: string;
  content: string;
  structure: Array<{
    part: string;
    content: string;
    match_point: string;
  }>;
}

export interface ProjectRecommendation {
  project_name: string;
  why_choose: string;
  focus_points: string[];
  match_B4: string[];
}

export interface InterviewPrep {
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
  created_at: string;
}

// ==================== 公司分析 ====================

export interface CompanyAnalysis {
  company_type: 'ToB' | 'ToC';
  company_overview: {
    main_business: string;
    team_focus: string;
    market_position: string;
  };
  ai_scenarios?: Array<{
    scenario: string;
    pain_point: string;
    ai_solution: string;
    value: string;
  }>;
  competitors?: Array<{
    name: string;
    comparison: string;
  }>;
  interview_insights: Array<{
    question: string;
    answer_points: string[];
  }>;
}

// ==================== 简历优化 ====================

export interface OptimizedSection {
  original: string;
  optimized: string;
  changes: string[];
  match_points?: string[];
}

export interface ResumeOptimization {
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

// ==================== 题库 ====================

export type QuestionCategory =
  | '自我介绍'
  | '项目经历'
  | '专业能力'
  | '行为面试'
  | '情景模拟'
  | '职业规划'
  | '反问环节'
  | '其他';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionSource = 'manual' | 'agent' | 'review';

export interface QuestionBankItem {
  id: string;
  question: string;
  source: QuestionSource;
  linked_jd_id?: string;
  linked_jd_title?: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  tags: string[];
  answer_count: number;
  has_ai_feedback: boolean;
  created_at: string;
  updated_at: string;
}

export interface AICoachFeedback {
  must_fix: string[];
  suggestions: string[];
  polish: string[];
  overall_score: number;
  highlights: string[];
  improvement_direction: string;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  content: string;
  version: number;
  version_tag?: string;
  ai_feedback?: AICoachFeedback;
  is_current: boolean;
  created_at: string;
}

// ==================== 投递记录 ====================

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  job_id?: string;
  company: string;
  position: string;
  job_url?: string;
  status: ApplicationStatus;
  applied_at: string;
  salary_range?: string;
  notes?: string;
  tags: string[];
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  interviewRate: number;
  offerRate: number;
  thisWeek: number;
  thisMonth: number;
}

// ==================== 聊天 ====================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  currentPage?: string;
  pageData?: Record<string, unknown>;
}

// ==================== 用户 Dashboard ====================

export interface DashboardSummary {
  trackedJobs: number;
  appliedJobs: number;
  interviewCount: number;
  offerCount: number;
  weeklyChange: {
    tracked: number;
    applied: number;
    interview: number;
  };
}

export interface DashboardFunnel {
  stages: Array<{
    stage: string;
    count: number;
    rate: number;
  }>;
}

export interface DashboardActivityTrend {
  weeks: Array<{
    week: string;
    parseJobs: number;
    applyResumes: number;
    interviewPrep: number;
  }>;
}

export interface DashboardSkillRadar {
  dimensions: Array<{
    dimension: string;
    score: number;
    fullMark: number;
  }>;
  overallScore: number;
}

export interface DashboardActivity {
  id: string;
  type: 'parse' | 'match' | 'resume' | 'interview' | 'offer' | 'other';
  title: string;
  time: string;
}

export interface DashboardInsight {
  id: string;
  type: 'opportunity' | 'improvement' | 'preparation' | 'warning';
  title: string;
  description: string;
  action: string;
  actionPath: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyGoal {
  id: string;
  text: string;
  current: number;
  target: number;
  completed: boolean;
  weekStart?: string;
  autoGenerated?: boolean;
}

// ==================== 待办事项 ====================

export type TodoSource = 'auto' | 'manual';
export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  text: string;
  source: TodoSource;
  priority: TodoPriority;
  completed: boolean;
  dismissed: boolean;
  dueTime?: string;
  relatedType?: 'job' | 'application' | 'resume' | 'interview' | 'goal';
  relatedId?: string;
  ruleName?: string;
  created_at: string;
  updated_at: string;
}
