import { useState } from "react";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mic,
  Plus,
  X,
  Edit3,
  Download,
  Trash2,
  Calendar,
  Clock,
  User,
  Smile,
  Meh,
  Frown,
  Target,
  AlertCircle,
  Zap,
  FileText,
  Settings
} from "lucide-react";

interface ReviewData {
  id?: number;
  company: string;
  position: string;
  round: string;
  interviewType: string;
  interviewDate: string;
  duration: number;
  interviewerName?: string;
  interviewStyle: string;
  difficulty: string;
  feeling: "good" | "normal" | "bad";
  quickNotes: string;
  processSteps: Array<{
    id: number;
    title: string;
    duration: number;
    feeling: "good" | "normal" | "bad";
    question: string;
    answer: string;
    reaction: string;
  }>;
  keyQuestions: Array<{
    id: number;
    title: string;
    score: number;
  }>;
  weaknesses: Array<{
    id: number;
    category: "high" | "medium" | "low";
    description: string;
  }>;
  improvements: Array<{
    id: number;
    weakness: string;
    plan: string;
    deadline: string;
    relatedQuestions: string[];
  }>;
  followUps: string[];
  overallScore?: number;
}

interface Props {
  mode: "create" | "view" | null;
  detailLevel: "detailed" | "simple";
  selectedTemplate: "technical" | "behavioral" | "hr" | null;
  reviewData: ReviewData | null;
  onBack: () => void;
  onSave: (data: ReviewData) => void;
  onComplete: () => void;
  onEdit: () => void;
  onExport: () => void;
  onDelete: () => void;
}

const templateDefaults = {
  technical: {
    round: "技术面试",
    interviewType: "线上",
    processSteps: [
      { title: "自我介绍", duration: 5, question: "请介绍一下你的技术背景和项目经验" },
      { title: "项目经验深挖", duration: 20, question: "详细说说你最有挑战的项目" },
      { title: "技术深度考察", duration: 15, question: "算法题 / 系统设计题" },
      { title: "反向提问", duration: 5, question: "你有什么想了解的？" }
    ]
  },
  behavioral: {
    round: "行为面试",
    interviewType: "线上",
    processSteps: [
      { title: "开场寒暄", duration: 3, question: "简单介绍一下自己" },
      { title: "团队协作", duration: 15, question: "描述一次团队合作经历" },
      { title: "问题解决", duration: 15, question: "遇到最大的挑战是什么" },
      { title: "职业规划", duration: 7, question: "为什么选择我们公司" }
    ]
  },
  hr: {
    round: "HR面试",
    interviewType: "线下",
    processSteps: [
      { title: "背景调查", duration: 5, question: "确认基本信息" },
      { title: "离职原因", duration: 10, question: "为什么离开上家公司" },
      { title: "薪资谈判", duration: 15, question: "期望薪资和福利" },
      { title: "入职事项", duration: 10, question: "入职时间和流程" }
    ]
  }
};

