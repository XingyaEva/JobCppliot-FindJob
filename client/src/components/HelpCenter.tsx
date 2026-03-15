import { X, Search, BookOpen, Video, FileText, MessageCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpCategories = [
  {
    id: 'getting-started',
    title: '快速入门',
    icon: BookOpen,
    articles: [
      { title: '如何开始使用 FindJob', views: '12.5k' },
      { title: '完善个人求职资料', views: '8.2k' },
      { title: '设置求职偏好', views: '6.1k' },
      { title: '理解会员权益', views: '9.8k' },
    ],
  },
  {
    id: 'opportunities',
    title: '机会工作台',
    icon: BookOpen,
    articles: [
      { title: 'AI 岗位匹配算法说明', views: '15.2k' },
      { title: '如何筛选合适的岗位', views: '11.3k' },
      { title: '智能投递系统使用指南', views: '9.7k' },
      { title: '申请进度跟踪', views: '7.5k' },
    ],
  },
  {
    id: 'assets',
    title: '资产中心',
    icon: FileText,
    articles: [
      { title: '简历智能优化功能', views: '18.9k' },
      { title: 'AI 生成求职信', views: '14.2k' },
      { title: '作品集管理技巧', views: '6.8k' },
      { title: '多版本简历管理', views: '5.3k' },
    ],
  },
  {
    id: 'interviews',
    title: '面试工作台',
    icon: Video,
    articles: [
      { title: 'AI 面试模拟使用指南', views: '22.1k' },
      { title: '面试题库使用技巧', views: '16.7k' },
      { title: '面试复盘功能说明', views: '13.4k' },
      { title: '面试助手实时辅助', views: '19.8k' },
    ],
  },
  {
    id: 'decisions',
    title: '决策中心',
    icon: BookOpen,
    articles: [
      { title: 'Offer 对比分析功能', views: '10.2k' },
      { title: '智能决策建议系统', views: '8.9k' },
      { title: '薪资谈判策略', views: '15.6k' },
      { title: 'AI 职业建议解读', views: '7.1k' },
    ],
  },
  {
    id: 'growth',
    title: '成长中心',
    icon: BookOpen,
    articles: [
      { title: '职业发展路径规划', views: '12.8k' },
      { title: '技能提升建议', views: '11.5k' },
      { title: '学习资源推荐', views: '9.2k' },
      { title: '行业趋势分析', views: '14.3k' },
    ],
  },
];

const popularArticles = [
  { title: 'FindJob 完整使用指南', category: '新手必读', views: '35.2k' },
  { title: '如何提高岗位匹配度', category: '机会工作台', views: '28.7k' },
  { title: 'AI 面试模拟最佳实践', category: '面试工作台', views: '31.4k' },
  { title: '高级会员功能详解', category: '会员权益', views: '26.1k' },
];

export function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-card border-l border-border z-50 flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold">帮助中心</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索帮助文章..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-[14px] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* 热门文章 */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">热门文章</h3>
              <div className="space-y-2">
                {popularArticles.map((article, index) => (
                  <button
                    key={index}
                    className="w-full flex items-start justify-between px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors group"
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium mb-1">{article.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{article.category}</span>
                        <span>·</span>
                        <span>{article.views} 阅读</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </section>

            {/* 分类文章 */}
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <section key={category.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <h3 className="text-sm font-medium text-muted-foreground">{category.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.articles.map((article, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-[14px] hover:bg-secondary transition-colors group"
                      >
                        <span className="text-sm">{article.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{article.views}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* 联系支持 */}
            <section className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">需要更多帮助？</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">联系客服</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] hover:bg-secondary transition-colors">
                  <Video className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm">观看视频教程</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
