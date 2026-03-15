import { X, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";

interface GuestBannerProps {
  onDismiss?: () => void;
}

export function GuestBanner({ onDismiss }: GuestBannerProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
    // 保存关闭状态到 localStorage（24小时内不再显示）
    localStorage.setItem('guestBannerDismissed', Date.now().toString());
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="relative w-full px-6 py-4"
      style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))",
        borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
      }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* 左侧：图标 + 文案 */}
        <div className="flex items-center gap-4">
          {/* 图标 */}
          <div
            className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <Sparkles className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
          </div>

          {/* 文案 */}
          <div className="flex flex-col gap-1">
            <h3
              className="text-[15px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              当前为游客模式体验
            </h3>
            <p
              className="text-[13px] text-gray-500 tracking-wide"
              style={{ fontWeight: 400 }}
            >
              登录后可保存岗位、简历、训练记录，并同步到其他设备
            </p>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleLogin}
            className="h-[36px] px-5 rounded-[12px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[13px] shadow-none transition-all duration-200"
            style={{ fontWeight: 450 }}
          >
            <LogIn className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
            登录 / 注册
          </Button>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-gray-100/60 transition-colors flex-shrink-0"
            title="关闭提示"
          >
            <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
