/**
 * FindJob - 简历相关 React Query Hooks
 *
 * A3 扩展版: 新增版本管理、解析进度轮询、更新简历等 hook
 *
 * 后端 API 端点对照:
 *  GET    /api/resume/list          → useResumes()
 *  GET    /api/resume/:id           → useResume(id)
 *  POST   /api/resume/upload-smart  → useUploadResume()
 *  POST   /api/resume/parse-text    → useParseResumeText()
 *  PUT    /api/resume/:id           → useUpdateResume()
 *  DELETE /api/resume/:id           → useDeleteResume()
 *  GET    /api/resume/:id/versions  → useResumeVersions(id)
 *  POST   /api/resume/:id/version   → useCreateResumeVersion()
 *  POST   /api/resume/:id/link/:jid → useLinkResumeToJob()
 *  DELETE /api/resume/:id/link/:jid → useUnlinkResumeFromJob()
 *  GET    /api/resume/by-job/:jobId → useResumesByJob(jobId)
 *  GET    /api/resume/progress/:id  → useResumeProgress(id)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type { Resume } from '../types/api';

// ==================== 类型补充 ====================

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  tag: string;
  source: 'upload' | 'manual' | 'agent' | 'import';
  linked_jd_id?: string;
  snapshot: Record<string, unknown>;
  change_summary?: string;
  created_at: string;
}

export interface ResumeListResponse {
  resumes: Resume[];
  total: number;
  stats?: {
    total: number;
    byStatus?: Record<string, number>;
  };
}

export interface ParseProgress {
  resumeId: string;
  progress: number;
  stage: string;
  message: string;
  startTime: number;
  lastUpdate: number;
  estimatedTimeRemaining: number;
}

// ==================== 查询 ====================

/**
 * 获取简历列表
 */
export function useResumes() {
  return useQuery({
    queryKey: queryKeys.resumes.lists(),
    queryFn: async () => {
      const res = await api.get<ResumeListResponse>('/resume/list');
      // 后端返回 { success, resumes, total, stats }
      // api.ts 已处理 success 包装，直接返回 data
      return res;
    },
  });
}

/**
 * 获取单个简历详情
 */
export function useResume(resumeId: string | null) {
  return useQuery({
    queryKey: queryKeys.resumes.detail(resumeId!),
    queryFn: async () => {
      const res = await api.get<{ resume: Resume }>(`/resume/${resumeId}`);
      return (res as any)?.resume ?? res;
    },
    enabled: !!resumeId,
  });
}

/**
 * 获取简历版本历史
 */
export function useResumeVersions(resumeId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.resumes.detail(resumeId!), 'versions'],
    queryFn: async () => {
      const res = await api.get<{ versions: ResumeVersion[]; total: number }>(
        `/resume/${resumeId}/versions`
      );
      return (res as any)?.versions ?? res;
    },
    enabled: !!resumeId,
  });
}

/**
 * 获取岗位关联的简历
 */
export function useResumesByJob(jobId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.resumes.lists(), 'by-job', jobId!],
    queryFn: async () => {
      const res = await api.get<{ resumes: Resume[]; total: number }>(
        `/resume/by-job/${jobId}`
      );
      return (res as any)?.resumes ?? res;
    },
    enabled: !!jobId,
  });
}

/**
 * 轮询简历解析进度
 * - 仅在 enabled=true 时轮询
 * - 进度达到 100 或 stage='completed'/'error' 时自动停止
 */
export function useResumeProgress(resumeId: string | null, enabled = false) {
  return useQuery({
    queryKey: [...queryKeys.resumes.detail(resumeId!), 'progress'],
    queryFn: async () => {
      const res = await api.get<{ progress: ParseProgress }>(
        `/resume/progress/${resumeId}`,
        { silent: true }
      );
      return (res as any)?.progress ?? res;
    },
    enabled: !!resumeId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data as ParseProgress | undefined;
      if (!data) return 2000;
      if (data.progress >= 100 || data.stage === 'completed' || data.stage === 'error') {
        return false; // 停止轮询
      }
      return 2000; // 2s 轮询一次
    },
  });
}

// ==================== 变更 ====================

/**
 * 上传简历（智能解析）
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      api.upload<{ resume: Resume }>('/resume/upload-smart', formData, {
        timeout: 120000,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

/**
 * 文本方式解析简历
 */
export function useParseResumeText() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { content: string; name?: string }) =>
      api.post<{ resume: Resume }>('/resume/parse-text', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

/**
 * 更新简历内容（自动创建版本）
 */
export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resumeId,
      data,
    }: {
      resumeId: string;
      data: {
        name?: string;
        basic_info?: Resume['basic_info'];
        education?: Resume['education'];
        work_experience?: Resume['work_experience'];
        projects?: Resume['projects'];
        skills?: Resume['skills'];
        ability_tags?: Resume['ability_tags'];
        version_tag?: string;
        createVersion?: boolean;
      };
    }) => api.put<{ resume: Resume }>(`/resume/${resumeId}`, data),
    onSuccess: (_, { resumeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.detail(resumeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

/**
 * 删除简历
 */
export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/resume/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

/**
 * 手动创建版本
 */
export function useCreateResumeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resumeId,
      tag,
      linked_jd_id,
    }: {
      resumeId: string;
      tag?: string;
      linked_jd_id?: string;
    }) =>
      api.post<{ version: ResumeVersion }>(`/resume/${resumeId}/version`, {
        tag,
        linked_jd_id,
      }),
    onSuccess: (_, { resumeId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.resumes.detail(resumeId), 'versions'],
      });
    },
  });
}

/**
 * 关联简历到岗位
 */
export function useLinkResumeToJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
      api.post<{ resume: Resume }>(`/resume/${resumeId}/link/${jobId}`),
    onSuccess: (_, { resumeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.detail(resumeId) });
    },
  });
}

/**
 * 取消关联简历与岗位
 */
export function useUnlinkResumeFromJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
      api.delete<{ resume: Resume }>(`/resume/${resumeId}/link/${jobId}`),
    onSuccess: (_, { resumeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.detail(resumeId) });
    },
  });
}
