/**
 * LocalStorage 封装（服务端兼容）
 * 
 * 注意：Cloudflare Workers 环境没有 localStorage
 * 这个模块主要在前端使用，服务端使用内存存储作为临时方案
 */

import type { 
  Job, Resume, ResumeVersion, ResumeContent, Match, InterviewPrep, ResumeOptimization,
  QuestionBankItem, QuestionAnswer, QuestionCategory, QuestionDifficulty, QuestionSource
} from '../types';

// 存储键
export const STORAGE_KEYS = {
  JOBS: 'jobcopilot_jobs',
  RESUMES: 'jobcopilot_resumes',
  RESUME_VERSIONS: 'jobcopilot_resume_versions',  // Phase 7 新增
  MATCHES: 'jobcopilot_matches',
  INTERVIEWS: 'jobcopilot_interviews',
  OPTIMIZATIONS: 'jobcopilot_optimizations',
  // Phase 8 新增
  QUESTIONS: 'jobcopilot_questions',
  ANSWERS: 'jobcopilot_answers',
} as const;

// 服务端内存存储（临时方案）
const memoryStore: Record<string, any[]> = {
  [STORAGE_KEYS.JOBS]: [],
  [STORAGE_KEYS.RESUMES]: [],
  [STORAGE_KEYS.RESUME_VERSIONS]: [],
  [STORAGE_KEYS.MATCHES]: [],
  [STORAGE_KEYS.INTERVIEWS]: [],
  [STORAGE_KEYS.OPTIMIZATIONS]: [],
  [STORAGE_KEYS.QUESTIONS]: [],
  [STORAGE_KEYS.ANSWERS]: [],
};

/**
 * 判断是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * 获取存储数据
 */
export function getStorageData<T>(key: string): T[] {
  if (isBrowser()) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('读取存储失败:', err);
      return [];
    }
  }
  return memoryStore[key] || [];
}

/**
 * 保存存储数据
 */
export function setStorageData<T>(key: string, data: T[]): boolean {
  if (isBrowser()) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('保存存储失败:', err);
      return false;
    }
  }
  memoryStore[key] = data;
  return true;
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 获取当前时间ISO字符串
 */
export function now(): string {
  return new Date().toISOString();
}

// ==================== 岗位操作 ====================

