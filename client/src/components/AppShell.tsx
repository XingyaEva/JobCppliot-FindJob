import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import {
  Home,
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  MessageSquare,
  Scale,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  Search,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Crown,
  LogIn,
} from "lucide-react";
import { FloatingAIAssistant } from "./FloatingAIAssistant";
import { GuestBanner } from "./GuestBanner";
import { useUser } from "../contexts/UserContext";

// 普通用户导航
const navigation = [
  { name: "首页", path: "/", icon: Home },
  { name: "我的看板", path: "/my-dashboard", icon: LayoutDashboard },
  { name: "机会工作台", path: "/opportunities", icon: Briefcase },
  { name: "资产中心", path: "/assets", icon: FolderOpen },
  { name: "面试工作台", path: "/interviews", icon: MessageSquare },
  { name: "决策中心", path: "/decisions", icon: Scale },
  { name: "成长中心", path: "/growth", icon: TrendingUp },
];

// 管理员导航
const adminNavigation = [
  { name: "数据驾驶舱", path: "/admin/dashboard", icon: BarChart3, adminOnly: true },
];

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 256;
const COLLAPSED_WIDTH = 72;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userState, userInfo, isAuthenticated, isAdmin, isLoading } = useUser();
  
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isCollapsed) return;
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
        lastWidthRef.current = newWidth;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isCollapsed]);

  const handleMouseDown = () => {
    if (!isCollapsed) {
      setIsResizing(true);
    }
  };

  const toggleCollapse = () => {
    if (isCollapsed) {
      setSidebarWidth(lastWidthRef.current);
      setIsCollapsed(false);
    } else {
      lastWidthRef.current = sidebarWidth;
      setSidebarWidth(COLLAPSED_WIDTH);
      setIsCollapsed(true);
    }
  };

  // 用户显示名称
  const displayName = userInfo?.nickname || userInfo?.phone || '游客';
  const displayEmail = userInfo?.email || (isAuthenticated ? '已登录' : '未登录');
  const avatarLetter = (userInfo?.nickname || userInfo?.phone || 'G')[0].toUpperCase();

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="flex-shrink-0 bg-card border-r border-border flex flex-col relative transition-all duration-300 ease-in-out"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border justify-between">
          {!isCollapsed ? (
            <>
              <h1 className="text-xl font-semibold tracking-tight">FindJob</h1>
              <button
                onClick={toggleCollapse}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                title="收缩侧边栏"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={toggleCollapse}
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-all group"
                title="展开侧边栏"
              >
                <ChevronRight
                  className="w-4 h-4 text-primary-foreground"
                  strokeWidth={2}
                />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 rounded-[14px] transition-all duration-200
                  ${isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"}
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* 用户功能区 — 登录后显示个人中心 & 会员 */}
          {isAuthenticated && (
            <>
              <div className={`my-3 ${isCollapsed ? 'mx-2' : 'mx-1'}`}>
                <div className="border-t border-border" />
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 mt-3 mb-1 px-2">
                    <User className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      我的账户
                    </span>
                  </div>
                )}
              </div>
              <NavLink
                to="/profile"
                className={`
                  flex items-center gap-3 rounded-[14px] transition-all duration-200
                  ${isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"}
                  ${
                    location.pathname === "/profile"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
                title={isCollapsed ? "个人中心" : undefined}
              >
                <User className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">个人中心</span>
                )}
              </NavLink>
              <NavLink
                to="/membership"
                className={`
                  flex items-center gap-3 rounded-[14px] transition-all duration-200
                  ${isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"}
                  ${
                    location.pathname === "/membership"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-700"
                  }
                `}
                title={isCollapsed ? "会员中心" : undefined}
              >
                <Crown className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!isCollapsed && (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">会员中心</span>
                    {userInfo?.isPremium && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium flex-shrink-0">
                        PRO
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            </>
          )}

          {/* 管理员导航区域 — 仅 admin 角色可见 */}
          {isAdmin && adminNavigation.length > 0 && (
            <>
              <div className={`my-3 ${isCollapsed ? 'mx-2' : 'mx-1'}`}>
                <div className="border-t border-border" />
                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 mt-3 mb-1 px-2">
                    <Shield className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      管理后台
                    </span>
                  </div>
                )}
              </div>
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 rounded-[14px] transition-all duration-200
                      ${isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"}
                      ${
                        isActive
                          ? "bg-orange-600 text-white"
                          : "text-muted-foreground hover:bg-orange-50 hover:text-orange-700"
                      }
                    `}
                    title={isCollapsed ? `[管理] ${item.name}` : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom user info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-[14px] hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">{avatarLetter}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                </div>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <LogIn className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium text-primary">登录 / 注册</span>
              </button>
            )}
          </div>
        )}

        {/* Collapsed user avatar */}
        {isCollapsed && (
          <div className="p-4 border-t border-border flex justify-center">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                title={displayName}
              >
                <span className="text-sm font-medium text-primary">{avatarLetter}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                title="登录 / 注册"
              >
                <LogIn className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </button>
            )}
          </div>
        )}

        {/* Resize handle */}
        {!isCollapsed && (
          <div
            className={`
              absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group
              hover:bg-primary/20 transition-colors
              ${isResizing ? "bg-primary/30" : ""}
            `}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-5 h-8 rounded-md bg-card border border-border shadow-sm flex items-center justify-center">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Guest Banner — 游客态时显示 */}
        {userState === 'guest' && !isLoading && <GuestBanner />}

        {/* Top header */}
        <header className="h-16 flex-shrink-0 bg-card border-b border-border flex items-center justify-between px-8">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索岗位、公司、技能..."
                className="w-full pl-10 pr-4 py-2 bg-secondary rounded-[14px] text-sm border-0 focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-[14px] flex items-center justify-center hover:bg-secondary transition-colors">
              <Bell
                className="w-5 h-5 text-muted-foreground"
                strokeWidth={1.5}
              />
            </button>
            <button className="w-9 h-9 rounded-[14px] flex items-center justify-center hover:bg-secondary transition-colors">
              <Settings
                className="w-5 h-5 text-muted-foreground"
                strokeWidth={1.5}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}
