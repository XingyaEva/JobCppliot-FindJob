import { useState } from "react";
import {
  Target,
  Sparkles,
  AlertTriangle,
  DollarSign,
  BookmarkPlus,
  Save,
  FileText,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
  ChevronRight,
  Copy
} from "lucide-react";
import type { Offer } from "./DecisionsLeftColumn";

interface Props {
  mode: "empty" | "comparison" | "detail" | "negotiation" | "recommendation";
  selectedOffers: Offer[];
  recommendedOffer?: Offer;
  systemScore: { [offerId: number]: number };
  weights: {
    income: number;
    growth: number;
    city: number;
    balance: number;
  };
}

// 谈薪场景话术库
const negotiationScripts = [
  {
    id: 1,
    scenario: "对方说预算有限",
    response: "理解贵司的预算考虑。除了固定薪资，我们可以讨论签字费、股权、或试用期后的调薪空间吗？"
  },
  {
    id: 2,
    scenario: "对方询问期望薪资",
    response: "基于我的经验和市场水平，我期望的范围是 XX-XX。当然具体可以根据岗位职责和成长空间调整。"
  },
  {
    id: 3,
    scenario: "对方提出低于预期的 offer",
    response: "感谢这个机会。这个数字与我的市场调研有一定差距，能了解一下薪酬构成的详细拆解吗？"
  },
  {
    id: 4,
    scenario: "讨论绩效系数",
    response: "能否明确一下绩效考核的评估标准和历史达成率？这有助于我更准确地评估总包。"
  },
  {
    id: 5,
    scenario: "询问股权细节",
    response: "关于股权部分，能否说明行权价格、归属周期，以及公司最近的估值情况？"
  },
  {
    id: 6,
    scenario: "对方要求立即决定",
    response: "这是一个重要的职业决策，我需要 2-3 天时间认真评估。能否给我一个明确的截止时间？"
  },
  {
    id: 7,
    scenario: "讨论试用期待遇",
    response: "试用期的薪资标准是多少？试用期考核的具体标准和转正流程能说明一下吗？"
  },
  {
    id: 8,
    scenario: "要求签字费",
    response: "考虑到我需要放弃当前的年终奖/项目奖金，能否考虑提供一次性签字费作为补偿？"
  },
  {
    id: 9,
    scenario: "对方说已经是最高 offer",
    response: "理解这可能是当前的最优方案。那我们是否可以约定，在试用期结束或年度考核时，有一个明确的调薪机制？"
  },
  {
    id: 10,
    scenario: "多个 offer 对比中",
    response: "我目前在对比几个机会，贵司的机会我非常看重。能否在 XX 方面再优化一下，这样我可以更快做出决定。"
  }
];

