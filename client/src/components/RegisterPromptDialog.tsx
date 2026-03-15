import { X, Check, Cloud, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface RegisterPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: "job" | "resume" | "interview" | "offer" | "skill";
}

const contextContent = {
  job: {
    title: "岗位解析已完成",
    description:
      "你刚刚完成的岗位解析和下一步建议已经准备好了。登录后可以永久保存，并继续生成定向简历。",
  },
  resume: {
    title: "简历优化已完成",
    description:
      "这份优化建议已经和当前岗位建立关联。登录后可保存为新版本，并持续追踪匹配变化。",
  },
  interview: {
    title: "面试训练已完成",
    description:
      "这次训练的评分、问题意图和优化答案已经生成。登录后可保存记录，并在下次继续提升。",
  },
  offer: {
    title: "Offer 对比已完成",
    description:
      "对比分析和系统建议已经准备好。登录后可永久保存，并持续追踪你的决策进展。",
  },
  skill: {
    title: "Skill 已配置完成",
    description:
      "这个自动化成长动作已经配置好。登录后可启用，并长期为你执行。",
  },
};

export function RegisterPromptDialog({
  open,
  onOpenChange,
  context = "job",
}: RegisterPromptDialogProps) {
  const content = contextContent[context];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay 
          className="fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-[560px] rounded-[28px] p-12 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(229, 229, 227, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100/80 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
            </button>

            {/* 内容区 */}
            <div className="flex flex-col gap-8">
              {/* 标题 */}
              <div className="flex flex-col gap-3">
                <h2
                  className="text-[24px] text-gray-900 tracking-tight"
                  style={{ fontWeight: 450 }}
                >
                  登录后即可保存这一步进展
                </h2>
              </div>

              {/* 动态说明区 */}
              <div
                className="rounded-[20px] p-6"
                style={{
                  background: 'rgba(250, 250, 249, 0.6)',
                  border: '1px solid rgba(229, 229, 227, 0.4)',
                }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    <span
                      className="text-[15px] text-gray-900 tracking-wide"
                      style={{ fontWeight: 450 }}
                    >
                      {content.title}
                    </span>
                  </div>
                  <p
                    className="text-[14px] leading-[1.7] text-gray-600 tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    {content.description}
                  </p>
                </div>
              </div>

              {/* 价值确认区 */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gray-600" strokeWidth={2.5} />
                  </div>
                  <span className="text-[14px] text-gray-700 tracking-wide">
                    保存当前进展
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-3 h-3 text-gray-600" strokeWidth={2} />
                  </div>
                  <span className="text-[14px] text-gray-700 tracking-wide">
                    后续持续追踪
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Cloud className="w-3 h-3 text-gray-600" strokeWidth={2} />
                  </div>
                  <span className="text-[14px] text-gray-700 tracking-wide">
                    多端同步使用
                  </span>
                </div>
              </div>

              {/* 按钮区 */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  size="lg"
                  className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px] shadow-none transition-all duration-200"
                  style={{ fontWeight: 450 }}
                  onClick={() => {
                    // 跳转到登录页
                    window.location.href = "/login";
                  }}
                >
                  立即登录
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 text-[14px] shadow-none transition-all duration-200"
                  style={{ fontWeight: 400 }}
                  onClick={() => onOpenChange(false)}
                >
                  稍后再说
                </Button>
              </div>

              {/* 第三方登录 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(229, 229, 227, 0.4)' }}></div>
                <span className="text-[11px] text-gray-400 tracking-wider">快捷登录</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(229, 229, 227, 0.4)' }}></div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(229, 229, 227, 0.4)',
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                    <path d="M8.691 2.188C7.82 2.188 6.953 2.478 6.254 3.057a4.506 4.506 0 00-1.644 2.664 4.48 4.48 0 00.674 3.294 4.5 4.5 0 002.944 1.91.75.75 0 01-.11 1.488 6.003 6.003 0 01-3.927-2.548 5.98 5.98 0 01-.9-4.392 6.006 6.006 0 012.192-3.552A5.99 5.99 0 018.69.563c.984 0 1.949.262 2.798.76a.75.75 0 01-.764 1.288 4.49 4.49 0 00-2.034-.573zm6.618 0c-.984 0-1.949.262-2.798.76a.75.75 0 00.764 1.288 4.49 4.49 0 012.034-.573c.87 0 1.737.29 2.436.869a4.506 4.506 0 011.644 2.664c.14 1.158-.214 2.339-.974 3.258a4.5 4.5 0 01-2.944 1.91.75.75 0 00.11 1.488 6.003 6.003 0 003.927-2.548c1.015-1.225 1.477-2.83.9-4.392a6.006 6.006 0 00-2.192-3.552 5.99 5.99 0 00-3.207-1.422zm-1.059 6.85c-1.23 0-2.348.734-2.819 1.85a3.38 3.38 0 00-.264 1.315v8.282a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-8.282c0-.463-.093-.919-.264-1.315-.471-1.116-1.589-1.85-2.819-1.85h-.834z"/>
                  </svg>
                </button>

                <button
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(229, 229, 227, 0.4)',
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>

              {/* 底部补充提示 */}
              <div className="text-center pt-2">
                <p
                  className="text-[11px] text-gray-400 leading-relaxed tracking-wide"
                >
                  登录不会影响你刚刚的内容，我们会帮你接着完成。
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
