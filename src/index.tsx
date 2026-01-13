/**
 * Job Copilot - 智能求职助手
 * 主入口文件
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { chat, MODELS } from './core/api-client'
import jobRoutes from './routes/job'
import resumeRoutes, { matchRoutes } from './routes/resume'
import interviewRoutes from './routes/interview'
import optimizeRoutes from './routes/optimize'
import { metricsRoutes } from './routes/metrics'

// 创建应用实例
const app = new Hono()

// 中间件
app.use('*', cors())
app.use(renderer)

// ==================== 页面路由 ====================

// 首页
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 统一导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/" class="flex items-center gap-2 font-bold text-lg">
              <span class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                <i class="fas fa-robot"></i>
              </span>
              <span class="hidden sm:inline">Job Copilot</span>
            </a>
            <nav class="flex items-center gap-1">
              <a href="/" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-home mr-1.5"></i><span class="hidden sm:inline">首页</span>
              </a>
              <a href="/jobs" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-briefcase mr-1.5"></i><span class="hidden sm:inline">岗位库</span>
              </a>
              <a href="/resume" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-file-alt mr-1.5"></i><span class="hidden sm:inline">我的简历</span>
              </a>
              <a href="/metrics" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-chart-bar mr-1.5"></i><span class="hidden sm:inline">评测</span>
              </a>
            </nav>
            <div class="flex items-center gap-2">
              <span id="resume-status-nav" class="hidden sm:flex text-xs text-gray-500 items-center">
                <i class="fas fa-user-circle mr-1"></i>未上传简历
              </span>
              <a href="/job/new" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                <i class="fas fa-plus mr-1"></i><span class="hidden sm:inline">新建</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* 使用指南 */}
        <div id="guide-section" class="mb-8">
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h2 class="text-lg font-semibold mb-4">
              <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
              使用流程
            </h2>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-2">
              <div class="flex items-center gap-2">
                <div id="step-1" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">1</div>
                <span class="text-sm text-gray-600">解析岗位</span>
              </div>
              <div class="hidden sm:block w-8 h-0.5 bg-gray-200"></div>
              <div class="flex items-center gap-2">
                <div id="step-2" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">2</div>
                <span class="text-sm text-gray-600">上传简历</span>
              </div>
              <div class="hidden sm:block w-8 h-0.5 bg-gray-200"></div>
              <div class="flex items-center gap-2">
                <div id="step-3" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">3</div>
                <span class="text-sm text-gray-600">匹配评估</span>
              </div>
              <div class="hidden sm:block w-8 h-0.5 bg-gray-200"></div>
              <div class="flex items-center gap-2">
                <div id="step-4" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">4</div>
                <span class="text-sm text-gray-600">面试准备</span>
              </div>
              <div class="hidden sm:block w-8 h-0.5 bg-gray-200"></div>
              <div class="flex items-center gap-2">
                <div id="step-5" class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-medium">5</div>
                <span class="text-sm text-gray-600">优化简历</span>
              </div>
            </div>
          </div>
        </div>

        {/* 快速入口 */}
        <div class="mb-8">
          <a 
            href="/job/new" 
            class="block w-full max-w-xl mx-auto p-8 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50 transition-all card-hover"
          >
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-plus text-2xl text-blue-500"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">新建岗位解析</h2>
            <p class="text-gray-500">上传 JD 截图 或 粘贴岗位描述</p>
          </a>
        </div>

        {/* 最近解析的岗位 */}
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">最近解析的岗位</h2>
            <a href="/jobs" class="text-sm text-blue-500 hover:text-blue-600">
              查看全部 <i class="fas fa-arrow-right ml-1"></i>
            </a>
          </div>

          <div id="recent-jobs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 骨架屏 */}
            <div class="p-4 border border-gray-200 rounded-xl">
              <div class="skeleton h-5 w-3/4 mb-3"></div>
              <div class="skeleton h-4 w-1/2 mb-4"></div>
              <div class="flex gap-2">
                <div class="skeleton h-6 w-16 rounded-full"></div>
                <div class="skeleton h-6 w-20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer class="border-t border-gray-100 mt-auto">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div class="flex items-center gap-4">
              <span>Job Copilot v0.6.0</span>
              <span class="hidden sm:inline">|</span>
              <span class="hidden sm:inline">Phase 5 - 体验优化</span>
            </div>
            <div class="flex items-center gap-4">
              <button onclick="JobCopilot.exportData()" class="hover:text-gray-600 transition-colors">
                <i class="fas fa-download mr-1"></i>导出数据
              </button>
              <button onclick="JobCopilot.clearData()" class="hover:text-red-500 transition-colors">
                <i class="fas fa-trash-alt mr-1"></i>清空数据
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 页面脚本 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            // 加载最近岗位
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            var recentJobs = document.getElementById('recent-jobs');
            var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            
            // 更新简历状态
            var resumeNav = document.getElementById('resume-status-nav');
            if (resumeNav && resumes.length > 0) {
              resumeNav.innerHTML = '<i class="fas fa-check-circle text-green-500 mr-1"></i>' + 
                (resumes[0].basic_info?.name || '已上传');
            }
            
            // 更新步骤指引
            if (jobs.length > 0) {
              document.getElementById('step-1').className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium';
              document.getElementById('step-1').innerHTML = '<i class="fas fa-check"></i>';
            }
            if (resumes.length > 0) {
              document.getElementById('step-2').className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium';
              document.getElementById('step-2').innerHTML = '<i class="fas fa-check"></i>';
            }
            
            // 渲染岗位列表
            if (jobs.length === 0) {
              recentJobs.innerHTML = '<div class="col-span-full p-8 bg-gray-50 rounded-xl text-center text-gray-400">' +
                '<i class="fas fa-inbox text-3xl mb-3"></i>' +
                '<p>暂无解析记录</p>' +
                '<p class="text-sm mt-1">点击上方按钮开始解析岗位</p>' +
                '</div>';
              return;
            }
            
            recentJobs.innerHTML = jobs.slice(0, 6).map(function(job) {
              var statusColor = job.status === 'completed' ? 'green' : (job.status === 'error' ? 'red' : 'yellow');
              return '<div class="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow card-hover">' +
                '<div class="flex items-start justify-between mb-2">' +
                '<a href="/job/' + job.id + '" class="font-semibold text-gray-900 hover:text-blue-600">' + job.title + '</a>' +
                '<button onclick="event.stopPropagation();JobCopilot.deleteJob(\\'' + job.id + '\\')" class="text-gray-400 hover:text-red-500 p-1" title="删除">' +
                '<i class="fas fa-trash-alt text-xs"></i></button>' +
                '</div>' +
                '<p class="text-sm text-gray-500 mb-3">' + job.company + '</p>' +
                '<div class="flex flex-wrap gap-2 mb-3">' +
                (job.a_analysis?.A2_product_type?.type ? '<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">' + job.a_analysis.A2_product_type.type + '</span>' : '') +
                (job.a_analysis?.A3_business_domain?.primary ? '<span class="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">' + job.a_analysis.A3_business_domain.primary + '</span>' : '') +
                '</div>' +
                '<div class="flex items-center justify-between text-xs text-gray-400">' +
                '<span>' + new Date(job.created_at).toLocaleDateString() + '</span>' +
                '<a href="/job/' + job.id + '/match" class="text-blue-500 hover:text-blue-600">匹配分析 →</a>' +
                '</div>' +
                '</div>';
            }).join('');
          });
        `
      }} />
    </div>,
    { title: 'Job Copilot - 智能求职助手' }
  )
})

// 新建岗位解析页
app.get('/job/new', (c) => {
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <a href="/" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="fas fa-arrow-left"></i>
          </a>
          <h1 class="text-xl font-bold">新建岗位解析</h1>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 输入区域 */}
        <div class="space-y-6">
          {/* 图片上传 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              上传JD截图
            </label>
            <div 
              id="upload-area"
              class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            >
              <input type="file" id="jd-image" accept="image/*" class="hidden" />
              <div id="upload-placeholder">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">拖拽图片到此处，或点击选择</p>
                <p class="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式</p>
                <p class="text-sm text-blue-500 mt-2">
                  <i class="fas fa-paste mr-1"></i>
                  支持 Ctrl+V / Cmd+V 直接粘贴截图
                </p>
              </div>
              <div id="upload-preview" class="hidden">
                <img id="preview-image" class="max-h-64 mx-auto rounded-lg" />
                <button id="remove-image" class="mt-4 text-red-500 text-sm hover:text-red-600">
                  <i class="fas fa-times mr-1"></i>移除图片
                </button>
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div class="flex items-center gap-4">
            <div class="flex-1 border-t border-gray-200"></div>
            <span class="text-gray-400 text-sm">或者</span>
            <div class="flex-1 border-t border-gray-200"></div>
          </div>

          {/* 文本输入 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              粘贴JD文本
            </label>
            <textarea 
              id="jd-text"
              class="w-full h-64 p-4 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none resize-none"
              placeholder="将岗位描述文本粘贴到这里...&#10;&#10;例如：&#10;岗位职责：&#10;1. 负责xxx产品的需求分析和产品设计&#10;2. ...&#10;&#10;任职要求：&#10;1. 本科及以上学历&#10;2. ..."
            ></textarea>
          </div>

          {/* 岗位链接输入 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-link mr-1 text-gray-400"></i>
              岗位链接（选填）
            </label>
            <input 
              type="url"
              id="job-url"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none"
              placeholder="https://www.zhipin.com/job/xxx 或其他招聘网站链接"
            />
            <p id="url-hint" class="text-xs text-gray-400 mt-1">
              <i class="fas fa-lightbulb mr-1"></i>
              填写岗位原始链接，方便后续查看原帖
            </p>
          </div>

          {/* 提交按钮 */}
          <div class="flex justify-center">
            <button 
              id="parse-btn"
              class="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-magic mr-2"></i>
              开始解析
            </button>
          </div>
        </div>

        {/* 解析进度区域 */}
        <div id="parse-progress" class="hidden mt-8">
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="font-semibold mb-4">
              <i class="fas fa-spinner loading-spinner mr-2"></i>
              正在解析...
            </h3>
            <div id="dag-nodes" class="space-y-3">
              {/* DAG节点状态将通过JS动态渲染 */}
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        <div id="parse-error" class="hidden mt-8">
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span id="error-message">解析失败</span>
          </div>
        </div>
      </main>

      {/* 页面专用脚本 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const uploadArea = document.getElementById('upload-area');
            const fileInput = document.getElementById('jd-image');
            const textInput = document.getElementById('jd-text');
            const parseBtn = document.getElementById('parse-btn');
            const progressArea = document.getElementById('parse-progress');
            const dagNodes = document.getElementById('dag-nodes');
            const errorArea = document.getElementById('parse-error');
            const errorMessage = document.getElementById('error-message');
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            const uploadPreview = document.getElementById('upload-preview');
            const previewImage = document.getElementById('preview-image');
            const removeImageBtn = document.getElementById('remove-image');

            let selectedImage = null;
            let imageDataUrl = null;

            // 点击上传区域
            uploadArea.addEventListener('click', function(e) {
              if (e.target !== removeImageBtn && !removeImageBtn.contains(e.target)) {
                fileInput.click();
              }
            });

            // 拖拽上传
            uploadArea.addEventListener('dragover', function(e) {
              e.preventDefault();
              uploadArea.classList.add('border-gray-400', 'bg-gray-50');
            });

            uploadArea.addEventListener('dragleave', function(e) {
              e.preventDefault();
              uploadArea.classList.remove('border-gray-400', 'bg-gray-50');
            });

            uploadArea.addEventListener('drop', function(e) {
              e.preventDefault();
              uploadArea.classList.remove('border-gray-400', 'bg-gray-50');
              const files = e.dataTransfer.files;
              if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleImageSelect(files[0]);
              }
            });

            // 文件选择
            fileInput.addEventListener('change', function(e) {
              if (e.target.files.length > 0) {
                handleImageSelect(e.target.files[0]);
              }
            });

            // 处理图片选择
            function handleImageSelect(file) {
              selectedImage = file;
              const reader = new FileReader();
              reader.onload = function(e) {
                imageDataUrl = e.target.result;
                previewImage.src = imageDataUrl;
                uploadPlaceholder.classList.add('hidden');
                uploadPreview.classList.remove('hidden');
                textInput.value = ''; // 清空文本
              };
              reader.readAsDataURL(file);
            }

            // 移除图片
            removeImageBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              selectedImage = null;
              imageDataUrl = null;
              fileInput.value = '';
              uploadPlaceholder.classList.remove('hidden');
              uploadPreview.classList.add('hidden');
            });

            // 文本输入时清除图片
            textInput.addEventListener('input', function() {
              if (textInput.value.trim() && selectedImage) {
                selectedImage = null;
                imageDataUrl = null;
                fileInput.value = '';
                uploadPlaceholder.classList.remove('hidden');
                uploadPreview.classList.add('hidden');
              }
            });

            // 剪贴板粘贴图片支持
            document.addEventListener('paste', function(e) {
              // 如果焦点在文本输入框，不处理图片粘贴
              if (document.activeElement === textInput) {
                return;
              }
              
              const items = e.clipboardData?.items;
              if (!items) return;
              
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith('image/')) {
                  e.preventDefault();
                  const file = item.getAsFile();
                  if (file) {
                    // 显示粘贴成功提示
                    if (window.JobCopilot && window.JobCopilot.showToast) {
                      window.JobCopilot.showToast('截图已粘贴', 'success');
                    }
                    handleImageSelect(file);
                  }
                  break;
                }
              }
            });

            // 上传区域获得焦点时的视觉反馈
            uploadArea.setAttribute('tabindex', '0');
            uploadArea.addEventListener('focus', function() {
              uploadArea.classList.add('border-blue-400', 'ring-2', 'ring-blue-100');
            });
            uploadArea.addEventListener('blur', function() {
              uploadArea.classList.remove('border-blue-400', 'ring-2', 'ring-blue-100');
            });
            
            // 键盘快捷键提示
            uploadArea.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // paste 事件会自动触发，这里只是为了视觉反馈
                uploadArea.classList.add('bg-blue-50');
                setTimeout(() => {
                  uploadArea.classList.remove('bg-blue-50');
                }, 200);
              }
            });

            // 岗位链接输入框
            const jobUrlInput = document.getElementById('job-url');
            const urlHint = document.getElementById('url-hint');
            
            // URL 校验函数
            function validateJobUrl(url) {
              if (!url || url.trim() === '') {
                return { valid: true };
              }
              try {
                const parsed = new URL(url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                  return { valid: false, warning: '链接必须以 http:// 或 https:// 开头' };
                }
                return { valid: true };
              } catch {
                return { valid: false, warning: '请输入有效的链接格式' };
              }
            }
            
            // URL 输入时实时校验
            jobUrlInput.addEventListener('input', function() {
              const result = validateJobUrl(jobUrlInput.value);
              if (!result.valid) {
                urlHint.innerHTML = '<i class="fas fa-exclamation-triangle mr-1 text-yellow-500"></i>' + result.warning;
                urlHint.className = 'text-xs text-yellow-600 mt-1';
              } else {
                urlHint.innerHTML = '<i class="fas fa-lightbulb mr-1"></i>填写岗位原始链接，方便后续查看原帖';
                urlHint.className = 'text-xs text-gray-400 mt-1';
              }
            });

            // 解析按钮点击
            parseBtn.addEventListener('click', async function() {
              const text = textInput.value.trim();
              const jobUrl = jobUrlInput.value.trim();
              
              if (!text && !imageDataUrl) {
                alert('请上传JD截图或粘贴JD文本');
                return;
              }
              
              // 校验 URL（可选字段，但格式必须正确）
              const urlValidation = validateJobUrl(jobUrl);
              if (!urlValidation.valid) {
                alert(urlValidation.warning);
                return;
              }

              // 显示进度
              parseBtn.disabled = true;
              parseBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>解析中...';
              progressArea.classList.remove('hidden');
              errorArea.classList.add('hidden');

              // 渲染初始DAG节点
              renderDAGNodes([
                { id: 'preprocess', name: 'JD预处理', status: 'pending' },
                { id: 'structure', name: 'JD结构化', status: 'pending' },
                { id: 'analysis-a', name: 'A维度分析', status: 'pending' },
                { id: 'analysis-b', name: 'B维度分析', status: 'pending' },
              ]);

              try {
                // 调用同步解析API
                const response = await fetch('/api/job/parse-sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: imageDataUrl ? 'image' : 'text',
                    content: text || undefined,
                    imageUrl: imageDataUrl || undefined,
                    jobUrl: jobUrl || undefined,
                  }),
                });

                const result = await response.json();

                if (result.success) {
                  // 更新DAG状态
                  if (result.dagState) {
                    renderDAGNodes(result.dagState.nodes);
                  }
                  
                  // 保存评测数据
                  if (result.metrics && window.JobCopilot && window.JobCopilot.saveMetricsBatch) {
                    window.JobCopilot.saveMetricsBatch(result.metrics);
                  }
                  
                  // 跳转到详情页
                  setTimeout(() => {
                    // 将结果存储到localStorage
                    const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
                    jobs.unshift(result.job);
                    localStorage.setItem('jobcopilot_jobs', JSON.stringify(jobs));
                    
                    // 跳转
                    window.location.href = '/job/' + result.job.id;
                  }, 1000);
                } else {
                  throw new Error(result.error || '解析失败');
                }
              } catch (error) {
                console.error('解析失败:', error);
                errorMessage.textContent = error.message || '解析失败，请重试';
                errorArea.classList.remove('hidden');
                progressArea.classList.add('hidden');
                parseBtn.disabled = false;
                parseBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>开始解析';
              }
            });

            // 渲染DAG节点
            function renderDAGNodes(nodes) {
              dagNodes.innerHTML = nodes.map(node => {
                let statusIcon, statusClass;
                switch (node.status) {
                  case 'completed':
                    statusIcon = 'fa-check-circle';
                    statusClass = 'text-green-500';
                    break;
                  case 'running':
                    statusIcon = 'fa-spinner loading-spinner';
                    statusClass = 'text-blue-500';
                    break;
                  case 'error':
                    statusIcon = 'fa-times-circle';
                    statusClass = 'text-red-500';
                    break;
                  default:
                    statusIcon = 'fa-circle';
                    statusClass = 'text-gray-300';
                }
                
                const duration = node.result?.duration_ms 
                  ? ' (' + (node.result.duration_ms / 1000).toFixed(1) + 's)'
                  : '';
                
                return '<div class="flex items-center gap-3">' +
                  '<i class="fas ' + statusIcon + ' ' + statusClass + '"></i>' +
                  '<span class="' + (node.status === 'completed' ? 'text-gray-900' : 'text-gray-500') + '">' +
                  node.name + duration +
                  '</span>' +
                  '</div>';
              }).join('');
            }
          });
        `
      }} />
    </div>,
    { title: '新建岗位解析 - Job Copilot' }
  )
})

