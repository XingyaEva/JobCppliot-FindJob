import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";

export function LoginSuccessPage() {
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const { restoreContext, clearContext } = useNavigation();

  useEffect(() => {
    // 延迟 1.5 秒，显示登录成功状态
    const timer = setTimeout(() => {
      handleRedirect();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = () => {
    // 步骤1：检查是否有保存的上下文
    const context = restoreContext();
    
    if (context) {
      // 有上下文，返回原任务
      clearContext();
      navigate(context.returnUrl, { 
        state: { context },
        replace: true 
      });
      return;
    }

    // 步骤2：检查是否首次登录
    if (userInfo?.isFirstLogin) {
      navigate('/welcome', { replace: true });
      return;
    }

    // 步骤3：检查是否已初始化
    if (!userInfo?.isInitialized) {
      navigate('/profile-setup', { replace: true });
      return;
    }

    // 步骤4：默认返回首页
    navigate('/', { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8"
      style={{ background: "#FAFAF9" }}
    >
      {/* 中央小确认态 */}
      <div
        className="rounded-[24px] p-10 max-w-[420px] animate-in fade-in-0 zoom-in-95 duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(229, 229, 227, 0.25)",
          boxShadow:
            "0 8px 40px rgba(0, 0, 0, 0.02), 0 0 1px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          {/* 成功图标 */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(240, 253, 244, 0.6)",
              border: "1px solid rgba(34, 197, 94, 0.15)",
            }}
          >
            <CheckCircle2
              className="w-8 h-8 text-green-600"
              strokeWidth={1.5}
            />
          </div>

          {/* 文案 */}
          <div className="flex flex-col gap-2.5">
            <h2
              className="text-[18px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              登录成功
            </h2>
            <p
              className="text-[13px] text-gray-500 leading-[1.7] tracking-wide"
              style={{ fontWeight: 400 }}
            >
              正在为你准备...
            </p>
          </div>

          {/* 进度指示 */}
          <div className="w-full">
            <div
              className="h-0.5 rounded-full overflow-hidden"
              style={{ background: "rgba(229, 229, 227, 0.3)" }}
            >
              <div
                className="h-full rounded-full animate-progress"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.6))",
                  animation: "progress 1.5s linear forwards",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
