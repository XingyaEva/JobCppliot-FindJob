import { useState } from "react";
import { AlertCircle, UserX, X } from "lucide-react";
import { Button } from "./ui/button";

interface DeleteAccountModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountModal({ onConfirm, onCancel }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  
  const canConfirm = confirmText === "确认注销";

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* 弹层卡片 */}
      <div
        className="relative w-full max-w-[520px] mx-4 rounded-[28px] p-10 animate-in zoom-in-95 fade-in duration-300"
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
                background: "rgba(254, 242, 242, 0.5)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <UserX className="w-8 h-8 text-red-600" strokeWidth={1.5} />
            </div>
          </div>

          {/* 标题和描述 */}
          <div className="flex flex-col gap-3 text-center">
            <h2
              className="text-[24px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              {step === 1 ? "确认注销账号？" : "最后一步确认"}
            </h2>
            <p
              className="text-[14px] text-gray-500 leading-[1.75] tracking-wide px-2"
              style={{ fontWeight: 400 }}
            >
              {step === 1 
                ? "注销后将永久删除以下所有数据，且无法恢复"
                : '请输入"确认注销"以完成注销操作'
              }
            </p>
          </div>

          {step === 1 ? (
            <>
              {/* 警告列表 */}
              <div
                className="rounded-[20px] px-6 py-5"
                style={{
                  background: "rgba(254, 242, 242, 0.3)",
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                }}
              >
                <ul className="space-y-3">
                  {[
                    "保存的所有岗位信息",
                    "创建的所有简历版本",
                    "面试训练记录与分析",
                    "决策记录与成长数据",
                    "会员权益与购买记录",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      </div>
                      <span
                        className="text-[13px] text-gray-700 leading-relaxed tracking-wide"
                        style={{ fontWeight: 400 }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 严重警告 */}
              <div
                className="rounded-[16px] px-5 py-4"
                style={{
                  background: "rgba(254, 242, 242, 0.4)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div className="flex-1">
                    <p
                      className="text-[13px] text-red-700 leading-relaxed tracking-wide"
                      style={{ fontWeight: 450 }}
                    >
                      此操作不可撤销，请谨慎操作
                    </p>
                    <p
                      className="text-[12px] text-red-600 tracking-wide mt-1"
                      style={{ fontWeight: 400 }}
                    >
                      数据一旦删除将永久无法恢复
                    </p>
                  </div>
                </div>
              </div>

              {/* 按钮区 */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleNext}
                  className="w-full h-[52px] rounded-[16px] bg-red-600 hover:bg-red-700 text-white text-[15px] shadow-none transition-all duration-200"
                  style={{ fontWeight: 450 }}
                >
                  我已知晓，继续注销
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
            </>
          ) : (
            <>
              {/* 输入确认框 */}
              <div className="flex flex-col gap-3">
                <label
                  className="text-[13px] text-gray-600 tracking-wide text-center"
                  style={{ fontWeight: 400 }}
                >
                  请在下方输入框中输入
                  <span
                    className="mx-1 text-red-600"
                    style={{ fontWeight: 450 }}
                  >
                    确认注销
                  </span>
                  以继续
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="输入&quot;确认注销&quot;"
                  className="w-full px-5 py-3.5 rounded-[16px] text-[15px] text-gray-900 text-center tracking-wide border outline-none transition-all duration-200"
                  style={{
                    background: "rgba(250, 250, 249, 0.5)",
                    borderColor: canConfirm 
                      ? "rgba(239, 68, 68, 0.3)" 
                      : "rgba(229, 229, 227, 0.35)",
                    fontWeight: 400,
                  }}
                  autoFocus
                />
              </div>

              {/* 最终警告 */}
              <div
                className="rounded-[16px] px-5 py-4"
                style={{
                  background: "rgba(254, 242, 242, 0.3)",
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                }}
              >
                <p
                  className="text-[12px] text-red-600 leading-relaxed tracking-wide text-center"
                  style={{ fontWeight: 400 }}
                >
                  注销后账号将被永久删除，所有数据将在7天后彻底清除
                </p>
              </div>

              {/* 按钮区 */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="w-full h-[52px] rounded-[16px] bg-red-600 hover:bg-red-700 text-white text-[15px] shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontWeight: 450 }}
                >
                  确认注销账号
                </Button>

                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 text-[14px] shadow-none transition-all duration-200"
                  style={{ fontWeight: 400 }}
                >
                  返回上一步
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}