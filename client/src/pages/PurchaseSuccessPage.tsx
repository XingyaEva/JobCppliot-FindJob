import { Check, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";

export function PurchaseSuccessPage() {
  // 已开启的权益
  const enabledBenefits = [
    "无限岗位池",
    "无限定向简历版本",
    "无限面试模拟次数",
    "高级 Offer 对比分析",
    "长期记忆系统",
    "Skills 自动化能力",
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <div className="w-full max-w-[640px] flex flex-col items-center gap-10">
        {/* 成功图标 */}
        <div
          className="w-20 h-20 rounded-[20px] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04))",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          <Sparkles className="w-10 h-10 text-green-600" strokeWidth={1.5} />
        </div>

        {/* 主卡片 */}
        <div
          className="w-full rounded-[28px] p-10"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div className="flex flex-col items-center gap-8">
            {/* 标题区 */}
            <div className="flex flex-col items-center gap-3 text-center">
              <h1
                className="text-[28px] text-gray-900 tracking-tight"
                style={{ fontWeight: 450 }}
              >
                升级成功，更多能力已为你开启
              </h1>
              <p
                className="text-[14px] text-gray-500 tracking-wide max-w-[480px]"
                style={{ fontWeight: 400 }}
              >
                现在你可以继续当前任务，所有高级能力已经准备就绪
              </p>
            </div>

            {/* 分隔线 */}
            <div className="w-full h-px bg-gray-100"></div>

            {/* 已开启权益 */}
            <div className="w-full flex flex-col gap-4">
              <span
                className="text-[13px] text-gray-500 tracking-wider uppercase text-center"
                style={{ fontWeight: 400 }}
              >
                已开启的核心权益
              </span>
              <div className="grid grid-cols-2 gap-3">
                {enabledBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-[16px] px-4 py-3"
                    style={{
                      background: "rgba(250, 250, 249, 0.4)",
                      border: "1px solid rgba(229, 229, 227, 0.2)",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(34, 197, 94, 0.08)",
                        border: "1px solid rgba(34, 197, 94, 0.15)",
                      }}
                    >
                      <Check
                        className="w-3 h-3 text-green-600"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      className="text-[13px] text-gray-700 tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="w-full h-px bg-gray-100"></div>

            {/* 建议下一步 */}
            <div
              className="w-full rounded-[20px] px-6 py-5"
              style={{
                background: "rgba(240, 253, 244, 0.3)",
                border: "1px solid rgba(34, 197, 94, 0.12)",
              }}
            >
              <div className="flex flex-col gap-2 text-center">
                <p
                  className="text-[14px] text-gray-700 tracking-wide"
                  style={{ fontWeight: 450 }}
                >
                  建议下一步
                </p>
                <p
                  className="text-[13px] text-gray-600 tracking-wide leading-relaxed"
                  style={{ fontWeight: 400 }}
                >
                  你可以立即返回继续刚才的任务，或前往资产中心查看你的完整权益
                </p>
              </div>
            </div>

            {/* 按钮区 */}
            <div className="w-full flex flex-col gap-3">
              <Link to="/opportunities" className="w-full">
                <Button
                  size="lg"
                  className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
                  style={{ fontWeight: 450 }}
                >
                  返回继续任务
                  <ChevronRight className="w-5 h-5 ml-1" strokeWidth={1.5} />
                </Button>
              </Link>

              <Link to="/assets" className="w-full">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 text-[14px]"
                  style={{ fontWeight: 400 }}
                >
                  查看资产中心
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 底部补充 */}
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-[12px] text-gray-400 tracking-wide"
            style={{ fontWeight: 400 }}
          >
            订阅详情已发送到你的邮箱
          </p>
        </div>
      </div>
    </div>
  );
}
