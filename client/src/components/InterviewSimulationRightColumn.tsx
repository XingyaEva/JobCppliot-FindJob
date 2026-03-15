import {
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  SkipForward,
  HelpCircle,
  Star,
  Trophy,
  BarChart3
} from "lucide-react";

interface Message {
  id: number;
  role: "ai" | "user";
  content: string;
  timestamp: string;
  score?: number;
}

interface SimulationScenario {
  id: string;
  name: string;
  company: string;
  type: string;
  difficulty: "初级" | "中级" | "高级";
  duration: number;
  description: string;
}

interface Props {
  scenario: SimulationScenario | null;
  status: "idle" | "configuring" | "running" | "paused" | "completed";
  elapsedTime: number;
  messages: Message[];
  onHelp: () => void;
  onSkip: () => void;
}

export function InterviewSimulationRightColumn({
  scenario,
  status,
  elapsedTime,
  messages,
  onHelp,
  onSkip
}: Props) {
  // 计算实时统计
  const userMessages = messages.filter(m => m.role === "user");
  const answeredCount = userMessages.length;
  const averageScore = userMessages.length > 0
    ? userMessages.reduce((sum, m) => sum + (m.score || 0), 0) / userMessages.length
    : 0;

  // 配置/空闲状态：场景预览
  if (status === "idle" || status === "configuring") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">场景介绍</h3>
            <p className="text-xs leading-[18px] text-muted-foreground">
              了解本次面试的评分标准和注意事项
            </p>
          </div>

          {/* 评分维度 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              评分维度
            </h4>
            <div className="space-y-2.5">
              {[
                { name: "技术深度", desc: "对技术问题的理解和掌握程度", weight: "25%" },
                { name: "问题分析", desc: "分析问题的方法和思路", weight: "20%" },
                { name: "表达能力", desc: "逻辑清晰度和沟通效率", weight: "20%" },
                { name: "项目经验", desc: "实际项目经历的丰富度", weight: "20%" },
                { name: "应变能力", desc: "面对追问时的反应速度", weight: "15%" }
              ].map((item, index) => (
                <div key={index} className="rounded-[12px] bg-secondary/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.weight}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 面试技巧 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              面试技巧
            </h4>
            <div className="space-y-2">
              {[
                "使用 STAR 法则结构化回答：Situation, Task, Action, Result",
                "准备 3-5 个核心项目案例，覆盖不同技术栈",
                "回答问题时先给结论，再展开细节",
                "遇到不会的问题，诚实承认并展示学习能力",
                "控制每个回答在 2-3 分钟内，避免过长"
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-2.5 rounded-[10px] bg-yellow-50/50 border border-yellow-200">
                  <span className="text-yellow-600 font-bold text-xs mt-0.5">{index + 1}</span>
                  <p className="text-xs leading-relaxed text-foreground/80 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 注意事项 */}
          <div className="rounded-[14px] bg-blue-50/50 border border-blue-200 p-4">
            <h4 className="text-sm font-semibold mb-2">💡 温馨提示</h4>
            <ul className="space-y-1 text-xs text-foreground/80">
              <li>• 面试过程中可以随时暂停思考</li>
              <li>• 遇到困难使用"紧急求助"查看提示</li>
              <li>• 实在无法回答可以"跳过题目"</li>
              <li>• AI 会根据你的表现调整问题难度</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 进行中/暂停状态：实时监控
  if (status === "running" || status === "paused") {
    const progress = scenario ? (elapsedTime / (scenario.duration * 60)) * 100 : 0;
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}分${secs}秒`;
    };

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">实时监控</h3>
            <p className="text-xs leading-[18px] text-muted-foreground">
              {status === "paused" ? "已暂停，可以思考一下" : "面试进行中，加油！"}
            </p>
          </div>

          {/* 当前进度 */}
          <div className="rounded-[16px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                当前进度
              </h4>
              <span className="text-xs text-muted-foreground">
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              已进行 {formatTime(elapsedTime)} / {scenario?.duration} 分钟
            </p>
          </div>

          {/* 实时表现 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              实时表现
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-secondary/30">
                <span className="text-xs text-muted-foreground">回答完整度</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-secondary/30">
                <span className="text-xs text-muted-foreground">语速适中</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 5 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-secondary/30">
                <span className="text-xs text-muted-foreground">逻辑清晰</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 3 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 当前状态 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              答题进度
            </h4>
            <div className="rounded-[12px] bg-secondary/30 p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">已回答</span>
                <span className="text-sm font-semibold">{answeredCount} 题</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">平均得分</span>
                <span className="text-sm font-semibold text-primary">
                  {averageScore > 0 ? averageScore.toFixed(1) : "-"} 分
                </span>
              </div>
            </div>
            {status === "running" && (
              <div className="flex items-center gap-2 p-3 rounded-[12px] bg-green-50/50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700">
                  {userMessages.length === 0 ? "准备开始..." : "正在回答中..."}
                </span>
              </div>
            )}
          </div>

          {/* 已回答问题列表 */}
          {userMessages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">💬 已回答问题</h4>
              <div className="space-y-2">
                {userMessages.slice(-3).map((msg, index) => (
                  <div key={msg.id} className="rounded-[12px] bg-secondary/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">问题 {userMessages.indexOf(msg) + 1}</span>
                      <span className={`
                        text-xs font-semibold
                        ${(msg.score || 0) >= 8 ? "text-green-600" :
                          (msg.score || 0) >= 6 ? "text-blue-600" :
                          "text-orange-600"}
                      `}>
                        {msg.score?.toFixed(1) || "-"} 分
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 实时提示 */}
          <div className="rounded-[14px] bg-purple-50/50 border border-purple-200 p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              实时提示
            </h4>
            <p className="text-xs leading-relaxed text-foreground/80">
              {averageScore >= 8
                ? "👍 表现优秀！继续保持这个水平，注意控制每个回答的时长。"
                : averageScore >= 6
                ? "💪 不错的表现！可以尝试补充更多具体的案例和数据支撑。"
                : userMessages.length > 0
                ? "💡 建议使用 STAR 法则组织回答，会让逻辑更清晰。"
                : "🎯 准备好了吗？深呼吸，放松心情，正常发挥就好！"}
            </p>
          </div>

          {/* 紧急功能按钮 */}
          <div className="space-y-2">
            <button
              onClick={onHelp}
              disabled={status === "paused"}
              className="w-full h-[36px] rounded-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              紧急求助
            </button>
            <button
              onClick={onSkip}
              disabled={status === "paused"}
              className="w-full h-[36px] rounded-[10px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <SkipForward className="w-3.5 h-3.5" />
              跳过此题
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 完成状态：详细报告
  if (status === "completed") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">详细报告</h3>
            <p className="text-xs leading-[18px] text-muted-foreground">
              查看本次面试的完整分析
            </p>
          </div>

          {/* 表现亮点 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              表现亮点
            </h4>
            <div className="space-y-2">
              {[
                "技术深度扎实，对核心概念理解透彻",
                "项目案例准备充分，STAR 法则运用熟练",
                "表达清晰流畅，逻辑性强"
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-[12px] bg-green-50/50 border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-foreground/80 flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 需要改进 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              需要改进
            </h4>
            <div className="space-y-2">
              {[
                "部分回答时间过长，建议控制在 2-3 分钟",
                "可以增加更多量化数据来支撑论点",
                "遇到难题时的应变能力还需提升"
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-[12px] bg-orange-50/50 border border-orange-200">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-foreground/80 flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 逐题分析 */}
          <div>
            <h4 className="text-sm font-semibold mb-3">📝 逐题分析</h4>
            <div className="space-y-2.5">
              {userMessages.slice(0, 3).map((msg, index) => (
                <div key={msg.id} className="rounded-[14px] bg-secondary/30 p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">Q{index + 1}: 自我介绍</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${(msg.score || 0) >= 8 ? "bg-green-50 text-green-700" :
                        (msg.score || 0) >= 6 ? "bg-blue-50 text-blue-700" :
                        "bg-orange-50 text-orange-700"}
                    `}>
                      {msg.score?.toFixed(1)} 分
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-green-600 font-medium">✓ 优点：</span>
                      <span className="text-muted-foreground ml-1">结构清晰，重点突出</span>
                    </div>
                    <div>
                      <span className="text-orange-600 font-medium">! 改进：</span>
                      <span className="text-muted-foreground ml-1">可以更突出与岗位的匹配度</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 下次建议 */}
          <div className="rounded-[14px] bg-blue-50/50 border border-blue-200 p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              下次建议
            </h4>
            <ul className="space-y-1 text-xs text-foreground/80">
              <li>• 针对薄弱环节（如应变能力）进行专项练习</li>
              <li>• 准备 3 个不同难度的项目案例备用</li>
              <li>• 模拟压力场景，提升抗压能力</li>
              <li>• 录制自己的回答，复盘表达方式</li>
            </ul>
          </div>

          {/* 底部操作 */}
          <div className="space-y-2">
            <button className="w-full h-[36px] rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium">
              导出完整报告
            </button>
            <button className="w-full h-[36px] rounded-[10px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium">
              分享给好友
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
