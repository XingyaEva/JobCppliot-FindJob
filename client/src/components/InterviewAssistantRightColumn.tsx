import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  HelpCircle,
  Lightbulb,
  Mail,
  BookOpen,
  ExternalLink,
  AlertTriangle
} from "lucide-react";

interface Props {
  status: "idle" | "running" | "paused" | "completed";
  elapsedTime: number;
  currentStage: string;
  notes: number;
}

const interviewChecklist = [
  { id: "network", label: "网络连接稳定", category: "environment" },
  { id: "camera", label: "摄像头/麦克风正常", category: "environment" },
  { id: "apps", label: "关闭其他应用", category: "environment" },
  { id: "paper", label: "准备纸笔", category: "environment" },
  { id: "resume", label: "简历已打开", category: "material" },
  { id: "portfolio", label: "作品集链接准备好", category: "material" },
  { id: "questions", label: "提问清单准备好", category: "material" }
];

const quickTips = [
  "开场：自信微笑，主动问候",
  "倾听：记录关键词和追问点",
  "回答：先给结论再展开细节",
  "卡壳：用过渡话术争取时间",
  "结尾：询问1-2个有深度的问题"
];

const reverseQuestions = {
  must: [
    { q: "这个岗位最大的挑战是什么？", reason: "了解工作难度" },
    { q: "团队的技术栈和规模？", reason: "评估技术环境" },
    { q: "对这个岗位3/6个月的期待？", reason: "明确目标" }
  ],
  recommended: [
    { q: "团队的晋升机制？", reason: "了解发展空间" },
    { q: "公司的技术培养计划？", reason: "评估成长机会" },
    { q: "团队的工作方式？", reason: "了解协作文化" }
  ],
  optional: [
    { q: "团队最近的挑战性项目？", reason: "了解业务状态" },
    { q: "团队的技术氛围？", reason: "评估文化匹配" }
  ],
  avoid: [
    { q: "加班多吗？", reason: "太直接，显得消极" },
    { q: "薪资范围？", reason: "初面不谈钱" },
    { q: "能不能远程？", reason: "等offer再谈" }
  ]
};

const topicCoverage = [
  { id: "intro", label: "自我介绍", completed: false },
  { id: "project", label: "项目经验", completed: false },
  { id: "technical", label: "技术深度", completed: false },
  { id: "teamwork", label: "团队协作", completed: false },
  { id: "career", label: "职业规划", completed: false }
];

