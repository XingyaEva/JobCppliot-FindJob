/**
 * FindJob - React Query 配置
 *
 * 全局 QueryClient 实例 + 常用配置
 */

import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 窗口聚焦时不自动重新获取（求职工具无需实时性）
      refetchOnWindowFocus: false,

      // 重试策略：网络错误重试 2 次，其他不重试
      retry: (failureCount, error) => {
        // 4xx 错误（参数/权限）不重试
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

      // 缓存时间
      staleTime: 2 * 60 * 1000, // 2 分钟内认为新鲜
      gcTime: 10 * 60 * 1000,   // 10 分钟后垃圾回收（原 cacheTime）
    },
    mutations: {
      // mutation 不重试
      retry: false,
    },
  },
};

export const queryClient = new QueryClient(queryClientConfig);

// ==================== Query Keys 管理 ====================
// 集中管理所有 query key，避免字符串散落

export const queryKeys = {
  // 岗位
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    status: (id: string) => [...queryKeys.jobs.all, 'status', id] as const,
    task: (taskId: string) => [...queryKeys.jobs.all, 'task', taskId] as const,
  },

  // 简历
  resumes: {
    all: ['resumes'] as const,
    lists: () => [...queryKeys.resumes.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.resumes.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.resumes.all, 'detail', id] as const,
  },

  // 匹配
  match: {
    all: ['match'] as const,
    result: (jobId: string) => [...queryKeys.match.all, jobId] as const,
  },

  // 面试
  interview: {
    all: ['interview'] as const,
    prep: (jobId: string) => [...queryKeys.interview.all, 'prep', jobId] as const,
    company: (jobId: string) => [...queryKeys.interview.all, 'company', jobId] as const,
  },

  // 简历优化
  optimize: {
    all: ['optimize'] as const,
    result: (jobId: string) => [...queryKeys.optimize.all, jobId] as const,
  },

  // 题库
  questions: {
    all: ['questions'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.questions.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.questions.all, 'detail', id] as const,
    answers: (id: string) => [...queryKeys.questions.all, 'answers', id] as const,
  },

  // 投递记录
  applications: {
    all: ['applications'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.applications.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.applications.all, 'detail', id] as const,
    stats: () => [...queryKeys.applications.all, 'stats'] as const,
  },

  // 用户 Dashboard
  userDashboard: {
    all: ['user-dashboard'] as const,
    summary: () => [...queryKeys.userDashboard.all, 'summary'] as const,
    funnel: () => [...queryKeys.userDashboard.all, 'funnel'] as const,
    activityTrend: () => [...queryKeys.userDashboard.all, 'activity-trend'] as const,
    skillRadar: () => [...queryKeys.userDashboard.all, 'skill-radar'] as const,
    activities: () => [...queryKeys.userDashboard.all, 'activities'] as const,
    insights: () => [...queryKeys.userDashboard.all, 'insights'] as const,
    weeklyGoals: () => [...queryKeys.userDashboard.all, 'weekly-goals'] as const,
  },

  // 待办事项
  todos: {
    all: ['todos'] as const,
    list: () => [...queryKeys.todos.all, 'list'] as const,
  },

  // 聊天
  chat: {
    all: ['chat'] as const,
    history: () => [...queryKeys.chat.all, 'history'] as const,
  },
} as const;

export default queryClient;