// 岗位详情页
app.get('/job/:id', (c) => {
  const jobId = c.req.param('id');
  
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <a href="/jobs" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="fas fa-arrow-left"></i>
          </a>
          <h1 id="page-title" class="text-xl font-bold">岗位详情</h1>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 加载状态 */}
        <div id="loading" class="text-center py-12">
          <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">加载中...</p>
        </div>

        {/* 岗位详情内容 */}
        <div id="job-content" class="hidden space-y-8">
          {/* 基本信息 */}
          <div class="bg-gray-50 rounded-xl p-6">
            <h2 id="job-title" class="text-2xl font-bold mb-2">岗位名称</h2>
            <p id="job-company" class="text-gray-600 mb-2">
              <i class="fas fa-building mr-2"></i>
              <span>公司名称</span>
            </p>
            {/* 岗位链接 */}
            <div id="job-url-section" class="mb-4 hidden">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm text-gray-500">
                  <i class="fas fa-link mr-1"></i>原帖链接：
                </span>
                <a id="job-url-link" href="#" target="_blank" rel="noopener noreferrer" 
                   class="text-sm text-blue-500 hover:text-blue-600 hover:underline truncate max-w-xs">
                </a>
                <button id="edit-url-btn" class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 border border-gray-200 rounded hover:bg-gray-100">
                  <i class="fas fa-edit mr-1"></i>编辑
                </button>
              </div>
            </div>
            {/* 无链接时显示添加按钮 */}
            <div id="add-url-section" class="mb-4 hidden">
              <button id="add-url-btn" class="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                <i class="fas fa-plus-circle"></i>
                <span>添加岗位链接</span>
              </button>
            </div>
            {/* 编辑链接表单 */}
            <div id="url-edit-form" class="mb-4 hidden">
              <div class="flex items-center gap-2">
                <input type="url" id="url-input" 
                       class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
                       placeholder="https://www.zhipin.com/job/xxx" />
                <button id="save-url-btn" class="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  保存
                </button>
                <button id="cancel-url-btn" class="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                  取消
                </button>
              </div>
              <p id="url-edit-hint" class="text-xs text-gray-400 mt-1"></p>
            </div>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              <span id="job-location"><i class="fas fa-map-marker-alt mr-1"></i>地点</span>
              <span id="job-salary"><i class="fas fa-yen-sign mr-1"></i>薪资</span>
            </div>
          </div>

          {/* A维度分析 */}
          <div>
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">A</span>
              岗位速览
            </h3>
            <div id="a-analysis" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* A维度内容将通过JS动态渲染 */}
            </div>
          </div>

          {/* B维度分析 */}
          <div>
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">B</span>
              岗位深度拆解
            </h3>
            <div id="b-analysis" class="space-y-4">
              {/* B维度内容将通过JS动态渲染 */}
            </div>
          </div>

          {/* 操作按钮 */}
          <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <a href="/resume" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <i class="fas fa-file-alt mr-2"></i>上传简历进行匹配
            </a>
            <button id="show-raw-btn" class="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fas fa-file-lines mr-2"></i>查看原始JD
            </button>
          </div>

          {/* 原始JD（折叠） */}
          <div id="raw-jd-section" class="hidden">
            <div class="bg-gray-50 rounded-xl p-6">
              <h4 class="font-semibold mb-3">原始JD内容</h4>
              <pre id="raw-jd" class="whitespace-pre-wrap text-sm text-gray-600"></pre>
            </div>
          </div>
        </div>

        {/* 错误状态 */}
        <div id="error" class="hidden text-center py-12">
          <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>
          <p id="error-text" class="text-red-500">加载失败</p>
          <a href="/jobs" class="inline-block mt-4 text-blue-500 hover:underline">返回岗位库</a>
        </div>
      </main>

      {/* 页面专用脚本 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const jobId = '${jobId}';
            const loading = document.getElementById('loading');
            const content = document.getElementById('job-content');
            const error = document.getElementById('error');
            const errorText = document.getElementById('error-text');

            // 从localStorage获取岗位数据
            const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            const job = jobs.find(j => j.id === jobId);

            if (!job) {
              loading.classList.add('hidden');
              error.classList.remove('hidden');
              errorText.textContent = '未找到岗位信息';
              return;
            }

            // 渲染基本信息
            document.getElementById('page-title').textContent = job.title + ' @ ' + job.company;
            document.getElementById('job-title').textContent = job.title;
            document.getElementById('job-company').querySelector('span').textContent = job.company;
            document.getElementById('job-location').innerHTML = '<i class="fas fa-map-marker-alt mr-1"></i>' + (job.structured_jd?.location || '未知');
            document.getElementById('job-salary').innerHTML = '<i class="fas fa-yen-sign mr-1"></i>' + (job.structured_jd?.salary || '面议');

            // 岗位链接相关元素
            const jobUrlSection = document.getElementById('job-url-section');
            const addUrlSection = document.getElementById('add-url-section');
            const urlEditForm = document.getElementById('url-edit-form');
            const jobUrlLink = document.getElementById('job-url-link');
            const urlInput = document.getElementById('url-input');
            const urlEditHint = document.getElementById('url-edit-hint');
            
            // 截断 URL 显示
            function truncateUrl(url, maxLen) {
              try {
                const parsed = new URL(url);
                let display = parsed.hostname + parsed.pathname;
                if (display.length > maxLen) {
                  display = display.substring(0, maxLen - 3) + '...';
                }
                return display;
              } catch {
                return url.length > maxLen ? url.substring(0, maxLen - 3) + '...' : url;
              }
            }
            
            // 渲染链接状态
            function renderJobUrl() {
              if (job.job_url) {
                jobUrlLink.href = job.job_url;
                jobUrlLink.textContent = truncateUrl(job.job_url, 40);
                jobUrlLink.title = job.job_url;
                jobUrlSection.classList.remove('hidden');
                addUrlSection.classList.add('hidden');
              } else {
                jobUrlSection.classList.add('hidden');
                addUrlSection.classList.remove('hidden');
              }
              urlEditForm.classList.add('hidden');
            }
            renderJobUrl();
            
            // 添加链接按钮
            document.getElementById('add-url-btn').addEventListener('click', function() {
              urlInput.value = '';
              addUrlSection.classList.add('hidden');
              urlEditForm.classList.remove('hidden');
              urlInput.focus();
            });
            
            // 编辑链接按钮
            document.getElementById('edit-url-btn').addEventListener('click', function() {
              urlInput.value = job.job_url || '';
              jobUrlSection.classList.add('hidden');
              urlEditForm.classList.remove('hidden');
              urlInput.focus();
            });
            
            // 取消编辑
            document.getElementById('cancel-url-btn').addEventListener('click', function() {
              renderJobUrl();
            });
            
            // URL 校验
            function validateUrl(url) {
              if (!url || url.trim() === '') return { valid: true };
              try {
                const parsed = new URL(url);
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                  return { valid: false, warning: '链接必须以 http:// 或 https:// 开头' };
                }
                return { valid: true };
              } catch {
                return { valid: false, warning: '请输入有效的链接格式' };
              }
            }
            
            // URL 输入校验
            urlInput.addEventListener('input', function() {
              const result = validateUrl(urlInput.value);
              urlEditHint.textContent = result.valid ? '' : result.warning;
              urlEditHint.className = result.valid ? 'text-xs text-gray-400 mt-1' : 'text-xs text-red-500 mt-1';
            });
            
            // 保存链接
            document.getElementById('save-url-btn').addEventListener('click', function() {
              const newUrl = urlInput.value.trim();
              const validation = validateUrl(newUrl);
              if (!validation.valid) {
                urlEditHint.textContent = validation.warning;
                urlEditHint.className = 'text-xs text-red-500 mt-1';
                return;
              }
              
              // 更新 job 数据
              job.job_url = newUrl || undefined;
              job.updated_at = new Date().toISOString();
              
              // 保存到 localStorage
              const jobIndex = jobs.findIndex(j => j.id === jobId);
              if (jobIndex !== -1) {
                jobs[jobIndex] = job;
                localStorage.setItem('jobcopilot_jobs', JSON.stringify(jobs));
              }
              
              // 显示成功提示
              if (window.JobCopilot && window.JobCopilot.showToast) {
                window.JobCopilot.showToast(newUrl ? '链接已保存' : '链接已删除', 'success');
              }
              
              renderJobUrl();
            });
            
            // 点击链接时确认跳转
            jobUrlLink.addEventListener('click', function(e) {
              e.preventDefault();
              const url = this.href;
              if (confirm('即将跳转到外部网站查看「' + job.title + '」原帖\\n\\n' + url + '\\n\\n是否继续？')) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            });

            // 渲染A维度
            renderAAnalysis(job.a_analysis);

            // 渲染B维度
            renderBAnalysis(job.b_analysis);

            // 原始JD
            document.getElementById('raw-jd').textContent = job.raw_content || '无原始内容';
            document.getElementById('show-raw-btn').addEventListener('click', function() {
              const section = document.getElementById('raw-jd-section');
              section.classList.toggle('hidden');
              this.innerHTML = section.classList.contains('hidden')
                ? '<i class="fas fa-file-lines mr-2"></i>查看原始JD'
                : '<i class="fas fa-times mr-2"></i>隐藏原始JD';
            });

            // 显示内容
            loading.classList.add('hidden');
            content.classList.remove('hidden');

            // 渲染A维度分析
            function renderAAnalysis(a) {
              if (!a) return;
              
              const container = document.getElementById('a-analysis');
              container.innerHTML = [
                renderACard('A1', '技术栈', a.A1_tech_stack?.keywords?.join(', ') || '无', a.A1_tech_stack?.summary, 'fa-code', getDensityColor(a.A1_tech_stack?.density)),
                renderACard('A2', '产品类型', a.A2_product_type?.type || '未知', a.A2_product_type?.reason, 'fa-box', 'blue'),
                renderACard('A3', '业务领域', a.A3_business_domain?.primary || '未知', a.A3_business_domain?.summary, 'fa-industry', 'green'),
                renderACard('A4', '团队阶段', a.A4_team_stage?.stage || '未知', a.A4_team_stage?.summary, 'fa-users', 'purple'),
              ].join('');
            }

            function renderACard(code, title, value, summary, icon, color) {
              return '<div class="bg-gray-50 rounded-xl p-4">' +
                '<div class="flex items-center gap-2 mb-2">' +
                '<span class="text-xs font-bold text-' + color + '-600 bg-' + color + '-100 px-2 py-0.5 rounded">' + code + '</span>' +
                '<span class="font-medium">' + title + '</span>' +
                '</div>' +
                '<p class="text-gray-900 mb-2">' + value + '</p>' +
                (summary ? '<p class="text-sm text-gray-500"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + summary + '</p>' : '') +
                '</div>';
            }

            function getDensityColor(density) {
              switch (density) {
                case '高': return 'red';
                case '中': return 'yellow';
                case '低': return 'green';
                default: return 'gray';
              }
            }

            // 渲染B维度分析
            function renderBAnalysis(b) {
              if (!b) return;
              
              const container = document.getElementById('b-analysis');
              container.innerHTML = [
                renderBSection('B1', '行业背景要求', renderB1Content(b.B1_industry_requirement)),
                renderBSection('B2', '技术背景要求', renderB2Content(b.B2_tech_requirement)),
                renderBSection('B3', '产品经验要求', renderB3Content(b.B3_product_experience)),
                renderBSection('B4', '产品能力要求', renderB4Content(b.B4_capability_requirement)),
              ].join('');

              // 绑定折叠事件
              document.querySelectorAll('.b-section-header').forEach(header => {
                header.addEventListener('click', function() {
                  const content = this.nextElementSibling;
                  const icon = this.querySelector('.toggle-icon');
                  content.classList.toggle('hidden');
                  icon.classList.toggle('fa-chevron-down');
                  icon.classList.toggle('fa-chevron-up');
                });
              });
            }

            function renderBSection(code, title, content) {
              return '<div class="border border-gray-200 rounded-xl overflow-hidden">' +
                '<div class="b-section-header flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100">' +
                '<div class="flex items-center gap-2">' +
                '<span class="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">' + code + '</span>' +
                '<span class="font-medium">' + title + '</span>' +
                '</div>' +
                '<i class="fas fa-chevron-down toggle-icon text-gray-400"></i>' +
                '</div>' +
                '<div class="p-4 border-t border-gray-200">' + content + '</div>' +
                '</div>';
            }

            function renderB1Content(b1) {
              if (!b1) return '<p class="text-gray-500">无数据</p>';
              return '<div class="space-y-2 text-sm">' +
                '<p><span class="text-gray-500">是否必需：</span>' + (b1.required ? '<span class="text-red-500">是</span>' : '<span class="text-green-500">否</span>') + '</p>' +
                '<p><span class="text-gray-500">是否优先：</span>' + (b1.preferred ? '<span class="text-yellow-500">是</span>' : '否') + '</p>' +
                '<p><span class="text-gray-500">年限要求：</span>' + b1.years + '</p>' +
                '<p><span class="text-gray-500">具体行业：</span>' + b1.specific_industry + '</p>' +
                '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b1.summary + '</p>' +
                '</div>';
            }

            function renderB2Content(b2) {
              if (!b2) return '<p class="text-gray-500">无数据</p>';
              const depth = b2.tech_depth || {};
              return '<div class="space-y-2 text-sm">' +
                '<p><span class="text-gray-500">学历要求：</span>' + b2.education + '</p>' +
                (depth['了解']?.length ? '<p><span class="text-gray-500">了解：</span>' + depth['了解'].join(', ') + '</p>' : '') +
                (depth['熟悉']?.length ? '<p><span class="text-gray-500">熟悉：</span>' + depth['熟悉'].join(', ') + '</p>' : '') +
                (depth['精通']?.length ? '<p><span class="text-gray-500">精通：</span>' + depth['精通'].join(', ') + '</p>' : '') +
                '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b2.summary + '</p>' +
                '</div>';
            }

            function renderB3Content(b3) {
              if (!b3) return '<p class="text-gray-500">无数据</p>';
              return '<div class="space-y-2 text-sm">' +
                '<p><span class="text-gray-500">产品类型：</span>' + (b3.product_types?.join(', ') || '不限') + '</p>' +
                '<p><span class="text-gray-500">全周期经验：</span>' + (b3.need_full_cycle ? '<span class="text-red-500">需要</span>' : '不要求') + '</p>' +
                '<p><span class="text-gray-500">0-1经验：</span>' + (b3.need_0to1 ? '<span class="text-red-500">需要</span>' : '不要求') + '</p>' +
                '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b3.summary + '</p>' +
                '</div>';
            }

            function renderB4Content(b4) {
              if (!b4) return '<p class="text-gray-500">无数据</p>';
              const caps = b4.capabilities || [];
              return '<div class="space-y-2 text-sm">' +
                caps.map(cap => '<div class="flex gap-2"><span class="text-gray-900 font-medium whitespace-nowrap">' + cap.name + '：</span><span class="text-gray-600">' + cap.detail + '</span></div>').join('') +
                '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b4.summary + '</p>' +
                '</div>';
            }
          });
        `
      }} />
    </div>,
    { title: '岗位详情 - Job Copilot' }
  )
})

// 岗位库页面
app.get('/jobs', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 统一导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/" class="flex items-center gap-2 font-bold text-lg">
              <span class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                <i class="fas fa-robot"></i>
              </span>
              <span class="hidden sm:inline">Job Copilot</span>
            </a>
            <nav class="flex items-center gap-1">
              <a href="/" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-home mr-1.5"></i><span class="hidden sm:inline">首页</span>
              </a>
              <a href="/jobs" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-briefcase mr-1.5"></i><span class="hidden sm:inline">岗位库</span>
              </a>
              <a href="/resume" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-file-alt mr-1.5"></i><span class="hidden sm:inline">我的简历</span>
              </a>
              <a href="/metrics" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-chart-bar mr-1.5"></i><span class="hidden sm:inline">评测</span>
              </a>
            </nav>
            <a href="/job/new" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              <i class="fas fa-plus mr-1"></i><span class="hidden sm:inline">新建</span>
            </a>
          </div>
        </div>
      </header>
      
      <main class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* 面包屑 */}
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" class="hover:text-gray-700"><i class="fas fa-home"></i></a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <span class="text-gray-900 font-medium">岗位库</span>
        </nav>

        {/* 标题和统计 */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">岗位库</h1>
            <p id="jobs-count" class="text-sm text-gray-500 mt-1">共 0 个岗位</p>
          </div>
          <a href="/job/new" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
            <i class="fas fa-plus mr-1"></i>新建解析
          </a>
        </div>

        {/* 岗位列表 */}
        <div id="jobs-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 骨架屏 */}
          <div class="p-4 border border-gray-200 rounded-xl">
            <div class="skeleton h-5 w-3/4 mb-3"></div>
            <div class="skeleton h-4 w-1/2 mb-4"></div>
            <div class="flex gap-2">
              <div class="skeleton h-6 w-16 rounded-full"></div>
              <div class="skeleton h-6 w-20 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div id="empty-state" class="hidden text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-inbox text-2xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无岗位记录</h3>
          <p class="text-gray-500 mb-4">开始解析你的第一个目标岗位</p>
          <a href="/job/new" class="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            <i class="fas fa-plus mr-2"></i>新建岗位解析
          </a>
        </div>
      </main>

      {/* 页脚 */}
      <footer class="border-t border-gray-100 mt-auto">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>Job Copilot v0.6.0</span>
            <div class="flex items-center gap-4">
              <button onclick="JobCopilot.exportData()" class="hover:text-gray-600 transition-colors">
                <i class="fas fa-download mr-1"></i>导出数据
              </button>
            </div>
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var jobsList = document.getElementById('jobs-list');
            var emptyState = document.getElementById('empty-state');
            var jobsCount = document.getElementById('jobs-count');
            
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            
            jobsCount.textContent = '共 ' + jobs.length + ' 个岗位';
            
            if (jobs.length === 0) {
              jobsList.innerHTML = '';
              emptyState.classList.remove('hidden');
              return;
            }
            
            // 截断 URL 显示
            function truncateUrl(url, maxLen) {
              if (!url) return '';
              try {
                var parsed = new URL(url);
                var display = parsed.hostname + parsed.pathname;
                if (display.length > maxLen) {
                  display = display.substring(0, maxLen - 3) + '...';
                }
                return display;
              } catch {
                return url.length > maxLen ? url.substring(0, maxLen - 3) + '...' : url;
              }
            }
            
            // 打开外部链接（带确认）
            window.openJobUrl = function(url, title) {
              if (confirm('即将跳转到外部网站查看「' + title + '」原帖\\n\\n' + url + '\\n\\n是否继续？')) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            };
            
            jobsList.innerHTML = jobs.map(function(job) {
              var statusColor = job.status === 'completed' ? 'green' : (job.status === 'error' ? 'red' : 'yellow');
              var urlDisplay = job.job_url ? truncateUrl(job.job_url, 30) : '';
              var urlButton = job.job_url ? 
                '<button onclick="event.stopPropagation();openJobUrl(\\'' + job.job_url.replace(/'/g, "\\\\'") + '\\', \\'' + job.title.replace(/'/g, "\\\\'") + '\\')" ' +
                'class="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 truncate max-w-[180px]" title="' + job.job_url + '">' +
                '<i class="fas fa-external-link-alt"></i>' +
                '<span class="truncate">' + urlDisplay + '</span></button>' : '';
              
              return '<div class="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow card-hover">' +
                '<div class="flex items-start justify-between mb-2">' +
                '<a href="/job/' + job.id + '" class="font-semibold text-gray-900 hover:text-blue-600 flex-1">' + job.title + '</a>' +
                '<div class="flex items-center gap-2 ml-2">' +
                '<span class="w-2 h-2 rounded-full bg-' + statusColor + '-500" title="' + job.status + '"></span>' +
                '<button onclick="event.stopPropagation();JobCopilot.deleteJob(\\'' + job.id + '\\')" class="text-gray-400 hover:text-red-500 p-1" title="删除">' +
                '<i class="fas fa-trash-alt text-xs"></i></button>' +
                '</div></div>' +
                '<p class="text-sm text-gray-500 mb-2"><i class="fas fa-building mr-1"></i>' + job.company + '</p>' +
                (urlButton ? '<div class="mb-2">' + urlButton + '</div>' : '') +
                '<div class="flex flex-wrap gap-2 mb-3">' +
                (job.a_analysis?.A2_product_type?.type ? '<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">' + job.a_analysis.A2_product_type.type + '</span>' : '') +
                (job.a_analysis?.A3_business_domain?.primary ? '<span class="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">' + job.a_analysis.A3_business_domain.primary + '</span>' : '') +
                '</div>' +
                '<div class="flex items-center justify-between text-xs">' +
                '<span class="text-gray-400">' + new Date(job.created_at).toLocaleDateString() + '</span>' +
                '<div class="flex gap-2">' +
                '<a href="/job/' + job.id + '/match" class="text-blue-500 hover:text-blue-600">匹配</a>' +
                '<a href="/job/' + job.id + '/interview" class="text-purple-500 hover:text-purple-600">面试</a>' +
                '<a href="/job/' + job.id + '/optimize" class="text-green-500 hover:text-green-600">优化</a>' +
                '</div></div>' +
                '</div>';
            }).join('');
          });
        `
      }} />
    </div>,
    { title: '岗位库 - Job Copilot' }
  )
})

// 简历页面
app.get('/resume', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 统一导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/" class="flex items-center gap-2 font-bold text-lg">
              <span class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                <i class="fas fa-robot"></i>
              </span>
              <span class="hidden sm:inline">Job Copilot</span>
            </a>
            <nav class="flex items-center gap-1">
              <a href="/" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-home mr-1.5"></i><span class="hidden sm:inline">首页</span>
              </a>
              <a href="/jobs" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-briefcase mr-1.5"></i><span class="hidden sm:inline">岗位库</span>
              </a>
              <a href="/resume" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-file-alt mr-1.5"></i><span class="hidden sm:inline">我的简历</span>
              </a>
            </nav>
            <a href="/job/new" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              <i class="fas fa-plus mr-1"></i><span class="hidden sm:inline">新建</span>
            </a>
          </div>
        </div>
      </header>
      
      <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* 面包屑 */}
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" class="hover:text-gray-700"><i class="fas fa-home"></i></a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <span class="text-gray-900 font-medium">我的简历</span>
        </nav>

        {/* 当前简历 */}
        <div id="current-resume" class="hidden mb-8">
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 id="resume-name" class="text-xl font-bold">姓名</h2>
                <p id="resume-contact" class="text-sm text-gray-500 mt-1">联系方式</p>
                <p id="resume-target" class="text-sm text-gray-600 mt-1">
                  <i class="fas fa-crosshairs mr-1"></i>
                  <span>目标岗位</span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                  <i class="fas fa-check mr-1"></i>已解析
                </span>
                <button id="delete-resume-btn" class="p-2 text-gray-400 hover:text-red-500" title="删除简历">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            
            {/* 能力标签 */}
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div class="bg-white/70 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">行业</p>
                <p id="tags-industry" class="text-sm font-medium">-</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">技术</p>
                <p id="tags-tech" class="text-sm font-medium">-</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">产品</p>
                <p id="tags-product" class="text-sm font-medium">-</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">能力</p>
                <p id="tags-capability" class="text-sm font-medium">-</p>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3 mt-4">
              <button id="view-detail-btn" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                <i class="fas fa-eye mr-1"></i>查看详情
              </button>
              <button id="re-upload-btn" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                <i class="fas fa-redo mr-1"></i>重新上传
              </button>
              <a href="/jobs" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                <i class="fas fa-search mr-1"></i>去匹配岗位
              </a>
            </div>
          </div>
        </div>

        {/* 上传区域 */}
        <div id="upload-section">
          <div class="text-center mb-6">
            <h2 class="text-lg font-semibold">上传简历</h2>
            <p class="text-sm text-gray-500 mt-1">支持 PDF、Word 或直接粘贴文本</p>
          </div>

          {/* 文件上传 */}
          <div 
            id="upload-area"
            class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer mb-6"
          >
            <input type="file" id="resume-file" accept=".pdf,.doc,.docx" class="hidden" />
            <div id="upload-placeholder">
              <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
              <p class="text-gray-500">拖拽简历文件到此处，或点击选择</p>
              <p class="text-sm text-gray-400 mt-1">支持 PDF、Word 格式</p>
            </div>
            <div id="file-preview" class="hidden">
              <i class="fas fa-file-alt text-4xl text-blue-500 mb-2"></i>
              <p id="file-name" class="text-gray-700">文件名</p>
              <button id="remove-file" class="mt-2 text-red-500 text-sm hover:text-red-600">
                <i class="fas fa-times mr-1"></i>移除
              </button>
            </div>
          </div>

          {/* 分隔线 */}
          <div class="flex items-center gap-4 mb-6">
            <div class="flex-1 border-t border-gray-200"></div>
            <span class="text-gray-400 text-sm">或者</span>
            <div class="flex-1 border-t border-gray-200"></div>
          </div>

          {/* 文本输入 */}
          <div class="mb-6">
            <textarea 
              id="resume-text"
              class="w-full h-48 p-4 border border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none resize-none"
              placeholder="粘贴简历文本内容...&#10;&#10;例如：&#10;张三&#10;电话：138xxxx8888 | 邮箱：zhangsan@email.com&#10;&#10;教育背景&#10;xx大学 | 计算机科学 | 本科 | 2018-2022&#10;&#10;工作经历&#10;..."
            ></textarea>
          </div>

          {/* 提交按钮 */}
          <div class="flex justify-center">
            <button 
              id="parse-btn"
              class="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-magic mr-2"></i>
              解析简历
            </button>
          </div>
        </div>

        {/* 解析进度 */}
        <div id="parse-progress" class="hidden mt-8">
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="font-semibold mb-4">
              <i class="fas fa-spinner loading-spinner mr-2"></i>
              正在解析简历...
            </h3>
            <div id="dag-nodes" class="space-y-3"></div>
          </div>
        </div>

        {/* 错误提示 */}
        <div id="parse-error" class="hidden mt-8">
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span id="error-message">解析失败</span>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const uploadArea = document.getElementById('upload-area');
            const fileInput = document.getElementById('resume-file');
            const textInput = document.getElementById('resume-text');
            const parseBtn = document.getElementById('parse-btn');
            const progressArea = document.getElementById('parse-progress');
            const dagNodes = document.getElementById('dag-nodes');
            const errorArea = document.getElementById('parse-error');
            const errorMessage = document.getElementById('error-message');
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            const filePreview = document.getElementById('file-preview');
            const fileName = document.getElementById('file-name');
            const removeFileBtn = document.getElementById('remove-file');
            const currentResume = document.getElementById('current-resume');
            const uploadSection = document.getElementById('upload-section');
            const reUploadBtn = document.getElementById('re-upload-btn');
            const viewDetailBtn = document.getElementById('view-detail-btn');

            let selectedFile = null;
            let fileDataUrl = null;

            // 检查是否已有简历
            const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            if (resumes.length > 0) {
              showCurrentResume(resumes[0]);
            }

            function showCurrentResume(resume) {
              currentResume.classList.remove('hidden');
              document.getElementById('resume-name').textContent = resume.basic_info?.name || '未知';
              document.getElementById('resume-contact').textContent = resume.basic_info?.contact || '';
              document.getElementById('resume-target').querySelector('span').textContent = resume.basic_info?.target_position || '未指定';
              document.getElementById('tags-industry').textContent = resume.ability_tags?.industry?.slice(0,2).join(', ') || '-';
              document.getElementById('tags-tech').textContent = resume.ability_tags?.technology?.slice(0,2).join(', ') || '-';
              document.getElementById('tags-product').textContent = resume.ability_tags?.product?.slice(0,2).join(', ') || '-';
              document.getElementById('tags-capability').textContent = resume.ability_tags?.capability?.slice(0,2).join(', ') || '-';
            }

            // 重新上传
            if (reUploadBtn) {
              reUploadBtn.addEventListener('click', function() {
                currentResume.classList.add('hidden');
                uploadSection.classList.remove('hidden');
              });
            }

            // 查看详情（暂时显示原始内容）
            if (viewDetailBtn) {
              viewDetailBtn.addEventListener('click', function() {
                const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                if (resumes.length > 0) {
                  alert('简历详情页开发中...\\n\\n能力标签：\\n- 行业: ' + (resumes[0].ability_tags?.industry?.join(', ') || '无') + '\\n- 技术: ' + (resumes[0].ability_tags?.technology?.join(', ') || '无') + '\\n- 产品: ' + (resumes[0].ability_tags?.product?.join(', ') || '无') + '\\n- 能力: ' + (resumes[0].ability_tags?.capability?.join(', ') || '无'));
                }
              });
            }

            // 删除简历
            var deleteResumeBtn = document.getElementById('delete-resume-btn');
            if (deleteResumeBtn) {
              deleteResumeBtn.addEventListener('click', function() {
                var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                if (resumes.length > 0) {
                  JobCopilot.deleteResume(resumes[0].id);
                }
              });
            }

            // 点击上传区域
            uploadArea.addEventListener('click', function(e) {
              if (e.target !== removeFileBtn && !removeFileBtn.contains(e.target)) {
                fileInput.click();
              }
            });

            // 拖拽上传
            uploadArea.addEventListener('dragover', function(e) {
              e.preventDefault();
              uploadArea.classList.add('border-gray-400', 'bg-gray-50');
            });
            uploadArea.addEventListener('dragleave', function(e) {
              e.preventDefault();
              uploadArea.classList.remove('border-gray-400', 'bg-gray-50');
            });
            uploadArea.addEventListener('drop', function(e) {
              e.preventDefault();
              uploadArea.classList.remove('border-gray-400', 'bg-gray-50');
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                handleFileSelect(files[0]);
              }
            });

            // 文件选择
            fileInput.addEventListener('change', function(e) {
              if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            });

            function handleFileSelect(file) {
              selectedFile = file;
              fileName.textContent = file.name;
              uploadPlaceholder.classList.add('hidden');
              filePreview.classList.remove('hidden');
              textInput.value = '';
              
              // 读取文件为Base64
              const reader = new FileReader();
              reader.onload = function(e) {
                fileDataUrl = e.target.result.split(',')[1]; // 去掉data:xxx;base64,前缀
              };
              reader.readAsDataURL(file);
            }

            // 移除文件
            removeFileBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              selectedFile = null;
              fileDataUrl = null;
              fileInput.value = '';
              uploadPlaceholder.classList.remove('hidden');
              filePreview.classList.add('hidden');
            });

            // 解析按钮点击
            parseBtn.addEventListener('click', async function() {
              const text = textInput.value.trim();
              
              if (!text && !fileDataUrl) {
                alert('请上传简历文件或粘贴简历文本');
                return;
              }

              parseBtn.disabled = true;
              parseBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>解析中...';
              progressArea.classList.remove('hidden');
              errorArea.classList.add('hidden');

              renderDAGNodes([
                { id: 'preprocess', name: '简历预处理', status: 'pending' },
                { id: 'parse', name: '简历解析', status: 'pending' },
              ]);

              try {
                const response = await fetch('/api/resume/parse', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: fileDataUrl ? 'file' : 'text',
                    content: text || undefined,
                    fileData: fileDataUrl || undefined,
                    fileName: selectedFile?.name,
                  }),
                });

                const result = await response.json();

                if (result.success) {
                  if (result.dagState) {
                    renderDAGNodes(result.dagState.nodes);
                  }
                  
                  // 保存评测数据
                  if (result.metrics && window.JobCopilot && window.JobCopilot.saveMetricsBatch) {
                    window.JobCopilot.saveMetricsBatch(result.metrics);
                  }
                  
                  // 保存到localStorage
                  const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                  resumes.unshift(result.resume);
                  localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));
                  
                  setTimeout(() => {
                    progressArea.classList.add('hidden');
                    showCurrentResume(result.resume);
                    uploadSection.classList.add('hidden');
                    parseBtn.disabled = false;
                    parseBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>解析简历';
                    // 清空输入
                    textInput.value = '';
                    selectedFile = null;
                    fileDataUrl = null;
                    fileInput.value = '';
                    uploadPlaceholder.classList.remove('hidden');
                    filePreview.classList.add('hidden');
                  }, 1000);
                } else {
                  throw new Error(result.error || '解析失败');
                }
              } catch (error) {
                console.error('解析失败:', error);
                errorMessage.textContent = error.message || '解析失败，请重试';
                errorArea.classList.remove('hidden');
                progressArea.classList.add('hidden');
                parseBtn.disabled = false;
                parseBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>解析简历';
              }
            });

            function renderDAGNodes(nodes) {
              dagNodes.innerHTML = nodes.map(node => {
                let statusIcon, statusClass;
                switch (node.status) {
                  case 'completed':
                    statusIcon = 'fa-check-circle';
                    statusClass = 'text-green-500';
                    break;
                  case 'running':
                    statusIcon = 'fa-spinner loading-spinner';
                    statusClass = 'text-blue-500';
                    break;
                  case 'error':
                    statusIcon = 'fa-times-circle';
                    statusClass = 'text-red-500';
                    break;
                  default:
                    statusIcon = 'fa-circle';
                    statusClass = 'text-gray-300';
                }
                const duration = node.result?.duration_ms ? ' (' + (node.result.duration_ms / 1000).toFixed(1) + 's)' : '';
                return '<div class="flex items-center gap-3">' +
                  '<i class="fas ' + statusIcon + ' ' + statusClass + '"></i>' +
                  '<span class="' + (node.status === 'completed' ? 'text-gray-900' : 'text-gray-500') + '">' +
                  node.name + duration + '</span></div>';
              }).join('');
            }
          });
        `
      }} />
    </div>,
    { title: '我的简历 - Job Copilot' }
  )
})

