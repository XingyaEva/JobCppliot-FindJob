import { X, Sun, Moon, Monitor, User, Bell, Shield, Globe, Download, MessageSquare, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { FeedbackDialog } from './FeedbackDialog';
import { DataExportDialog } from './DataExportDialog';
import { HelpCenter } from './HelpCenter';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-card border-l border-border z-50 flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold">设置中心</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* 外观设置 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">外观</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all ${
                    theme === 'light' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <Sun className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">浅色模式</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all ${
                    theme === 'dark' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <Moon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">深色模式</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all ${
                    theme === 'system' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  <Monitor className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">跟随系统</span>
                </button>
              </div>
            </section>

            {/* 账户设置 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">账户</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">个人资料</span>
                  <span className="text-xs text-muted-foreground">查看和编辑</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">会员信息</span>
                  <span className="text-xs text-muted-foreground">基础会员</span>
                </button>
              </div>
            </section>

            {/* 通知设置 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">通知</h3>
              </div>
              <div className="space-y-2">
                <label className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors cursor-pointer">
                  <span className="text-sm">桌面通知</span>
                  <input type="checkbox" className="w-4 h-4 rounded accent-primary" defaultChecked />
                </label>
                <label className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors cursor-pointer">
                  <span className="text-sm">邮件通知</span>
                  <input type="checkbox" className="w-4 h-4 rounded accent-primary" defaultChecked />
                </label>
                <label className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors cursor-pointer">
                  <span className="text-sm">求职机会推送</span>
                  <input type="checkbox" className="w-4 h-4 rounded accent-primary" defaultChecked />
                </label>
              </div>
            </section>

            {/* 隐私与安全 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">隐私与安全</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">修改密码</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">两步验证</span>
                  <span className="text-xs text-muted-foreground">未启用</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">数据隐私</span>
                </button>
              </div>
            </section>

            {/* 语言与地区 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">语言与地区</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">语言</span>
                  <span className="text-xs text-muted-foreground">简体中文</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">时区</span>
                  <span className="text-xs text-muted-foreground">UTC+8</span>
                </button>
              </div>
            </section>

            {/* 数据管理 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">数据管理</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setShowDataExport(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors"
                >
                  <span className="text-sm">导出数据</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">清除缓存</span>
                </button>
              </div>
            </section>

            {/* 帮助与反馈 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-sm font-medium text-muted-foreground">帮助与反馈</h3>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors"
                >
                  <span className="text-sm">帮助中心</span>
                </button>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors"
                >
                  <span className="text-sm">反馈建议</span>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <span className="text-sm">关于 FindJob</span>
                  <span className="text-xs text-muted-foreground">v1.5.0</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 反馈对话框 */}
      <FeedbackDialog isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* 数据导出对话框 */}
      <DataExportDialog isOpen={showDataExport} onClose={() => setShowDataExport(false)} />

      {/* 帮助中心 */}
      <HelpCenter isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
