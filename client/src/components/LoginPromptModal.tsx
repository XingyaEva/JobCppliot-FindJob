import { Lock, LogIn, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export type LoginScenario = 
  | 'save-job' 
  | 'save-resume' 
  | 'start-interview' 
  | 'save-decision' 
  | 'access-growth';

interface LoginPromptModalProps {
  scenario: LoginScenario;
  onClose: () => void;
  onLogin?: () => void;
}

const scenarioConfig: Record<LoginScenario, {
  icon: typeof Lock;
  title: string;
  description: string;
  benefits: string[];
  cta: string;
}> = {
  'save-job': {
    icon: Lock,
    title: '登录后保存岗位',
    description: '建立你的专属岗位池，随时同步和管理',
    benefits: [
      '自动同步到所有设备',
      '永久保存不丢失',
      '智能分类和标签',
    ],
    cta: '登录并保存',
  },
  'save-resume': {
    icon: Lock,
    title: '登录后保存简历',
    description: '建立多版本简历，针对不同岗位快速调整',
    benefits: [
      '云端安全存储',
      '多版本管理',
      'AI 优化建议',
    ],
    cta: '登录并保存',
  },
  'start-interview': {
    icon: Lock,
    title: '登录后开始训练',
    description: '记录你的面试训练历史，持续优化表现',
    benefits: [
      '训练记录永久保存',
      '针对性改进建议',
      '成长轨迹可视化',
    ],
    cta: '登录并开始',
  },
  'save-decision': {
    icon: Lock,
    title: '登录后保存决策',
    description: '记录你的 Offer 决策思考，未来可回顾',
    benefits: [
      '决策历史存档',
      '对比分析工具',
      '经验沉淀积累',
    ],
    cta: '登录并保存',
  },
  'access-growth': {
    icon: Lock,
    title: '登录查看成长数据',
    description: '查看你的求职成长轨迹和能力提升',
    benefits: [
      '完整成长档案',
      '数据可视化分析',
      '个性化建议',
    ],
    cta: '登录查看',
  },
};

export function LoginPromptModal({ scenario, onClose, onLogin }: LoginPromptModalProps) {
  const navigate = useNavigate();
  const config = scenarioConfig[scenario];
  const Icon = config.icon;

  const handleLogin = () => {
    onClose();
    onLogin?.();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 弹层卡片 */}
      <div
        className="relative w-full max-w-[480px] mx-4 rounded-[28px] p-10 animate-in zoom-in-95 fade-in duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(229, 229, 227, 0.3)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
        </button>

        <div className="flex flex-col gap-8">
          {/* 图标区 */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-[20px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))",
                border: "1px solid rgba(139, 92, 246, 0.15)",
              }}
            >
              <Icon className="w-8 h-8 text-indigo-600" strokeWidth={1.5} />
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="flex flex-col gap-3 text-center">
            <h2
              className="text-[24px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              {config.title}
            </h2>
            <p
              className="text-[14px] text-gray-500 leading-[1.75] tracking-wide px-4"
              style={{ fontWeight: 400 }}
            >
              {config.description}
            </p>
          </div>

          {/* 权益列表 */}
          <div
            className="rounded-[20px] px-6 py-5"
            style={{
              background: "rgba(250, 250, 249, 0.5)",
              border: "1px solid rgba(229, 229, 227, 0.3)",
            }}
          >
            <ul className="space-y-3">
              {config.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: "rgba(99, 102, 241, 0.1)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>
                  <span
                    className="text-[13px] text-gray-700 leading-relaxed tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 按钮区 */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLogin}
              className="w-full h-[52px] rounded-[16px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[15px] shadow-none transition-all duration-200"
              style={{ fontWeight: 450 }}
            >
              <LogIn className="w-5 h-5 mr-2" strokeWidth={1.5} />
              {config.cta}
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 text-[14px] shadow-none transition-all duration-200"
              style={{ fontWeight: 400 }}
            >
              稍后再说
            </Button>
          </div>

          {/* 底部提示 */}
          <p
            className="text-center text-[12px] text-gray-400 leading-relaxed tracking-wide -mt-2"
            style={{ fontWeight: 400 }}
          >
            登录后你的所有数据将自动同步和保存
          </p>
        </div>
      </div>
    </div>
  );
}
