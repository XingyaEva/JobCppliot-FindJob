import { useState } from "react";
import { Search, Plus, DollarSign, TrendingUp, Shield, Zap, Award } from "lucide-react";

export interface Offer {
  id: number;
  company: string;
  position: string;
  city: string;
  baseSalary: number;
  months: number;
  deadline: string;
  status: "pending" | "comparing" | "negotiating" | "confirmed";
  tags: Array<{ label: string; icon: string }>;
  bonus?: string;
  equity?: string;
  level?: string;
  reportingLine?: string;
  teamQuality?: string;
  workload?: string;
  growthPotential?: string;
  learningValue?: string;
  cityFactor?: string;
  careerMatch?: string;
}

interface Props {
  selectedOffer: Offer | null;
  onSelectOffer: (offer: Offer) => void;
  onNewOffer: () => void;
}

const mockOffers: Offer[] = [
  {
    id: 1,
    company: "字节跳动",
    position: "AI 产品经理",
    city: "上海",
    baseSalary: 40,
    months: 16,
    deadline: "3天后",
    status: "comparing",
    tags: [
      { label: "高成长", icon: "💎" },
      { label: "大厂", icon: "🏢" }
    ],
    bonus: "20%",
    equity: "5万股",
    level: "P6",
    growthPotential: "高",
    teamQuality: "优秀",
    workload: "高",
    learningValue: "高",
    careerMatch: "高"
  },
  {
    id: 2,
    company: "阿里巴巴",
    position: "高级产品经理",
    city: "杭州",
    baseSalary: 35,
    months: 16,
    deadline: "5天后",
    status: "negotiating",
    tags: [
      { label: "稳定", icon: "🛡️" },
      { label: "平衡", icon: "⚖️" }
    ],
    bonus: "30%",
    equity: "8万股",
    level: "P7",
    growthPotential: "中",
    teamQuality: "优秀",
    workload: "中",
    learningValue: "中高",
    careerMatch: "中高"
  },
  {
    id: 3,
    company: "腾讯",
    position: "产品专家",
    city: "深圳",
    baseSalary: 38,
    months: 16,
    deadline: "已接受",
    status: "confirmed",
    tags: [
      { label: "高强度", icon: "⚡" },
      { label: "高薪", icon: "💰" }
    ],
    bonus: "25%",
    equity: "6万股",
    level: "10级",
    growthPotential: "中高",
    teamQuality: "优秀",
    workload: "高",
    learningValue: "高",
    careerMatch: "高"
  },
  {
    id: 4,
    company: "美团",
    position: "高级产品经理",
    city: "北京",
    baseSalary: 36,
    months: 14,
    deadline: "7天后",
    status: "pending",
    tags: [
      { label: "业务广", icon: "🎯" },
      { label: "成长快", icon: "📈" }
    ],
    bonus: "20%",
    equity: "4万股",
    level: "P2-2",
    growthPotential: "高",
    teamQuality: "良好",
    workload: "中高",
    learningValue: "中高",
    careerMatch: "中"
  },
  {
    id: 5,
    company: "拼多多",
    position: "产品经理",
    city: "上海",
    baseSalary: 42,
    months: 16,
    deadline: "4天后",
    status: "pending",
    tags: [
      { label: "高薪", icon: "💰" },
      { label: "挑战", icon: "🔥" }
    ],
    bonus: "15%",
    equity: "3万股",
    level: "P6",
    growthPotential: "中高",
    teamQuality: "良好",
    workload: "高",
    learningValue: "中",
    careerMatch: "中"
  }
];

const statusConfig = {
  pending: { label: "待比较", color: "text-blue-600", bg: "bg-blue-50" },
  comparing: { label: "对比中", color: "text-purple-600", bg: "bg-purple-50" },
  negotiating: { label: "谈薪中", color: "text-orange-600", bg: "bg-orange-50" },
  confirmed: { label: "已确认", color: "text-green-600", bg: "bg-green-50" }
};

export function DecisionsLeftColumn({ selectedOffer, onSelectOffer, onNewOffer }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "全部" },
    { id: "pending", label: "待比较" },
    { id: "comparing", label: "对比中" },
    { id: "negotiating", label: "谈薪中" },
    { id: "confirmed", label: "已确认" }
  ];

  const filteredOffers = mockOffers.filter(offer => {
    const matchesSearch = offer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || offer.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-[260px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* 头部 */}
      <div className="flex-shrink-0 px-[18px] pt-[18px] pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Offer 列表</h2>
          <button
            onClick={onNewOffer}
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

      {/* Offer 卡片列表 */}
      <div className="flex-1 overflow-y-auto px-[18px] py-4" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        {filteredOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
              <DollarSign className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">暂无 Offer</p>
            <p className="text-xs text-muted-foreground">点击右上角 + 新增</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => onSelectOffer(offer)}
                className={`
                  relative min-h-[104px] rounded-[16px] p-3.5 cursor-pointer transition-all
                  ${selectedOffer?.id === offer.id
                    ? "bg-secondary shadow-sm border-l-2 border-l-primary"
                    : "bg-secondary/30 hover:bg-secondary/50"
                  }
                `}
              >
                <div className="space-y-2">
                  {/* 第一行：公司名称 + 状态 */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-[20px] flex-1">
                      {offer.company}
                    </h3>
                    <span className={`
                      px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap flex-shrink-0
                      ${statusConfig[offer.status].bg} ${statusConfig[offer.status].color}
                    `}>
                      {statusConfig[offer.status].label}
                    </span>
                  </div>

                  {/* 第二行：岗位 + 城市 */}
                  <p className="text-xs text-foreground/80">
                    {offer.position} · {offer.city}
                  </p>

                  {/* 第三行：薪资 + 截止时间 */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">
                      {offer.baseSalary}K × {offer.months}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      截止 {offer.deadline}
                    </span>
                  </div>

                  {/* 第四行：标签 */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {offer.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[6px] bg-background/50 text-[10px]"
                      >
                        <span>{tag.icon}</span>
                        <span>{tag.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
