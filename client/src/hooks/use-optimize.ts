/**
 * FindJob - 简历优化 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type { ResumeOptimization } from '../types/api';

/**
 * 获取优化结果
 */
export function useOptimizeResult(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.optimize.result(jobId!),
    queryFn: () => api.get<ResumeOptimization>(`/job/${jobId}/optimize`),
    enabled: !!jobId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 生成定向简历
 */
export function useGenerateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, suggestions }: { jobId: string; suggestions?: string }) =>
      api.post<ResumeOptimization>(`/job/${jobId}/optimize`, {
        user_suggestions: suggestions || '',
      }),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.optimize.result(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

/**
 * 重新生成定向简历
 */
export function useRegenerateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, suggestions }: { jobId: string; suggestions?: string }) =>
      api.post<ResumeOptimization>(`/job/${jobId}/optimize/regenerate`, {
        user_suggestions: suggestions || '',
      }),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.optimize.result(jobId) });
    },
  });
}
