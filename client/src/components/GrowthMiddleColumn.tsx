import { useState } from "react";
import { 
  MoreHorizontal, 
  Sparkles, 
  Send, 
  Mic, 
  Brain,
  CheckCircle2,
  Clock,
  Plus,
  Play,
  Pause,
  Calendar,
  RotateCcw
} from "lucide-react";

interface Props {
  mode: "coach" | "skills" | "plan" | "review" | "memory";
}

// 快捷动作
const quickActions = [
  "帮我安排本周计划",
  "帮我做一次复盘",
  "帮我创建一个 Skill",
  "帮我看看最近哪里退步了"
];

// 最近成长记录
const recentRecords = [
  { id: 1, text: "周复盘已保存", time: "2小时前" },
  { id: 2, text: "新 Skill 已创建", time: "昨天" },
  { id: 3, text: "面试训练建议已更新", time: "3天前" }
];

// Skills 列表数据
const skillsList = [
  {
    id: 1,
    name: "每天 8 点一道面试题",
    description: "每天早上 8 点给我一道 AI 产品经理面试题，我回答后帮我点评并给参考答案",
    frequency: "每日",
    time: "08:00",
    enabled: true,
    lastRun: "今早 08:00",
    nextRun: "明早 08:00"
  },
  {
    id: 2,
    name: "每周一更新岗位趋势",
    description: "每周一早上分析 AI 产品经理岗位的最新趋势和要求变化",
    frequency: "每周",
    time: "周一 09:00",
    enabled: true,
    lastRun: "本周一 09:00",
    nextRun: "下周一 09:00"
  },
  {
    id: 3,
    name: "每周日晚提醒复盘",
    description: "每周日晚上 8 点提醒完成周复盘，并引导梳理本周进展",
    frequency: "每周",
    time: "周日 20:00",
    enabled: true,
    lastRun: "上周日 20:00",
    nextRun: "本周日 20:00"
  }
];

