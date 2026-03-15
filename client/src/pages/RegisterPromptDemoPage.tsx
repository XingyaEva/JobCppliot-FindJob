import { useState } from "react";
import { RegisterPromptDialog } from "../components/RegisterPromptDialog";
import { Button } from "../components/ui/button";

export function RegisterPromptDemoPage() {
  const [showDialog, setShowDialog] = useState(true);
  const [context, setContext] = useState<"job" | "resume" | "interview" | "offer" | "skill">("job");

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: '#FAFAF9' }}
    >
      <div className="w-full max-w-[800px] flex flex-col items-center gap-8">
        {/* 标题说明 */}
        <div className="text-center space-y-3">
          <h1 className="text-[28px] font-medium text-gray-900 tracking-tight">
            页面2：游客体验后转注册弹层
          </h1>
          <p className="text-[14px] text-gray-500 tracking-wide">
            点击下方按钮查看不同场景下的弹层效果
          </p>
        </div>

        {/* 场景切换按钮 */}
        <div 
          className="w-full rounded-[24px] p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(229, 229, 227, 0.3)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div className="space-y-5">
            <h2 className="text-[15px] text-gray-900 tracking-wide" style={{ fontWeight: 450 }}>
              选择场景查看
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-[56px] rounded-[16px] bg-white/60 text-gray-700 text-[14px] justify-start px-5 hover:bg-white hover:border-gray-900/20"
                style={{ 
                  border: context === 'job' ? '1.5px solid rgba(0, 0, 0, 0.5)' : '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: context === 'job' ? 450 : 400,
                }}
                onClick={() => {
                  setContext("job");
                  setShowDialog(true);
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[14px]">岗位解析后</span>
                  <span className="text-[11px] text-gray-500">保存岗位解析结果</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-[56px] rounded-[16px] bg-white/60 text-gray-700 text-[14px] justify-start px-5 hover:bg-white hover:border-gray-900/20"
                style={{ 
                  border: context === 'resume' ? '1.5px solid rgba(0, 0, 0, 0.5)' : '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: context === 'resume' ? 450 : 400,
                }}
                onClick={() => {
                  setContext("resume");
                  setShowDialog(true);
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[14px]">简历优化后</span>
                  <span className="text-[11px] text-gray-500">保存简历新版本</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-[56px] rounded-[16px] bg-white/60 text-gray-700 text-[14px] justify-start px-5 hover:bg-white hover:border-gray-900/20"
                style={{ 
                  border: context === 'interview' ? '1.5px solid rgba(0, 0, 0, 0.5)' : '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: context === 'interview' ? 450 : 400,
                }}
                onClick={() => {
                  setContext("interview");
                  setShowDialog(true);
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[14px]">面试训练后</span>
                  <span className="text-[11px] text-gray-500">保存训练记录</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-[56px] rounded-[16px] bg-white/60 text-gray-700 text-[14px] justify-start px-5 hover:bg-white hover:border-gray-900/20"
                style={{ 
                  border: context === 'offer' ? '1.5px solid rgba(0, 0, 0, 0.5)' : '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: context === 'offer' ? 450 : 400,
                }}
                onClick={() => {
                  setContext("offer");
                  setShowDialog(true);
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[14px]">Offer 对比后</span>
                  <span className="text-[11px] text-gray-500">保存对比分析</span>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-[56px] rounded-[16px] bg-white/60 text-gray-700 text-[14px] justify-start px-5 hover:bg-white hover:border-gray-900/20 col-span-2"
                style={{ 
                  border: context === 'skill' ? '1.5px solid rgba(0, 0, 0, 0.5)' : '1px solid rgba(229, 229, 227, 0.4)',
                  fontWeight: context === 'skill' ? 450 : 400,
                }}
                onClick={() => {
                  setContext("skill");
                  setShowDialog(true);
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[14px]">Skill 配置后</span>
                  <span className="text-[11px] text-gray-500">启用自动化成长动作</span>
                </div>
              </Button>
            </div>

            {/* 重新打开按钮 */}
            <div className="pt-3">
              <Button
                className="w-full h-[48px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[14px] shadow-none"
                style={{ fontWeight: 450 }}
                onClick={() => setShowDialog(true)}
              >
                重新打开弹层
              </Button>
            </div>
          </div>
        </div>

        {/* 说明区 */}
        <div 
          className="w-full rounded-[20px] p-6"
          style={{
            background: 'rgba(250, 250, 249, 0.6)',
            border: '1px solid rgba(229, 229, 227, 0.4)',
          }}
        >
          <div className="space-y-3">
            <h3 className="text-[13px] text-gray-900 tracking-wide" style={{ fontWeight: 450 }}>
              设计特点
            </h3>
            <ul className="space-y-2 text-[12px] text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>不像营销弹窗，不像报错提示，像任务承接确认弹层</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>动态上下文系统，根据用户刚完成的操作显示相关文案</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>强调"刚刚完成的价值"，而非空泛的注册收益</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>低阻力设计，提供"稍后再说"选项，不强制拦截</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>高级克制气质，像高端职业产品的自然拦截</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 注册提示弹层 */}
      <RegisterPromptDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        context={context}
      />
    </div>
  );
}
