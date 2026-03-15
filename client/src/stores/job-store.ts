/**
 * FindJob - 岗位状态管理 (Zustand)
 *
 * 管理当前选中岗位、解析进度等客户端状态
 * 列表数据由 React Query 管理，此处仅管理 UI 状态
 */

import { create } from 'zustand';

interface JobStoreState {
  // 当前选中的岗位 ID
  selectedJobId: string | null;

  // JD 解析进度
  parseProgress: {
    isActive: boolean;
    taskId: string | null;
    progress: number; // 0-100
    stage: string;
    message: string;
  };

  // 详情面板是否展开
  isDetailOpen: boolean;

  // 当前视图模式
  viewMode: 'list' | 'grid';

  // 过滤器
  filters: {
    status?: string;
    searchQuery?: string;
    sortBy?: 'date' | 'match' | 'company';
    sortOrder?: 'asc' | 'desc';
  };

  // Actions
  selectJob: (id: string | null) => void;
  setParseProgress: (progress: Partial<JobStoreState['parseProgress']>) => void;
  resetParseProgress: () => void;
  toggleDetail: () => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setFilters: (filters: Partial<JobStoreState['filters']>) => void;
  resetFilters: () => void;
}

const initialParseProgress = {
  isActive: false,
  taskId: null,
  progress: 0,
  stage: '',
  message: '',
};

export const useJobStore = create<JobStoreState>()((set) => ({
  selectedJobId: null,
  parseProgress: { ...initialParseProgress },
  isDetailOpen: false,
  viewMode: 'list',
  filters: {
    sortBy: 'date',
    sortOrder: 'desc',
  },

  selectJob: (id) =>
    set({ selectedJobId: id, isDetailOpen: id !== null }),

  setParseProgress: (progress) =>
    set((state) => ({
      parseProgress: { ...state.parseProgress, ...progress },
    })),

  resetParseProgress: () =>
    set({ parseProgress: { ...initialParseProgress } }),

  toggleDetail: () =>
    set((state) => ({ isDetailOpen: !state.isDetailOpen })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () =>
    set({
      filters: {
        sortBy: 'date',
        sortOrder: 'desc',
      },
    }),
}));

export default useJobStore;
