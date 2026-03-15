import {
  Target,
  FileText,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Brain,
  Zap,
  Users,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";

export function MembershipPage() {
  // 权益对比数据
  const features = [
    {
      category: "岗位管理",
      icon: Target,
      items: [
        {
          name: "岗位池数量",
          free: "最多 10 个",
          premium: "无限制",
        },
        {
          name: "高级匹配分析",
          free: false,
          premium: true,
        },
      ],
    },
    {
      category: "简历优化",
      icon: FileText,
      items: [
        {
          name: "定向简历版本数",
          free: "最多 3 个",
          premium: "无限制",
        },
        {
          name: "智能优化建议",
          free: "基础版",
          premium: "深度分析版",
        },
      ],
    },
    {
      category: "面试准备",
      icon: MessageSquare,
      items: [
        {
          name: "面试模拟",
          free: "每月 3 次",
          premium: "无限制",
        },
        {
          name: "面试记录分析",
          free: false,
          premium: true,
        },
      ],
    },
    {
      category: "决策系统",
      icon: Sparkles,
      items: [
        {
          name: "Offer 对比分析",
          free: "最多 2 个",
          premium: "无限制",
        },
        {
          name: "长期职业规划",
          free: false,
          premium: true,
        },
      ],
    },
    {
      category: "成长陪伴",
      icon: TrendingUp,
      items: [
        {
          name: "成长陪伴师",
          free: "标准模式",
          premium: "高级模式",
        },
        {
          name: "长期记忆",
          free: false,
          premium: true,
        },
        {
          name: "Skills 自动化",
          free: false,
          premium: true,
        },
      ],
    },
  ];

  // 使用场景
  const scenarios = [
    {
      title: "当你开始同时推进多个岗位时",
      description: "可以建立更完整的岗位池，做更深入的岗位比较和筛选。",
      icon: Target,
    },
    {
      title: "当你需要针对不同岗位改简历时",
      description: "保存更多定向版本，追踪优化效果。",
      icon: FileText,
    },
    {
      title: "当你进入面试密集阶段时",
      description: "做模拟训练，持续沉淀复盘记录。",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[1120px] flex flex-col gap-12 py-12">
        {/* 模块1：顶部标题区 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <h1
            className="text-[32px] text-gray-900 tracking-tight"
            style={{ fontWeight: 450 }}
          >
            升级你的求职系统能力
          </h1>
          <p
            className="text-[15px] text-gray-500 tracking-wide max-w-[640px] leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            当你开始持续管理岗位、简历、面试和成长计划时，高级能力会明显提速。
          </p>
        </div>

        {/* 模块2：核心权益对比区 */}
        <div
          className="rounded-[28px] p-10"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
          }}
        >
          <div className="flex flex-col gap-8">
            {/* 对比表头 */}
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-8 pb-6 border-b border-gray-100">
              <div></div>
              <div className="flex flex-col items-center gap-2">
                <span
                  className="text-[14px] text-gray-500 tracking-wider uppercase"
                  style={{ fontWeight: 400 }}
                >
                  免费版
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="rounded-[12px] px-4 py-1.5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.02))",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <span
                    className="text-[14px] text-gray-900 tracking-wider uppercase"
                    style={{ fontWeight: 450 }}
                  >
                    高级版
                  </span>
                </div>
              </div>
            </div>

            {/* 权益列表 */}
            <div className="flex flex-col gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="flex flex-col gap-5">
                    {/* 分类标题 */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center"
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
                        className="text-[15px] text-gray-900 tracking-wide"
                        style={{ fontWeight: 450 }}
                      >
                        {feature.category}
                      </span>
                    </div>

                    {/* 权益项对比 */}
                    <div className="flex flex-col gap-3">
                      {feature.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="grid grid-cols-[2fr_1fr_1fr] gap-8 items-center"
                        >
                          <span
                            className="text-[14px] text-gray-600 tracking-wide"
                            style={{ fontWeight: 400 }}
                          >
                            {item.name}
                          </span>

                          {/* 免费版 */}
                          <div className="flex justify-center">
                            {typeof item.free === "boolean" ? (
                              item.free ? (
                                <Check
                                  className="w-5 h-5 text-gray-400"
                                  strokeWidth={2}
                                />
                              ) : (
                                <X
                                  className="w-5 h-5 text-gray-300"
                                  strokeWidth={2}
                                />
                              )
                            ) : (
                              <span
                                className="text-[13px] text-gray-500 tracking-wide"
                                style={{ fontWeight: 400 }}
                              >
                                {item.free}
                              </span>
                            )}
                          </div>

                          {/* 高级版 */}
                          <div className="flex justify-center">
                            {typeof item.premium === "boolean" ? (
                              item.premium ? (
                                <Check
                                  className="w-5 h-5 text-gray-900"
                                  strokeWidth={2}
                                />
                              ) : (
                                <X
                                  className="w-5 h-5 text-gray-300"
                                  strokeWidth={2}
                                />
                              )
                            ) : (
                              <span
                                className="text-[13px] text-gray-900 tracking-wide"
                                style={{ fontWeight: 450 }}
                              >
                                {item.premium}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 模块3：真实使用场景区 */}
        <div className="flex flex-col gap-6">
          <h2
            className="text-[18px] text-gray-900 tracking-tight text-center"
            style={{ fontWeight: 450 }}
          >
            在不同阶段的价值
          </h2>

          <div className="grid grid-cols-3 gap-5">
            {scenarios.map((scenario, idx) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={idx}
                  className="rounded-[20px] p-6"
                  style={{
                    background: "rgba(255, 255, 255, 0.5)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(229, 229, 227, 0.2)",
                    boxShadow:
                      "0 2px 16px rgba(0, 0, 0, 0.01), 0 0 1px rgba(0, 0, 0, 0.01)",
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                      style={{
                        background: "rgba(250, 250, 249, 0.6)",
                        border: "1px solid rgba(229, 229, 227, 0.25)",
                      }}
                    >
                      <Icon
                        className="w-5 h-5 text-gray-600"
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <h3
                        className="text-[14px] text-gray-900 tracking-wide leading-snug"
                        style={{ fontWeight: 450 }}
                      >
                        {scenario.title}
                      </h3>
                      <p
                        className="text-[13px] text-gray-500 tracking-wide leading-relaxed"
                        style={{ fontWeight: 400 }}
                      >
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 模块4：底部行动区 */}
        <div className="flex flex-col items-center gap-8 pt-4">
          {/* 主按钮 */}
          <Link to="/subscription-plans">
            <Button
              size="lg"
              className="h-[48px] px-8 rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[14px]"
              style={{ fontWeight: 450 }}
            >
              查看订阅方案
              <ChevronRight className="w-5 h-5 ml-1" strokeWidth={1.5} />
            </Button>
          </Link>

          {/* 辅助信息 */}
          <div className="grid grid-cols-3 gap-8">
            <button className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <HelpCircle className="w-4 h-4" strokeWidth={1.5} />
              <span
                className="text-[13px] tracking-wide"
                style={{ fontWeight: 400 }}
              >
                常见问题
              </span>
            </button>

            <button className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              <span
                className="text-[13px] tracking-wide"
                style={{ fontWeight: 400 }}
              >
                自动续费说明
              </span>
            </button>

            <button className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Shield className="w-4 h-4" strokeWidth={1.5} />
              <span
                className="text-[13px] tracking-wide"
                style={{ fontWeight: 400 }}
              >
                退款规则
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}