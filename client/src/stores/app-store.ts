/**
 * FindJob - 全局 App 状态 (Zustand)
 *
 * 管理全局 UI 状态：侧边栏、主题、通知等
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStoreState {
  // 侧边栏
  sidebarCollapsed: boolean;
  sidebarWidth: number;

  // 主题
  theme: 'light' | 'dark' | 'system';

  // AI 助手
  aiAssistantOpen: boolean;
  aiAssistantMinimized: boolean;

  // 全局 loading
  globalLoading: boolean;
  globalLoadingText: string;

  // Actions
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleAIAssistant: () => void;
  setAIAssistantOpen: (open: boolean) => void;
  minimizeAIAssistant: () => void;
  setGlobalLoading: (loading: boolean, text?: string) => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarWidth: 256,
      theme: 'light',
      aiAssistantOpen: false,
      aiAssistantMinimized: false,
      globalLoading: false,
      globalLoadingText: '',

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      setTheme: (theme) => set({ theme }),

      toggleAIAssistant: () =>
        set((state) => ({
          aiAssistantOpen: !state.aiAssistantOpen,
          aiAssistantMinimized: false,
        })),

      setAIAssistantOpen: (open) =>
        set({ aiAssistantOpen: open, aiAssistantMinimized: false }),

      minimizeAIAssistant: () =>
        set({ aiAssistantMinimized: true }),

      setGlobalLoading: (loading, text = '') =>
        set({ globalLoading: loading, globalLoadingText: text }),
    }),
    {
      name: 'findjob-app',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        theme: state.theme,
      }),
    }
  )
);

export default useAppStore;
