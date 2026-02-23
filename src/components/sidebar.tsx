/**
 * 左侧导航栏组件
 * 包含四个工作台：我的岗位、我的简历、我的面试、我的Offer
 * 每个工作台鼠标悬浮时展示子菜单
 */

import type { FC } from 'hono/jsx'

export interface SidebarProps {
  activeWorkspace?: 'jobs' | 'resume' | 'interview' | 'offer';
  activeMenu?: string;
}

const workspaces = [
  {
    id: 'jobs',
    icon: 'fa-briefcase',
    label: '我的岗位',
    color: 'blue',
    menus: [
      { id: 'job-parse', label: '岗位解析', href: '/job/new', icon: 'fa-magic' },
      { id: 'job-list', label: '岗位列表', href: '/jobs', icon: 'fa-list' },
      { id: 'job-compare', label: '岗位对比', href: '/jobs?view=compare', icon: 'fa-columns' },
    ],
  },
  {
    id: 'resume',
    icon: 'fa-file-alt',
    label: '我的简历',
    color: 'emerald',
    menus: [
      { id: 'resume-lib', label: '简历库', href: '/resumes', icon: 'fa-folder-open' },
      { id: 'resume-optimize', label: '简历优化', href: '/resume', icon: 'fa-wand-magic-sparkles' },
    ],
  },
  {
    id: 'interview',
    icon: 'fa-comments',
    label: '我的面试',
    color: 'purple',
    menus: [
      { id: 'question-bank', label: '面试题库', href: '/questions', icon: 'fa-database' },
      { id: 'interview-coach', label: '面试辅导', href: '/questions/new', icon: 'fa-chalkboard-teacher' },
      { id: 'interview-mock', label: '面试模拟', href: '/questions/import', icon: 'fa-headset' },
    ],
  },
  {
    id: 'offer',
    icon: 'fa-trophy',
    label: '我的Offer',
    color: 'amber',
    menus: [
      { id: 'applications', label: '投递追踪', href: '/applications', icon: 'fa-paper-plane' },
      { id: 'offer-manage', label: 'Offer管理', href: '/applications?status=offer', icon: 'fa-handshake' },
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; hoverBg: string; activeBg: string; activeText: string; iconBg: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', hoverBg: 'hover:bg-blue-50/60', activeBg: 'bg-blue-50', activeText: 'text-blue-700', iconBg: 'bg-blue-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50/60', activeBg: 'bg-emerald-50', activeText: 'text-emerald-700', iconBg: 'bg-emerald-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', hoverBg: 'hover:bg-purple-50/60', activeBg: 'bg-purple-50', activeText: 'text-purple-700', iconBg: 'bg-purple-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', hoverBg: 'hover:bg-amber-50/60', activeBg: 'bg-amber-50', activeText: 'text-amber-700', iconBg: 'bg-amber-100' },
};

export const Sidebar: FC<SidebarProps> = ({ activeWorkspace, activeMenu }) => {
  return (
    <aside class="sidebar-nav w-[220px] min-h-[calc(100vh-56px)] bg-gray-50/70 border-r border-gray-200/80 flex-shrink-0 hidden lg:flex flex-col">
      {/* 工作台列表 */}
      <div class="flex-1 py-4 px-3 space-y-1">
        {workspaces.map((ws) => {
          const colors = colorMap[ws.color];
          const isActive = activeWorkspace === ws.id;

          return (
            <div class="sidebar-group" data-workspace={ws.id}>
              {/* 工作台标题 */}
              <div
                class={`sidebar-trigger flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? `${colors.activeBg} ${colors.activeText} font-semibold`
                    : `text-gray-600 hover:text-gray-900 ${colors.hoverBg}`
                }`}
              >
                <span
                  class={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${
                    isActive ? `${colors.iconBg} ${colors.text}` : 'bg-gray-200/80 text-gray-500'
                  }`}
                >
                  <i class={`fas ${ws.icon}`}></i>
                </span>
                <span class="text-sm flex-1">{ws.label}</span>
                <i class="fas fa-chevron-right text-[10px] text-gray-400 sidebar-arrow transition-transform duration-200"></i>
              </div>

              {/* 子菜单 - 悬浮展开 */}
              <div class={`sidebar-submenu overflow-hidden transition-all duration-200 ${isActive ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div class="pl-5 pr-2 py-1 space-y-0.5">
                  {ws.menus.map((menu) => {
                    const isMenuActive = activeMenu === menu.id;
                    return (
                      <a
                        href={menu.href}
                        class={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isMenuActive
                            ? `${colors.bg} ${colors.text} font-medium`
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
                        }`}
                      >
                        <i class={`fas ${menu.icon} text-xs w-4 text-center`}></i>
                        <span>{menu.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部操作 */}
      <div class="px-3 py-3 border-t border-gray-200/60">
        <a
          href="/settings/feishu"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors"
        >
          <i class="fas fa-cog text-xs w-4 text-center"></i>
          <span>设置</span>
        </a>
        <a
          href="/metrics"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-colors"
        >
          <i class="fas fa-chart-bar text-xs w-4 text-center"></i>
          <span>评测面板</span>
        </a>
      </div>
    </aside>
  );
};

/**
 * 移动端底部导航
 */
export const MobileNav: FC<SidebarProps> = ({ activeWorkspace }) => {
  const mobileItems = [
    { id: 'jobs', icon: 'fa-briefcase', label: '岗位', href: '/jobs' },
    { id: 'resume', icon: 'fa-file-alt', label: '简历', href: '/resumes' },
    { id: 'interview', icon: 'fa-comments', label: '面试', href: '/questions' },
    { id: 'offer', icon: 'fa-trophy', label: 'Offer', href: '/applications' },
  ];

  return (
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-1">
      <div class="flex items-center justify-around">
        {mobileItems.map((item) => (
          <a
            href={item.href}
            class={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              activeWorkspace === item.id
                ? 'text-gray-900 font-medium'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <i class={`fas ${item.icon} text-base`}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

/**
 * 侧边栏交互脚本
 */
export const SidebarScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
      (function() {
        document.querySelectorAll('.sidebar-group').forEach(function(group) {
          var trigger = group.querySelector('.sidebar-trigger');
          var submenu = group.querySelector('.sidebar-submenu');
          var arrow = group.querySelector('.sidebar-arrow');
          
          if (!trigger || !submenu) return;
          
          trigger.addEventListener('click', function() {
            var isOpen = submenu.classList.contains('max-h-48');
            
            // 关闭所有其他展开的菜单
            document.querySelectorAll('.sidebar-group').forEach(function(g) {
              var sm = g.querySelector('.sidebar-submenu');
              var ar = g.querySelector('.sidebar-arrow');
              if (sm && g !== group) {
                sm.classList.remove('max-h-48', 'opacity-100');
                sm.classList.add('max-h-0', 'opacity-0');
              }
              if (ar && g !== group) {
                ar.classList.remove('rotate-90');
              }
            });
            
            // 切换当前菜单
            if (isOpen) {
              submenu.classList.remove('max-h-48', 'opacity-100');
              submenu.classList.add('max-h-0', 'opacity-0');
              arrow.classList.remove('rotate-90');
            } else {
              submenu.classList.remove('max-h-0', 'opacity-0');
              submenu.classList.add('max-h-48', 'opacity-100');
              arrow.classList.add('rotate-90');
            }
          });
          
          // 悬浮打开（可选）
          group.addEventListener('mouseenter', function() {
            var sm = group.querySelector('.sidebar-submenu');
            var ar = group.querySelector('.sidebar-arrow');
            if (sm) {
              sm.classList.remove('max-h-0', 'opacity-0');
              sm.classList.add('max-h-48', 'opacity-100');
            }
            if (ar) ar.classList.add('rotate-90');
          });
          
          group.addEventListener('mouseleave', function() {
            // 如果不是当前活跃的工作台，则收起
            var isActive = trigger.classList.contains('font-semibold');
            if (!isActive) {
              var sm = group.querySelector('.sidebar-submenu');
              var ar = group.querySelector('.sidebar-arrow');
              if (sm) {
                sm.classList.remove('max-h-48', 'opacity-100');
                sm.classList.add('max-h-0', 'opacity-0');
              }
              if (ar) ar.classList.remove('rotate-90');
            }
          });
        });
      })();
    `,
      }}
    />
  );
};
