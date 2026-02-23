/**
 * AppShell - 应用外壳组件
 * 统一的顶部导航 + 侧边栏 + 内容区布局
 */

import type { FC } from 'hono/jsx'
import { Sidebar, MobileNav, SidebarScript } from './sidebar'
import type { SidebarProps } from './sidebar'

export interface AppShellProps extends SidebarProps {
  title?: string;
  showSidebar?: boolean;
  headerRight?: any;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

/**
 * 顶部导航条 - 极简设计
 */
export const TopBar: FC<{ headerRight?: any }> = ({ headerRight }) => {
  return (
    <header class="sticky top-0 z-50 h-14 border-b border-gray-200/60 glass">
      <div class="h-full px-5 flex items-center justify-between">
        {/* 左侧 Logo */}
        <a href="/" class="flex items-center gap-2.5 group">
          <span class="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white text-sm group-hover:bg-gray-700 transition-colors">
            <i class="fas fa-rocket text-xs"></i>
          </span>
          <span class="font-semibold text-gray-900 text-base tracking-tight">
            Job Copilot
          </span>
        </a>

        {/* 右侧操作 */}
        <div class="flex items-center gap-3">
          {headerRight || (
            <>
              <span id="resume-status-nav" class="hidden sm:flex text-xs text-gray-400 items-center gap-1">
                <i class="fas fa-user-circle"></i>
                <span>未上传简历</span>
              </span>
              <a
                href="/job/new"
                class="px-4 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              >
                <i class="fas fa-plus text-xs"></i>
                <span class="hidden sm:inline">新建解析</span>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * 面包屑导航
 */
export const Breadcrumb: FC<{ items: Array<{ label: string; href?: string }> }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <nav class="flex items-center gap-1.5 text-sm text-gray-400 mb-5">
      <a href="/" class="hover:text-gray-600 transition-colors">
        <i class="fas fa-home text-xs"></i>
      </a>
      {items.map((item) => (
        <>
          <i class="fas fa-chevron-right text-[9px]"></i>
          {item.href ? (
            <a href={item.href} class="hover:text-gray-600 transition-colors">{item.label}</a>
          ) : (
            <span class="text-gray-700 font-medium">{item.label}</span>
          )}
        </>
      ))}
    </nav>
  );
};

/**
 * AppShell - 完整的应用外壳
 */
export const AppShell: FC<AppShellProps> = ({
  children,
  activeWorkspace,
  activeMenu,
  showSidebar = true,
  headerRight,
  breadcrumb,
}) => {
  return (
    <div class="min-h-screen flex flex-col bg-white">
      {/* 顶部导航 */}
      <TopBar headerRight={headerRight} />

      {/* 主体：侧边栏 + 内容 */}
      <div class="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        {showSidebar && (
          <Sidebar activeWorkspace={activeWorkspace} activeMenu={activeMenu} />
        )}

        {/* 内容区 */}
        <main class={`flex-1 overflow-y-auto main-content ${showSidebar ? '' : ''}`}>
          {breadcrumb && breadcrumb.length > 0 && (
            <div class="px-6 pt-5">
              <Breadcrumb items={breadcrumb} />
            </div>
          )}
          {children}
        </main>
      </div>

      {/* 移动端底部导航 */}
      {showSidebar && <MobileNav activeWorkspace={activeWorkspace} />}

      {/* 侧边栏交互脚本 */}
      {showSidebar && <SidebarScript />}

      {/* 简历状态更新 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var statusEl = document.getElementById('resume-status-nav');
            if (statusEl && window.JobCopilot) {
              var status = JobCopilot.getResumeStatus();
              if (status.hasResume) {
                statusEl.innerHTML = '<i class="fas fa-check-circle text-emerald-500"></i><span>' + status.resumeName + '</span>';
              }
            }
          });
        `
      }} />
    </div>
  );
};
