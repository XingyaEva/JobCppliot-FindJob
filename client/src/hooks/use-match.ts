/**
 * FindJob - 匹配评估 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type { MatchResult } from '../types/api';

/**
 * 获取匹配结果（缓存）
 */
export function useMatchResult(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.match.result(jobId!),
    queryFn: () => api.get<MatchResult>(`/job/${jobId}/match`),
    enabled: !!jobId,
    // 匹配结果不经常变化，缓存时间更长
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 发起匹配评估
 */
export function useEvaluateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      api.post<MatchResult>(`/job/${jobId}/match`),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.match.result(jobId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
    },
  });
}
