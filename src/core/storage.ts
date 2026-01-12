/**
 * LocalStorage 封装（服务端兼容）
 * 
 * 注意：Cloudflare Workers 环境没有 localStorage
 * 这个模块主要在前端使用，服务端使用内存存储作为临时方案
 */

import type { Job, Resume, Match, InterviewPrep, ResumeOptimization } from '../types';

// 存储键
export const STORAGE_KEYS = {
  JOBS: 'jobcopilot_jobs',
  RESUMES: 'jobcopilot_resumes',
  MATCHES: 'jobcopilot_matches',
  INTERVIEWS: 'jobcopilot_interviews',
  OPTIMIZATIONS: 'jobcopilot_optimizations',
} as const;

// 服务端内存存储（临时方案）
const memoryStore: Record<string, any[]> = {
  [STORAGE_KEYS.JOBS]: [],
  [STORAGE_KEYS.RESUMES]: [],
  [STORAGE_KEYS.MATCHES]: [],
  [STORAGE_KEYS.INTERVIEWS]: [],
  [STORAGE_KEYS.OPTIMIZATIONS]: [],
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

// ==================== 简历操作 ====================

export const resumeStorage = {
  getAll(): Resume[] {
    return getStorageData<Resume>(STORAGE_KEYS.RESUMES);
  },

  getById(id: string): Resume | undefined {
    return this.getAll().find(resume => resume.id === id);
  },

  getCurrent(): Resume | undefined {
    // 返回最新的一份简历
    const resumes = this.getAll();
    return resumes[0];
  },

  create(resume: Omit<Resume, 'id' | 'created_at' | 'updated_at'>): Resume {
    const newResume: Resume = {
      ...resume,
      id: generateId(),
      created_at: now(),
      updated_at: now(),
    };
    const resumes = this.getAll();
    resumes.unshift(newResume);
    setStorageData(STORAGE_KEYS.RESUMES, resumes);
    return newResume;
  },

  update(id: string, updates: Partial<Resume>): Resume | undefined {
    const resumes = this.getAll();
    const index = resumes.findIndex(resume => resume.id === id);
    if (index === -1) return undefined;

    resumes[index] = {
      ...resumes[index],
      ...updates,
      updated_at: now(),
    };
    setStorageData(STORAGE_KEYS.RESUMES, resumes);
    return resumes[index];
  },

  delete(id: string): boolean {
    const resumes = this.getAll();
    const filtered = resumes.filter(resume => resume.id !== id);
    if (filtered.length === resumes.length) return false;
    setStorageData(STORAGE_KEYS.RESUMES, filtered);
    return true;
  },
};

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
