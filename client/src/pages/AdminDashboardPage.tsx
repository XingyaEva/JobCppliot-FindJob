import { useState } from "react";
import { 
  Search, 
  Download, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  ChevronRight,
  Target,
  Users,
  Activity,
  Zap,
  DollarSign,
  BarChart3,
  Calendar
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// 北极星趋势数据
const northStarTrendData = [
  { date: "2/20", value: 24.2, target: 32, id: "d1" },
  { date: "2/23", value: 25.8, target: 32, id: "d2" },
  { date: "2/26", value: 26.1, target: 32, id: "d3" },
  { date: "3/01", value: 27.3, target: 32, id: "d4" },
  { date: "3/04", value: 27.9, target: 32, id: "d5" },
  { date: "3/07", value: 28.4, target: 32, id: "d6" },
  { date: "3/10", value: 28.5, target: 32, id: "d7" }
];

// 求职闭环漏斗数据
const funnelData = [
  { stage: "进入首页", users: 12840, rate: 100 },
  { stage: "完成岗位解析", users: 8526, rate: 66.4 },
  { stage: "生成定向简历", users: 5116, rate: 39.8 },
  { stage: "开始面试训练", users: 3719, rate: 29.0 },
  { stage: "建立投递/面试记录", users: 2568, rate: 20.0 },
  { stage: "进入 Offer/决策阶段", users: 1283, rate: 10.0 }
];

// 核心模块表现数据
const modulePerformance = [
  { name: "机会", rate: 72, change: "+5.2%" },
  { name: "资产", rate: 58, change: "+2.1%" },
  { name: "面试", rate: 49, change: "+8.3%" },
  { name: "决策", rate: 21, change: "-1.4%" },
  { name: "成长", rate: 34, change: "+3.7%" }
];

// AI 质量指标
const aiQualityMetrics = [
  { name: "Agent 成功率", value: "96.2%", trend: "down", change: "-0.8%" },
  { name: "字段完整率", value: "94.7%", trend: "up", change: "+1.2%" },
  { name: "用户采纳率", value: "87.3%", trend: "up", change: "+3.5%" },
  { name: "重跑率", value: "8.4%", trend: "up", change: "+1.1%" },
  { name: "投诉率/幻觉率", value: "1.2%", trend: "down", change: "-0.3%" }
];

// 成本效率指标
const costMetrics = [
  { name: "单次任务平均成本", value: "¥2.8" },
  { name: "单用户月均成本", value: "¥38.6" },
  { name: "单位闭环成本", value: "¥14.8" },
  { name: "高价值行为成本", value: "¥6.2" },
  { name: "API 错误率", value: "0.4%" }
];

// 异常提醒
const alerts = [
  { id: 1, text: "面试辅导 Agent 成功率下降 2.1%", severity: "warning" },
  { id: 2, text: "岗位解析 → 定向简历转化下降 8%", severity: "critical" },
  { id: 3, text: "某渠道激活率高但闭环率低", severity: "info" },
  { id: 4, text: "决策模块近 7 天进入率明显下降", severity: "warning" }
];

// 用户分群数据
const userSegments = [
  { type: "目标明确型", activation: 68, closure: 42, retention: 45 },
  { type: "目标模糊型", activation: 52, closure: 18, retention: 28 },
  { type: "长期成长型", activation: 61, closure: 38, retention: 52 }
];

export function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<"overview" | "growth" | "closure" | "ai" | "retention" | "operation">("overview");
  const [activeStage, setActiveStage] = useState<"validation" | "development" | "mature">("development");
  const [timeRange, setTimeRange] = useState("30");

  const views = [
    { id: "overview" as const, label: "总览" },
    { id: "growth" as const, label: "增长" },
    { id: "closure" as const, label: "闭环" },
    { id: "ai" as const, label: "AI 质量" },
    { id: "retention" as const, label: "留存" },
    { id: "operation" as const, label: "经营" }
  ];

  const stages = [
    { id: "validation" as const, label: "验证期" },
    { id: "development" as const, label: "发展期" },
    { id: "mature" as const, label: "成熟期" }
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-y-auto" style={{ 
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.15) transparent'
    }}>
      {/* 页面标题区 */}
      <div className="flex-shrink-0 px-7 pt-7 pb-5">
        <h1 className="text-3xl font-semibold mb-2">数据驾驶舱</h1>
        <p className="text-sm text-muted-foreground">
          从增长、闭环、AI 质量到经营效率，快速判断产品现在是否健康。
        </p>
      </div>

      {/* 顶部工具条 */}
      <div className="flex-shrink-0 px-7 pb-6">
        <div className="flex items-center justify-between">
          {/* 左侧 */}
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索指标、模块、Agent"
                className="w-[260px] h-[44px] pl-10 pr-4 bg-card rounded-[14px] border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* 视角切换 */}
            <div className="flex items-center gap-2">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`
                    h-[34px] px-3.5 rounded-[999px] text-xs font-medium transition-all
                    ${activeView === view.id
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  {view.label}
                </button>
              ))}
            </div>

            {/* 阶段切换 */}
            <div className="flex items-center gap-2 ml-2">
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`
                    h-[34px] px-3.5 rounded-[999px] text-xs font-medium transition-all
                    ${activeStage === stage.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧 */}
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-[44px] px-4 rounded-[14px] bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="7">最近 7 天</option>
              <option value="30">最近 30 天</option>
              <option value="90">最近 90 天</option>
            </select>
            <button className="h-[44px] px-4 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              导出报告
            </button>
            <button className="h-[44px] px-4 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              订阅日报
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 px-7 pb-8 space-y-6">
        {/* 第一层：核心 KPI 卡 */}
        <div className="grid grid-cols-6 gap-4">
          {/* 北极星 */}
          <div className="bg-card rounded-[20px] p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-muted-foreground font-medium">北极星</p>
            </div>
            <p className="text-2xl font-semibold mb-1">28.4%</p>
            <p className="text-xs text-muted-foreground">求职任务闭环率</p>
            <p className="text-xs text-green-600 mt-2">较上周 +2.1%</p>
          </div>

          {/* 激活用户 */}
          <div className="bg-card rounded-[20px] p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-muted-foreground font-medium">本周激活用户</p>
            </div>
            <p className="text-2xl font-semibold mb-1">3,842</p>
            <p className="text-xs text-muted-foreground">首次价值到达率 46%</p>
          </div>

          {/* 7日留存 */}
          <div className="bg-card rounded-[20px] p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-green-600" />
              <p className="text-xs text-muted-foreground font-medium">7 日留存</p>
            </div>
            <p className="text-2xl font-semibold mb-1">31.7%</p>
            <p className="text-xs text-muted-foreground">启用 Skill 用户高 2.3 倍</p>
          </div>

          {/* 高价值用户 */}
          <div className="bg-card rounded-[20px] p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-muted-foreground font-medium">高价值用户</p>
            </div>
            <p className="text-2xl font-semibold mb-1">1,126</p>
            <p className="text-xs text-muted-foreground">覆盖 2+ 核心模块</p>
          </div>

          {/* Agent 成功率 */}
          <div className="bg-card rounded-[20px] p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-600" />
              <p className="text-xs text-muted-foreground font-medium">Agent 成功率</p>
            </div>
            <p className="text-2xl font-semibold mb-1">96.2%</p>
            <p className="text-xs text-orange-600 mt-2">较昨日 -0.8%</p>
          </div>

          {/* 单位闭环成本 */}
          <div className="bg-card rounded-[20px] p-5 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-muted-foreground font-medium">单位闭环成本</p>
            </div>
            <p className="text-2xl font-semibold mb-1">¥14.8</p>
            <p className="text-xs text-green-600 mt-2">较上周 -6.4%</p>
          </div>
        </div>

        {/* 第二层：漏斗 + 趋势 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 求职闭环漏斗 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold mb-1">求职闭环漏斗</h2>
              <p className="text-xs text-muted-foreground">看用户是否真正从岗位进入到简历、面试与决策</p>
            </div>

            <div className="space-y-3">
              {funnelData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{item.users.toLocaleString()}</span>
                      <span className="text-xs font-semibold w-12 text-right">{item.rate}%</span>
                    </div>
                  </div>
                  <div className="w-full h-7 rounded-[10px] bg-secondary overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${item.rate}%` }}
                    >
                      {item.rate > 15 && (
                        <span className="text-xs text-primary-foreground font-medium">
                          {item.rate}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                当前最大流失发生在"岗位解析 → 定向简历"阶段
              </p>
            </div>
          </div>

          {/* 北极星趋势 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold mb-1">北极星趋势</h2>
                <p className="text-xs text-muted-foreground">求职任务闭环率变化趋势</p>
              </div>
              <div className="flex gap-2">
                <button className="px-2.5 py-1 rounded-[8px] bg-secondary text-xs font-medium">7天</button>
                <button className="px-2.5 py-1 rounded-[8px] bg-primary text-primary-foreground text-xs font-medium">30天</button>
                <button className="px-2.5 py-1 rounded-[8px] bg-secondary text-xs font-medium">90天</button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={northStarTrendData} key="north-star-chart">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" key="grid" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 11 }}
                  key="xaxis"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 11 }}
                  domain={[20, 35]}
                  key="yaxis"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
                  }}
                  key="tooltip"
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1a1a1a" 
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  name="当前值"
                  key="line-current"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#a3a3a3" 
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  name="目标值"
                  key="line-target"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">当前</p>
                <p className="text-lg font-semibold">28.4%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">目标</p>
                <p className="text-lg font-semibold text-muted-foreground">32%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">最近 7 天</p>
                <p className="text-sm font-medium text-green-600">稳步上升</p>
              </div>
            </div>
          </div>
        </div>

        {/* 第三层：模块表现 + AI 质量 + 成本效率 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 核心模块表现 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">核心模块表现</h2>
            
            <div className="space-y-4">
              {modulePerformance.map((module, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{module.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{module.rate}%</span>
                      <span className={`text-xs ${module.change.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                        {module.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full bg-primary/80 transition-all"
                      style={{ width: `${module.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                面试模块采纳率较高，但进入率仍偏低。
              </p>
            </div>
          </div>

          {/* AI 质量 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">AI 质量</h2>
            
            <div className="space-y-3.5">
              {aiQualityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{metric.value}</span>
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-orange-600" />
                    )}
                    <span className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-orange-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                面试辅导 Agent 采纳率高，但定向简历 Agent 重跑率上升。
              </p>
            </div>
          </div>

          {/* 成本效率 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">成本效率</h2>
            
            <div className="space-y-3.5">
              {costMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{metric.name}</span>
                  <span className="text-sm font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                当前成本控制良好，增长主要来自缓存命中提升。
              </p>
            </div>
          </div>
        </div>

        {/* 第四层：异常提醒 + 自动诊断 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 异常提醒 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">异常提醒</h2>
            
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`
                    h-[44px] px-4 rounded-[12px] flex items-center justify-between
                    ${alert.severity === 'critical' ? 'bg-orange-50 border border-orange-200' : 
                      alert.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 
                      'bg-blue-50 border border-blue-200'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-orange-600' : 
                      alert.severity === 'warning' ? 'text-yellow-600' : 
                      'text-blue-600'
                    }`} />
                    <span className="text-xs font-medium">{alert.text}</span>
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                    查看原因
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 自动诊断 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">自动诊断</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-200/30">
                <p className="text-xs leading-relaxed text-foreground/90">
                  过去 7 天，"岗位解析 → 定向简历"转化下降 12%，主要来自新用户与移动端。建议优先检查首页到机会页的承接链路与简历生成触发按钮位置。
                </p>
              </div>
              
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-green-50/50 to-blue-50/50 border border-green-200/30">
                <p className="text-xs leading-relaxed text-foreground/90">
                  启用成长 Skill 的用户 14 日留存显著更高，当前建议把"每天一道题"和"每周岗位扫描"前置到新用户 7 日内。
                </p>
              </div>
              
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-orange-50/50 to-yellow-50/50 border border-orange-200/30">
                <p className="text-xs leading-relaxed text-foreground/90">
                  面试辅导 Agent 的采纳率稳定上升，但单位成本高于其他 Agent，建议评估低成本模型接管初次反馈场景。
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-border">
              <button className="flex-1 h-[36px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium">
                查看完整诊断
              </button>
              <button className="flex-1 h-[36px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium">
                导出本周结论
              </button>
            </div>
          </div>
        </div>

        {/* 第五层：用户分群 + 留存 + 阶段视图 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 用户分群表现 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">用户分群表现</h2>
            
            <div className="space-y-4">
              {userSegments.map((segment, index) => (
                <div key={index} className="p-4 rounded-[14px] bg-secondary/30">
                  <h3 className="text-sm font-semibold mb-3">{segment.type}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">激活率</span>
                      <span className="font-semibold">{segment.activation}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">闭环率</span>
                      <span className="font-semibold">{segment.closure}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">7日留存</span>
                      <span className="font-semibold">{segment.retention}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 留存概况 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-lg font-semibold mb-5">留存概况</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/30">
                <p className="text-xs text-muted-foreground mb-1">D1 留存</p>
                <p className="text-2xl font-semibold">48.3%</p>
              </div>
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-green-50 to-blue-50 border border-green-200/30">
                <p className="text-xs text-muted-foreground mb-1">D7 留存</p>
                <p className="text-2xl font-semibold">31.7%</p>
              </div>
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/30">
                <p className="text-xs text-muted-foreground mb-1">D14 留存</p>
                <p className="text-2xl font-semibold">24.6%</p>
              </div>
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200/30">
                <p className="text-xs text-muted-foreground mb-1">D30 留存</p>
                <p className="text-2xl font-semibold">18.9%</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                启用 Skills 的用户在 14 日留存上明显优于普通用户。
              </p>
            </div>
          </div>

          {/* 阶段视图 */}
          <div className="bg-card rounded-[24px] p-6 border border-border" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">阶段视图</h2>
              <div className="flex gap-1">
                <button className="px-2 py-1 rounded-[6px] bg-secondary text-[10px] font-medium">验证期</button>
                <button className="px-2 py-1 rounded-[6px] bg-primary text-primary-foreground text-[10px] font-medium">发展期</button>
                <button className="px-2 py-1 rounded-[6px] bg-secondary text-[10px] font-medium">成熟期</button>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "求职任务闭环率", value: "28.4%" },
                { name: "岗位池建立率", value: "66.4%" },
                { name: "定向简历使用率", value: "39.8%" },
                { name: "面试训练完成率", value: "29.0%" },
                { name: "Offer 对比使用率", value: "10.0%" }
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{metric.name}</span>
                  <span className="text-sm font-semibold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}