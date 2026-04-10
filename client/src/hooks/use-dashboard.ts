/**
 * FindJob - Dashboard React Query Hooks
 *
 * Phase A7: 用户看板 7 个查询 hooks + 1 个 mutation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type {
  DashboardSummary,
  DashboardFunnel,
  DashboardActivityTrend,
  DashboardSkillRadar,
  DashboardActivity,
  DashboardInsight,
  WeeklyGoal,
} from '../types/api';

// ==================== 1. KPI 概览 ====================

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.userDashboard.summary(),
    queryFn: () => api.get<{
      trackedJobs: number;
      appliedJobs: number;
      interviewCount: number;
      offerCount: number;
      weeklyChange: {
        tracked: number;
        applied: number;
        interview: number;
      };
    }>('/user/dashboard/summary'),
    staleTime: 60 * 1000, // 1 分钟
  });
}

// ==================== 2. 求职漏斗 ====================

export function useDashboardFunnel() {
  return useQuery({
    queryKey: queryKeys.userDashboard.funnel(),
    queryFn: () => api.get<{
      stages: Array<{
        stage: string;
        count: number;
        rate: number;
      }>;
    }>('/user/dashboard/funnel'),
    staleTime: 60 * 1000,
  });
}

// ==================== 3. 活跃趋势 ====================

export function useDashboardActivityTrend(weeks: number = 4) {
  return useQuery({
    queryKey: queryKeys.userDashboard.activityTrend(),
    queryFn: () => api.get<{
      weeks: Array<{
        week: string;
        parseJobs: number;
        applyResumes: number;
        interviewPrep: number;
      }>;
    }>(`/user/dashboard/activity-trend?weeks=${weeks}`),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== 4. 能力雷达 ====================

export function useDashboardSkillRadar() {
  return useQuery({
    queryKey: queryKeys.userDashboard.skillRadar(),
    queryFn: () => api.get<{
      dimensions: Array<{
        dimension: string;
        score: number;
        fullMark: number;
      }>;
      overallScore: number;
      matchCount: number;
    }>('/user/dashboard/skill-radar'),
    staleTime: 2 * 60 * 1000,
  });
}

// ==================== 5. 近期动态 ====================

export function useDashboardActivities(limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.userDashboard.activities(),
    queryFn: () => api.get<{
      activities: Array<{
        id: string;
        type: string;
        title: string;
        time: string;
      }>;
    }>(`/user/dashboard/activities?limit=${limit}`),
    staleTime: 30 * 1000,
  });
}

// ==================== 6. AI 洞察 ====================

export function useDashboardInsights() {
  return useQuery({
    queryKey: queryKeys.userDashboard.insights(),
    queryFn: () => api.get<{
      insights: Array<{
        id: string;
        type: 'opportunity' | 'improvement' | 'preparation' | 'warning';
        title: string;
        description: string;
        action: string;
        actionPath: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    }>('/user/dashboard/insights'),
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== 7. 周目标 ====================

export function useWeeklyGoals() {
  return useQuery({
    queryKey: queryKeys.userDashboard.weeklyGoals(),
    queryFn: () => api.get<{
      goals: WeeklyGoal[];
      completed: number;
      total: number;
    }>('/user/dashboard/weekly-goals'),
    staleTime: 30 * 1000,
  });
}

export function useUpdateWeeklyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<WeeklyGoal>) =>
      api.put(`/user/dashboard/weekly-goals/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userDashboard.weeklyGoals() });
    },
  });
}

export function useCreateWeeklyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { text: string; target: number }) =>
      api.post('/user/dashboard/weekly-goals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userDashboard.weeklyGoals() });
    },
  });
}

export function useDeleteWeeklyGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/user/dashboard/weekly-goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userDashboard.weeklyGoals() });
    },
  });
}
