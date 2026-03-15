/**
 * FindJob - 岗位相关 React Query Hooks
 *
 * 封装所有岗位 API 调用为声明式 hooks
 * 配合 useJobStore 管理客户端状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type { Job, ParseJDRequest, AsyncTask } from '../types/api';
import { useJobStore } from '../stores/job-store';
import { useCallback, useEffect, useRef } from 'react';

// ==================== 查询 Hooks ====================

/**
 * 获取岗位列表
 */
export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.lists(),
    queryFn: () => api.get<Job[]>('/jobs'),
  });
}

/**
 * 获取单个岗位详情
 */
export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId!),
    queryFn: () => api.get<Job>(`/job/${jobId}`),
    enabled: !!jobId,
  });
}

/**
 * 获取岗位解析状态
 */
export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.jobs.status(jobId!),
    queryFn: () => api.get<{ status: string; nodes: unknown[] }>(`/job/${jobId}/status`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // 只有在 processing 状态时才轮询
      const data = query.state.data as { status?: string } | undefined;
      return data?.status === 'processing' ? 2000 : false;
    },
  });
}

// ==================== 变更 Hooks ====================

/**
 * 同步解析 JD
 */
export function useParseJD() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParseJDRequest) =>
      api.post<{ success: boolean; job: Job }>('/job/parse', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

/**
 * 同步解析 JD（完整 pipeline）
 */
export function useParseJDSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParseJDRequest) =>
      api.post<{ success: boolean; job: Job }>('/job/parse-sync', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

/**
 * 异步解析 JD + 轮询进度
 */
export function useParseJDAsync() {
  const queryClient = useQueryClient();
  const { setParseProgress, resetParseProgress } = useJobStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    resetParseProgress();
  }, [resetParseProgress]);

  // 启动异步解析
  const mutation = useMutation({
    mutationFn: (data: ParseJDRequest) =>
      api.post<{ taskId: string }>('/job/parse-async', data),
    onSuccess: (result) => {
      const taskId = result.taskId;
      setParseProgress({ isActive: true, taskId, progress: 0, stage: 'parsing', message: '开始解析...' });

      // 轮询任务状态
      pollingRef.current = setInterval(async () => {
        try {
          const task = await api.get<AsyncTask>(`/job/task/${taskId}`);

          if (task.status === 'completed') {
            setParseProgress({ progress: 100, stage: 'completed', message: '解析完成' });
            stopPolling();
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
          } else if (task.status === 'error') {
            setParseProgress({ progress: 0, stage: 'error', message: task.error || '解析失败' });
            stopPolling();
          } else {
            setParseProgress({
              progress: task.progress || 0,
              message: `解析中...`,
            });
          }
        } catch {
          stopPolling();
        }
      }, 2000);
    },
  });

  // 清理
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { ...mutation, stopPolling };
}

/**
 * URL 解析 JD
 */
export function useParseJDUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { url: string; platform?: string }) =>
      api.post<{ success: boolean; job: Job }>('/job/parse-url', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

/**
 * 更新岗位信息
 */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Job>) =>
      api.put<Job>(`/job/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
}

/**
 * 删除岗位
 */
export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { selectedJobId, selectJob } = useJobStore();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/job/${id}`),
    onSuccess: (_, deletedId) => {
      if (selectedJobId === deletedId) {
        selectJob(null);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}
