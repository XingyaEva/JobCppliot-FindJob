import { useState } from "react";
import {
  Target,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  AlertCircle,
  Brain,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface Props {
  mode: "coach" | "skills" | "plan" | "review" | "memory";
}

// 系统记忆数据
const systemMemories = [
  "你更偏好晚上训练",
  "你最近在冲 AI 产品经理方向",
  "你回答问题时容易偏空泛",
  "你更重视成长而不是短期薪资"
];

// Skills 状态数据
const skillsStatus = [
  {
    id: 1,
    name: "每天 8 点一道面试题",
    frequency: "每日",
    nextRun: "明早 08:00",
    enabled: true
  },
  {
    id: 2,
    name: "每周一更新岗位趋势",
    frequency: "每周",
    nextRun: "下周一 09:00",
    enabled: true
  }
];

// 建议动作数据
const suggestedActions = [
  { id: 1, text: "去完成本周复盘", icon: "📝" },
  { id: 2, text: "调整岗位扫描 Skill", icon: "⚙️" },
  { id: 3, text: "新建一个面试训练自动化", icon: "🎯" }
];

export function GrowthRightColumn({ mode }: Props) {
  // 成长陪伴师、周计划、周复盘模式 - 显示完整右栏
  if (mode === "coach" || mode === "plan" || mode === "review") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 当前状态 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              当前状态
            </h3>
            <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-200/30 p-5">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">当前目标</span>
                  <p className="text-sm font-semibold">AI 产品经理</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">本周重点</span>
                  <p className="text-sm font-medium text-foreground/80">面试训练 + 定向简历优化</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">当前薄弱项</span>
                  <p className="text-sm font-medium text-orange-600">结果量化、项目表达收束</p>
                </div>
                <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">连续活跃</span>
                  <span className="text-2xl font-bold text-primary">5 天</span>
                </div>
              </div>
            </div>
          </div>

          {/* 系统已记住 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              系统已记住
            </h3>
            <div className="space-y-2">
              {systemMemories.map((memory, index) => (
                <div
                  key={index}
                  className="min-h-[46px] px-4 py-3 rounded-[14px] bg-blue-50/50 border border-blue-200/30 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <p className="text-xs leading-relaxed text-blue-900">• {memory}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills 状态 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              Skills 状态
            </h3>
            <div className="space-y-2.5">
              {skillsStatus.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-[14px] bg-gradient-to-br from-white to-secondary/30 border border-border p-3.5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xs font-semibold flex-1">{skill.name}</h4>
                    <div className={`
                      w-2 h-2 rounded-full flex-shrink-0 mt-1
                      ${skill.enabled ? "bg-green-500" : "bg-gray-300"}
                    `} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{skill.frequency}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{skill.nextRun}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 建议动作 */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              建议动作
            </h3>
            <div className="space-y-2">
              {suggestedActions.map((action) => (
                <button
                  key={action.id}
                  className="w-full h-[44px] px-4 rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{action.icon}</span>
                    <span className="text-xs font-medium">{action.text}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* 提示卡片 */}
          <div className="rounded-[14px] bg-gradient-to-br from-green-50/50 to-blue-50/50 border border-green-200/30 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold mb-1">保持节奏</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  连续活跃 5 天了，继续保持。完成今日任务后记得标记进度。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Skills 自动化模式 - 显示 Skill 相关信息
  if (mode === "skills") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* Skill 创建指南 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Skill 创建指南
            </h3>
            <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-200/30 p-5">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2">一个好的 Skill 应该包含</h4>
                  <ul className="space-y-2 text-xs text-foreground/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>明确的触发时间和频率</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>清晰的执行内容和目标</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>可衡量的成果或反馈</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 示例 Skills */}
          <div>
            <h3 className="text-sm font-semibold mb-3">推荐 Skill 模板</h3>
            <div className="space-y-2.5">
              {[
                {
                  name: "每日面试题训练",
                  desc: "每天固定时间推送一道面试题，完成后自动点评"
                },
                {
                  name: "每周岗位扫描",
                  desc: "定期分析目标岗位的最新要求和趋势变化"
                },
                {
                  name: "周末复盘提醒",
                  desc: "每周末引导完成本周复盘和下周计划"
                }
              ].map((template, index) => (
                <div
                  key={index}
                  className="rounded-[14px] bg-white border border-border p-4 hover:border-primary/20 transition-all cursor-pointer"
                >
                  <h4 className="text-xs font-semibold mb-1">{template.name}</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{template.desc}</p>
                  <button className="mt-2 text-[10px] text-primary hover:text-primary/80 transition-colors">
                    使用此模板 →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 执行记录 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">最近执行记录</h3>
            <div className="space-y-2">
              {[
                { skill: "每天 8 点一道面试题", time: "今早 08:00", status: "已完成" },
                { skill: "每周一更新岗位趋势", time: "本周一 09:00", status: "已完成" },
                { skill: "每天 8 点一道面试题", time: "昨天 08:00", status: "已完成" }
              ].map((record, index) => (
                <div
                  key={index}
                  className="min-h-[54px] px-3 py-2.5 rounded-[12px] bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs font-medium text-foreground/80">{record.skill}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-[6px] bg-green-50 text-green-700 border border-green-200">
                      {record.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{record.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 长期记忆模式 - 显示记忆管理功能
  if (mode === "memory") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 记忆说明 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              关于记忆
            </h3>
            <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-200/30 p-5">
              <p className="text-xs leading-relaxed text-foreground/80 mb-3">
                系统会在你使用过程中，逐步记住你的偏好、习惯、薄弱项和目标，用于优化陪伴质量。
              </p>
              <p className="text-xs leading-relaxed text-foreground/80">
                你可以随时修改或删除任何记忆项，系统不会记录敏感隐私信息。
              </p>
            </div>
          </div>

          {/* 记忆管理 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">记忆管理</h3>
            <div className="space-y-2">
              {[
                { label: "允许记住求职偏好", enabled: true },
                { label: "允许记住薄弱项", enabled: true },
                { label: "允许记住行为习惯", enabled: true },
                { label: "允许记住风格偏好", enabled: false }
              ].map((setting, index) => (
                <label
                  key={index}
                  className="flex items-center justify-between h-[44px] px-4 rounded-[12px] bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium">{setting.label}</span>
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    className="w-4 h-4 rounded border-border"
                    readOnly
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 数据统计 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">数据统计</h3>
            <div className="rounded-[14px] bg-white border border-border p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">总记忆数</span>
                  <span className="text-sm font-semibold">16 条</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">最近更新</span>
                  <span className="text-sm font-semibold">2 小时前</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">使用时长</span>
                  <span className="text-sm font-semibold">23 天</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-2">
            <button className="w-full h-[36px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium">
              导出所有记忆
            </button>
            <button className="w-full h-[36px] rounded-[12px] border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-xs font-medium">
              清空所有记忆
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}