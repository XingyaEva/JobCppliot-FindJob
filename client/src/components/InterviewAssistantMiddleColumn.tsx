import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  StopCircle,
  Copy,
  Mic,
  MicOff,
  Edit3,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lightbulb,
  FileText,
  LifeBuoy
} from "lucide-react";

interface InterviewInfo {
  company: string;
  position: string;
  round: string;
  type: "技术面试" | "行为面试" | "综合面试" | "HR面试";
  reminders: string[];
}

interface Note {
  id: number;
  content: string;
  timestamp: string;
}

interface Props {
  status: "idle" | "running" | "paused" | "completed";
  interviewInfo: InterviewInfo | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  elapsedTime: number;
  currentStage: string;
  onStageChange: (stage: string) => void;
  notes: Note[];
  onAddNote: (content: string) => void;
  onShowEmergencyHelp: () => void;
}

const interviewStages = [
  { id: "opening", label: "开场寒暄", duration: "0-3分钟" },
  { id: "introduction", label: "自我介绍", duration: "3-8分钟" },
  { id: "project", label: "项目经验深挖", duration: "8-25分钟" },
  { id: "technical", label: "技术深度/场景题", duration: "25-40分钟" },
  { id: "questions", label: "反向提问", duration: "40-45分钟" },
  { id: "closing", label: "结束寒暄", duration: "45-50分钟" }
];

const suggestedPhrases = {
  opening: [
    "您好！很高兴能有这个机会和您交流。",
    "感谢您今天抽时间面试我，我很期待这次交流。",
    "我是XXX，之前在邮件里有简单介绍过，今天很荣幸能当面聊聊。"
  ],
  introduction: [
    "我目前在XX公司担任XX岗位，主要负责...",
    "我在前端领域有X年经验，擅长...",
    "我最近的一个项目是..."
  ],
  project: [
    "在这个项目中，我的核心贡献是...",
    "我们当时面临的最大挑战是...，我通过...的方式解决了",
    "这个项目最终带来的价值是...（用数据说话）"
  ],
  technical: [
    "关于这个技术问题，我会从几个角度来看...",
    "在实际应用中，我通常会考虑...这几个因素",
    "如果让我设计这个系统，我会..."
  ],
  questions: [
    "我想了解一下，这个岗位最大的挑战是什么？",
    "能否介绍一下团队的技术栈和规模？",
    "团队对这个岗位3个月和6个月的期待是什么？"
  ],
  closing: [
    "非常感谢您的时间，今天收获很多。",
    "期待后续的反馈，祝您工作顺利！",
    "如果还有需要补充的，我随时可以提供。"
  ]
};

const transitionPhrases = [
  "这是个很好的问题，让我想一下...",
  "这个问题我需要稍微思考一下，首先我会从XX角度来看...",
  "虽然我之前没有遇到完全相同的情况，但我可以分享一个类似的经验...",
  "这个技术我了解的不是特别深入，但我可以说说我的理解和思考...",
  "让我用一个具体的例子来说明..."
];

