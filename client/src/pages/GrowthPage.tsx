/**
 * GrowthPage — 成长中心
 *
 * A6 API 接入版本:
 * - 成长陪伴师通过 useChat() 接入 AI 对话
 * - 子组件暂用 mock 数据，后续逐步接入
 */
import { useState, useCallback } from "react";
import { Search, Plus, Calendar, MessageSquare } from "lucide-react";
import { GrowthLeftColumn } from "../components/GrowthLeftColumn";
import { GrowthMiddleColumn } from "../components/GrowthMiddleColumn";
import { GrowthRightColumn } from "../components/GrowthRightColumn";
import { useChat } from "../hooks";
import { useGuestCheck } from "../hooks/useGuestCheck";
import { LoginPromptModal } from "../components/LoginPromptModal";

export function GrowthPage() {
  // 当前活跃模块
  const [activeModule, setActiveModule] = useState<"coach" | "skills" | "plan" | "review" | "memory">("coach");

  // 游客检查
  const { checkGuest, showLoginPrompt, setShowLoginPrompt, loginScenario } = useGuestCheck();

  // 带登录检查的操作
  const handleNewSkill = useCallback(() => {
    if (!checkGuest('access-growth')) return;
    setActiveModule("skills");
  }, [checkGuest]);

  const handleNewPlan = useCallback(() => {
    if (!checkGuest('access-growth')) return;
    setActiveModule("plan");
  }, [checkGuest]);

  const handleContinueChat = useCallback(() => {
    if (!checkGuest('access-growth')) return;
    setActiveModule("coach");
  }, [checkGuest]);

  // 子模块配置
  const modules = [
    { id: "coach" as const, label: "成长陪伴师" },
    { id: "skills" as const, label: "Skills 自动化" },
    { id: "plan" as const, label: "周计划" },
    { id: "review" as const, label: "周复盘" },
    { id: "memory" as const, label: "长期记忆" }
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 页面标题区 */}
      <div className="flex-shrink-0 px-7 pt-7 pb-5">
        <h1 className="text-3xl font-semibold mb-2">成长</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          把陪伴、自动化、计划和复盘，组织成一套可以长期坚持的职业成长系统。
        </p>
      </div>

      {/* 顶部工具条 */}
      <div className="flex-shrink-0 px-7 pb-5">
        <div className="flex items-center justify-between">
          {/* 左侧：搜索 + 子模块切换 */}
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索记忆、Skill、计划、复盘"
                className="w-[280px] h-[44px] pl-10 pr-4 bg-card rounded-[14px] border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* 子模块切换胶囊 */}
            <div className="flex items-center gap-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`
                    h-[34px] px-3.5 rounded-[999px] text-xs font-medium transition-all
                    ${activeModule === module.id
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  {module.label}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewSkill}
              className="h-[44px] px-4 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新建 Skill
            </button>
            <button
              onClick={handleNewPlan}
              className="h-[44px] px-4 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              新建周计划
            </button>
            <button
              onClick={handleContinueChat}
              className="h-[44px] px-4 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              继续对话
            </button>
          </div>
        </div>
      </div>

      {/* 三栏主体布局 */}
      <div className="flex-1 overflow-hidden px-7 pb-6">
        <div className="h-full flex gap-5">
          {/* 左栏：成长导航区 */}
          <GrowthLeftColumn
            activeModule={activeModule}
            onModuleChange={setActiveModule}
          />

          {/* 中栏：动态内容区 */}
          <GrowthMiddleColumn mode={activeModule} />

          {/* 右栏：记忆与辅助区 */}
          <GrowthRightColumn mode={activeModule} />
        </div>
      </div>

      {/* 登录拦截弹层 */}
      {showLoginPrompt && (
        <LoginPromptModal
          scenario={loginScenario}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  );
}
