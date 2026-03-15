import { useState } from "react";
import {
  Check,
  Target,
  FileText,
  MessageSquare,
  Sparkles,
  Brain,
  Zap,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Shield,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { Button } from "../components/ui/button";

export function CheckoutPage() {
  const [selectedPayment, setSelectedPayment] = useState<
    "wechat" | "alipay" | "apple" | null
  >("wechat");
  const [paymentStatus, setPaymentStatus] = useState<
    "normal" | "failed" | "success"
  >("normal");

  // 核心权益
  const benefits = [
    { icon: Target, text: "无限岗位池" },
    { icon: FileText, text: "无限定向简历版本" },
    { icon: MessageSquare, text: "无限面试模拟" },
    { icon: Sparkles, text: "高级 Offer 对比分析" },
    { icon: Brain, text: "长期记忆系统" },
    { icon: Zap, text: "Skills 自动化" },
  ];

  // 支付方式
  const paymentMethods = [
    {
      id: "wechat" as const,
      name: "微信支付",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M8.5 11.5c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
          <path d="M15.5 11.5c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
          <path d="M18 8c0-3.3-3.6-6-8-6S2 4.7 2 8c0 2.2 1.5 4.1 3.7 5.2-.2.7-.5 1.8-.5 1.8s1.3-.4 2.2-.8c.8.2 1.7.3 2.6.3 4.4 0 8-2.7 8-6z" />
          <path d="M18 14c0 2.2-2.4 4-5.3 4-.6 0-1.2-.1-1.8-.2-.6.3-1.5.5-1.5.5s.2-.7.3-1.2C8.3 16.1 7 14.7 7 13c0-2.2 2.4-4 5.3-4 2.5 0 4.6 1.4 5.2 3.2.3.4.5.8.5 1.8z" />
        </svg>
      ),
    },
    {
      id: "alipay" as const,
      name: "支付宝",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 12h18" />
          <path d="M3 6h18" />
          <path d="M3 18h18" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      id: "apple" as const,
      name: "Apple Pay",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      ),
    },
  ];

  const handlePayment = () => {
    // 模拟支付失败
    setPaymentStatus("failed");
  };

  const handleRetry = () => {
    setPaymentStatus("normal");
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <div className="w-full max-w-[1080px] py-12">
        {/* 左右分栏布局 */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-8">
          {/* 左侧：订单与权益摘要 */}
          <div className="flex flex-col gap-8">
            {/* 标题 */}
            <div className="flex flex-col gap-2">
              <h1
                className="text-[28px] text-gray-900 tracking-tight"
                style={{ fontWeight: 450 }}
              >
                确认你的订阅方案
              </h1>
              <p
                className="text-[14px] text-gray-500 tracking-wide"
                style={{ fontWeight: 400 }}
              >
                确认后即可开启高级能力
              </p>
            </div>

            {/* 方案摘要卡 */}
            <div
              className="rounded-[24px] p-8"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(229, 229, 227, 0.25)",
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
              }}
            >
              <div className="flex flex-col gap-6">
                {/* 方案名称和价格 */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div
                      className="rounded-[999px] px-4 py-1.5 inline-flex"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.02))",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                        width: "fit-content",
                      }}
                    >
                      <span
                        className="text-[13px] text-gray-900 tracking-wider"
                        style={{ fontWeight: 450 }}
                      >
                        年度会员
                      </span>
                    </div>
                    <h2
                      className="text-[24px] text-gray-900 tracking-tight"
                      style={{ fontWeight: 450 }}
                    >
                      高级版订阅
                    </h2>
                    <p
                      className="text-[13px] text-gray-500 tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      2026.03.11 - 2027.03.11
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-[32px] text-gray-900 tracking-tight"
                        style={{ fontWeight: 450 }}
                      >
                        ¥599
                      </span>
                      <span
                        className="text-[14px] text-gray-500"
                        style={{ fontWeight: 400 }}
                      >
                        /年
                      </span>
                    </div>
                    <span
                      className="text-[12px] text-gray-400 tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      平均 ¥50/月
                    </span>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="h-px bg-gray-100"></div>

                {/* 核心权益 */}
                <div className="flex flex-col gap-4">
                  <span
                    className="text-[13px] text-gray-500 tracking-wider uppercase"
                    style={{ fontWeight: 400 }}
                  >
                    本次开启的核心权益
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {benefits.map((benefit, idx) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "rgba(250, 250, 249, 0.6)",
                              border: "1px solid rgba(229, 229, 227, 0.25)",
                            }}
                          >
                            <Icon
                              className="w-[18px] h-[18px] text-gray-600"
                              strokeWidth={1.5}
                            />
                          </div>
                          <span
                            className="text-[14px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 400 }}
                          >
                            {benefit.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 任务恢复提示 */}
            <div
              className="rounded-[20px] px-6 py-5"
              style={{
                background: "rgba(240, 253, 244, 0.3)",
                border: "1px solid rgba(34, 197, 94, 0.12)",
              }}
            >
              <div className="flex items-start gap-3">
                <Check
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div className="flex flex-col gap-1">
                  <p
                    className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
                    style={{ fontWeight: 400 }}
                  >
                    购买成功后，你可以立即继续当前任务，不需要重新开始。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：支付与确认区 */}
          <div className="flex flex-col gap-6">
            {/* 支付失败提示 */}
            {paymentStatus === "failed" && (
              <div
                className="rounded-[20px] px-6 py-5"
                style={{
                  background: "rgba(254, 242, 242, 0.3)",
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-[14px] text-gray-700 tracking-wide"
                      style={{ fontWeight: 450 }}
                    >
                      支付未完成
                    </p>
                    <p
                      className="text-[13px] text-gray-600 tracking-wide leading-relaxed"
                      style={{ fontWeight: 400 }}
                    >
                      你可以重新尝试，当前选择的方案仍已保留。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 应付金额卡片 */}
            <div
              className="rounded-[24px] p-8"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(229, 229, 227, 0.25)",
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
              }}
            >
              <div className="flex flex-col gap-8">
                {/* 应付金额 */}
                <div className="flex flex-col gap-3">
                  <span
                    className="text-[13px] text-gray-500 tracking-wider uppercase"
                    style={{ fontWeight: 400 }}
                  >
                    应付金额
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[36px] text-gray-900 tracking-tight"
                      style={{ fontWeight: 450 }}
                    >
                      ¥599
                    </span>
                    <span
                      className="text-[15px] text-gray-500"
                      style={{ fontWeight: 400 }}
                    >
                      年度订阅
                    </span>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="h-px bg-gray-100"></div>

                {/* 支付方式 */}
                <div className="flex flex-col gap-4">
                  <span
                    className="text-[13px] text-gray-500 tracking-wider uppercase"
                    style={{ fontWeight: 400 }}
                  >
                    支付方式
                  </span>
                  <div className="flex flex-col gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className="flex items-center justify-between rounded-[16px] px-5 py-4 transition-all"
                        style={{
                          background:
                            selectedPayment === method.id
                              ? "rgba(0, 0, 0, 0.04)"
                              : "rgba(250, 250, 249, 0.4)",
                          border:
                            selectedPayment === method.id
                              ? "1.5px solid rgba(0, 0, 0, 0.12)"
                              : "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-600">{method.icon}</div>
                          <span
                            className="text-[14px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 400 }}
                          >
                            {method.name}
                          </span>
                        </div>
                        {selectedPayment === method.id && (
                          <Check
                            className="w-5 h-5 text-gray-900"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 确认支付按钮 */}
                {paymentStatus === "normal" && (
                  <Button
                    onClick={handlePayment}
                    size="lg"
                    className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
                    style={{ fontWeight: 450 }}
                  >
                    确认支付
                    <ChevronRight className="w-5 h-5 ml-1" strokeWidth={1.5} />
                  </Button>
                )}

                {/* 失败状态按钮 */}
                {paymentStatus === "failed" && (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleRetry}
                      size="lg"
                      className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
                      style={{ fontWeight: 450 }}
                    >
                      <RefreshCw
                        className="w-5 h-5 mr-2"
                        strokeWidth={1.5}
                      />
                      重新支付
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 text-[14px]"
                      style={{ fontWeight: 400 }}
                    >
                      更换支付方式
                    </Button>
                  </div>
                )}

                {/* 补充说明 */}
                <div className="flex flex-col gap-3 pt-2">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                    <span
                      className="text-[12px] tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      自动续费说明
                    </span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    <span
                      className="text-[12px] tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      退款规则
                    </span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                    <span
                      className="text-[12px] tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      订阅协议
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 安全提示 */}
            <div
              className="rounded-[16px] px-5 py-4"
              style={{
                background: "rgba(250, 250, 249, 0.3)",
                border: "1px solid rgba(229, 229, 227, 0.2)",
              }}
            >
              <div className="flex items-center gap-3">
                <Shield
                  className="w-4 h-4 text-gray-500 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <p
                  className="text-[12px] text-gray-500 tracking-wide"
                  style={{ fontWeight: 400 }}
                >
                  支付过程由第三方安全保障，FindJob 不会保存你的支付信息
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