// 岗位匹配页
app.get('/job/:id/match', (c) => {
  const jobId = c.req.param('id');
  
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <a href={`/job/${jobId}`} class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="fas fa-arrow-left"></i>
          </a>
          <h1 class="text-xl font-bold">岗位匹配分析</h1>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 加载状态 */}
        <div id="loading" class="text-center py-12">
          <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">正在分析匹配度...</p>
        </div>

        {/* 匹配结果 */}
        <div id="match-content" class="hidden space-y-6">
          {/* 匹配概览 */}
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <div class="text-center mb-4">
              <span id="match-level" class="text-2xl font-bold">匹配度</span>
              <div class="mt-2">
                <span id="match-score" class="text-4xl font-bold">--</span>
                <span class="text-gray-500">/100</span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div id="match-bar" class="h-3 rounded-full transition-all" style="width: 0%"></div>
            </div>
            <p id="match-suggestion" class="text-sm text-gray-600 bg-white/70 rounded-lg p-3">
              <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
              <span>面试建议</span>
            </p>
          </div>

          {/* 维度匹配详情 */}
          <div>
            <h3 class="text-lg font-semibold mb-4">维度匹配详情</h3>
            <div id="dimension-match" class="space-y-3"></div>
          </div>

          {/* 优势与差距 */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-green-50 rounded-xl p-4">
              <h4 class="font-semibold text-green-700 mb-3">
                <i class="fas fa-check-circle mr-2"></i>你的优势
              </h4>
              <ul id="strengths-list" class="space-y-2 text-sm text-green-800"></ul>
            </div>
            <div class="bg-yellow-50 rounded-xl p-4">
              <h4 class="font-semibold text-yellow-700 mb-3">
                <i class="fas fa-exclamation-triangle mr-2"></i>需要补充
              </h4>
              <ul id="gaps-list" class="space-y-2 text-sm text-yellow-800"></ul>
            </div>
          </div>

          {/* 操作按钮 */}
          <div class="flex flex-wrap gap-4 pt-4">
            <a href={`/job/${jobId}/interview`} id="interview-btn" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              <i class="fas fa-microphone mr-2"></i>生成面试准备
            </a>
            <a href={`/job/${jobId}/optimize`} class="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <i class="fas fa-edit mr-2"></i>优化简历
            </a>
          </div>
        </div>

        {/* 无简历提示 */}
        <div id="no-resume" class="hidden text-center py-12">
          <i class="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 mb-4">请先上传简历</p>
          <a href="/resume" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            上传简历
          </a>
        </div>

        {/* 错误状态 */}
        <div id="error" class="hidden text-center py-12">
          <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>
          <p id="error-text" class="text-red-500">匹配分析失败</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            重试
          </button>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', async function() {
            const jobId = '${jobId}';
            const loading = document.getElementById('loading');
            const content = document.getElementById('match-content');
            const noResume = document.getElementById('no-resume');
            const error = document.getElementById('error');
            const errorText = document.getElementById('error-text');

            // 检查是否有简历
            const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            if (resumes.length === 0) {
              loading.classList.add('hidden');
              noResume.classList.remove('hidden');
              return;
            }

            // 获取岗位信息
            const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            const job = jobs.find(j => j.id === jobId);
            if (!job || !job.a_analysis || !job.b_analysis) {
              loading.classList.add('hidden');
              error.classList.remove('hidden');
              errorText.textContent = '岗位信息不完整';
              return;
            }

            try {
              // 调用匹配API
              const response = await fetch('/api/job/' + jobId + '/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId: resumes[0].id }),
              });

              const result = await response.json();

              if (!result.success) {
                throw new Error(result.error || '匹配分析失败');
              }

              // 保存评测数据
              if (result.metrics && window.JobCopilot && window.JobCopilot.saveMetrics) {
                window.JobCopilot.saveMetrics(result.metrics);
              }

              const match = result.match;

              // 渲染匹配概览
              document.getElementById('match-level').textContent = match.match_level;
              document.getElementById('match-score').textContent = match.match_score;
              document.getElementById('match-bar').style.width = match.match_score + '%';
              document.getElementById('match-bar').className = 'h-3 rounded-full transition-all ' + getScoreColor(match.match_score);
              document.getElementById('match-suggestion').querySelector('span').textContent = match.interview_focus_suggestion || '暂无建议';

              // 渲染维度匹配
              renderDimensionMatch(match.dimension_match);

              // 渲染优势和差距
              renderList('strengths-list', match.strengths, 'text-green-800');
              renderList('gaps-list', match.gaps, 'text-yellow-800');

              loading.classList.add('hidden');
              content.classList.remove('hidden');
            } catch (err) {
              console.error('匹配失败:', err);
              loading.classList.add('hidden');
              error.classList.remove('hidden');
              errorText.textContent = err.message || '匹配分析失败';
            }

            function getScoreColor(score) {
              if (score >= 85) return 'bg-green-500';
              if (score >= 70) return 'bg-blue-500';
              if (score >= 55) return 'bg-yellow-500';
              return 'bg-red-500';
            }

            function renderDimensionMatch(dimensions) {
              const container = document.getElementById('dimension-match');
              const items = [
                { key: 'A3_business_domain', name: 'A3 业务领域' },
                { key: 'B1_industry', name: 'B1 行业背景' },
                { key: 'B2_tech', name: 'B2 技术背景' },
                { key: 'B3_product', name: 'B3 产品经验' },
                { key: 'B4_capability', name: 'B4 产品能力' },
              ];

              container.innerHTML = items.map(item => {
                const d = dimensions[item.key] || {};
                const statusColor = d.status === '✅' ? 'bg-green-100 text-green-600' : (d.status === '❌' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600');
                return '<div class="border border-gray-200 rounded-xl overflow-hidden">' +
                  '<div class="dimension-header flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100" data-target="' + item.key + '">' +
                  '<div class="flex items-center gap-3">' +
                  '<span class="text-lg">' + (d.status || '⚠️') + '</span>' +
                  '<span class="font-medium">' + item.name + '</span>' +
                  '</div>' +
                  '<i class="fas fa-chevron-down toggle-icon text-gray-400"></i>' +
                  '</div>' +
                  '<div id="dim-' + item.key + '" class="p-4 border-t border-gray-200 hidden">' +
                  '<div class="space-y-2 text-sm">' +
                  '<p><span class="text-gray-500">JD要求：</span>' + (d.jd_requirement || '-') + '</p>' +
                  '<p><span class="text-gray-500">你的情况：</span>' + (d.resume_match || '-') + '</p>' +
                  '<p class="bg-gray-50 p-2 rounded"><span class="text-gray-500">分析：</span>' + (d.gap_analysis || '-') + '</p>' +
                  '</div></div></div>';
              }).join('');

              // 绑定折叠事件
              document.querySelectorAll('.dimension-header').forEach(header => {
                header.addEventListener('click', function() {
                  const target = this.getAttribute('data-target');
                  const content = document.getElementById('dim-' + target);
                  const icon = this.querySelector('.toggle-icon');
                  content.classList.toggle('hidden');
                  icon.classList.toggle('fa-chevron-down');
                  icon.classList.toggle('fa-chevron-up');
                });
              });
            }

            function renderList(containerId, items, colorClass) {
              const container = document.getElementById(containerId);
              if (!items || items.length === 0) {
                container.innerHTML = '<li class="text-gray-400">暂无</li>';
                return;
              }
              container.innerHTML = items.map(item => '<li class="' + colorClass + '">• ' + item + '</li>').join('');
            }
          });
        `
      }} />
    </div>,
    { title: '岗位匹配分析 - Job Copilot' }
  )
})

// 面试准备页
app.get('/job/:id/interview', (c) => {
  const jobId = c.req.param('id');
  
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center">
            <a href={`/job/${jobId}/match`} class="text-gray-500 hover:text-gray-700 mr-4">
              <i class="fas fa-arrow-left"></i>
            </a>
            <h1 id="page-title" class="text-xl font-bold">面试准备</h1>
          </div>
          <span id="status-badge" class="hidden px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
            <i class="fas fa-check mr-1"></i>已生成
          </span>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 加载状态 */}
        <div id="loading" class="text-center py-12">
          <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">正在生成面试准备材料...</p>
          <p class="text-sm text-gray-400 mt-2">预计需要 30-60 秒</p>
          <div id="progress-steps" class="mt-6 text-left max-w-xs mx-auto space-y-2">
            <div id="step-company" class="flex items-center gap-2 text-sm text-gray-500">
              <i class="fas fa-circle text-gray-300"></i>
              <span>公司分析</span>
            </div>
            <div id="step-interview" class="flex items-center gap-2 text-sm text-gray-500">
              <i class="fas fa-circle text-gray-300"></i>
              <span>面试准备</span>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div id="content" class="hidden space-y-6">
          {/* 公司分析卡片 */}
          <div id="company-card" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-lg font-semibold flex items-center gap-2">
                  <i class="fas fa-building text-blue-500"></i>
                  <span id="company-name">公司名称</span>
                </h2>
                <p id="company-info" class="text-sm text-gray-500 mt-1">行业 | 阶段 | 规模</p>
              </div>
              <button onclick="JobCopilot.copySection('company')" class="text-gray-400 hover:text-gray-600" title="复制">
                <i class="fas fa-copy"></i>
              </button>
            </div>
            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-500">AI应用场景：</span>
                <span id="ai-scenarios" class="text-gray-700">-</span>
              </div>
              <div>
                <span class="text-gray-500">岗位AI重点：</span>
                <span id="ai-focus" class="text-gray-700">-</span>
              </div>
              <div>
                <span class="text-gray-500">竞品对标：</span>
                <span id="competitors" class="text-gray-700">-</span>
              </div>
              <div>
                <span class="text-gray-500">面试洞察：</span>
                <span id="interview-tips" class="text-gray-700">-</span>
              </div>
            </div>
          </div>

          {/* Tab 切换 */}
          <div class="border-b border-gray-200">
            <nav class="flex gap-6" id="tabs">
              <button data-tab="intro" class="tab-btn pb-3 text-sm font-medium border-b-2 border-black text-black">
                自我介绍
              </button>
              <button data-tab="projects" class="tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                项目推荐
              </button>
              <button data-tab="questions" class="tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                面试题目
              </button>
              <button data-tab="strategy" class="tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                面试策略
              </button>
            </nav>
          </div>

          {/* Tab 内容 */}
          <div id="tab-content">
            {/* 自我介绍 Tab */}
            <div id="tab-intro" class="tab-panel space-y-6">
              <div class="bg-gray-50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold">
                    <i class="fas fa-clock text-blue-500 mr-2"></i>1分钟版本
                  </h3>
                  <button onclick="JobCopilot.copySection('intro-1min')" class="text-gray-400 hover:text-gray-600 text-sm">
                    <i class="fas fa-copy mr-1"></i>复制
                  </button>
                </div>
                <p id="intro-1min" class="text-gray-700 leading-relaxed whitespace-pre-wrap">-</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-semibold">
                    <i class="fas fa-clock text-purple-500 mr-2"></i>2分钟版本
                  </h3>
                  <button onclick="JobCopilot.copySection('intro-2min')" class="text-gray-400 hover:text-gray-600 text-sm">
                    <i class="fas fa-copy mr-1"></i>复制
                  </button>
                </div>
                <p id="intro-2min" class="text-gray-700 leading-relaxed whitespace-pre-wrap">-</p>
              </div>
              <div class="bg-yellow-50 rounded-xl p-4">
                <h4 class="font-medium text-yellow-700 mb-2">
                  <i class="fas fa-lightbulb mr-2"></i>表达建议
                </h4>
                <ul id="delivery-tips" class="text-sm text-yellow-800 space-y-1"></ul>
              </div>
            </div>

            {/* 项目推荐 Tab */}
            <div id="tab-projects" class="tab-panel hidden space-y-4">
              <div id="projects-list"></div>
            </div>

            {/* 面试题目 Tab */}
            <div id="tab-questions" class="tab-panel hidden space-y-6">
              {/* 关于你 */}
              <div>
                <h3 class="font-semibold mb-3 flex items-center">
                  <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-2 text-xs">你</span>
                  关于你
                </h3>
                <div id="questions-you" class="space-y-3"></div>
              </div>
              {/* 关于公司 */}
              <div>
                <h3 class="font-semibold mb-3 flex items-center">
                  <span class="w-6 h-6 bg-green-100 text-green-600 rounded flex items-center justify-center mr-2 text-xs">他</span>
                  关于公司/岗位
                </h3>
                <div id="questions-company" class="space-y-3"></div>
              </div>
              {/* 关于未来 */}
              <div>
                <h3 class="font-semibold mb-3 flex items-center">
                  <span class="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center mr-2 text-xs">未</span>
                  关于未来
                </h3>
                <div id="questions-future" class="space-y-3"></div>
              </div>
            </div>

            {/* 面试策略 Tab */}
            <div id="tab-strategy" class="tab-panel hidden space-y-6">
              <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                <h3 class="font-semibold mb-3">
                  <i class="fas fa-bullseye text-green-500 mr-2"></i>目标印象
                </h3>
                <p id="impression-goal" class="text-gray-700">-</p>
              </div>
              <div class="bg-blue-50 rounded-xl p-6">
                <h3 class="font-semibold mb-3">
                  <i class="fas fa-key text-blue-500 mr-2"></i>核心信息
                </h3>
                <ul id="key-messages" class="space-y-2 text-gray-700"></ul>
              </div>
              <div class="bg-red-50 rounded-xl p-6">
                <h3 class="font-semibold mb-3">
                  <i class="fas fa-ban text-red-500 mr-2"></i>避免话题
                </h3>
                <ul id="avoid-topics" class="space-y-2 text-gray-700"></ul>
              </div>
              <div class="bg-purple-50 rounded-xl p-6">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold">
                    <i class="fas fa-question-circle text-purple-500 mr-2"></i>反问面试官
                  </h3>
                  <button onclick="JobCopilot.copySection('closing-questions')" class="text-gray-400 hover:text-gray-600 text-sm">
                    <i class="fas fa-copy mr-1"></i>复制
                  </button>
                </div>
                <ul id="closing-questions" class="space-y-2 text-gray-700"></ul>
              </div>
            </div>
          </div>
        </div>

        {/* 错误状态 */}
        <div id="error" class="hidden text-center py-12">
          <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>
          <p id="error-text" class="text-red-500">生成失败</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            重试
          </button>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', async function() {
            const jobId = '${jobId}';
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const error = document.getElementById('error');
            const errorText = document.getElementById('error-text');
            const statusBadge = document.getElementById('status-badge');

            // 存储数据用于复制
            let interviewData = null;

            // Tab 切换
            document.querySelectorAll('.tab-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                // 更新按钮样式
                document.querySelectorAll('.tab-btn').forEach(b => {
                  b.classList.remove('border-black', 'text-black');
                  b.classList.add('border-transparent', 'text-gray-500');
                });
                this.classList.remove('border-transparent', 'text-gray-500');
                this.classList.add('border-black', 'text-black');
                // 显示对应内容
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById('tab-' + tab).classList.remove('hidden');
              });
            });

            // 获取数据
            const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            const job = jobs.find(j => j.id === jobId);
            const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            const resume = resumes[0];

            if (!job || !resume) {
              loading.classList.add('hidden');
              error.classList.remove('hidden');
              errorText.textContent = '缺少岗位或简历数据';
              return;
            }

            // 获取匹配结果（从localStorage或使用默认值）
            const matches = JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]');
            let match = matches.find(m => m.job_id === jobId);
            if (!match) {
              match = {
                match_level: '匹配度还可以',
                match_score: 60,
                strengths: [],
                gaps: [],
              };
            }

            // 更新进度
            function updateProgress(step, status) {
              const el = document.getElementById('step-' + step);
              if (!el) return;
              const icon = el.querySelector('i');
              if (status === 'running') {
                icon.className = 'fas fa-spinner loading-spinner text-blue-500';
              } else if (status === 'done') {
                icon.className = 'fas fa-check-circle text-green-500';
              } else if (status === 'error') {
                icon.className = 'fas fa-times-circle text-red-500';
              }
            }

            try {
              updateProgress('company', 'running');
              
              // 调用面试准备API
              const response = await fetch('/api/job/' + jobId + '/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  job: job,
                  resume: resume,
                  match: match,
                }),
              });

              const result = await response.json();

              if (!result.success) {
                throw new Error(result.error || '生成失败');
              }

              updateProgress('company', 'done');
              updateProgress('interview', 'done');

              interviewData = result;

              // 渲染公司分析
              const ca = result.company_analysis;
              document.getElementById('company-name').textContent = ca.company_profile.name;
              document.getElementById('company-info').textContent = 
                ca.company_profile.industry + ' | ' + ca.company_profile.stage + ' | ' + ca.company_profile.scale;
              document.getElementById('ai-scenarios').textContent = 
                ca.ai_scenarios.current_ai_usage.slice(0, 3).join('、') || '-';
              document.getElementById('ai-focus').textContent = ca.ai_scenarios.role_ai_focus || '-';
              document.getElementById('competitors').textContent = 
                ca.competitor_analysis.direct_competitors.map(c => c.name).join('、') || '-';
              document.getElementById('interview-tips').textContent = 
                ca.interview_insights.interview_tips.slice(0, 2).join('；') || '-';

              // 渲染自我介绍
              const prep = result.interview_prep;
              document.getElementById('intro-1min').textContent = prep.self_introduction.version_1min;
              document.getElementById('intro-2min').textContent = prep.self_introduction.version_2min;
              renderList('delivery-tips', prep.self_introduction.delivery_tips, '💡');

              // 渲染项目推荐
              renderProjects(prep.project_recommendations);

              // 渲染面试题目
              renderQuestions('questions-you', prep.interview_questions.about_you, 'blue');
              renderQuestions('questions-company', prep.interview_questions.about_company, 'green');
              renderQuestions('questions-future', prep.interview_questions.about_future, 'purple');

              // 渲染面试策略
              document.getElementById('impression-goal').textContent = prep.overall_strategy.impression_goal;
              renderList('key-messages', prep.overall_strategy.key_messages, '✓');
              renderList('avoid-topics', prep.overall_strategy.avoid_topics, '✗');
              renderList('closing-questions', prep.overall_strategy.closing_questions, '?');

              // 存储到localStorage
              const interviews = JSON.parse(localStorage.getItem('jobcopilot_interviews') || '[]');
              const existing = interviews.findIndex(i => i.job_id === jobId);
              const interviewRecord = {
                id: jobId + '_interview',
                job_id: jobId,
                ...result,
                created_at: new Date().toISOString(),
              };
              if (existing >= 0) {
                interviews[existing] = interviewRecord;
              } else {
                interviews.unshift(interviewRecord);
              }
              localStorage.setItem('jobcopilot_interviews', JSON.stringify(interviews));

              // 显示内容
              loading.classList.add('hidden');
              content.classList.remove('hidden');
              statusBadge.classList.remove('hidden');
              document.getElementById('page-title').textContent = '面试准备 - ' + job.title;

            } catch (err) {
              console.error('生成失败:', err);
              updateProgress('company', 'error');
              loading.classList.add('hidden');
              error.classList.remove('hidden');
              errorText.textContent = err.message || '生成失败';
            }

            function renderList(containerId, items, prefix) {
              const container = document.getElementById(containerId);
              if (!items || items.length === 0) {
                container.innerHTML = '<li class="text-gray-400">暂无</li>';
                return;
              }
              container.innerHTML = items.map(item => 
                '<li>' + prefix + ' ' + item + '</li>'
              ).join('');
            }

            function renderProjects(projects) {
              const container = document.getElementById('projects-list');
              if (!projects || projects.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-center py-8">暂无项目推荐</p>';
                return;
              }
              container.innerHTML = projects.map((p, i) => 
                '<div class="bg-gray-50 rounded-xl p-6">' +
                '<div class="flex items-center justify-between mb-3">' +
                '<h4 class="font-semibold">' +
                '<span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full inline-flex items-center justify-center mr-2 text-sm">' + (i + 1) + '</span>' +
                p.project_name +
                '</h4>' +
                '<button onclick="JobCopilot.copySection(\\'project-' + i + '\\')" class="text-gray-400 hover:text-gray-600 text-sm">' +
                '<i class="fas fa-copy mr-1"></i>复制' +
                '</button>' +
                '</div>' +
                '<p class="text-sm text-gray-600 mb-3"><span class="text-gray-500">推荐理由：</span>' + p.match_reason + '</p>' +
                '<div class="space-y-2 text-sm">' +
                '<div><span class="text-gray-500">讲述重点：</span>' + p.focus_points.join('、') + '</div>' +
                '<div><span class="text-gray-500">可能追问：</span>' + p.expected_questions.join('、') + '</div>' +
                '<div class="bg-white p-3 rounded-lg mt-3">' +
                '<span class="text-gray-500">故事大纲：</span>' +
                '<p class="text-gray-700 mt-1">' + p.story_outline + '</p>' +
                '</div>' +
                '</div>' +
                '</div>'
              ).join('');
            }

            function renderQuestions(containerId, questions, color) {
              const container = document.getElementById(containerId);
              if (!questions || questions.length === 0) {
                container.innerHTML = '<p class="text-gray-400">暂无</p>';
                return;
              }
              container.innerHTML = questions.map((q, i) => 
                '<div class="border border-gray-200 rounded-xl overflow-hidden">' +
                '<div class="question-header flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100" data-index="' + containerId + '-' + i + '">' +
                '<div class="flex items-center gap-2">' +
                '<span class="px-2 py-0.5 bg-' + color + '-100 text-' + color + '-600 text-xs rounded">' + q.category + '</span>' +
                '<span class="font-medium">' + q.question + '</span>' +
                '</div>' +
                '<i class="fas fa-chevron-down toggle-icon text-gray-400"></i>' +
                '</div>' +
                '<div id="answer-' + containerId + '-' + i + '" class="p-4 border-t border-gray-200 hidden">' +
                '<div class="space-y-3 text-sm">' +
                '<div class="bg-blue-50 p-3 rounded-lg">' +
                '<span class="font-medium text-blue-700">P - 观点：</span>' +
                '<p class="text-blue-800 mt-1">' + q.prep_answer.point + '</p>' +
                '</div>' +
                '<div class="bg-green-50 p-3 rounded-lg">' +
                '<span class="font-medium text-green-700">R - 原因：</span>' +
                '<p class="text-green-800 mt-1">' + q.prep_answer.reason + '</p>' +
                '</div>' +
                '<div class="bg-yellow-50 p-3 rounded-lg">' +
                '<span class="font-medium text-yellow-700">E - 例子：</span>' +
                '<p class="text-yellow-800 mt-1">' + q.prep_answer.example + '</p>' +
                '</div>' +
                '<div class="bg-purple-50 p-3 rounded-lg">' +
                '<span class="font-medium text-purple-700">P - 重申：</span>' +
                '<p class="text-purple-800 mt-1">' + q.prep_answer.point_reiterate + '</p>' +
                '</div>' +
                '<button onclick="JobCopilot.copyPREP(' + i + ', \\'' + containerId + '\\')" class="mt-2 text-gray-500 hover:text-gray-700 text-sm">' +
                '<i class="fas fa-copy mr-1"></i>复制完整回答' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>'
              ).join('');

              // 绑定折叠事件
              container.querySelectorAll('.question-header').forEach(header => {
                header.addEventListener('click', function() {
                  const index = this.getAttribute('data-index');
                  const answer = document.getElementById('answer-' + index);
                  const icon = this.querySelector('.toggle-icon');
                  answer.classList.toggle('hidden');
                  icon.classList.toggle('fa-chevron-down');
                  icon.classList.toggle('fa-chevron-up');
                });
              });
            }

            // 复制功能
            window.JobCopilot = window.JobCopilot || {};
            window.JobCopilot.copySection = function(section) {
              let text = '';
              if (section === 'intro-1min') {
                text = document.getElementById('intro-1min').textContent;
              } else if (section === 'intro-2min') {
                text = document.getElementById('intro-2min').textContent;
              } else if (section === 'closing-questions') {
                const items = document.getElementById('closing-questions').querySelectorAll('li');
                text = Array.from(items).map(li => li.textContent).join('\\n');
              } else if (section === 'company' && interviewData) {
                const ca = interviewData.company_analysis;
                text = '【公司分析】\\n' +
                  '公司：' + ca.company_profile.name + '\\n' +
                  '行业：' + ca.company_profile.industry + '\\n' +
                  'AI应用场景：' + ca.ai_scenarios.current_ai_usage.join('、') + '\\n' +
                  '岗位AI重点：' + ca.ai_scenarios.role_ai_focus + '\\n' +
                  '面试建议：' + ca.interview_insights.interview_tips.join('；');
              } else if (section.startsWith('project-') && interviewData) {
                const idx = parseInt(section.split('-')[1]);
                const p = interviewData.interview_prep.project_recommendations[idx];
                if (p) {
                  text = '【项目：' + p.project_name + '】\\n' +
                    '推荐理由：' + p.match_reason + '\\n' +
                    '讲述重点：' + p.focus_points.join('、') + '\\n' +
                    '故事大纲：' + p.story_outline;
                }
              }
              if (text) {
                navigator.clipboard.writeText(text).then(() => {
                  showToast('已复制到剪贴板');
                });
              }
            };

            window.JobCopilot.copyPREP = function(idx, containerId) {
              if (!interviewData) return;
              const prep = interviewData.interview_prep;
              let questions;
              if (containerId === 'questions-you') {
                questions = prep.interview_questions.about_you;
              } else if (containerId === 'questions-company') {
                questions = prep.interview_questions.about_company;
              } else {
                questions = prep.interview_questions.about_future;
              }
              const q = questions[idx];
              if (q) {
                const text = '问题：' + q.question + '\\n\\n' +
                  '【观点】' + q.prep_answer.point + '\\n\\n' +
                  '【原因】' + q.prep_answer.reason + '\\n\\n' +
                  '【例子】' + q.prep_answer.example + '\\n\\n' +
                  '【总结】' + q.prep_answer.point_reiterate;
                navigator.clipboard.writeText(text).then(() => {
                  showToast('已复制到剪贴板');
                });
              }
            };

            function showToast(message) {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = message;
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }
          });
        `
      }} />
    </div>,
    { title: '面试准备 - Job Copilot' }
  )
})