export function InterviewAssistantMiddleColumn({
  status,
  interviewInfo,
  onStart,
  onPause,
  onResume,
  onStop,
  elapsedTime,
  currentStage,
  onStageChange,
  notes,
  onAddNote,
  onShowEmergencyHelp
}: Props) {
  const [noteInput, setNoteInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [completionFeeling, setCompletionFeeling] = useState("");
  const notesEndRef = useRef<HTMLDivElement>(null);

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "zh-CN";

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNoteInput(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("语音识别错误:", event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // 自动滚动笔记
  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const handleStartRecording = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleAddNote = () => {
    if (noteInput.trim()) {
      onAddNote(noteInput);
      setNoteInput("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 可以添加一个 toast 提示
  };

  // 待启动状态
  if (status === "idle") {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-lg">🤝</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">面试陪伴助手</h2>
              <p className="text-xs text-muted-foreground">真实面试时的实时辅助工具</p>
            </div>
          </div>
        </div>

        {/* 配置区 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          {interviewInfo ? (
            <div className="space-y-5">
              {/* 面试信息卡片 */}
              <div className="rounded-[16px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-border p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{interviewInfo.company}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{interviewInfo.position}</p>
                    <p className="text-xs text-muted-foreground">{interviewInfo.round}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-700 text-xs font-medium">
                    {interviewInfo.type}
                  </span>
                </div>
                
                {interviewInfo.reminders.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold mb-2">📝 特别提醒我：</p>
                    <ul className="space-y-1.5">
                      {interviewInfo.reminders.map((reminder, index) => (
                        <li key={index} className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{reminder}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 面试流程预览 */}
              <div>
                <h4 className="text-sm font-semibold mb-3">📋 典型面试流程</h4>
                <div className="space-y-2">
                  {interviewStages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-3 p-3 rounded-[12px] bg-secondary/30">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{stage.label}</p>
                        <p className="text-xs text-muted-foreground">{stage.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 使用说明 */}
              <div className="rounded-[14px] bg-orange-50/50 border border-orange-200 p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  使用说明
                </h4>
                <ul className="space-y-1 text-xs text-foreground/80">
                  <li>• 陪伴助手会提供实时话术建议和提醒</li>
                  <li>• 可以手动切换面试阶段获取对应建议</li>
                  <li>• 使用快速笔记记录重要信息</li>
                  <li>• 遇到卡壳时使用"紧急救援"功能</li>
                  <li>• 建议将此窗口缩小放在角落，避免面试官看到</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                <span className="text-3xl">🤝</span>
              </div>
              <p className="text-sm text-muted-foreground">请从左侧选择或创建面试</p>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex-shrink-0 p-5 border-t border-border">
          <button
            onClick={onStart}
            disabled={!interviewInfo}
            className="w-full h-[48px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            开始陪伴
          </button>
        </div>
      </div>
    );
  }

  // 进行中/暂停状态
  if (status === "running" || status === "paused") {
    const currentStageInfo = interviewStages.find(s => s.id === currentStage) || interviewStages[0];
    const currentPhrases = suggestedPhrases[currentStage as keyof typeof suggestedPhrases] || [];

    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部状态栏 */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === "running" ? "bg-green-500 animate-pulse" : "bg-orange-500"}`} />
              <span className="text-sm font-semibold">
                {status === "running" ? "陪伴中" : "已暂停"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono font-semibold text-primary">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>

          {/* 阶段选择器 */}
          <div className="relative">
            <button
              onClick={() => setShowStageDropdown(!showStageDropdown)}
              className="w-full h-[36px] px-3 rounded-[10px] bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">当前阶段：</span>
                <span className="font-medium">{currentStageInfo.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showStageDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-[10px] border border-border shadow-lg z-10 max-h-[240px] overflow-y-auto">
                {interviewStages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => {
                      onStageChange(stage.id);
                      setShowStageDropdown(false);
                    }}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-secondary transition-colors text-sm
                      ${currentStage === stage.id ? "bg-secondary" : ""}
                    `}
                  >
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-xs text-muted-foreground">{stage.duration}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          {/* 建议话术 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              建议话术
            </h4>
            <div className="space-y-2">
              {currentPhrases.map((phrase, index) => (
                <div key={index} className="group relative p-3 rounded-[12px] bg-purple-50/50 border border-purple-200">
                  <p className="text-xs leading-relaxed text-foreground/80 pr-8">
                    {phrase}
                  </p>
                  <button
                    onClick={() => copyToClipboard(phrase)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white/50 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 过渡话术（卡壳时使用） */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-orange-600" />
              过渡话术（卡壳时用）
            </h4>
            <div className="space-y-2">
              {transitionPhrases.slice(0, 3).map((phrase, index) => (
                <div key={index} className="group relative p-3 rounded-[12px] bg-orange-50/50 border border-orange-200">
                  <p className="text-xs leading-relaxed text-foreground/80 pr-8">
                    {phrase}
                  </p>
                  <button
                    onClick={() => copyToClipboard(phrase)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white/50 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 实时提醒 */}
          {status === "running" && elapsedTime > 180 && elapsedTime % 300 < 5 && (
            <div className="p-3 rounded-[12px] bg-blue-50/50 border border-blue-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900 mb-1">时间提醒</p>
                <p className="text-xs text-blue-800">
                  已进行 {Math.floor(elapsedTime / 60)} 分钟，注意控制回答节奏
                </p>
              </div>
            </div>
          )}

          {/* 快速笔记 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              快速笔记
            </h4>
            
            {/* 笔记列表 */}
            {notes.length > 0 && (
              <div className="mb-3 space-y-2 max-h-[150px] overflow-y-auto" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.15) transparent'
              }}>
                {notes.map((note) => (
                  <div key={note.id} className="p-2.5 rounded-[10px] bg-secondary/30">
                    <p className="text-xs text-foreground/80 mb-1">{note.content}</p>
                    <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                  </div>
                ))}
                <div ref={notesEndRef} />
              </div>
            )}

            {/* 笔记输入 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  placeholder="记录关键信息..."
                  disabled={status === "paused"}
                  className="flex-1 h-[36px] px-3 rounded-[10px] bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                />
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={status === "paused"}
                  className={`
                    w-[36px] h-[36px] rounded-[10px] flex items-center justify-center transition-colors
                    ${isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-secondary hover:bg-secondary/80"
                    }
                    disabled:opacity-50
                  `}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleAddNote}
                disabled={!noteInput.trim() || status === "paused"}
                className="w-full h-[32px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50"
              >
                添加笔记
              </button>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex-shrink-0 p-5 border-t border-border space-y-2">
          <button
            onClick={onShowEmergencyHelp}
            disabled={status === "paused"}
            className="w-full h-[36px] rounded-[10px] bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LifeBuoy className="w-4 h-4" />
            紧急救援
          </button>
          <div className="flex gap-2">
            {status === "running" ? (
              <button
                onClick={onPause}
                className="flex-1 h-[36px] rounded-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Pause className="w-4 h-4" />
                暂停
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex-1 h-[36px] rounded-[10px] bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                继续
              </button>
            )}
            <button
              onClick={onStop}
              className="flex-1 h-[36px] rounded-[10px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <StopCircle className="w-4 h-4" />
              结束
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 完成状态
  if (status === "completed") {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">面试结束</h2>
              <p className="text-xs text-muted-foreground">本次陪伴时长：{formatTime(elapsedTime)}</p>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <div className="space-y-5">
            {/* 快速记录感受 */}
            <div>
              <h4 className="text-sm font-semibold mb-3">📝 快速记录你的感受</h4>
              <textarea
                value={completionFeeling}
                onChange={(e) => setCompletionFeeling(e.target.value)}
                placeholder="面试官怎么样？哪些题答得好/不好？有什么特别的感受..."
                className="w-full h-[120px] p-3 rounded-[12px] bg-secondary/30 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.15) transparent'
                }}
              />
            </div>

            {/* 建议记录 */}
            <div className="rounded-[14px] bg-blue-50/50 border border-blue-200 p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                建议你记录
              </h4>
              <ul className="space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>面试官提出的关键问题和追问方向</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>你觉得没答好的地方和原因</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>面试官的反馈、表情、语气等细节</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>薪资、入职时间等待确认的事项</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>下一轮面试的时间和形式</span>
                </li>
              </ul>
            </div>

            {/* 你的笔记 */}
            {notes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">📋 你的笔记记录</h4>
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-[12px] bg-secondary/30">
                      <p className="text-xs text-foreground/80 mb-1">{note.content}</p>
                      <p className="text-xs text-muted-foreground">{note.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[12px] bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">面试时长</p>
                <p className="text-lg font-bold">{formatTime(elapsedTime)}</p>
              </div>
              <div className="rounded-[12px] bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">笔记数量</p>
                <p className="text-lg font-bold">{notes.length} 条</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex-shrink-0 p-5 border-t border-border space-y-2">
          <button className="w-full h-[44px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <Edit3 className="w-4 h-4" />
            创建完整复盘
          </button>
          <button className="w-full h-[36px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-sm font-medium">
            稍后再说
          </button>
        </div>
      </div>
    );
  }

  return null;
}
