import { X, Download, FileText, FileSpreadsheet, File, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface DataExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'json' | 'csv' | 'pdf';

const dataCategories = [
  {
    id: 'profile',
    name: '个人资料',
    description: '包含基本信息、联系方式等',
    size: '2 KB',
  },
  {
    id: 'resumes',
    name: '简历数据',
    description: '所有简历版本和内容',
    size: '156 KB',
  },
  {
    id: 'applications',
    name: '申请记录',
    description: '所有投递和申请历史',
    size: '89 KB',
  },
  {
    id: 'interviews',
    name: '面试数据',
    description: '面试安排、记录和复盘',
    size: '234 KB',
  },
  {
    id: 'offers',
    name: 'Offer 数据',
    description: '收到的 Offer 信息',
    size: '45 KB',
  },
  {
    id: 'growth',
    name: '成长记录',
    description: '技能评估、学习历程',
    size: '67 KB',
  },
];

export function DataExportDialog({ isOpen, onClose }: DataExportDialogProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['profile', 'resumes']);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // 模拟导出
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 创建模拟数据
    const data = {
      exported_at: new Date().toISOString(),
      categories: selectedCategories,
      format: exportFormat,
      data: selectedCategories.reduce((acc, cat) => {
        const category = dataCategories.find(c => c.id === cat);
        if (category) {
          acc[cat] = {
            name: category.name,
            description: category.description,
            // 这里会包含实际数据
            content: `示例 ${category.name} 数据`,
          };
        }
        return acc;
      }, {} as Record<string, any>),
    };

    // 创建下载
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `findjob-export-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
    onClose();
  };

  const totalSize = selectedCategories.reduce((total, id) => {
    const category = dataCategories.find((c) => c.id === id);
    if (!category) return total;
    const size = parseInt(category.size);
    return total + size;
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[540px] bg-card rounded-[28px] border border-border z-[60] shadow-2xl">
        {/* 头部 */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold">导出数据</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* 导出格式 */}
          <div>
            <label className="block text-sm font-medium mb-3">导出格式</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  exportFormat === 'json'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <File className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-xs">JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  exportFormat === 'csv'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-xs">CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-[14px] border transition-all ${
                  exportFormat === 'pdf'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <FileText className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-xs">PDF</span>
              </button>
            </div>
          </div>

          {/* 数据类别 */}
          <div>
            <label className="block text-sm font-medium mb-3">选择数据类别</label>
            <div className="space-y-2">
              {dataCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-start gap-3 p-4 rounded-[14px] border transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'border-2 border-border'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" strokeWidth={2} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{category.name}</p>
                        <span className="text-xs text-muted-foreground">{category.size}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="p-4 rounded-[14px] bg-secondary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">已选择</span>
              <span className="text-sm font-medium">{selectedCategories.length} 个类别</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">预计大小</span>
              <span className="text-sm font-medium">约 {totalSize} KB</span>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="p-4 rounded-[14px] bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground">
              导出的数据将包含您在 FindJob 中的所有相关信息。请妥善保管导出文件，避免泄露个人隐私。
            </p>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 rounded-[14px] border border-border hover:bg-secondary transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedCategories.length === 0}
            className="flex-1 h-11 px-4 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>导出中...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" strokeWidth={1.5} />
                <span>开始导出</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
