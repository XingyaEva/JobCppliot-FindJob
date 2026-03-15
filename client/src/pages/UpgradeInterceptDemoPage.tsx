import { useState } from "react";
import {
  UpgradeInterceptModal,
  UpgradeScenario,
} from "../components/UpgradeInterceptModal";
import { Button } from "../components/ui/button";
import {
  Target,
  FileText,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

export function UpgradeInterceptDemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentScenario, setCurrentScenario] =
    useState<UpgradeScenario>("job-pool");

  const scenarios: Array<{
    id: UpgradeScenario;
    name: string;
    icon: typeof Target;
    description: string;
  }> = [
    {
      id: "job-pool",
      name: "岗位池达到上限",
      icon: Target,
      description: "已保存 10 个岗位，无法继续添加",
    },
    {
      id: "resume-version",
      name: "简历版本达到上限",
      icon: FileText,
      description: "已创建 3 个简历版本，无法继续创建",
    },
    {
      id: "interview-mock",
      name: "面试模拟次数用完",
      icon: MessageSquare,
      description: "本月已使用 3 次面试模拟，无法继续",
    },
    {
      id: "advanced-analysis",
      name: "高级分析额度不足",
      icon: Sparkles,
      description: "本月高级分析额度已用完",
    },
    {
      id: "skill-automation",
      name: "Skill 自动化达到上限",
      icon: Zap,
      description: "已启用所有可用的 Skill 自动化名额",
    },
  ];

  const handleOpenModal = (scenario: UpgradeScenario) => {
    setCurrentScenario(scenario);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[1120px] flex flex-col gap-8 py-12">
        {/* 页面标题 */}
        <div className="flex flex-col gap-2">
          <h1
            className="text-[28px] text-gray-900 tracking-tight"
            style={{ fontWeight: 450 }}
          >
            权益不足拦截页演示
          </h1>
          <p
            className="text-[14px] text-gray-500 tracking-wide"
            style={{ fontWeight: 400 }}
          >
            点击下方任意场景，查看对应的拦截弹层效果
          </p>
        </div>

        {/* 场景卡片列表 */}
        <div className="grid grid-cols-2 gap-5">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <div
                key={scenario.id}
                className="rounded-[24px] p-6 cursor-pointer transition-all hover:shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(229, 229, 227, 0.25)",
                  boxShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
                }}
                onClick={() => handleOpenModal(scenario.id)}
              >
                <div className="flex flex-col gap-4">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                    style={{
                      background: "rgba(250, 250, 249, 0.6)",
                      border: "1px solid rgba(229, 229, 227, 0.25)",
                    }}
                  >
                    <Icon
                      className="w-6 h-6 text-gray-600"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3
                      className="text-[16px] text-gray-900 tracking-wide"
                      style={{ fontWeight: 450 }}
                    >
                      {scenario.name}
                    </h3>
                    <p
                      className="text-[14px] text-gray-500 tracking-wide leading-relaxed"
                      style={{ fontWeight: 400 }}
                    >
                      {scenario.description}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-[14px] text-gray-600 hover:text-gray-900"
                    style={{ fontWeight: 400 }}
                  >
                    查看拦截效果
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 说明区 */}
        <div
          className="rounded-[20px] px-6 py-5"
          style={{
            background: "rgba(240, 253, 244, 0.3)",
            border: "1px solid rgba(34, 197, 94, 0.12)",
          }}
        >
          <div className="flex flex-col gap-2">
            <p
              className="text-[14px] text-gray-700 tracking-wide"
              style={{ fontWeight: 450 }}
            >
              设计理念
            </p>
            <p
              className="text-[13px] text-gray-600 tracking-wide leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              这不是粗暴的付费墙，而是"当前动作的自然升级承接页"。每个拦截场景都围绕用户正在执行的具体动作来表达，让用户理解为什么此刻升级是合理的。
            </p>
          </div>
        </div>
      </div>

      {/* 拦截弹层 */}
      {showModal && (
        <UpgradeInterceptModal
          scenario={currentScenario}
          onClose={() => setShowModal(false)}
          onUpgrade={() => {
            console.log("用户点击了升级会员");
            setShowModal(false);
            // 这里可以跳转到会员页或收银台
          }}
        />
      )}
    </div>
  );
}
