/**
 * FindJob - 投递记录 / Offer 管理 React Query Hooks
 *
 * A5 新增：对应后端 src/routes/applications.ts
 *
 * API 端点:
 *  GET    /api/applications              → useApplications()
 *  GET    /api/applications/:id          → useApplication(id)
 *  POST   /api/applications              → useCreateApplication()
 *  POST   /api/applications/from-job/:id → useCreateApplicationFromJob()
 *  PUT    /api/applications/:id          → useUpdateApplication()
 *  PUT    /api/applications/:id/status   → useUpdateApplicationStatus()
 *  DELETE /api/applications/:id          → useDeleteApplication()
 *  POST   /api/applications/:id/interview → useAddInterview()
 *  GET    /api/applications/stats/overview → useApplicationStats()
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type { Application, ApplicationStats, ApplicationStatus } from '../types/api';

// ==================== 查询 ====================

/**
 * 获取投递记录列表
 */
export function useApplications(filters?: {
  status?: ApplicationStatus;
  sort?: string;
}) {
  return useQuery({
    queryKey: queryKeys.applications.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const res = await api.get<{
        applications: Application[];
        total: number;
        stats: ApplicationStats;
      }>('/applications', { params: filters as Record<string, string> });
      return res;
    },
  });
}

/**
 * 获取单条投递详情
 */
export function useApplication(id: string | null) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id!),
    queryFn: () => api.get<{ application: Application }>(`/applications/${id}`),
    enabled: !!id,
  });
}

/**
 * 获取投递统计
 */
export function useApplicationStats() {
  return useQuery({
    queryKey: queryKeys.applications.stats(),
    queryFn: () => api.get<{ stats: ApplicationStats }>('/applications/stats/overview'),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== 变更 ====================

/**
 * 创建投递记录
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      company: string;
      position: string;
      job_url?: string;
      status?: ApplicationStatus;
      salary_range?: string;
      notes?: string;
      tags?: string[];
      source?: string;
    }) => api.post<{ application: Application }>('/applications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

/**
 * 从岗位创建投递记录
 */
export function useCreateApplicationFromJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, notes }: { jobId: string; notes?: string }) =>
      api.post<{ application: Application }>(`/applications/from-job/${jobId}`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

/**
 * 更新投递记录
 */
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      api.put<{ application: Application }>(`/applications/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

/**
 * 更新投递状态
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ApplicationStatus; notes?: string }) =>
      api.put<{ application: Application }>(`/applications/${id}/status`, { status, notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

/**
 * 删除投递记录
 */
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

/**
 * 添加面试记录
 */
export function useAddInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: {
        round: string;
        date: string;
        interviewer?: string;
        type?: string;
        notes?: string;
      };
    }) => api.post(`/applications/${applicationId}/interview`, data),
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(applicationId) });
    },
  });
}
