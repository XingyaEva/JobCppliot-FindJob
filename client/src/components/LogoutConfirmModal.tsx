import { LogOut, X } from "lucide-react";
import { Button } from "./ui/button";

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({ onConfirm, onCancel }: LogoutConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* 弹层卡片 */}
      <div
        className="relative w-full max-w-[440px] mx-4 rounded-[28px] p-10 animate-in zoom-in-95 fade-in duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(229, 229, 227, 0.3)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onCancel}
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
                background: "rgba(249, 250, 251, 0.8)",
                border: "1px solid rgba(229, 229, 227, 0.3)",
              }}
            >
              <LogOut className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="flex flex-col gap-3 text-center">
            <h2
              className="text-[24px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              确认退出登录？
            </h2>
            <p
              className="text-[14px] text-gray-500 leading-[1.75] tracking-wide px-4"
              style={{ fontWeight: 400 }}
            >
              退出后你需要重新登录才能保存岗位、简历等数据
            </p>
          </div>

          {/* 按钮区 */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onConfirm}
              className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px] shadow-none transition-all duration-200"
              style={{ fontWeight: 450 }}
            >
              确认退出
            </Button>

            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 text-[14px] shadow-none transition-all duration-200"
              style={{ fontWeight: 400 }}
            >
              取消
            </Button>
          </div>

          {/* 底部提示 */}
          <p
            className="text-center text-[12px] text-gray-400 leading-relaxed tracking-wide -mt-2"
            style={{ fontWeight: 400 }}
          >
            退出后你的数据仍会保存在云端
          </p>
        </div>
      </div>
    </div>
  );
}
