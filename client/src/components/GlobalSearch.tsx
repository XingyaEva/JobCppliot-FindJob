import { useState, useRef, useEffect } from "react";
import { Search, X, TrendingUp, Clock, Briefcase, FileText, MessageSquare, Scale, Award, Command } from "lucide-react";
import { useNavigate } from "react-router";

// 搜索结果类型
interface SearchResult {
  id: string;
  type: "job" | "resume" | "interview" | "offer" | "skill" | "page";
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  category: string;
}

// 模拟搜索数据
const mockResults: SearchResult[] = [
  // 岗位
  {
    id: "job-1",
    type: "job",
    title: "字节跳动 - AI 产品经理",
    subtitle: "北京 · 30-50K · 3-5年",
    icon: Briefcase,
    link: "/opportunities",
    category: "岗位机会"
  },
  {
    id: "job-2",
    type: "job",
    title: "腾讯 - 高级产品经理",
    subtitle: "深圳 · 40-70K · 5-10年",
    icon: Briefcase,
    link: "/opportunities",
    category: "岗位机会"
  },
  // 简历
  {
    id: "resume-1",
    type: "resume",
    title: "AI 产品经理定向版 v3",
    subtitle: "最后编辑：2小时前",
    icon: FileText,
    link: "/assets",
    category: "我的简历"
  },
  // 面试
  {
    id: "interview-1",
    type: "interview",
    title: "腾讯二面 - 产品设计",
    subtitle: "明天 14:00",
    icon: MessageSquare,
    link: "/interviews",
    category: "面试安排"
  },
  // Offer
  {
    id: "offer-1",
    type: "offer",
    title: "阿里巴巴 Offer",
    subtitle: "3天后到期",
    icon: Scale,
    link: "/decisions",
    category: "Offer 决策"
  },
  // 技能
  {
    id: "skill-1",
    type: "skill",
    title: "AI 场景落地经验",
    subtitle: "成长中心 - Skills",
    icon: Award,
    link: "/growth",
    category: "成长技能"
  }
];

// 最近搜索（模拟）
const recentSearches = [
  "产品经理",
  "字节跳动",
  "简历优化",
  "面试准备"
];

// 快捷导航
const quickActions = [
  { id: "new-job", label: "新建岗位追踪", icon: Briefcase, link: "/opportunities" },
  { id: "new-resume", label: "创建简历", icon: FileText, link: "/assets" },
  { id: "new-interview", label: "添加面试", icon: MessageSquare, link: "/interviews" },
  { id: "new-offer", label: "录入 Offer", icon: Scale, link: "/decisions" }
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // 搜索逻辑
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const filtered = mockResults.filter(
      item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].link);
          onClose();
          setQuery("");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, navigate, onClose]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    onClose();
    setQuery("");
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  const handleQuickAction = (link: string) => {
    navigate(link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* 搜索面板 */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-card rounded-[24px] border border-border shadow-2xl overflow-hidden">
          {/* 搜索输入框 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索岗位、简历、面试、技能..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-base outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="w-6 h-6 rounded-[8px] flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-[8px] bg-secondary text-xs text-muted-foreground">
              <span>ESC</span>
            </div>
          </div>

          {/* 搜索结果 */}
          <div className="max-h-[500px] overflow-y-auto">
            {query.trim() === "" ? (
              <div className="p-4">
                {/* 最近搜索 */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-xs font-medium text-muted-foreground">最近搜索</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearch(search)}
                          className="px-3 py-1.5 rounded-[10px] bg-secondary hover:bg-secondary/80 text-sm transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 快捷操作 */}
                <div>
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-xs font-medium text-muted-foreground">快捷操作</h3>
                  </div>
                  <div className="space-y-1">
                    {quickActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.link)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] hover:bg-secondary transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-[10px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {/* 按类别分组 */}
                {Array.from(new Set(results.map(r => r.category))).map(category => {
                  const categoryResults = results.filter(r => r.category === category);
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <h3 className="text-xs font-medium text-muted-foreground px-3 py-2">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {categoryResults.map((result, index) => {
                          const globalIndex = results.indexOf(result);
                          const Icon = result.icon;
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all text-left
                                ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                              `}
                            >
                              <div
                                className={`
                                  w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0
                                  ${isSelected ? "bg-primary-foreground/20" : "bg-secondary"}
                                `}
                              >
                                <Icon
                                  className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${isSelected ? "" : ""}`}
                                >
                                  {result.title}
                                </p>
                                {result.subtitle && (
                                  <p
                                    className={`text-xs truncate ${
                                      isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}
                                  >
                                    {result.subtitle}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0 text-xs text-primary-foreground/70">
                                  ↵
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">未找到相关结果</p>
                <p className="text-xs text-muted-foreground mt-1">试试其他关键词</p>
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-3 border-t border-border bg-secondary/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-card border border-border">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-card border border-border">↓</kbd>
                  <span className="ml-1">导航</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-card border border-border">↵</kbd>
                  <span className="ml-1">选择</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>+ K 快捷搜索</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