export function InterviewAssistantRightColumn({
  status,
  elapsedTime,
  currentStage,
  notes
}: Props) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}分钟`;
  };

  // 待启动状态：准备清单
  if (status === "idle") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">面试前准备</h3>
            <p className="text-xs leading-[18px] text-muted-foreground">
              检查环境和材料，确保万无一失
            </p>
          </div>

          {/* 环境检查 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Circle className="w-4 h-4" />
              环境检查
            </h4>
            <div className="space-y-2">
              {interviewChecklist.filter(item => item.category === "environment").map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 rounded-[12px] bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 材料准备 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Circle className="w-4 h-4" />
              材料准备
            </h4>
            <div className="space-y-2">
              {interviewChecklist.filter(item => item.category === "material").map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-3 rounded-[12px] bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 面试技巧速记 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              面试技巧速记
            </h4>
            <div className="space-y-2">
              {quickTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-[12px] bg-yellow-50/50 border border-yellow-200">
                  <span className="text-yellow-600 font-bold text-xs mt-0.5">{index + 1}</span>
                  <p className="text-xs leading-relaxed text-foreground/80 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 心态调整 */}
          <div className="rounded-[14px] bg-green-50/50 border border-green-200 p-4">
            <h4 className="text-sm font-semibold mb-2">🧘 心态调整</h4>
            <ul className="space-y-1 text-xs text-foreground/80">
              <li>• 深呼吸3次，放松肩膀和面部</li>
              <li>• 面试是双向选择，不是单方面考核</li>
              <li>• 展现真实的自己，不要过度紧张</li>
              <li>• 把面试官当作未来同事，平等交流</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 进行中/暂停状态：实时辅助
  if (status === "running" || status === "paused") {
    // 根据时间判断可能完成的话题
    const estimatedTopics = topicCoverage.map((topic, index) => ({
      ...topic,
      completed: elapsedTime > (index * 5 * 60) // 每5分钟算完成一个话题
    }));

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">智能辅助</h3>
            <p className="text-xs leading-[18px] text-muted-foreground">
              {status === "paused" ? "已暂停，随时可以继续" : "实时监控面试进度"}
            </p>
          </div>

          {/* 时间管理 */}
          <div className="rounded-[16px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-border p-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              时间管理
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">已进行</span>
                <span className="text-sm font-bold">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">当前阶段</span>
                <span className="text-xs font-medium">{currentStage}</span>
              </div>
              {elapsedTime < 1800 ? (
                <p className="text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded-[8px]">
                  ✓ 时间把控良好
                </p>
              ) : elapsedTime < 2700 ? (
                <p className="text-xs text-blue-700 bg-blue-50 px-2 py-1.5 rounded-[8px]">
                  ⚠️ 注意控制节奏
                </p>
              ) : (
                <p className="text-xs text-orange-700 bg-orange-50 px-2 py-1.5 rounded-[8px]">
                  ⏰ 准备反向提问
                </p>
              )}
            </div>
          </div>

          {/* 话题覆盖 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              话题覆盖度
            </h4>
            <div className="space-y-2">
              {estimatedTopics.map((topic) => (
                <div key={topic.id} className="flex items-center gap-3 p-2.5 rounded-[10px] bg-secondary/30">
                  {topic.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-xs ${topic.completed ? "text-foreground" : "text-muted-foreground"}`}>
                    {topic.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 建议提问（反向面试） */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              建议提问（反向面试）
            </h4>
            
            {/* 必问 */}
            <div className="mb-3">
              <p className="text-xs font-medium text-red-700 mb-2">🔴 必问（体现专业）</p>
              <div className="space-y-2">
                {reverseQuestions.must.map((item, index) => (
                  <div key={index} className="p-2.5 rounded-[10px] bg-red-50/50 border border-red-200">
                    <p className="text-xs font-medium mb-1">{item.q}</p>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 推荐 */}
            <div className="mb-3">
              <p className="text-xs font-medium text-blue-700 mb-2">🟡 推荐（展现规划）</p>
              <div className="space-y-2">
                {reverseQuestions.recommended.slice(0, 2).map((item, index) => (
                  <div key={index} className="p-2.5 rounded-[10px] bg-blue-50/50 border border-blue-200">
                    <p className="text-xs font-medium mb-1">{item.q}</p>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 不要问 */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">❌ 避免提问</p>
              <div className="space-y-1.5">
                {reverseQuestions.avoid.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-[8px] bg-secondary/30">
                    <AlertTriangle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs line-through text-muted-foreground">{item.q}</p>
                      <p className="text-xs text-orange-600">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 已标记事项 */}
          {notes > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">📌 已记录事项</h4>
              <div className="p-3 rounded-[12px] bg-secondary/30">
                <p className="text-xs text-muted-foreground">
                  已记录 {notes} 条笔记
                </p>
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
              {elapsedTime < 300
                ? "开场阶段，保持自信微笑，注意倾听面试官的介绍。"
                : elapsedTime < 900
                ? "自我介绍阶段，突出核心优势，控制在3-5分钟内。"
                : elapsedTime < 1500
                ? "项目经验深挖阶段，用STAR法则，记得补充量化数据。"
                : elapsedTime < 2400
                ? "技术深度考察阶段，回答要有深度，遇到不会的用过渡话术。"
                : elapsedTime < 2700
                ? "准备反向提问，展现你对岗位和公司的思考。"
                : "接近尾声，注意礼貌结束，询问后续流程。"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 完成状态：下一步行动
  if (status === "completed") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2">下一步行动</h3>
            <p className="text-xs leading-[18px] text-muted-foreground">
              面试结束后的建议行动清单
            </p>
          </div>

          {/* 立即行动 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              立即行动
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-[12px] bg-green-50/50 border border-green-200">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 text-xs font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1">完善复盘记录</p>
                  <p className="text-xs text-muted-foreground">趁记忆新鲜，记录详细的面试过程和感受</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[12px] bg-green-50/50 border border-green-200">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 text-xs font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1">识别薄弱点</p>
                  <p className="text-xs text-muted-foreground">找出没答好的题目，加入练习计划</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-[12px] bg-green-50/50 border border-green-200">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 text-xs font-bold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium mb-1">准备后续轮次</p>
                  <p className="text-xs text-muted-foreground">如果有下一轮，针对性准备相关内容</p>
                </div>
              </div>
            </div>
          </div>

          {/* 后续跟进 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              后续跟进
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-[12px] bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <p className="text-xs font-medium">24小时内发感谢邮件</p>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  简短感谢，重申你的意向和优势
                </p>
              </div>
              <div className="p-3 rounded-[12px] bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <p className="text-xs font-medium">记录面试官联系方式</p>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  保存邮箱、微信等，方便后续沟通
                </p>
              </div>
              <div className="p-3 rounded-[12px] bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <p className="text-xs font-medium">标记等待HR通知</p>
                </div>
                <p className="text-xs text-muted-foreground pl-5">
                  在机会追踪表中更新状态
                </p>
              </div>
            </div>
          </div>

          {/* 相关资源 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              相关资源
            </h4>
            <div className="space-y-2">
              <button className="w-full p-3 rounded-[12px] bg-secondary/30 hover:bg-secondary transition-colors flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">查看这家公司的其他面经</span>
                </div>
              </button>
              <button className="w-full p-3 rounded-[12px] bg-secondary/30 hover:bg-secondary transition-colors flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">复习今天遇到的题目</span>
                </div>
              </button>
              <button className="w-full p-3 rounded-[12px] bg-secondary/30 hover:bg-secondary transition-colors flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs">更新你的岗位追踪表</span>
                </div>
              </button>
            </div>
          </div>

          {/* 心态建议 */}
          <div className="rounded-[14px] bg-purple-50/50 border border-purple-200 p-4">
            <h4 className="text-sm font-semibold mb-2">💪 心态建议</h4>
            <ul className="space-y-1 text-xs text-foreground/80">
              <li>• 面试结果不代表你的全部价值</li>
              <li>• 每次面试都是宝贵的学习机会</li>
              <li>• 保持积极心态，继续准备其他机会</li>
              <li>• 适当放松，避免过度焦虑</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