export function InterviewReviewMiddleColumn({
  mode,
  detailLevel,
  selectedTemplate,
  reviewData,
  onBack,
  onSave,
  onComplete,
  onEdit,
  onExport,
  onDelete
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReviewData>(
    reviewData || {
      company: "",
      position: "",
      round: "",
      interviewType: "online",
      interviewDate: "",
      duration: 45,
      interviewStyle: "professional",
      difficulty: "medium",
      feeling: "normal",
      quickNotes: "",
      processSteps: [],
      keyQuestions: [],
      weaknesses: [],
      improvements: [],
      followUps: []
    }
  );
  const [isRecording, setIsRecording] = useState(false);

  const totalSteps = detailLevel === "detailed" ? 5 : 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onSave(formData);
  };

  // 空状态
  if (!mode) {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">从左侧选择一条复盘记录</p>
          <p className="text-xs text-muted-foreground">或点击 + 创建新的复盘</p>
        </div>
      </div>
    );
  }

  // 创建模式
  if (mode === "create") {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-2">
              <button className="h-[32px] px-3 rounded-[10px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                保存草稿
              </button>
              <button
                onClick={handleComplete}
                disabled={currentStep < totalSteps}
                className="h-[32px] px-3 rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                完成
              </button>
            </div>
          </div>
          <h2 className="text-lg font-semibold">
            新建面试复盘 · {detailLevel === "detailed" ? "详细版" : "精简版"}
          </h2>
          
          {/* 进度指示器 */}
          <div className="flex items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`
                  h-1.5 rounded-full flex-1 transition-all
                  ${index + 1 <= currentStep ? "bg-primary" : "bg-secondary"}
                `} />
                {index < totalSteps - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            步骤 {currentStep} / {totalSteps}
          </p>
        </div>

        {/* 内容区 - 根据步骤显示不同表单 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          {/* 步骤 1: 基础信息 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                基础信息
              </h3>
              
              <div>
                <label className="block text-xs font-medium mb-2">
                  公司名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="例如：字节跳动"
                  className="w-full h-[36px] px-3 rounded-[10px] bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">
                  岗位名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="例如：前端技术专家"
                  className="w-full h-[36px] px-3 rounded-[10px] bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">
                  面试轮次 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {["一面", "二面", "三面", "HR面", "其他"].map((round) => (
                    <button
                      key={round}
                      onClick={() => setFormData({ ...formData, round })}
                      className={`
                        h-[34px] px-4 rounded-[10px] text-xs font-medium transition-all
                        ${formData.round === round
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      {round}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">
                  面试形式 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, interviewType: "online" })}
                    className={`
                      flex-1 h-[34px] rounded-[10px] text-xs font-medium transition-all
                      ${formData.interviewType === "online"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }
                    `}
                  >
                    线上
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, interviewType: "offline" })}
                    className={`
                      flex-1 h-[34px] rounded-[10px] text-xs font-medium transition-all
                      ${formData.interviewType === "offline"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }
                    `}
                  >
                    线下
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-2">
                    面试日期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.interviewDate}
                    onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                    className="w-full h-[36px] px-3 rounded-[10px] bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2">
                    面试时长（分钟）
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    placeholder="45"
                    className="w-full h-[36px] px-3 rounded-[10px] bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              {detailLevel === "detailed" && (
                <div>
                  <label className="block text-xs font-medium mb-2">
                    面试官姓名（选填）
                  </label>
                  <input
                    type="text"
                    value={formData.interviewerName || ""}
                    onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                    placeholder="例如：张工程师"
                    className="w-full h-[36px] px-3 rounded-[10px] bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* 步骤 2: 整体感受 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Smile className="w-4 h-4" />
                整体感受
              </h3>

              <div>
                <label className="block text-xs font-medium mb-2">
                  面试官风格 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {["友好", "严肃", "挑战", "中性"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setFormData({ ...formData, interviewStyle: style })}
                      className={`
                        h-[34px] px-4 rounded-[10px] text-xs font-medium transition-all
                        ${formData.interviewStyle === style
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">
                  面试难度 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((diff, index) => (
                    <button
                      key={diff}
                      onClick={() => setFormData({ ...formData, difficulty: diff })}
                      className={`
                        flex-1 h-[34px] rounded-[10px] text-xs font-medium transition-all
                        ${formData.difficulty === diff
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      {["容易", "中等", "困难"][index]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">
                  自我感觉 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, feeling: "good" })}
                    className={`
                      flex-1 h-[48px] rounded-[12px] flex flex-col items-center justify-center gap-1 transition-all
                      ${formData.feeling === "good"
                        ? "bg-green-50 border-2 border-green-500"
                        : "bg-secondary/30 border-2 border-transparent hover:border-border"
                      }
                    `}
                  >
                    <Smile className={`w-5 h-5 ${formData.feeling === "good" ? "text-green-600" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">很好</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, feeling: "normal" })}
                    className={`
                      flex-1 h-[48px] rounded-[12px] flex flex-col items-center justify-center gap-1 transition-all
                      ${formData.feeling === "normal"
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-secondary/30 border-2 border-transparent hover:border-border"
                      }
                    `}
                  >
                    <Meh className={`w-5 h-5 ${formData.feeling === "normal" ? "text-blue-600" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">一般</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, feeling: "bad" })}
                    className={`
                      flex-1 h-[48px] rounded-[12px] flex flex-col items-center justify-center gap-1 transition-all
                      ${formData.feeling === "bad"
                        ? "bg-orange-50 border-2 border-orange-500"
                        : "bg-secondary/30 border-2 border-transparent hover:border-border"
                      }
                    `}
                  >
                    <Frown className={`w-5 h-5 ${formData.feeling === "bad" ? "text-orange-600" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">不太好</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">
                  快速感受（选填）
                </label>
                <textarea
                  value={formData.quickNotes}
                  onChange={(e) => setFormData({ ...formData, quickNotes: e.target.value })}
                  placeholder="面试官人怎么样？有哪些题没答好？整体感觉如何..."
                  className="w-full h-[120px] p-3 rounded-[12px] bg-secondary/30 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(0,0,0,0.15) transparent'
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{formData.quickNotes.length} 字</span>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`
                      h-[28px] px-3 rounded-[8px] text-xs font-medium flex items-center gap-1.5 transition-all
                      ${isRecording
                        ? "bg-red-500 text-white"
                        : "bg-secondary hover:bg-secondary/80"
                      }
                    `}
                  >
                    <Mic className="w-3 h-3" />
                    {isRecording ? "停止录音" : "语音输入"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤 3: 重点题目（精简版最后一步） */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                重点题目和薄弱点
              </h3>

              {/* 重点题目 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium">🎯 重点题目</label>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    添加题目
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.keyQuestions.length === 0 ? (
                    <div className="p-4 rounded-[12px] bg-secondary/30 border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">暂无题目，点击上方添加</p>
                    </div>
                  ) : (
                    formData.keyQuestions.map((q) => (
                      <div key={q.id} className="p-3 rounded-[12px] bg-secondary/30 flex items-center justify-between">
                        <span className="text-xs flex-1">{q.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">⭐ {q.score}</span>
                          <button className="w-6 h-6 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 薄弱环节 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-medium">⚠️ 薄弱环节识别</label>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    添加薄弱点
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.weaknesses.length === 0 ? (
                    <div className="p-4 rounded-[12px] bg-secondary/30 border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">暂无薄弱点，点击上方添加</p>
                    </div>
                  ) : (
                    formData.weaknesses.map((w) => (
                      <div key={w.id} className="p-3 rounded-[12px] bg-orange-50/50 border border-orange-200 flex items-start gap-2">
                        <span className={`
                          px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap
                          ${w.category === "high" ? "bg-red-100 text-red-700" :
                            w.category === "medium" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"}
                        `}>
                          {w.category === "high" ? "🔴高" : w.category === "medium" ? "🟡中" : "🟢低"}
                        </span>
                        <span className="text-xs flex-1">{w.description}</span>
                        <button className="w-6 h-6 rounded-lg hover:bg-white transition-colors flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {detailLevel === "simple" && (
                <div className="mt-6 p-4 rounded-[14px] bg-blue-50/50 border border-blue-200">
                  <p className="text-xs leading-relaxed text-foreground/80">
                    💡 提示：精简版复盘已完成！你可以点击"完成"保存，或切换到详细版补充更多信息。
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 步骤 4: 面试过程（仅详细版） */}
          {currentStep === 4 && detailLevel === "detailed" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                面试过程
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                按时间顺序记录面试流程，AI 会帮助你分析每个环节的表现
              </p>
              
              <div className="space-y-3">
                {formData.processSteps.map((step, index) => (
                  <div key={step.id} className="p-4 rounded-[14px] bg-secondary/30 border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{index + 1}. {step.title}</span>
                        <span className="text-xs text-muted-foreground">({step.duration}分钟)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {step.feeling === "good" && <Smile className="w-4 h-4 text-green-600" />}
                        {step.feeling === "normal" && <Meh className="w-4 h-4 text-blue-600" />}
                        {step.feeling === "bad" && <Frown className="w-4 h-4 text-orange-600" />}
                        <button className="w-6 h-6 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">面试官问了什么：</span>
                        <p className="mt-1 text-foreground/80">{step.question}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">我的回答要点：</span>
                        <p className="mt-1 text-foreground/80">{step.answer || "（待补充）"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">面试官反应：</span>
                        <p className="mt-1 text-foreground/80">{step.reaction || "（待补充）"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full h-[36px] rounded-[10px] bg-secondary/50 hover:bg-secondary transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                添加下一个环节
              </button>
            </div>
          )}

          {/* 步骤 5: 改进计划（仅详细版） */}
          {currentStep === 5 && detailLevel === "detailed" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                改进计划
              </h3>

              {/* 改进计划列表 */}
              <div>
                <label className="text-xs font-medium mb-3 block">📝 针对薄弱环节制定计划</label>
                <div className="space-y-3">
                  {formData.improvements.length === 0 ? (
                    <div className="p-4 rounded-[12px] bg-secondary/30 border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">暂无改进计划</p>
                    </div>
                  ) : (
                    formData.improvements.map((improvement) => (
                      <div key={improvement.id} className="p-4 rounded-[14px] bg-purple-50/50 border border-purple-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-xs font-medium">针对：{improvement.weakness}</p>
                          <button className="w-6 h-6 rounded-lg hover:bg-white transition-colors flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">行动计划：</span>
                            <p className="mt-1">{improvement.plan}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">完成期限：</span>
                            <p className="mt-1">{improvement.deadline}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 后续跟进 */}
              <div>
                <label className="text-xs font-medium mb-3 block">📮 后续跟进</label>
                <div className="space-y-2">
                  {["发送感谢邮件", "等待 HR 通知", "准备下一轮面试"].map((item) => (
                    <label key={item} className="flex items-center gap-2 p-2.5 rounded-[10px] bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.followUps.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, followUps: [...formData.followUps, item] });
                          } else {
                            setFormData({ ...formData, followUps: formData.followUps.filter(f => f !== item) });
                          }
                        }}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-xs">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-[14px] bg-green-50/50 border border-green-200">
                <p className="text-xs leading-relaxed text-foreground/80">
                  ✅ 详细版复盘已完成！点击"完成"保存，系统会自动生成 AI 分析报告。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部导航 */}
        <div className="flex-shrink-0 p-5 border-t border-border">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="h-[40px] px-4 rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                上一步
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex-1 h-[40px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 h-[40px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                完成复盘
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 查看模式（待实现完整的查看界面）
  return (
    <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onExport}
              className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h2 className="text-lg font-semibold">
          {reviewData?.company} · {reviewData?.position}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {reviewData?.round} · {reviewData?.interviewDate}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="text-center text-sm text-muted-foreground py-8">
          查看模式开发中...
        </div>
      </div>
    </div>
  );
}
