import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { CheckCircle2, Mail, MessageCircle, Apple as AppleIcon } from "lucide-react";

export function LoginRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-20 py-20" style={{ background: '#FAFAF9' }}>
      <div className="w-full max-w-[1180px] flex items-center gap-16">
        {/* 左侧：品牌与价值区 */}
        <div className="flex-[0.9] flex flex-col gap-14">
          {/* Logo 区 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-xl tracking-tight">F</span>
              </div>
              <span className="text-[26px] font-medium text-gray-900 tracking-tight">FindJob</span>
            </div>
            <span className="text-[13px] text-gray-400 ml-[56px] tracking-wide">AI 求职操作系统</span>
          </div>

          {/* 主标题 */}
          <div className="flex flex-col gap-7">
            <h1 className="text-[36px] leading-[1.3] font-normal text-gray-900 tracking-tight max-w-[480px]" style={{ fontWeight: 450 }}>
              开始组织你的求职，<br />而不是继续零散地找机会。
            </h1>
            <p className="text-[15px] leading-[1.7] text-gray-500 max-w-[460px] tracking-wide" style={{ fontWeight: 400 }}>
              岗位、简历、面试、Offer 和成长计划，会在这里被重新整理成一套连续系统。
            </p>
          </div>

          {/* 价值摘要区 */}
          <div className="flex flex-col gap-8 mt-4">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2"></div>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] text-gray-900 tracking-wide" style={{ fontWeight: 450 }}>岗位透视</span>
                <span className="text-[13px] text-gray-500 leading-relaxed tracking-wide">看懂岗位真正要什么</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2"></div>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] text-gray-900 tracking-wide" style={{ fontWeight: 450 }}>简历资产</span>
                <span className="text-[13px] text-gray-500 leading-relaxed tracking-wide">形成可迭代的版本系统</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-2"></div>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] text-gray-900 tracking-wide" style={{ fontWeight: 450 }}>面试训练</span>
                <span className="text-[13px] text-gray-500 leading-relaxed tracking-wide">训练、模拟与复盘一体化</span>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="mt-8">
            <p className="text-[11px] text-gray-400 leading-relaxed tracking-wide">
              支持游客体验，登录后可保存进展与长期记录。
            </p>
          </div>
        </div>

        {/* 右侧：登录注册卡片区 */}
        <div className="w-[500px] flex-shrink-0">
          <div 
            className="rounded-[28px] p-12 flex flex-col gap-7"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(229, 229, 227, 0.3)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.02), 0 0 1px rgba(0, 0, 0, 0.02)'
            }}
          >
            {/* 卡片标题 */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[22px] text-gray-900 tracking-tight" style={{ fontWeight: 450 }}>登录 / 注册</h2>
              <p className="text-[13px] text-gray-500 leading-[1.6] tracking-wide">
                登录后可保存岗位、简历版本、面试记录和成长计划。
              </p>
            </div>

            {/* 主操作按钮 */}
            <Button
              size="lg"
              className="w-full h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px] shadow-none transition-all duration-200"
              style={{ fontWeight: 450 }}
            >
              手机号登录
            </Button>

            {/* 分隔线 */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px" style={{ background: 'rgba(229, 229, 227, 0.4)' }}></div>
              <span className="text-[11px] text-gray-400 tracking-wider">或使用其他方式继续</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(229, 229, 227, 0.4)' }}></div>
            </div>

            {/* 第三方登录方式 */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-[48px] rounded-[16px] bg-white/40 text-gray-700 text-[14px] justify-start px-5 shadow-none transition-all duration-200"
                style={{ 
                  border: '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: 400
                }}
              >
                <svg className="w-[18px] h-[18px] mr-3" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <path d="M8.691 2.188C7.82 2.188 6.953 2.478 6.254 3.057a4.506 4.506 0 00-1.644 2.664 4.48 4.48 0 00.674 3.294 4.5 4.5 0 002.944 1.91.75.75 0 01-.11 1.488 6.003 6.003 0 01-3.927-2.548 5.98 5.98 0 01-.9-4.392 6.006 6.006 0 012.192-3.552A5.99 5.99 0 018.69.563c.984 0 1.949.262 2.798.76a.75.75 0 01-.764 1.288 4.49 4.49 0 00-2.034-.573zm6.618 0c-.984 0-1.949.262-2.798.76a.75.75 0 00.764 1.288 4.49 4.49 0 012.034-.573c.87 0 1.737.29 2.436.869a4.506 4.506 0 011.644 2.664c.14 1.158-.214 2.339-.974 3.258a4.5 4.5 0 01-2.944 1.91.75.75 0 00.11 1.488 6.003 6.003 0 003.927-2.548c1.015-1.225 1.477-2.83.9-4.392a6.006 6.006 0 00-2.192-3.552 5.99 5.99 0 00-3.207-1.422zm-1.059 6.85c-1.23 0-2.348.734-2.819 1.85a3.38 3.38 0 00-.264 1.315v8.282a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-8.282c0-.463-.093-.919-.264-1.315-.471-1.116-1.589-1.85-2.819-1.85h-.834z"/>
                </svg>
                微信继续
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-[48px] rounded-[16px] bg-white/40 text-gray-700 text-[14px] justify-start px-5 shadow-none transition-all duration-200"
                style={{ 
                  border: '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: 400
                }}
              >
                <svg className="w-[18px] h-[18px] mr-3" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple 继续
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-[48px] rounded-[16px] bg-white/40 text-gray-700 text-[14px] justify-start px-5 shadow-none transition-all duration-200"
                style={{ 
                  border: '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: 400
                }}
              >
                <Mail className="w-[18px] h-[18px] mr-3" strokeWidth={1.5} opacity={0.7} />
                邮箱登录
              </Button>
            </div>

            {/* 游客体验入口 */}
            <div className="flex flex-col gap-3 pt-3">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 text-[14px] shadow-none transition-all duration-200"
                  style={{ fontWeight: 400 }}
                >
                  先游客体验
                </Button>
              </Link>
              <p className="text-[11px] text-gray-400 text-center px-2 leading-relaxed tracking-wide">
                无需注册，可先解析岗位或上传简历
              </p>
            </div>

            {/* 协议区 */}
            <div className="pt-4" style={{ borderTop: '1px solid rgba(229, 229, 227, 0.3)' }}>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed tracking-wide">
                继续即表示你同意
                <button className="text-gray-500 hover:text-gray-700 underline underline-offset-2 mx-1 transition-colors">
                  用户协议
                </button>
                与
                <button className="text-gray-500 hover:text-gray-700 underline underline-offset-2 mx-1 transition-colors">
                  隐私政策
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}