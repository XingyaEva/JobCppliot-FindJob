import { useState, useMemo } from "react";
import {
  ArrowRight,
  Target,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  X,
  Loader2,
  Inbox,
  Sparkles,
  Zap,
  Bot,
  ChevronRight,
  Send,
  Eye,
} from "lucide-react";
import { useDashboardSummary, useDashboardInsights } from "../hooks/use-dashboard";
import { useTodos, useCreateTodo, useCompleteTodo, useDismissTodo } from "../hooks/use-todos";
import type { TodoItem } from "../types/api";

// ===== 工具函数 =====

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早安";
  if (hour < 14) return "午安";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function formatDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${year} 年 ${month} 月 ${day} 日，星期${weekdays[d.getDay()]}`;
}

function formatDueTime(dueTime?: string): string {
  if (!dueTime) return "今天内";
  const d = new Date(dueTime);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffHours = diffMs / 3600000;

  if (diffHours < 0) return "已过期";
  if (diffHours < 1) return `${Math.ceil(diffHours * 60)} 分钟后`;
  if (diffHours < 24) return `今天 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} 前`;
  if (diffHours < 48) return `明天 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

// ===== 优先级颜色 =====

const priorityColors: Record<string, string> = {
  high: "text-red-600 bg-red-50",
  medium: "text-orange-600 bg-orange-50",
  low: "text-blue-600 bg-blue-50",
};

const priorityLabels: Record<string, string> = {
  high: "紧急",
  medium: "中",
  low: "低",
};

// ===== Loading 组件 =====

function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 w-10 bg-secondary rounded-[16px]" />
      <div className="h-8 w-16 bg-secondary rounded" />
      <div className="h-4 w-20 bg-secondary rounded" />
    </div>
  );
}

// ===== 主组件 =====

