import { useState } from "react";
import { Plus, MoreHorizontal, ChevronRight, Sparkles, TrendingUp, Shield, Eye, EyeOff } from "lucide-react";
import type { Offer } from "./DecisionsLeftColumn";

interface Props {
  mode: "empty" | "comparison" | "detail" | "negotiation" | "recommendation";
  selectedOffers: Offer[];
  weights: {
    income: number;
    growth: number;
    city: number;
    balance: number;
  };
  onWeightChange: (weights: { income: number; growth: number; city: number; balance: number }) => void;
  onAddOffer: () => void;
  hideMode: boolean;
  onToggleHideMode: () => void;
}

// 维度对比数据
interface ComparisonDimension {
  label: string;
  offerA: string;
  offerB: string;
  result: "A优" | "B优" | "接近" | "需补充";
}

const comparisonDimensions: ComparisonDimension[] = [
  { label: "固定薪资", offerA: "40K", offerB: "35K", result: "A优" },
  { label: "奖金/绩效", offerA: "20%", offerB: "30%", result: "B优" },
  { label: "股权", offerA: "5万股", offerB: "8万股", result: "B优" },
  { label: "职级", offerA: "P6", offerB: "P7", result: "B优" },
  { label: "业务成长性", offerA: "高", offerB: "中", result: "A优" },
  { label: "团队质量", offerA: "优秀", offerB: "优秀", result: "接近" },
  { label: "学习价值", offerA: "高", offerB: "中高", result: "A优" },
  { label: "工作强度", offerA: "高", offerB: "中", result: "B优" },
  { label: "城市因素", offerA: "上海", offerB: "杭州", result: "接近" },
  { label: "职业匹配度", offerA: "高", offerB: "中高", result: "A优" }
];

const resultConfig = {
  "A优": { color: "text-green-600", bg: "bg-green-50" },
  "B优": { color: "text-blue-600", bg: "bg-blue-50" },
  "接近": { color: "text-gray-600", bg: "bg-gray-50" },
  "需补充": { color: "text-orange-600", bg: "bg-orange-50" }
};

