import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck, Settings, Trash2, ExternalLink, FileText, Briefcase, MessageSquare, TrendingUp, Award } from "lucide-react";

// 通知类型
type NotificationType = "job" | "interview" | "decision" | "growth" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  link?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// 模拟通知数据
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "job",
    title: "新岗位匹配",
    content: "字节跳动 - AI 产品经理 与你的期望高度匹配（95%）",
    time: "5分钟前",
    isRead: false,
    link: "/opportunities",
    icon: Briefcase
  },
  {
    id: "2",
    type: "interview",
    title: "面试提醒",
    content: "明天 14:00 腾讯二面，已为你准备面试助手",
    time: "1小时前",
    isRead: false,
    link: "/interviews",
    icon: MessageSquare
  },
  {
    id: "3",
    type: "decision",
    title: "Offer 到期提醒",
    content: "阿里巴巴 Offer 将在3天后到期，请及时决策",
    time: "3小时前",
    isRead: false,
    link: "/decisions",
    icon: TrendingUp
  },
  {
    id: "4",
    type: "growth",
    title: "周计划完成",
    content: "本周 Skills 自动化任务已完成 8/10 项",
    time: "今天 09:00",
    isRead: true,
    link: "/growth",
    icon: Award
  },
  {
    id: "5",
    type: "system",
    title: "简历优化完成",
    content: "你的「AI 产品经理定向版 v3」简历已优化完成",
    time: "昨天 18:30",
    isRead: true,
    link: "/assets",
    icon: FileText
  },
  {
    id: "6",
    type: "job",
    title: "投递状态更新",
    content: "美团 - 高级产品经理 已查看你的简历",
    time: "昨天 15:20",
    isRead: true,
    link: "/opportunities",
    icon: Briefcase
  }
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  // 未读数量
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  // 标记为已读
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // 标记全部已读
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // 删除通知
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // 清空全部
  const clearAll = () => {
    setNotifications([]);
  };

  // 过滤通知
  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={onClose} />

      {/* 通知面板 */}
      <div
        ref={panelRef}
        className="fixed top-[72px] right-6 w-[420px] max-h-[calc(100vh-100px)] bg-card rounded-[20px] border border-border shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-foreground" />
              <h2 className="font-semibold">通知中心</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* 过滤器和操作 */}
          <div className="flex items-center justify-between">
            {/* 过滤标签 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`
                  px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all
                  ${filter === "all"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50"
                  }
                `}
              >
                全部 ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`
                  px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all
                  ${filter === "unread"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50"
                  }
                `}
              >
                未读 ({unreadCount})
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1.5 rounded-[8px] text-xs text-muted-foreground hover:bg-secondary transition-colors flex items-center gap-1"
                  title="全部已读"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  全部已读
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-2 py-1.5 rounded-[8px] text-xs text-muted-foreground hover:bg-secondary transition-colors flex items-center gap-1"
                  title="清空全部"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === "unread" ? "暂无未读通知" : "暂无通知"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon || Bell;
                return (
                  <div
                    key={notification.id}
                    className={`
                      relative px-5 py-4 hover:bg-secondary/30 transition-colors group
                      ${!notification.isRead ? "bg-primary/5" : ""}
                    `}
                  >
                    <div className="flex gap-3">
                      {/* 图标 */}
                      <div className={`
                        flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center
                        ${notification.type === "job" ? "bg-blue-100 text-blue-600" : ""}
                        ${notification.type === "interview" ? "bg-purple-100 text-purple-600" : ""}
                        ${notification.type === "decision" ? "bg-orange-100 text-orange-600" : ""}
                        ${notification.type === "growth" ? "bg-green-100 text-green-600" : ""}
                        ${notification.type === "system" ? "bg-gray-100 text-gray-600" : ""}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-medium leading-snug">{notification.title}</h3>
                          {!notification.isRead && (
                            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          
                          {/* 操作按钮 */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="px-2 py-1 rounded-[6px] text-xs text-muted-foreground hover:bg-secondary transition-colors"
                                title="标记已读"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {notification.link && (
                              <a
                                href={notification.link}
                                className="px-2 py-1 rounded-[6px] text-xs text-primary hover:bg-primary/10 transition-colors"
                                title="查看详情"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  onClose();
                                }}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="px-2 py-1 rounded-[6px] text-xs text-muted-foreground hover:bg-secondary transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-border bg-secondary/30">
          <button className="w-full h-9 rounded-[10px] text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            通知设置
          </button>
        </div>
      </div>
    </>
  );
}
