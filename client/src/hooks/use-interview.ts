/**
 * FindJob - 面试准备 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type {
  InterviewPrep,
  CompanyAnalysis,
  QuestionBankItem,
  QuestionAnswer,
  AICoachFeedback,
} from '../types/api';

// ==================== 面试准备 ====================

/**
 * 获取面试准备结果
 */
export function useInterviewPrep(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.interview.prep(jobId!),
    queryFn: () => api.get<InterviewPrep>(`/job/${jobId}/interview`),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 生成面试准备
 */
export function useGenerateInterviewPrep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      api.post<InterviewPrep>(`/job/${jobId}/interview`),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interview.prep(jobId) });
    },
  });
}

// ==================== 公司分析 ====================

/**
 * 获取公司分析结果
 */
export function useCompanyAnalysis(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.interview.company(jobId!),
    queryFn: () => api.get<CompanyAnalysis>(`/job/${jobId}/company`),
    enabled: !!jobId,
    staleTime: 30 * 60 * 1000, // 公司分析变化不大，缓存30分钟
  });
}

/**
 * 生成公司分析
 */
export function useGenerateCompanyAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      api.post<CompanyAnalysis>(`/job/${jobId}/company`),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interview.company(jobId) });
    },
  });
}

// ==================== 题库 ====================

/**
 * 获取题目列表
 */
export function useQuestions(filters?: {
  category?: string;
  difficulty?: string;
  source?: string;
  linkedJdId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () =>
      api.get<QuestionBankItem[]>('/questions', {
        params: filters as Record<string, string>,
      }),
  });
}

/**
 * 获取题目的回答列表
 */
export function useQuestionAnswers(questionId: string | null) {
  return useQuery({
    queryKey: queryKeys.questions.answers(questionId!),
    queryFn: () => api.get<QuestionAnswer[]>(`/questions/${questionId}/answers`),
    enabled: !!questionId,
  });
}

/**
 * 提交题目回答
 */
export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: string; content: string }) =>
      api.post<QuestionAnswer>(`/questions/${questionId}/answer`, { content }),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.answers(questionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.list() });
    },
  });
}

/**
 * 请求 AI 教练反馈
 */
export function useRequestFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, ...data }: {
      questionId: string;
      question: string;
      answer: string;
      mode: 'jd_based' | 'general';
      job_context?: { title: string; company: string; requirements: string[] };
    }) =>
      api.post<{ feedback: AICoachFeedback }>(`/questions/${questionId}/feedback`, data),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.answers(questionId) });
    },
  });
}

/**
 * 从面试中导入题目
 */
export function useImportFromInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      api.post<{ imported: number }>(`/questions/import-from-interview/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}

/**
 * AI 推荐题目
 */
export function useSuggestQuestions() {
  return useMutation({
    mutationFn: (data: { jobId?: string; count?: number }) =>
      api.post<QuestionBankItem[]>('/questions/suggest', data),
  });
}