// 简历优化页
app.get('/job/:id/optimize', (c) => {
  const jobId = c.req.param('id')
  return c.render(
    <div class="min-h-screen bg-white">
      {/* 头部 */}
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4">
          <div class="flex items-center gap-4">
            <a href={`/job/${jobId}`} class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-arrow-left"></i>
            </a>
            <div>
              <h1 id="page-title" class="text-lg font-semibold">简历优化</h1>
              <p class="text-sm text-gray-500">基于岗位要求优化简历内容</p>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 py-6">
        {/* 用户建议输入区 */}
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
            优化建议 (可选)
          </label>
          <textarea 
            id="user-suggestions" 
            class="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black"
            rows={2}
            placeholder="例如：请强调数据分析能力，弱化管理经验；或者：请更加突出带团队的经验..."
          ></textarea>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs text-gray-400">提供具体建议可以让优化更精准</span>
            <button 
              id="regenerate-btn"
              class="text-sm text-gray-500 hover:text-gray-700 hidden"
            >
              <i class="fas fa-redo mr-1"></i>重新优化
            </button>
          </div>
        </div>

        {/* 优化效果摘要 - 隐藏直到优化完成 */}
        <div id="effect-summary" class="hidden bg-blue-50 rounded-xl p-4 mb-6">
          <h3 class="font-semibold text-blue-700 mb-3">
            <i class="fas fa-chart-line mr-2"></i>优化效果
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div id="effect-keywords" class="text-2xl font-bold text-blue-600">-</div>
              <div class="text-xs text-blue-500">关键词覆盖</div>
            </div>
            <div>
              <div id="effect-gaps" class="text-2xl font-bold text-green-600">-</div>
              <div class="text-xs text-green-500">差距弥补</div>
            </div>
            <div>
              <div id="effect-highlights" class="text-2xl font-bold text-purple-600">-</div>
              <div class="text-xs text-purple-500">亮点强化</div>
            </div>
            <div>
              <div id="effect-improvement" class="text-2xl font-bold text-orange-600">-</div>
              <div class="text-xs text-orange-500">预估提升</div>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        <div id="loading" class="text-center py-12">
          <div class="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
          <p class="text-gray-500">正在分析并优化简历...</p>
          <p class="text-xs text-gray-400 mt-2">预计需要 30-60 秒</p>
        </div>

        {/* 优化内容 */}
        <div id="optimize-content" class="hidden space-y-6">
          {/* 操作栏 */}
          <div class="flex justify-between items-center">
            <span id="status-badge" class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full hidden">
              <i class="fas fa-check mr-1"></i>优化完成
            </span>
            <button 
              id="copy-all-btn"
              onclick="JobCopilot.copyAllOptimized()"
              class="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800"
            >
              <i class="fas fa-copy mr-2"></i>复制全部优化内容
            </button>
          </div>

          {/* 摘要优化 */}
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 class="font-semibold">
                <i class="fas fa-user-circle text-blue-500 mr-2"></i>个人摘要
              </h3>
              <button onclick="JobCopilot.copySection('summary')" class="text-gray-400 hover:text-gray-600 text-sm">
                <i class="fas fa-copy mr-1"></i>复制
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-xs text-gray-500 mb-2">原始版本</div>
                  <div id="summary-original" class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 min-h-[100px]">-</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-2">优化版本</div>
                  <div id="summary-optimized" class="p-3 bg-green-50 rounded-lg text-sm text-gray-800 min-h-[100px]">-</div>
                </div>
              </div>
              <div class="bg-blue-50 p-3 rounded-lg">
                <div class="text-xs text-blue-600 font-medium mb-1">修改说明</div>
                <div id="summary-changes" class="text-sm text-blue-700">-</div>
              </div>
              <div class="text-xs text-gray-500">
                <span class="font-medium">对应 JD 要求：</span>
                <span id="summary-requirements">-</span>
              </div>
            </div>
          </div>

          {/* 工作经历优化 */}
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 class="font-semibold">
                <i class="fas fa-briefcase text-green-500 mr-2"></i>工作经历
              </h3>
              <button onclick="JobCopilot.copySection('work_experience')" class="text-gray-400 hover:text-gray-600 text-sm">
                <i class="fas fa-copy mr-1"></i>复制
              </button>
            </div>
            <div id="work-experience-container" class="p-4 space-y-4">
              {/* 动态渲染 */}
            </div>
          </div>

          {/* 项目经历优化 */}
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 class="font-semibold">
                <i class="fas fa-project-diagram text-purple-500 mr-2"></i>项目经历
              </h3>
              <button onclick="JobCopilot.copySection('projects')" class="text-gray-400 hover:text-gray-600 text-sm">
                <i class="fas fa-copy mr-1"></i>复制
              </button>
            </div>
            <div id="projects-container" class="p-4 space-y-4">
              {/* 动态渲染 */}
            </div>
          </div>

          {/* 技能优化 */}
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <h3 class="font-semibold">
                <i class="fas fa-tools text-orange-500 mr-2"></i>技能清单
              </h3>
              <button onclick="JobCopilot.copySection('skills')" class="text-gray-400 hover:text-gray-600 text-sm">
                <i class="fas fa-copy mr-1"></i>复制
              </button>
            </div>
            <div class="p-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="text-xs text-gray-500 mb-2">原始版本</div>
                  <div id="skills-original" class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 min-h-[80px]">-</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-2">优化版本</div>
                  <div id="skills-optimized" class="p-3 bg-green-50 rounded-lg text-sm text-gray-800 min-h-[80px]">-</div>
                </div>
              </div>
              <div class="bg-blue-50 p-3 rounded-lg">
                <div class="text-xs text-blue-600 font-medium mb-1">修改说明</div>
                <div id="skills-changes" class="text-sm text-blue-700">-</div>
              </div>
              <div class="text-xs text-gray-500">
                <span class="font-medium">新增关键词：</span>
                <span id="skills-keywords" class="text-green-600">-</span>
              </div>
            </div>
          </div>

          {/* 底部操作 */}
          <div class="flex justify-center gap-4 pt-4">
            <button 
              onclick="JobCopilot.copyAllOptimized()"
              class="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <i class="fas fa-copy mr-2"></i>复制全部优化内容
            </button>
            <a href={`/job/${jobId}/match`} class="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <i class="fas fa-arrow-left mr-2"></i>返回匹配分析
            </a>
          </div>
        </div>

        {/* 无简历提示 */}
        <div id="no-resume" class="hidden text-center py-12">
          <i class="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500 mb-4">请先上传简历</p>
          <a href="/resume" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            上传简历
          </a>
        </div>

        {/* 错误状态 */}
        <div id="error" class="hidden text-center py-12">
          <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>
          <p id="error-text" class="text-red-500">优化失败</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            重试
          </button>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          let optimizeData = null;
          
          document.addEventListener('DOMContentLoaded', async function() {
            const jobId = '${jobId}';
            const loading = document.getElementById('loading');
            const content = document.getElementById('optimize-content');
            const effectSummary = document.getElementById('effect-summary');
            const statusBadge = document.getElementById('status-badge');
            const error = document.getElementById('error');
            const errorText = document.getElementById('error-text');
            const noResume = document.getElementById('no-resume');
            const regenerateBtn = document.getElementById('regenerate-btn');
            const userSuggestionsInput = document.getElementById('user-suggestions');

            // 从 localStorage 获取数据
            const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            const job = jobs.find(j => j.id === jobId);
            const resume = resumes[0];

            if (!job || !resume) {
              loading.classList.add('hidden');
              if (!resume) {
                noResume.classList.remove('hidden');
              } else {
                error.classList.remove('hidden');
                errorText.textContent = '缺少岗位或简历数据';
              }
              return;
            }

            // 获取匹配结果
            const matches = JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]');
            const match = matches.find(m => m.job_id === jobId) || {
              match_level: '匹配度还可以',
              match_score: 60,
              strengths: [],
              gaps: []
            };

            document.getElementById('page-title').textContent = '简历优化 - ' + job.title;

            // 检查是否已有优化结果
            const optimizations = JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]');
            const existingOptimization = optimizations.find(o => o.job_id === jobId);
            
            if (existingOptimization) {
              // 显示已有结果
              optimizeData = existingOptimization;
              renderOptimization(optimizeData);
              loading.classList.add('hidden');
              content.classList.remove('hidden');
              effectSummary.classList.remove('hidden');
              statusBadge.classList.remove('hidden');
              regenerateBtn.classList.remove('hidden');
            } else {
              // 调用优化 API
              await generateOptimization();
            }

            // 重新优化按钮
            regenerateBtn.addEventListener('click', async function() {
              await generateOptimization(userSuggestionsInput.value.trim());
            });

            async function generateOptimization(userSuggestions = '') {
              loading.classList.remove('hidden');
              content.classList.add('hidden');
              effectSummary.classList.add('hidden');
              statusBadge.classList.add('hidden');
              error.classList.add('hidden');

              try {
                const response = await fetch('/api/job/' + jobId + '/optimize', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    job, 
                    resume, 
                    match,
                    userSuggestions 
                  })
                });

                const result = await response.json();
                
                if (!result.success) {
                  throw new Error(result.error || '优化失败');
                }

                optimizeData = result;
                renderOptimization(result);

                // 保存到 localStorage
                const optimizations = JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]');
                const optimizationRecord = {
                  id: jobId + '_optimize',
                  job_id: jobId,
                  ...result,
                  user_suggestions: userSuggestions,
                  created_at: new Date().toISOString()
                };
                const existingIndex = optimizations.findIndex(o => o.job_id === jobId);
                if (existingIndex >= 0) {
                  optimizations[existingIndex] = optimizationRecord;
                } else {
                  optimizations.push(optimizationRecord);
                }
                localStorage.setItem('jobcopilot_optimizations', JSON.stringify(optimizations));

                loading.classList.add('hidden');
                content.classList.remove('hidden');
                effectSummary.classList.remove('hidden');
                statusBadge.classList.remove('hidden');
                regenerateBtn.classList.remove('hidden');

              } catch (err) {
                console.error('优化失败:', err);
                loading.classList.add('hidden');
                error.classList.remove('hidden');
                errorText.textContent = err.message || '优化失败';
              }
            }

            function renderOptimization(data) {
              // 渲染优化效果
              if (data.optimization_effect) {
                const effect = data.optimization_effect;
                document.getElementById('effect-keywords').textContent = effect.keywords_coverage || '-';
                document.getElementById('effect-gaps').textContent = effect.gaps_addressed || '-';
                document.getElementById('effect-highlights').textContent = effect.highlights_strengthened || '-';
                document.getElementById('effect-improvement').textContent = effect.estimated_match_improvement || '-';
              }

              // 渲染摘要
              if (data.sections && data.sections.summary) {
                const s = data.sections.summary;
                document.getElementById('summary-original').textContent = s.original || '-';
                document.getElementById('summary-optimized').textContent = s.optimized || '-';
                document.getElementById('summary-changes').textContent = (s.changes || []).join('；') || '-';
                document.getElementById('summary-requirements').textContent = (s.matched_requirements || []).join('、') || '-';
              }

              // 渲染工作经历
              if (data.sections && data.sections.work_experience) {
                renderExperienceSection('work-experience-container', data.sections.work_experience);
              }

              // 渲染项目经历
              if (data.sections && data.sections.projects) {
                renderExperienceSection('projects-container', data.sections.projects);
              }

              // 渲染技能
              if (data.sections && data.sections.skills) {
                const s = data.sections.skills;
                document.getElementById('skills-original').textContent = s.original || '-';
                document.getElementById('skills-optimized').textContent = s.optimized || '-';
                document.getElementById('skills-changes').textContent = (s.changes || []).join('；') || '-';
                document.getElementById('skills-keywords').textContent = (s.keywords_added || []).join('、') || '-';
              }
            }

            function renderExperienceSection(containerId, items) {
              const container = document.getElementById(containerId);
              if (!items || items.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-center py-4">暂无数据</p>';
                return;
              }

              container.innerHTML = items.map((item, index) => {
                const title = item.title || item.project_name || ('项目 ' + (index + 1));
                return '<div class="border border-gray-100 rounded-lg p-4">' +
                  '<div class="font-medium text-gray-800 mb-3">' + title + '</div>' +
                  '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
                    '<div>' +
                      '<div class="text-xs text-gray-500 mb-2">原始版本</div>' +
                      '<div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">' + (item.original || '-') + '</div>' +
                    '</div>' +
                    '<div>' +
                      '<div class="text-xs text-gray-500 mb-2">优化版本</div>' +
                      '<div class="p-3 bg-green-50 rounded-lg text-sm text-gray-800">' + (item.optimized || '-') + '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="bg-blue-50 p-3 rounded-lg mt-3">' +
                    '<div class="text-xs text-blue-600 font-medium mb-1">修改说明</div>' +
                    '<div class="text-sm text-blue-700">' + ((item.changes || []).join('；') || '-') + '</div>' +
                  '</div>' +
                  '<div class="text-xs text-gray-500 mt-2">' +
                    '<span class="font-medium">新增关键词：</span>' +
                    '<span class="text-green-600">' + ((item.keywords_added || []).join('、') || '-') + '</span>' +
                  '</div>' +
                '</div>';
              }).join('');
            }

            // 复制功能
            window.JobCopilot = window.JobCopilot || {};
            
            window.JobCopilot.copySection = function(section) {
              if (!optimizeData || !optimizeData.sections) return;
              
              const s = optimizeData.sections[section];
              if (!s) return;

              let text = '';
              if (Array.isArray(s)) {
                // 工作经历或项目
                text = s.map(item => {
                  const title = item.title || item.project_name || '';
                  return title + '\\n' + (item.optimized || '');
                }).join('\\n\\n');
              } else {
                text = s.optimized || '';
              }

              navigator.clipboard.writeText(text).then(() => {
                showToast('已复制到剪贴板');
              });
            };

            window.JobCopilot.copyAllOptimized = function() {
              if (!optimizeData || !optimizeData.sections) return;

              const sections = optimizeData.sections;
              let text = '【个人摘要】\\n' + (sections.summary?.optimized || '') + '\\n\\n';

              if (sections.work_experience && sections.work_experience.length > 0) {
                text += '【工作经历】\\n';
                sections.work_experience.forEach(item => {
                  text += (item.title || '') + '\\n' + (item.optimized || '') + '\\n\\n';
                });
              }

              if (sections.projects && sections.projects.length > 0) {
                text += '【项目经历】\\n';
                sections.projects.forEach(item => {
                  text += (item.project_name || item.title || '') + '\\n' + (item.optimized || '') + '\\n\\n';
                });
              }

              text += '【技能清单】\\n' + (sections.skills?.optimized || '');

              navigator.clipboard.writeText(text).then(() => {
                showToast('已复制全部优化内容');
              });
            };

            function showToast(message) {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = message;
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }
          });
        `
      }} />
    </div>,
    { title: '简历优化 - Job Copilot' }
  )
})

// 简历优化页
app.get('/job/:id/optimize', (c) => {
  const jobId = c.req.param('id');
  
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center">
            <a href={`/job/${jobId}/match`} class="text-gray-500 hover:text-gray-700 mr-4">
              <i class="fas fa-arrow-left"></i>
            </a>
            <h1 id="page-title" class="text-xl font-bold">简历优化</h1>
          </div>
          <span id="status-badge" class="hidden px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
            <i class="fas fa-check mr-1"></i>已优化
          </span>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 加载状态 */}
        <div id="loading" class="text-center py-12">
          <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">正在优化简历...</p>
          <p class="text-sm text-gray-400 mt-2">预计需要 30-60 秒</p>
          <div id="progress-steps" class="mt-6 text-left max-w-xs mx-auto space-y-2">
            <div id="step-analyze" class="flex items-center gap-2 text-sm text-gray-500">
              <i class="fas fa-circle text-gray-300"></i>
              <span>分析岗位要求</span>
            </div>
            <div id="step-optimize" class="flex items-center gap-2 text-sm text-gray-500">
              <i class="fas fa-circle text-gray-300"></i>
              <span>优化简历内容</span>
            </div>
          </div>
        </div>

        {/* 用户建议输入区域 */}
        <div id="suggestion-section" class="hidden mb-6">
          <div class="bg-yellow-50 rounded-xl p-4">
            <h3 class="font-semibold text-yellow-700 mb-2">
              <i class="fas fa-lightbulb mr-2"></i>有修改建议？
            </h3>
            <textarea 
              id="user-suggestion"
              class="w-full h-24 p-3 border border-yellow-200 rounded-lg focus:border-yellow-400 focus:outline-none resize-none"
              placeholder="输入你的修改建议，例如：&#10;- 请更突出我的AI产品经验&#10;- 不要修改工作经历部分&#10;- 技能部分加入Python"
            ></textarea>
            <div class="flex justify-end mt-3">
              <button 
                id="regenerate-btn"
                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
              >
                <i class="fas fa-redo mr-1"></i>根据建议重新优化
              </button>
            </div>
          </div>
        </div>

        {/* 优化结果内容 */}
        <div id="content" class="hidden space-y-6">
          {/* 优化概览 */}
          <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
            <h2 class="text-lg font-semibold mb-3">
              <i class="fas fa-magic text-green-500 mr-2"></i>优化概览
            </h2>
            <p id="optimization-summary" class="text-gray-700 mb-4">-</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="bg-white/70 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500 mb-1">关键词覆盖</p>
                <p id="keywords-coverage" class="text-sm font-semibold text-green-600">-</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500 mb-1">弥补差距</p>
                <p id="gaps-count" class="text-sm font-semibold text-blue-600">-</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500 mb-1">强化亮点</p>
                <p id="highlights-count" class="text-sm font-semibold text-purple-600">-</p>
              </div>
              <div class="bg-white/70 rounded-lg p-3 text-center">
                <p class="text-xs text-gray-500 mb-1">预估提升</p>
                <p id="match-improvement" class="text-sm font-semibold text-orange-600">-</p>
              </div>
            </div>
          </div>

          {/* Tab 切换 */}
          <div class="border-b border-gray-200">
            <nav class="flex gap-6" id="tabs">
              <button data-tab="summary" class="tab-btn pb-3 text-sm font-medium border-b-2 border-black text-black">
                摘要
              </button>
              <button data-tab="work" class="tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                工作经历
              </button>
              <button data-tab="projects" class="tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                项目经历
              </button>
              <button data-tab="skills" class="tab-btn pb-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                技能
              </button>
            </nav>
          </div>

          {/* Tab 内容 */}
          <div id="tab-content">
            {/* 摘要 Tab */}
            <div id="tab-summary" class="tab-panel space-y-4">
              <div id="summary-content" class="bg-gray-50 rounded-xl p-6">
                <p class="text-gray-400 text-center py-8">暂无摘要优化</p>
              </div>
            </div>

            {/* 工作经历 Tab */}
            <div id="tab-work" class="tab-panel hidden space-y-4">
              <div id="work-list"></div>
            </div>

            {/* 项目经历 Tab */}
            <div id="tab-projects" class="tab-panel hidden space-y-4">
              <div id="projects-list"></div>
            </div>

            {/* 技能 Tab */}
            <div id="tab-skills" class="tab-panel hidden">
              <div id="skills-content" class="bg-gray-50 rounded-xl p-6">
                <p class="text-gray-400 text-center py-8">暂无技能优化</p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
            <button onclick="JobCopilot.copyAllOptimized()" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              <i class="fas fa-copy mr-2"></i>复制全部优化内容
            </button>
            <a href={`/job/${jobId}/interview`} class="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <i class="fas fa-microphone mr-2"></i>返回面试准备
            </a>
          </div>
        </div>

        {/* 错误状态 */}
        <div id="error" class="hidden text-center py-12">
          <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>
          <p id="error-text" class="text-red-500">优化失败</p>
          <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            重试
          </button>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', async function() {
            const jobId = '${jobId}';
            const loading = document.getElementById('loading');
            const content = document.getElementById('content');
            const suggestionSection = document.getElementById('suggestion-section');
            const error = document.getElementById('error');
            const errorText = document.getElementById('error-text');
            const statusBadge = document.getElementById('status-badge');

            let optimizationData = null;
            let jobData = null;
            let resumeData = null;
            let matchData = null;

            // Tab 切换
            document.querySelectorAll('.tab-btn').forEach(btn => {
              btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                document.querySelectorAll('.tab-btn').forEach(b => {
                  b.classList.remove('border-black', 'text-black');
                  b.classList.add('border-transparent', 'text-gray-500');
                });
                this.classList.remove('border-transparent', 'text-gray-500');
                this.classList.add('border-black', 'text-black');
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById('tab-' + tab).classList.remove('hidden');
              });
            });

            // 获取数据
            const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            jobData = jobs.find(j => j.id === jobId);
            const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            resumeData = resumes[0];
            const matches = JSON.parse(localStorage.getItem('jobcopilot_matches') || '[]');
            matchData = matches.find(m => m.job_id === jobId) || {
              match_level: '匹配度还可以',
              match_score: 60,
              strengths: [],
              gaps: [],
            };

            if (!jobData || !resumeData) {
              loading.classList.add('hidden');
              error.classList.remove('hidden');
              errorText.textContent = '缺少岗位或简历数据';
              return;
            }

            // 更新进度
            function updateProgress(step, status) {
              const el = document.getElementById('step-' + step);
              if (!el) return;
              const icon = el.querySelector('i');
              if (status === 'running') {
                icon.className = 'fas fa-spinner loading-spinner text-blue-500';
              } else if (status === 'done') {
                icon.className = 'fas fa-check-circle text-green-500';
              } else if (status === 'error') {
                icon.className = 'fas fa-times-circle text-red-500';
              }
            }

            // 执行优化
            async function runOptimization(userSuggestions = '') {
              try {
                updateProgress('analyze', 'running');
                
                const endpoint = userSuggestions 
                  ? '/api/job/' + jobId + '/optimize/regenerate'
                  : '/api/job/' + jobId + '/optimize';
                
                const response = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    job: jobData,
                    resume: resumeData,
                    match: matchData,
                    userSuggestions: userSuggestions || undefined,
                  }),
                });

                const result = await response.json();

                if (!result.success) {
                  throw new Error(result.error || '优化失败');
                }

                updateProgress('analyze', 'done');
                updateProgress('optimize', 'done');

                optimizationData = result.optimization.optimization;
                renderOptimization(optimizationData);

                // 保存到localStorage
                const optimizations = JSON.parse(localStorage.getItem('jobcopilot_optimizations') || '[]');
                const existing = optimizations.findIndex(o => o.job_id === jobId);
                const record = {
                  id: jobId + '_optimize',
                  job_id: jobId,
                  ...result.optimization,
                  created_at: new Date().toISOString(),
                };
                if (existing >= 0) {
                  optimizations[existing] = record;
                } else {
                  optimizations.unshift(record);
                }
                localStorage.setItem('jobcopilot_optimizations', JSON.stringify(optimizations));

                // 显示内容
                loading.classList.add('hidden');
                content.classList.remove('hidden');
                suggestionSection.classList.remove('hidden');
                statusBadge.classList.remove('hidden');
                document.getElementById('page-title').textContent = '简历优化 - ' + jobData.title;

              } catch (err) {
                console.error('优化失败:', err);
                updateProgress('analyze', 'error');
                loading.classList.add('hidden');
                error.classList.remove('hidden');
                errorText.textContent = err.message || '优化失败';
              }
            }

            // 渲染优化结果
            function renderOptimization(data) {
              // 概览
              document.getElementById('optimization-summary').textContent = data.optimization_summary || '-';
              document.getElementById('keywords-coverage').textContent = data.optimization_effect?.keywords_coverage || '-';
              document.getElementById('gaps-count').textContent = 
                (data.optimization_effect?.gaps_addressed?.length || 0) + '项';
              document.getElementById('highlights-count').textContent = 
                (data.optimization_effect?.highlights_strengthened?.length || 0) + '项';
              document.getElementById('match-improvement').textContent = 
                data.optimization_effect?.estimated_match_improvement || '-';

              // 摘要
              renderSummary(data.sections?.summary);

              // 工作经历
              renderWorkExperience(data.sections?.work_experience);

              // 项目经历
              renderProjects(data.sections?.projects);

              // 技能
              renderSkills(data.sections?.skills);
            }

            function renderSummary(summary) {
              const container = document.getElementById('summary-content');
              if (!summary || !summary.optimized) {
                container.innerHTML = '<p class="text-gray-400 text-center py-8">暂无摘要优化</p>';
                return;
              }
              container.innerHTML = renderComparisonCard('个人摘要', summary);
            }

            function renderWorkExperience(work) {
              const container = document.getElementById('work-list');
              if (!work || work.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-center py-8">暂无工作经历优化</p>';
                return;
              }
              container.innerHTML = work.map((w, i) => 
                '<div class="bg-gray-50 rounded-xl p-6 mb-4">' +
                '<div class="flex items-center justify-between mb-4">' +
                '<h4 class="font-semibold">' +
                '<span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full inline-flex items-center justify-center mr-2 text-sm">' + (i + 1) + '</span>' +
                w.company + ' - ' + w.position +
                '</h4>' +
                '<button onclick="JobCopilot.copySection(\\'work-' + i + '\\')" class="text-gray-400 hover:text-gray-600 text-sm">' +
                '<i class="fas fa-copy mr-1"></i>复制' +
                '</button>' +
                '</div>' +
                renderDiff(w.original, w.optimized) +
                renderChanges(w.changes, w.matched_requirements, w.keywords_added) +
                '</div>'
              ).join('');
            }

            function renderProjects(projects) {
              const container = document.getElementById('projects-list');
              if (!projects || projects.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-center py-8">暂无项目经历优化</p>';
                return;
              }
              container.innerHTML = projects.map((p, i) => 
                '<div class="bg-gray-50 rounded-xl p-6 mb-4">' +
                '<div class="flex items-center justify-between mb-4">' +
                '<h4 class="font-semibold">' +
                '<span class="w-6 h-6 bg-purple-100 text-purple-600 rounded-full inline-flex items-center justify-center mr-2 text-sm">' + (i + 1) + '</span>' +
                p.name +
                '</h4>' +
                '<button onclick="JobCopilot.copySection(\\'project-' + i + '\\')" class="text-gray-400 hover:text-gray-600 text-sm">' +
                '<i class="fas fa-copy mr-1"></i>复制' +
                '</button>' +
                '</div>' +
                renderDiff(p.original, p.optimized) +
                renderChanges(p.changes, p.matched_requirements, p.keywords_added) +
                '</div>'
              ).join('');
            }

            function renderSkills(skills) {
              const container = document.getElementById('skills-content');
              if (!skills || !skills.optimized || skills.optimized.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-center py-8">暂无技能优化</p>';
                return;
              }
              container.innerHTML = 
                '<div class="flex items-center justify-between mb-4">' +
                '<h4 class="font-semibold"><i class="fas fa-tools text-gray-500 mr-2"></i>技能优化</h4>' +
                '<button onclick="JobCopilot.copySection(\\'skills\\')" class="text-gray-400 hover:text-gray-600 text-sm">' +
                '<i class="fas fa-copy mr-1"></i>复制' +
                '</button>' +
                '</div>' +
                '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
                '<div class="bg-red-50 rounded-lg p-4">' +
                '<h5 class="text-sm font-medium text-red-700 mb-2">原始技能</h5>' +
                '<div class="flex flex-wrap gap-2">' +
                (skills.original || []).map(s => '<span class="px-2 py-1 bg-white text-sm text-gray-600 rounded">' + s + '</span>').join('') +
                '</div></div>' +
                '<div class="bg-green-50 rounded-lg p-4">' +
                '<h5 class="text-sm font-medium text-green-700 mb-2">优化后技能</h5>' +
                '<div class="flex flex-wrap gap-2">' +
                (skills.optimized || []).map(s => {
                  const isNew = (skills.added || []).includes(s);
                  const isEmphasized = (skills.emphasized || []).includes(s);
                  let cls = 'px-2 py-1 text-sm rounded ';
                  if (isNew) cls += 'bg-green-200 text-green-800 font-medium';
                  else if (isEmphasized) cls += 'bg-yellow-200 text-yellow-800';
                  else cls += 'bg-white text-gray-600';
                  return '<span class="' + cls + '">' + s + (isNew ? ' (新增)' : '') + '</span>';
                }).join('') +
                '</div></div>' +
                '</div>' +
                (skills.changes && skills.changes.length > 0 ? 
                  '<div class="mt-4 text-sm"><span class="text-gray-500">修改说明：</span>' + skills.changes.join('；') + '</div>' : '');
            }

            function renderComparisonCard(title, section) {
              return '<div class="flex items-center justify-between mb-4">' +
                '<h4 class="font-semibold"><i class="fas fa-user text-gray-500 mr-2"></i>' + title + '</h4>' +
                '<button onclick="JobCopilot.copySection(\\'summary\\')" class="text-gray-400 hover:text-gray-600 text-sm">' +
                '<i class="fas fa-copy mr-1"></i>复制' +
                '</button>' +
                '</div>' +
                renderDiff(section.original, section.optimized) +
                renderChanges(section.changes, section.matched_requirements);
            }

            function renderDiff(original, optimized) {
              return '<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">' +
                '<div class="bg-red-50 rounded-lg p-4">' +
                '<h5 class="text-sm font-medium text-red-700 mb-2"><i class="fas fa-minus-circle mr-1"></i>原始版本</h5>' +
                '<p class="text-sm text-gray-700 whitespace-pre-wrap">' + (original || '-') + '</p>' +
                '</div>' +
                '<div class="bg-green-50 rounded-lg p-4">' +
                '<h5 class="text-sm font-medium text-green-700 mb-2"><i class="fas fa-plus-circle mr-1"></i>优化版本</h5>' +
                '<p class="text-sm text-gray-700 whitespace-pre-wrap">' + (optimized || '-') + '</p>' +
                '</div>' +
                '</div>';
            }

            function renderChanges(changes, requirements, keywords) {
              let html = '<div class="space-y-2 text-sm">';
              if (changes && changes.length > 0) {
                html += '<div><span class="text-gray-500">修改说明：</span><ul class="mt-1 ml-4 list-disc text-gray-600">';
                changes.forEach(c => html += '<li>' + c + '</li>');
                html += '</ul></div>';
              }
              if (requirements && requirements.length > 0) {
                html += '<div><span class="text-gray-500">对应JD要求：</span><span class="text-blue-600">' + requirements.join('、') + '</span></div>';
              }
              if (keywords && keywords.length > 0) {
                html += '<div><span class="text-gray-500">注入关键词：</span>';
                keywords.forEach(k => html += '<span class="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">' + k + '</span>');
                html += '</div>';
              }
              html += '</div>';
              return html;
            }

            // 重新优化按钮
            document.getElementById('regenerate-btn').addEventListener('click', async function() {
              const suggestion = document.getElementById('user-suggestion').value.trim();
              if (!suggestion) {
                alert('请输入修改建议');
                return;
              }
              
              this.disabled = true;
              this.innerHTML = '<i class="fas fa-spinner loading-spinner mr-1"></i>优化中...';
              content.classList.add('hidden');
              loading.classList.remove('hidden');
              
              // 重置进度
              document.getElementById('step-analyze').querySelector('i').className = 'fas fa-circle text-gray-300';
              document.getElementById('step-optimize').querySelector('i').className = 'fas fa-circle text-gray-300';
              
              await runOptimization(suggestion);
              
              this.disabled = false;
              this.innerHTML = '<i class="fas fa-redo mr-1"></i>根据建议重新优化';
            });

            // 复制功能
            window.JobCopilot = window.JobCopilot || {};
            
            window.JobCopilot.copySection = function(section) {
              if (!optimizationData) return;
              let text = '';
              
              if (section === 'summary' && optimizationData.sections?.summary) {
                text = optimizationData.sections.summary.optimized;
              } else if (section.startsWith('work-')) {
                const idx = parseInt(section.split('-')[1]);
                const w = optimizationData.sections?.work_experience?.[idx];
                if (w) text = w.optimized;
              } else if (section.startsWith('project-')) {
                const idx = parseInt(section.split('-')[1]);
                const p = optimizationData.sections?.projects?.[idx];
                if (p) text = p.optimized;
              } else if (section === 'skills' && optimizationData.sections?.skills) {
                text = optimizationData.sections.skills.optimized.join('、');
              }
              
              if (text) {
                navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
              }
            };

            window.JobCopilot.copyAllOptimized = function() {
              if (!optimizationData) return;
              let text = '【优化后简历】\\n\\n';
              
              // 摘要
              if (optimizationData.sections?.summary?.optimized) {
                text += '== 个人摘要 ==\\n' + optimizationData.sections.summary.optimized + '\\n\\n';
              }
              
              // 工作经历
              if (optimizationData.sections?.work_experience?.length > 0) {
                text += '== 工作经历 ==\\n';
                optimizationData.sections.work_experience.forEach(w => {
                  text += '\\n【' + w.company + ' - ' + w.position + '】\\n' + w.optimized + '\\n';
                });
                text += '\\n';
              }
              
              // 项目经历
              if (optimizationData.sections?.projects?.length > 0) {
                text += '== 项目经历 ==\\n';
                optimizationData.sections.projects.forEach(p => {
                  text += '\\n【' + p.name + '】\\n' + p.optimized + '\\n';
                });
                text += '\\n';
              }
              
              // 技能
              if (optimizationData.sections?.skills?.optimized?.length > 0) {
                text += '== 技能 ==\\n' + optimizationData.sections.skills.optimized.join('、');
              }
              
              navigator.clipboard.writeText(text).then(() => showToast('已复制全部优化内容'));
            };

            function showToast(message) {
              const toast = document.createElement('div');
              toast.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
              toast.textContent = message;
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 2000);
            }

            // 开始优化
            await runOptimization();
          });
        `
      }} />
    </div>,
    { title: '简历优化 - Job Copilot' }
  )
})