export function HomePage() {
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");

  // 真实数据 hooks
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary();
  const { data: insightsRaw, isLoading: insightsLoading } = useDashboardInsights();
  const { data: todosData, isLoading: todosLoading } = useTodos();
  const createTodo = useCreateTodo();
  const completeTodo = useCompleteTodo();
  const dismissTodo = useDismissTodo();

  // 解析数据
  const summary = summaryData as any;
  const insights = Array.isArray(insightsRaw) ? insightsRaw : (insightsRaw as any)?.insights ?? insightsRaw ?? [];
  const activeTodos: TodoItem[] = (todosData as any)?.active ?? [];
  const todoStats = (todosData as any)?.stats ?? { total: 0, active: 0, completed: 0, auto: 0, manual: 0 };

  // KPI 数据
  const trackedJobs = summary?.trackedJobs ?? 0;
  const weeklyTrackedChange = summary?.weeklyChange?.tracked ?? 0;
  const appliedJobs = summary?.appliedJobs ?? 0;
  const interviewCount = summary?.interviewCount ?? 0;
  const offerCount = summary?.offerCount ?? 0;

  // 计算活跃投递（已投递 + 面试中）
  const activeApps = appliedJobs;

  // 提交新待办
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    createTodo.mutate(
      { text: newTodoText.trim(), priority: "medium" },
      {
        onSuccess: () => {
          setNewTodoText("");
          setShowAddTodo(false);
        },
      }
    );
  };

  return (
    <div
      className="h-screen flex flex-col bg-background overflow-y-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(0,0,0,0.15) transparent",
      }}
    >
      <div className="flex-1 px-7 py-7 space-y-8">
        {/* 顶部欢迎区 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {getGreeting()}，欢迎回来
          </h1>
          <p className="text-muted-foreground">今天是 {formatDate()}</p>
        </div>

        {/* 核心状态卡片 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 卡片 1: 本周新增机会 */}
          <div
            className="bg-card rounded-[28px] p-8 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-[16px] bg-secondary flex items-center justify-center">
                <Target className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-muted-foreground">本周</span>
            </div>
            {summaryLoading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-4xl font-semibold">{trackedJobs}</p>
                  <p className="text-sm text-muted-foreground">追踪岗位</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">本周新增</span>
                  <span
                    className={`text-xs font-medium ${
                      weeklyTrackedChange > 0
                        ? "text-green-600"
                        : weeklyTrackedChange < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {weeklyTrackedChange > 0
                      ? `+${weeklyTrackedChange}`
                      : weeklyTrackedChange === 0
                      ? "0"
                      : weeklyTrackedChange}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 卡片 2: 活跃申请 */}
          <div
            className="bg-card rounded-[28px] p-8 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-[16px] bg-secondary flex items-center justify-center">
                <Briefcase className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-muted-foreground">进行中</span>
            </div>
            {summaryLoading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-4xl font-semibold">{activeApps}</p>
                  <p className="text-sm text-muted-foreground">已投递</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">面试中</span>
                  <span className="text-xs font-medium">{interviewCount} 个</span>
                </div>
              </>
            )}
          </div>

          {/* 卡片 3: 面试 & Offer */}
          <div
            className="bg-card rounded-[28px] p-8 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-[16px] bg-secondary flex items-center justify-center">
                <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-xs text-muted-foreground">进展</span>
            </div>
            {summaryLoading ? (
              <CardSkeleton />
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-4xl font-semibold">{interviewCount}</p>
                  <p className="text-sm text-muted-foreground">面试安排</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Offer</span>
                  <span className="text-xs font-medium">
                    {offerCount > 0 ? `${offerCount} 个` : "暂无"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 主要工作区 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 今日待办 — 混合方案 C */}
          <div
            className="bg-card rounded-[28px] p-8 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">今日待办</h2>
                {todoStats.auto > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                    {todoStats.auto} 条自动
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {todosLoading
                  ? "..."
                  : `${todoStats.completed} / ${todoStats.total} 完成`}
              </span>
            </div>

            {todosLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : activeTodos.length === 0 && !showAddTodo ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-[14px] bg-secondary flex items-center justify-center mb-3">
                  <CheckCircle2
                    className="w-6 h-6 text-green-500"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  待办已清空
                </p>
                <p className="text-xs text-muted-foreground/70">
                  系统会根据你的求职进度自动生成待办
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTodos.slice(0, 5).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-start gap-3 p-4 rounded-[20px] bg-secondary/50 hover:bg-secondary transition-colors group"
                  >
                    {/* 完成按钮 */}
                    <button
                      className="w-5 h-5 rounded-full border-2 border-border mt-0.5 flex-shrink-0 hover:border-green-500 hover:bg-green-50 transition-colors"
                      onClick={() => completeTodo.mutate(todo.id)}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{todo.text}</p>
                        {todo.source === "auto" && (
                          <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium">
                            自动
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {todo.dueTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDueTime(todo.dueTime)}</span>
                          </div>
                        )}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            priorityColors[todo.priority] || ""
                          }`}
                        >
                          {priorityLabels[todo.priority]}
                        </span>
                      </div>
                    </div>

                    {/* 关闭按钮（仅自动推导的） */}
                    {todo.source === "auto" && (
                      <button
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground/50 hover:text-muted-foreground transition-all flex-shrink-0"
                        onClick={() => dismissTodo.mutate(todo.id)}
                        title="忽略此待办"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {activeTodos.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    还有 {activeTodos.length - 5} 项待办
                  </p>
                )}
              </div>
            )}

            {/* 添加待办输入框 */}
            {showAddTodo ? (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                  placeholder="输入待办内容..."
                  autoFocus
                  className="flex-1 h-10 px-4 rounded-[12px] bg-secondary border border-border text-sm outline-none focus:border-primary/30 transition-colors"
                />
                <button
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim() || createTodo.isPending}
                  className="h-10 px-4 rounded-[12px] bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createTodo.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "添加"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddTodo(false);
                    setNewTodoText("");
                  }}
                  className="h-10 w-10 rounded-[12px] bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddTodo(true)}
                className="w-full mt-4 py-2.5 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加待办事项
              </button>
            )}
          </div>

          {/* AI 洞察建议（替代原来的"近期面试"区域，现在由 insights API 驱动） */}
          <div
            className="bg-card rounded-[28px] p-8 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">AI 建议</h2>
              </div>
              <span className="text-xs text-muted-foreground">基于求职数据</span>
            </div>

            {insightsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : !insights || insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-[14px] bg-secondary flex items-center justify-center mb-3">
                  <Bot className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  暂无 AI 建议
                </p>
                <p className="text-xs text-muted-foreground/70">
                  解析岗位、投递简历后，AI 会生成个性化建议
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight: any) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-[16px] border transition-all hover:shadow-sm cursor-pointer ${
                      insight.priority === "high"
                        ? "bg-gradient-to-br from-orange-50/50 to-yellow-50/30 border-orange-200/40"
                        : "bg-gradient-to-br from-blue-50/50 to-purple-50/30 border-blue-200/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {insight.priority === "high" && (
                        <Zap className="w-3.5 h-3.5 text-orange-500" />
                      )}
                      <h3 className="text-sm font-semibold">{insight.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
                      {insight.description}
                    </p>
                    <button className="text-xs text-primary font-medium hover:text-primary/80 flex items-center gap-1 transition-colors">
                      {insight.action}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI 助手建议 - 底部横幅 */}
        <div
          className="bg-gradient-to-br from-primary to-primary/80 rounded-[28px] p-8 text-primary-foreground"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">
                {insights && insights.length > 0
                  ? `AI 建议你优先：${(insights as any)[0]?.title}`
                  : "开始你的求职之旅"}
              </h2>
              <p className="text-sm text-primary-foreground/80 mb-4">
                {insights && insights.length > 0
                  ? (insights as any)[0]?.description
                  : "解析第一个岗位 JD，上传简历，开启智能求职之旅"}
              </p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-[14px] bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors text-sm font-medium">
                  {insights && insights.length > 0
                    ? (insights as any)[0]?.action || "查看详情"
                    : "开始使用"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-[14px] bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 transition-colors text-sm font-medium">
                  查看看板
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-32 h-32 rounded-[20px] bg-primary-foreground/10 flex items-center justify-center">
              <Bot
                className="w-16 h-16 text-primary-foreground/40"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