export function DecisionsRightColumn({
  mode,
  selectedOffers,
  recommendedOffer,
  systemScore,
  weights
}: Props) {
  const [showAllScripts, setShowAllScripts] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // 空状态
  if (mode === "empty") {
    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center mb-3">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">开始你的职业决策</p>
          <p className="text-xs text-muted-foreground">添加 Offer 后查看系统建议</p>
        </div>
      </div>
    );
  }

  // 对比模式 - 系统建议
  if (mode === "comparison" && selectedOffers.length >= 2) {
    const offerA = selectedOffers[0];
    const offerB = selectedOffers[1];
    const scoreA = systemScore[offerA.id] || 0;
    const scoreB = systemScore[offerB.id] || 0;
    const recommended = scoreA >= scoreB ? offerA : offerB;
    const alternative = scoreA >= scoreB ? offerB : offerA;

    // 根据权重生成个性化建议
    const getWeightBasedInsight = () => {
      const maxWeight = Math.max(weights.income, weights.growth, weights.city, weights.balance);
      if (weights.growth === maxWeight) {
        return "你非常重视成长，推荐选择业务成长性更高的机会";
      } else if (weights.income === maxWeight) {
        return "你更关注收入，建议优先考虑总包更高的 offer";
      } else if (weights.balance === maxWeight) {
        return "你注重工作生活平衡，建议选择工作强度适中的机会";
      } else {
        return "你看重城市因素，建议考虑生活成本和发展机会";
      }
    };

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-4">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              系统建议
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              结合你的目标方向、过往偏好和当前对比结果，系统给出以下判断。
            </p>
          </div>

          {/* 推荐结论卡 */}
          <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-200/50 p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-1">当前更推荐</h4>
                  <p className="text-base font-bold text-purple-600">{recommended.company}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">核心理由</span>
                  <p className="text-xs leading-relaxed text-foreground/80 mt-1">
                    {recommended.growthPotential === "高" 
                      ? "成长斜率更高，与你未来 AI 产品方向更一致" 
                      : "稳定性更好，工作生活平衡度较高"}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    风险提示
                  </span>
                  <p className="text-xs leading-relaxed text-orange-600 mt-1">
                    {recommended.workload === "高" 
                      ? "短期工作强度可能较高，需要做好心理准备" 
                      : "成长速度可能不如预期，需要主动寻找学习机会"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 个性化洞察 */}
          <div className="rounded-[14px] bg-blue-50/50 border border-blue-200/50 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold mb-1">基于你的偏好</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getWeightBasedInsight()}
                </p>
              </div>
            </div>
          </div>

          {/* 你需要特别关注 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              你需要特别关注
            </h4>
            <div className="space-y-2">
              {[
                {
                  text: `${alternative.company} 的汇报关系信息不完整`,
                  type: "info" as const,
                  show: !alternative.reportingLine
                },
                {
                  text: `${recommended.company} 的工作强度预期偏高`,
                  type: "warning" as const,
                  show: recommended.workload === "高"
                },
                {
                  text: "两个机会都需要再核实试用期考核方式",
                  type: "alert" as const,
                  show: true
                }
              ].filter(item => item.show).map((item, index) => (
                <div
                  key={index}
                  className={`
                    rounded-[12px] p-3 text-xs leading-relaxed
                    ${item.type === "warning" ? "bg-orange-50/50 border border-orange-200/50 text-orange-700" :
                      item.type === "alert" ? "bg-red-50/50 border border-red-200/50 text-red-700" :
                      "bg-blue-50/50 border border-blue-200/50 text-blue-700"}
                  `}
                >
                  • {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* 谈薪建议 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              谈薪建议
            </h4>
            <div className="rounded-[14px] bg-green-50/50 border border-green-200/50 p-4">
              <p className="text-xs leading-relaxed text-foreground/80 mb-3">
                如果你倾向选择 <strong>{recommended.company}</strong>，可以优先谈<strong>签字费</strong>、<strong>试用期评估口径</strong>和<strong>绩效系数</strong>，而不必只盯固定月薪。
              </p>
              <div className="flex gap-2">
                <button className="flex-1 h-[32px] rounded-[10px] bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                  进入谈薪助手
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button className="h-[32px] px-3 rounded-[10px] bg-white border border-green-200 hover:bg-green-50 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
                  <Copy className="w-3 h-3" />
                  复制
                </button>
              </div>
            </div>
          </div>

          {/* 底部动作区 */}
          <div className="space-y-2 pt-2">
            <button className="w-full h-[36px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
              <BookmarkPlus className="w-3.5 h-3.5" />
              标记为意向 Offer
            </button>
            <button className="w-full h-[36px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              保存对比结果
            </button>
            <button className="w-full h-[36px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center justify-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              继续补充信息
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 谈薪助手模式
  if (mode === "negotiation") {
    const handleCopyScript = (scriptId: number, text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(scriptId);
      setTimeout(() => setCopiedId(null), 2000);
    };

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-4">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              谈判话术库
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              10+ 条常见场景话术，助你从容应对谈薪过程
            </p>
          </div>

          {/* 话术列表 */}
          <div className="space-y-3">
            {negotiationScripts.slice(0, showAllScripts ? undefined : 5).map((script) => (
              <div
                key={script.id}
                className="rounded-[14px] bg-gradient-to-br from-white to-secondary/30 border border-border p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="text-xs font-semibold text-purple-600">{script.scenario}</h5>
                  <button
                    onClick={() => handleCopyScript(script.id, script.response)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
                  >
                    {copiedId === script.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  {script.response}
                </p>
              </div>
            ))}
          </div>

          {/* 展开/收起按钮 */}
          {!showAllScripts && negotiationScripts.length > 5 && (
            <button
              onClick={() => setShowAllScripts(true)}
              className="w-full h-[36px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium text-muted-foreground"
            >
              查看全部 {negotiationScripts.length} 条话术
            </button>
          )}

          {/* 谈判建议 */}
          <div className="rounded-[14px] bg-yellow-50/50 border border-yellow-200/50 p-4 space-y-3">
            <h5 className="text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-yellow-600" />
              谈判建议
            </h5>
            <ul className="space-y-2 text-xs text-foreground/80 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>保持专业和礼貌，避免情绪化表达</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>用数据和市场行情支撑你的期望</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>不要在第一轮就接受 offer，留出谈判空间</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>关注总包而非单一薪资项，股权和绩效同样重要</span>
              </li>
            </ul>
          </div>

          {/* 不建议踩的坑 */}
          <div className="rounded-[14px] bg-red-50/50 border border-red-200/50 p-4 space-y-3">
            <h5 className="text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              不建议踩的坑
            </h5>
            <ul className="space-y-2 text-xs text-foreground/80 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>虚报当前薪资或其他 offer 的数字</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>过于强势或威胁"不给就不来"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>频繁反复修改期望，显得不专业</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>忽略试用期条款和离职补偿细节</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Offer 详情模式
  if (mode === "detail" && selectedOffers.length > 0) {
    const offer = selectedOffers[0];

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-4">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Offer 解读
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              系统分析这个 Offer 的亮点和风险
            </p>
          </div>

          {/* 主要亮点 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              主要亮点
            </h4>
            <div className="space-y-2">
              {[
                offer.growthPotential === "高" && "业务成长性强，发展空间大",
                offer.teamQuality === "优秀" && "团队质量优秀，学习机会多",
                offer.baseSalary >= 40 && "薪资水平在市场中位数以上",
                offer.bonus && `绩效奖金 ${offer.bonus}，激励机制完善`
              ].filter(Boolean).map((highlight, index) => (
                <div
                  key={index}
                  className="rounded-[12px] bg-green-50/50 border border-green-200/50 p-3 text-xs leading-relaxed text-green-700 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 主要风险 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-600" />
              主要风险
            </h4>
            <div className="space-y-2">
              {[
                offer.workload === "高" && "工作强度较高，可能影响生活平衡",
                !offer.reportingLine && "汇报关系信息不完整，需要进一步确认",
                offer.equity && `股权 ${offer.equity}，需要了解行权价格和归属周期`
              ].filter(Boolean).map((risk, index) => (
                <div
                  key={index}
                  className="rounded-[12px] bg-orange-50/50 border border-orange-200/50 p-3 text-xs leading-relaxed text-orange-700 flex items-start gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 建议加入对比 */}
          <div className="rounded-[14px] bg-purple-50/50 border border-purple-200/50 p-4">
            <h5 className="text-xs font-semibold mb-2">💡 系统建议</h5>
            <p className="text-xs leading-relaxed text-foreground/80 mb-3">
              这个 Offer 质量不错，建议与其他机会对比后再做决定。如果没有其他 Offer，可以考虑谈薪优化。
            </p>
            <button className="w-full h-[32px] rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium">
              加入对比
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 最终建议模式
  if (mode === "recommendation" && selectedOffers.length >= 2) {
    const offerA = selectedOffers[0];
    const offerB = selectedOffers[1];
    const scoreA = systemScore[offerA.id] || 0;
    const scoreB = systemScore[offerB.id] || 0;
    const recommended = scoreA >= scoreB ? offerA : offerB;
    const alternative = scoreA >= scoreB ? offerB : offerA;

    return (
      <div className="flex-1 overflow-y-auto p-5" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,0,0,0.15) transparent'
      }}>
        <div className="space-y-4">
          {/* 头部 */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              最终建议
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              从职业顾问的视角给出决策建议
            </p>
          </div>

          {/* 风险校验清单 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              风险校验清单
            </h4>
            <div className="space-y-2">
              {[
                { item: "试用期考核标准", checked: false },
                { item: "绩效评估体系", checked: false },
                { item: "股权行权细节", checked: false },
                { item: "离职补偿条款", checked: false },
                { item: "加班和调休政策", checked: true }
              ].map((check, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 p-2.5 rounded-[10px] bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={check.checked}
                    className="w-4 h-4 rounded border-border"
                    readOnly
                  />
                  <span className="text-xs">{check.item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 最终确认 */}
          <div className="rounded-[14px] bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 p-4 space-y-3">
            <h5 className="text-xs font-semibold">🎯 准备好做出决定了吗？</h5>
            <p className="text-xs leading-relaxed text-foreground/80">
              确认所有风险项都已核实，你可以放心地选择 <strong>{recommended.company}</strong>。
            </p>
            <button className="w-full h-[40px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              确认选择
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 默认状态
  return (
    <div className="flex-1 overflow-y-auto p-5" style={{ 
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.15) transparent'
    }}>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">选择 Offer 查看详细分析</p>
      </div>
    </div>
  );
}
