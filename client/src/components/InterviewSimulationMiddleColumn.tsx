import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  StopCircle,
  Send,
  Mic,
  MicOff,
  MessageSquare,
  Sparkles,
  RotateCcw,
  FileText,
  CheckCircle2,
  Bot
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
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  elapsedTime: number;
  totalScore: number;
}

export function InterviewSimulationMiddleColumn({
  scenario,
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  messages,
  onSendMessage,
  elapsedTime,
  totalScore
}: Props) {
  const [inputMessage, setInputMessage] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "zh-CN";

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInputMessage(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("语音识别错误:", event.error);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage("");
      if (isRecording) {
        handleStopRecording();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 配置/空闲状态
  if (status === "idle" || status === "configuring") {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI 面试官</h2>
              <p className="text-xs text-muted-foreground">准备开始模拟面试</p>
            </div>
          </div>
        </div>

        {/* 配置区 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          {scenario && (
            <div className="space-y-5">
              {/* 场景信息卡片 */}
              <div className="rounded-[16px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{scenario.name}</h3>
                    <p className="text-xs text-muted-foreground">{scenario.company} · {scenario.type}</p>
                  </div>
                  <span className={`
                    px-2.5 py-1 rounded-[8px] text-xs font-medium
                    ${scenario.difficulty === "初级" ? "bg-green-50 text-green-700" :
                      scenario.difficulty === "中级" ? "bg-blue-50 text-blue-700" :
                      "bg-orange-50 text-orange-700"}
                  `}>
                    {scenario.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>⏱️ 预计时长：{scenario.duration} 分钟</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {scenario.description}
                </p>
              </div>

              {/* 面试说明 */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">📋 面试流程</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded-[12px] bg-secondary/30">
                    <span className="text-primary font-bold text-xs mt-0.5">1</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1">开场寒暄</p>
                      <p className="text-xs text-muted-foreground">AI 面试官会进行简单的自我介绍和开场</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-[12px] bg-secondary/30">
                    <span className="text-primary font-bold text-xs mt-0.5">2</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1">问题问答</p>
                      <p className="text-xs text-muted-foreground">根据你的回答，AI 会智能追问和深入挖掘</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-[12px] bg-secondary/30">
                    <span className="text-primary font-bold text-xs mt-0.5">3</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium mb-1">即时评分</p>
                      <p className="text-xs text-muted-foreground">每个回答都会获得实时评分和反馈</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 注意事项 */}
              <div className="rounded-[14px] bg-orange-50/50 border border-orange-200 p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  💡 温馨提示
                </h4>
                <ul className="space-y-1 text-xs text-foreground/80">
                  <li>• 支持文字和语音两种回答方式</li>
                  <li>• 可以随时暂停思考，不计入面试时间</li>
                  <li>• 遇到困难可以使用"紧急求助"功能</li>
                  <li>• 建议在安静环境下进行，获得最佳体验</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex-shrink-0 p-5 border-t border-border">
          <button
            onClick={onStart}
            disabled={!scenario}
            className="w-full h-[48px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            开始模拟面试
          </button>
        </div>
      </div>
    );
  }

  // 进行中/暂停状态
  if (status === "running" || status === "paused") {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部状态栏 */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI 面试官</h3>
                <p className="text-xs text-muted-foreground">
                  {status === "paused" ? "已暂停" : "正在进行中"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-semibold text-primary">
                {formatTime(elapsedTime)} / {formatTime((scenario?.duration || 30) * 60)}
              </span>
            </div>
          </div>
          {/* 进度条 */}
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min((elapsedTime / ((scenario?.duration || 30) * 60)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 对话历史区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">面试即将开始...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`
                  max-w-[85%] rounded-[16px] px-4 py-3
                  ${message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                  }
                `}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2 gap-3">
                    <span className={`text-xs ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.timestamp}
                    </span>
                    {message.score && message.role === "user" && (
                      <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                        {message.score} 分
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区 */}
        <div className="flex-shrink-0 p-5 border-t border-border space-y-3">
          {/* 控制按钮 */}
          <div className="flex items-center gap-2">
            {status === "running" ? (
              <button
                onClick={onPause}
                className="flex-1 h-[36px] rounded-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                暂停
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex-1 h-[36px] rounded-[10px] bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                继续
              </button>
            )}
            <button
              onClick={onStop}
              className="flex-1 h-[36px] rounded-[10px] bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <StopCircle className="w-3.5 h-3.5" />
              结束面试
            </button>
          </div>

          {/* 输入模式切换 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputMode("text");
                if (isRecording) handleStopRecording();
              }}
              className={`
                flex-1 h-[32px] rounded-[8px] text-xs font-medium transition-all
                ${inputMode === "text"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }
              `}
            >
              <MessageSquare className="w-3 h-3 inline-block mr-1.5" />
              文字
            </button>
            <button
              onClick={() => {
                setInputMode("voice");
              }}
              className={`
                flex-1 h-[32px] rounded-[8px] text-xs font-medium transition-all
                ${inputMode === "voice"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }
              `}
            >
              <Mic className="w-3 h-3 inline-block mr-1.5" />
              语音
            </button>
          </div>

          {/* 输入框 */}
          {inputMode === "text" ? (
            <div className="flex items-end gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={status === "paused" ? "已暂停，请继续后回答" : "输入你的回答... (Enter 发送)"}
                disabled={status === "paused"}
                className="flex-1 min-h-[44px] max-h-[120px] p-3 rounded-[12px] bg-secondary/30 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm disabled:opacity-50"
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,0,0,0.15) transparent'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || status === "paused"}
                className="h-[44px] w-[44px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={status === "paused"}
                className={`
                  w-16 h-16 rounded-full flex items-center justify-center transition-all
                  ${isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <p className="text-xs text-muted-foreground mt-3">
                {isRecording ? "正在录音... 点击停止" : status === "paused" ? "已暂停" : "点击开始录音"}
              </p>
              {inputMessage && (
                <div className="mt-3 w-full">
                  <p className="text-xs text-muted-foreground mb-2">识别内容：</p>
                  <div className="p-3 rounded-[10px] bg-secondary/30 text-sm">
                    {inputMessage}
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={status === "paused"}
                    className="w-full mt-2 h-[36px] rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    发送此内容
                  </button>
                </div>
              )}
            </div>
          )}
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
              <h2 className="text-lg font-semibold">模拟完成！</h2>
              <p className="text-xs text-muted-foreground">恭喜你完成了本次面试模拟</p>
            </div>
          </div>
        </div>

        {/* 结果预览区 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <div className="space-y-5">
            {/* 综合得分 */}
            <div className="rounded-[18px] bg-gradient-to-br from-green-50/50 to-blue-50/50 border border-border p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">综合得分</p>
              <div className="text-5xl font-bold text-primary mb-2">{totalScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                {totalScore >= 8.5 ? "优秀！表现出色" :
                 totalScore >= 7.5 ? "良好！继续保持" :
                 totalScore >= 6.5 ? "中等，还有提升空间" :
                 "需要加强练习"}
              </p>
            </div>

            {/* 各维度表现 */}
            <div>
              <h4 className="text-sm font-semibold mb-3">📊 各维度表现</h4>
              <div className="space-y-3">
                {[
                  { name: "技术深度", score: 8.5 },
                  { name: "表达清晰度", score: 7.8 },
                  { name: "应变能力", score: 8.0 },
                  { name: "逻辑思维", score: 7.5 },
                  { name: "项目经验", score: 8.2 }
                ].map((dim, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">{dim.name}</span>
                      <span className="text-xs font-semibold">{dim.score} 分</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${(dim.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 总评 */}
            <div className="rounded-[14px] bg-purple-50/50 border border-purple-200 p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI 总评
              </h4>
              <p className="text-xs leading-relaxed text-foreground/80">
                表现不错！技术深度扎实，项目经验丰富，能够清晰地表达自己的想法。在回答问题时逻辑性强，善于使用 STAR 法则组织内容。建议继续加强对细节的把控，以及在压力下的应变能力。整体来说，已经达到了中级岗位的面试水平。
              </p>
            </div>

            {/* 面试数据 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[12px] bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">用时</p>
                <p className="text-lg font-bold">{formatTime(elapsedTime)}</p>
              </div>
              <div className="rounded-[12px] bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">回答题数</p>
                <p className="text-lg font-bold">{messages.filter(m => m.role === "user").length} 题</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex-shrink-0 p-5 border-t border-border space-y-2">
          <button className="w-full h-[44px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            查看完整报告
          </button>
          <button
            onClick={onStart}
            className="w-full h-[44px] rounded-[14px] bg-card border border-border hover:bg-secondary transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重新模拟
          </button>
        </div>
      </div>
    );
  }

  return null;
}
