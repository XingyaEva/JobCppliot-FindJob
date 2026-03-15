import { AlertTriangle, ArrowLeft, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { useState } from "react";

export function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const impacts = [
    "所有保存的岗位、简历版本和面试记录将被永久删除",
    "你的成长计划、Skills 配置和长期记忆将被清空",
    "Offer 对比、决策记录和分析数据将无法恢复",
    "会员权益将立即失效，且不可退款",
  ];

  const handleDelete = () => {
    if (confirmText !== "删除账号") return;
    setIsDeleting(true);
    // 模拟删除操作
    setTimeout(() => {
      console.log("账号已注销");
      setIsDeleting(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[720px] flex flex-col gap-8 py-12">
        {/* 返回按钮 */}
        <Link
          to="/profile"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span
            className="text-[13px] tracking-wide"
            style={{ fontWeight: 400 }}
          >
            返回账号设置
          </span>
        </Link>

        {/* 主卡片 */}
        <div
          className="rounded-[24px] p-10"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
          }}
        >
          <div className="flex flex-col gap-8">
            {/* 警告图标和标题 */}
            <div className="flex flex-col gap-4">
              <div
                className="w-14 h-14 rounded-[16px] flex items-center justify-center"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                <AlertTriangle
                  className="w-7 h-7 text-red-600"
                  strokeWidth={1.5}
                />
              </div>

              <div className="flex flex-col gap-2">
                <h1
                  className="text-[24px] text-gray-900 tracking-tight"
                  style={{ fontWeight: 450 }}
                >
                  注销账号
                </h1>
                <p
                  className="text-[14px] text-gray-500 tracking-wide leading-relaxed"
                  style={{ fontWeight: 400 }}
                >
                  注销后，你的所有数据将被永久删除且无法恢复。请谨慎操作。
                </p>
              </div>
            </div>

            {/* 注销影响说明 */}
            <div className="flex flex-col gap-4">
              <h3
                className="text-[15px] text-gray-900 tracking-wide"
                style={{ fontWeight: 450 }}
              >
                注销后的影响
              </h3>
              <div className="flex flex-col gap-3">
                {impacts.map((impact, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-[16px] px-4 py-3"
                    style={{
                      background: "rgba(254, 242, 242, 0.3)",
                      border: "1px solid rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2"></div>
                    <span
                      className="text-[13px] text-gray-700 tracking-wide leading-relaxed"
                      style={{ fontWeight: 400 }}
                    >
                      {impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 数据处理说明 */}
            <div
              className="rounded-[18px] px-5 py-4"
              style={{
                background: "rgba(250, 250, 249, 0.4)",
                border: "1px solid rgba(229, 229, 227, 0.2)",
              }}
            >
              <div className="flex flex-col gap-2">
                <p
                  className="text-[13px] text-gray-900 tracking-wide"
                  style={{ fontWeight: 450 }}
                >
                  数据处理说明
                </p>
                <p
                  className="text-[12px] text-gray-600 tracking-wide leading-relaxed"
                  style={{ fontWeight: 400 }}
                >
                  账号注销后 30
                  天内，你的数据将进入冷冻期。如需恢复，请联系客服。30
                  天后，所有数据将被永久删除，且无法恢复。
                </p>
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-gray-100"></div>

            {/* 确认输入 */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  className="text-[13px] text-gray-700 tracking-wide"
                  style={{ fontWeight: 450 }}
                >
                  输入"删除账号"以确认
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="请输入：删除账号"
                  className="w-full h-[48px] px-4 rounded-[14px] text-[14px] text-gray-900 tracking-wide"
                  style={{
                    background: "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(229, 229, 227, 0.4)",
                    fontWeight: 400,
                    outline: "none",
                  }}
                />
              </div>

              {/* 按钮区 */}
              <div className="flex gap-3 pt-2">
                <Link to="/profile" className="flex-1">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-[52px] rounded-[16px] text-gray-600 hover:text-gray-900 text-[14px]"
                    style={{ fontWeight: 400 }}
                  >
                    取消
                  </Button>
                </Link>
                <Button
                  onClick={handleDelete}
                  disabled={confirmText !== "删除账号" || isDeleting}
                  size="lg"
                  className="flex-1 h-[52px] rounded-[16px] bg-red-600 hover:bg-red-700 text-white text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontWeight: 450 }}
                >
                  {isDeleting ? "正在注销..." : "确认注销账号"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部帮助 */}
        <div
          className="rounded-[18px] px-5 py-4"
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
                className="text-[13px] text-gray-700 tracking-wide"
                style={{ fontWeight: 450 }}
              >
                如果只是想暂停使用
              </p>
              <p
                className="text-[12px] text-gray-600 tracking-wide leading-relaxed"
                style={{ fontWeight: 400 }}
              >
                你可以选择退出登录而不是注销账号。这样你的数据会被完整保留，随时可以重新登录继续使用。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
