import { 
  BarChart3,
  Flame,
  Star,
  Lightbulb,
  PlayCircle,
  ExternalLink
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router";

interface InterviewQuestion {
  id: number;
  title: string;
  type: string;
  practiceCount: number;
  averageScore: number;
  bestScore: number;
  mastery: string;
  practiceHistory: Array<{
    date: string;
    score: number;
  }>;
  relatedJobs: Array<{
    company: string;
    position: string;
    relevance: string;
    status: string;
  }>;
  relatedQuestions: number[];
}

interface RecommendedQuestion {
  type: string;
  question: InterviewQuestion;
  reason: string;
}

interface Props {
  question: InterviewQuestion;
  allQuestions: InterviewQuestion[];
  recommendedQuestions: RecommendedQuestion[];
  trendData: Array<{ date: string; score: number }>;
}

export function InterviewBankRightColumn({ question, allQuestions, recommendedQuestions, trendData }: Props) {
  const navigate = useNavigate();

  // 安全检查：如果 question 未定义，返回空状态
  if (!question) {
    return (
      <div className="flex-1 overflow-y-auto p-5 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">请选择一个题目</p>
      </div>
    );
  }

  // 掌握星级
  const getMasteryStars = () => {
    if (question.bestScore >= 8.5) return 5;
    if (question.bestScore >= 8.0) return 4;
    if (question.bestScore >= 7.0) return 3;
    if (question.bestScore >= 6.0) return 2;
    if (question.bestScore > 0) return 1;
    return 0;
  };

  const masteryStars = getMasteryStars();

  const handleJobClick = (job: any) => {
    navigate("/opportunities");
  };

  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ 
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.15) transparent'
    }}>
      <div className="space-y-5">
        {/* 头部 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">练习统计</h3>
          <p className="text-xs leading-[18px] text-muted-foreground">
            查看你的练习记录和进步趋势
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-border p-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">已练习</p>
              <p className="text-2xl font-bold">{question.practiceCount} <span className="text-sm font-normal text-muted-foreground">次</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">平均得分</p>
              <p className="text-2xl font-bold">{question.averageScore > 0 ? question.averageScore.toFixed(1) : '-'} <span className="text-sm font-normal text-muted-foreground">分</span></p>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">最高得分</span>
              <span className="text-lg font-bold text-primary">{question.bestScore > 0 ? question.bestScore.toFixed(1) : '-'} 分</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">掌握程度</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < masteryStars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 得分趋势图 */}
        {trendData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              得分趋势
            </h4>
            <div className="rounded-[16px] bg-card border border-border p-4">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={trendData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    stroke="#888"
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fontSize: 10 }}
                    stroke="#888"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 推荐练习顺序 */}
        {recommendedQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">🎯 推荐练习顺序</h4>
            <div className="space-y-2.5">
              {recommendedQuestions.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-[14px] bg-card border border-border p-3.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    {rec.type === "priority" && <Flame className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />}
                    {rec.type === "strengthen" && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />}
                    {rec.type === "expand" && <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className="text-sm font-medium leading-tight">{rec.question.title}</h5>
                        <span className={`
                          px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap
                          ${rec.type === "priority" ? "bg-orange-50 text-orange-700" :
                            rec.type === "strengthen" ? "bg-yellow-50 text-yellow-700" :
                            "bg-blue-50 text-blue-700"}
                        `}>
                          {rec.type === "priority" ? "优先" : rec.type === "strengthen" ? "巩固" : "拓展"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                      <button className="h-[28px] px-3 rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                        <PlayCircle className="w-3 h-3" />
                        开始练习
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 关联岗位 */}
        {question.relatedJobs && question.relatedJobs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">🏢 关联岗位（{question.relatedJobs.length}个）</h4>
            <div className="space-y-2">
              {question.relatedJobs.map((job, index) => (
                <div
                  key={index}
                  onClick={() => handleJobClick(job)}
                  className="rounded-[14px] bg-card border border-border p-3.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium mb-1">{job.company}</h5>
                      <p className="text-xs text-muted-foreground">{job.position}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full font-medium
                      ${job.relevance === "高相关" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}
                    `}>
                      {job.relevance}
                    </span>
                    <span className="text-xs text-muted-foreground">{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 相关题目推荐 */}
        {question.relatedQuestions && question.relatedQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">🔖 相关题目推荐</h4>
            <div className="space-y-2">
              {question.relatedQuestions.slice(0, 3).map((qId) => {
                const relatedQ = allQuestions.find(q => q.id === qId);
                if (!relatedQ) return null;
                return (
                  <button
                    key={qId}
                    className="w-full text-left rounded-[12px] bg-secondary/30 border border-border p-3 hover:bg-secondary/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground leading-relaxed">{relatedQ.title}</p>
                  </button>
                );
              })}
            </div>
            {question.relatedQuestions.length > 3 && (
              <button className="w-full mt-2 h-[32px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">
                查看更多相关题目
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}