export function DecisionsMiddleColumn({
  mode,
  selectedOffers,
  weights,
  onWeightChange,
  onAddOffer,
  hideMode,
  onToggleHideMode
}: Props) {
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // 空状态
  if (mode === "empty") {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">开始你的职业决策</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            还没有 Offer，先把你已有的机会录进来，系统才能帮你比较和决策。
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onAddOffer}
              className="h-[44px] px-5 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              新增 Offer
            </button>
            <button className="h-[44px] px-5 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
              查看示例数据
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Offer 对比模式
  if (mode === "comparison" && selectedOffers.length >= 2) {
    const offerA = selectedOffers[0];
    const offerB = selectedOffers[1];

    // 计算综合得分（基于权重）
    const calculateScore = (offer: Offer) => {
      const scores = {
        income: offer.baseSalary * offer.months / 10, // 归一化到 10 分制
        growth: offer.growthPotential === "高" ? 9 : offer.growthPotential === "中高" ? 7.5 : offer.growthPotential === "中" ? 6 : 5,
        city: offer.city === "上海" || offer.city === "北京" ? 8 : 7,
        balance: offer.workload === "高" ? 5 : offer.workload === "中高" ? 7 : 8
      };

      const totalScore = (
        scores.income * weights.income +
        scores.growth * weights.growth +
        scores.city * weights.city +
        scores.balance * weights.balance
      );

      return Math.round(totalScore * 10) / 10;
    };

    const scoreA = calculateScore(offerA);
    const scoreB = calculateScore(offerB);

    const handleWeightDrag = (dimension: keyof typeof weights, value: number) => {
      const newWeights = { ...weights, [dimension]: value };
      // 确保总和为 100%
      const total = Object.values(newWeights).reduce((sum, v) => sum + v, 0);
      if (total !== 100) {
        const scale = 100 / total;
        Object.keys(newWeights).forEach(key => {
          newWeights[key as keyof typeof weights] = Math.round(newWeights[key as keyof typeof weights] * scale);
        });
      }
      onWeightChange(newWeights);
    };

    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Offer 对比</h2>
              <p className="text-xs text-muted-foreground">
                当前对比 {selectedOffers.length} 个机会 · 你可以按"成长""收入""城市""平衡"调整权重
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleHideMode}
                className="w-9 h-9 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center"
                title={hideMode ? "显示薪资" : "隐藏薪资"}
              >
                {hideMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={onAddOffer}
                className="w-9 h-9 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-[10px] hover:bg-secondary transition-colors flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <div className="space-y-5">
            {/* 决策偏好区 */}
            <div className="rounded-[18px] bg-gradient-to-br from-purple-50/30 to-blue-50/30 border border-border/50 p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                你的决策偏好
              </h3>
              <div className="space-y-3">
                {[
                  { key: "income" as const, label: "收入", color: "from-green-500 to-emerald-500" },
                  { key: "growth" as const, label: "成长", color: "from-blue-500 to-cyan-500" },
                  { key: "city" as const, label: "城市", color: "from-purple-500 to-pink-500" },
                  { key: "balance" as const, label: "工作生活平衡", color: "from-orange-500 to-red-500" }
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                      <span className="text-xs font-semibold">{weights[key]}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-300`}
                        style={{ width: `${weights[key]}%` }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={weights[key]}
                        onChange={(e) => handleWeightDrag(key, parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                💡 拖动滑块调整权重，系统会实时更新推荐结果
              </p>
            </div>

            {/* Offer 头卡对比 */}
            <div className="grid grid-cols-2 gap-4">
              {[offerA, offerB].map((offer, index) => (
                <div
                  key={offer.id}
                  className="rounded-[18px] bg-gradient-to-br from-white to-secondary/30 border border-border p-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold">{offer.company}</h4>
                    <p className="text-xs text-muted-foreground">{offer.position}</p>
                    <p className="text-xs text-muted-foreground">{offer.city}</p>
                    <div className="text-sm font-semibold text-primary">
                      {hideMode ? "****" : `${offer.baseSalary}K × ${offer.months}`}
                    </div>
                    <div className="pt-2 mt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">系统评分</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {index === 0 ? scoreA : scoreB}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 关键维度对比表 */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                📋 关键维度对比
              </h3>
              <div className="rounded-[16px] border border-border overflow-hidden">
                {comparisonDimensions.map((dim, index) => (
                  <div
                    key={dim.label}
                    className={`
                      flex items-center h-[46px] px-4 hover:bg-secondary/30 transition-colors
                      ${index !== comparisonDimensions.length - 1 ? "border-b border-border/50" : ""}
                    `}
                  >
                    <div className="w-[140px] flex-shrink-0">
                      <span className="text-xs font-medium text-muted-foreground">{dim.label}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs font-medium w-[120px]">
                        {dim.label === "固定薪资" && hideMode ? "****" : dim.offerA}
                      </span>
                      <span className="text-xs font-medium w-[120px] text-center">
                        {dim.label === "固定薪资" && hideMode ? "****" : dim.offerB}
                      </span>
                      <span className={`
                        text-[10px] font-semibold px-2 py-1 rounded-[6px] w-[60px] text-center
                        ${resultConfig[dim.result].color} ${resultConfig[dim.result].bg}
                      `}>
                        {dim.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 综合判断区 */}
            <div className="rounded-[18px] bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-blue-200/50 p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                当前综合判断
              </h3>
              <p className="text-sm leading-relaxed text-foreground/80 mb-4">
                如果你更重视未来两年的<strong>成长斜率</strong>和 <strong>AI 场景经验沉淀</strong>，当前更推荐 <strong>{offerA.company}</strong> 的机会；如果你更在意<strong>稳定性</strong>和<strong>生活平衡</strong>，<strong>{offerB.company}</strong> Offer 风险更低。
              </p>
              <div className="flex gap-2">
                <button className="flex-1 h-[36px] rounded-[10px] bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-medium text-primary flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  生成详细分析
                </button>
                <button className="flex-1 h-[36px] rounded-[10px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                  去谈薪准备
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 对比对象不足
  if (mode === "comparison" && selectedOffers.length < 2) {
    return (
      <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">对比对象不足</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            再添加一个 Offer，系统才会给出更有意义的比较。
          </p>
          <button
            onClick={onAddOffer}
            className="h-[44px] px-5 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            添加 Offer
          </button>
        </div>
      </div>
    );
  }

  // 其他模式暂时返回占位
  return (
    <div className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col items-center justify-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="text-center p-8">
        <p className="text-sm text-muted-foreground">
          {mode === "detail" && "Offer 详情开发中..."}
          {mode === "negotiation" && "谈薪助手开发中..."}
          {mode === "recommendation" && "选择建议开发中..."}
        </p>
      </div>
    </div>
  );
}
