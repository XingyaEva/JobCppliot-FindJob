import { X, Zap, Check, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";

export type UpgradeScenario =
  | "job-pool"
  | "resume-version"
  | "interview-mock"
  | "advanced-analysis"
  | "skill-automation";

interface UpgradeInterceptModalProps {
  scenario: UpgradeScenario;
  onClose: () => void;
  onUpgrade?: () => void;
}

const scenarioConfig: Record<
  UpgradeScenario,
  {
    title: string;
    description: string;
    currentStatus: string;
    benefits: string[];
  }
> = {
  "job-pool": {
    title: "当前额度已用尽",
    description:
      "你已保存 10 个岗位。升级会员后可继续建立更完整的岗位池，并做更深入的筛选与比较。",
    currentStatus: "已使用 10/10 个岗位池名额",
    benefits: [
      "继续保存岗位，不中断求职进程",
      "建立更完整的岗位对比池",
      "获得高级岗位匹配分析能力",
    ],
  },
  "resume-version": {
    title: "当前额度已用尽",
    description:
      "你已创建 3 个定向简历版本。升级后可继续保存更多岗位专属版本，并追踪匹配变化。",
    currentStatus: "已使用 3/3 个简历版本名额",
    benefits: [
      "继续创建简历版本，不中断投递准备",
      "为每个岗位定制专属简历",
      "追踪不同版本的优化效果",
    ],
  },
  "interview-mock": {
    title: "当前额度已用尽",
    description:
      "本月面试模拟次数已用完。升级后可继续完整训练，并沉淀更多复盘记录。",
    currentStatus: "本月已使用 3/3 次面试模拟",
    benefits: [
      "继续面试训练，不中断准备节奏",
      "沉淀更多面试复盘记录",
      "获得更完整的面试分析能力",
    ],
  },
  "advanced-analysis": {
    title: "当前额度已用尽",
    description:
      "本月高级分析额度已用完。升级后可获得无限次深度分析，并建立长期记忆系统。",
    currentStatus: "本月已使用完高级分析额度",
    benefits: [
      "继续使用高级分析，不中断决策",
      "获得更深入的匹配与对比能力",
      "建立完整的长期记忆系统",
    ],
  },
  "skill-automation": {
    title: "当前额度已用尽",
    description:
      "你已启用当前可用的自动化 Skill 数量。升级后可继续配置长期训练与提醒。",
    currentStatus: "已启用所有可用的 Skill 自动化名额",
    benefits: [
      "继续配置 Skill，不中断成长计划",
      "建立更完整的自动化训练体系",
      "获得长期记忆与提醒能力",
    ],
  },
};

export function UpgradeInterceptModal({
  scenario,
  onClose,
  onUpgrade,
}: UpgradeInterceptModalProps) {
  const config = scenarioConfig[scenario];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // 默认跳转到会员页
      window.location.href = "/membership";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* 主弹层 */}
      <div
        className="relative w-full max-w-[560px] mx-4 rounded-[28px] p-10"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(229, 229, 227, 0.3)",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.02)",
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-[12px] flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
        </button>

        <div className="flex flex-col gap-8">
          {/* 模块1：标题 */}
          <div className="flex flex-col gap-3">
            <div
              className="w-14 h-14 rounded-[16px] flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.02))",
                border: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <Zap className="w-7 h-7 text-gray-600" strokeWidth={1.5} />
            </div>

            <h2
              className="text-[24px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              {config.title}
            </h2>

            {/* 当前状态标签 */}
            <div
              className="rounded-[999px] px-4 py-2 inline-flex items-center gap-2"
              style={{
                background: "rgba(245, 245, 244, 0.6)",
                border: "1px solid rgba(229, 229, 227, 0.3)",
                width: "fit-content",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <span
                className="text-[13px] text-gray-600 tracking-wide"
                style={{ fontWeight: 400 }}
              >
                {config.currentStatus}
              </span>
            </div>
          </div>

          {/* 模块2：动态说明区 */}
          <div
            className="rounded-[20px] px-6 py-5"
            style={{
              background: "rgba(250, 250, 249, 0.4)",
              border: "1px solid rgba(229, 229, 227, 0.2)",
            }}
          >
            <p
              className="text-[15px] text-gray-700 tracking-wide leading-relaxed"
              style={{ fontWeight: 400 }}
            >
              {config.description}
            </p>
          </div>

          {/* 模块3：升级收益摘要 */}
          <div className="flex flex-col gap-4">
            <span
              className="text-[13px] text-gray-500 tracking-wider uppercase"
              style={{ fontWeight: 400 }}
            >
              升级后可以
            </span>
            <div className="flex flex-col gap-3">
              {config.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
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
                    className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
                    style={{ fontWeight: 400 }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gray-100"></div>

          {/* 模块4：按钮区 */}
          <div className="flex flex-col gap-4">
            {/* 主按钮 */}
            <Button
              onClick={handleUpgrade}
              size="lg"
              className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
              style={{ fontWeight: 450 }}
            >
              升级会员
              <ChevronRight className="w-5 h-5 ml-1" strokeWidth={1.5} />
            </Button>

            {/* 次按钮 */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="lg"
              className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 text-[14px]"
              style={{ fontWeight: 400 }}
            >
              稍后再说
            </Button>

            {/* 次级文字入口 */}
            <Link
              to="/membership"
              className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
              onClick={onClose}
            >
              <span
                className="text-[13px] tracking-wide"
                style={{ fontWeight: 400 }}
              >
                查看权益详情
              </span>
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
