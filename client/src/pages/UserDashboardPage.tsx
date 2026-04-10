import { useState } from "react";
import {
  Target,
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  Star,
  Award,
  BarChart3,
  ChevronRight,
  Sparkles,
  Eye,
  Send,
  ThumbsUp,
  AlertCircle,
  Zap,
  Activity,
  Loader2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  useDashboardSummary,
  useDashboardFunnel,
  useDashboardActivityTrend,
  useDashboardSkillRadar,
  useDashboardActivities,
  useDashboardInsights,
  useWeeklyGoals,
  useUpdateWeeklyGoal,
} from "../hooks/use-dashboard";

// ===== 空态占位组件 =====

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-[14px] bg-secondary flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground/70">{description}</p>
    </div>
  );
}

function LoadingBlock({ height = "h-[200px]" }: { height?: string }) {
  return (
    <div className={`flex items-center justify-center ${height}`}>
      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
    </div>
  );
}

// ===== KPI 卡片配置 =====

const kpiConfig = [
  {
    id: "tracked",
    label: "追踪岗位",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    dataKey: "trackedJobs" as const,
    changeKey: "tracked" as const,
    description: "本周新增",
  },
  {
    id: "applied",
    label: "已投递",
    icon: Send,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    dataKey: "appliedJobs" as const,
    changeKey: "applied" as const,
    description: "本周投递",
  },
  {
    id: "interviews",
    label: "面试中",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
    dataKey: "interviewCount" as const,
    changeKey: "interview" as const,
    description: "本周新增",
  },
  {
    id: "offers",
    label: "收到 Offer",
    icon: Award,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    dataKey: "offerCount" as const,
    changeKey: null,
    description: "待决策",
  },
];

// ===== 活动类型图标映射 =====

const activityIcons: Record<string, React.ElementType> = {
  parse: FileText,
  match: Target,
  resume: FileText,
  interview: MessageSquare,
  offer: Award,
  apply: Send,
  optimize: Sparkles,
  question: BarChart3,
  other: Activity,
};

const activityColors: Record<string, string> = {
  parse: "bg-blue-50 text-blue-600",
  match: "bg-purple-50 text-purple-600",
  resume: "bg-green-50 text-green-600",
  interview: "bg-orange-50 text-orange-600",
  offer: "bg-emerald-50 text-emerald-600",
  apply: "bg-purple-50 text-purple-600",
  optimize: "bg-amber-50 text-amber-600",
  question: "bg-indigo-50 text-indigo-600",
  other: "bg-secondary text-muted-foreground",
};

// ===== 主组件 =====

