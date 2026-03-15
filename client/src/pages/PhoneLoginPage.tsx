import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import api from "../lib/api";
import { toast } from "sonner";

export function PhoneLoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [countryCode, setCountryCode] = useState("+86");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 验证手机号格式
  const validatePhone = (phone: string) => {
    if (!phone) return false;
    if (countryCode === "+86") {
      return /^1[3-9]\d{9}$/.test(phone);
    }
    return phone.length >= 8;
  };

  // 处理手机号输入
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
    setPhoneError("");
  };

  // 获取验证码
  const handleGetCode = async () => {
    if (!validatePhone(phoneNumber)) {
      setPhoneError("请输入正确的手机号");
      return;
    }

    try {
      const data = await api.post<{ message: string; _dev_code?: string }>('/auth/sms/send', {
        phone: phoneNumber,
      });
      
      toast.success(data.message || '验证码已发送');
      // 开发模式下显示验证码
      if (data._dev_code) {
        toast.info(`[开发模式] 验证码: ${data._dev_code}`, { duration: 10000 });
      }
      
      setShowCodeInput(true);
      setCountdown(60);
      setTimeout(() => {
        codeInputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      toast.error(error?.message || '发送验证码失败');
    }
  };

  // 处理验证码输入
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    // 自动跳到下一个输入框
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // 如果填满了所有验证码，可以自动提交或高亮按钮
    if (newCode.every((digit) => digit !== "") && index === 5) {
      // 这里可以触发自动登录
      console.log("验证码已填满:", newCode.join(""));
    }
  };

  // 处理粘贴验证码
  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const digits = pastedData.slice(0, 6).split("");

    const newCode = [...verificationCode];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    setVerificationCode(newCode);

    // 聚焦到最后一个填充的位置
    const lastIndex = Math.min(digits.length - 1, 5);
    codeInputRefs.current[lastIndex]?.focus();
  };

  // 处理退格键
  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;
    try {
      const data = await api.post<{ message: string; _dev_code?: string }>('/auth/sms/send', {
        phone: phoneNumber,
      });
      setCountdown(60);
      toast.success('验证码已重新发送');
      if (data._dev_code) {
        toast.info(`[开发模式] 验证码: ${data._dev_code}`, { duration: 10000 });
      }
    } catch (error: any) {
      toast.error(error?.message || '发送失败');
    }
  };

  // 登录
  const handleLogin = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用后端 API 登录 (api.post 自动解包 success/data)
      const data = await api.post<{ token: string; user: any }>("/auth/login", {
        phone: phoneNumber,
        code,
      });

      // 保存 Token 和用户信息
      login(data.token, data.user);
      
      // 跳转到登录成功承接页
      navigate('/login-success');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('登录失败，请重试');
      // 清空验证码
      setVerificationCode(["", "", "", "", "", ""]);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isCodeComplete = verificationCode.every((digit) => digit !== "");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8 py-12"
      style={{ background: "#FAFAF9" }}
    >
      <div className="w-full max-w-[460px] flex flex-col gap-0">
        {/* 返回按钮 */}
        <button
          onClick={() => window.history.back()}
          className="self-start mb-12 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span
            className="text-[13px] tracking-wide"
            style={{ fontWeight: 400 }}
          >
            返回
          </span>
        </button>

        {/* 主卡片 */}
        <div
          className="rounded-[28px] p-12"
          style={{
            background: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 6px 32px rgba(0, 0, 0, 0.015), 0 0 1px rgba(0, 0, 0, 0.015)",
          }}
        >
          <div className="flex flex-col gap-8">
            {/* 标题区 */}
            <div className="flex flex-col gap-3">
              <h1
                className="text-[28px] text-gray-900 tracking-tight"
                style={{ fontWeight: 450 }}
              >
                用手机号继续
              </h1>
              <p
                className="text-[13px] text-gray-500 leading-[1.7] tracking-wide"
                style={{ fontWeight: 400 }}
              >
                登录后可同步你的岗位、简历与训练记录。
              </p>
            </div>

            {/* 手机号输入 */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {/* 区号选择 */}
                <button
                  className="flex items-center justify-between gap-2 px-4 h-[48px] rounded-[14px] transition-all duration-200"
                  style={{
                    background: "rgba(250, 250, 249, 0.5)",
                    border: "1px solid rgba(229, 229, 227, 0.35)",
                  }}
                >
                  <span
                    className="text-[14px] text-gray-900 tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    {countryCode}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 text-gray-400"
                    strokeWidth={1.5}
                  />
                </button>

                {/* 手机号输入框 */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="请输入手机号"
                  className="flex-1 px-4 h-[48px] rounded-[14px] text-[14px] tracking-wide transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(250, 250, 249, 0.5)",
                    border: "1px solid rgba(229, 229, 227, 0.35)",
                    fontWeight: 400,
                    color: "#111827",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.8)";
                    e.target.style.border = "1px solid rgba(0, 0, 0, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(250, 250, 249, 0.5)";
                    e.target.style.border = "1px solid rgba(229, 229, 227, 0.35)";
                  }}
                />
              </div>

              {/* 错误提示 */}
              {phoneError && (
                <p
                  className="text-[12px] text-gray-500 tracking-wide pl-2"
                  style={{ fontWeight: 400 }}
                >
                  {phoneError}
                </p>
              )}
            </div>

            {/* 获取验证码按钮 */}
            {!showCodeInput && (
              <Button
                onClick={handleGetCode}
                disabled={!phoneNumber}
                className="w-full h-[48px] rounded-[14px] text-[14px] shadow-none transition-all duration-200"
                style={{
                  background: phoneNumber
                    ? "rgba(0, 0, 0, 0.06)"
                    : "rgba(250, 250, 249, 0.5)",
                  border: phoneNumber
                    ? "1px solid rgba(0, 0, 0, 0.15)"
                    : "1px solid rgba(229, 229, 227, 0.35)",
                  color: phoneNumber ? "#111827" : "#9CA3AF",
                  fontWeight: 400,
                }}
              >
                获取验证码
              </Button>
            )}

            {/* 验证码输入 */}
            {showCodeInput && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[13px] text-gray-600 tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    验证码已发送至 {countryCode} {phoneNumber}
                  </label>
                  <button
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-[12px] tracking-wide transition-colors"
                    style={{
                      color: countdown > 0 ? "#9CA3AF" : "#6B7280",
                      fontWeight: 400,
                    }}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
                  </button>
                </div>

                {/* 6位验证码输入 */}
                <div className="flex gap-2.5 justify-center">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className="w-[48px] h-[56px] rounded-[14px] text-center text-[20px] tracking-wide transition-all duration-200 outline-none"
                      style={{
                        background: digit
                          ? "rgba(255, 255, 255, 0.8)"
                          : "rgba(250, 250, 249, 0.5)",
                        border: digit
                          ? "1px solid rgba(0, 0, 0, 0.15)"
                          : "1px solid rgba(229, 229, 227, 0.35)",
                        fontWeight: 450,
                        color: "#111827",
                      }}
                      onFocus={(e) => {
                        e.target.style.background = "rgba(255, 255, 255, 0.8)";
                        e.target.style.border = "1px solid rgba(0, 0, 0, 0.2)";
                      }}
                      onBlur={(e) => {
                        if (!digit) {
                          e.target.style.background = "rgba(250, 250, 249, 0.5)";
                          e.target.style.border =
                            "1px solid rgba(229, 229, 227, 0.35)";
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 登录按钮 */}
            {showCodeInput && (
              <Button
                onClick={handleLogin}
                disabled={!isCodeComplete || isLoading}
                className="w-full h-[52px] rounded-[14px] text-[15px] shadow-none transition-all duration-200"
                style={{
                  background: isCodeComplete
                    ? "#111827"
                    : "rgba(0, 0, 0, 0.06)",
                  border: isCodeComplete
                    ? "1px solid rgba(0, 0, 0, 0.9)"
                    : "1px solid rgba(229, 229, 227, 0.35)",
                  color: isCodeComplete ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: 450,
                }}
              >
                {isLoading ? "登录中..." : "继续"}
              </Button>
            )}

            {/* 分割线 */}
            <div className="flex items-center gap-4 my-2">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(229, 229, 227, 0.4)" }}
              />
              <span
                className="text-[11px] text-gray-400 tracking-wider"
                style={{ fontWeight: 400 }}
              >
                或使用其他方式
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(229, 229, 227, 0.4)" }}
              />
            </div>

            {/* 其他登录方式 */}
            <div className="flex flex-col gap-2.5">
              <button
                className="w-full h-[48px] rounded-[14px] text-[14px] tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: "rgba(250, 250, 249, 0.5)",
                  border: "1px solid rgba(229, 229, 227, 0.35)",
                  color: "#374151",
                  fontWeight: 400,
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.26.793-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12" />
                </svg>
                微信登录
              </button>

              <button
                className="w-full h-[48px] rounded-[14px] text-[14px] tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: "rgba(250, 250, 249, 0.5)",
                  border: "1px solid rgba(229, 229, 227, 0.35)",
                  color: "#374151",
                  fontWeight: 400,
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple 登录
              </button>

              <button
                className="w-full h-[48px] rounded-[14px] text-[14px] tracking-wide transition-all duration-200"
                style={{
                  background: "rgba(250, 250, 249, 0.5)",
                  border: "1px solid rgba(229, 229, 227, 0.35)",
                  color: "#374151",
                  fontWeight: 400,
                }}
              >
                邮箱登录
              </button>
            </div>

            {/* 协议提示 */}
            <p
              className="text-center text-[11px] text-gray-400 leading-relaxed tracking-wide mt-2"
              style={{ fontWeight: 400 }}
            >
              登录即表示同意{" "}
              <a href="#" className="text-gray-600 hover:text-gray-900">
                用户协议
              </a>{" "}
              和{" "}
              <a href="#" className="text-gray-600 hover:text-gray-900">
                隐私政策
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}