export function GrowthMiddleColumn({ mode }: Props) {
  const [inputValue, setInputValue] = useState("");

  // 成长陪伴师模式
  if (mode === "coach") {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-semibold">成长陪伴师</h2>
                <span className="px-2 py-0.5 rounded-[6px] bg-green-50 text-green-700 text-[10px] font-medium border border-green-200">
                  今日在线
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                这里不是闲聊区，而是帮助你持续推进目标、维持节奏、完成长期成长的小中枢。
              </p>
            </div>
            <button className="w-9 h-9 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 主对话区 */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <div className="space-y-4">
            {/* 系统判断卡 */}
            <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-200/30 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-2 text-purple-900">系统判断</h3>
                  <p className="text-base leading-relaxed text-foreground/90">
                    今天先别着急扩岗位池。你当前最值得先完成的，是把"AI 产品经理定向简历"里的项目结果量化补齐，然后再进入两场面试的模拟准备。
                  </p>
                </div>
              </div>
            </div>

            {/* 今日任务卡 */}
            <div className="rounded-[16px] bg-white border border-border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                今日任务
              </h3>
              <div className="space-y-2.5">
                {[
                  { text: "补充 2 段结果量化", done: false },
                  { text: "完成 1 次行为面训练", done: false },
                  { text: "晚上 8 点前做本周岗位收窄", done: false }
                ].map((task, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2.5 p-2.5 rounded-[10px] hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      className="w-4 h-4 rounded border-border"
                      readOnly
                    />
                    <span className={`text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 快捷动作胶囊 */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="h-[32px] px-3 rounded-[999px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* 用户输入区 */}
            <div className="rounded-[18px] border border-border bg-white p-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="告诉我你接下来想如何推进，或者直接描述一个你想自动化的成长动作。"
                className="w-full h-[80px] resize-none border-none focus:outline-none text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center" title="语音输入">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="w-8 h-8 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center" title="调用记忆">
                    <Brain className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <button className="h-[36px] px-4 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 最近成长记录 */}
        <div className="flex-shrink-0 px-6 pb-5 pt-3 border-t border-border">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">最近成长记录</h3>
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="h-[44px] px-3 rounded-[14px] bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span className="text-xs font-medium">{record.text}</span>
                <span className="text-[10px] text-muted-foreground">{record.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Skills 自动化模式
  if (mode === "skills") {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Skills 自动化</h2>
              <p className="text-xs text-muted-foreground">
                把重复的成长动作自动化，让系统长期帮你执行
              </p>
            </div>
            <button className="h-[36px] px-3 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              新建 Skill
            </button>
          </div>
        </div>

        {/* 创建区 */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border">
          <div className="rounded-[18px] border border-border bg-gradient-to-br from-blue-50/30 to-purple-50/30 p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              描述你希望我如何长期帮助你
            </h3>
            <textarea
              placeholder="例如：每天早上 8 点给我一道 AI 产品经理面试题，我回答后帮我点评并给参考答案。"
              className="w-full h-[80px] px-4 py-3 rounded-[14px] border border-border bg-white resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm leading-relaxed"
            />
            <div className="flex items-center justify-end gap-2 mt-3">
              <button className="h-[32px] px-3 rounded-[10px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium">
                查看示例
              </button>
              <button className="h-[32px] px-3 rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium">
                创建 Skill
              </button>
            </div>
          </div>
        </div>

        {/* Skills 列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <h3 className="text-sm font-semibold mb-4">已创建的 Skills</h3>
          <div className="space-y-3">
            {skillsList.map((skill) => (
              <div
                key={skill.id}
                className="rounded-[16px] border border-border bg-white p-4 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1">{skill.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 ml-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.enabled}
                      className="w-4 h-4 rounded border-border"
                      readOnly
                    />
                  </label>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{skill.frequency} · {skill.time}</span>
                    </div>
                    <span>•</span>
                    <span>上次：{skill.lastRun}</span>
                  </div>
                  <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                    编辑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 周计划模式
  if (mode === "plan") {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">创建本周计划</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            先写下你这周最想推进的 2-3 件事，我们帮你拆成更容易执行的动作。
          </p>
          <button className="h-[44px] px-5 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            新建周计划
          </button>
        </div>
      </div>
    );
  }

  // 周复盘模式
  if (mode === "review") {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">开始周复盘</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            回顾本周完成了什么、卡住了什么、哪些动作最有效，帮助下周更好推进。
          </p>
          <button className="h-[44px] px-5 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            开始复盘
          </button>
        </div>
      </div>
    );
  }

  // 长期记忆模式
  if (mode === "memory") {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-semibold mb-1">长期记忆</h2>
              <p className="text-xs text-muted-foreground">
                系统对你的理解和记录，持续优化陪伴质量
              </p>
            </div>
            <button className="w-9 h-9 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 记忆列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <div className="space-y-5">
            {/* 基础档案 */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">基础档案</h3>
              <div className="space-y-2">
                {[
                  "当前目标：AI 产品经理",
                  "求职阶段：面试准备中",
                  "期望城市：上海、北京"
                ].map((item, index) => (
                  <div
                    key={index}
                    className="h-[46px] px-4 rounded-[14px] bg-secondary/30 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 求职偏好 */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">求职偏好</h3>
              <div className="space-y-2">
                {[
                  "你更重视成长而不是短期薪资",
                  "你更偏好晚上训练",
                  "你倾向选择大厂背景"
                ].map((item, index) => (
                  <div
                    key={index}
                    className="h-[46px] px-4 rounded-[14px] bg-secondary/30 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 薄弱项 */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">薄弱项</h3>
              <div className="space-y-2">
                {[
                  "你回答问题时容易偏空泛",
                  "项目表达收束需要加强",
                  "结果量化表达不够具体"
                ].map((item, index) => (
                  <div
                    key={index}
                    className="h-[46px] px-4 rounded-[14px] bg-orange-50/50 border border-orange-200/50 flex items-center justify-between hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-orange-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}