export const jobStorage = {
  getAll(): Job[] {
    return getStorageData<Job>(STORAGE_KEYS.JOBS);
  },

  getById(id: string): Job | undefined {
    return this.getAll().find(job => job.id === id);
  },

  create(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Job {
    const newJob: Job = {
      ...job,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    const jobs = this.getAll();
    jobs.unshift(newJob); // 新的在前面
    setStorageData(STORAGE_KEYS.JOBS, jobs);
    return newJob;
  },

  update(id: string, updates: Partial<Job>): Job | undefined {
    const jobs = this.getAll();
    const index = jobs.findIndex(job => job.id === id);
    if (index === -1) return undefined;

    jobs[index] = {
      ...jobs[index],
      ...updates,
      updated_at: now(),
    };
    setStorageData(STORAGE_KEYS.JOBS, jobs);
    return jobs[index];
  },

  delete(id: string): boolean {
    const jobs = this.getAll();
    const filtered = jobs.filter(job => job.id !== id);
    if (filtered.length === jobs.length) return false;
    setStorageData(STORAGE_KEYS.JOBS, filtered);
    return true;
  },

  getRecent(limit: number = 10): Job[] {
    return this.getAll().slice(0, limit);
  },
};

// ==================== 简历操作（扩展版） ====================

export const resumeStorage = {
  getAll(): Resume[] {
    return getStorageData<Resume>(STORAGE_KEYS.RESUMES);
  },

  getById(id: string): Resume | undefined {
    return this.getAll().find(resume => resume.id === id);
  },

  getCurrent(): Resume | undefined {
    // 返回最新的一份主版本简历
    const resumes = this.getAll();
    return resumes.find(r => r.is_master) || resumes[0];
  },

  // 获取所有主版本简历
  getMasterResumes(): Resume[] {
    return this.getAll().filter(r => r.is_master);
  },

  // 获取某个简历的所有衍生版本
  getVersionsOf(baseResumeId: string): Resume[] {
    return this.getAll().filter(r => r.base_resume_id === baseResumeId);
  },

  // 获取某个岗位关联的简历
  getByJobId(jobId: string): Resume[] {
    return this.getAll().filter(r => r.linked_jd_ids?.includes(jobId));
  },

  // 创建新简历（支持版本管理字段）
  create(resume: Omit<Resume, 'id' | 'created_at' | 'updated_at'>): Resume {
    const newResume: Resume = {
      ...resume,
      id: generateId(),
      name: resume.name || resume.basic_info?.name || '未命名简历',
      version: resume.version || 1,
      is_master: resume.is_master !== false,
      linked_jd_ids: resume.linked_jd_ids || [],
      created_at: now(),
      updated_at: now(),
    };
    const resumes = this.getAll();
    resumes.unshift(newResume);
    setStorageData(STORAGE_KEYS.RESUMES, resumes);
    
    // 自动创建初始版本记录
    if (newResume.is_master) {
      resumeVersionStorage.createFromResume(newResume, 'auto');
    }
    
    return newResume;
  },

  // 更新简历（自动创建版本）
  update(id: string, updates: Partial<Resume>, createVersion: boolean = true): Resume | undefined {
    const resumes = this.getAll();
    const index = resumes.findIndex(resume => resume.id === id);
    if (index === -1) return undefined;

    const oldResume = resumes[index];
    
    resumes[index] = {
      ...oldResume,
      ...updates,
      updated_at: now(),
    };
    setStorageData(STORAGE_KEYS.RESUMES, resumes);
    
    // 如果内容有变化，自动创建版本
    if (createVersion && hasContentChanged(oldResume, updates)) {
      const newVersion = (oldResume.version || 1) + 1;
      resumes[index].version = newVersion;
      setStorageData(STORAGE_KEYS.RESUMES, resumes);
      resumeVersionStorage.createFromResume(resumes[index], 'auto');
    }
    
    return resumes[index];
  },

  // 关联岗位
  linkToJob(resumeId: string, jobId: string): Resume | undefined {
    const resume = this.getById(resumeId);
    if (!resume) return undefined;
    
    const linkedIds = resume.linked_jd_ids || [];
    if (!linkedIds.includes(jobId)) {
      linkedIds.push(jobId);
      return this.update(resumeId, { linked_jd_ids: linkedIds }, false);
    }
    return resume;
  },

  // 取消关联岗位
  unlinkFromJob(resumeId: string, jobId: string): Resume | undefined {
    const resume = this.getById(resumeId);
    if (!resume) return undefined;
    
    const linkedIds = (resume.linked_jd_ids || []).filter(id => id !== jobId);
    return this.update(resumeId, { linked_jd_ids: linkedIds }, false);
  },

  delete(id: string): boolean {
    const resumes = this.getAll();
    const filtered = resumes.filter(resume => resume.id !== id);
    if (filtered.length === resumes.length) return false;
    setStorageData(STORAGE_KEYS.RESUMES, filtered);
    
    // 同时删除相关的版本记录
    resumeVersionStorage.deleteByResumeId(id);
    
    return true;
  },

  // 统计信息
  getStats(): { total: number; masters: number; versions: number } {
    const resumes = this.getAll();
    return {
      total: resumes.length,
      masters: resumes.filter(r => r.is_master).length,
      versions: resumes.filter(r => !r.is_master).length,
    };
  },
};

// ==================== 简历版本操作 ====================

export const resumeVersionStorage = {
  getAll(): ResumeVersion[] {
    return getStorageData<ResumeVersion>(STORAGE_KEYS.RESUME_VERSIONS);
  },

  getById(id: string): ResumeVersion | undefined {
    return this.getAll().find(v => v.id === id);
  },

  // 获取某个简历的所有版本
  getByResumeId(resumeId: string): ResumeVersion[] {
    return this.getAll()
      .filter(v => v.resume_id === resumeId)
      .sort((a, b) => b.version - a.version); // 按版本号降序
  },

  // 获取最新版本
  getLatestVersion(resumeId: string): ResumeVersion | undefined {
    const versions = this.getByResumeId(resumeId);
    return versions[0];
  },

  // 从简历创建版本记录
  createFromResume(
    resume: Resume, 
    createdBy: 'manual' | 'auto' | 'agent',
    linkedJdId?: string,
    changesSummary?: string
  ): ResumeVersion {
    const content: ResumeContent = {
      basic_info: resume.basic_info,
      education: resume.education,
      work_experience: resume.work_experience,
      projects: resume.projects,
      skills: resume.skills,
      ability_tags: resume.ability_tags,
    };

    const newVersion: ResumeVersion = {
      id: generateId(),
      resume_id: resume.id,
      version: resume.version || 1,
      version_tag: resume.version_tag,
      content,
      linked_jd_id: linkedJdId,
      changes_summary: changesSummary,
      created_by: createdBy,
      created_at: now(),
    };

    const versions = this.getAll();
    versions.unshift(newVersion);
    setStorageData(STORAGE_KEYS.RESUME_VERSIONS, versions);
    return newVersion;
  },

  // 手动创建版本（带标签）
  createWithTag(
    resumeId: string,
    tag: string,
    linkedJdId?: string
  ): ResumeVersion | undefined {
    const resume = resumeStorage.getById(resumeId);
    if (!resume) return undefined;

    // 更新简历版本号和标签
    const newVersion = (resume.version || 1) + 1;
    resumeStorage.update(resumeId, {
      version: newVersion,
      version_tag: tag,
    }, false);

    const updatedResume = resumeStorage.getById(resumeId)!;
    return this.createFromResume(updatedResume, 'manual', linkedJdId, `手动保存: ${tag}`);
  },

  // 删除某个简历的所有版本
  deleteByResumeId(resumeId: string): number {
    const versions = this.getAll();
    const filtered = versions.filter(v => v.resume_id !== resumeId);
    const deletedCount = versions.length - filtered.length;
    setStorageData(STORAGE_KEYS.RESUME_VERSIONS, filtered);
    return deletedCount;
  },

  delete(id: string): boolean {
    const versions = this.getAll();
    const filtered = versions.filter(v => v.id !== id);
    if (filtered.length === versions.length) return false;
    setStorageData(STORAGE_KEYS.RESUME_VERSIONS, filtered);
    return true;
  },
};

// 辅助函数：判断内容是否变化
function hasContentChanged(oldResume: Resume, updates: Partial<Resume>): boolean {
  const contentFields = ['basic_info', 'education', 'work_experience', 'projects', 'skills', 'ability_tags'];
  return contentFields.some(field => {
    if (!(field in updates)) return false;
    return JSON.stringify((oldResume as any)[field]) !== JSON.stringify((updates as any)[field]);
  });
}

// ==================== 匹配记录操作 ====================

export const matchStorage = {
  getAll(): Match[] {
    return getStorageData<Match>(STORAGE_KEYS.MATCHES);
  },

  getById(id: string): Match | undefined {
    return this.getAll().find(match => match.id === id);
  },

  getByJobId(jobId: string): Match | undefined {
    return this.getAll().find(match => match.job_id === jobId);
  },

  create(match: Omit<Match, 'id' | 'created_at'>): Match {
    const newMatch: Match = {
      ...match,
      id: generateId(),
      created_at: now(),
    };
    const matches = this.getAll();
    matches.unshift(newMatch);
    setStorageData(STORAGE_KEYS.MATCHES, matches);
    return newMatch;
  },

  delete(id: string): boolean {
    const matches = this.getAll();
    const filtered = matches.filter(match => match.id !== id);
    if (filtered.length === matches.length) return false;
    setStorageData(STORAGE_KEYS.MATCHES, filtered);
    return true;
  },
};

// ==================== 面试准备操作 ====================

export const interviewStorage = {
  getAll(): InterviewPrep[] {
    return getStorageData<InterviewPrep>(STORAGE_KEYS.INTERVIEWS);
  },

  getById(id: string): InterviewPrep | undefined {
    return this.getAll().find(prep => prep.id === id);
  },

  getByJobId(jobId: string): InterviewPrep | undefined {
    return this.getAll().find(prep => prep.job_id === jobId);
  },

  create(prep: Omit<InterviewPrep, 'id' | 'created_at'>): InterviewPrep {
    const newPrep: InterviewPrep = {
      ...prep,
      id: generateId(),
      created_at: now(),
    };
    const preps = this.getAll();
    preps.unshift(newPrep);
    setStorageData(STORAGE_KEYS.INTERVIEWS, preps);
    return newPrep;
  },

  delete(id: string): boolean {
    const preps = this.getAll();
    const filtered = preps.filter(prep => prep.id !== id);
    if (filtered.length === preps.length) return false;
    setStorageData(STORAGE_KEYS.INTERVIEWS, filtered);
    return true;
  },
};

// ==================== 简历优化操作 ====================

export const optimizationStorage = {
  getAll(): ResumeOptimization[] {
    return getStorageData<ResumeOptimization>(STORAGE_KEYS.OPTIMIZATIONS);
  },

  getById(id: string): ResumeOptimization | undefined {
    return this.getAll().find(opt => opt.id === id);
  },

  getByJobId(jobId: string): ResumeOptimization | undefined {
    return this.getAll().find(opt => opt.job_id === jobId);
  },

  create(opt: Omit<ResumeOptimization, 'id' | 'created_at'>): ResumeOptimization {
    const newOpt: ResumeOptimization = {
      ...opt,
      id: generateId(),
      created_at: now(),
    };
    const opts = this.getAll();
    opts.unshift(newOpt);
    setStorageData(STORAGE_KEYS.OPTIMIZATIONS, opts);
    return newOpt;
  },

  delete(id: string): boolean {
    const opts = this.getAll();
    const filtered = opts.filter(opt => opt.id !== id);
    if (filtered.length === opts.length) return false;
    setStorageData(STORAGE_KEYS.OPTIMIZATIONS, filtered);
    return true;
  },
};

// ==================== Phase 8: 面试题库操作 ====================

export const questionStorage = {
  getAll(): QuestionBankItem[] {
    return getStorageData<QuestionBankItem>(STORAGE_KEYS.QUESTIONS);
  },

  getById(id: string): QuestionBankItem | undefined {
    return this.getAll().find(q => q.id === id);
  },

  // 按分类筛选
  getByCategory(category: QuestionCategory): QuestionBankItem[] {
    return this.getAll().filter(q => q.category === category);
  },

  // 按岗位筛选
  getByJobId(jobId: string): QuestionBankItem[] {
    return this.getAll().filter(q => q.linked_jd_id === jobId);
  },

  // 搜索题目
  search(keyword: string): QuestionBankItem[] {
    const lower = keyword.toLowerCase();
    return this.getAll().filter(q => 
      q.question.toLowerCase().includes(lower) ||
      q.tags.some(t => t.toLowerCase().includes(lower))
    );
  },

  // 创建题目
  create(question: Omit<QuestionBankItem, 'id' | 'answer_count' | 'has_ai_feedback' | 'created_at' | 'updated_at'>): QuestionBankItem {
    const newQuestion: QuestionBankItem = {
      ...question,
      id: generateId(),
      answer_count: 0,
      has_ai_feedback: false,
      created_at: now(),
      updated_at: now(),
    };
    const questions = this.getAll();
    questions.unshift(newQuestion);
    setStorageData(STORAGE_KEYS.QUESTIONS, questions);
    return newQuestion;
  },

  // 更新题目
  update(id: string, updates: Partial<QuestionBankItem>): QuestionBankItem | undefined {
    const questions = this.getAll();
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return undefined;

    questions[index] = {
      ...questions[index],
      ...updates,
      updated_at: now(),
    };
    setStorageData(STORAGE_KEYS.QUESTIONS, questions);
    return questions[index];
  },

  // 更新回答计数
  incrementAnswerCount(id: string): void {
    const question = this.getById(id);
    if (question) {
      this.update(id, { answer_count: (question.answer_count || 0) + 1 });
    }
  },

  // 标记有AI反馈
  markHasAIFeedback(id: string): void {
    this.update(id, { has_ai_feedback: true });
  },

  // 删除题目
  delete(id: string): boolean {
    const questions = this.getAll();
    const filtered = questions.filter(q => q.id !== id);
    if (filtered.length === questions.length) return false;
    setStorageData(STORAGE_KEYS.QUESTIONS, filtered);
    
    // 同时删除相关回答
    answerStorage.deleteByQuestionId(id);
    
    return true;
  },

  // 批量导入
  importBatch(items: Array<{
    question: string;
    category: QuestionCategory;
    difficulty?: QuestionDifficulty;
    tags?: string[];
    source?: QuestionSource;
    linked_jd_id?: string;
    linked_jd_title?: string;
  }>): QuestionBankItem[] {
    const created: QuestionBankItem[] = [];
    for (const item of items) {
      const question = this.create({
        question: item.question,
        category: item.category,
        difficulty: item.difficulty || 'medium',
        tags: item.tags || [],
        source: item.source || 'manual',
        linked_jd_id: item.linked_jd_id,
        linked_jd_title: item.linked_jd_title,
      });
      created.push(question);
    }
    return created;
  },

  // 统计信息
  getStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    withFeedback: number;
  } {
    const questions = this.getAll();
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let withFeedback = 0;

    for (const q of questions) {
      byCategory[q.category] = (byCategory[q.category] || 0) + 1;
      bySource[q.source] = (bySource[q.source] || 0) + 1;
      if (q.has_ai_feedback) withFeedback++;
    }

    return {
      total: questions.length,
      byCategory,
      bySource,
      withFeedback,
    };
  },
};

// ==================== 面试回答操作 ====================

export const answerStorage = {
  getAll(): QuestionAnswer[] {
    return getStorageData<QuestionAnswer>(STORAGE_KEYS.ANSWERS);
  },

  getById(id: string): QuestionAnswer | undefined {
    return this.getAll().find(a => a.id === id);
  },

  // 获取某个题目的所有回答
  getByQuestionId(questionId: string): QuestionAnswer[] {
    return this.getAll()
      .filter(a => a.question_id === questionId)
      .sort((a, b) => b.version - a.version);
  },

  // 获取某个题目的当前回答
  getCurrentAnswer(questionId: string): QuestionAnswer | undefined {
    return this.getAll().find(a => a.question_id === questionId && a.is_current);
  },

  // 获取最新版本号
  getLatestVersion(questionId: string): number {
    const answers = this.getByQuestionId(questionId);
    return answers.length > 0 ? answers[0].version : 0;
  },

  // 创建/保存回答（自动版本管理）
  save(questionId: string, content: string, versionTag?: string): QuestionAnswer {
    const answers = this.getAll();
    
    // 将之前的当前版本标记为非当前
    answers.forEach(a => {
      if (a.question_id === questionId && a.is_current) {
        a.is_current = false;
      }
    });

    const latestVersion = this.getLatestVersion(questionId);
    
    const newAnswer: QuestionAnswer = {
      id: generateId(),
      question_id: questionId,
      content,
      version: latestVersion + 1,
      version_tag: versionTag,
      is_current: true,
      created_at: now(),
    };

    answers.unshift(newAnswer);
    setStorageData(STORAGE_KEYS.ANSWERS, answers);

    // 更新题目的回答计数
    questionStorage.incrementAnswerCount(questionId);

    return newAnswer;
  },

  // 更新AI反馈
  updateFeedback(answerId: string, feedback: import('../types').AICoachFeedback): QuestionAnswer | undefined {
    const answers = this.getAll();
    const index = answers.findIndex(a => a.id === answerId);
    if (index === -1) return undefined;

    answers[index] = {
      ...answers[index],
      ai_feedback: feedback,
      feedback_requested_at: now(),
    };
    setStorageData(STORAGE_KEYS.ANSWERS, answers);

    // 标记题目有AI反馈
    questionStorage.markHasAIFeedback(answers[index].question_id);

    return answers[index];
  },

  // 删除某个题目的所有回答
  deleteByQuestionId(questionId: string): number {
    const answers = this.getAll();
    const filtered = answers.filter(a => a.question_id !== questionId);
    const deletedCount = answers.length - filtered.length;
    setStorageData(STORAGE_KEYS.ANSWERS, filtered);
    return deletedCount;
  },

  // 删除单个回答
  delete(id: string): boolean {
    const answers = this.getAll();
    const filtered = answers.filter(a => a.id !== id);
    if (filtered.length === answers.length) return false;
    setStorageData(STORAGE_KEYS.ANSWERS, filtered);
    return true;
  },
};
