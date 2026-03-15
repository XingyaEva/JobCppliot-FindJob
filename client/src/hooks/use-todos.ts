/**
 * FindJob - 待办事项 React Query Hooks
 *
 * Phase A7: Todo CRUD hooks（混合方案 C）
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-client';
import type { TodoItem, TodoPriority } from '../types/api';

// ==================== 待办列表响应 ====================

export interface TodoListResponse {
  active: TodoItem[];
  completed: TodoItem[];
  stats: {
    total: number;
    active: number;
    completed: number;
    auto: number;
    manual: number;
  };
}

// ==================== 获取待办列表 ====================

export function useTodos() {
  return useQuery({
    queryKey: queryKeys.todos.list(),
    queryFn: () => api.get<TodoListResponse>('/todos'),
    staleTime: 30 * 1000, // 30 秒
  });
}

// ==================== 创建待办 ====================

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { text: string; priority?: TodoPriority; dueTime?: string }) =>
      api.post<TodoItem>('/todos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

// ==================== 更新待办 ====================

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<TodoItem>) =>
      api.put<TodoItem>(`/todos/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

// ==================== 完成待办 ====================

export function useCompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.put<TodoItem>(`/todos/${id}`, { completed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

// ==================== 关闭自动待办 ====================

export function useDismissTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.put<TodoItem>(`/todos/${id}`, { dismissed: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

// ==================== 删除待办 ====================

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/todos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}