export function UserDashboardPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week");

  // 真实数据 hooks
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary();
  const { data: funnelData, isLoading: funnelLoading } = useDashboardFunnel();
  const { data: trendData, isLoading: trendLoading } = useDashboardActivityTrend();
  const { data: radarData, isLoading: radarLoading } = useDashboardSkillRadar();
  const { data: activitiesData, isLoading: activitiesLoading } = useDashboardActivities();
  const { data: insightsData, isLoading: insightsLoading } = useDashboardInsights();
  const { data: goalsData, isLoading: goalsLoading } = useWeeklyGoals();
  const updateGoal = useUpdateWeeklyGoal();

  // 解析后端响应数据
  const summary = summaryData as any;
  const funnelStages = (funnelData as any)?.stages ?? [];
  const trendWeeks = (trendData as any)?.weeks ?? [];
  const radarDimensions = (radarData as any)?.dimensions ?? [];
  const radarOverallScore = (radarData as any)?.overallScore ?? 0;
  const radarMatchCount = (radarData as any)?.matchCount ?? 0;
  const activities = Array.isArray(activitiesData) ? activitiesData : (activitiesData as any)?.activities ?? activitiesData ?? [];
  const insights = Array.isArray(insightsData) ? insightsData : (insightsData as any)?.insights ?? insightsData ?? [];
  const goals = Array.isArray(goalsData) ? goalsData : (goalsData as any)?.goals ?? goalsData ?? [];
  const completedGoals = goals.filter((g: any) => g.completed).length;

  // 将 activity trend 数据转为 recharts 格式
  const chartTrendData = trendWeeks.map((w: any) => ({
    week: w.week,
    解析岗位: w.parseJobs,
    投递简历: w.applyResumes,
    面试准备: w.interviewPrep,
  }));

  return (
    <div
      className="flex flex-col bg-background -m-8"
    >
      {/* 页面标题 */}
      <div className="flex-shrink-0 px-7 pt-7 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-1">我的看板</h1>
            <p className="text-sm text-muted-foreground">
              一览求职全局进展，洞察关键行动方向
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["week", "month", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  h-[34px] px-3.5 rounded-[999px] text-xs font-medium transition-all
                  ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  }
                `}
              >
                {range === "week" ? "本周" : range === "month" ? "本月" : "全部"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 px-7 pb-8 space-y-6 pt-4">
        {/* 第一层：求职进度 KPI 卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {kpiConfig.map((kpi) => {
            const Icon = kpi.icon;
            const value = summary?.[kpi.dataKey] ?? 0;
            const change = kpi.changeKey
              ? summary?.weeklyChange?.[kpi.changeKey] ?? 0
              : value;
            const changeType =
              kpi.changeKey === null
                ? "neutral"
                : change > 0
                ? "up"
                : change < 0
                ? "down"
                : "neutral";
            const changeText =
              kpi.changeKey === null
                ? String(value)
                : change > 0
                ? `+${change}`
                : String(change);

            return (
              <div
                key={kpi.id}
                className="bg-card rounded-[20px] p-5 border border-border hover:border-primary/20 transition-all cursor-pointer group"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-[12px] ${kpi.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${kpi.color}`} strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center gap-1">
                    {changeType === "up" && (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    )}
                    {changeType === "down" && (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        changeType === "up"
                          ? "text-green-600"
                          : changeType === "down"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {summaryLoading ? "-" : changeText}
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-semibold mb-1">
                  {summaryLoading ? (
                    <span className="inline-block w-8 h-8 bg-secondary rounded animate-pulse" />
                  ) : (
                    value
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  {kpi.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* 第二层：漏斗 + 能力雷达图 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 求职漏斗 */}
          <div
            className="bg-card rounded-[24px] p-6 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold mb-1">我的求职漏斗</h2>
                <p className="text-xs text-muted-foreground">
                  从追踪到 Offer，看清每一步转化
                </p>
              </div>
              <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                详细分析
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {funnelLoading ? (
              <LoadingBlock height="h-[220px]" />
            ) : funnelStages.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="暂无漏斗数据"
                description="开始追踪岗位和投递，漏斗会自动生成"
              />
            ) : (
              <>
                <div className="space-y-3">
                  {funnelStages.map((item: any, index: number) => {
                    const colors = [
                      "from-blue-500/80 to-blue-400/70",
                      "from-purple-500/80 to-purple-400/70",
                      "from-green-500/80 to-green-400/70",
                      "from-orange-500/80 to-orange-400/70",
                      "from-emerald-500/80 to-emerald-400/70",
                    ];
                    return (
                      <div key={index} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.stage}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-medium">
                              {item.count}
                            </span>
                            <span className="text-xs font-semibold w-12 text-right">
                              {item.rate}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-6 rounded-[8px] bg-secondary overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index % colors.length]} flex items-center justify-end pr-3 transition-all`}
                            style={{ width: `${Math.max(item.rate, 8)}%` }}
                          >
                            {item.rate > 15 && (
                              <span className="text-[11px] text-white font-medium">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-orange-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {funnelStages.length >= 3 &&
                      funnelStages[1]?.count > 0 &&
                      funnelStages[2]?.count / funnelStages[1]?.count < 0.4
                        ? "转化建议：投递->面试环节可通过优化简历关键词提升"
                        : "持续追踪岗位，保持投递节奏"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 能力雷达图 */}
          <div
            className="bg-card rounded-[24px] p-6 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold mb-1">能力画像</h2>
                <p className="text-xs text-muted-foreground">
                  基于已分析岗位的平均匹配维度
                  {radarMatchCount > 0 && (
                    <span className="ml-1">({radarMatchCount} 次评估)</span>
                  )}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-[8px] bg-green-50 text-green-700 text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                综合 {radarLoading ? "..." : radarOverallScore} 分
              </div>
            </div>

            {radarLoading ? (
              <LoadingBlock height="h-[220px]" />
            ) : radarOverallScore === 0 ? (
              <EmptyState
                icon={Star}
                title="暂无能力数据"
                description="对岗位进行匹配评估后，会自动生成能力画像"
              />
            ) : (
              <>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarDimensions} key="skill-radar">
                      <PolarGrid stroke="rgba(0,0,0,0.06)" key="polar-grid" />
                      <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: "#737373", fontSize: 11 }}
                        key="angle-axis"
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                        key="radius-axis"
                      />
                      <Radar
                        name="能力"
                        dataKey="score"
                        stroke="#1a1a1a"
                        fill="#1a1a1a"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        key="radar-line"
                        isAnimationActive={false}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  {radarDimensions
                    .slice()
                    .sort((a: any, b: any) => b.score - a.score)
                    .slice(0, 3)
                    .map((skill: any) => (
                      <div
                        key={skill.dimension}
                        className="text-center p-2 rounded-[10px] bg-secondary/30"
                      >
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {skill.dimension}
                        </p>
                        <p className="text-sm font-semibold">{skill.score}</p>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 第三层：活跃趋势 + 本周目标 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 求职活跃趋势 */}
          <div
            className="col-span-2 bg-card rounded-[24px] p-6 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold mb-1">求职活跃趋势</h2>
                <p className="text-xs text-muted-foreground">
                  近 4 周核心操作量变化
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">解析岗位</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-muted-foreground">投递简历</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">面试准备</span>
                </div>
              </div>
            </div>

            {trendLoading ? (
              <LoadingBlock height="h-[200px]" />
            ) : chartTrendData.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="暂无活跃数据"
                description="使用各模块功能后，趋势图会自动更新"
              />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartTrendData} key="activity-trend">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                    key="grid"
                  />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737373", fontSize: 11 }}
                    key="xaxis"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737373", fontSize: 11 }}
                    key="yaxis"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.04)",
                    }}
                    key="tooltip"
                  />
                  <Area
                    type="monotone"
                    dataKey="解析岗位"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    key="area-parse"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="投递简历"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.08}
                    strokeWidth={2}
                    key="area-apply"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="面试准备"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.06}
                    strokeWidth={2}
                    key="area-interview"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 本周目标 */}
          <div
            className="bg-card rounded-[24px] p-6 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">本周目标</h2>
              <span className="text-xs text-muted-foreground">
                {goalsLoading
                  ? "..."
                  : `${completedGoals}/${goals.length} 完成`}
              </span>
            </div>

            {goalsLoading ? (
              <LoadingBlock height="h-[180px]" />
            ) : goals.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="暂无周目标"
                description="系统会自动创建本周默认目标"
              />
            ) : (
              <div className="space-y-4">
                {goals.map((goal: any) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {goal.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <button
                            className="w-4 h-4 rounded-full border-2 border-border hover:border-primary transition-colors"
                            onClick={() =>
                              updateGoal.mutate({
                                id: goal.id,
                                completed: true,
                              })
                            }
                          />
                        )}
                        <span
                          className={`text-sm ${
                            goal.completed
                              ? "line-through text-muted-foreground"
                              : "font-medium"
                          }`}
                        >
                          {goal.text}
                        </span>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            goal.completed
                              ? "bg-green-500"
                              : goal.current / goal.target >= 0.6
                              ? "bg-blue-500"
                              : "bg-orange-400"
                          }`}
                          style={{
                            width: `${Math.min(
                              (goal.current / goal.target) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full mt-5 py-2.5 rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium">
              编辑目标
            </button>
          </div>
        </div>

        {/* 第四层：AI 洞察 + 近期动态 */}
        <div className="grid grid-cols-2 gap-6">
          {/* AI 洞察建议 */}
          <div
            className="bg-card rounded-[24px] p-6 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">AI 洞察</h2>
              </div>
              <span className="text-xs text-muted-foreground">基于你的求职数据</span>
            </div>

            {insightsLoading ? (
              <LoadingBlock height="h-[200px]" />
            ) : !insights || insights.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="暂无 AI 建议"
                description="积累更多求职数据后，AI 会生成个性化建议"
              />
            ) : (
              <div className="space-y-3">
                {insights.map((insight: any) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-[14px] border transition-all hover:shadow-sm cursor-pointer ${
                      insight.priority === "high"
                        ? "bg-gradient-to-br from-orange-50/50 to-yellow-50/30 border-orange-200/40"
                        : "bg-gradient-to-br from-blue-50/50 to-purple-50/30 border-blue-200/40"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {insight.priority === "high" && (
                          <Zap className="w-3.5 h-3.5 text-orange-500" />
                        )}
                        <h3 className="text-sm font-semibold">{insight.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {insight.description}
                    </p>
                    <button className="text-xs text-primary font-medium hover:text-primary/80 flex items-center gap-1 transition-colors">
                      {insight.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 近期动态时间线 */}
          <div
            className="bg-card rounded-[24px] p-6 border border-border"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">近期动态</h2>
              </div>
              <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                查看全部
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {activitiesLoading ? (
              <LoadingBlock height="h-[200px]" />
            ) : !activities || activities.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="暂无操作记录"
                description="使用各模块功能后，动态会自动记录在这里"
              />
            ) : (
              <div className="space-y-1">
                {activities.slice(0, 8).map((activity: any, index: number) => {
                  const Icon = activityIcons[activity.type] || activityIcons.other;
                  const colorClass =
                    activityColors[activity.type] || activityColors.other;

                  return (
                    <div
                      key={activity.id || index}
                      className="flex items-start gap-3 py-3 hover:bg-secondary/30 rounded-[12px] px-3 -mx-3 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-[10px] ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 第五层：快捷入口 */}
        <div
          className="bg-gradient-to-br from-primary to-primary/80 rounded-[24px] p-6 text-primary-foreground"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">接下来要做什么？</h2>
              <p className="text-sm text-primary-foreground/70">
                {insights && insights.length > 0
                  ? `AI 建议你优先处理：${insights[0]?.title}`
                  : "探索各模块功能，开始你的求职之旅"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-[38px] px-5 rounded-[12px] bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors text-sm font-medium flex items-center gap-2">
                {insights && insights.length > 0 && insights[0]?.action
                  ? insights[0].action
                  : "查看岗位"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="h-[38px] px-5 rounded-[12px] bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 transition-colors text-sm font-medium">
                查看新岗位
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
