import { useEffect } from "react";
import { X, Command, Keyboard } from "lucide-react";

// 快捷键配置
const shortcuts = [
  {
    category: "导航",
    items: [
      { keys: ["⌘/Ctrl", "K"], description: "全局搜索" },
      { keys: ["⌘/Ctrl", "/"], description: "显示快捷键" },
      { keys: ["ESC"], description: "关闭弹窗/对话框" },
    ]
  },
  {
    category: "工作台",
    items: [
      { keys: ["⌘/Ctrl", "N"], description: "新建项目" },
      { keys: ["⌘/Ctrl", "S"], description: "保存当前内容" },
      { keys: ["⌘/Ctrl", "E"], description: "导出数据" },
    ]
  },
  {
    category: "搜索",
    items: [
      { keys: ["↑", "↓"], description: "上下选择" },
      { keys: ["↵"], description: "确认选择" },
      { keys: ["ESC"], description: "关闭搜索" },
    ]
  },
  {
    category: "编辑",
    items: [
      { keys: ["⌘/Ctrl", "Z"], description: "撤销" },
      { keys: ["⌘/Ctrl", "Shift", "Z"], description: "重做" },
      { keys: ["⌘/Ctrl", "C"], description: "复制" },
      { keys: ["⌘/Ctrl", "V"], description: "粘贴" },
    ]
  },
  {
    category: "其他",
    items: [
      { keys: ["⌘/Ctrl", ","], description: "打开设置" },
      { keys: ["⌘/Ctrl", "B"], description: "切换侧边栏" },
    ]
  }
];

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  // ESC 键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" 
        onClick={onClose}
      />

      {/* 快捷键面板 */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 px-4">
        <div className="bg-card rounded-[24px] border border-border shadow-2xl overflow-hidden">
          {/* 头部 */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">键盘快捷键</h2>
                  <p className="text-xs text-muted-foreground">提高你的工作效率</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* 快捷键列表 */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              {shortcuts.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between py-2.5 px-3 rounded-[12px] hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm">{item.description}</span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 rounded-[6px] bg-secondary border border-border text-xs font-medium min-w-[32px] text-center">
                                {key}
                              </kbd>
                              {keyIndex < item.keys.length - 1 && (
                                <span className="text-xs text-muted-foreground">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部提示 */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5" />
                <span>Mac 使用 ⌘ 键，Windows/Linux 使用 Ctrl 键</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-card border border-border">⌘/Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded bg-card border border-border">/</kbd>
                <span className="ml-1">显示此帮助</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
