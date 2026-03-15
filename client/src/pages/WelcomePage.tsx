import { CheckCircle2, Target, User, Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";

export function WelcomePage() {
  const navigate = useNavigate();
  
  const steps = [
    {
      number: "1",
      icon: Target,
      title: "明确目标",
      description: "选择你当前想找的岗位方向",
    },
    {
      number: "2",
      icon: User,
      title: "建立画像",
      description: "上传简历或补充基础偏好",
    },
    {
      number: "3",
      icon: Home,
      title: "进入系统",
      description: "首页会自动切换成更适合你的工作台入口",
    },
  ];

  const handleStart = () => {
    // 跳转到资料补充页
    navigate('/profile-setup');
  };

  const handleSkip = () => {
    // 跳过初始化，直接进入首页
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-8 py-12"
      style={{ background: "#FAFAF9" }}
    >
      <div className="w-full max-w-[680px] flex flex-col gap-0">
        {/* 主卡片 */}
        <div
          className="rounded-[28px] px-16 py-14"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
          }}
        >
          <div className="flex flex-col gap-12">
            {/* 模块1：顶部品牌区 */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-[18px] flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(250, 250, 249, 0.9), rgba(255, 255, 255, 1))",
                  border: "1px solid rgba(229, 229, 227, 0.3)",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.015)",
                }}
              >
                <span
                  className="text-[22px] text-gray-800"
                  style={{ fontWeight: 500 }}
                >
                  F
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <h1
                  className="text-[20px] text-gray-900 tracking-tight"
                  style={{ fontWeight: 475 }}
                >
                  FindJob
                </h1>
                <p
                  className="text-[11px] text-gray-400 tracking-wider uppercase"
                  style={{ fontWeight: 400, letterSpacing: "0.08em" }}
                >
                  AI 求职操作系统
                </p>
              </div>
            </div>

            {/* 分隔线 */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(229, 229, 227, 0.3), transparent)",
              }}
            />

            {/* 模块2 + 模块3：主标题 + 副说明 */}
            <div className="flex flex-col gap-5 text-center">
              <h2
                className="text-[28px] text-gray-900 tracking-tight"
                style={{ fontWeight: 450 }}
              >
                欢迎来到 FindJob
              </h2>
              <p
                className="text-[14px] text-gray-500 leading-[1.8] tracking-wide px-8"
                style={{ fontWeight: 400 }}
              >
                接下来我们会先帮你明确方向、建立求职画像，
                <br />
                再把岗位、简历和面试流程组织起来。
              </p>
            </div>

            {/* 模块4：三步说明区 */}
            <div className="flex flex-col gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    {/* 序号图标 */}
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center"
                      style={{
                        background: "rgba(250, 250, 249, 0.6)",
                        border: "1px solid rgba(229, 229, 227, 0.25)",
                      }}
                    >
                      <Icon
                        className="w-5 h-5 text-gray-600"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* 文字内容 */}
                    <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-[11px] text-gray-400 tracking-wider"
                          style={{ fontWeight: 450 }}
                        >
                          STEP {step.number}
                        </span>
                        <div
                          className="flex-1 h-px"
                          style={{ background: "rgba(229, 229, 227, 0.2)" }}
                        />
                      </div>
                      <h3
                        className="text-[15px] text-gray-900 tracking-tight"
                        style={{ fontWeight: 450 }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-[13px] text-gray-500 leading-[1.6] tracking-wide"
                        style={{ fontWeight: 400 }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 分隔线 */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(229, 229, 227, 0.3), transparent)",
              }}
            />

            {/* 模块5：按钮区 */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full h-[54px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px] shadow-none transition-all duration-200"
                style={{ fontWeight: 450 }}
                onClick={handleStart}
              >
                开始设置
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-full h-[48px] rounded-[16px] text-gray-500 hover:text-gray-900 hover:bg-gray-50/40 text-[14px] shadow-none transition-all duration-200"
                style={{ fontWeight: 400 }}
                onClick={handleSkip}
              >
                稍后再说
              </Button>
            </div>

            {/* 模块6：底部轻提示 */}
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "rgba(156, 163, 175, 0.3)" }}
              />
              <p
                className="text-[12px] text-gray-400 tracking-wide"
                style={{ fontWeight: 400 }}
              >
                整个过程大约 1 分钟，后续也可以随时修改。
              </p>
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "rgba(156, 163, 175, 0.3)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}