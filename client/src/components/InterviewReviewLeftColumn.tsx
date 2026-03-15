import { useState } from "react";
import { Search, Plus, Filter, Calendar, TrendingUp, CheckCircle2, Clock, AlertCircle, DollarSign } from "lucide-react";

interface ReviewRecord {
  id: number;
  company: string;
  position: string;
  round: string;
  date: string;
  score: number | null;
  status: "completed" | "waiting" | "rejected" | "offer" | "pending";
  hasOffer?: boolean;
  hasSalary?: boolean;
}

interface Props {
  selectedRecord: ReviewRecord | null;
  onSelectRecord: (record: ReviewRecord) => void;
  onNewReview: () => void;
}

const mockReviews: ReviewRecord[] = [
  {
    id: 1,
    company: "字节跳动",
    position: "前端技术专家",
    round: "二面（技术深度）",
    date: "2天前",
    score: 8.2,
    status: "completed"
  },
  {
    id: 2,
    company: "阿里巴巴",
    position: "高级产品经理",
    round: "一面（业务理解）",
    date: "5天前",
    score: 7.5,
    status: "waiting"
  },
  {
    id: 3,
    company: "腾讯",
    position: "项目管理专家",
    round: "HR面",
    date: "1周前",
    score: 8.8,
    status: "offer",
    hasOffer: true,
    hasSalary: true
  },
  {
    id: 4,
    company: "美团",
    position: "高级前端工程师",
    round: "三面（综合面）",
    date: "1周前",
    score: 6.8,
    status: "rejected"
  },
  {
    id: 5,
    company: "拼多多",
    position: "前端技术专家",
    round: "一面（技术基础）",
    date: "2周前",
    score: 7.2,
    status: "completed"
  },
  {
    id: 6,
    company: "快手",
    position: "资深前端工程师",
    round: "二面（项目经验）",
    date: "2周前",
    score: null,
    status: "pending"
  },
  {
    id: 7,
    company: "小红书",
    position: "前端架构师",
    round: "一面（技术深度）",
    date: "3周前",
    score: 8.0,
    status: "completed"
  },
  {
    id: 8,
    company: "滴滴",
    position: "高级产品经理",
    round: "HR面",
    date: "3周前",
    score: 7.8,
    status: "waiting"
  }
];

const statusConfig = {
  completed: { label: "已完成", color: "text-green-600", bg: "bg-green-50" },
  waiting: { label: "待通知", color: "text-blue-600", bg: "bg-blue-50" },
  rejected: { label: "未通过", color: "text-red-600", bg: "bg-red-50" },
  offer: { label: "Offer", color: "text-purple-600", bg: "bg-purple-50" },
  pending: { label: "进行中", color: "text-orange-600", bg: "bg-orange-50" }
};

export function InterviewReviewLeftColumn({ selectedRecord, onSelectRecord, onNewReview }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "全部" },
    { id: "pending", label: "进行中" },
    { id: "waiting", label: "待通知" },
    { id: "offer", label: "Offer" },
    { id: "rejected", label: "未通过" }
  ];

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || review.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // 统计数据
  const stats = {
    total: mockReviews.length,
    passed: mockReviews.filter(r => r.status === "completed" || r.status === "offer" || r.status === "waiting").length,
    avgScore: (mockReviews.filter(r => r.score !== null).reduce((sum, r) => sum + (r.score || 0), 0) / mockReviews.filter(r => r.score !== null).length).toFixed(1),
    pending: mockReviews.filter(r => r.status === "waiting").length
  };

  return (
    <div className="w-[248px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* 头部 */}
      <div className="flex-shrink-0 px-[18px] pt-[18px] pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">我的复盘</h2>
          <button
            onClick={onNewReview}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-secondary transition-colors bg-primary/10"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索公司或岗位..."
            className="w-full h-[34px] pl-9 pr-3 bg-secondary/30 rounded-[10px] text-xs border border-transparent focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-border"
          />
        </div>

        {/* 筛选胶囊 */}
        <div className="flex flex-wrap gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                h-[28px] px-2.5 rounded-[999px] text-[11px] font-medium transition-all
                ${activeFilter === filter.id
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50"
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 复盘记录列表 */}
      <div className="flex-1 overflow-y-auto px-[18px] py-4" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-2.5">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              onClick={() => onSelectRecord(review)}
              className={`
                relative min-h-[88px] rounded-[16px] p-3.5 cursor-pointer transition-all
                ${selectedRecord?.id === review.id
                  ? "bg-secondary shadow-sm border-l-2 border-l-primary"
                  : "bg-secondary/30 hover:bg-secondary/50"
                }
              `}
            >
              <div className="space-y-2">
                {/* 第一行：公司名称 + 状态 */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-[20px] flex-1">
                    {review.company}
                  </h3>
                  <span className={`
                    px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap flex-shrink-0
                    ${statusConfig[review.status].bg} ${statusConfig[review.status].color}
                  `}>
                    {statusConfig[review.status].label}
                  </span>
                </div>

                {/* 第二行：岗位 */}
                <p className="text-xs text-foreground/80 line-clamp-1">
                  {review.position}
                </p>

                {/* 第三行：轮次 + 时间 */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{review.round}</span>
                  <span>{review.date}</span>
                </div>

                {/* 第四行：评分 + 标记 */}
                <div className="flex items-center justify-between">
                  {review.score !== null ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-primary">⭐ {review.score}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">待评分</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {review.hasSalary && (
                      <DollarSign className="w-3 h-3 text-green-600" />
                    )}
                    {review.hasOffer && (
                      <CheckCircle2 className="w-3 h-3 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部统计 */}
      <div className="flex-shrink-0 px-[18px] py-4 border-t border-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">本月面试</span>
            <span className="font-semibold">{stats.total} 次</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">通过轮次</span>
            <span className="font-semibold text-green-600">{stats.passed} 次</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">平均得分</span>
            <span className="font-semibold text-primary">{stats.avgScore} 分</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">待跟进</span>
            <span className="font-semibold text-orange-600">{stats.pending} 次</span>
          </div>
        </div>
        <button className="w-full h-[32px] rounded-[10px] bg-secondary/50 hover:bg-secondary transition-colors text-xs font-medium mt-3 flex items-center justify-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          查看详细报告
        </button>
      </div>
    </div>
  );
}
