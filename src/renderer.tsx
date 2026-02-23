import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Job Copilot - 智能求职助手'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: '#1d1d1f',
                    secondary: '#86868b',
                    surface: '#fbfbfd',
                    accent: '#0071e3',
                    'accent-hover': '#0077ED',
                    success: '#34C759',
                    warning: '#FF9F0A',
                    error: '#FF3B30',
                    info: '#007AFF',
                  },
                  fontFamily: {
                    sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans SC', 'PingFang SC', 'sans-serif'],
                  },
                  borderRadius: {
                    'apple': '12px',
                    'apple-lg': '16px',
                    'apple-xl': '20px',
                  },
                  boxShadow: {
                    'apple-sm': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                    'apple': '0 2px 12px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.08)',
                    'apple-lg': '0 8px 30px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)',
                    'apple-hover': '0 12px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.08)',
                  }
                }
              }
            }
          `
        }} />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* ===== Apple Design System ===== */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans SC', 'PingFang SC', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              letter-spacing: -0.01em;
            }

            /* === Layout: Hide legacy nav/footer from old pages === */
            #app-content > div > header.sticky,
            #app-content > div > header.border-b,
            #app-content > div > footer.border-t,
            #app-content > .min-h-screen > header.sticky,
            #app-content > .min-h-screen > header.border-b,
            #app-content > .min-h-screen > footer.border-t {
              display: none !important;
            }
            #app-content > div,
            #app-content > .min-h-screen {
              min-height: auto !important;
            }

            /* === Frosted Glass === */
            .glass-panel {
              backdrop-filter: saturate(180%) blur(20px);
              -webkit-backdrop-filter: saturate(180%) blur(20px);
              background: rgba(251,251,253,0.72);
            }
            .glass-nav {
              backdrop-filter: saturate(180%) blur(20px);
              -webkit-backdrop-filter: saturate(180%) blur(20px);
              background: rgba(255,255,255,0.72);
            }
            .glass-card {
              backdrop-filter: saturate(120%) blur(16px);
              -webkit-backdrop-filter: saturate(120%) blur(16px);
              background: rgba(255,255,255,0.6);
              border: 1px solid rgba(0,0,0,0.04);
            }

            /* === Animations === */
            @keyframes apple-fade-in {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes apple-scale-in {
              from { opacity: 0; transform: scale(0.98); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes pulse-soft {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.6; }
            }
            .animate-apple-fade { animation: apple-fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            .animate-apple-scale { animation: apple-scale-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            .animate-slide-up { animation: apple-fade-in 0.3s ease-out; }
            .animate-fade-in { animation: apple-fade-in 0.4s ease-out; }
            .skeleton { background: linear-gradient(90deg, #f5f5f7 25%, #ececee 50%, #f5f5f7 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
            .loading-spinner { animation: spin 1s linear infinite; }

            /* === Apple Card Hover === */
            .card-hover {
              transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            .card-hover:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 40px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.08);
            }

            /* === Sidebar === */
            .sidebar-nav {
              transition: width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* Sidebar group styling */
            .sidebar-group .sidebar-trigger {
              transition: all 0.2s ease;
            }
            .sidebar-group .sidebar-trigger:hover {
              background: rgba(0,0,0,0.03);
            }
            .sidebar-group .sidebar-trigger.active {
              background: rgba(0,0,0,0.04);
            }
            .sidebar-group .sidebar-submenu a {
              transition: all 0.15s ease;
              border-radius: 8px;
            }
            .sidebar-group .sidebar-submenu a:hover {
              background: rgba(0,0,0,0.04);
            }
            .sidebar-group .sidebar-submenu a.active-link {
              background: rgba(0,113,227,0.08);
              color: #0071e3;
              font-weight: 500;
            }

            /* === Scrollbar === */
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }

            /* === Mobile === */
            @media (max-width: 1023px) { #app-content { padding-bottom: 64px; } }
            @media (max-width: 640px) { .mobile-full { width: 100% !important; margin: 0 !important; } }

            /* === SF Pro Typography Helpers === */
            .text-headline { font-size: 28px; font-weight: 600; line-height: 1.14; letter-spacing: -0.015em; }
            .text-title { font-size: 21px; font-weight: 600; line-height: 1.19; letter-spacing: -0.01em; }
            .text-body { font-size: 17px; font-weight: 400; line-height: 1.47; letter-spacing: -0.005em; }
            .text-callout { font-size: 16px; font-weight: 400; line-height: 1.38; }
            .text-subhead { font-size: 15px; font-weight: 400; line-height: 1.33; letter-spacing: -0.003em; }
            .text-footnote { font-size: 13px; font-weight: 400; line-height: 1.38; letter-spacing: -0.003em; }
            .text-caption { font-size: 12px; font-weight: 400; line-height: 1.33; }

            /* === Agent Status === */
            .agent-pending { background-color: #E5E7EB; }
            .agent-running { background-color: #007AFF; animation: pulse-soft 1.5s infinite; }
            .agent-completed { background-color: #34C759; }
            .agent-error { background-color: #FF3B30; }

            /* === Collapse === */
            .collapse-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
            .collapse-content.open { max-height: 2000px; }

            /* === Tab === */
            .tab-active { border-bottom: 2px solid #1d1d1f; }

            /* === Copy feedback === */
            .copy-success { animation: copy-flash 0.3s ease; }
            @keyframes copy-flash { 0% { background-color: #34C759; } 100% { background-color: transparent; } }
          `
        }} />
      </head>
      <body class="bg-surface text-primary antialiased">
        {/* ===== Apple-style Global Layout ===== */}
        <div class="min-h-screen flex flex-col">

          {/* === Top Navigation Bar === */}
          <nav class="sticky top-0 z-50 h-12 border-b border-black/[0.06] glass-nav">
            <div class="h-full px-5 flex items-center justify-between">
              {/* Logo */}
              <a href="/" class="flex items-center gap-2.5 group">
                <span class="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-b from-gray-800 to-black text-white shadow-sm">
                  <i class="fas fa-rocket text-[10px]"></i>
                </span>
                <span class="font-semibold text-[15px] text-primary tracking-tight">Job Copilot</span>
              </a>

              {/* Right actions */}
              <div class="flex items-center gap-3">
                <span id="resume-status-nav" class="hidden sm:flex text-footnote text-secondary items-center gap-1.5">
                  <i class="fas fa-user-circle text-[11px]"></i><span>未上传简历</span>
                </span>
                <a href="/job/new" class="inline-flex items-center gap-1.5 px-3.5 py-[6px] bg-accent text-white text-[13px] font-medium rounded-full hover:bg-accent-hover transition-all shadow-sm active:scale-[0.97]">
                  <i class="fas fa-plus text-[10px]"></i><span class="hidden sm:inline">新建解析</span>
                </a>
              </div>
            </div>
          </nav>

          {/* === Body: Sidebar + Content === */}
          <div class="flex flex-1 overflow-hidden">

            {/* Sidebar - Desktop */}
            <aside id="sidebar" class="sidebar-nav w-[230px] min-h-[calc(100vh-48px)] bg-surface/80 border-r border-black/[0.06] flex-shrink-0 hidden lg:flex flex-col">
              
              {/* Workspace groups */}
              <div class="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto" id="sidebar-workspaces">

                {/* -- 我的岗位 -- */}
                <div class="sidebar-group" data-workspace="jobs">
                  <div class="sidebar-trigger flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] cursor-pointer text-primary/70 hover:text-primary">
                    <span class="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[11px] bg-blue-500/10 text-blue-600">
                      <i class="fas fa-briefcase"></i>
                    </span>
                    <span class="text-[13px] font-medium flex-1">我的岗位</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[42px] pr-2 py-0.5 space-y-px">
                      <a href="/job/new" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-wand-magic-sparkles text-[10px] w-4 text-center"></i><span>岗位解析</span></a>
                      <a href="/jobs" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-list text-[10px] w-4 text-center"></i><span>岗位列表</span></a>
                      <a href="/jobs?view=compare" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-columns text-[10px] w-4 text-center"></i><span>岗位对比</span></a>
                    </div>
                  </div>
                </div>

                {/* -- 我的简历 -- */}
                <div class="sidebar-group" data-workspace="resume">
                  <div class="sidebar-trigger flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] cursor-pointer text-primary/70 hover:text-primary">
                    <span class="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[11px] bg-emerald-500/10 text-emerald-600">
                      <i class="fas fa-file-alt"></i>
                    </span>
                    <span class="text-[13px] font-medium flex-1">我的简历</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[42px] pr-2 py-0.5 space-y-px">
                      <a href="/resumes" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-folder-open text-[10px] w-4 text-center"></i><span>简历库</span></a>
                      <a href="/resume" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-wand-magic-sparkles text-[10px] w-4 text-center"></i><span>简历优化</span></a>
                    </div>
                  </div>
                </div>

                {/* -- 我的面试 -- */}
                <div class="sidebar-group" data-workspace="interview">
                  <div class="sidebar-trigger flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] cursor-pointer text-primary/70 hover:text-primary">
                    <span class="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[11px] bg-purple-500/10 text-purple-600">
                      <i class="fas fa-comments"></i>
                    </span>
                    <span class="text-[13px] font-medium flex-1">我的面试</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[42px] pr-2 py-0.5 space-y-px">
                      <a href="/questions" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-database text-[10px] w-4 text-center"></i><span>面试题库</span></a>
                      <a href="/questions/new" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-chalkboard-teacher text-[10px] w-4 text-center"></i><span>面试辅导</span></a>
                      <a href="/questions/import" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-headset text-[10px] w-4 text-center"></i><span>面试模拟</span></a>
                    </div>
                  </div>
                </div>

                {/* -- 我的Offer -- */}
                <div class="sidebar-group" data-workspace="offer">
                  <div class="sidebar-trigger flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] cursor-pointer text-primary/70 hover:text-primary">
                    <span class="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[11px] bg-amber-500/10 text-amber-600">
                      <i class="fas fa-trophy"></i>
                    </span>
                    <span class="text-[13px] font-medium flex-1">我的Offer</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[42px] pr-2 py-0.5 space-y-px">
                      <a href="/applications" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-paper-plane text-[10px] w-4 text-center"></i><span>投递追踪</span></a>
                      <a href="/applications?status=offer" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-handshake text-[10px] w-4 text-center"></i><span>Offer管理</span></a>
                      <a href="/applications?view=compare" class="flex items-center gap-2 px-2.5 py-[7px] text-[13px] text-primary/55 hover:text-primary"><i class="fas fa-scale-balanced text-[10px] w-4 text-center"></i><span>Offer对比</span></a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom utility links */}
              <div class="px-3 py-2.5 border-t border-black/[0.04]">
                <a href="/settings/feishu" class="flex items-center gap-2.5 px-3 py-[7px] rounded-[8px] text-[13px] text-primary/40 hover:text-primary/70 hover:bg-black/[0.03] transition-colors">
                  <i class="fas fa-gear text-[10px] w-4 text-center"></i><span>设置</span>
                </a>
                <a href="/metrics" class="flex items-center gap-2.5 px-3 py-[7px] rounded-[8px] text-[13px] text-primary/40 hover:text-primary/70 hover:bg-black/[0.03] transition-colors">
                  <i class="fas fa-chart-bar text-[10px] w-4 text-center"></i><span>评测面板</span>
                </a>
              </div>
            </aside>

            {/* Content area */}
            <div id="app-content" class="flex-1 overflow-y-auto bg-surface">
              {children}
            </div>
          </div>

          {/* === Mobile Bottom Navigation === */}
          <div class="lg:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-black/[0.06] z-50 safe-area-bottom">
            <div class="flex items-center justify-around px-2 py-1.5">
              <a href="/jobs" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors">
                <i class="fas fa-briefcase text-[16px]"></i><span>岗位</span>
              </a>
              <a href="/resumes" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors">
                <i class="fas fa-file-alt text-[16px]"></i><span>简历</span>
              </a>
              <a href="/job/new" class="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white shadow-md active:scale-95 transition-transform">
                <i class="fas fa-plus text-[14px]"></i>
              </a>
              <a href="/questions" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors">
                <i class="fas fa-comments text-[16px]"></i><span>面试</span>
              </a>
              <a href="/applications" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors">
                <i class="fas fa-trophy text-[16px]"></i><span>Offer</span>
              </a>
            </div>
          </div>
        </div>

        {/* ===== Sidebar Interaction Script ===== */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var path = window.location.pathname;
              var search = window.location.search;
              var fullPath = path + search;
              var activeWorkspace = null;

              if (path === '/' || path === '') activeWorkspace = null;
              else if (path.startsWith('/job') || path.startsWith('/jobs')) activeWorkspace = 'jobs';
              else if (path.startsWith('/resume') || path.startsWith('/resumes')) activeWorkspace = 'resume';
              else if (path.startsWith('/question')) activeWorkspace = 'interview';
              else if (path.startsWith('/application')) activeWorkspace = 'offer';

              // Highlight active submenu link
              document.querySelectorAll('#sidebar-workspaces a').forEach(function(link) {
                var href = link.getAttribute('href');
                if (href === fullPath || href === path) {
                  link.classList.add('active-link');
                }
              });

              document.querySelectorAll('.sidebar-group').forEach(function(group) {
                var trigger = group.querySelector('.sidebar-trigger');
                var submenu = group.querySelector('.sidebar-submenu');
                var arrow = group.querySelector('.sidebar-arrow');
                var ws = group.dataset.workspace;

                if (!trigger || !submenu) return;

                // Auto expand active workspace
                if (ws === activeWorkspace) {
                  submenu.classList.remove('max-h-0', 'opacity-0');
                  submenu.classList.add('max-h-48', 'opacity-100');
                  if (arrow) arrow.classList.add('rotate-90');
                  trigger.classList.add('active');
                }

                // Click toggle
                trigger.addEventListener('click', function() {
                  var isOpen = submenu.classList.contains('max-h-48');

                  // Close others
                  document.querySelectorAll('.sidebar-group').forEach(function(g) {
                    if (g !== group) {
                      var sm = g.querySelector('.sidebar-submenu');
                      var ar = g.querySelector('.sidebar-arrow');
                      if (sm) { sm.classList.remove('max-h-48', 'opacity-100'); sm.classList.add('max-h-0', 'opacity-0'); }
                      if (ar) ar.classList.remove('rotate-90');
                    }
                  });

                  if (isOpen) {
                    submenu.classList.remove('max-h-48', 'opacity-100');
                    submenu.classList.add('max-h-0', 'opacity-0');
                    if (arrow) arrow.classList.remove('rotate-90');
                  } else {
                    submenu.classList.remove('max-h-0', 'opacity-0');
                    submenu.classList.add('max-h-48', 'opacity-100');
                    if (arrow) arrow.classList.add('rotate-90');
                  }
                });

                // Hover expand
                group.addEventListener('mouseenter', function() {
                  submenu.classList.remove('max-h-0', 'opacity-0');
                  submenu.classList.add('max-h-48', 'opacity-100');
                  if (arrow) arrow.classList.add('rotate-90');
                });
                group.addEventListener('mouseleave', function() {
                  if (ws !== activeWorkspace) {
                    submenu.classList.remove('max-h-48', 'opacity-100');
                    submenu.classList.add('max-h-0', 'opacity-0');
                    if (arrow) arrow.classList.remove('rotate-90');
                  }
                });
              });

              // Mobile bottom nav highlight
              document.querySelectorAll('.mobile-tab').forEach(function(link) {
                var href = link.getAttribute('href');
                if (href && path.startsWith(href.split('?')[0])) {
                  link.classList.remove('text-secondary');
                  link.classList.add('text-primary', 'font-medium');
                }
              });
            })();
          `
        }} />

        {/* ===== Global Utilities Script ===== */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.JobCopilot = window.JobCopilot || {};

            window.JobCopilot.showToast = function(message, type) {
              type = type || 'success';
              var toast = document.createElement('div');
              var colors = { success: '#34C759', error: '#FF3B30', warning: '#FF9F0A', info: '#007AFF' };
              var icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
              toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:14px;font-size:14px;font-weight:500;color:white;box-shadow:0 8px 30px rgba(0,0,0,0.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:all 0.3s;background:' + (colors[type] || colors.info);
              toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
              document.body.appendChild(toast);
              setTimeout(function() {
                toast.style.opacity = '0'; toast.style.transform = 'translateY(12px)';
                setTimeout(function() { toast.remove(); }, 300);
              }, 3000);
            };

            window.JobCopilot.exportData = function() {
              var data = { jobs: JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]'), resumes: JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]'), matches: JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]'), interviews: JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]'), optimizations: JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]'), exportedAt: new Date().toISOString(), version: '1.0.0' };
              var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'jobcopilot_data_' + new Date().toISOString().split('T')[0] + '.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
              JobCopilot.showToast('数据已导出');
            };

            window.JobCopilot.clearData = function() {
              if (!confirm('确定要清空所有数据吗？此操作不可撤销。')) return;
              ['jobcopilot_jobs','jobcopilot_resumes','jobcopilot_matches','jobcopilot_interviews','jobcopilot_optimizations'].forEach(function(k){localStorage.removeItem(k);});
              JobCopilot.showToast('数据已清空');
              setTimeout(function() { location.href = '/'; }, 500);
            };

            window.JobCopilot.deleteJob = function(jobId) {
              if (!confirm('确定要删除这个岗位吗？')) return;
              var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
              localStorage.setItem('jobcopilot_jobs', JSON.stringify(jobs.filter(function(j){return j.id !== jobId;})));
              ['jobcopilot_matches','jobcopilot_interviews','jobcopilot_optimizations'].forEach(function(k){
                var arr = JSON.parse(localStorage.getItem(k) || '[]');
                localStorage.setItem(k, JSON.stringify(arr.filter(function(x){return x.job_id !== jobId;})));
              });
              JobCopilot.showToast('岗位已删除'); location.reload();
            };

            window.JobCopilot.deleteResume = function(resumeId) {
              if (!confirm('确定要删除这份简历吗？')) return;
              var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes.filter(function(r){return r.id !== resumeId;})));
              JobCopilot.showToast('简历已删除'); location.reload();
            };

            window.JobCopilot.getResumeStatus = function() {
              var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              return { hasResume: resumes.length > 0, resumeName: resumes[0] && resumes[0].basic_info ? resumes[0].basic_info.name : '未上传' };
            };

            // Resume status
            document.addEventListener('DOMContentLoaded', function() {
              var el = document.getElementById('resume-status-nav');
              if (el && window.JobCopilot) {
                var s = JobCopilot.getResumeStatus();
                if (s.hasResume) el.innerHTML = '<i class="fas fa-check-circle" style="color:#34C759"></i><span>' + s.resumeName + '</span>';
              }
            });

            // Metrics
            var METRICS_KEY = 'jobcopilot_metrics';
            window.JobCopilot.saveMetrics = function(m){if(!m)return;try{var d=JSON.parse(localStorage.getItem(METRICS_KEY)||'[]');m.id='metric_'+Date.now()+'_'+Math.random().toString(36).substr(2,6);d.push(m);if(d.length>1000)d=d.slice(-1000);localStorage.setItem(METRICS_KEY,JSON.stringify(d));}catch(e){}};
            window.JobCopilot.saveMetricsBatch = function(a){if(!a||!Array.isArray(a))return;a.forEach(function(m){JobCopilot.saveMetrics(m);});};
            window.JobCopilot.getMetrics = function(){try{return JSON.parse(localStorage.getItem(METRICS_KEY)||'[]');}catch(e){return[];}};
            window.JobCopilot.clearMetrics = function(){localStorage.removeItem(METRICS_KEY);};

            // Experiments
            window.JobCopilot.getExperiments = function(){try{return JSON.parse(localStorage.getItem('jobcopilot_experiments')||'[]');}catch(e){return[];}};
            window.JobCopilot.saveExperiments = function(e){localStorage.setItem('jobcopilot_experiments',JSON.stringify(e));};

            // Feishu config restore
            (function(){try{var s=localStorage.getItem('jobcopilot_feishu_config');if(s){var c=JSON.parse(s);if(c.appId&&c.appSecret&&c.appToken&&c.tableId&&c.enabled){fetch('/api/feishu/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appId:c.appId,appSecret:c.appSecret,appToken:c.appToken,tableId:c.tableId,enabled:c.enabled})}).catch(function(){});}}}catch(e){}})();
          `
        }} />
      </body>
    </html>
  )
})
