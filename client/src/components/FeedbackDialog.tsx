import { X, MessageSquare, Bug, Lightbulb, ThumbsUp, Star } from 'lucide-react';
import { useState } from 'react';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('improvement');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 重置表单
    setTitle('');
    setDescription('');
    setRating(0);
    setIsSubmitting(false);
    
    // 显示成功消息
    alert('感谢您的反馈！我们会认真处理您的建议。');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[540px] bg-card rounded-[28px] border border-border z-[60] shadow-2xl">
        {/* 头部 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold">反馈建议</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* 内容区 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 反馈类型 */}
          <div>
            <label className="block text-sm font-medium mb-3">反馈类型</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`flex items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  feedbackType === 'bug'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <Bug className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">报告问题</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`flex items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  feedbackType === 'feature'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">功能建议</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('improvement')}
                className={`flex items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  feedbackType === 'improvement'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">体验改进</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('other')}
                className={`flex items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  feedbackType === 'other'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">其他</span>
              </button>
            </div>
          </div>

          {/* 评分 */}
          <div>
            <label className="block text-sm font-medium mb-3">整体评分</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简要描述您的反馈..."
              className="w-full px-4 py-2.5 bg-secondary rounded-[14px] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* 详细描述 */}
          <div>
            <label className="block text-sm font-medium mb-2">详细描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述您遇到的问题或建议..."
              rows={6}
              className="w-full px-4 py-3 bg-secondary rounded-[14px] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              required
            />
          </div>

          {/* 底部操作 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 px-4 rounded-[14px] border border-border hover:bg-secondary transition-colors text-sm font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !description}
              className="flex-1 h-11 px-4 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '提交中...' : '提交反馈'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
