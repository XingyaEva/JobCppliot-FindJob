/**
 * 统一布局组件
 * 包含导航栏、面包屑、页脚
 */

import type { FC, PropsWithChildren } from 'hono/jsx'

// 面包屑配置
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

// 布局属性
export interface LayoutProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  showNav?: boolean;
  showFooter?: boolean;
  activeNav?: 'home' | 'jobs' | 'resume' | 'settings';
}

/**
 * 导航栏组件
 */
export const Navbar: FC<{ active?: string }> = ({ active }) => {
  const navItems = [
    { id: 'home', href: '/', icon: 'fa-home', label: '首页' },
    { id: 'jobs', href: '/jobs', icon: 'fa-briefcase', label: '岗位库' },
    { id: 'resume', href: '/resume', icon: 'fa-file-alt', label: '我的简历' },
  ];

  return (
    <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" class="flex items-center gap-2 font-bold text-lg">
            <span class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
              <i class="fas fa-robot"></i>
            </span>
            <span class="hidden sm:inline">Job Copilot</span>
          </a>

          {/* 导航菜单 */}
          <nav class="flex items-center gap-1">
            {navItems.map(item => (
              <a 
                href={item.href}
                class={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active === item.id 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i class={`fas ${item.icon} mr-1.5`}></i>
                <span class="hidden sm:inline">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* 右侧操作 */}
          <div class="flex items-center gap-2">
            <a 
              href="/job/new" 
              class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              <i class="fas fa-plus mr-1"></i>
              <span class="hidden sm:inline">新建解析</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * 面包屑组件
 */
export const Breadcrumbs: FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
      <a href="/" class="hover:text-gray-700 flex-shrink-0">
        <i class="fas fa-home"></i>
      </a>
      {items.map((item, index) => (
        <>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          {item.href ? (
            <a href={item.href} class="hover:text-gray-700 flex-shrink-0">
              {item.icon && <i class={`fas ${item.icon} mr-1`}></i>}
              {item.label}
            </a>
          ) : (
            <span class="text-gray-900 font-medium flex-shrink-0">
              {item.icon && <i class={`fas ${item.icon} mr-1`}></i>}
              {item.label}
            </span>
          )}
        </>
      ))}
    </nav>
  );
};

/**
 * 页脚组件
 */
export const Footer: FC = () => {
  return (
    <footer class="border-t border-gray-100 mt-auto">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div class="flex items-center gap-4">
            <span>Job Copilot v0.5.0</span>
            <span class="hidden sm:inline">|</span>
            <span class="hidden sm:inline">Phase 5 - 体验优化</span>
          </div>
          <div class="flex items-center gap-4">
            <button 
              onclick="JobCopilot.exportData()" 
              class="hover:text-gray-600 transition-colors"
            >
              <i class="fas fa-download mr-1"></i>导出数据
            </button>
            <button 
              onclick="JobCopilot.clearData()" 
              class="hover:text-red-500 transition-colors"
            >
              <i class="fas fa-trash-alt mr-1"></i>清空数据
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * 操作提示组件
 */
export const ActionHint: FC<{ icon: string; text: string; action?: string; href?: string }> = ({ icon, text, action, href }) => {
  const content = (
    <div class="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <i class={`fas ${icon}`}></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm">{text}</p>
      </div>
      {action && (
        <span class="text-sm font-medium whitespace-nowrap">
          {action} <i class="fas fa-arrow-right ml-1"></i>
        </span>
      )}
    </div>
  );

  if (href) {
    return <a href={href} class="block hover:opacity-80 transition-opacity">{content}</a>;
  }
  return content;
};

/**
 * 空状态组件
 */
export const EmptyState: FC<{ icon: string; title: string; description?: string; action?: { label: string; href: string } }> = 
  ({ icon, title, description, action }) => {
  return (
    <div class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class={`fas ${icon} text-2xl text-gray-400`}></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p class="text-gray-500 mb-4">{description}</p>}
      {action && (
        <a 
          href={action.href} 
          class="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
};

/**
 * 步骤指引组件
 */
export const StepGuide: FC<{ steps: Array<{ icon: string; title: string; description: string; status: 'done' | 'current' | 'pending' }> }> = ({ steps }) => {
  return (
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
      {steps.map((step, index) => (
        <>
          <div class="flex items-center gap-3">
            <div class={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              step.status === 'done' ? 'bg-green-100 text-green-600' :
              step.status === 'current' ? 'bg-blue-500 text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {step.status === 'done' ? (
                <i class="fas fa-check"></i>
              ) : (
                <i class={`fas ${step.icon}`}></i>
              )}
            </div>
            <div class="sm:hidden">
              <p class={`font-medium ${step.status === 'current' ? 'text-blue-600' : 'text-gray-900'}`}>
                {step.title}
              </p>
              <p class="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div class="hidden sm:block w-12 h-0.5 bg-gray-200 mx-2"></div>
          )}
        </>
      ))}
    </div>
  );
};

/**
 * 全局脚本 - 数据管理功能
 */
export const GlobalScripts = () => {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        // 全局命名空间
        window.JobCopilot = window.JobCopilot || {};

        // Toast 通知
        window.JobCopilot.showToast = function(message, type = 'success') {
          const toast = document.createElement('div');
          const bgColor = type === 'success' ? 'bg-green-600' : 
                          type === 'error' ? 'bg-red-600' : 
                          type === 'warning' ? 'bg-yellow-600' : 'bg-gray-800';
          toast.className = 'fixed bottom-4 right-4 ' + bgColor + ' text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-up';
          const icon = type === 'success' ? 'fa-check-circle' : 
                       type === 'error' ? 'fa-times-circle' : 
                       type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
          toast.innerHTML = '<i class="fas ' + icon + '"></i><span>' + message + '</span>';
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        };

        // 导出数据
        window.JobCopilot.exportData = function() {
          const data = {
            jobs: JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]'),
            resumes: JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]'),
            matches: JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]'),
            interviews: JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]'),
            optimizations: JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]'),
            exportedAt: new Date().toISOString(),
            version: '0.5.0'
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'jobcopilot_data_' + new Date().toISOString().split('T')[0] + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          JobCopilot.showToast('数据已导出', 'success');
        };

        // 清空数据
        window.JobCopilot.clearData = function() {
          if (!confirm('确定要清空所有数据吗？此操作不可撤销。')) return;
          
          localStorage.removeItem('jobcopilot_jobs');
          localStorage.removeItem('jobcopilot_resumes');
          localStorage.removeItem('jobcopilot_matches');
          localStorage.removeItem('jobcopilot_interviews');
          localStorage.removeItem('jobcopilot_optimizations');
          
          JobCopilot.showToast('数据已清空', 'success');
          setTimeout(() => location.href = '/', 500);
        };

        // 删除单条岗位
        window.JobCopilot.deleteJob = function(jobId) {
          if (!confirm('确定要删除这个岗位吗？')) return;
          
          const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
          const filtered = jobs.filter(j => j.id !== jobId);
          localStorage.setItem('jobcopilot_jobs', JSON.stringify(filtered));
          
          // 同时删除关联数据
          const matches = JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]');
          localStorage.setItem('jobcopilot_matches', JSON.stringify(matches.filter(m => m.job_id !== jobId)));
          
          const interviews = JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]');
          localStorage.setItem('jobcopilot_interviews', JSON.stringify(interviews.filter(i => i.job_id !== jobId)));
          
          const optimizations = JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]');
          localStorage.setItem('jobcopilot_optimizations', JSON.stringify(optimizations.filter(o => o.job_id !== jobId)));
          
          JobCopilot.showToast('岗位已删除', 'success');
          location.reload();
        };

        // 删除简历
        window.JobCopilot.deleteResume = function(resumeId) {
          if (!confirm('确定要删除这份简历吗？')) return;
          
          const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
          const filtered = resumes.filter(r => r.id !== resumeId);
          localStorage.setItem('jobcopilot_resumes', JSON.stringify(filtered));
          
          JobCopilot.showToast('简历已删除', 'success');
          location.reload();
        };

        // 获取简历状态
        window.JobCopilot.getResumeStatus = function() {
          const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
          return {
            hasResume: resumes.length > 0,
            resumeName: resumes[0]?.basic_info?.name || '未上传'
          };
        };

        // 更新简历状态显示
        document.addEventListener('DOMContentLoaded', function() {
          const statusEl = document.getElementById('resume-status-nav');
          if (statusEl) {
            const status = JobCopilot.getResumeStatus();
            if (status.hasResume) {
              statusEl.innerHTML = '<i class="fas fa-check-circle text-green-500 mr-1"></i>' + status.resumeName;
            }
          }
        });
      `
    }} />
  );
};

/**
 * 全局样式
 */
export const GlobalStyles = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* 动画 */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        /* 骨架屏 */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        /* 加载旋转 */
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 卡片悬停效果 */
        .card-hover {
          transition: all 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        /* 滚动条优化 */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        /* 响应式优化 */
        @media (max-width: 640px) {
          .mobile-full {
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
      `
    }} />
  );
};
