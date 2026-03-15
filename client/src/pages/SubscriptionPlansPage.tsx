import { Check, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { useState } from "react";

export function SubscriptionPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "annual">("annual");

  const plans = [
    {
      id: "monthly" as const,
      name: "月度订阅",
      price: 79,
      unit: "月",
      avgCost: "¥79/月",
      suitable: "短期求职冲刺",
      badge: null,
    },
    {
      id: "quarterly" as const,
      name: "季度订阅",
      price: 199,
      unit: "季",
      avgCost: "¥66/月",
      suitable: "系统化求职准备",
      badge: null,
    },
    {
      id: "annual" as const,
      name: "年度订阅",
      price: 599,
      unit: "年",
      avgCost: "¥50/月",
      suitable: "长期职业发展",
      badge: "推荐",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[1120px] flex flex-col gap-12 py-12">
        {/* 页面标题 */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className="text-[28px] text-gray-900 tracking-tight"
            style={{ fontWeight: 450 }}
          >
            选择适合你的订阅方案
          </h1>
          <p
            className="text-[14px] text-gray-500 tracking-wide max-w-[560px]"
            style={{ fontWeight: 400 }}
          >
            所有方案均享有完整的高级能力，按需选择订阅周期即可
          </p>
        </div>

        {/* 三张方案卡 */}
        <div className="grid grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[24px] p-8 cursor-pointer transition-all ${
                selectedPlan === plan.id ? "ring-2 ring-gray-900" : ""
              }`}
              style={{
                background:
                  selectedPlan === plan.id
                    ? "rgba(255, 255, 255, 0.95)"
                    : "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
                border:
                  selectedPlan === plan.id
                    ? "1px solid rgba(0, 0, 0, 0.12)"
                    : "1px solid rgba(229, 229, 227, 0.25)",
                boxShadow:
                  selectedPlan === plan.id
                    ? "0 8px 32px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.02)"
                    : "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
              }}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="flex flex-col gap-6">
                {/* 推荐标签 */}
                {plan.badge && (
                  <div
                    className="rounded-[999px] px-3 py-1.5 inline-flex self-start"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.04))",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <span
                      className="text-[12px] text-gray-900 tracking-wider"
                      style={{ fontWeight: 450 }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* 方案名称 */}
                <div className="flex flex-col gap-2">
                  <h3
                    className="text-[20px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="text-[13px] text-gray-500 tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    {plan.suitable}
                  </p>
                </div>

                {/* 价格 */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-[36px] text-gray-900 tracking-tight"
                      style={{ fontWeight: 450 }}
                    >
                      ¥{plan.price}
                    </span>
                    <span
                      className="text-[14px] text-gray-500"
                      style={{ fontWeight: 400 }}
                    >
                      /{plan.unit}
                    </span>
                  </div>
                  <span
                    className="text-[12px] text-gray-400 tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    {plan.avgCost}
                  </span>
                </div>

                {/* 分隔线 */}
                <div className="h-px bg-gray-100"></div>

                {/* 核心权益 */}
                <div className="flex flex-col gap-3">
                  {[
                    "无限岗位池",
                    "无限简历版本",
                    "无限面试模拟",
                    "高级分析能力",
                    "长期记忆系统",
                    "Skills 自动化",
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check
                        className="w-4 h-4 text-gray-600 flex-shrink-0"
                        strokeWidth={2}
                      />
                      <span
                        className="text-[13px] text-gray-700 tracking-wide"
                        style={{ fontWeight: 400 }}
                      >
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 选择按钮 */}
                <Button
                  size="lg"
                  className={`w-full h-[48px] rounded-[16px] text-[14px] ${
                    selectedPlan === plan.id
                      ? "bg-gray-900 hover:bg-gray-800 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  style={{ fontWeight: 450 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                >
                  {selectedPlan === plan.id ? "已选择" : "选择方案"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 底部行动区 */}
        <div className="flex flex-col items-center gap-6">
          <Link to="/checkout">
            <Button
              size="lg"
              className="h-[52px] px-10 rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
              style={{ fontWeight: 450 }}
            >
              继续支付
              <ChevronRight className="w-5 h-5 ml-1" strokeWidth={1.5} />
            </Button>
          </Link>

          {/* 补充说明 */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-6 text-[13px] text-gray-500">
              <button className="hover:text-gray-900 transition-colors">
                自动续费说明
              </button>
              <span>·</span>
              <button className="hover:text-gray-900 transition-colors">
                退款规则
              </button>
              <span>·</span>
              <button className="hover:text-gray-900 transition-colors">
                常见问题
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