// ==================== 评测仪表盘页面 ====================
app.get('/metrics', (c) => {
  return c.render(
    <div class="min-h-screen bg-gray-50 flex flex-col">
      {/* 导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/" class="flex items-center gap-2 font-bold text-lg">
              <span class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                <i class="fas fa-robot"></i>
              </span>
              <span class="hidden sm:inline">Job Copilot</span>
            </a>
            <nav class="flex items-center gap-1">
              <a href="/" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-home mr-1.5"></i><span class="hidden sm:inline">首页</span>
              </a>
              <a href="/jobs" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-briefcase mr-1.5"></i><span class="hidden sm:inline">岗位库</span>
              </a>
              <a href="/resume" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-file-alt mr-1.5"></i><span class="hidden sm:inline">我的简历</span>
              </a>
              <a href="/metrics" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-chart-bar mr-1.5"></i><span class="hidden sm:inline">评测</span>
              </a>
            </nav>
            <div class="flex items-center gap-2">
              <a href="/job/new" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
                <i class="fas fa-plus mr-1"></i><span class="hidden sm:inline">新建</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 面包屑 */}
      <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="flex items-center text-sm text-gray-500">
            <a href="/" class="hover:text-gray-700">首页</a>
            <span class="mx-2">/</span>
            <span class="text-gray-900 font-medium">评测仪表盘</span>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <main class="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* 页面标题 */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              <i class="fas fa-chart-bar mr-2 text-blue-500"></i>
              模型评测仪表盘
            </h1>
            <p class="text-gray-500 mt-1">监控 Agent 性能、质量和成本</p>
          </div>
          <div class="flex items-center gap-2">
            <button id="refresh-btn" class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
              <i class="fas fa-sync-alt mr-1"></i> 刷新
            </button>
            <button id="export-btn" class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50">
              <i class="fas fa-download mr-1"></i> 导出
            </button>
            <button id="clear-btn" class="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50">
              <i class="fas fa-trash mr-1"></i> 清空
            </button>
          </div>
        </div>

        {/* Tab 切换 */}
        <div class="flex border-b mb-6">
          <button id="tab-overview" class="px-4 py-2 text-sm font-medium border-b-2 border-blue-500 text-blue-600">
            总览
          </button>
          <button id="tab-agents" class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
            Agent 详情
          </button>
          <button id="tab-experiments" class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
            实验管理
          </button>
          <button id="tab-logs" class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">
            调用日志
          </button>
        </div>

        {/* 总览面板 */}
        <div id="panel-overview">
          {/* 统计卡片 */}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 border shadow-sm">
              <div class="text-sm text-gray-500 mb-1">总调用次数</div>
              <div id="stat-total-calls" class="text-2xl font-bold text-gray-900">0</div>
            </div>
            <div class="bg-white rounded-xl p-4 border shadow-sm">
              <div class="text-sm text-gray-500 mb-1">成功率</div>
              <div id="stat-success-rate" class="text-2xl font-bold text-green-600">0%</div>
            </div>
            <div class="bg-white rounded-xl p-4 border shadow-sm">
              <div class="text-sm text-gray-500 mb-1">平均耗时</div>
              <div id="stat-avg-duration" class="text-2xl font-bold text-blue-600">0ms</div>
            </div>
            <div class="bg-white rounded-xl p-4 border shadow-sm">
              <div class="text-sm text-gray-500 mb-1">预估总成本</div>
              <div id="stat-total-cost" class="text-2xl font-bold text-purple-600">$0.00</div>
            </div>
          </div>

          {/* 图表区域 */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 调用趋势 */}
            <div class="bg-white rounded-xl p-4 border shadow-sm">
              <h3 class="font-semibold text-gray-900 mb-4">
                <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                调用趋势
              </h3>
              <canvas id="chart-calls" height="200"></canvas>
            </div>
            {/* 模型使用分布 */}
            <div class="bg-white rounded-xl p-4 border shadow-sm">
              <h3 class="font-semibold text-gray-900 mb-4">
                <i class="fas fa-chart-pie mr-2 text-purple-500"></i>
                模型使用分布
              </h3>
              <canvas id="chart-models" height="200"></canvas>
            </div>
          </div>

          {/* Agent 性能对比 */}
          <div class="bg-white rounded-xl p-4 border shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-4">
              <i class="fas fa-robot mr-2 text-green-500"></i>
              Agent 性能对比
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-2 px-3 font-medium text-gray-600">Agent</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">调用次数</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">成功率</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">平均耗时</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">总成本</th>
                  </tr>
                </thead>
                <tbody id="agent-stats-table">
                  <tr>
                    <td colspan="5" class="py-8 text-center text-gray-400">
                      <i class="fas fa-inbox text-2xl mb-2"></i>
                      <div>暂无数据</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Agent 详情面板 */}
        <div id="panel-agents" class="hidden">
          <div class="bg-white rounded-xl p-4 border shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">
                <i class="fas fa-list mr-2 text-blue-500"></i>
                Agent 详细性能
              </h3>
              <select id="agent-filter" class="px-3 py-1.5 text-sm border rounded-lg">
                <option value="">全部 Agent</option>
              </select>
            </div>
            <div id="agent-details-content">
              <div class="py-8 text-center text-gray-400">
                <i class="fas fa-inbox text-2xl mb-2"></i>
                <div>暂无数据</div>
              </div>
            </div>
          </div>
        </div>

        {/* 实验管理面板 */}
        <div id="panel-experiments" class="hidden">
          <div class="bg-white rounded-xl p-4 border shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">
                <i class="fas fa-flask mr-2 text-purple-500"></i>
                A/B 测试实验
              </h3>
            </div>
            <div id="experiments-list">
              <div class="py-8 text-center text-gray-400">
                <i class="fas fa-flask text-2xl mb-2"></i>
                <div>加载中...</div>
              </div>
            </div>
          </div>
        </div>

        {/* 调用日志面板 */}
        <div id="panel-logs" class="hidden">
          <div class="bg-white rounded-xl p-4 border shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">
                <i class="fas fa-history mr-2 text-gray-500"></i>
                最近调用记录
              </h3>
              <div class="flex items-center gap-2">
                <select id="log-agent-filter" class="px-3 py-1.5 text-sm border rounded-lg">
                  <option value="">全部 Agent</option>
                </select>
                <select id="log-status-filter" class="px-3 py-1.5 text-sm border rounded-lg">
                  <option value="">全部状态</option>
                  <option value="true">成功</option>
                  <option value="false">失败</option>
                </select>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-2 px-3 font-medium text-gray-600">时间</th>
                    <th class="text-left py-2 px-3 font-medium text-gray-600">Agent</th>
                    <th class="text-left py-2 px-3 font-medium text-gray-600">模型</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">耗时</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">Token</th>
                    <th class="text-right py-2 px-3 font-medium text-gray-600">成本</th>
                    <th class="text-center py-2 px-3 font-medium text-gray-600">状态</th>
                  </tr>
                </thead>
                <tbody id="logs-table">
                  <tr>
                    <td colspan="7" class="py-8 text-center text-gray-400">
                      <i class="fas fa-inbox text-2xl mb-2"></i>
                      <div>暂无调用记录</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Chart.js CDN */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

      {/* 页面脚本 */}
      <script dangerouslySetInnerHTML={{
        __html: `
          const STORAGE_KEY = 'jobcopilot_metrics';
          const EXPERIMENTS_KEY = 'jobcopilot_experiments';
          let metricsData = [];
          let experimentsData = [];
          let callsChart = null;
          let modelsChart = null;

          // 加载数据
          function loadData() {
            try {
              metricsData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
              experimentsData = JSON.parse(localStorage.getItem(EXPERIMENTS_KEY) || '[]');
            } catch (e) {
              console.error('Failed to load data:', e);
              metricsData = [];
              experimentsData = [];
            }
          }

          // 保存数据
          function saveMetrics() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metricsData));
          }

          function saveExperiments() {
            localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(experimentsData));
          }

          // 计算汇总统计
          function calculateSummary() {
            if (metricsData.length === 0) {
              return {
                total_calls: 0,
                success_count: 0,
                success_rate: 0,
                avg_duration_ms: 0,
                total_cost_usd: 0,
                by_agent: {},
                by_model: {}
              };
            }

            const successCount = metricsData.filter(m => m.success).length;
            const totalDuration = metricsData.reduce((sum, m) => sum + m.duration_ms, 0);
            const totalCost = metricsData.reduce((sum, m) => sum + (m.cost_usd_est || 0), 0);

            // 按 Agent 分组
            const byAgent = {};
            metricsData.forEach(m => {
              if (!byAgent[m.agent_name]) {
                byAgent[m.agent_name] = { calls: 0, success: 0, duration: 0, cost: 0 };
              }
              byAgent[m.agent_name].calls++;
              if (m.success) byAgent[m.agent_name].success++;
              byAgent[m.agent_name].duration += m.duration_ms;
              byAgent[m.agent_name].cost += m.cost_usd_est || 0;
            });

            // 按模型分组
            const byModel = {};
            metricsData.forEach(m => {
              if (!byModel[m.model]) {
                byModel[m.model] = { calls: 0, tokens: 0, cost: 0 };
              }
              byModel[m.model].calls++;
              byModel[m.model].tokens += (m.input_tokens_est || 0) + (m.output_tokens_est || 0);
              byModel[m.model].cost += m.cost_usd_est || 0;
            });

            return {
              total_calls: metricsData.length,
              success_count: successCount,
              success_rate: successCount / metricsData.length,
              avg_duration_ms: totalDuration / metricsData.length,
              total_cost_usd: totalCost,
              by_agent: byAgent,
              by_model: byModel
            };
          }

          // 更新统计卡片
          function updateStats() {
            const summary = calculateSummary();
            
            document.getElementById('stat-total-calls').textContent = summary.total_calls;
            document.getElementById('stat-success-rate').textContent = 
              (summary.success_rate * 100).toFixed(1) + '%';
            document.getElementById('stat-avg-duration').textContent = 
              summary.avg_duration_ms > 1000 
                ? (summary.avg_duration_ms / 1000).toFixed(2) + 's'
                : summary.avg_duration_ms.toFixed(0) + 'ms';
            document.getElementById('stat-total-cost').textContent = 
              '$' + summary.total_cost_usd.toFixed(4);

            // 更新 Agent 表格
            const agentTable = document.getElementById('agent-stats-table');
            if (Object.keys(summary.by_agent).length === 0) {
              agentTable.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400"><i class="fas fa-inbox text-2xl mb-2"></i><div>暂无数据</div></td></tr>';
            } else {
              agentTable.innerHTML = Object.entries(summary.by_agent)
                .sort((a, b) => b[1].calls - a[1].calls)
                .map(([name, stats]) => \`
                  <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-3 font-medium">\${name}</td>
                    <td class="py-2 px-3 text-right">\${stats.calls}</td>
                    <td class="py-2 px-3 text-right">
                      <span class="\${stats.success / stats.calls > 0.9 ? 'text-green-600' : 'text-yellow-600'}">
                        \${(stats.success / stats.calls * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td class="py-2 px-3 text-right">\${(stats.duration / stats.calls).toFixed(0)}ms</td>
                    <td class="py-2 px-3 text-right">$\${stats.cost.toFixed(4)}</td>
                  </tr>
                \`).join('');
            }

            // 更新 Agent 筛选器
            const agentFilter = document.getElementById('agent-filter');
            const logAgentFilter = document.getElementById('log-agent-filter');
            const agentNames = [...new Set(metricsData.map(m => m.agent_name))];
            const agentOptions = '<option value="">全部 Agent</option>' + 
              agentNames.map(name => '<option value="' + name + '">' + name + '</option>').join('');
            agentFilter.innerHTML = agentOptions;
            logAgentFilter.innerHTML = agentOptions;
          }

          // 更新图表
          function updateCharts() {
            const summary = calculateSummary();

            // 调用趋势图
            const callsCtx = document.getElementById('chart-calls');
            if (callsChart) callsChart.destroy();

            // 按小时分组
            const hourlyData = {};
            metricsData.forEach(m => {
              const hour = m.timestamp.slice(0, 13) + ':00';
              hourlyData[hour] = (hourlyData[hour] || 0) + 1;
            });
            const sortedHours = Object.keys(hourlyData).sort().slice(-24);

            callsChart = new Chart(callsCtx, {
              type: 'line',
              data: {
                labels: sortedHours.map(h => h.slice(11, 16)),
                datasets: [{
                  label: '调用次数',
                  data: sortedHours.map(h => hourlyData[h]),
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true }
                }
              }
            });

            // 模型分布饼图
            const modelsCtx = document.getElementById('chart-models');
            if (modelsChart) modelsChart.destroy();

            const modelNames = Object.keys(summary.by_model);
            const modelColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

            modelsChart = new Chart(modelsCtx, {
              type: 'doughnut',
              data: {
                labels: modelNames,
                datasets: [{
                  data: modelNames.map(m => summary.by_model[m].calls),
                  backgroundColor: modelColors.slice(0, modelNames.length)
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }
            });
          }

          // 更新日志表格
          function updateLogs() {
            const agentFilter = document.getElementById('log-agent-filter').value;
            const statusFilter = document.getElementById('log-status-filter').value;

            let filtered = [...metricsData];
            if (agentFilter) {
              filtered = filtered.filter(m => m.agent_name === agentFilter);
            }
            if (statusFilter !== '') {
              filtered = filtered.filter(m => m.success === (statusFilter === 'true'));
            }

            const logsTable = document.getElementById('logs-table');
            if (filtered.length === 0) {
              logsTable.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-400"><i class="fas fa-inbox text-2xl mb-2"></i><div>暂无调用记录</div></td></tr>';
            } else {
              logsTable.innerHTML = filtered
                .slice(-50)
                .reverse()
                .map(m => \`
                  <tr class="border-b hover:bg-gray-50">
                    <td class="py-2 px-3 text-gray-500">\${new Date(m.timestamp).toLocaleString('zh-CN')}</td>
                    <td class="py-2 px-3 font-medium">\${m.agent_name}</td>
                    <td class="py-2 px-3"><span class="px-2 py-0.5 bg-gray-100 rounded text-xs">\${m.model}</span></td>
                    <td class="py-2 px-3 text-right">\${m.duration_ms}ms</td>
                    <td class="py-2 px-3 text-right">\${(m.input_tokens_est || 0) + (m.output_tokens_est || 0)}</td>
                    <td class="py-2 px-3 text-right">$\${(m.cost_usd_est || 0).toFixed(4)}</td>
                    <td class="py-2 px-3 text-center">
                      \${m.success 
                        ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700"><i class="fas fa-check mr-1"></i>成功</span>'
                        : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700"><i class="fas fa-times mr-1"></i>失败</span>'
                      }
                    </td>
                  </tr>
                \`).join('');
            }
          }

          // 更新实验列表
          function updateExperiments() {
            // 默认实验模板
            const defaultExperiments = [
              { id: 'exp_1', name: 'JD B维度分析: GPT-4.1 vs DeepSeek', agent_name: 'jd-analysis-b', control: { model: 'gpt-4.1', weight: 50 }, treatment: { model: 'deepseek-v3', weight: 50 }, enabled: false },
              { id: 'exp_2', name: '匹配评估: GPT-4.1 vs Qwen-Max', agent_name: 'match-evaluate', control: { model: 'gpt-4.1', weight: 50 }, treatment: { model: 'qwen-max', weight: 50 }, enabled: false },
              { id: 'exp_3', name: '简历优化: GPT-4.1 vs DeepSeek', agent_name: 'resume-optimize', control: { model: 'gpt-4.1', weight: 50 }, treatment: { model: 'deepseek-v3', weight: 50 }, enabled: false },
              { id: 'exp_4', name: '面试准备: GPT-4.1 vs DeepSeek', agent_name: 'interview-prep', control: { model: 'gpt-4.1', weight: 50 }, treatment: { model: 'deepseek-v3', weight: 50 }, enabled: false },
            ];

            const experiments = experimentsData.length > 0 ? experimentsData : defaultExperiments;
            if (experimentsData.length === 0) {
              experimentsData = defaultExperiments;
              saveExperiments();
            }

            const container = document.getElementById('experiments-list');
            container.innerHTML = experiments.map(exp => \`
              <div class="border rounded-lg p-4 mb-3 \${exp.enabled ? 'border-purple-300 bg-purple-50' : ''}">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-gray-900">\${exp.name}</h4>
                    <p class="text-sm text-gray-500 mt-1">
                      Agent: <span class="font-mono">\${exp.agent_name}</span>
                    </p>
                    <div class="flex items-center gap-4 mt-2 text-sm">
                      <span class="text-blue-600">
                        <i class="fas fa-circle mr-1"></i>
                        控制组: \${exp.control.model} (\${exp.control.weight}%)
                      </span>
                      <span class="text-purple-600">
                        <i class="fas fa-circle mr-1"></i>
                        实验组: \${exp.treatment.model} (\${exp.treatment.weight}%)
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" \${exp.enabled ? 'checked' : ''} 
                        onchange="toggleExperiment('\${exp.id}', this.checked)">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      <span class="ml-2 text-sm font-medium text-gray-700">\${exp.enabled ? '运行中' : '已停止'}</span>
                    </label>
                  </div>
                </div>
              </div>
            \`).join('');
          }

          // 切换实验状态
          function toggleExperiment(id, enabled) {
            const exp = experimentsData.find(e => e.id === id);
            if (exp) {
              // 如果启用，禁用同一 Agent 的其他实验
              if (enabled) {
                experimentsData.forEach(e => {
                  if (e.agent_name === exp.agent_name && e.id !== id) {
                    e.enabled = false;
                  }
                });
              }
              exp.enabled = enabled;
              saveExperiments();
              updateExperiments();
              showToast(enabled ? '实验已启用' : '实验已停止');
            }
          }

          // Tab 切换
          function setupTabs() {
            const tabs = ['overview', 'agents', 'experiments', 'logs'];
            tabs.forEach(tab => {
              document.getElementById('tab-' + tab).addEventListener('click', () => {
                tabs.forEach(t => {
                  document.getElementById('tab-' + t).classList.remove('border-blue-500', 'text-blue-600');
                  document.getElementById('tab-' + t).classList.add('text-gray-500', 'border-transparent');
                  document.getElementById('panel-' + t).classList.add('hidden');
                });
                document.getElementById('tab-' + tab).classList.remove('text-gray-500', 'border-transparent');
                document.getElementById('tab-' + tab).classList.add('border-blue-500', 'text-blue-600');
                document.getElementById('panel-' + tab).classList.remove('hidden');

                if (tab === 'logs') updateLogs();
                if (tab === 'experiments') updateExperiments();
              });
            });
          }

          // Toast 通知
          function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
          }

          // 刷新数据
          function refresh() {
            loadData();
            updateStats();
            updateCharts();
            updateLogs();
            updateExperiments();
            showToast('数据已刷新');
          }

          // 导出数据
          function exportData() {
            const data = JSON.stringify(metricsData, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'metrics_' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('数据已导出');
          }

          // 清空数据
          function clearData() {
            if (confirm('确定要清空所有评测数据吗？此操作不可恢复。')) {
              metricsData = [];
              saveMetrics();
              refresh();
              showToast('数据已清空');
            }
          }

          // 初始化
          document.addEventListener('DOMContentLoaded', () => {
            loadData();
            setupTabs();
            updateStats();
            updateCharts();
            updateExperiments();

            document.getElementById('refresh-btn').addEventListener('click', refresh);
            document.getElementById('export-btn').addEventListener('click', exportData);
            document.getElementById('clear-btn').addEventListener('click', clearData);
            document.getElementById('log-agent-filter').addEventListener('change', updateLogs);
            document.getElementById('log-status-filter').addEventListener('change', updateLogs);
          });
        `
      }} />
    </div>,
    { title: '评测仪表盘 - Job Copilot' }
  )
})

