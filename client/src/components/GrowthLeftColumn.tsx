import { useState } from "react";
import { Plus, User, Zap, Calendar, RotateCcw, Brain } from "lucide-react";

interface Props {
  activeModule: "coach" | "skills" | "plan" | "review" | "memory";
  onModuleChange: (module: "coach" | "skills" | "plan" | "review" | "memory") => void;
}

// 已启用的 Skills
const enabledSkills = [
  { id: 1, name: "每天 8 点一道面试题", frequency: "每日" },
  { id: 2, name: "每周一更新岗位趋势", frequency: "每周" },
  { id: 3, name: "每周日晚提醒复盘", frequency: "每周" }
];

export function GrowthLeftColumn({ activeModule, onModuleChange }: Props) {
  const modules = [
    { id: "coach" as const, label: "成长陪伴师", icon: User },
    { id: "skills" as const, label: "Skills 自动化", icon: Zap },
    { id: "plan" as const, label: "周计划", icon: Calendar },
    { id: "review" as const, label: "周复盘", icon: RotateCcw },
    { id: "memory" as const, label: "长期记忆", icon: Brain }
  ];

  return (
    <div className="w-[260px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* 头部 */}
      <div className="flex-shrink-0 px-[18px] pt-[18px] pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">成长中心</h2>
          <button
            className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-secondary transition-colors bg-primary/10"
            title="快捷操作"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* 模块导航 */}
        <div className="space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`
                  w-full h-[42px] px-3 rounded-[12px] flex items-center gap-2.5 transition-all text-left
                  ${activeModule === module.id
                    ? "bg-secondary shadow-sm border-l-2 border-l-primary"
                    : "hover:bg-secondary/50"
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${activeModule === module.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm ${activeModule === module.id ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                  {module.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 本周概况 */}
      <div className="flex-shrink-0 px-[18px] py-4 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">本周概况</h3>
        <div className="rounded-[18px] bg-gradient-to-br from-blue-50/30 to-purple-50/30 border border-border/50 p-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">已完成训练</span>
              <span className="text-sm font-semibold">4 次</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">本周岗位扫描</span>
              <span className="text-sm font-semibold">1 次</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">周复盘完成度</span>
              <span className="text-sm font-semibold text-primary">60%</span>
            </div>
            <div className="pt-2 mt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">当前连续活跃</span>
              <span className="text-base font-bold text-primary">5 天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 已启用 Skills */}
      <div className="flex-1 overflow-y-auto px-[18px] py-4" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">已启用 Skills</h3>
        <div className="space-y-2">
          {enabledSkills.map((skill) => (
            <div
              key={skill.id}
              className="h-[36px] px-3 rounded-[10px] bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="text-xs font-medium text-foreground/80 truncate flex-1">
                {skill.name}
              </span>
              <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
                {skill.frequency}
              </span>
            </div>
          ))}
          
          {enabledSkills.length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground mb-2">暂无已启用 Skill</p>
              <button className="text-xs text-primary hover:text-primary/80 transition-colors">
                + 创建第一个 Skill
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
