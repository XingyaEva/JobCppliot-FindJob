import {
  Lightbulb,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  Calendar,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface Props {
  mode: "create" | "view" | null;
  currentStep: number;
  detailLevel: "detailed" | "simple";
  hasAnalysis?: boolean;
}

// 填写引导内容
const stepGuidance = {
  1: {
    title: "基础信息",
    tips: [
      "尽量完整填写公司和岗位信息",
      "面试官姓名有助于后续联系",
      "时长记录帮助评估面试节奏"
    ],
    faqs: [
      { q: "忘记具体时间怎么办？", a: "填写大致时间即可，重点是内容记录" },
      { q: "必须填完所有字段吗？", a: "标 * 的必填，其他选填" }
    ]
  },
  2: {
    title: "整体感受",
    tips: [
      "诚实记录真实感受，有助于后续分析",
      "面试官风格会影响沟通策略",
      "难度评估帮助判断自己的水平"
    ],
    faqs: [
      { q: "如何判断面试难度？", a: "对比你之前的面试经历，相对而言的难易程度" },
      { q: "自我感觉不准怎么办？", a: "凭第一直觉选择，后续可以根据结果调整" }
    ]
  },
  3: {
    title: "重点题目和薄弱点",
    tips: [
      "记录让你印象深刻的题目",
      "标记没答好的薄弱环节",
      "优先级帮助后续安排练习计划"
    ],
    faqs: [
      { q: "题目记不全怎么办？", a: "记录你印象最深的即可，不必追求完整" },
      { q: "如何判断优先级？", a: "影响面试结果且自己确实薄弱的是高优先级" }
    ]
  },
  4: {
    title: "面试过程",
    tips: [
      "按时间顺序梳理面试流程",
      "记录每个环节的表现和感受",
      "面试官的反应很重要"
    ],
    faqs: [
      { q: "记不清具体问题了？", a: "记录大致方向和主题即可" },
      { q: "需要写得很详细吗？", a: "核心要点即可，不必逐字记录" }
    ]
  },
  5: {
    title: "改进计划",
    tips: [
      "针对薄弱点制定具体行动",
      "设定可实现的期限",
      "关联相关题目到练习计划"
    ],
    faqs: [
      { q: "计划太多完成不了？", a: "优先解决1-2个核心问题即可" },
      { q: "如何保证执行？", a: "系统会定期提醒，建议设置日历" }
    ]
  }
};

// AI 分析示例数据
const mockAnalysis = {
  radarData: [
    { dimension: "技术深度", score: 8.5, max: 10 },
    { dimension: "项目经验", score: 8.0, max: 10 },
    { dimension: "系统设计", score: 6.5, max: 10 },
    { dimension: "沟通表达", score: 7.5, max: 10 },
    { dimension: "问题解决", score: 8.0, max: 10 },
    { dimension: "团队协作", score: 7.0, max: 10 }
  ],
  insights: [
    {
      type: "strength",
      dimension: "技术深度",
      score: 8.5,
      description: "你在性能优化和工程化方面表现优秀，面试官对你的技术深度非常认可"
    },
    {
      type: "weakness",
      dimension: "系统设计",
      score: 6.5,
      description: "需要系统学习分布式系统设计方法论，建议从经典案例入手"
    }
  ],
  comparison: {
    previousInterview: {
      date: "2周前",
      company: "阿里巴巴",
      improvements: [
        "项目经验表达更清晰 (+1.2分)",
        "技术深度有提升 (+0.8分)"
      ],
      regressions: [
        "系统设计仍需加强 (-0.3分)"
      ]
    }
  },
  recommendations: [
    {
      type: "practice",
      title: "练习 3 道系统设计题",
      description: "针对你的薄弱环节推荐",
      action: "立即开始",
      link: "/interviews/coaching"
    },
    {
      type: "topic",
      title: "加入「分布式系统」专题",
      description: "系统学习相关知识",
      action: "查看专题",
      link: "/interviews/bank"
    }
  ],
  nextInterviewTips: [
    "提前准备系统设计题，特别是分布式场景",
    "用 STAR 法则组织项目经验的回答",
    "多准备2-3个有深度的反向提问"
  ]
};

export function InterviewReviewRightColumn({ mode, currentStep, detailLevel, hasAnalysis = false }: Props) {
  // 空状态
  if (!mode) {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
            <Lightbulb className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">选择复盘记录查看 AI 分析</p>
        </div>
      </div>
    );
  }

  // 创建模式 - 填写引导
  if (mode === "create") {
    const guidance = stepGuidance[currentStep as keyof typeof stepGuidance] || stepGuidance[1];

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              复盘指南
            </h3>
            <p className="text-xs text-muted-foreground">
              当前步骤：{guidance.title}
            </p>
          </div>

          {/* 填写建议 */}
          <div className="rounded-[16px] bg-blue-50/50 border border-blue-200 p-4">
            <h4 className="text-sm font-semibold mb-3">📝 填写建议</h4>
            <ul className="space-y-2">
              {guidance.tips.map((tip, index) => (
                <li key={index} className="text-xs leading-relaxed text-foreground/80 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 常见问题 */}
          <div>
            <h4 className="text-sm font-semibold mb-3">💭 常见问题</h4>
            <div className="space-y-3">
              {guidance.faqs.map((faq, index) => (
                <div key={index} className="rounded-[12px] bg-secondary/30 p-3">
                  <p className="text-xs font-medium mb-1.5">Q: {faq.q}</p>
                  <p className="text-xs text-muted-foreground">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 参考示例 */}
          <div className="rounded-[16px] bg-purple-50/50 border border-purple-200 p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              参考示例
            </h4>
            <p className="text-xs leading-relaxed text-foreground/80 mb-3">
              查看其他人的优秀复盘案例，学习如何更好地梳理面试经历
            </p>
            <button className="w-full h-[32px] rounded-[10px] bg-purple-100 hover:bg-purple-200 transition-colors text-xs font-medium text-purple-700 flex items-center justify-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              查看示例复盘
            </button>
          </div>

          {/* 模式切换提示 */}
          <div className="rounded-[14px] bg-green-50/50 border border-green-200 p-4">
            <h4 className="text-sm font-semibold mb-2">💡 小提示</h4>
            <p className="text-xs leading-relaxed text-foreground/80">
              {detailLevel === "detailed"
                ? "你正在使用详细版模式，可以记录更完整的面试信息。如果想快速记录，可以切换到精简版。"
                : "你正在使用精简版模式，只需填写核心信息。如果想更详细地记录，可以切换到详细版。"}
            </p>
          </div>

          {/* 进度提示 */}
          <div className="rounded-[14px] bg-secondary/30 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${(currentStep / (detailLevel === "detailed" ? 5 : 3)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold">
                {Math.round((currentStep / (detailLevel === "detailed" ? 5 : 3)) * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              已完成 {currentStep} / {detailLevel === "detailed" ? 5 : 3} 步
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 查看模式 - AI 智能分析
  if (mode === "view" && hasAnalysis) {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              AI 智能分析
            </h3>
            <p className="text-xs text-muted-foreground">
              基于你的复盘内容生成的专业分析
            </p>
          </div>

          {/* 能力雷达图 */}
          <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-border p-5">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              能力雷达图
            </h4>
            <div className="space-y-3">
              {mockAnalysis.radarData.map((item) => (
                <div key={item.dimension}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{item.dimension}</span>
                    <span className="text-xs font-semibold">{item.score} 分</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 核心发现 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              核心发现
            </h4>
            <div className="space-y-2">
              {mockAnalysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-[14px] border
                    ${insight.type === "strength"
                      ? "bg-green-50/50 border-green-200"
                      : "bg-orange-50/50 border-orange-200"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {insight.type === "strength" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      )}
                      <span className="text-xs font-semibold">
                        {insight.dimension}
                      </span>
                    </div>
                    <span className={`
                      text-xs font-semibold
                      ${insight.type === "strength" ? "text-green-700" : "text-orange-700"}
                    `}>
                      {insight.score} 分
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 历史对比 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              历史对比
            </h4>
            <div className="rounded-[14px] bg-blue-50/50 border border-blue-200 p-4">
              <p className="text-xs font-medium mb-3">
                相比 {mockAnalysis.comparison.previousInterview.date} 的 {mockAnalysis.comparison.previousInterview.company} 面试：
              </p>
              <div className="space-y-2">
                {mockAnalysis.comparison.previousInterview.improvements.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-green-600 text-xs mt-0.5">✓</span>
                    <span className="text-xs text-foreground/80 flex-1">{item}</span>
                  </div>
                ))}
                {mockAnalysis.comparison.previousInterview.regressions.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 text-xs mt-0.5">✗</span>
                    <span className="text-xs text-foreground/80 flex-1">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 推荐行动 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              推荐行动
            </h4>
            <div className="space-y-2">
              {mockAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="rounded-[14px] bg-purple-50/50 border border-purple-200 p-4">
                  <h5 className="text-xs font-semibold mb-1">{rec.title}</h5>
                  <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                  <button className="w-full h-[32px] rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                    {rec.action}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 下次面试建议 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              下次面试建议
            </h4>
            <div className="rounded-[14px] bg-green-50/50 border border-green-200 p-4">
              <ul className="space-y-2">
                {mockAnalysis.nextInterviewTips.map((tip, index) => (
                  <li key={index} className="text-xs leading-relaxed text-foreground/80 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 导出选项 */}
          <div className="rounded-[14px] bg-secondary/30 p-4">
            <h4 className="text-sm font-semibold mb-3">📤 导出复盘</h4>
            <div className="flex gap-2">
              <button className="flex-1 h-[32px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">
                导出 PDF
              </button>
              <button className="flex-1 h-[32px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">
                导出 Markdown
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 查看模式但无分析
  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ 
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.15) transparent'
    }}>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">AI 分析生成中...</p>
        <p className="text-xs text-muted-foreground">请稍候，系统正在分析你的复盘内容</p>
      </div>
    </div>
  );
}