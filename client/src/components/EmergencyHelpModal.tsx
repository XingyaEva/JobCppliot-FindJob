import { X, Copy, Lightbulb } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const emergencyStrategies = [
  {
    situation: "完全不会回答",
    strategies: [
      "这个问题我暂时没有想到特别好的答案，但我可以分享一下我的思考角度...",
      "这个技术我了解的不是特别深入，但我可以说说我的理解...",
      "虽然我之前没有接触过这个场景，但如果让我设计，我会从XX角度考虑..."
    ]
  },
  {
    situation: "需要思考时间",
    strategies: [
      "这是个很好的问题，让我想一下...（深呼吸3秒）",
      "嗯，这个问题挺有深度的，我整理一下思路...（组织语言）",
      "我先明确一下问题，您是想了解...对吗？（争取时间）"
    ]
  },
  {
    situation: "回答跑题了",
    strategies: [
      "抱歉，我刚才可能偏离了重点，让我重新回答您的问题...",
      "回到您刚才的问题，核心是...（拉回主题）",
      "我补充一下刚才没说清楚的部分...（修正）"
    ]
  },
  {
    situation: "面试官质疑你的回答",
    strategies: [
      "感谢您的指正，我重新思考一下...（虚心接受）",
      "您说的很有道理，我之前确实没考虑到这个角度...（认可对方）",
      "我理解您的concern，从另一个角度看...（提供新视角）"
    ]
  },
  {
    situation: "紧张忘词",
    strategies: [
      "（深呼吸3秒）让我重新组织一下语言...",
      "不好意思，我有点紧张，让我慢慢说...（坦诚表达）",
      "让我用一个具体的例子来说明...（切换方式）"
    ]
  }
];

const quickReminders = [
  "深呼吸，放慢语速，不要着急",
  "用STAR法则：背景-任务-行动-结果",
  "不知道就诚实说，但要展示学习能力",
  "面试官不是来刁难你的，是来了解你的",
  "即使答错了也没关系，保持自信继续"
];

export function EmergencyHelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-[20px] border border-border max-w-[600px] w-full max-h-[80vh] overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-lg)' }}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <span className="text-xl">🆘</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">紧急救援</h2>
                <p className="text-xs text-muted-foreground">快速查看应对策略</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-5" style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
        }}>
          <div className="space-y-5">
            {/* 快速提醒 */}
            <div className="rounded-[14px] bg-green-50/50 border border-green-200 p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-600" />
                先冷静下来
              </h4>
              <ul className="space-y-1.5">
                {quickReminders.map((reminder, index) => (
                  <li key={index} className="text-xs text-foreground/80 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{reminder}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 应对策略 */}
            <div>
              <h4 className="text-sm font-semibold mb-3">应对策略</h4>
              <div className="space-y-4">
                {emergencyStrategies.map((item, index) => (
                  <div key={index} className="rounded-[14px] bg-secondary/30 p-4">
                    <h5 className="text-sm font-semibold mb-3 text-red-700">
                      {item.situation}
                    </h5>
                    <div className="space-y-2">
                      {item.strategies.map((strategy, sIndex) => (
                        <div key={sIndex} className="group relative p-3 rounded-[10px] bg-card border border-border">
                          <p className="text-xs leading-relaxed pr-8">
                            {strategy}
                          </p>
                          <button
                            onClick={() => copyToClipboard(strategy)}
                            className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 万能公式 */}
            <div className="rounded-[14px] bg-purple-50/50 border border-purple-200 p-4">
              <h4 className="text-sm font-semibold mb-3">🎯 万能回答公式</h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-[8px] bg-white/50">
                  <p className="font-medium mb-1">1. 明确问题</p>
                  <p className="text-muted-foreground">"您是想了解...这个方面对吗？"</p>
                </div>
                <div className="p-2.5 rounded-[8px] bg-white/50">
                  <p className="font-medium mb-1">2. 给出框架</p>
                  <p className="text-muted-foreground">"我会从XX、XX、XX三个角度来回答"</p>
                </div>
                <div className="p-2.5 rounded-[8px] bg-white/50">
                  <p className="font-medium mb-1">3. 举例说明</p>
                  <p className="text-muted-foreground">"比如在我之前的项目中..."</p>
                </div>
                <div className="p-2.5 rounded-[8px] bg-white/50">
                  <p className="font-medium mb-1">4. 总结收尾</p>
                  <p className="text-muted-foreground">"所以我认为...，不知道是否回答了您的问题"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="flex-shrink-0 p-5 border-t border-border">
          <button
            onClick={onClose}
            className="w-full h-[44px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
