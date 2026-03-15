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
                    surface: '#FAFAF8',
                    'surface-card': '#FFFFFF',
                    'surface-hover': '#F5F5F3',
                    accent: '#0071e3',
                    'accent-hover': '#0077ED',
                    'accent-light': 'rgba(0,113,227,0.08)',
                    success: '#34C759',
                    warning: '#FF9F0A',
                    error: '#FF3B30',
                    info: '#007AFF',
                    'border-light': 'rgba(0,0,0,0.06)',
                    'border-card': 'rgba(0,0,0,0.04)',
                  },
                  fontFamily: {
                    sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Noto Sans SC', 'PingFang SC', 'sans-serif'],
                  },
                  fontSize: {
                    'page-title': ['30px', { lineHeight: '1.14', fontWeight: '600', letterSpacing: '-0.015em' }],
                    'section-title': ['21px', { lineHeight: '1.19', fontWeight: '600', letterSpacing: '-0.01em' }],
                    'card-title': ['17px', { lineHeight: '1.29', fontWeight: '600' }],
                    'body-base': ['15px', { lineHeight: '1.47', fontWeight: '400' }],
                    'meta': ['13px', { lineHeight: '1.38', fontWeight: '400', letterSpacing: '-0.003em' }],
                    'tag': ['12px', { lineHeight: '1.33', fontWeight: '500' }],
                  },
                  borderRadius: {
                    'card-lg': '24px',
                    'card': '18px',
                    'input': '16px',
                    'tag': '9999px',
                    'apple': '12px',
                    'apple-lg': '16px',
                    'apple-xl': '20px',
                  },
                  boxShadow: {
                    'card': '0 1px 4px rgba(0,0,0,0.04)',
                    'card-hover': '0 4px 16px rgba(0,0,0,0.07)',
                    'panel': '0 2px 8px rgba(0,0,0,0.05)',
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
        <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
        <script src="/static/chat-agent.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* ===== Alpine.js x-cloak ===== */
            [x-cloak] { display: none !important; }

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

            /* === Animations (PRD v1.5: hover 120-160ms, expand 180-240ms, fade 200-260ms) === */
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
            @keyframes gentle-float {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-apple-fade { animation: apple-fade-in 0.24s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            .animate-apple-scale { animation: apple-scale-in 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            .animate-slide-up { animation: apple-fade-in 0.22s ease-out; }
            .animate-fade-in { animation: apple-fade-in 0.24s ease-out; }
            .animate-gentle-float { animation: gentle-float 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both; }
            .skeleton { background: linear-gradient(90deg, #F5F5F3 25%, #EDEDEB 50%, #F5F5F3 75%); background-size: 200% 100%; animation: shimmer 2s ease-in-out infinite; border-radius: 12px; }
            .loading-spinner { animation: spin 1s linear infinite; }
            .stagger-1 { animation-delay: 0.08s; }
            .stagger-2 { animation-delay: 0.16s; }
            .stagger-3 { animation-delay: 0.24s; }
            .stagger-4 { animation-delay: 0.32s; }
            .stagger-5 { animation-delay: 0.40s; }

            /* === Card Hover (PRD: 120-160ms) === */
            .card-hover {
              transition: all 0.14s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            .card-hover:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 16px rgba(0,0,0,0.07);
            }

            /* === V2 Design Cards === */
            .v2-card {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.06);
              border-radius: 24px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.04);
              transition: all 0.14s ease;
            }
            .v2-card:hover {
              box-shadow: 0 4px 16px rgba(0,0,0,0.07);
              border-color: rgba(0,0,0,0.08);
            }
            .v2-card-md {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.06);
              border-radius: 18px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.04);
              transition: all 0.14s ease;
            }
            .v2-card-md:hover {
              box-shadow: 0 4px 16px rgba(0,0,0,0.07);
            }

            /* === Sidebar === */
            .sidebar-nav {
              transition: width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* Sidebar nav item: 48px height with 3px active indicator */
            .sidebar-nav-item {
              position: relative;
              transition: all 0.15s ease;
            }
            .sidebar-nav-item.active {
              background: rgba(0,0,0,0.04);
              font-weight: 600;
            }
            .sidebar-nav-item.active::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 24px;
              background: #0071e3;
              border-radius: 0 3px 3px 0;
            }
            .sidebar-nav-item.active span {
              color: #1d1d1f;
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
              font-weight: 600;
            }
            .sidebar-group .sidebar-trigger.active::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 24px;
              background: #0071e3;
              border-radius: 0 3px 3px 0;
            }
            .sidebar-group .sidebar-submenu .sidebar-sub-item {
              transition: all 0.15s ease;
            }
            .sidebar-group .sidebar-submenu .sidebar-sub-item:hover {
              background: rgba(0,0,0,0.04);
            }
            .sidebar-group .sidebar-submenu .sidebar-sub-item.active-link {
              background: rgba(0,113,227,0.08);
              color: #0071e3;
              font-weight: 600;
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

            /* ===== Figma Home Page System (pixel-perfect) ===== */

            /* Top global bar */
            .figma-topbar {
              padding: 28px 80px 0;
              position: relative;
              z-index: 20;
            }
            .figma-topbar-inner {
              max-width: 1280px;
              margin: 0 auto;
              height: 64px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .figma-global-search {
              width: 520px;
              height: 48px;
              background: rgba(255,255,255,0.9);
              border: 1px solid rgba(0,0,0,0.06);
              border-radius: 16px;
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 0 16px;
              transition: all 0.16s ease;
              cursor: text;
            }
            .figma-global-search:hover { border-color: rgba(0,0,0,0.12); }
            .figma-kbd-hint {
              margin-left: auto;
              font-size: 12px;
              color: #86868b;
              background: rgba(0,0,0,0.04);
              padding: 2px 8px;
              border-radius: 6px;
              font-family: system-ui;
            }
            .figma-role-selector {
              height: 40px;
              padding: 0 14px;
              border-radius: 14px;
              background: rgba(255,255,255,0.9);
              border: 1px solid rgba(0,0,0,0.06);
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
              transition: all 0.14s ease;
            }
            .figma-role-selector:hover { border-color: rgba(0,0,0,0.12); }
            .figma-icon-btn {
              width: 40px;
              height: 40px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.14s ease;
              background: transparent;
              border: none;
            }
            .figma-icon-btn:hover { background: rgba(0,0,0,0.04); }

            /* Content area */
            .figma-content-area {
              max-width: 1280px;
              margin: 0 auto;
              padding: 0 80px;
            }
            @media (max-width: 1024px) {
              .figma-content-area { padding: 0 24px; }
              .figma-topbar { padding: 16px 24px 0; }
              .figma-global-search { width: 320px; }
            }
            @media (max-width: 768px) {
              .figma-global-search { display: none; }
            }

            /* Title */
            .figma-title {
              color: #1E1E1A;
            }

            /* Hero super input (PRD: 860x84px) */
            .figma-hero-input-wrap {
              width: 100%;
              max-width: 860px;
            }
            .figma-hero-input {
              width: 100%;
              height: 84px;
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.06);
              border-radius: 24px;
              box-shadow: 0 2px 12px rgba(0,0,0,0.04), 0 0 0 0 rgba(0,0,0,0);
              font-size: 17px;
              color: #1d1d1f;
              transition: all 0.18s ease;
              padding-left: 56px;
              padding-right: 220px;
              outline: none;
            }
            .figma-hero-input:focus {
              border-color: rgba(0,0,0,0.12);
              box-shadow: 0 4px 24px rgba(0,0,0,0.06);
              background: #FFFFFF;
            }
            .figma-hero-input::placeholder { color: transparent; }

            /* Rotating placeholder (Figma style) */
            @keyframes placeholder-fade {
              0%, 100% { opacity: 0; transform: translateY(6px); }
              10%, 90% { opacity: 1; transform: translateY(0); }
            }
            .figma-rotating-placeholder {
              animation: placeholder-fade 3.5s ease-in-out;
              pointer-events: none;
              position: absolute;
              left: 56px;
              top: 50%;
              transform: translateY(-50%);
              color: #A0A09A;
              font-size: 17px;
              white-space: nowrap;
              overflow: hidden;
            }

            /* Input icon buttons */
            .figma-input-icon-btn {
              width: 40px;
              height: 40px;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #86868b;
              background: transparent;
              border: none;
              cursor: pointer;
              transition: all 0.14s ease;
            }
            .figma-input-icon-btn:hover { background: rgba(0,0,0,0.04); color: #1d1d1f; }

            /* Submit button (Figma: dark pill) */
            .figma-submit-btn {
              height: 48px;
              padding: 0 22px;
              border-radius: 16px;
              background: #1d1d1f;
              color: white;
              display: flex;
              align-items: center;
              gap: 8px;
              border: none;
              cursor: pointer;
              transition: all 0.14s ease;
              font-family: inherit;
            }
            .figma-submit-btn:hover { background: #333333; }

            /* Intent capsules (Figma: fog-white pills) */
            .figma-capsule {
              display: inline-flex;
              align-items: center;
              height: 36px;
              padding: 0 16px;
              border-radius: 9999px;
              background: rgba(255,255,255,0.8);
              border: 1px solid rgba(0,0,0,0.06);
              font-size: 14px;
              color: #3A3A37;
              font-weight: 400;
              cursor: pointer;
              transition: all 0.14s ease;
              text-decoration: none;
            }
            .figma-capsule:hover {
              background: rgba(255,255,255,1);
              border-color: rgba(0,0,0,0.12);
              color: #1d1d1f;
            }

            /* Figma main cards */
            .figma-card {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.04);
              border-radius: 24px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.03);
              transition: all 0.16s ease;
            }
            .figma-card:hover {
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
            .figma-card-soft {
              background: rgba(255,255,255,0.85);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            }
            .figma-card-sm {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.04);
              border-radius: 22px;
              padding: 22px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.03);
              transition: all 0.16s ease;
            }
            .figma-card-sm:hover {
              box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            }

            /* Starter cards (new user) */
            .figma-starter-card {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.04);
              border-radius: 24px;
              padding: 28px;
              transition: all 0.16s ease;
              cursor: pointer;
              display: block;
              text-decoration: none;
            }
            .figma-starter-card:hover {
              border-color: rgba(0,0,0,0.08);
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }

            /* Today's tasks row */
            .figma-task-row {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 20px 0;
              border-bottom: 1px solid rgba(0,0,0,0.04);
              text-decoration: none;
              transition: all 0.14s ease;
            }
            .figma-task-row:last-child { border-bottom: none; }
            .figma-task-row:hover { background: rgba(0,0,0,0.01); margin: 0 -8px; padding-left: 8px; padding-right: 8px; border-radius: 12px; }
            .figma-task-num {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: rgba(0,0,0,0.04);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: 500;
              color: #86868b;
              flex-shrink: 0;
            }

            /* Figma stepper (5-step horizontal) */
            .figma-stepper {
              display: flex;
              align-items: flex-start;
              position: relative;
              padding: 0 20px;
            }
            .figma-step {
              flex: 1;
              text-align: center;
              position: relative;
            }
            .figma-step-dot {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
              transition: all 0.2s ease;
            }
            .figma-step-dot.complete { background: #1d1d1f; }
            .figma-step-dot.active {
              background: transparent;
              border: 2px solid #1d1d1f;
            }
            .figma-step-dot.pending {
              background: transparent;
              border: 1.5px solid #D1D1CC;
            }
            .figma-step-line {
              position: absolute;
              top: 9px;
              right: calc(50% + 14px);
              left: calc(-50% + 14px);
              height: 2px;
              background: #D1D1CC;
            }
            .figma-step-line.filled { background: #1d1d1f; }

            /* Summary bar */
            .figma-summary-bar {
              background: #F9F9F7;
              border-radius: 16px;
              padding: 16px 20px;
            }

            /* ===== Premium Apple-Style Design System ===== */

            /* Canvas */
            .premium-canvas {
              background: #F4F4F1;
              background-image: radial-gradient(ellipse 70% 50% at 50% 38%, rgba(255,255,255,0.55) 0%, transparent 100%);
            }
            .premium-ambient-glow {
              position: fixed;
              top: 0; left: 0; right: 0;
              height: 600px;
              background: radial-gradient(ellipse 60% 45% at 50% 10%, rgba(255,255,255,0.4) 0%, transparent 80%);
              pointer-events: none;
              z-index: 0;
            }

            /* Top bar - lighter, quieter */
            .premium-topbar {
              padding: 28px 80px 0;
              position: relative;
              z-index: 20;
            }
            .premium-topbar-inner {
              max-width: 1280px;
              margin: 0 auto;
              height: 56px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .premium-logo-mark {
              width: 34px; height: 34px;
              border-radius: 10px;
              background: linear-gradient(135deg, #48484A 0%, #3A3A3C 100%);
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
            }
            .premium-search-bar {
              width: 420px; height: 40px;
              background: rgba(255,255,255,0.55);
              border: 1px solid rgba(0,0,0,0.04);
              border-radius: 12px;
              display: flex; align-items: center; gap: 9px;
              padding: 0 14px;
              transition: all 0.2s ease;
              cursor: text;
            }
            .premium-search-bar:hover {
              background: rgba(255,255,255,0.7);
              border-color: rgba(0,0,0,0.06);
            }
            .premium-role-btn {
              height: 34px; padding: 0 12px;
              border-radius: 10px;
              background: rgba(255,255,255,0.5);
              border: 1px solid rgba(0,0,0,0.04);
              display: flex; align-items: center; gap: 6px;
              cursor: pointer; transition: all 0.16s ease;
            }
            .premium-role-btn:hover {
              background: rgba(255,255,255,0.7);
              border-color: rgba(0,0,0,0.06);
            }
            .premium-icon-btn {
              width: 34px; height: 34px;
              border-radius: 10px;
              display: flex; align-items: center; justify-content: center;
              cursor: pointer; transition: all 0.16s ease;
              background: transparent; border: none;
            }
            .premium-icon-btn:hover {
              background: rgba(0,0,0,0.03);
            }
            .premium-avatar {
              width: 34px; height: 34px;
              border-radius: 10px;
              background: linear-gradient(135deg, #34C759 0%, #30B855 100%);
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
            }

            /* Content area */
            .premium-content-area {
              max-width: 1280px;
              margin: 0 auto;
              padding: 0 80px;
              position: relative;
              z-index: 1;
            }

            /* Entrance animation */
            .premium-entrance-anim {
              animation: premium-float-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
            }
            @keyframes premium-float-in {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }

            /* ===== HERO PANEL - The Visual Protagonist ===== */
            .premium-hero-panel {
              max-width: 980px;
              margin: 44px auto 0;
              padding: 48px 64px 40px;
              background: rgba(255,255,255,0.72);
              backdrop-filter: saturate(140%) blur(24px);
              -webkit-backdrop-filter: saturate(140%) blur(24px);
              border: 1px solid rgba(255,255,255,0.6);
              border-radius: 28px;
              box-shadow:
                0 0 0 0.5px rgba(0,0,0,0.03),
                0 2px 8px rgba(0,0,0,0.02),
                0 8px 32px rgba(0,0,0,0.04);
              position: relative;
              overflow: hidden;
            }
            .premium-hero-inner-glow {
              position: absolute;
              top: -40%; left: 20%; right: 20%;
              height: 180px;
              background: radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 70%);
              pointer-events: none;
            }

            /* Title system */
            .premium-hero-title {
              font-size: 32px;
              font-weight: 560;
              line-height: 1.22;
              letter-spacing: -0.022em;
              color: #1C1C1E;
              text-align: center;
              margin-bottom: 8px;
              position: relative;
            }
            .premium-hero-subtitle {
              font-size: 15px;
              font-weight: 400;
              line-height: 1.6;
              color: #AEAEB2;
              text-align: center;
              max-width: 400px;
              margin: 0 auto 28px;
              letter-spacing: -0.005em;
            }

            /* Main Input */
            .premium-input-wrap {
              position: relative;
              max-width: 640px;
              margin: 0 auto 22px;
            }
            .premium-hero-input {
              width: 100%;
              height: 64px;
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.05);
              border-radius: 20px;
              font-size: 15px;
              font-weight: 400;
              color: #1C1C1E;
              padding: 0 160px 0 24px;
              outline: none;
              transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
              letter-spacing: -0.005em;
              box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            .premium-hero-input:focus {
              border-color: rgba(0,0,0,0.08);
              box-shadow: 0 2px 16px rgba(0,0,0,0.05);
            }
            .premium-hero-input::placeholder { color: transparent; }
            .premium-placeholder {
              position: absolute;
              left: 24px; top: 50%;
              transform: translateY(-50%);
              color: #B8B8B5;
              font-size: 15px;
              font-weight: 400;
              pointer-events: none;
              letter-spacing: -0.005em;
            }
            .premium-input-controls {
              position: absolute;
              right: 14px; top: 50%;
              transform: translateY(-50%);
              display: flex; align-items: center; gap: 4px;
            }
            .premium-input-icon {
              width: 38px; height: 38px;
              border-radius: 12px;
              display: flex; align-items: center; justify-content: center;
              color: #B0B0AE;
              background: transparent; border: none;
              cursor: pointer; transition: all 0.16s ease;
            }
            .premium-input-icon:hover {
              background: rgba(0,0,0,0.03);
              color: #6E6E73;
            }
            .premium-submit-btn {
              width: 42px; height: 42px;
              border-radius: 14px;
              background: #3A3A3C;
              display: flex; align-items: center; justify-content: center;
              border: none; cursor: pointer;
              transition: all 0.16s ease;
              flex-shrink: 0;
            }
            .premium-submit-btn:hover {
              background: #48484A;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            /* Segmented Control */
            .premium-segment-wrap {
              display: flex;
              justify-content: center;
            }
            .premium-segment-track {
              display: inline-flex;
              background: rgba(0,0,0,0.028);
              border-radius: 9999px;
              padding: 3px;
              gap: 2px;
            }
            .premium-segment-item {
              height: 30px;
              padding: 0 18px;
              border-radius: 9999px;
              font-size: 13px;
              font-weight: 450;
              color: #8E8E93;
              background: transparent;
              border: none;
              cursor: pointer;
              transition: all 0.2s ease;
              letter-spacing: -0.003em;
              position: relative;
            }
            .premium-segment-item:hover {
              color: #636366;
            }
            .premium-segment-item.active {
              background: rgba(255,255,255,0.85);
              color: #2C2C2E;
              box-shadow: 0 0.5px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.03);
            }

            /* Entry Capsules */
            .premium-capsule-row {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 36px;
              margin-bottom: 48px;
            }
            .premium-capsule {
              display: inline-flex;
              align-items: center;
              gap: 7px;
              height: 34px;
              padding: 0 16px;
              border-radius: 9999px;
              background: rgba(255,255,255,0.5);
              border: 1px solid rgba(0,0,0,0.04);
              font-size: 13px;
              font-weight: 430;
              color: #6E6E73;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.18s ease;
              letter-spacing: -0.003em;
            }
            .premium-capsule svg { opacity: 0.5; }
            .premium-capsule:hover {
              background: rgba(255,255,255,0.75);
              border-color: rgba(0,0,0,0.07);
              color: #48484A;
              box-shadow: 0 1px 4px rgba(0,0,0,0.03);
            }
            .premium-capsule:hover svg { opacity: 0.7; }

            /* System Promise Strips */
            .premium-promise-row {
              max-width: 880px;
              margin: 0 auto 64px;
              display: flex;
              align-items: stretch;
              gap: 0;
            }
            .premium-promise-strip {
              flex: 1;
              display: flex;
              align-items: center;
              gap: 14px;
              padding: 16px 20px;
              text-decoration: none;
              border-radius: 16px;
              transition: all 0.18s ease;
            }
            .premium-promise-strip:hover {
              background: rgba(0,0,0,0.015);
            }
            .premium-promise-divider {
              width: 1px;
              align-self: stretch;
              margin: 8px 0;
              background: rgba(0,0,0,0.04);
            }
            .premium-promise-icon {
              width: 36px; height: 36px;
              border-radius: 10px;
              border: 1px solid rgba(0,0,0,0.05);
              background: rgba(255,255,255,0.6);
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
              color: #8E8E93;
              transition: all 0.18s ease;
            }
            .premium-promise-strip:hover .premium-promise-icon {
              border-color: rgba(0,0,0,0.08);
              color: #636366;
            }
            .premium-promise-text {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .premium-promise-title {
              font-size: 14px;
              font-weight: 500;
              color: #3A3A3C;
              letter-spacing: -0.005em;
            }
            .premium-promise-desc {
              font-size: 12px;
              font-weight: 400;
              color: #C7C7CC;
              letter-spacing: -0.003em;
              line-height: 1.4;
            }

            @media (max-width: 1024px) {
              .premium-content-area { padding: 0 24px; }
              .premium-topbar { padding: 16px 24px 0; }
              .premium-search-bar { width: 280px; }
              .premium-hero-panel { padding: 40px 32px 36px; }
              .premium-promise-row { flex-direction: column; gap: 0; }
              .premium-promise-divider { width: auto; height: 1px; margin: 0 16px; }
            }
            @media (max-width: 768px) {
              .premium-search-bar { display: none; }
              .premium-capsule-row { flex-wrap: wrap; }
              .premium-hero-panel { margin-top: 28px; padding: 32px 20px 28px; border-radius: 22px; }
              .premium-hero-title { font-size: 26px; }
              .premium-hero-input { height: 60px; border-radius: 18px; }
            }

            /* Home-specific: hide sidebar and top bar for immersive home */
            body.is-home #sidebar { display: none !important; }
            body.is-home #global-nav { display: none !important; }
            body.is-home #app-content { background: #F4F4F1 !important; padding: 0 !important; overflow-x: hidden; }

            /* Explore mode glass */
            .explore-glass {
              background: #FFFFFF;
              border: 1px solid rgba(0,0,0,0.05);
              border-radius: 24px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.03);
            }
            /* Chat panel */
            .chat-panel {
              background: rgba(250,250,248,0.95);
              border-left: 1px solid rgba(0,0,0,0.05);
            }
            .chat-bubble-ai {
              background: rgba(0,0,0,0.035);
              border-radius: 18px 18px 18px 4px;
            }
            .chat-bubble-user {
              background: #3A3A3C;
              color: white;
              border-radius: 18px 18px 4px 18px;
            }
            /* Module entrance animation */
            @keyframes module-enter {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-module-enter { animation: module-enter 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both; }

            body.is-home-explore #sidebar { display: none !important; }
            body.is-home-explore #global-nav { display: none !important; }

            /* === Opportunities Workspace === */
            .opp-job-card {
              transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            .opp-card-selected {
              border-left: 3px solid #0071e3 !important;
            }

            /* === Assets Workspace === */
            .asset-tree-active::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 20px;
              background: #0071e3;
              border-radius: 0 3px 3px 0;
            }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            /* Chat scrollbar */
            .chat-scroll::-webkit-scrollbar { width: 4px; }
            .chat-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }

            /* Interview scrollbar */
            .interview-scrollbar::-webkit-scrollbar { width: 4px; }
            .interview-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
            .interview-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .growth-scrollbar::-webkit-scrollbar { width: 4px; }
            .growth-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
            .growth-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .decision-scrollbar::-webkit-scrollbar { width: 4px; }
            .decision-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
            .decision-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .monitor-scrollbar::-webkit-scrollbar { width: 4px; }
            .monitor-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
            .monitor-scrollbar::-webkit-scrollbar-track { background: transparent; }

            /* === Chat Agent Panel === */
            .chat-agent-panel {
              transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              will-change: width;
            }
            .chat-agent-expanded {
              width: 360px;
            }
            .chat-agent-collapsed {
              width: 48px;
            }
            .chat-agent-messages::-webkit-scrollbar { width: 4px; }
            .chat-agent-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
            .chat-agent-messages::-webkit-scrollbar-track { background: transparent; }
            .chat-agent-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(0,113,227,0.12); }
            @keyframes chat-typing {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1); }
            }
            .chat-typing-dot { animation: chat-typing 1.2s infinite; }
            .chat-typing-dot:nth-child(2) { animation-delay: 0.15s; }
            .chat-typing-dot:nth-child(3) { animation-delay: 0.3s; }
            /* Home page: also hide chat agent */
            body.is-home #chat-agent-root { display: none !important; }
          `
        }} />
      </head>
      <body class="bg-surface text-primary antialiased">
        {/* ===== Apple-style Global Layout ===== */}
        <div class="min-h-screen flex flex-col">

          {/* === Top Global Bar (PRD v1.5: 72px, breadcrumb + global search + actions) === */}
          <nav id="global-nav" class="sticky top-0 z-50 h-[72px] border-b border-black/[0.06] glass-nav">
            <div class="h-full px-7 flex items-center gap-5">
              {/* Left: Breadcrumb / Module title */}
              <div id="nav-breadcrumb" class="flex items-center gap-1.5 text-[14px] min-w-0 flex-shrink-0">
                <span class="text-secondary font-normal truncate" id="nav-bc-module"></span>
                <span class="text-secondary/40 hidden" id="nav-bc-sep">/</span>
                <span class="text-primary font-medium truncate hidden" id="nav-bc-page"></span>
              </div>

              {/* Center: Global search / question input (460×46px) */}
              <div class="flex-1 flex justify-center">
                <div class="relative w-full max-w-[460px]">
                  <input
                    id="global-search-input"
                    type="text"
                    placeholder={'\u641c\u7d22\u5c97\u4f4d\u3001\u7b80\u5386\u3001\u9762\u8bd5\uff0c\u6216\u76f4\u63a5\u8f93\u5165\u4f60\u7684\u95ee\u9898'}
                    class="w-full h-[46px] pl-11 pr-16 rounded-input bg-white border border-black/[0.08] text-[14px] text-primary placeholder-secondary/60 focus:outline-none focus:border-accent/30 focus:shadow-[0_0_0_3px_rgba(0,113,227,0.06)] transition-all"
                  />
                  <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-secondary/50"></i>
                  <kbd class="absolute right-3 top-1/2 -translate-y-1/2 h-[22px] px-2 flex items-center rounded-full bg-black/[0.04] text-[11px] text-secondary/60 font-medium border border-black/[0.06]">{'\u2318K'}</kbd>
                </div>
              </div>

              {/* Right: Actions (target role 150×40 + upload 92×40 + notification 40×40 + avatar 36×36) */}
              <div class="flex items-center gap-2.5 flex-shrink-0">
                {/* Target role switcher */}
                <button id="nav-role-switcher" class="h-10 px-3 min-w-[120px] max-w-[150px] rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-2 text-[13px] text-primary font-medium hover:border-accent/20 hover:bg-accent/[0.02] transition-all cursor-pointer truncate" title={'\u76ee\u6807\u5c97\u4f4d'}>
                  <i class="fas fa-crosshairs text-[11px] text-accent/60 flex-shrink-0"></i>
                  <span class="truncate" id="nav-role-label">{'\u76ee\u6807\u5c97\u4f4d'}</span>
                  <i class="fas fa-chevron-down text-[8px] text-secondary/40 flex-shrink-0 ml-auto"></i>
                </button>
                {/* Upload button */}
                <button id="nav-upload-btn" class="h-10 px-3.5 rounded-[14px] bg-white border border-black/[0.08] flex items-center gap-1.5 text-[13px] text-primary font-medium hover:border-accent/20 hover:bg-accent/[0.02] transition-all" title={'\u4e0a\u4f20'}>
                  <i class="fas fa-cloud-arrow-up text-[12px] text-secondary/60"></i>
                  <span class="hidden sm:inline">{'\u4e0a\u4f20'}</span>
                </button>
                {/* Notification button */}
                <button id="nav-notif-btn" class="w-10 h-10 rounded-[12px] bg-white border border-black/[0.08] flex items-center justify-center text-secondary hover:text-primary hover:border-accent/20 transition-all relative" title={'\u901a\u77e5'}>
                  <i class="fas fa-bell text-[14px]"></i>
                  <span id="nav-notif-badge" class="hidden absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">0</span>
                </button>
                {/* User avatar */}
                <div id="nav-avatar" class="w-9 h-9 rounded-full bg-black/[0.06] flex items-center justify-center text-secondary cursor-pointer hover:bg-black/[0.1] transition-all flex-shrink-0" title={'\u6211\u7684'}>
                  <i class="fas fa-user text-[13px]"></i>
                </div>
              </div>
            </div>
          </nav>

          {/* === Body: Sidebar + Content === */}
          <div class="flex flex-1 overflow-hidden">

            {/* Sidebar - Desktop (PRD v1.5: 236px, brand + nav + recent + system) */}
            <aside id="sidebar" class="sidebar-nav w-[236px] min-h-[calc(100vh-72px)] bg-[#F8F8F6] border-r border-black/[0.06] flex-shrink-0 hidden lg:flex flex-col">
              
              {/* Brand area (60px): Logo + FindJob + collapse */}
              <div class="h-[60px] px-5 flex items-center gap-3 flex-shrink-0">
                <a href="/" class="flex items-center gap-3 group flex-1 min-w-0">
                  <span class="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-b from-gray-800 to-black text-white shadow-sm flex-shrink-0">
                    <i class="fas fa-rocket text-[10px]"></i>
                  </span>
                  <span class="font-semibold text-[18px] text-primary tracking-tight sidebar-brand-text">FindJob</span>
                </a>
                <button id="sidebar-collapse-btn" class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 hover:text-secondary/80 hover:bg-black/[0.04] transition-all opacity-0 group-hover:opacity-100" title={'\u6298\u53e0\u5bfc\u822a'}>
                  <i class="fas fa-sidebar text-[12px]"></i>
                </button>
              </div>
              
              {/* Primary navigation (6 items, 48px each, 14px radius) */}
              <div class="flex-1 px-3.5 space-y-0.5 overflow-y-auto" id="sidebar-workspaces">

                {/* -- Home -- */}
                <a href="/" class="sidebar-home sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                  <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px]">
                    <i class="fas fa-home"></i>
                  </span>
                  <span class="text-[14px] font-medium">{'\u9996\u9875'}</span>
                </a>

                {/* -- Opportunities (with full sub-nav) -- */}
                <div class="sidebar-group" data-workspace="jobs">
                  <div class="sidebar-trigger sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] cursor-pointer text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                    <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px] text-blue-600">
                      <i class="fas fa-compass"></i>
                    </span>
                    <span class="text-[14px] font-medium flex-1">{'\u673a\u4f1a'}</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[44px] pr-2 py-1 space-y-0.5">
                      <a href="/job/new" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-wand-magic-sparkles text-[10px] w-4 text-center"></i><span>{'\u5c97\u4f4d\u89e3\u6790'}</span></a>
                      <a href="/opportunities" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-list text-[10px] w-4 text-center"></i><span>{'\u5c97\u4f4d\u5217\u8868'}</span></a>
                      <a href="/opportunities?view=compare" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-columns text-[10px] w-4 text-center"></i><span>{'\u5c97\u4f4d\u5bf9\u6bd4'}</span></a>
                      <a href="/opportunities?view=company" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-building text-[10px] w-4 text-center"></i><span>{'\u516c\u53f8\u5206\u6790'}</span></a>
                      <a href="/decisions" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-paper-plane text-[10px] w-4 text-center"></i><span>{'\u6295\u9012\u8ddf\u8e2a'}</span></a>
                    </div>
                  </div>
                </div>

                {/* -- Assets (with full sub-nav) -- */}
                <div class="sidebar-group" data-workspace="resume">
                  <div class="sidebar-trigger sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] cursor-pointer text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                    <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px] text-emerald-600">
                      <i class="fas fa-folder-open"></i>
                    </span>
                    <span class="text-[14px] font-medium flex-1">{'\u8d44\u4ea7'}</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[44px] pr-2 py-1 space-y-0.5">
                      <a href="/assets?view=profile" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-user-circle text-[10px] w-4 text-center"></i><span>{'\u6c42\u804c\u753b\u50cf'}</span></a>
                      <a href="/assets" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-file-alt text-[10px] w-4 text-center"></i><span>{'\u7b80\u5386\u5e93'}</span></a>
                      <a href="/assets?view=projects" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-cubes text-[10px] w-4 text-center"></i><span>{'\u9879\u76ee\u7d20\u6750\u5e93'}</span></a>
                      <a href="/assets?view=evidences" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-trophy text-[10px] w-4 text-center"></i><span>{'\u6210\u5c31\u8bc1\u636e\u5e93'}</span></a>
                    </div>
                  </div>
                </div>

                {/* -- Interviews (with full sub-nav) -- */}
                <div class="sidebar-group" data-workspace="interview">
                  <div class="sidebar-trigger sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] cursor-pointer text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                    <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px] text-purple-600">
                      <i class="fas fa-comments"></i>
                    </span>
                    <span class="text-[14px] font-medium flex-1">{'\u9762\u8bd5'}</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[44px] pr-2 py-1 space-y-0.5">
                      <a href="/interviews?tab=bank" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-database text-[10px] w-4 text-center"></i><span>{'\u9762\u8bd5\u9898\u5e93'}</span></a>
                      <a href="/interviews" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-chalkboard-teacher text-[10px] w-4 text-center"></i><span>{'\u9762\u8bd5\u8f85\u5bfc'}</span></a>
                      <a href="/interviews?tab=simulation" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-headset text-[10px] w-4 text-center"></i><span>{'\u9762\u8bd5\u6a21\u62df'}</span></a>
                      <a href="/interviews?tab=review" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-rotate-left text-[10px] w-4 text-center"></i><span>{'\u9762\u8bd5\u590d\u76d8'}</span></a>
                    </div>
                  </div>
                </div>

                {/* -- Decisions (with full sub-nav) -- */}
                <div class="sidebar-group" data-workspace="offer">
                  <div class="sidebar-trigger sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] cursor-pointer text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                    <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px] text-amber-600">
                      <i class="fas fa-scale-balanced"></i>
                    </span>
                    <span class="text-[14px] font-medium flex-1">{'\u51b3\u7b56'}</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[44px] pr-2 py-1 space-y-0.5">
                      <a href="/decisions?tab=list" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-list-check text-[10px] w-4 text-center"></i><span>{'Offer\u5217\u8868'}</span></a>
                      <a href="/decisions?tab=compare" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-trophy text-[10px] w-4 text-center"></i><span>{'Offer\u5bf9\u6bd4'}</span></a>
                      <a href="/decisions?tab=negotiate" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-comments-dollar text-[10px] w-4 text-center"></i><span>{'\u8c08\u85aa\u52a9\u624b'}</span></a>
                      <a href="/decisions?tab=advice" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-lightbulb text-[10px] w-4 text-center"></i><span>{'\u9009\u62e9\u5efa\u8bae'}</span></a>
                    </div>
                  </div>
                </div>

                {/* -- Growth (with full sub-nav) -- */}
                <div class="sidebar-group" data-workspace="growth">
                  <div class="sidebar-trigger sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] cursor-pointer text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                    <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px] text-rose-500">
                      <i class="fas fa-seedling"></i>
                    </span>
                    <span class="text-[14px] font-medium flex-1">{'\u6210\u957f'}</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[44px] pr-2 py-1 space-y-0.5">
                      <a href="/growth" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-heart-pulse text-[10px] w-4 text-center"></i><span>{'\u6210\u957f\u966a\u4f34\u5e08'}</span></a>
                      <a href="/growth?tab=skills" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-bolt text-[10px] w-4 text-center"></i><span>{'Skills\u81ea\u52a8\u5316'}</span></a>
                      <a href="/growth?tab=weekly" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-calendar-week text-[10px] w-4 text-center"></i><span>{'\u5468\u8ba1\u5212'}</span></a>
                      <a href="/growth?tab=review" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-chart-line text-[10px] w-4 text-center"></i><span>{'\u5468\u590d\u76d8'}</span></a>
                    </div>
                  </div>
                </div>

                <div class="sidebar-group" data-workspace="monitor">
                  <div class="sidebar-trigger sidebar-nav-item flex items-center gap-3 px-3.5 h-[48px] rounded-[14px] cursor-pointer text-primary/70 hover:text-primary hover:bg-black/[0.03] transition-all">
                    <span class="w-[18px] h-[18px] flex items-center justify-center text-[14px] text-cyan-600">
                      <i class="fas fa-gauge-high"></i>
                    </span>
                    <span class="text-[14px] font-medium flex-1">{'\u76d1\u63a7'}</span>
                    <i class="fas fa-chevron-right text-[9px] text-primary/25 sidebar-arrow transition-transform duration-200"></i>
                  </div>
                  <div class="sidebar-submenu overflow-hidden transition-all duration-300 max-h-0 opacity-0">
                    <div class="pl-[44px] pr-2 py-1 space-y-0.5">
                      <a href="/monitor" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-chart-pie text-[10px] w-4 text-center"></i><span>{'\u6570\u636e\u9a7e\u9a76\u8231'}</span></a>
                      <a href="/monitor?tab=ai" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-robot text-[10px] w-4 text-center"></i><span>{'AI \u8d28\u91cf'}</span></a>
                      <a href="/monitor?tab=cost" class="sidebar-sub-item flex items-center gap-2 px-2.5 h-[36px] rounded-[12px] text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.04] transition-all"><i class="fas fa-coins text-[10px] w-4 text-center"></i><span>{'\u7ecf\u8425\u5206\u6790'}</span></a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent access area */}
              <div class="px-3.5 py-3 border-t border-black/[0.04]" id="sidebar-recent">
                <div class="text-[12px] text-secondary/60 font-medium px-3.5 mb-2">{'\u6700\u8fd1\u8bbf\u95ee'}</div>
                <div id="sidebar-recent-items" class="space-y-0.5">
                  <div class="px-3 h-[34px] rounded-[10px] flex items-center text-[13px] text-primary/50 hover:text-primary/80 hover:bg-black/[0.03] transition-all cursor-pointer truncate">
                    <i class="fas fa-clock text-[10px] mr-2.5 text-secondary/30"></i>
                    <span class="truncate">{'\u6682\u65e0\u8bb0\u5f55'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom system area (notifications, export, settings, help) */}
              <div class="px-3.5 py-2.5 border-t border-black/[0.04] space-y-0.5">
                <button onclick="if(window.JobCopilot)JobCopilot.showToast('\u6682\u65e0\u65b0\u901a\u77e5','info')" class="w-full flex items-center gap-2.5 px-3.5 h-[40px] rounded-[12px] text-[13px] text-primary/40 hover:text-primary/70 hover:bg-black/[0.03] transition-colors">
                  <i class="fas fa-bell text-[12px] w-4 text-center"></i><span>{'\u901a\u77e5'}</span>
                </button>
                <button onclick="if(window.JobCopilot)JobCopilot.exportData()" class="w-full flex items-center gap-2.5 px-3.5 h-[40px] rounded-[12px] text-[13px] text-primary/40 hover:text-primary/70 hover:bg-black/[0.03] transition-colors">
                  <i class="fas fa-download text-[12px] w-4 text-center"></i><span>{'\u6570\u636e\u5bfc\u51fa'}</span>
                </button>
                <a href="/settings/feishu" class="flex items-center gap-2.5 px-3.5 h-[40px] rounded-[12px] text-[13px] text-primary/40 hover:text-primary/70 hover:bg-black/[0.03] transition-colors">
                  <i class="fas fa-gear text-[12px] w-4 text-center"></i><span>{'\u8bbe\u7f6e'}</span>
                </a>
                <button onclick="window.open('https://github.com','_blank')" class="w-full flex items-center gap-2.5 px-3.5 h-[40px] rounded-[12px] text-[13px] text-primary/40 hover:text-primary/70 hover:bg-black/[0.03] transition-colors">
                  <i class="fas fa-circle-question text-[12px] w-4 text-center"></i><span>{'\u5e2e\u52a9\u4e0e\u53cd\u9988'}</span>
                </button>
              </div>
            </aside>

            {/* Content area */}
            <div id="app-content" class="flex-1 min-w-0 overflow-y-auto bg-surface">
              {children}
            </div>

            {/* === Right Chat Agent Panel (Plan B: Collapsible, default open) === */}
            <div id="chat-agent-root" x-data="chatAgent" class="chat-agent-panel flex-shrink-0 border-l border-black/[0.06] bg-[#FAFAF8] hidden lg:flex flex-col overflow-hidden" x-bind:class="expanded ? 'chat-agent-expanded' : 'chat-agent-collapsed'">

              {/* --- Collapsed State: Icon strip --- */}
              <div x-show="!expanded" class="flex flex-col items-center pt-4 gap-3 h-full">
                <button x-on:click="toggle()" class="w-9 h-9 rounded-xl flex items-center justify-center bg-accent/10 text-accent hover:bg-accent/20 transition-all" title={'\u5c55\u5f00 AI \u52a9\u624b'}>
                  <i class="fas fa-robot text-[14px]"></i>
                </button>
                <div class="w-5 h-px bg-black/[0.06]"></div>
                <button x-on:click="toggle()" class="w-8 h-8 rounded-lg flex items-center justify-center text-secondary/50 hover:text-secondary hover:bg-black/[0.04] transition-all" title={'\u5c55\u5f00'}>
                  <i class="fas fa-chevron-left text-[10px]"></i>
                </button>
              </div>

              {/* --- Expanded State: Full chat panel --- */}
              <div x-show="expanded" x-transition:enter="transition-opacity duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" class="flex flex-col h-full min-w-0">

                {/* Header (44px) */}
                <div class="h-[44px] px-4 flex items-center gap-2 border-b border-black/[0.06] flex-shrink-0">
                  <div class="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-[11px] text-accent"></i>
                  </div>
                  <span class="text-[13px] font-semibold text-primary truncate">AI {'\u52a9\u624b'}</span>
                  {/* Context tag */}
                  <span class="ml-auto text-[11px] text-secondary/60 bg-black/[0.03] px-2 py-0.5 rounded-full truncate max-w-[100px]" x-text="pageLabel"></span>
                  {/* Actions */}
                  <button x-on:click="clearChat()" class="w-6 h-6 rounded-md flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-black/[0.04] transition-all flex-shrink-0" title={'\u6e05\u7a7a\u5bf9\u8bdd'}>
                    <i class="fas fa-trash-can text-[10px]"></i>
                  </button>
                  <button x-on:click="toggle()" class="w-6 h-6 rounded-md flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-black/[0.04] transition-all flex-shrink-0" title={'\u6536\u8d77'}>
                    <i class="fas fa-chevron-right text-[10px]"></i>
                  </button>
                </div>

                {/* Messages Area */}
                <div x-ref="chatMessages" class="flex-1 overflow-y-auto px-4 py-3 space-y-3 chat-agent-messages">

                  {/* Welcome message (shown when no messages) */}
                  <template x-if="messages.length === 0">
                    <div class="text-center py-8">
                      <div class="w-12 h-12 mx-auto mb-3 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <i class="fas fa-robot text-[20px] text-accent/60"></i>
                      </div>
                      <p class="text-[14px] font-medium text-primary mb-1">{'\u4f60\u597d\uff0c\u6211\u662f FindJob AI \u52a9\u624b'}</p>
                      <p class="text-[12px] text-secondary/60 mb-4" x-text="'\u5f53\u524d\u9875\u9762: ' + pageLabel + '\uff0c\u6211\u53ef\u4ee5\u5e2e\u4f60\u2026'"></p>
                      {/* Quick action cards */}
                      <div class="space-y-2">
                        <template x-for="(action, idx) in getQuickActions()" x-bind:key="idx">
                          <button x-on:click="quickAction(action.prompt)" class="w-full text-left px-3 py-2.5 rounded-xl bg-white border border-black/[0.04] text-[13px] text-primary/80 hover:border-accent/20 hover:bg-accent/[0.02] transition-all">
                            <span x-text="action.label"></span>
                            <i class="fas fa-arrow-right text-[9px] text-secondary/30 ml-1"></i>
                          </button>
                        </template>
                      </div>
                    </div>
                  </template>

                  {/* Message bubbles */}
                  <template x-for="(msg, idx) in messages" x-bind:key="idx">
                    <div>
                      {/* User message */}
                      <template x-if="msg.role === 'user'">
                        <div class="flex justify-end">
                          <div class="max-w-[85%]">
                            <div class="chat-bubble-user px-3.5 py-2.5 text-[13px] leading-relaxed" x-text="msg.content"></div>
                            <div class="text-[10px] text-secondary/40 mt-1 text-right" x-text="msg.time"></div>
                          </div>
                        </div>
                      </template>
                      {/* AI message */}
                      <template x-if="msg.role === 'assistant'">
                        <div class="flex justify-start">
                          <div class="max-w-[90%]">
                            <div class="flex items-center gap-1.5 mb-1">
                              <div class="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-robot text-[9px] text-accent"></i>
                              </div>
                              <span class="text-[11px] text-secondary/50">AI</span>
                            </div>
                            {/* Streaming typing indicator */}
                            <template x-if="msg.isStreaming && !msg.content">
                              <div class="chat-bubble-ai px-3.5 py-2.5 flex items-center gap-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-secondary/40 chat-typing-dot"></span>
                                <span class="w-1.5 h-1.5 rounded-full bg-secondary/40 chat-typing-dot"></span>
                                <span class="w-1.5 h-1.5 rounded-full bg-secondary/40 chat-typing-dot"></span>
                              </div>
                            </template>
                            {/* Message content */}
                            <template x-if="msg.content">
                              <div class="chat-bubble-ai px-3.5 py-2.5 text-[13px] leading-relaxed text-primary/90" x-html="formatContent(msg.content)"></div>
                            </template>
                            <div class="text-[10px] text-secondary/40 mt-1" x-text="msg.time"></div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </template>
                </div>

                {/* Quick actions (shown when has messages) */}
                <template x-if="messages.length > 0 && !isStreaming">
                  <div class="px-4 py-2 border-t border-black/[0.04] flex-shrink-0">
                    <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
                      <template x-for="(action, idx) in getQuickActions()" x-bind:key="idx">
                        <button x-on:click="quickAction(action.prompt)" class="flex-shrink-0 px-2.5 py-1 rounded-full bg-white border border-black/[0.06] text-[11px] text-secondary/80 hover:text-primary hover:border-accent/20 transition-all">
                          <span x-text="action.label"></span>
                        </button>
                      </template>
                    </div>
                  </div>
                </template>

                {/* Input Area */}
                <div class="px-3 py-3 border-t border-black/[0.06] flex-shrink-0">
                  {/* Stop button (during streaming) */}
                  <template x-if="isStreaming">
                    <div class="flex justify-center mb-2">
                      <button x-on:click="stopGeneration()" class="px-3 py-1 rounded-full bg-error/10 text-error text-[12px] font-medium hover:bg-error/20 transition-all flex items-center gap-1">
                        <i class="fas fa-stop text-[8px]"></i>
                        <span>{'\u505c\u6b62\u751f\u6210'}</span>
                      </button>
                    </div>
                  </template>
                  <div class="flex items-end gap-2">
                    <textarea
                      x-model="inputText"
                      x-on:keydown="handleKeydown($event)"
                      placeholder={'\u8f93\u5165\u4f60\u7684\u95ee\u9898\u2026'}
                      rows="1"
                      class="chat-agent-input flex-1 min-h-[40px] max-h-[100px] px-3 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[13px] text-primary placeholder-secondary/50 resize-none"
                      x-bind:disabled="isStreaming"
                    ></textarea>
                    <button
                      x-on:click="sendMessage()"
                      x-bind:disabled="!inputText.trim() || isStreaming"
                      class="w-[40px] h-[40px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      x-bind:class="inputText.trim() && !isStreaming ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-black/[0.04] text-secondary/30'"
                    >
                      <i class="fas fa-arrow-up text-[13px]"></i>
                    </button>
                  </div>
                  <div class="text-[10px] text-secondary/40 text-center mt-1.5">{'\u7531\u767e\u70bc qwen-plus \u9a71\u52a8 \u00b7 \u652f\u6301\u8054\u7f51\u641c\u7d22'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* === Mobile Bottom Navigation (V2: 5 tabs) === */}
          <div id="mobile-nav" class="lg:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-black/[0.06] z-50 safe-area-bottom">
            <div class="flex items-center justify-around px-2 py-1.5">
              <a href="/" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors" data-tab-path="/">
                <i class="fas fa-home text-[16px]"></i><span>{'\u9996\u9875'}</span>
              </a>
              <a href="/opportunities" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors" data-tab-path="/opportunit">
                <i class="fas fa-compass text-[16px]"></i><span>{'\u673a\u4f1a'}</span>
              </a>
              <a href="/job/new" class="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white shadow-md active:scale-95 transition-transform">
                <i class="fas fa-plus text-[14px]"></i>
              </a>
              <a href="/interviews" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors" data-tab-path="/interview">
                <i class="fas fa-comments text-[16px]"></i><span>{'\u9762\u8bd5'}</span>
              </a>
              <a href="/decisions" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors" data-tab-path="/decision">
                <i class="fas fa-scale-balanced text-[16px]"></i><span>{'\u51b3\u7b56'}</span>
              </a>
              <a href="/monitor" class="mobile-tab flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] text-secondary hover:text-primary transition-colors" data-tab-path="/monitor">
                <i class="fas fa-gauge-high text-[16px]"></i><span>{'\u76d1\u63a7'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* ===== Sidebar & Navigation Script (PRD v1.5) ===== */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var path = window.location.pathname;
              var search = window.location.search;
              var fullPath = path + search;
              var isHome = (path === '/' || path === '');
              var activeWorkspace = null;

              // Home page: add body class to hide sidebar + top bar
              if (isHome) {
                document.body.classList.add('is-home');
              }

              // Determine active workspace from path
              if (isHome) activeWorkspace = null;
              else if (path.startsWith('/opportunit') || path.startsWith('/job')) activeWorkspace = 'jobs';
              else if (path.startsWith('/asset') || path.startsWith('/resume') || path.startsWith('/resumes')) activeWorkspace = 'resume';
              else if (path.startsWith('/question') || path.startsWith('/interview')) activeWorkspace = 'interview';
              else if (path.startsWith('/application') || path.startsWith('/decision')) activeWorkspace = 'offer';
              else if (path.startsWith('/metrics') || path.startsWith('/growth')) activeWorkspace = 'growth';
              else if (path.startsWith('/monitor')) activeWorkspace = 'monitor';

              // === Breadcrumb update ===
              var bcModule = document.getElementById('nav-bc-module');
              var bcSep = document.getElementById('nav-bc-sep');
              var bcPage = document.getElementById('nav-bc-page');
              var moduleNames = { jobs: '\\u673a\\u4f1a', resume: '\\u8d44\\u4ea7', interview: '\\u9762\\u8bd5', offer: '\\u51b3\\u7b56', growth: '\\u6210\\u957f', monitor: '\\u76d1\\u63a7' };
              var pageNames = {
                '/opportunities': '\\u5c97\\u4f4d\\u5217\\u8868', '/job/new': '\\u5c97\\u4f4d\\u89e3\\u6790',
                '/assets': '\\u8d44\\u4ea7\\u4e2d\\u5fc3', '/resumes': '\\u7b80\\u5386\\u5e93', '/resume': '\\u7b80\\u5386\\u4f18\\u5316',
                '/questions': '\\u9762\\u8bd5\\u9898\\u5e93', '/questions/new': '\\u9762\\u8bd5\\u8f85\\u5bfc', '/questions/import': '\\u9762\\u8bd5\\u6a21\\u62df',
                '/interviews': '\\u9762\\u8bd5\\u5de5\\u4f5c\\u53f0',
                '/applications': '\\u6295\\u9012\\u8ddf\\u8e2a', '/decisions': '\\u51b3\\u7b56\\u4e2d\\u5fc3',
                '/metrics': '\\u6210\\u957f\\u9762\\u677f', '/growth': '\\u6210\\u957f\\u4e2d\\u5fc3',
                '/monitor': '\\u6570\\u636e\\u9a7e\\u9a76\\u8231', '/settings/feishu': '\\u8bbe\\u7f6e'
              };
              if (activeWorkspace && bcModule) {
                bcModule.textContent = moduleNames[activeWorkspace] || '';
                var pageName = pageNames[path];
                if (pageName && bcSep && bcPage) {
                  bcSep.classList.remove('hidden');
                  bcPage.classList.remove('hidden');
                  bcPage.textContent = pageName;
                }
              }

              // === Target role in top bar ===
              var roleLabel = document.getElementById('nav-role-label');
              var savedRole = localStorage.getItem('jobcopilot_target_role');
              if (roleLabel && savedRole) {
                roleLabel.textContent = savedRole;
              }

              // === Global search: Ctrl+K focus ===
              document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                  e.preventDefault();
                  var input = document.getElementById('global-search-input');
                  if (input) input.focus();
                }
              });

              // === Highlight active sidebar home link ===
              if (isHome) {
                var homeLink = document.querySelector('.sidebar-home');
                if (homeLink) {
                  homeLink.classList.add('active');
                }
              }

              // === Highlight active submenu link ===
              document.querySelectorAll('#sidebar-workspaces .sidebar-sub-item').forEach(function(link) {
                var href = link.getAttribute('href');
                if (href === fullPath || href === path) {
                  link.classList.add('active-link');
                }
              });

              // === Sidebar group expand/collapse ===
              document.querySelectorAll('.sidebar-group').forEach(function(group) {
                var trigger = group.querySelector('.sidebar-trigger');
                var submenu = group.querySelector('.sidebar-submenu');
                var arrow = group.querySelector('.sidebar-arrow');
                var ws = group.dataset.workspace;

                if (!trigger || !submenu) return;

                // Auto expand active workspace
                if (ws === activeWorkspace) {
                  submenu.classList.remove('max-h-0', 'opacity-0');
                  submenu.classList.add('max-h-[280px]', 'opacity-100');
                  if (arrow) arrow.classList.add('rotate-90');
                  trigger.classList.add('active');
                }

                // Click toggle
                trigger.addEventListener('click', function() {
                  var isOpen = submenu.classList.contains('max-h-[280px]');

                  // Close others
                  document.querySelectorAll('.sidebar-group').forEach(function(g) {
                    if (g !== group) {
                      var sm = g.querySelector('.sidebar-submenu');
                      var ar = g.querySelector('.sidebar-arrow');
                      if (sm) { sm.classList.remove('max-h-[280px]', 'opacity-100'); sm.classList.add('max-h-0', 'opacity-0'); }
                      if (ar) ar.classList.remove('rotate-90');
                    }
                  });

                  if (isOpen) {
                    submenu.classList.remove('max-h-[280px]', 'opacity-100');
                    submenu.classList.add('max-h-0', 'opacity-0');
                    if (arrow) arrow.classList.remove('rotate-90');
                  } else {
                    submenu.classList.remove('max-h-0', 'opacity-0');
                    submenu.classList.add('max-h-[280px]', 'opacity-100');
                    if (arrow) arrow.classList.add('rotate-90');
                  }
                });

                // Hover expand
                group.addEventListener('mouseenter', function() {
                  submenu.classList.remove('max-h-0', 'opacity-0');
                  submenu.classList.add('max-h-[280px]', 'opacity-100');
                  if (arrow) arrow.classList.add('rotate-90');
                });
                group.addEventListener('mouseleave', function() {
                  if (ws !== activeWorkspace) {
                    submenu.classList.remove('max-h-[280px]', 'opacity-100');
                    submenu.classList.add('max-h-0', 'opacity-0');
                    if (arrow) arrow.classList.remove('rotate-90');
                  }
                });
              });

              // === Recent access items (sidebar) ===
              document.addEventListener('DOMContentLoaded', function() {
                try {
                  var container = document.getElementById('sidebar-recent-items');
                  if (!container) return;
                  var items = [];
                  var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
                  var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                  var interviews = JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]');
                  jobs.slice(-1).forEach(function(j) {
                    items.push({ name: (j.basic_info && j.basic_info.job_name) || j.title || '\\u5c97\\u4f4d\\u5206\\u6790', url: '/job/' + j.id, icon: 'fa-compass' });
                  });
                  resumes.slice(-1).forEach(function(r) {
                    items.push({ name: (r.basic_info && r.basic_info.name) || '\\u7b80\\u5386', url: '/resume/' + r.id, icon: 'fa-file-alt' });
                  });
                  interviews.slice(-1).forEach(function(iv) {
                    items.push({ name: iv.question || '\\u9762\\u8bd5\\u9898', url: '/questions/' + iv.id, icon: 'fa-comments' });
                  });
                  if (items.length > 0) {
                    container.innerHTML = items.slice(0, 3).map(function(item) {
                      return '<a href="' + item.url + '" class="px-3 h-[34px] rounded-[10px] flex items-center text-[13px] text-primary/55 hover:text-primary hover:bg-black/[0.03] transition-all truncate">' +
                        '<i class="fas ' + item.icon + ' text-[10px] mr-2.5 text-secondary/40 flex-shrink-0"></i>' +
                        '<span class="truncate">' + item.name + '</span></a>';
                    }).join('');
                  }
                } catch(e) {}
              });

              // === Mobile bottom nav highlight ===
              document.querySelectorAll('.mobile-tab').forEach(function(link) {
                var tabPath = link.getAttribute('data-tab-path');
                if (!tabPath) return;
                var isActive = false;
                if (tabPath === '/') {
                  isActive = isHome;
                } else {
                  isActive = path.startsWith(tabPath);
                }
                if (isActive) {
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

            // Resume status - update nav avatar
            document.addEventListener('DOMContentLoaded', function() {
              var el = document.getElementById('nav-avatar');
              if (el && window.JobCopilot) {
                var s = JobCopilot.getResumeStatus();
                if (s.hasResume) {
                  el.classList.remove('bg-black/[0.06]', 'text-secondary');
                  el.classList.add('bg-accent/10', 'text-accent');
                  el.title = s.resumeName;
                }
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