// ==================== API 路由 ====================

// 挂载岗位相关路由
app.route('/api/job', jobRoutes)
app.route('/api/jobs', jobRoutes)

// 挂载简历相关路由
app.route('/api/resume', resumeRoutes)

// 挂载匹配相关路由
app.route('/api/job', matchRoutes)

// 挂载面试准备相关路由
app.route('/api/job', interviewRoutes)

// 挂载简历优化相关路由
app.route('/api/job', optimizeRoutes)

// 挂载评测相关路由
app.route('/api/metrics', metricsRoutes)

// API健康检查
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.7.0',
    phase: 'Phase 6 - 模型评测与优化',
  })
})

// API测试 - 测试Vectorengine API连接
app.post('/api/test', async (c) => {
  try {
    const body = await c.req.json()
    const { message = '你好，请简单介绍一下自己。' } = body

    const response = await chat(
      '你是一个AI助手，请简洁回答问题。',
      message,
      { model: MODELS.FAST }
    )

    return c.json({
      success: true,
      response,
      model: MODELS.FAST,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return c.json({
      success: false,
      error: errorMessage,
    }, 500)
  }
})

// ==================== 静态文件路由 ====================

// 开发方案文档下载路由
app.get('/Job-Copilot-开发方案文档.md', async (c) => {
  const docContent = `# Job Copilot 智能求职助手 - 完整开发方案文档

> **版本**: v1.0  
> **更新日期**: 2026-01-12  
> **当前阶段**: Phase 2 - 简历解析与匹配评估

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [UI/UX 设计规范](#3-uiux-设计规范)
4. [页面设计](#4-页面设计)
5. [多 Agent 编排系统](#5-多-agent-编排系统)
6. [各 Agent 详细设计](#6-各-agent-详细设计)
7. [API 接口设计](#7-api-接口设计)
8. [数据模型](#8-数据模型)
9. [开发路线图](#9-开发路线图)
10. [部署与运维](#10-部署与运维)

---

## 1. 项目概述

### 1.1 项目背景

Job Copilot 是一款 AI 驱动的智能求职助手，帮助求职者：
- **高效解析 JD**：从图片或文本中提取结构化信息
- **智能匹配评估**：评估简历与岗位的匹配度
- **面试准备**：生成针对性的面试准备材料
- **简历优化**：根据目标岗位优化简历内容

### 1.2 核心功能

| 阶段 | 功能模块 | 描述 |
|------|----------|------|
| Phase 0 | 项目初始化 | 技术框架搭建、API 集成 |
| Phase 1 | JD 解析 | 图片/文本输入，结构化输出，A/B 维度分析 |
| Phase 2 | 简历解析与匹配 | 简历解析、能力标签提取、匹配评估 |
| Phase 3 | 面试准备 | 公司分析、面试问题、自我介绍生成 |
| Phase 4 | 简历优化 | 基于匹配结果优化简历内容 |

### 1.3 目标用户

- **主要用户**：互联网行业求职者（产品经理、开发、设计等）
- **使用场景**：海投前筛选、面试前准备、简历针对性优化

---

## 2. 技术架构

### 2.1 技术栈

\`\`\`
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  HTML + TailwindCSS + Vanilla JS + Font Awesome     │
├─────────────────────────────────────────────────────┤
│                    Backend                          │
│           Hono Framework + TypeScript               │
├─────────────────────────────────────────────────────┤
│                 AI Services                         │
│    Vectorengine API (GPT-4o / Qwen / GPT-4.1)      │
├─────────────────────────────────────────────────────┤
│                  Deployment                         │
│   Cloudflare Workers / Pages (Edge Computing)       │
└─────────────────────────────────────────────────────┘
\`\`\`

### 2.2 项目结构

\`\`\`
webapp/
├── src/
│   ├── index.tsx              # 主入口，页面路由
│   ├── renderer.tsx           # JSX 渲染器
│   ├── agents/                # AI Agent 模块
│   │   ├── jd-preprocess.ts   # JD 预处理
│   │   ├── jd-structure.ts    # JD 结构化
│   │   ├── jd-analysis-a.ts   # A 维度分析
│   │   ├── jd-analysis-b.ts   # B 维度分析
│   │   ├── resume-preprocess.ts # 简历预处理
│   │   ├── resume-parse.ts    # 简历解析
│   │   └── match-evaluate.ts  # 匹配评估
│   ├── core/                  # 核心模块
│   │   ├── api-client.ts      # Vectorengine API 客户端
│   │   └── dag-executor.ts    # DAG 执行器
│   ├── routes/                # API 路由
│   │   ├── job.ts             # 岗位相关 API
│   │   └── resume.ts          # 简历相关 API
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/                 # 工具函数
│       └── storage.ts         # 本地存储封装
├── public/
│   └── static/
│       ├── app.js             # 前端交互脚本
│       └── style.css          # 自定义样式
├── ecosystem.config.cjs       # PM2 配置
├── vite.config.ts             # Vite 构建配置
├── wrangler.jsonc             # Cloudflare 配置
└── package.json
\`\`\`

### 2.3 API 客户端配置

\`\`\`typescript
// src/core/api-client.ts
const API_CONFIG = {
  baseUrl: 'https://api.vectorengine.ai',
  timeout: 120000,
};

// 模型配置
export const MODELS = {
  VISION: 'gpt-4o',        // 视觉理解
  FAST: 'qwen-turbo',      // 快速响应
  MEDIUM: 'qwen-max',      // 中等质量
  HIGH: 'gpt-4.1',         // 高质量
};

// Agent 模型映射
export const AGENT_MODELS: Record<string, string> = {
  'jd-preprocess-image': MODELS.VISION,
  'jd-preprocess-text': MODELS.FAST,
  'jd-structure': MODELS.MEDIUM,
  'jd-analysis-a': MODELS.MEDIUM,
  'jd-analysis-b': MODELS.HIGH,
  'resume-preprocess-image': MODELS.VISION,
  'resume-preprocess-text': MODELS.FAST,
  'resume-parse': MODELS.MEDIUM,
  'match-evaluate': MODELS.HIGH,
  'company-analyze': MODELS.HIGH,
  'interview-prep': MODELS.HIGH,
  'resume-optimize': MODELS.HIGH,
  'router': MODELS.FAST,
};
\`\`\`

---

## 3. UI/UX 设计规范

### 3.1 设计原则

1. **简洁至上**：减少视觉干扰，聚焦核心功能
2. **信息层次**：通过排版和颜色区分信息重要性
3. **操作引导**：清晰的操作路径和状态反馈
4. **响应式**：适配桌面端和移动端

### 3.2 配色方案

\`\`\`css
/* 主要颜色 */
--primary: #000000;        /* 主色：纯黑 */
--secondary: #6B7280;      /* 辅助色：灰色 */
--surface: #F9FAFB;        /* 表面色：浅灰背景 */
--border: #E5E7EB;         /* 边框色 */

/* 状态颜色 */
--success: #10B981;        /* 成功/匹配 */
--warning: #F59E0B;        /* 警告/部分匹配 */
--error: #EF4444;          /* 错误/不匹配 */
--info: #3B82F6;           /* 信息 */

/* 匹配度颜色 */
.match-excellent { color: #10B981; }  /* 非常匹配 85-100 */
.match-good { color: #3B82F6; }       /* 比较匹配 70-84 */
.match-fair { color: #F59E0B; }       /* 还可以 55-69 */
.match-poor { color: #EF4444; }       /* 不太匹配 40-54 */
\`\`\`

---

## 4. 页面设计

### 4.1 首页 \`/\`

**功能**：导航入口、快速操作、最近记录

### 4.2 新建岗位解析页 \`/job/new\`

**功能**：JD 输入、解析进度展示、结果跳转

### 4.3 岗位详情页 \`/job/:id\`

**功能**：展示结构化 JD、A/B 维度分析结果

### 4.4 我的简历页 \`/resume\`

**功能**：简历上传、解析状态、能力标签展示

### 4.5 岗位匹配页 \`/job/:id/match\`

**功能**：匹配度评估、维度分析、优势差距

---

## 5. 多 Agent 编排系统

### 5.1 DAG 执行器设计

\`\`\`typescript
interface DAGNode {
  id: string;
  name: string;
  agent: string;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: AgentResult<any>;
}

interface DAGState {
  nodes: DAGNode[];
  current_phase: number;
  total_phases: number;
  is_complete: boolean;
}
\`\`\`

### 5.2 JD 解析 DAG 流程

jd-preprocess (gpt-4o/qwen-turbo) → jd-structure (qwen-max) → jd-analysis-a (qwen-max) → jd-analysis-b (gpt-4.1)

### 5.3 简历解析 DAG 流程

resume-preprocess (gpt-4o/qwen-turbo) → resume-parse (qwen-max)

### 5.4 匹配评估 DAG 流程

(structuredJD + aAnalysis + bAnalysis) + (structuredResume + abilityTags) → match-evaluate (gpt-4.1)

---

## 6. 各 Agent 详细设计

### 6.1 JD 预处理 Agent (jd-preprocess)

| 属性 | 值 |
|------|-----|
| **主模型** | gpt-4o (图片) / qwen-turbo (文本) |
| **备用模型** | gpt-4.1 / qwen-max |
| **输入** | 图片 URL 或文本 |
| **输出** | 清洗后的 JD 文本 |

### 6.2 JD 结构化 Agent (jd-structure)

| 属性 | 值 |
|------|-----|
| **主模型** | qwen-max |
| **备用模型** | gpt-4.1 |
| **输入** | 清洗后的 JD 文本 |
| **输出** | 结构化 JD (JSON) |

### 6.3 JD A 维度分析 Agent (jd-analysis-a)

| 属性 | 值 |
|------|-----|
| **主模型** | qwen-max |
| **备用模型** | gpt-4.1 |
| **输入** | 结构化 JD |
| **输出** | A1技术栈、A2产品类型、A3业务领域、A4团队阶段 |

### 6.4 JD B 维度分析 Agent (jd-analysis-b)

| 属性 | 值 |
|------|-----|
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 结构化 JD + A 维度分析结果 |
| **输出** | B1行业要求、B2技术要求、B3产品经验、B4能力要求 |

### 6.5 简历预处理 Agent (resume-preprocess)

| 属性 | 值 |
|------|-----|
| **主模型** | gpt-4o (文件) / qwen-turbo (文本) |
| **备用模型** | gpt-4.1 / qwen-max |
| **输入** | 简历文件或文本 |
| **输出** | 清洗后的简历文本 |

### 6.6 简历解析 Agent (resume-parse)

| 属性 | 值 |
|------|-----|
| **主模型** | qwen-max |
| **备用模型** | gpt-4.1 |
| **输入** | 清洗后的简历文本 |
| **输出** | 结构化简历 + 能力标签 |

### 6.7 匹配评估 Agent (match-evaluate)

| 属性 | 值 |
|------|-----|
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 结构化简历 + JD 分析结果 |
| **输出** | 匹配度、维度匹配、优势差距、面试建议 |

### 匹配度等级规则

| 等级 | 条件 | 分数区间 |
|------|------|----------|
| 非常匹配 | A3业务领域一致 + B1-B4全部满足(4项) | 85-100 |
| 比较匹配 | A3一致 + B1-B4满足3项 | 70-84 |
| 匹配度还可以 | A3相关 + B1-B4满足2项 | 55-69 |
| 不是很匹配 | A3不相关 或 B1-B4仅满足1项 | 40-54 |
| 不匹配 | B1-B4均不满足 | 0-39 |

---

## 7. API 接口设计

### 7.1 岗位相关 API

- POST /api/job/parse-sync - 同步解析 JD
- GET /api/jobs - 获取岗位列表
- GET /api/job/:id - 获取岗位详情
- DELETE /api/job/:id - 删除岗位

### 7.2 简历相关 API

- POST /api/resume/parse - 解析简历
- GET /api/resume - 获取所有简历
- GET /api/resume/:id - 获取简历详情
- DELETE /api/resume/:id - 删除简历

### 7.3 匹配相关 API

- POST /api/job/:id/match - 执行匹配评估
- GET /api/job/:id/match - 获取匹配结果

### 7.4 健康检查

- GET /api/health - 服务健康检查

---

## 8. 数据模型

### 8.1 Job (岗位)

\`\`\`typescript
interface Job {
  id: string;
  title: string;
  company: string;
  raw_content: string;
  structured_jd: StructuredJD;
  a_analysis: AAnalysis;
  b_analysis: BAnalysis;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}
\`\`\`

### 8.2 Resume (简历)

\`\`\`typescript
interface Resume {
  id: string;
  raw_content: string;
  basic_info: { name, contact, target_position };
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  skills: string[];
  ability_tags: AbilityTags;
  status: string;
  created_at: string;
}
\`\`\`

### 8.3 Match (匹配结果)

\`\`\`typescript
interface Match {
  id: string;
  job_id: string;
  resume_id: string;
  match_level: MatchLevel;
  match_score: number;
  dimension_match: {...};
  strengths: string[];
  gaps: string[];
  interview_focus_suggestion: string;
  created_at: string;
}
\`\`\`

---

## 9. 开发路线图

- Phase 0: 项目初始化 ✅ 已完成
- Phase 1: JD 解析 ✅ 已完成
- Phase 2: 简历解析与匹配 ✅ 进行中
- Phase 3: 面试准备（计划中）
- Phase 4: 简历优化（计划中）

---

## 10. 部署与运维

### 10.1 本地开发

\`\`\`bash
npm install
npm run build
npm run dev:sandbox
\`\`\`

### 10.2 Cloudflare 部署

\`\`\`bash
npx wrangler login
npm run deploy
\`\`\`

---

> 文档版本: v1.0  
> 最后更新: 2026-01-12  
> 作者: Job Copilot Team
`;

  return new Response(docContent, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': 'attachment; filename="Job-Copilot-开发方案文档.md"',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

// 导出应用
export default app
