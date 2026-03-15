import { useState } from "react";
import {
  CheckCircle2,
  MoreHorizontal,
  Sparkles,
  Copy,
  PlayCircle,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";

interface InterviewQuestion {
  id: number;
  title: string;
  type: string;
  category: string;
  intent: string;
  structure: {
    steps: Array<{
      title: string;
      timePercent: string;
      points: string[];
    }>;
  };
  standardAnswer: string;
  referenceCount: number;
  practiceHistory: Array<{
    date: string;
    score: number;
    improvement: string;
  }>;
  relatedJobs: Array<{
    company: string;
    position: string;
    relevance: string;
    status: string;
  }>;
}

interface Props {
  question: InterviewQuestion;
  questionIndex: number;
  totalQuestions: number;
  onStartPractice: () => void;
}

export function InterviewBankMiddleColumn({ question, questionIndex, totalQuestions, onStartPractice }: Props) {
  const [showStandardAnswer, setShowStandardAnswer] = useState(false);

  // 安全检查：如果 question 未定义，返回空状态
  if (!question) {
    return (
      <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-sm text-muted-foreground">请选择一个题目</p>
      </div>
    );
  }

  return (
    <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex-1 overflow-y-auto p-6" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-5">
          {/* 题目头部 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-700 text-xs font-medium">
                  {question.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {questionIndex + 1} / {totalQuestions}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <h2 className="text-[22px] leading-[32px] font-semibold mb-3">
              {question.title}
            </h2>

            <div className="rounded-[14px] bg-secondary/30 p-3.5">
              <p className="text-xs text-muted-foreground mb-1 font-medium">考察意图</p>
              <p className="text-[13px] leading-[20px] text-muted-foreground">
                {question.intent}
              </p>
            </div>
          </div>

          {/* 推荐答题结构 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">💡 推荐答题结构</h3>
            <div className="rounded-[16px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-border p-4 space-y-3">
              {question.structure.steps.map((step, index) => (
                <div key={index} className="rounded-[12px] bg-card border border-border p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{index + 1}. {step.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {step.timePercent}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {step.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button className="w-full h-[36px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                复制结构
              </button>
            </div>
          </div>

          {/* 标准回答示例 */}
          <div>
            <button 
              onClick={() => setShowStandardAnswer(!showStandardAnswer)}
              className="w-full flex items-center justify-between p-3.5 rounded-[14px] bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">📝 标准回答示例</h3>
                <span className="text-xs text-muted-foreground">已有 {question.referenceCount.toLocaleString()} 人参考</span>
              </div>
              {showStandardAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showStandardAnswer && (
              <div className="mt-3 rounded-[16px] bg-secondary/30 border border-border p-4">
                <p className="text-sm leading-[22px] text-foreground/90 whitespace-pre-line mb-3">
                  {question.standardAnswer}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 h-[32px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </button>
                  <button className="flex-1 h-[32px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    基于此改写
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  💡 仅供参考，建议结合自己的实际经历进行修改
                </p>
              </div>
            )}
          </div>

          {/* 我的历史回答 */}
          {question.practiceHistory && question.practiceHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">📊 我的历史回答（{question.practiceHistory.length}次）</h3>
              <div className="space-y-2.5">
                {question.practiceHistory.map((record, index) => (
                  <div
                    key={index}
                    className="rounded-[14px] bg-secondary/30 border border-border p-3.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{record.date}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                          {record.score} 分
                        </span>
                      </div>
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{record.improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 关联岗位 */}
          {question.relatedJobs && question.relatedJobs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">🔗 关联岗位</h3>
              <div className="space-y-2">
                {question.relatedJobs.map((job, index) => (
                  <div
                    key={index}
                    className="h-[62px] rounded-[14px] bg-secondary/30 border border-border p-3.5 flex items-center justify-between hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{job.company}</span>
                        <span className={`
                          text-xs px-2 py-0.5 rounded-full font-medium
                          ${job.relevance === "高相关" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}
                        `}>
                          {job.relevance}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{job.position} · {job.status}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作栏 */}
          <div className="flex gap-2">
            <button 
              onClick={onStartPractice}
              className="flex-1 h-[44px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              开始练习
            </button>
            <button className="h-[44px] px-4 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <BookmarkPlus className="w-4 h-4" />
              加入计划
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}