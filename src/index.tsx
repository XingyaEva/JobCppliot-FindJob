/**
 * Job Copilot - 智能求职助手
 * 主入口文件
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { chat, MODELS } from './core/api-client'
import jobRoutes from './routes/job'

// 创建应用实例
const app = new Hono()

// 中间件
app.use('*', cors())
app.use(renderer)

// ==================== 页面路由 ====================

// 首页
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen bg-white">
      {/* 导航栏 */}
      <header class="border-b border-gray-100">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 class="text-xl font-bold">Job Copilot</h1>
          <div class="flex items-center gap-4">
            <span id="resume-status" class="text-sm text-gray-500">
              <i class="fas fa-file-alt mr-1"></i>
              简历状态: 未上传
            </span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main class="max-w-6xl mx-auto px-4 py-8">
        {/* 快速入口 */}
        <div class="mb-12">
          <a 
            href="/job/new" 
            class="block w-full max-w-xl mx-auto p-8 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-gray-400 hover:bg-gray-50 transition-all card-hover"
          >
            <i class="fas fa-plus text-4xl text-gray-400 mb-4"></i>
            <h2 class="text-xl font-semibold mb-2">+ 新建岗位解析</h2>
            <p class="text-gray-500">上传 JD 截图 或 粘贴岗位描述</p>
          </a>
        </div>

        {/* 最近解析的岗位 */}
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold">最近解析的岗位</h2>
            <a href="/jobs" class="text-sm text-gray-500 hover:text-gray-700">
              查看全部 <i class="fas fa-arrow-right ml-1"></i>
            </a>
          </div>

          <div id="recent-jobs" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 岗位卡片将通过JS动态加载 */}
            <div class="p-8 bg-gray-50 rounded-xl text-center text-gray-400">
              <i class="fas fa-inbox text-3xl mb-3"></i>
              <p>暂无解析记录</p>
              <p class="text-sm mt-1">点击上方按钮开始解析岗位</p>
            </div>
          </div>
        </div>

        {/* 功能入口 */}
        <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/jobs" class="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
            <i class="fas fa-briefcase text-2xl text-gray-600 mb-2"></i>
            <p class="text-sm font-medium">岗位库</p>
          </a>
          <a href="/resume" class="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
            <i class="fas fa-file-alt text-2xl text-gray-600 mb-2"></i>
            <p class="text-sm font-medium">我的简历</p>
          </a>
          <a href="#" class="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors opacity-50">
            <i class="fas fa-chart-bar text-2xl text-gray-600 mb-2"></i>
            <p class="text-sm font-medium">数据统计</p>
            <span class="text-xs text-gray-400">即将推出</span>
          </a>
          <a href="#" class="p-4 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors opacity-50">
            <i class="fas fa-cog text-2xl text-gray-600 mb-2"></i>
            <p class="text-sm font-medium">设置</p>
            <span class="text-xs text-gray-400">即将推出</span>
          </a>
        </div>
      </main>

      {/* 页脚 */}
      <footer class="border-t border-gray-100 mt-12">
        <div class="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>Job Copilot - 智能求职助手 | Phase 1 - JD解析</p>
        </div>
      </footer>
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

            // 解析按钮点击
            parseBtn.addEventListener('click', async function() {
              const text = textInput.value.trim();
              
              if (!text && !imageDataUrl) {
                alert('请上传JD截图或粘贴JD文本');
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
                  }),
                });

                const result = await response.json();

                if (result.success) {
                  // 更新DAG状态
                  if (result.dagState) {
                    renderDAGNodes(result.dagState.nodes);
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
            <p id="job-company" class="text-gray-600 mb-4">
              <i class="fas fa-building mr-2"></i>
              <span>公司名称</span>
            </p>
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
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center">
            <a href="/" class="text-gray-500 hover:text-gray-700 mr-4">
              <i class="fas fa-arrow-left"></i>
            </a>
            <h1 class="text-xl font-bold">岗位库</h1>
          </div>
          <a href="/job/new" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
            <i class="fas fa-plus mr-1"></i>新建解析
          </a>
        </div>
      </header>
      
      <main class="max-w-6xl mx-auto px-4 py-8">
        <div id="jobs-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 岗位列表将通过JS动态渲染 */}
        </div>
        
        <div id="empty-state" class="hidden text-center py-12">
          <i class="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">暂无岗位记录</p>
          <a href="/job/new" class="inline-block mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            开始解析第一个岗位
          </a>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const jobsList = document.getElementById('jobs-list');
            const emptyState = document.getElementById('empty-state');
            
            // 从localStorage获取岗位数据
            const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            
            if (jobs.length === 0) {
              emptyState.classList.remove('hidden');
              return;
            }
            
            jobsList.innerHTML = jobs.map(job => {
              const statusColor = job.status === 'completed' ? 'green' : (job.status === 'error' ? 'red' : 'yellow');
              return '<a href="/job/' + job.id + '" class="block p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">' +
                '<div class="flex items-start justify-between mb-2">' +
                '<h3 class="font-semibold text-gray-900">' + job.title + '</h3>' +
                '<span class="w-2 h-2 rounded-full bg-' + statusColor + '-500"></span>' +
                '</div>' +
                '<p class="text-sm text-gray-500 mb-3">' + job.company + '</p>' +
                '<div class="flex flex-wrap gap-2">' +
                (job.a_analysis?.A2_product_type?.type ? '<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">' + job.a_analysis.A2_product_type.type + '</span>' : '') +
                (job.a_analysis?.A3_business_domain?.primary ? '<span class="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">' + job.a_analysis.A3_business_domain.primary + '</span>' : '') +
                '</div>' +
                '<p class="text-xs text-gray-400 mt-3">' + new Date(job.created_at).toLocaleDateString() + '</p>' +
                '</a>';
            }).join('');
          });
        `
      }} />
    </div>,
    { title: '岗位库 - Job Copilot' }
  )
})

// 简历页面（占位）
app.get('/resume', (c) => {
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <a href="/" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="fas fa-arrow-left"></i>
          </a>
          <h1 class="text-xl font-bold">我的简历</h1>
        </div>
      </header>
      <main class="max-w-4xl mx-auto px-4 py-8">
        <div class="p-8 bg-gray-50 rounded-xl text-center">
          <i class="fas fa-tools text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">Phase 2 开发中...</p>
          <p class="text-sm text-gray-400 mt-2">简历解析功能将在后续阶段实现</p>
        </div>
      </main>
    </div>,
    { title: '我的简历 - Job Copilot' }
  )
})

// ==================== API 路由 ====================

// 挂载岗位相关路由
app.route('/api/job', jobRoutes)
app.route('/api/jobs', jobRoutes)

// API健康检查
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
    phase: 'Phase 1 - JD解析',
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

// 导出应用
export default app
