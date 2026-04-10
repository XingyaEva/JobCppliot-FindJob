/**
 * DecisionsPage — 决策中心
 *
 * A5 API 接入版本:
 * - 投递记录通过 useApplications() 从后端获取
 * - 新增 Offer 通过 useCreateApplication()
 * - 更新状态通过 useUpdateApplicationStatus()
 * - 统计通过 useApplicationStats()
 * - 子组件仍使用 mock 数据 (后续逐步接入)
 */
import { useState, useMemo } from "react";
import { Search, Plus, Sparkles, Loader2 } from "lucide-react";
import { DecisionsLeftColumn, type Offer } from "../components/DecisionsLeftColumn";
import { DecisionsMiddleColumn } from "../components/DecisionsMiddleColumn";
import { DecisionsRightColumn } from "../components/DecisionsRightColumn";
import {
  useApplications,
  useApplicationStats,
  useCreateApplication,
  useUpdateApplicationStatus,
} from "../hooks";
import { toast } from "sonner";
import { useGuestCheck } from "../hooks/useGuestCheck";
import { useQuotaCheck } from "../hooks/useQuotaCheck";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { UpgradeInterceptModal } from "../components/UpgradeInterceptModal";

export function DecisionsPage() {
  // 选中的 Offer
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  
  // 对比中的 Offers（最多3个）
  const [selectedOffers, setSelectedOffers] = useState<Offer[]>([]);
  
  // 当前子模块
  const [activeModule, setActiveModule] = useState<"list" | "comparison" | "negotiation" | "recommendation">("comparison");
  
  // 决策权重
  const [weights, setWeights] = useState({
    income: 30,
    growth: 35,
    city: 15,
    balance: 20
  });

  // 薪资隐藏模式
  const [hideMode, setHideMode] = useState(false);

  // 系统评分（模拟）
  const [systemScore, setSystemScore] = useState<{ [offerId: number]: number }>({
    1: 8.2,
    2: 7.8,
    3: 8.5,
    4: 7.2,
    5: 7.9
  });

  // 游客检查 & 额度检查
  const { checkGuest, showLoginPrompt, setShowLoginPrompt, loginScenario } = useGuestCheck();
  const { checkQuota, showUpgradeModal, setShowUpgradeModal, upgradeScenario } = useQuotaCheck();

  // === A5 API Integration ===
  const { data: applicationsData, isLoading: appsLoading } = useApplications({ status: 'offer' });
  const { data: statsData } = useApplicationStats();
  const createApplication = useCreateApplication();

  // 当后端有 offer 状态的投递记录时，可以在此合并
  // 目前子组件仍使用内部 mock 数据，后续逐步传递 API 数据
  const apiOfferCount = useMemo(() => {
    const apps = (applicationsData as any)?.applications ?? [];
    return apps.filter((a: any) => a.status === 'offer').length;
  }, [applicationsData]);

  // 子模块配置
  const modules = [
    { id: "list" as const, label: "Offer 列表" },
    { id: "comparison" as const, label: "Offer 对比" },
    { id: "negotiation" as const, label: "谈薪助手" },
    { id: "recommendation" as const, label: "选择建议" }
  ];

  // 处理 Offer 选择
  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    
    // 如果在对比模式，自动添加到对比列表（最多3个）
    if (activeModule === "comparison") {
      if (!selectedOffers.find(o => o.id === offer.id)) {
        if (selectedOffers.length < 3) {
          setSelectedOffers([...selectedOffers, offer]);
        } else {
          // 替换最后一个
          setSelectedOffers([...selectedOffers.slice(0, 2), offer]);
        }
      }
    }
  };

  // 处理新增 Offer（先检查登录）
  const handleNewOffer = async () => {
    if (!checkGuest('save-decision')) return;
    try {
      await createApplication.mutateAsync({
        company: "新公司",
        position: "新岗位",
        status: "offer",
      });
      toast.success("Offer 已添加");
    } catch {
      toast.error("添加失败");
    }
  };

  // 确定中栏模式
  const getMiddleMode = (): "empty" | "comparison" | "detail" | "negotiation" | "recommendation" => {
    if (selectedOffers.length === 0 && !selectedOffer) {
      return "empty";
    }
    
    if (activeModule === "list") {
      return "detail";
    } else if (activeModule === "negotiation") {
      return "negotiation";
    } else if (activeModule === "recommendation") {
      return "recommendation";
    }
    
    return "comparison";
  };

  // 确定右栏模式
  const getRightMode = (): "empty" | "comparison" | "detail" | "negotiation" | "recommendation" => {
    return getMiddleMode();
  };

  return (
    <div className="h-full flex flex-col bg-background -m-8">
      {/* 页面标题区 */}
      <div className="flex-shrink-0 px-7 pt-7 pb-5">
        <h1 className="text-3xl font-semibold mb-2">决策</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          把 Offer、谈薪和职业选择，组织成一套更清晰、更不慌乱的判断系统。
        </p>
      </div>

      {/* 顶部工具条 */}
      <div className="flex-shrink-0 px-7 pb-5">
        <div className="flex items-center justify-between">
          {/* 左侧：搜索 + 子模块切换 */}
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索 Offer、公司、岗位"
                className="w-[280px] h-[44px] pl-10 pr-4 bg-card rounded-[14px] border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* 子模块切换胶囊 */}
            <div className="flex items-center gap-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`
                    h-[34px] px-3.5 rounded-[999px] text-xs font-medium transition-all
                    ${activeModule === module.id
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  {module.label}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewOffer}
              className="h-[44px] px-4 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增 Offer
            </button>
            <button
              onClick={() => setActiveModule("comparison")}
              className="h-[44px] px-4 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              开始对比
            </button>
            <button
              onClick={() => setActiveModule("negotiation")}
              className="h-[44px] px-4 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              谈薪准备
            </button>
          </div>
        </div>
      </div>

      {/* 三栏主体布局 */}
      <div className="flex-1 overflow-hidden px-7 pb-6">
        <div className="h-full flex gap-5">
          {/* 左栏：Offer 列表 */}
          <DecisionsLeftColumn
            selectedOffer={selectedOffer}
            onSelectOffer={handleSelectOffer}
            onNewOffer={handleNewOffer}
          />

          {/* 中栏：动态内容 */}
          <DecisionsMiddleColumn
            mode={getMiddleMode()}
            selectedOffers={activeModule === "list" && selectedOffer ? [selectedOffer] : selectedOffers}
            weights={weights}
            onWeightChange={setWeights}
            onAddOffer={handleNewOffer}
            hideMode={hideMode}
            onToggleHideMode={() => setHideMode(!hideMode)}
          />

          {/* 右栏：系统建议 */}
          <DecisionsRightColumn
            mode={getRightMode()}
            selectedOffers={activeModule === "list" && selectedOffer ? [selectedOffer] : selectedOffers}
            systemScore={systemScore}
            weights={weights}
          />
          {/* 登录拦截弹层 */}
          {showLoginPrompt && (
            <LoginPromptModal
              scenario={loginScenario}
              onClose={() => setShowLoginPrompt(false)}
            />
          )}

          {/* 额度拦截弹层 */}
          {showUpgradeModal && (
            <UpgradeInterceptModal
              scenario={upgradeScenario}
              onClose={() => setShowUpgradeModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
