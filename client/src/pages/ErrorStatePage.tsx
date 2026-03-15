import { AlertCircle, RefreshCw, Home, LogIn, WifiOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useSearchParams } from "react-router";

type ErrorType =
  | "session-expired"
  | "verification-failed"
  | "payment-failed"
  | "network-error"
  | "not-found";

interface ErrorStatePageProps {
  type?: ErrorType;
}

export function ErrorStatePage({ type: propType }: ErrorStatePageProps) {
  // 优先使用 URL 参数，其次使用 props
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get("type") as ErrorType;
  const type = urlType || propType || "session-expired";

  const errorConfig: Record<
    ErrorType,
    {
      icon: typeof AlertCircle;
      title: string;
      description: string;
      primaryAction: { label: string; href: string };
      secondaryAction: { label: string; href: string };
    }
  > = {
    "session-expired": {
      icon: LogIn,
      title: "登录状态已过期",
      description: "请重新登录后继续保存你的岗位数据和训练记录。",
      primaryAction: { label: "重新登录", href: "/login" },
      secondaryAction: { label: "返回首页", href: "/" },
    },
    "verification-failed": {
      icon: AlertCircle,
      title: "验证失败",
      description: "验证码可能已过期或输入错误，请重新获取验证码后再试。",
      primaryAction: { label: "重新验证", href: "/phone-login" },
      secondaryAction: { label: "返回首页", href: "/" },
    },
    "payment-failed": {
      icon: AlertCircle,
      title: "支付未完成",
      description: "支付过程中出现了问题，你可以重新尝试，当前选择的方案仍已保留。",
      primaryAction: { label: "重新支付", href: "/checkout" },
      secondaryAction: { label: "返回会员页", href: "/membership" },
    },
    "network-error": {
      icon: WifiOff,
      title: "网络连接异常",
      description: "请检查你的网络连接，然后刷新页面重试。",
      primaryAction: { label: "刷新页面", href: "" },
      secondaryAction: { label: "返回首页", href: "/" },
    },
    "not-found": {
      icon: AlertCircle,
      title: "页面不存在",
      description: "你访问的页面不存在，可能已被移除或链接有误。",
      primaryAction: { label: "返回首页", href: "/" },
      secondaryAction: { label: "查看帮助", href: "/terms" },
    },
  };

  const config = errorConfig[type];
  const Icon = config.icon;

  const handlePrimaryAction = () => {
    if (config.primaryAction.href === "") {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen">
      <div className="w-full max-w-[560px] flex flex-col items-center gap-8 px-4">
        {/* 图标 */}
        <div
          className="w-20 h-20 rounded-[20px] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04))",
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          <Icon className="w-10 h-10 text-red-600" strokeWidth={1.5} />
        </div>

        {/* 主卡片 */}
        <div
          className="w-full rounded-[24px] p-10"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.03), 0 0 1px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div className="flex flex-col items-center gap-8">
            {/* 标题和说明 */}
            <div className="flex flex-col items-center gap-3 text-center">
              <h1
                className="text-[24px] text-gray-900 tracking-tight"
                style={{ fontWeight: 450 }}
              >
                {config.title}
              </h1>
              <p
                className="text-[14px] text-gray-500 tracking-wide leading-relaxed max-w-[400px]"
                style={{ fontWeight: 400 }}
              >
                {config.description}
              </p>
            </div>

            {/* 分隔线 */}
            <div className="w-full h-px bg-gray-100"></div>

            {/* 按钮区 */}
            <div className="w-full flex flex-col gap-3">
              {config.primaryAction.href === "" ? (
                <Button
                  onClick={handlePrimaryAction}
                  size="lg"
                  className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
                  style={{ fontWeight: 450 }}
                >
                  <RefreshCw className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  {config.primaryAction.label}
                </Button>
              ) : (
                <Link to={config.primaryAction.href} className="w-full">
                  <Button
                    size="lg"
                    className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px]"
                    style={{ fontWeight: 450 }}
                  >
                    {config.primaryAction.label}
                  </Button>
                </Link>
              )}

              <Link to={config.secondaryAction.href} className="w-full">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 text-[14px]"
                  style={{ fontWeight: 400 }}
                >
                  <Home className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  {config.secondaryAction.label}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 底部帮助 */}
        <div className="flex flex-col items-center gap-2">
          <p
            className="text-[12px] text-gray-400 tracking-wide text-center"
            style={{ fontWeight: 400 }}
          >
            如果问题持续存在，请联系客服获取帮助
          </p>
        </div>
      </div>
    </div>
  );
}