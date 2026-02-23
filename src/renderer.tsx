import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Job Copilot - 智能求职助手'}</title>
        {/* TailwindCSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Tailwind 配置 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: '#000000',
                    secondary: '#6B7280',
                    surface: '#F9FAFB',
                    border: '#E5E7EB',
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                  }
                }
              }
            }
          `
        }} />
        {/* FontAwesome 图标 */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        {/* 全局样式 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 动画 */
            @keyframes slide-up {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-slide-up {
              animation: slide-up 0.3s ease-out;
            }

            /* 骨架屏 */
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
              border-radius: 4px;
            }

            /* 加载旋转 */
            .loading-spinner {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            /* 卡片悬停效果 */
            .card-hover {
              transition: all 0.2s ease;
            }
            .card-hover:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            /* 滚动条优化 */
            ::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            ::-webkit-scrollbar-track {
              background: #f1f1f1;
            }
            ::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 3px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #a1a1a1;
            }

            /* 响应式优化 */
            @media (max-width: 640px) {
              .mobile-full {
                width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
              }
            }
          `
        }} />
      </head>
      <body class="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
        {children}
        {/* 全局脚本 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // 全局命名空间
            window.JobCopilot = window.JobCopilot || {};

            // Toast 通知
            window.JobCopilot.showToast = function(message, type) {
              type = type || 'success';
              var toast = document.createElement('div');
              var bgColor = type === 'success' ? 'bg-green-600' : 
                            type === 'error' ? 'bg-red-600' : 
                            type === 'warning' ? 'bg-yellow-600' : 'bg-gray-800';
              toast.className = 'fixed bottom-4 right-4 ' + bgColor + ' text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-up';
              var icon = type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-times-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
              toast.innerHTML = '<i class="fas ' + icon + '"></i><span>' + message + '</span>';
              document.body.appendChild(toast);
              setTimeout(function() {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                toast.style.transition = 'all 0.3s';
                setTimeout(function() { toast.remove(); }, 300);
              }, 3000);
            };

            // 导出数据
            window.JobCopilot.exportData = function() {
              var data = {
                jobs: JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]'),
                resumes: JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]'),
                matches: JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]'),
                interviews: JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]'),
                optimizations: JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]'),
                exportedAt: new Date().toISOString(),
                version: '0.6.0'
              };
              
              var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              var url = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = url;
              a.download = 'jobcopilot_data_' + new Date().toISOString().split('T')[0] + '.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              JobCopilot.showToast('数据已导出');
            };

            // 清空数据
            window.JobCopilot.clearData = function() {
              if (!confirm('确定要清空所有数据吗？此操作不可撤销。')) return;
              
              localStorage.removeItem('jobcopilot_jobs');
              localStorage.removeItem('jobcopilot_resumes');
              localStorage.removeItem('jobcopilot_matches');
              localStorage.removeItem('jobcopilot_interviews');
              localStorage.removeItem('jobcopilot_optimizations');
              
              JobCopilot.showToast('数据已清空');
              setTimeout(function() { location.href = '/'; }, 500);
            };

            // 删除单条岗位
            window.JobCopilot.deleteJob = function(jobId) {
              if (!confirm('确定要删除这个岗位吗？相关的匹配结果和面试准备也会被删除。')) return;
              
              var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
              var filtered = jobs.filter(function(j) { return j.id !== jobId; });
              localStorage.setItem('jobcopilot_jobs', JSON.stringify(filtered));
              
              // 同时删除关联数据
              var matches = JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]');
              localStorage.setItem('jobcopilot_matches', JSON.stringify(matches.filter(function(m) { return m.job_id !== jobId; })));
              
              var interviews = JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]');
              localStorage.setItem('jobcopilot_interviews', JSON.stringify(interviews.filter(function(i) { return i.job_id !== jobId; })));
              
              var optimizations = JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]');
              localStorage.setItem('jobcopilot_optimizations', JSON.stringify(optimizations.filter(function(o) { return o.job_id !== jobId; })));
              
              JobCopilot.showToast('岗位已删除');
              location.reload();
            };

            // 删除简历
            window.JobCopilot.deleteResume = function(resumeId) {
              if (!confirm('确定要删除这份简历吗？')) return;
              
              var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              var filtered = resumes.filter(function(r) { return r.id !== resumeId; });
              localStorage.setItem('jobcopilot_resumes', JSON.stringify(filtered));
              
              JobCopilot.showToast('简历已删除');
              location.reload();
            };

            // 获取简历状态
            window.JobCopilot.getResumeStatus = function() {
              var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              return {
                hasResume: resumes.length > 0,
                resumeName: resumes[0] && resumes[0].basic_info ? resumes[0].basic_info.name : '未上传'
              };
            };

            // ========== 评测数据收集 ==========
            var METRICS_KEY = 'jobcopilot_metrics';
            var MAX_METRICS = 1000;

            // 保存评测数据
            window.JobCopilot.saveMetrics = function(metrics) {
              if (!metrics) return;
              try {
                var data = JSON.parse(localStorage.getItem(METRICS_KEY) || '[]');
                // 添加唯一 ID
                metrics.id = 'metric_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                data.push(metrics);
                // 限制数量
                if (data.length > MAX_METRICS) {
                  data = data.slice(-MAX_METRICS);
                }
                localStorage.setItem(METRICS_KEY, JSON.stringify(data));
                console.log('[Metrics] 已保存评测数据:', metrics.agent_name, metrics.model, metrics.duration_ms + 'ms');
              } catch (e) {
                console.error('[Metrics] 保存失败:', e);
              }
            };

            // 批量保存评测数据
            window.JobCopilot.saveMetricsBatch = function(metricsArray) {
              if (!metricsArray || !Array.isArray(metricsArray)) return;
              metricsArray.forEach(function(m) {
                JobCopilot.saveMetrics(m);
              });
            };

            // 获取评测数据
            window.JobCopilot.getMetrics = function() {
              try {
                return JSON.parse(localStorage.getItem(METRICS_KEY) || '[]');
              } catch (e) {
                return [];
              }
            };

            // 清空评测数据
            window.JobCopilot.clearMetrics = function() {
              localStorage.removeItem(METRICS_KEY);
              console.log('[Metrics] 评测数据已清空');
            };

            // ========== 实验配置 ==========
            var EXPERIMENTS_KEY = 'jobcopilot_experiments';

            // 获取实验配置
            window.JobCopilot.getExperiments = function() {
              try {
                return JSON.parse(localStorage.getItem(EXPERIMENTS_KEY) || '[]');
              } catch (e) {
                return [];
              }
            };

            // 保存实验配置
            window.JobCopilot.saveExperiments = function(experiments) {
              localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(experiments));
            };

            // ==================== 飞书同步自动恢复 ====================
            // 页面加载时自动将 localStorage 中的飞书配置同步到后端
            (function initFeishuSync() {
              try {
                var saved = localStorage.getItem('jobcopilot_feishu_config');
                if (saved) {
                  var cfg = JSON.parse(saved);
                  if (cfg.appId && cfg.appSecret && cfg.appToken && cfg.tableId && cfg.enabled) {
                    fetch('/api/feishu/config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        appId: cfg.appId,
                        appSecret: cfg.appSecret,
                        appToken: cfg.appToken,
                        tableId: cfg.tableId,
                        enabled: cfg.enabled
                      })
                    }).catch(function() {});
                  }
                }
              } catch(e) {}
            })();
          `
        }} />
      </body>
    </html>
  )
})
