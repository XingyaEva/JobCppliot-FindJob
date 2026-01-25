/**
 * Job Copilot - 智能求职助手
 * 主入口文件
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { chat, MODELS } from './core/api-client'
import jobRoutes from './routes/job'
import resumeRoutes, { matchRoutes, generateTargetedResume } from './routes/resume'
import interviewRoutes from './routes/interview'
import optimizeRoutes from './routes/optimize'
import { metricsRoutes } from './routes/metrics'
import questionRoutes from './routes/questions'
import applicationRoutes from './routes/applications'

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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
              <a href="/questions" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-question-circle mr-1.5"></i><span class="hidden sm:inline">题库</span>
              </a>
              <a href="/applications" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-paper-plane mr-1.5"></i><span class="hidden sm:inline">投递</span>
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
              <span>Job Copilot v1.0.0</span>
              <span class="hidden sm:inline">|</span>
              <span class="hidden sm:inline">Phase 9 - 投递跟踪</span>
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
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div class="flex items-center">
            <a href="/" class="text-gray-500 hover:text-gray-700 mr-4">
              <i class="fas fa-arrow-left"></i>
            </a>
            <h1 class="text-xl font-bold">新建岗位解析</h1>
          </div>
          <a href="/job/cookie-settings" class="text-sm text-gray-500 hover:text-gray-700">
            <i class="fas fa-cog mr-1"></i>Cookie设置
          </a>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 输入方式选择 Tab */}
        <div class="mb-6">
          <div class="flex border-b border-gray-200">
            <button id="tab-manual" class="px-4 py-3 text-sm font-medium border-b-2 border-black text-black -mb-px">
              <i class="fas fa-edit mr-2"></i>手动输入
            </button>
            <button id="tab-url" class="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 -mb-px">
              <i class="fas fa-link mr-2"></i>URL爬取
              <span class="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-600 rounded">新</span>
            </button>
          </div>
        </div>

        {/* 手动输入区域 */}
        <div id="panel-manual" class="space-y-6">
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

        {/* URL爬取区域 */}
        <div id="panel-url" class="hidden space-y-6">
          {/* 支持的平台提示 */}
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h4 class="text-sm font-medium text-blue-700 mb-2">
              <i class="fas fa-info-circle mr-2"></i>支持的招聘平台
            </h4>
            <div id="supported-platforms" class="flex flex-wrap gap-2">
              <span class="text-xs px-2 py-1 bg-white border border-blue-200 rounded-full text-blue-600">
                <i class="fas fa-check-circle mr-1"></i>Boss直聘
              </span>
              <span class="text-xs px-2 py-1 bg-white border border-blue-200 rounded-full text-blue-600">
                <i class="fas fa-check-circle mr-1"></i>拉勾
              </span>
              <span class="text-xs px-2 py-1 bg-white border border-blue-200 rounded-full text-blue-600">
                <i class="fas fa-check-circle mr-1"></i>猎聘
              </span>
            </div>
            <p class="text-xs text-blue-600 mt-2">
              <i class="fas fa-lightbulb mr-1"></i>
              粘贴招聘网站的岗位详情页URL，系统将自动爬取并解析JD内容
            </p>
          </div>

          {/* URL输入 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-link mr-1 text-blue-500"></i>
              岗位详情页URL
            </label>
            <div class="relative">
              <input 
                type="url"
                id="scrape-url"
                class="w-full px-4 py-4 pr-24 border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none text-base"
                placeholder="https://www.zhipin.com/job_detail/xxx.html"
              />
              <button 
                id="validate-url-btn"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs text-blue-500 hover:text-blue-600"
              >
                <i class="fas fa-check-circle mr-1"></i>验证
              </button>
            </div>
            <div id="scrape-url-status" class="mt-2 hidden">
              {/* 验证状态显示 */}
            </div>
          </div>

          {/* Cookie 状态提示 */}
          <div id="cookie-status" class="bg-gray-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-700">
                <i class="fas fa-cookie mr-2 text-orange-400"></i>Cookie状态
              </h4>
              <a href="/job/cookie-settings" class="text-xs text-blue-500 hover:text-blue-600">
                配置Cookie →
              </a>
            </div>
            <div id="cookie-list" class="flex flex-wrap gap-2">
              {/* 动态渲染Cookie状态 */}
            </div>
            <p class="text-xs text-gray-500 mt-2">
              <i class="fas fa-info-circle mr-1"></i>
              部分页面可能需要登录态Cookie才能正常爬取
            </p>
          </div>

          {/* 开始爬取按钮 */}
          <div class="flex justify-center">
            <button 
              id="scrape-btn"
              class="px-8 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-spider mr-2"></i>
              开始爬取并解析
            </button>
          </div>

          {/* 爬取进度 */}
          <div id="scrape-progress" class="hidden">
            <div class="bg-gray-50 rounded-xl p-6">
              <h3 class="font-semibold mb-4">
                <i class="fas fa-spinner loading-spinner mr-2"></i>
                <span id="scrape-status-text">正在爬取...</span>
              </h3>
              <div class="space-y-3">
                <div id="scrape-step-fetch" class="flex items-center gap-3">
                  <i class="fas fa-circle text-gray-300"></i>
                  <span class="text-gray-500">页面爬取</span>
                </div>
                <div id="scrape-step-extract" class="flex items-center gap-3">
                  <i class="fas fa-circle text-gray-300"></i>
                  <span class="text-gray-500">内容提取</span>
                </div>
                <div id="scrape-step-parse" class="flex items-center gap-3">
                  <i class="fas fa-circle text-gray-300"></i>
                  <span class="text-gray-500">JD解析</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 解析进度区域（手动输入用） */}
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
            // ==================== Tab 切换 ====================
            const tabManual = document.getElementById('tab-manual');
            const tabUrl = document.getElementById('tab-url');
            const panelManual = document.getElementById('panel-manual');
            const panelUrl = document.getElementById('panel-url');
            
            function switchTab(tab) {
              if (tab === 'manual') {
                tabManual.className = 'px-4 py-3 text-sm font-medium border-b-2 border-black text-black -mb-px';
                tabUrl.className = 'px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 -mb-px';
                panelManual.classList.remove('hidden');
                panelUrl.classList.add('hidden');
              } else {
                tabUrl.className = 'px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 -mb-px';
                tabManual.className = 'px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 -mb-px';
                panelUrl.classList.remove('hidden');
                panelManual.classList.add('hidden');
                // 加载 Cookie 状态
                loadCookieStatus();
              }
              // 隐藏错误提示
              errorArea.classList.add('hidden');
            }
            
            tabManual.addEventListener('click', () => switchTab('manual'));
            tabUrl.addEventListener('click', () => switchTab('url'));

            // ==================== 手动输入区域 ====================
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
              // 如果焦点在文本输入框或URL输入框，不处理图片粘贴
              if (document.activeElement === textInput || 
                  document.activeElement === scrapeUrlInput) {
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
                    // 确保切换到手动输入 Tab
                    switchTab('manual');
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
                // 使用异步模式 + 轮询（避免长连接超时问题）
                
                // 1. 创建解析任务
                const createResponse = await fetch('/api/job/parse-async', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: imageDataUrl ? 'image' : 'text',
                    content: text || undefined,
                    imageUrl: imageDataUrl || undefined,
                    jobUrl: jobUrl || undefined,
                  }),
                });

                const createResult = await createResponse.json();
                
                if (!createResult.success) {
                  throw new Error(createResult.error || '创建解析任务失败');
                }

                const { taskId, jobId } = createResult;
                console.log('解析任务已创建:', taskId);

                // 2. 轮询任务状态
                let pollCount = 0;
                const maxPolls = 180; // 最多轮询3分钟（每秒1次）
                
                const pollTask = async () => {
                  try {
                    const statusResponse = await fetch('/api/job/task/' + taskId);
                    const statusResult = await statusResponse.json();
                    
                    if (!statusResult.success) {
                      throw new Error(statusResult.error || '查询任务状态失败');
                    }
                    
                    const { task } = statusResult;
                    
                    // 更新进度显示
                    const progressNodes = [
                      { id: 'preprocess', name: 'JD预处理', status: task.progress >= 25 ? 'completed' : (task.progress >= 10 ? 'running' : 'pending') },
                      { id: 'structure', name: 'JD结构化', status: task.progress >= 50 ? 'completed' : (task.progress >= 25 ? 'running' : 'pending') },
                      { id: 'analysis-a', name: 'A维度分析', status: task.progress >= 75 ? 'completed' : (task.progress >= 50 ? 'running' : 'pending') },
                      { id: 'analysis-b', name: 'B维度分析', status: task.progress >= 100 ? 'completed' : (task.progress >= 75 ? 'running' : 'pending') },
                    ];
                    renderDAGNodes(progressNodes);
                    
                    if (task.status === 'completed' && task.job) {
                      // 解析完成
                      renderDAGNodes([
                        { id: 'preprocess', name: 'JD预处理', status: 'completed' },
                        { id: 'structure', name: 'JD结构化', status: 'completed' },
                        { id: 'analysis-a', name: 'A维度分析', status: 'completed' },
                        { id: 'analysis-b', name: 'B维度分析', status: 'completed' },
                      ]);
                      
                      // 将结果存储到localStorage
                      const jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
                      jobs.unshift(task.job);
                      localStorage.setItem('jobcopilot_jobs', JSON.stringify(jobs));
                      
                      // 跳转到详情页
                      setTimeout(() => {
                        window.location.href = '/job/' + task.job.id;
                      }, 500);
                      return;
                    }
                    
                    if (task.status === 'error') {
                      throw new Error(task.error || '解析失败');
                    }
                    
                    // 继续轮询
                    pollCount++;
                    if (pollCount < maxPolls) {
                      setTimeout(pollTask, 1000); // 每秒轮询一次
                    } else {
                      throw new Error('解析超时，请重试');
                    }
                  } catch (pollError) {
                    console.error('轮询失败:', pollError);
                    throw pollError;
                  }
                };
                
                // 开始轮询
                setTimeout(pollTask, 1000);
                
              } catch (error) {
                console.error('解析失败:', error);
                
                // 区分不同类型的错误
                let errorText = '解析失败，请重试';
                if (error.message === 'Failed to fetch') {
                  errorText = '网络连接失败，请检查网络后重试';
                } else if (error.message) {
                  errorText = error.message;
                }
                
                errorMessage.textContent = errorText;
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

            // ==================== URL爬取区域 ====================
            const scrapeUrlInput = document.getElementById('scrape-url');
            const scrapeUrlStatus = document.getElementById('scrape-url-status');
            const validateUrlBtn = document.getElementById('validate-url-btn');
            const scrapeBtn = document.getElementById('scrape-btn');
            const scrapeProgress = document.getElementById('scrape-progress');
            const scrapeStatusText = document.getElementById('scrape-status-text');
            const cookieList = document.getElementById('cookie-list');

            // 加载 Cookie 状态
            async function loadCookieStatus() {
              try {
                const response = await fetch('/api/job/cookie');
                const result = await response.json();
                if (result.success) {
                  cookieList.innerHTML = result.cookies.map(c => {
                    const color = c.hasSet ? 'green' : 'gray';
                    const icon = c.hasSet ? 'fa-check-circle' : 'fa-circle';
                    return '<span class="text-xs px-2 py-1 bg-' + color + '-50 border border-' + color + '-200 rounded-full text-' + color + '-600">' +
                      '<i class="fas ' + icon + ' mr-1"></i>' + c.displayName +
                      '</span>';
                  }).join('');
                }
              } catch (error) {
                console.error('加载Cookie状态失败:', error);
              }
            }

            // URL 验证
            validateUrlBtn.addEventListener('click', async function() {
              const url = scrapeUrlInput.value.trim();
              if (!url) {
                showUrlStatus('请输入URL', 'error');
                return;
              }

              validateUrlBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-1"></i>验证中';
              
              try {
                const response = await fetch('/api/job/validate-url', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                const result = await response.json();
                
                if (result.valid && result.platform) {
                  let statusHtml = '<div class="flex items-center gap-2 text-green-600">' +
                    '<i class="fas fa-check-circle"></i>' +
                    '<span>已识别: ' + result.platform.displayName + '</span>';
                  if (result.platform.requiresCookie && !result.platform.hasCookie) {
                    statusHtml += '<span class="text-yellow-600 text-xs">（建议配置Cookie）</span>';
                  }
                  statusHtml += '</div>';
                  showUrlStatus(statusHtml, 'success');
                } else {
                  showUrlStatus(result.error || '不支持该URL', 'error');
                }
              } catch (error) {
                showUrlStatus('验证失败: ' + error.message, 'error');
              } finally {
                validateUrlBtn.innerHTML = '<i class="fas fa-check-circle mr-1"></i>验证';
              }
            });

            function showUrlStatus(html, type) {
              scrapeUrlStatus.classList.remove('hidden');
              if (type === 'error') {
                scrapeUrlStatus.innerHTML = '<div class="flex items-center gap-2 text-red-600">' +
                  '<i class="fas fa-times-circle"></i><span>' + html + '</span></div>';
              } else {
                scrapeUrlStatus.innerHTML = html;
              }
            }

            // 更新爬取步骤状态
            function updateScrapeStep(stepId, status) {
              const step = document.getElementById(stepId);
              if (!step) return;
              
              const icon = step.querySelector('i');
              const text = step.querySelector('span');
              
              if (status === 'running') {
                icon.className = 'fas fa-spinner loading-spinner text-blue-500';
                text.className = 'text-blue-600';
              } else if (status === 'completed') {
                icon.className = 'fas fa-check-circle text-green-500';
                text.className = 'text-green-600';
              } else if (status === 'error') {
                icon.className = 'fas fa-times-circle text-red-500';
                text.className = 'text-red-600';
              }
            }

            // 爬取按钮点击
            scrapeBtn.addEventListener('click', async function() {
              const url = scrapeUrlInput.value.trim();
              if (!url) {
                alert('请输入岗位详情页URL');
                return;
              }

              // 显示进度
              scrapeBtn.disabled = true;
              scrapeBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>爬取中...';
              scrapeProgress.classList.remove('hidden');
              errorArea.classList.add('hidden');

              // 重置步骤状态
              ['scrape-step-fetch', 'scrape-step-extract', 'scrape-step-parse'].forEach(id => {
                const step = document.getElementById(id);
                if (step) {
                  step.querySelector('i').className = 'fas fa-circle text-gray-300';
                  step.querySelector('span').className = 'text-gray-500';
                }
              });

              try {
                // 步骤1: 爬取页面
                scrapeStatusText.textContent = '正在爬取页面...';
                updateScrapeStep('scrape-step-fetch', 'running');

                const response = await fetch('/api/job/parse-url', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });

                const result = await response.json();

                if (result.success) {
                  // 更新步骤状态
                  updateScrapeStep('scrape-step-fetch', 'completed');
                  updateScrapeStep('scrape-step-extract', 'completed');
                  updateScrapeStep('scrape-step-parse', 'completed');
                  scrapeStatusText.textContent = '解析完成！';

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
                  throw new Error(result.error || '爬取失败');
                }
              } catch (error) {
                console.error('爬取失败:', error);
                updateScrapeStep('scrape-step-fetch', 'error');
                errorMessage.textContent = error.message || '爬取失败，请重试';
                errorArea.classList.remove('hidden');
                scrapeProgress.classList.add('hidden');
                scrapeBtn.disabled = false;
                scrapeBtn.innerHTML = '<i class="fas fa-spider mr-2"></i>开始爬取并解析';
              }
            });

            // URL输入框回车触发爬取
            scrapeUrlInput.addEventListener('keypress', function(e) {
              if (e.key === 'Enter') {
                scrapeBtn.click();
              }
            });
          });
        `
      }} />
    </div>,
    { title: '新建岗位解析 - Job Copilot' }
  )
})

// Cookie 设置页面
app.get('/job/cookie-settings', (c) => {
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <a href="/job/new" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="fas fa-arrow-left"></i>
          </a>
          <h1 class="text-xl font-bold">Cookie 设置</h1>
        </div>
      </header>
      
      <main class="max-w-4xl mx-auto px-4 py-8">
        {/* 说明 */}
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <h4 class="text-sm font-medium text-blue-700 mb-2">
            <i class="fas fa-info-circle mr-2"></i>为什么需要 Cookie？
          </h4>
          <p class="text-sm text-blue-600">
            部分招聘网站的岗位详情页需要登录才能查看完整内容。通过配置 Cookie，可以让爬虫以登录状态访问页面，获取完整的 JD 信息。
          </p>
        </div>

        {/* 获取 Cookie 教程 */}
        <div class="mb-8">
          <h3 class="text-lg font-semibold mb-4">
            <i class="fas fa-book mr-2 text-purple-500"></i>如何获取 Cookie
          </h3>
          <div class="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
            <div class="flex gap-3">
              <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>在浏览器中登录招聘网站（如 Boss直聘、拉勾、猎聘）</span>
            </div>
            <div class="flex gap-3">
              <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>按 F12 打开开发者工具，切换到 "Network"（网络）选项卡</span>
            </div>
            <div class="flex gap-3">
              <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>刷新页面，在请求列表中点击第一个文档请求</span>
            </div>
            <div class="flex gap-3">
              <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
              <span>在 "Headers"（标头）中找到 "Cookie" 字段，复制完整内容</span>
            </div>
          </div>
        </div>

        {/* 平台列表 */}
        <div id="platforms-list" class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">
            <i class="fas fa-cookie mr-2 text-orange-400"></i>平台 Cookie 配置
          </h3>
          {/* 动态渲染 */}
          <div class="text-center py-8 text-gray-400">
            <i class="fas fa-spinner loading-spinner text-2xl mb-2"></i>
            <p>加载中...</p>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', async function() {
            const platformsList = document.getElementById('platforms-list');
            
            try {
              // 获取平台列表
              const response = await fetch('/api/job/platforms');
              const result = await response.json();
              
              if (result.success) {
                platformsList.innerHTML = '<h3 class="text-lg font-semibold mb-4">' +
                  '<i class="fas fa-cookie mr-2 text-orange-400"></i>平台 Cookie 配置</h3>' +
                  result.platforms.map(p => {
                    const statusColor = p.hasCookie ? 'green' : 'gray';
                    const statusText = p.hasCookie ? '已配置' : '未配置';
                    return '<div class="bg-gray-50 rounded-xl p-4" data-platform="' + p.name + '">' +
                      '<div class="flex items-center justify-between mb-3">' +
                      '<div class="flex items-center gap-2">' +
                      '<span class="font-medium">' + p.displayName + '</span>' +
                      '<span class="text-xs px-2 py-0.5 bg-' + statusColor + '-100 text-' + statusColor + '-600 rounded-full">' + statusText + '</span>' +
                      '</div>' +
                      '<button class="delete-cookie-btn text-red-500 hover:text-red-600 text-sm ' + (p.hasCookie ? '' : 'hidden') + '" data-platform="' + p.name + '">' +
                      '<i class="fas fa-trash-alt mr-1"></i>删除</button>' +
                      '</div>' +
                      '<div class="space-y-2">' +
                      '<textarea class="cookie-input w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20 resize-none focus:border-blue-400 focus:outline-none" ' +
                      'placeholder="粘贴 ' + p.displayName + ' 的 Cookie..."></textarea>' +
                      '<button class="save-cookie-btn w-full px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50" data-platform="' + p.name + '">' +
                      '<i class="fas fa-save mr-1"></i>保存 Cookie</button>' +
                      '</div></div>';
                  }).join('');

                // 绑定保存事件
                document.querySelectorAll('.save-cookie-btn').forEach(btn => {
                  btn.addEventListener('click', async function() {
                    const platform = this.dataset.platform;
                    const container = this.closest('[data-platform]');
                    const textarea = container.querySelector('.cookie-input');
                    const cookie = textarea.value.trim();
                    
                    if (!cookie) {
                      alert('请输入 Cookie');
                      return;
                    }
                    
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner loading-spinner mr-1"></i>保存中...';
                    
                    try {
                      const response = await fetch('/api/job/cookie', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ platform, cookie }),
                      });
                      const result = await response.json();
                      
                      if (result.success) {
                        // 更新状态
                        const statusSpan = container.querySelector('.text-xs');
                        statusSpan.className = 'text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full';
                        statusSpan.textContent = '已配置';
                        container.querySelector('.delete-cookie-btn').classList.remove('hidden');
                        textarea.value = '';
                        
                        if (window.JobCopilot && window.JobCopilot.showToast) {
                          window.JobCopilot.showToast('Cookie 保存成功', 'success');
                        } else {
                          alert('Cookie 保存成功');
                        }
                      } else {
                        throw new Error(result.error);
                      }
                    } catch (error) {
                      alert('保存失败: ' + error.message);
                    } finally {
                      this.disabled = false;
                      this.innerHTML = '<i class="fas fa-save mr-1"></i>保存 Cookie';
                    }
                  });
                });

                // 绑定删除事件
                document.querySelectorAll('.delete-cookie-btn').forEach(btn => {
                  btn.addEventListener('click', async function() {
                    const platform = this.dataset.platform;
                    if (!confirm('确定要删除该平台的 Cookie 吗？')) {
                      return;
                    }
                    
                    try {
                      const response = await fetch('/api/job/cookie/' + platform, {
                        method: 'DELETE',
                      });
                      const result = await response.json();
                      
                      if (result.success) {
                        const container = this.closest('[data-platform]');
                        const statusSpan = container.querySelector('.text-xs');
                        statusSpan.className = 'text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full';
                        statusSpan.textContent = '未配置';
                        this.classList.add('hidden');
                        
                        if (window.JobCopilot && window.JobCopilot.showToast) {
                          window.JobCopilot.showToast('Cookie 已删除', 'success');
                        }
                      }
                    } catch (error) {
                      alert('删除失败: ' + error.message);
                    }
                  });
                });
              }
            } catch (error) {
              platformsList.innerHTML = '<div class="text-center py-8 text-red-500">' +
                '<i class="fas fa-exclamation-circle text-2xl mb-2"></i>' +
                '<p>加载失败: ' + error.message + '</p></div>';
            }
          });
        `
      }} />
    </div>,
    { title: 'Cookie 设置 - Job Copilot' }
  )
})

// 岗位详情页
app.get('/job/:id', (c) => {
  const jobId = c.req.param('id');
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <div class="flex items-center gap-4">
              <a href="/jobs" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-arrow-left"></i>
              </a>
              <h1 id="page-title" class="text-lg font-bold truncate max-w-md">岗位详情</h1>
            </div>
            <div class="flex items-center gap-2">
              <button id="action-apply" class="px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800">
                <i class="fas fa-paper-plane mr-1"></i><span class="hidden sm:inline">投递</span>
              </button>
              <a id="action-match" href="#" class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <i class="fas fa-chart-pie mr-1"></i><span class="hidden sm:inline">匹配</span>
              </a>
              <button id="action-targeted-resume" class="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                <i class="fas fa-file-export mr-1"></i><span class="hidden sm:inline">定向简历</span>
              </button>
              <a id="action-interview" href="#" class="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                <i class="fas fa-comments mr-1"></i><span class="hidden sm:inline">面试</span>
              </a>
              <a id="action-optimize" href="#" class="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600">
                <i class="fas fa-magic mr-1"></i><span class="hidden sm:inline">优化</span>
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-6">
        {/* 加载状态 */}
        <div id="loading" class="text-center py-12">
          <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">加载中...</p>
        </div>

        {/* ==================== PC端三栏布局 ==================== */}
        <div id="job-content-desktop" class="hidden lg:grid lg:grid-cols-12 gap-6">
          
          {/* 左栏 - JD原图/原文本 + 链接 (占3列, ~25%) */}
          <aside class="lg:col-span-3">
            <div class="sticky top-20 space-y-4">
              {/* 原图/原文本区域 */}
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 class="font-semibold text-sm text-gray-700">
                    <i class="fas fa-file-alt mr-2 text-gray-400"></i>
                    <span id="left-panel-title">岗位JD原图</span>
                  </h3>
                </div>
                <div id="left-panel-content" class="p-4">
                  {/* 图片或文本将通过JS渲染 */}
                  <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-image text-3xl mb-2"></i>
                    <p class="text-sm">加载中...</p>
                  </div>
                </div>
              </div>
              
              {/* 岗位链接区域 */}
              <div id="left-url-section" class="bg-white rounded-xl border border-gray-200 p-4 hidden">
                <h4 class="text-sm font-medium text-gray-700 mb-3">
                  <i class="fas fa-link mr-2 text-blue-500"></i>原帖链接
                </h4>
                <a id="left-url-link" href="#" target="_blank" rel="noopener noreferrer" 
                   class="block text-sm text-blue-500 hover:text-blue-600 hover:underline break-all mb-2">
                </a>
                <button id="left-url-open" class="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                  <i class="fas fa-external-link-alt mr-1"></i>查看原帖
                </button>
              </div>
              
              {/* 添加/编辑链接 */}
              <div id="left-add-url" class="bg-white rounded-xl border border-gray-200 p-4 hidden">
                <button id="left-add-url-btn" class="w-full px-3 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-500 transition-colors">
                  <i class="fas fa-plus mr-1"></i>添加岗位链接
                </button>
              </div>
              
              {/* 编辑链接表单 */}
              <div id="left-url-edit-form" class="bg-white rounded-xl border border-gray-200 p-4 hidden">
                <h4 class="text-sm font-medium text-gray-700 mb-3">编辑岗位链接</h4>
                <input type="url" id="left-url-input" 
                       class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none mb-2"
                       placeholder="https://www.zhipin.com/job/xxx" />
                <p id="left-url-hint" class="text-xs text-gray-400 mb-3"></p>
                <div class="flex gap-2">
                  <button id="left-url-save" class="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    保存
                  </button>
                  <button id="left-url-cancel" class="flex-1 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                    取消
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* 中间栏 - 结构化分析结果 (占5列, ~42%) */}
          <main class="lg:col-span-5">
            {/* 基本信息卡片 */}
            <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 id="job-title-desktop" class="text-xl font-bold text-gray-900 mb-2">岗位名称</h2>
              <p id="job-company-desktop" class="text-gray-600 mb-3">
                <i class="fas fa-building mr-2 text-gray-400"></i>
                <span>公司名称</span>
              </p>
              <div class="flex flex-wrap gap-3 text-sm">
                <span id="job-location-desktop" class="px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                  <i class="fas fa-map-marker-alt mr-1"></i>地点
                </span>
                <span id="job-salary-desktop" class="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  <i class="fas fa-yen-sign mr-1"></i>薪资
                </span>
              </div>
            </div>

            {/* A维度分析 */}
            <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center">
                <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">A</span>
                岗位速览
              </h3>
              <div id="a-analysis-desktop" class="grid grid-cols-2 gap-3">
                {/* A维度内容将通过JS动态渲染 */}
              </div>
            </div>

            {/* B维度分析 */}
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center">
                <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">B</span>
                岗位深度拆解
              </h3>
              <div id="b-analysis-desktop" class="space-y-3">
                {/* B维度内容将通过JS动态渲染 */}
              </div>
            </div>
          </main>

          {/* 右栏 - 解析出来的文字 (占4列, ~33%) */}
          <aside class="lg:col-span-4">
            <div class="sticky top-20">
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="font-semibold text-sm text-gray-700">
                    <i class="fas fa-file-lines mr-2 text-gray-400"></i>
                    解析出来的文字
                  </h3>
                  <button id="copy-text-btn" class="text-xs text-gray-500 hover:text-blue-500 px-2 py-1 rounded hover:bg-gray-100">
                    <i class="fas fa-copy mr-1"></i>复制
                  </button>
                </div>
                <div id="right-panel-content" class="p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                  <pre id="parsed-text" class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed"></pre>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ==================== 移动端单栏布局 ==================== */}
        <div id="job-content-mobile" class="hidden lg:hidden space-y-6">
          {/* 基本信息 */}
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h2 id="job-title-mobile" class="text-xl font-bold mb-2">岗位名称</h2>
            <p id="job-company-mobile" class="text-gray-600 mb-3">
              <i class="fas fa-building mr-2"></i>
              <span>公司名称</span>
            </p>
            <div class="flex flex-wrap gap-2 text-sm mb-4">
              <span id="job-location-mobile" class="px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                <i class="fas fa-map-marker-alt mr-1"></i>地点
              </span>
              <span id="job-salary-mobile" class="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                <i class="fas fa-yen-sign mr-1"></i>薪资
              </span>
            </div>
            {/* 岗位链接 */}
            <div id="mobile-url-section" class="hidden border-t border-gray-100 pt-3 mt-3">
              <a id="mobile-url-link" href="#" target="_blank" rel="noopener noreferrer" 
                 class="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1">
                <i class="fas fa-external-link-alt"></i>
                <span>查看原帖</span>
              </a>
            </div>
          </div>

          {/* A维度分析 */}
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <span class="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">A</span>
              岗位速览
            </h3>
            <div id="a-analysis-mobile" class="grid grid-cols-1 gap-3">
            </div>
          </div>

          {/* B维度分析 */}
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-lg font-semibold mb-4 flex items-center">
              <span class="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">B</span>
              岗位深度拆解
            </h3>
            <div id="b-analysis-mobile" class="space-y-3">
            </div>
          </div>

          {/* 原始JD（折叠） */}
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button id="toggle-raw-mobile" class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50">
              <span class="font-semibold text-gray-700">
                <i class="fas fa-file-lines mr-2 text-gray-400"></i>
                查看原始JD
              </span>
              <i class="fas fa-chevron-down text-gray-400 toggle-icon-mobile"></i>
            </button>
            <div id="raw-jd-mobile" class="hidden px-5 pb-5 border-t border-gray-100">
              <pre class="whitespace-pre-wrap text-sm text-gray-600 mt-4"></pre>
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
            const contentDesktop = document.getElementById('job-content-desktop');
            const contentMobile = document.getElementById('job-content-mobile');
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

            // 设置操作按钮链接
            document.getElementById('action-match').href = '/job/' + jobId + '/match';
            document.getElementById('action-interview').href = '/job/' + jobId + '/interview';
            document.getElementById('action-optimize').href = '/job/' + jobId + '/optimize';
            
            // 投递按钮事件
            document.getElementById('action-apply').addEventListener('click', function() {
              var applications = JSON.parse(localStorage.getItem('jobcopilot_applications') || '[]');
              
              // 检查是否已投递
              var existing = applications.find(function(app) { return app.job_id === jobId; });
              if (existing) {
                if (confirm('该岗位已有投递记录，是否查看详情？')) {
                  window.location.href = '/applications/' + existing.id;
                }
                return;
              }
              
              // 创建投递记录
              var source = prompt('请输入投递渠道（如：Boss直聘、猎聘、内推等）：', 'Boss直聘');
              if (source === null) return;
              
              var newApp = {
                id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                job_id: jobId,
                company: job.company || job.structured_jd?.company || '未知公司',
                position: job.title || job.structured_jd?.title || '未知职位',
                job_url: job.job_url,
                status: 'applied',
                status_history: [{ status: 'applied', changed_at: new Date().toISOString() }],
                interviews: [],
                applied_at: new Date().toISOString(),
                salary_range: job.structured_jd?.salary,
                source: source || undefined,
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              applications.unshift(newApp);
              localStorage.setItem('jobcopilot_applications', JSON.stringify(applications));
              
              alert('已添加投递记录！');
              
              // 更新按钮状态
              this.innerHTML = '<i class="fas fa-check mr-1"></i><span class="hidden sm:inline">已投递</span>';
              this.classList.remove('bg-black', 'hover:bg-gray-800');
              this.classList.add('bg-green-500', 'hover:bg-green-600');
            });
            
            // 检查投递状态
            var applications = JSON.parse(localStorage.getItem('jobcopilot_applications') || '[]');
            var existingApp = applications.find(function(app) { return app.job_id === jobId; });
            if (existingApp) {
              var applyBtn = document.getElementById('action-apply');
              applyBtn.innerHTML = '<i class="fas fa-check mr-1"></i><span class="hidden sm:inline">已投递</span>';
              applyBtn.classList.remove('bg-black', 'hover:bg-gray-800');
              applyBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            }
            
            // 定向简历按钮事件
            document.getElementById('action-targeted-resume').addEventListener('click', async function() {
              // 检查简历
              var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              if (resumes.length === 0) {
                alert('请先上传简历！');
                window.location.href = '/resume';
                return;
              }
              
              // 检查岗位分析
              if (!job.a_analysis || !job.b_analysis) {
                alert('岗位分析未完成，请等待解析完成后再生成定向简历');
                return;
              }
              
              if (!confirm('是否为「' + job.title + '」岗位生成定向简历？\\n\\n将基于您的简历和岗位分析结果，生成针对性优化的简历版本。')) {
                return;
              }
              
              var btn = this;
              btn.disabled = true;
              btn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-1"></i>生成中...';
              
              try {
                var response = await fetch('/api/job/' + jobId + '/generate-resume', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ resumeId: resumes[0].id }),
                });
                
                var result = await response.json();
                
                if (result.success) {
                  // 保存新简历到 localStorage
                  resumes.unshift(result.resume);
                  localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));
                  
                  alert('定向简历生成成功！\\n\\n' + 
                    '版本标签: ' + result.resume.version_tag + '\\n' +
                    '预估提升: ' + result.match_improvement + '\\n\\n' +
                    '即将跳转到简历详情页...');
                  
                  window.location.href = '/resume/' + result.resume.id;
                } else {
                  throw new Error(result.error || '生成失败');
                }
              } catch (err) {
                console.error('定向简历生成失败:', err);
                alert('生成失败: ' + err.message);
              } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-file-export mr-1"></i><span class="hidden sm:inline">定向简历</span>';
              }
            });

            // 渲染页面标题
            document.getElementById('page-title').textContent = job.title + ' @ ' + job.company;

            // ==================== 渲染基本信息 ====================
            // Desktop
            document.getElementById('job-title-desktop').textContent = job.title;
            document.getElementById('job-company-desktop').querySelector('span').textContent = job.company;
            document.getElementById('job-location-desktop').innerHTML = '<i class="fas fa-map-marker-alt mr-1"></i>' + (job.structured_jd?.location || '未知');
            document.getElementById('job-salary-desktop').innerHTML = '<i class="fas fa-yen-sign mr-1"></i>' + (job.structured_jd?.salary || '面议');
            
            // Mobile
            document.getElementById('job-title-mobile').textContent = job.title;
            document.getElementById('job-company-mobile').querySelector('span').textContent = job.company;
            document.getElementById('job-location-mobile').innerHTML = '<i class="fas fa-map-marker-alt mr-1"></i>' + (job.structured_jd?.location || '未知');
            document.getElementById('job-salary-mobile').innerHTML = '<i class="fas fa-yen-sign mr-1"></i>' + (job.structured_jd?.salary || '面议');

            // ==================== 左栏 - 原图/原文本 ====================
            const leftPanelTitle = document.getElementById('left-panel-title');
            const leftPanelContent = document.getElementById('left-panel-content');
            
            if (job.source_type === 'image' && job.image_url) {
              leftPanelTitle.textContent = '岗位JD原图';
              leftPanelContent.innerHTML = '<img src="' + job.image_url + '" class="w-full rounded-lg cursor-pointer hover:opacity-90" onclick="window.open(this.src)" title="点击查看大图" />';
            } else {
              leftPanelTitle.textContent = '原始JD文本';
              const rawText = job.raw_content || '无原始内容';
              leftPanelContent.innerHTML = '<div class="max-h-80 overflow-y-auto"><pre class="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">' + escapeHtml(rawText) + '</pre></div>';
            }

            // ==================== 左栏 - 岗位链接 ====================
            const leftUrlSection = document.getElementById('left-url-section');
            const leftAddUrl = document.getElementById('left-add-url');
            const leftUrlEditForm = document.getElementById('left-url-edit-form');
            const leftUrlLink = document.getElementById('left-url-link');
            const leftUrlInput = document.getElementById('left-url-input');
            const leftUrlHint = document.getElementById('left-url-hint');
            const mobileUrlSection = document.getElementById('mobile-url-section');
            const mobileUrlLink = document.getElementById('mobile-url-link');
            
            function renderUrlSection() {
              if (job.job_url) {
                leftUrlLink.textContent = job.job_url;
                leftUrlLink.href = job.job_url;
                leftUrlSection.classList.remove('hidden');
                leftAddUrl.classList.add('hidden');
                // Mobile
                mobileUrlSection.classList.remove('hidden');
                mobileUrlLink.href = job.job_url;
              } else {
                leftUrlSection.classList.add('hidden');
                leftAddUrl.classList.remove('hidden');
                mobileUrlSection.classList.add('hidden');
              }
              leftUrlEditForm.classList.add('hidden');
            }
            renderUrlSection();
            
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
            
            // 添加链接
            document.getElementById('left-add-url-btn').addEventListener('click', function() {
              leftUrlInput.value = '';
              leftAddUrl.classList.add('hidden');
              leftUrlEditForm.classList.remove('hidden');
              leftUrlInput.focus();
            });
            
            // 点击链接区域编辑
            leftUrlSection.addEventListener('click', function(e) {
              if (e.target.id !== 'left-url-open' && !e.target.closest('#left-url-open')) {
                leftUrlInput.value = job.job_url || '';
                leftUrlSection.classList.add('hidden');
                leftUrlEditForm.classList.remove('hidden');
                leftUrlInput.focus();
              }
            });
            
            // 查看原帖按钮
            document.getElementById('left-url-open').addEventListener('click', function(e) {
              e.stopPropagation();
              if (confirm('即将跳转到外部网站查看「' + job.title + '」原帖\\n\\n' + job.job_url + '\\n\\n是否继续？')) {
                window.open(job.job_url, '_blank', 'noopener,noreferrer');
              }
            });
            
            // Mobile 链接点击
            mobileUrlLink.addEventListener('click', function(e) {
              e.preventDefault();
              if (confirm('即将跳转到外部网站查看「' + job.title + '」原帖\\n\\n' + job.job_url + '\\n\\n是否继续？')) {
                window.open(job.job_url, '_blank', 'noopener,noreferrer');
              }
            });
            
            // URL 输入校验
            leftUrlInput.addEventListener('input', function() {
              const result = validateUrl(leftUrlInput.value);
              leftUrlHint.textContent = result.valid ? '' : result.warning;
              leftUrlHint.className = result.valid ? 'text-xs text-gray-400 mb-3' : 'text-xs text-red-500 mb-3';
            });
            
            // 保存链接
            document.getElementById('left-url-save').addEventListener('click', function() {
              const newUrl = leftUrlInput.value.trim();
              const validation = validateUrl(newUrl);
              if (!validation.valid) {
                leftUrlHint.textContent = validation.warning;
                leftUrlHint.className = 'text-xs text-red-500 mb-3';
                return;
              }
              
              job.job_url = newUrl || undefined;
              job.updated_at = new Date().toISOString();
              
              const jobIndex = jobs.findIndex(j => j.id === jobId);
              if (jobIndex !== -1) {
                jobs[jobIndex] = job;
                localStorage.setItem('jobcopilot_jobs', JSON.stringify(jobs));
              }
              
              if (window.JobCopilot && window.JobCopilot.showToast) {
                window.JobCopilot.showToast(newUrl ? '链接已保存' : '链接已删除', 'success');
              }
              
              renderUrlSection();
            });
            
            // 取消编辑
            document.getElementById('left-url-cancel').addEventListener('click', function() {
              renderUrlSection();
            });

            // ==================== 右栏 - 解析文字 + 关键词高亮 ====================
            const parsedText = document.getElementById('parsed-text');
            const rawContent = job.raw_content || '无原始内容';
            
            // 关键词列表（从 A/B 维度提取）
            const keywords = [];
            
            // 辅助函数：从数组或字符串中提取关键词
            function extractKeywords(val) {
              if (!val) return [];
              if (Array.isArray(val)) return val;
              if (typeof val === 'string') return val.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
              return [];
            }
            
            if (job.a_analysis?.A1_tech_stack?.keywords) {
              keywords.push(...extractKeywords(job.a_analysis.A1_tech_stack.keywords));
            }
            if (job.b_analysis?.B2_tech_requirement?.tech_depth) {
              const depth = job.b_analysis.B2_tech_requirement.tech_depth;
              keywords.push(...extractKeywords(depth['了解']));
              keywords.push(...extractKeywords(depth['熟悉']));
              keywords.push(...extractKeywords(depth['精通']));
            }
            
            // 高亮关键词（简化版，避免正则转义问题）
            function highlightKeywords(text, words) {
              if (!words || words.length === 0) return escapeHtml(text);
              
              let result = escapeHtml(text);
              const uniqueWords = [...new Set(words)].filter(w => w && w.length > 1);
              
              uniqueWords.forEach(function(word) {
                // 简单的字符串替换，大小写不敏感
                var lowerResult = result.toLowerCase();
                var lowerWord = word.toLowerCase();
                var startIndex = 0;
                var index;
                var newResult = '';
                
                while ((index = lowerResult.indexOf(lowerWord, startIndex)) !== -1) {
                  newResult += result.substring(startIndex, index);
                  newResult += '<mark class="bg-yellow-200 px-0.5 rounded">' + result.substring(index, index + word.length) + '</mark>';
                  startIndex = index + word.length;
                }
                newResult += result.substring(startIndex);
                result = newResult || result;
              });
              
              return result;
            }
            
            parsedText.innerHTML = highlightKeywords(rawContent, keywords);
            
            // 复制按钮
            document.getElementById('copy-text-btn').addEventListener('click', function() {
              navigator.clipboard.writeText(rawContent).then(function() {
                if (window.JobCopilot && window.JobCopilot.showToast) {
                  window.JobCopilot.showToast('已复制到剪贴板', 'success');
                }
              }).catch(function() {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = rawContent;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                if (window.JobCopilot && window.JobCopilot.showToast) {
                  window.JobCopilot.showToast('已复制到剪贴板', 'success');
                }
              });
            });

            // ==================== 渲染 A/B 维度 ====================
            renderAAnalysis(job.a_analysis, 'a-analysis-desktop');
            renderAAnalysis(job.a_analysis, 'a-analysis-mobile');
            renderBAnalysis(job.b_analysis, 'b-analysis-desktop');
            renderBAnalysis(job.b_analysis, 'b-analysis-mobile');
            
            // Mobile 原始JD折叠
            const rawJdMobile = document.getElementById('raw-jd-mobile');
            rawJdMobile.querySelector('pre').textContent = rawContent;
            document.getElementById('toggle-raw-mobile').addEventListener('click', function() {
              rawJdMobile.classList.toggle('hidden');
              const icon = this.querySelector('.toggle-icon-mobile');
              icon.classList.toggle('fa-chevron-down');
              icon.classList.toggle('fa-chevron-up');
            });

            // 显示内容
            loading.classList.add('hidden');
            contentDesktop.classList.remove('hidden');
            contentMobile.classList.remove('hidden');
            
            // HTML 转义
            function escapeHtml(text) {
              const div = document.createElement('div');
              div.textContent = text;
              return div.innerHTML;
            }

            // ==================== 数据处理工具函数 ====================
            /**
             * 安全地将值转换为字符串数组
             * 兼容数组和逗号分隔的字符串
             */
            function safeToArray(val) {
              if (!val) return [];
              if (Array.isArray(val)) return val;
              if (typeof val === 'string') return val.split(/[,，、]/).map(function(s) { return s.trim(); }).filter(Boolean);
              return [];
            }

            /**
             * 安全地将数组/字符串转换为显示文本
             */
            function safeJoin(val, separator) {
              separator = separator || ', ';
              var arr = safeToArray(val);
              return arr.length > 0 ? arr.join(separator) : null;
            }

            /**
             * 标准化能力列表（兼容字符串数组和对象数组）
             */
            function normalizeCapabilities(caps) {
              if (!caps || !Array.isArray(caps)) return [];
              return caps.map(function(cap) {
                if (typeof cap === 'string') {
                  return { name: cap, detail: '' };
                }
                if (typeof cap === 'object' && cap !== null) {
                  return { name: cap.name || '', detail: cap.detail || '' };
                }
                return null;
              }).filter(function(cap) { return cap && cap.name; });
            }

            // 渲染A维度分析
            function renderAAnalysis(a, containerId) {
              if (!a) return;
              
              const container = document.getElementById(containerId);
              if (!container) return;
              
              // 使用 safeJoin 处理 keywords
              var keywordsText = safeJoin(a.A1_tech_stack?.keywords) || '无';
              
              container.innerHTML = [
                renderACard('A1', '技术栈', keywordsText, a.A1_tech_stack?.summary, getDensityColor(a.A1_tech_stack?.density)),
                renderACard('A2', '产品类型', a.A2_product_type?.type || '未知', a.A2_product_type?.reason, 'blue'),
                renderACard('A3', '业务领域', a.A3_business_domain?.primary || '未知', a.A3_business_domain?.summary, 'green'),
                renderACard('A4', '团队阶段', a.A4_team_stage?.stage || '未知', a.A4_team_stage?.summary, 'purple'),
              ].join('');
            }

            function renderACard(code, title, value, summary, color) {
              return '<div class="bg-gray-50 rounded-lg p-3">' +
                '<div class="flex items-center gap-2 mb-1">' +
                '<span class="text-xs font-bold text-' + color + '-600 bg-' + color + '-100 px-1.5 py-0.5 rounded">' + code + '</span>' +
                '<span class="text-sm font-medium">' + title + '</span>' +
                '</div>' +
                '<p class="text-sm text-gray-900 mb-1">' + value + '</p>' +
                (summary ? '<p class="text-xs text-gray-500"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + summary + '</p>' : '') +
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
            function renderBAnalysis(b, containerId) {
              if (!b) return;
              
              const container = document.getElementById(containerId);
              if (!container) return;
              
              container.innerHTML = [
                renderBSection('B1', '行业背景要求', renderB1Content(b.B1_industry_requirement)),
                renderBSection('B2', '技术背景要求', renderB2Content(b.B2_tech_requirement)),
                renderBSection('B3', '产品经验要求', renderB3Content(b.B3_product_experience)),
                renderBSection('B4', '产品能力要求', renderB4Content(b.B4_capability_requirement)),
              ].join('');

              // 绑定折叠事件
              container.querySelectorAll('.b-section-header').forEach(header => {
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
              return '<div class="border border-gray-200 rounded-lg overflow-hidden">' +
                '<div class="b-section-header flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100">' +
                '<div class="flex items-center gap-2">' +
                '<span class="text-xs font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">' + code + '</span>' +
                '<span class="text-sm font-medium">' + title + '</span>' +
                '</div>' +
                '<i class="fas fa-chevron-down toggle-icon text-gray-400 text-sm"></i>' +
                '</div>' +
                '<div class="p-3 border-t border-gray-200">' + content + '</div>' +
                '</div>';
            }

            function renderB1Content(b1) {
              if (!b1) return '<p class="text-gray-500 text-sm">无数据</p>';
              return '<div class="space-y-1.5 text-sm">' +
                '<p><span class="text-gray-500">是否必需：</span>' + (b1.required ? '<span class="text-red-500">是</span>' : '<span class="text-green-500">否</span>') + '</p>' +
                '<p><span class="text-gray-500">是否优先：</span>' + (b1.preferred ? '<span class="text-yellow-600">是</span>' : '否') + '</p>' +
                '<p><span class="text-gray-500">年限要求：</span>' + (b1.years || '不限') + '</p>' +
                '<p><span class="text-gray-500">具体行业：</span>' + (b1.specific_industry || '不限') + '</p>' +
                (b1.summary ? '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2 text-xs"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b1.summary + '</p>' : '') +
                '</div>';
            }

            function renderB2Content(b2) {
              if (!b2) return '<p class="text-gray-500 text-sm">无数据</p>';
              const depth = b2.tech_depth || {};
              
              // 兼容数组和字符串两种格式
              function formatTechList(val) {
                if (!val) return null;
                if (Array.isArray(val)) return val.length ? val.join(', ') : null;
                if (typeof val === 'string') return val.trim() || null;
                return null;
              }
              
              const liaoJie = formatTechList(depth['了解']);
              const shuXi = formatTechList(depth['熟悉']);
              const jingTong = formatTechList(depth['精通']);
              
              return '<div class="space-y-1.5 text-sm">' +
                '<p><span class="text-gray-500">学历要求：</span>' + (b2.education || '不限') + '</p>' +
                (liaoJie ? '<p><span class="text-gray-500">了解：</span><span class="text-blue-600">' + liaoJie + '</span></p>' : '') +
                (shuXi ? '<p><span class="text-gray-500">熟悉：</span><span class="text-yellow-600">' + shuXi + '</span></p>' : '') +
                (jingTong ? '<p><span class="text-gray-500">精通：</span><span class="text-red-600">' + jingTong + '</span></p>' : '') +
                (b2.summary ? '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2 text-xs"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b2.summary + '</p>' : '') +
                '</div>';
            }

            function renderB3Content(b3) {
              if (!b3) return '<p class="text-gray-500 text-sm">无数据</p>';
              // 使用 safeJoin 兼容数组和字符串格式
              var productTypesText = safeJoin(b3.product_types) || '不限';
              return '<div class="space-y-1.5 text-sm">' +
                '<p><span class="text-gray-500">产品类型：</span>' + productTypesText + '</p>' +
                '<p><span class="text-gray-500">全周期经验：</span>' + (b3.need_full_cycle ? '<span class="text-red-500">需要</span>' : '不要求') + '</p>' +
                '<p><span class="text-gray-500">0-1经验：</span>' + (b3.need_0to1 ? '<span class="text-red-500">需要</span>' : '不要求') + '</p>' +
                (b3.summary ? '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2 text-xs"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b3.summary + '</p>' : '') +
                '</div>';
            }

            function renderB4Content(b4) {
              if (!b4) return '<p class="text-gray-500 text-sm">无数据</p>';
              
              // 使用 normalizeCapabilities 标准化能力列表
              var caps = normalizeCapabilities(b4.capabilities);
              
              if (caps.length === 0) {
                return '<p class="text-gray-500 text-sm">无数据</p>';
              }
              
              // 渲染能力列表（统一使用对象格式）
              var renderCaps = caps.map(function(cap) {
                if (cap.detail) {
                  return '<div class="flex gap-1 mb-1"><span class="text-gray-900 font-medium whitespace-nowrap">' + cap.name + '：</span><span class="text-gray-600">' + cap.detail + '</span></div>';
                } else {
                  // 如果没有详情，显示为标签样式
                  return '<div class="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">' + cap.name + '</div>';
                }
              }).join('');
              
              return '<div class="space-y-1.5 text-sm">' +
                '<div class="flex flex-wrap">' + renderCaps + '</div>' +
                (b4.summary ? '<p class="text-gray-600 bg-gray-50 p-2 rounded mt-2 text-xs"><i class="fas fa-lightbulb mr-1 text-yellow-500"></i>' + b4.summary + '</p>' : '') +
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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
              <a href="/questions" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-question-circle mr-1.5"></i><span class="hidden sm:inline">题库</span>
              </a>
              <a href="/applications" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-paper-plane mr-1.5"></i><span class="hidden sm:inline">投递</span>
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

        {/* Phase 2.1: 实时进度条 */}
        <div id="parse-progress" class="hidden mb-8">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <i class="fas fa-spinner loading-spinner text-white text-lg"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">正在解析简历...</h3>
                <p id="progress-message" class="text-sm text-gray-500 mt-0.5">准备中...</p>
              </div>
            </div>
            
            {/* 进度条 */}
            <div class="mb-4">
              <div class="flex items-center justify-between text-sm mb-2">
                <span id="progress-stage" class="text-gray-600 font-medium">准备中</span>
                <span id="progress-percent" class="text-blue-600 font-semibold">0%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div id="progress-bar" class="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
              </div>
              <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>
                  <i class="far fa-clock mr-1"></i>
                  已用时: <span id="elapsed-time">0</span>秒
                </span>
                <span id="remaining-time-container" class="hidden">
                  预计剩余: <span id="remaining-time">--</span>秒
                </span>
              </div>
            </div>
            
            {/* 阶段指示器 */}
            <div class="flex items-center justify-between text-xs">
              <div id="stage-uploaded" class="flex flex-col items-center gap-1 opacity-30">
                <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <i class="fas fa-upload text-white text-xs"></i>
                </div>
                <span class="text-gray-500">上传</span>
              </div>
              <div class="flex-1 h-px bg-gray-300 mx-2"></div>
              <div id="stage-parsing" class="flex flex-col items-center gap-1 opacity-30">
                <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <i class="fas fa-cog text-white text-xs"></i>
                </div>
                <span class="text-gray-500">解析</span>
              </div>
              <div class="flex-1 h-px bg-gray-300 mx-2"></div>
              <div id="stage-structuring" class="flex flex-col items-center gap-1 opacity-30">
                <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <i class="fas fa-puzzle-piece text-white text-xs"></i>
                </div>
                <span class="text-gray-500">结构化</span>
              </div>
              <div class="flex-1 h-px bg-gray-300 mx-2"></div>
              <div id="stage-completed" class="flex flex-col items-center gap-1 opacity-30">
                <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <i class="fas fa-check text-white text-xs"></i>
                </div>
                <span class="text-gray-500">完成</span>
              </div>
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
              {/* Phase 2.3: PDF 类型提示 */}
              <div id="pdf-type-info" class="hidden mt-3 px-3 py-2 rounded-lg text-sm">
                <div class="flex items-center gap-2">
                  <i id="pdf-type-icon" class="fas"></i>
                  <div>
                    <p id="pdf-type-label" class="font-medium"></p>
                    <p id="pdf-type-time" class="text-xs opacity-75"></p>
                  </div>
                </div>
              </div>
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
            let isParsing = false; // 防止重复提交
            
            // Phase 2.2: 请求桌面通知权限
            requestNotificationPermission();

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

            // 查看详情 - 跳转到详情页
            if (viewDetailBtn) {
              viewDetailBtn.addEventListener('click', function() {
                const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                if (resumes.length > 0) {
                  window.location.href = '/resume/' + resumes[0].id;
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

            async function handleFileSelect(file) {
              selectedFile = file;
              fileName.textContent = file.name;
              uploadPlaceholder.classList.add('hidden');
              filePreview.classList.remove('hidden');
              textInput.value = '';
              
              // Phase 2.3: 检测 PDF 类型
              if (file.type === 'application/pdf') {
                await detectPDFType(file);
              }
            }

            // 移除文件
            removeFileBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              selectedFile = null;
              fileInput.value = '';
              uploadPlaceholder.classList.remove('hidden');
              filePreview.classList.add('hidden');
            });

            // Phase 2.1: 解析按钮点击 - 异步上传 + 实时进度
            parseBtn.addEventListener('click', async function() {
              const text = textInput.value.trim();
              
              if (!text && !selectedFile) {
                alert('请上传简历文件或粘贴简历文本');
                return;
              }
              
              // 防止重复提交
              if (isParsing) {
                console.log('[前端] 正在解析中，跳过重复请求');
                return;
              }
              isParsing = true;

              parseBtn.disabled = true;
              parseBtn.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>上传中...';
              progressArea.classList.remove('hidden');
              errorArea.classList.add('hidden');
              
              // 平滑滚动到进度区域
              setTimeout(() => {
                progressArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);

              try {
                let resumeId;
                
                if (selectedFile) {
                  // Phase 2.1: 文件异步上传流程
                  // 步骤1: 上传文件，立即获取 resumeId
                  const formData = new FormData();
                  formData.append('file', selectedFile);
                  
                  const uploadRes = await fetch('/api/resume/mineru/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const uploadData = await uploadRes.json();
                  
                  if (!uploadData.success) {
                    throw new Error(uploadData.error || '文件上传失败');
                  }
                  
                  resumeId = uploadData.resumeId;
                  console.log('[Phase 2.1] 上传成功，resumeId:', resumeId);
                  
                  // 步骤2: 立即开始轮询进度
                  startProgressPolling(resumeId);
                  
                  // 步骤3: 后台开始解析
                  fetch('/api/resume/mineru/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      batchId: uploadData.batchId,
                      fileName: uploadData.fileName,
                      resumeId: resumeId,  // Phase 2.1: 传递 resumeId
                    }),
                  }).then(res => res.json()).then(data => {
                    console.log('[Phase 2.1] 解析完成:', data);
                  }).catch(err => {
                    console.error('[Phase 2.1] 后台解析失败:', err);
                  });
                  
                } else {
                  // 文本模式：同步处理
                  updateProgress(0, 'processing', '正在处理文本...');
                  
                  const response = await fetch('/api/resume/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'text',
                      content: text,
                    }),
                  });
                  const result = await response.json();
                  
                  if (result.success) {
                    updateProgress(100, 'completed', '解析完成！');
                    
                    // Phase 2.2: 发送桌面通知
                    const resumeName = result.resume.basic_info?.name || '简历';
                    sendDesktopNotification('🎉 简历解析完成！', {
                      body: \`"\${resumeName}" 已成功解析，点击查看详情\`,
                      icon: '/favicon.ico',
                    });
                    
                    await new Promise(r => setTimeout(r, 1000));
                    
                    // 保存到 localStorage
                    const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                    resumes.unshift(result.resume);
                    localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));
                    
                    progressArea.classList.add('hidden');
                    showCurrentResume(result.resume);
                    uploadSection.classList.add('hidden');
                    resetForm();
                  } else {
                    throw new Error(result.error || '解析失败');
                  }
                }
                
              } catch (error) {
                console.error('[前端] 解析失败:', error);
                
                errorMessage.textContent = error.message || '解析失败，请重试';
                errorArea.classList.remove('hidden');
                progressArea.classList.add('hidden');
                resetForm();
              }
            });
            
            // Phase 2.1: 进度轮询函数
            let pollingTimer = null;
            let progressStartTime = null;
            
            function startProgressPolling(resumeId) {
              progressStartTime = Date.now();
              
              // 立即查询一次
              pollProgress(resumeId);
              
              // 每秒轮询一次
              pollingTimer = setInterval(() => {
                pollProgress(resumeId);
              }, 1000);
            }
            
            async function pollProgress(resumeId) {
              try {
                const res = await fetch('/api/resume/progress/' + resumeId);
                const data = await res.json();
                
                if (!data.success) {
                  console.error('[进度] 查询失败:', data.error);
                  return;
                }
                
                const { status, progress } = data;
                
                // 更新进度显示
                if (progress) {
                  updateProgress(
                    progress.percent,
                    progress.stage,
                    progress.message,
                    progress.elapsedTime,
                    progress.estimatedRemaining
                  );
                }
                
                // 解析完成
                if (status === 'completed' && data.resume) {
                  clearInterval(pollingTimer);
                  pollingTimer = null;
                  
                  console.log('[Phase 2.1] 解析完成，简历数据:', data.resume);
                  
                  // 显示100%进度
                  updateProgress(100, 'completed', '解析完成！', progress.elapsedTime, 0);
                  
                  // Phase 2.2: 发送桌面通知
                  const resumeName = data.resume.basic_info?.name || '简历';
                  sendDesktopNotification('🎉 简历解析完成！', {
                    body: \`"\${resumeName}" 已成功解析，点击查看详情\`,
                    icon: '/favicon.ico',
                  });
                  
                  await new Promise(r => setTimeout(r, 1500));
                  
                  // 保存到 localStorage
                  const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                  resumes.unshift(data.resume);
                  localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));
                  
                  progressArea.classList.add('hidden');
                  showCurrentResume(data.resume);
                  uploadSection.classList.add('hidden');
                  resetForm();
                }
                
              } catch (error) {
                console.error('[进度] 轮询失败:', error);
              }
            }
            
            // Phase 2.1: 更新进度 UI
            function updateProgress(percent, stage, message, elapsedTime, estimatedRemaining) {
              // 更新进度条
              document.getElementById('progress-bar').style.width = percent + '%';
              document.getElementById('progress-percent').textContent = Math.floor(percent) + '%';
              
              // 更新阶段和消息
              document.getElementById('progress-stage').textContent = getStageLabel(stage);
              document.getElementById('progress-message').textContent = message;
              
              // 更新时间
              if (elapsedTime !== undefined) {
                document.getElementById('elapsed-time').textContent = elapsedTime;
              } else if (progressStartTime) {
                const elapsed = Math.floor((Date.now() - progressStartTime) / 1000);
                document.getElementById('elapsed-time').textContent = elapsed;
              }
              
              if (estimatedRemaining !== undefined && estimatedRemaining > 0) {
                document.getElementById('remaining-time').textContent = estimatedRemaining;
                document.getElementById('remaining-time-container').classList.remove('hidden');
              }
              
              // 更新阶段指示器
              updateStageIndicators(stage, percent);
            }
            
            // 阶段标签映射
            function getStageLabel(stage) {
              const labels = {
                'uploaded': '文件上传',
                'waiting': '等待解析',
                'parsing': 'MinerU 解析',
                'extracting': '提取信息',
                'structuring': '结构化处理',
                'saving': '保存数据',
                'completed': '解析完成',
              };
              return labels[stage] || stage;
            }
            
            // 更新阶段指示器
            function updateStageIndicators(stage, percent) {
              const stages = ['uploaded', 'parsing', 'structuring', 'completed'];
              const thresholds = {
                'uploaded': 5,
                'parsing': 30,
                'structuring': 75,
                'completed': 100,
              };
              
              stages.forEach(s => {
                const el = document.getElementById('stage-' + s);
                const threshold = thresholds[s];
                
                if (percent >= threshold) {
                  // 已完成
                  el.classList.remove('opacity-30');
                  el.classList.add('opacity-100');
                  el.querySelector('.w-6').classList.remove('bg-gray-300');
                  el.querySelector('.w-6').classList.add('bg-green-500');
                  el.querySelector('span').classList.remove('text-gray-500');
                  el.querySelector('span').classList.add('text-green-600', 'font-medium');
                } else if (stage === s || percent >= threshold - 10) {
                  // 进行中
                  el.classList.remove('opacity-30');
                  el.classList.add('opacity-100');
                  el.querySelector('.w-6').classList.remove('bg-gray-300');
                  el.querySelector('.w-6').classList.add('bg-blue-500');
                  el.querySelector('span').classList.remove('text-gray-500');
                  el.querySelector('span').classList.add('text-blue-600', 'font-medium');
                }
              });
            }
            
            // 重置表单
            function resetForm() {
              parseBtn.disabled = false;
              parseBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>解析简历';
              isParsing = false;
              textInput.value = '';
              selectedFile = null;
              fileInput.value = '';
              uploadPlaceholder.classList.remove('hidden');
              filePreview.classList.add('hidden');
              
              if (pollingTimer) {
                clearInterval(pollingTimer);
                pollingTimer = null;
              }
              progressStartTime = null;
            }
            
            // ==================== Phase 2.2: 桌面通知功能 ====================
            
            /**
             * 请求桌面通知权限
             */
            async function requestNotificationPermission() {
              // 检查浏览器支持
              if (!('Notification' in window)) {
                console.log('[桌面通知] 浏览器不支持 Notification API');
                return;
              }
              
              // 检查当前权限状态
              if (Notification.permission === 'granted') {
                console.log('[桌面通知] 已授权');
                return;
              }
              
              if (Notification.permission === 'denied') {
                console.log('[桌面通知] 用户已拒绝');
                return;
              }
              
              // 请求权限（仅在用户首次访问时）
              try {
                const permission = await Notification.requestPermission();
                console.log('[桌面通知] 权限请求结果:', permission);
              } catch (error) {
                console.error('[桌面通知] 请求权限失败:', error);
              }
            }
            
            /**
             * 发送桌面通知
             * @param {string} title - 通知标题
             * @param {object} options - 通知选项
             */
            function sendDesktopNotification(title, options = {}) {
              // 检查浏览器支持
              if (!('Notification' in window)) {
                console.warn('[桌面通知] 浏览器不支持');
                return;
              }
              
              // 检查权限
              if (Notification.permission !== 'granted') {
                console.warn('[桌面通知] 未授权，跳过通知');
                return;
              }
              
              // 默认选项
              const defaultOptions = {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'job-copilot-resume-parse',
                requireInteraction: false,
                ...options,
              };
              
              try {
                // 创建通知
                const notification = new Notification(title, defaultOptions);
                
                // 点击通知时聚焦窗口并关闭通知
                notification.onclick = function() {
                  window.focus();
                  notification.close();
                  
                  // 如果提供了点击回调，执行
                  if (options.onClick) {
                    options.onClick();
                  }
                };
                
                // 5秒后自动关闭
                setTimeout(() => {
                  notification.close();
                }, 5000);
                
                console.log('[桌面通知] 已发送:', title);
              } catch (error) {
                console.error('[桌面通知] 发送失败:', error);
              }
            }
            
            // ==================== Phase 2.3: PDF 类型检测 ====================
            
            /**
             * 检测 PDF 类型（数字 PDF 或扫描 PDF）
             * @param {File} file - PDF 文件
             */
            async function detectPDFType(file) {
              const pdfTypeInfo = document.getElementById('pdf-type-info');
              const pdfTypeIcon = document.getElementById('pdf-type-icon');
              const pdfTypeLabel = document.getElementById('pdf-type-label');
              const pdfTypeTime = document.getElementById('pdf-type-time');
              
              try {
                // 显示检测中状态
                pdfTypeInfo.classList.remove('hidden');
                pdfTypeInfo.className = 'mt-3 px-3 py-2 rounded-lg text-sm bg-blue-50 border border-blue-100';
                pdfTypeIcon.className = 'fas fa-spinner fa-spin text-blue-500';
                pdfTypeLabel.textContent = '检测中...';
                pdfTypeLabel.className = 'font-medium text-blue-700';
                pdfTypeTime.textContent = '';
                
                // 使用简单的文件大小启发式方法检测
                // 注意：这是一个简化版本，真正的检测需要 PDF.js 但在 Cloudflare Workers 环境中可能不可用
                const fileSizeKB = file.size / 1024;
                const fileSizeMB = fileSizeKB / 1024;
                
                // 启发式规则：
                // 1. 小于 500KB 的 PDF 通常是数字 PDF
                // 2. 大于 2MB 且每页超过 200KB 的通常是扫描 PDF
                // 3. 文件名包含 "scan" 或 "扫描" 的是扫描 PDF
                
                const fileName = file.name.toLowerCase();
                const isScanByName = fileName.includes('scan') || fileName.includes('扫描');
                const isLikelyDigital = fileSizeKB < 500;
                const isLikelyScan = fileSizeMB > 2 || isScanByName;
                
                let pdfType, estimatedTime, bgClass, iconClass, textClass;
                
                if (isLikelyScan) {
                  // 扫描 PDF
                  pdfType = '扫描版 PDF';
                  estimatedTime = '预计需要 45-60 秒';
                  bgClass = 'bg-orange-50 border-orange-100';
                  iconClass = 'fas fa-camera text-orange-500';
                  textClass = 'text-orange-700';
                } else if (isLikelyDigital) {
                  // 数字 PDF
                  pdfType = '数字版 PDF';
                  estimatedTime = '预计需要 30-45 秒';
                  bgClass = 'bg-green-50 border-green-100';
                  iconClass = 'fas fa-file-pdf text-green-500';
                  textClass = 'text-green-700';
                } else {
                  // 不确定
                  pdfType = 'PDF 文件';
                  estimatedTime = '预计需要 40-60 秒';
                  bgClass = 'bg-gray-50 border-gray-100';
                  iconClass = 'fas fa-file-alt text-gray-500';
                  textClass = 'text-gray-700';
                }
                
                // 更新 UI
                await new Promise(r => setTimeout(r, 300)); // 短暂延迟使检测更真实
                pdfTypeInfo.className = 'mt-3 px-3 py-2 rounded-lg text-sm ' + bgClass;
                pdfTypeIcon.className = iconClass;
                pdfTypeLabel.textContent = pdfType;
                pdfTypeLabel.className = 'font-medium ' + textClass;
                pdfTypeTime.textContent = estimatedTime;
                
                console.log('[PDF检测] 类型:', pdfType, '大小:', fileSizeMB.toFixed(2) + 'MB');
              } catch (error) {
                console.error('[PDF检测] 失败:', error);
                // 失败时隐藏提示
                pdfTypeInfo.classList.add('hidden');
              }
            }
          });
        `
      }} />
    </div>,
    { title: '我的简历 - Job Copilot' }
  )
})

// ==================== 简历库页面（Phase 7 新增） ====================

// 简历库列表页
app.get('/resumes', (c) => {
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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
              <a href="/resume" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-file-alt mr-1.5"></i><span class="hidden sm:inline">上传简历</span>
              </a>
            </nav>
            <a href="/resume" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
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
          <span class="text-gray-900 font-medium">简历库</span>
        </nav>

        {/* 标题和统计 */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">简历库</h1>
            <p id="resumes-stats" class="text-sm text-gray-500 mt-1">共 0 份简历</p>
          </div>
          <a href="/resume" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
            <i class="fas fa-plus mr-1"></i>上传新简历
          </a>
        </div>

        {/* 简历列表 */}
        <div id="resumes-list" class="space-y-4">
          {/* 骨架屏 */}
          <div class="p-4 border border-gray-200 rounded-xl">
            <div class="skeleton h-5 w-1/3 mb-3"></div>
            <div class="skeleton h-4 w-1/2 mb-2"></div>
            <div class="flex gap-2">
              <div class="skeleton h-6 w-16 rounded-full"></div>
              <div class="skeleton h-6 w-20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 空状态 */}
        <div id="empty-state" class="hidden text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-folder-open text-2xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无简历</h3>
          <p class="text-gray-500 mb-4">上传您的第一份简历开始求职之旅</p>
          <a href="/resume" class="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            <i class="fas fa-plus mr-2"></i>上传简历
          </a>
        </div>
      </main>

      {/* 页脚 */}
      <footer class="border-t border-gray-100 mt-auto">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>Job Copilot v0.7.0 - Phase 7 简历库</span>
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var resumesList = document.getElementById('resumes-list');
            var emptyState = document.getElementById('empty-state');
            var resumesStats = document.getElementById('resumes-stats');
            
            var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            var versions = JSON.parse(localStorage.getItem('jobcopilot_resume_versions') || '[]');
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            
            // 统计信息
            var masterCount = resumes.filter(function(r) { return r.is_master !== false; }).length;
            var versionCount = resumes.filter(function(r) { return r.is_master === false; }).length;
            resumesStats.textContent = '共 ' + resumes.length + ' 份简历' + 
              (masterCount > 0 ? ' (' + masterCount + ' 主版本' + (versionCount > 0 ? ', ' + versionCount + ' 定向版' : '') + ')' : '');
            
            if (resumes.length === 0) {
              resumesList.innerHTML = '';
              emptyState.classList.remove('hidden');
              return;
            }
            
            // 获取简历的版本数
            function getVersionCount(resumeId) {
              return versions.filter(function(v) { return v.resume_id === resumeId; }).length;
            }
            
            // 获取关联的岗位名称
            function getLinkedJobs(linkedIds) {
              if (!linkedIds || linkedIds.length === 0) return [];
              return linkedIds.map(function(id) {
                var job = jobs.find(function(j) { return j.id === id; });
                return job ? job.title : null;
              }).filter(Boolean);
            }
            
            // 格式化时间
            function formatDate(dateStr) {
              if (!dateStr) return '';
              var date = new Date(dateStr);
              return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
            }
            
            resumesList.innerHTML = resumes.map(function(resume) {
              var versionCount = getVersionCount(resume.id);
              var linkedJobs = getLinkedJobs(resume.linked_jd_ids);
              var isMaster = resume.is_master !== false;
              
              return '<div class="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">' +
                '<div class="flex items-start justify-between">' +
                  '<div class="flex-1">' +
                    '<div class="flex items-center gap-2 mb-2">' +
                      '<a href="/resume/' + resume.id + '" class="font-semibold text-lg text-gray-900 hover:text-blue-600">' +
                        (resume.name || resume.basic_info?.name || '未命名简历') +
                      '</a>' +
                      (isMaster ? 
                        '<span class="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">主版本</span>' :
                        '<span class="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">定向版</span>') +
                      (resume.version_tag ? 
                        '<span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">' + resume.version_tag + '</span>' : '') +
                    '</div>' +
                    '<p class="text-sm text-gray-500 mb-2">' +
                      '<i class="fas fa-user mr-1"></i>' + (resume.basic_info?.name || '未知') + 
                      (resume.basic_info?.target_position ? ' · <i class="fas fa-crosshairs ml-2 mr-1"></i>' + resume.basic_info.target_position : '') +
                    '</p>' +
                    '<div class="flex flex-wrap gap-2 mb-3">' +
                      (resume.ability_tags?.industry?.slice(0, 2).map(function(tag) {
                        return '<span class="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">' + tag + '</span>';
                      }).join('') || '') +
                      (resume.ability_tags?.technology?.slice(0, 2).map(function(tag) {
                        return '<span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded-full">' + tag + '</span>';
                      }).join('') || '') +
                    '</div>' +
                    (linkedJobs.length > 0 ?
                      '<div class="text-xs text-gray-500 mb-2">' +
                        '<i class="fas fa-link mr-1"></i>关联岗位: ' + linkedJobs.slice(0, 3).join('、') +
                        (linkedJobs.length > 3 ? ' 等' + linkedJobs.length + '个' : '') +
                      '</div>' : '') +
                  '</div>' +
                  '<div class="flex flex-col items-end gap-2">' +
                    '<div class="flex items-center gap-2">' +
                      '<span class="text-xs text-gray-400">' + formatDate(resume.updated_at || resume.created_at) + '</span>' +
                      '<button onclick="event.stopPropagation();deleteResume(\\'' + resume.id + '\\')" class="text-gray-400 hover:text-red-500 p-1" title="删除">' +
                        '<i class="fas fa-trash-alt text-xs"></i>' +
                      '</button>' +
                    '</div>' +
                    (versionCount > 0 ?
                      '<a href="/resume/' + resume.id + '/versions" class="text-xs text-blue-500 hover:text-blue-600">' +
                        '<i class="fas fa-history mr-1"></i>' + versionCount + ' 个版本' +
                      '</a>' : '') +
                  '</div>' +
                '</div>' +
                '<div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">' +
                  '<div class="text-xs text-gray-400">版本 v' + (resume.version || 1) + '</div>' +
                  '<div class="flex gap-2">' +
                    '<a href="/resume/' + resume.id + '" class="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50">查看详情</a>' +
                    '<a href="/resume/' + resume.id + '/versions" class="text-xs text-purple-500 hover:text-purple-600 px-2 py-1 rounded hover:bg-purple-50">版本历史</a>' +
                    '<a href="/jobs" class="text-xs text-green-500 hover:text-green-600 px-2 py-1 rounded hover:bg-green-50">去匹配</a>' +
                  '</div>' +
                '</div>' +
              '</div>';
            }).join('');
          });
          
          // 删除简历
          function deleteResume(id) {
            if (!confirm('确定要删除这份简历吗？相关的版本记录也会被删除。')) return;
            
            var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            var versions = JSON.parse(localStorage.getItem('jobcopilot_resume_versions') || '[]');
            
            // 删除简历
            resumes = resumes.filter(function(r) { return r.id !== id; });
            localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));
            
            // 删除相关版本
            versions = versions.filter(function(v) { return v.resume_id !== id; });
            localStorage.setItem('jobcopilot_resume_versions', JSON.stringify(versions));
            
            location.reload();
          }
        `
      }} />
    </div>,
    { title: '简历库 - Job Copilot' }
  )
})

// 简历详情页
app.get('/resume/:id', (c) => {
  const resumeId = c.req.param('id')
  
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* 面包屑 */}
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" class="hover:text-gray-700"><i class="fas fa-home"></i></a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <a href="/resumes" class="hover:text-gray-700">简历库</a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <span id="breadcrumb-name" class="text-gray-900 font-medium">简历详情</span>
        </nav>

        {/* 简历内容 */}
        <div id="resume-content" class="space-y-6">
          {/* 加载状态 */}
          <div class="text-center py-12">
            <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
            <p class="text-gray-500">加载中...</p>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var resumeId = '${resumeId}';
            var content = document.getElementById('resume-content');
            var breadcrumbName = document.getElementById('breadcrumb-name');
            
            var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            var resume = resumes.find(function(r) { return r.id === resumeId; });
            
            if (!resume) {
              content.innerHTML = '<div class="text-center py-12">' +
                '<i class="fas fa-exclamation-circle text-3xl text-red-400 mb-4"></i>' +
                '<p class="text-red-500">未找到简历</p>' +
                '<a href="/resumes" class="mt-4 inline-block text-blue-500 hover:text-blue-600">返回简历库</a>' +
              '</div>';
              return;
            }
            
            breadcrumbName.textContent = resume.name || resume.basic_info?.name || '简历详情';
            
            content.innerHTML = 
              // 基础信息卡片
              '<div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">' +
                '<div class="flex items-start justify-between mb-4">' +
                  '<div>' +
                    '<div class="flex items-center gap-2 mb-1">' +
                      '<h1 class="text-2xl font-bold">' + (resume.name || resume.basic_info?.name || '未命名简历') + '</h1>' +
                      (resume.is_master !== false ? 
                        '<span class="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">主版本</span>' :
                        '<span class="px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">定向版</span>') +
                    '</div>' +
                    (resume.original_file_name ? '<p class="text-xs text-gray-400 mb-1"><i class="fas fa-file mr-1"></i>' + resume.original_file_name + '</p>' : '') +
                    '<p class="text-sm text-gray-600">' + (resume.basic_info?.contact || '') + '</p>' +
                    '<p class="text-sm text-gray-500 mt-1">' +
                      '<i class="fas fa-crosshairs mr-1"></i>' + (resume.basic_info?.target_position || '未指定目标岗位') +
                    '</p>' +
                  '</div>' +
                  '<div class="flex flex-col items-end gap-2">' +
                    '<span class="text-sm text-gray-400">v' + (resume.version || 1) + '</span>' +
                    (resume.version_tag ? '<span class="px-2 py-1 text-xs bg-white rounded-full">' + resume.version_tag + '</span>' : '') +
                  '</div>' +
                '</div>' +
                // 能力标签
                '<div class="grid grid-cols-2 md:grid-cols-4 gap-3">' +
                  '<div class="bg-white/70 rounded-lg p-3">' +
                    '<p class="text-xs text-gray-500 mb-1">行业</p>' +
                    '<p class="text-sm font-medium">' + (resume.ability_tags?.industry?.join('、') || '-') + '</p>' +
                  '</div>' +
                  '<div class="bg-white/70 rounded-lg p-3">' +
                    '<p class="text-xs text-gray-500 mb-1">技术</p>' +
                    '<p class="text-sm font-medium">' + (resume.ability_tags?.technology?.join('、') || '-') + '</p>' +
                  '</div>' +
                  '<div class="bg-white/70 rounded-lg p-3">' +
                    '<p class="text-xs text-gray-500 mb-1">产品</p>' +
                    '<p class="text-sm font-medium">' + (resume.ability_tags?.product?.join('、') || '-') + '</p>' +
                  '</div>' +
                  '<div class="bg-white/70 rounded-lg p-3">' +
                    '<p class="text-xs text-gray-500 mb-1">能力</p>' +
                    '<p class="text-sm font-medium">' + (resume.ability_tags?.capability?.join('、') || '-') + '</p>' +
                  '</div>' +
                '</div>' +
                // 操作按钮
                '<div class="flex flex-wrap gap-3 mt-4">' +
                  '<a href="/resume/' + resumeId + '/edit" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">' +
                    '<i class="fas fa-edit mr-1"></i>编辑简历' +
                  '</a>' +
                  '<a href="/resume/' + resumeId + '/versions" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">' +
                    '<i class="fas fa-history mr-1"></i>版本历史' +
                  '</a>' +
                  '<a href="/jobs" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">' +
                    '<i class="fas fa-search mr-1"></i>去匹配岗位' +
                  '</a>' +
                '</div>' +
              '</div>' +
              
              // 教育背景
              '<div class="border border-gray-200 rounded-xl p-6">' +
                '<h2 class="text-lg font-semibold mb-4"><i class="fas fa-graduation-cap text-blue-500 mr-2"></i>教育背景</h2>' +
                '<div class="space-y-3">' +
                  (resume.education?.length > 0 ? resume.education.map(function(edu) {
                    return '<div class="flex justify-between items-start">' +
                      '<div>' +
                        '<p class="font-medium">' + edu.school + '</p>' +
                        '<p class="text-sm text-gray-500">' + edu.major + ' · ' + edu.degree + '</p>' +
                      '</div>' +
                      '<span class="text-sm text-gray-400">' + edu.duration + '</span>' +
                    '</div>';
                  }).join('') : '<p class="text-gray-500 text-sm">暂无教育背景</p>') +
                '</div>' +
              '</div>' +
              
              // 工作经历
              '<div class="border border-gray-200 rounded-xl p-6">' +
                '<h2 class="text-lg font-semibold mb-4"><i class="fas fa-briefcase text-green-500 mr-2"></i>工作经历</h2>' +
                '<div class="space-y-4">' +
                  (resume.work_experience?.length > 0 ? resume.work_experience.map(function(exp) {
                    return '<div class="border-l-2 border-green-200 pl-4">' +
                      '<div class="flex justify-between items-start mb-1">' +
                        '<div>' +
                          '<p class="font-medium">' + exp.position + '</p>' +
                          '<p class="text-sm text-gray-500">' + exp.company + '</p>' +
                        '</div>' +
                        '<span class="text-sm text-gray-400">' + exp.duration + '</span>' +
                      '</div>' +
                      '<p class="text-sm text-gray-600 mt-2">' + (exp.description || '') + '</p>' +
                    '</div>';
                  }).join('') : '<p class="text-gray-500 text-sm">暂无工作经历</p>') +
                '</div>' +
              '</div>' +
              
              // 项目经历
              '<div class="border border-gray-200 rounded-xl p-6">' +
                '<h2 class="text-lg font-semibold mb-4"><i class="fas fa-project-diagram text-purple-500 mr-2"></i>项目经历</h2>' +
                '<div class="space-y-4">' +
                  (resume.projects?.length > 0 ? resume.projects.map(function(proj) {
                    return '<div class="border-l-2 border-purple-200 pl-4">' +
                      '<div class="flex justify-between items-start mb-1">' +
                        '<div>' +
                          '<p class="font-medium">' + proj.name + '</p>' +
                          '<p class="text-sm text-gray-500">' + proj.role + '</p>' +
                        '</div>' +
                        '<span class="text-sm text-gray-400">' + proj.duration + '</span>' +
                      '</div>' +
                      '<p class="text-sm text-gray-600 mt-2">' + (proj.description || '') + '</p>' +
                      (proj.achievements?.length > 0 ? 
                        '<div class="mt-2"><span class="text-xs text-green-600">成果: </span><span class="text-xs text-gray-600">' + proj.achievements.join('、') + '</span></div>' : '') +
                      (proj.tech_stack?.length > 0 ?
                        '<div class="mt-1"><span class="text-xs text-blue-600">技术: </span><span class="text-xs text-gray-600">' + proj.tech_stack.join('、') + '</span></div>' : '') +
                    '</div>';
                  }).join('') : '<p class="text-gray-500 text-sm">暂无项目经历</p>') +
                '</div>' +
              '</div>' +
              
              // 技能
              '<div class="border border-gray-200 rounded-xl p-6">' +
                '<h2 class="text-lg font-semibold mb-4"><i class="fas fa-cogs text-yellow-500 mr-2"></i>专业技能</h2>' +
                '<div class="flex flex-wrap gap-2">' +
                  (resume.skills?.length > 0 ? resume.skills.map(function(skill) {
                    return '<span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">' + skill + '</span>';
                  }).join('') : '<p class="text-gray-500 text-sm">暂无技能</p>') +
                '</div>' +
              '</div>';
          });
        `
      }} />
    </div>,
    { title: '简历详情 - Job Copilot' }
  )
})

// 简历编辑器页面
app.get('/resume/:id/edit', (c) => {
  const resumeId = c.req.param('id')
  
  return c.render(
    <div class="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a href={`/resume/${resumeId}`} class="text-gray-600 hover:text-gray-900 flex items-center">
              <i class="fas fa-arrow-left mr-2"></i>
              <span class="hidden sm:inline">返回</span>
            </a>
            <h1 class="text-lg font-semibold">编辑简历</h1>
            <span id="save-status" class="text-sm text-gray-500">已保存</span>
          </div>
          <div class="flex items-center gap-2">
            <button id="save-btn" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
              <i class="fas fa-save mr-1"></i>
              <span class="hidden sm:inline">保存</span>
            </button>
            <button id="export-pdf-btn" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors">
              <i class="fas fa-file-pdf mr-1"></i>
              <span class="hidden sm:inline">导出PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主编辑区 */}
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧编辑表单 */}
          <div class="space-y-4">
            <div id="editor-container">
              {/* 加载状态 */}
              <div class="text-center py-12">
                <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">加载中...</p>
              </div>
            </div>
          </div>

          {/* 右侧预览区 */}
          <div class="lg:sticky lg:top-24">
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
              <div class="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 class="font-semibold text-gray-700">实时预览</h3>
                <select id="template-selector" class="text-sm border rounded px-2 py-1 bg-white">
                  <option value="classic">经典模板</option>
                  <option value="modern">现代模板</option>
                  <option value="timeline">时间线模板</option>
                </select>
              </div>
              <div id="preview-container" class="p-6 bg-white overflow-auto" style="max-height: 800px;">
                {/* 预览内容 */}
                <div class="text-center py-12">
                  <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
                  <p class="text-gray-500">生成预览中...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑器 JavaScript */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const resumeId = '${resumeId}';
            let resume = null;
            let isDirty = false;

            // 从 localStorage 加载简历
            function loadResume() {
              const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
              resume = resumes.find(r => r.id === resumeId);
              
              if (!resume) {
                alert('简历不存在');
                window.location.href = '/resume';
                return;
              }

              renderEditor(resume);
              renderPreview(resume);
            }

            // 渲染编辑器表单
            function renderEditor(resume) {
              const container = document.getElementById('editor-container');
              container.innerHTML = 
                // 基本信息
                '<div class="bg-white rounded-lg shadow p-6">' +
                  '<h3 class="text-lg font-semibold mb-4 flex items-center">' +
                    '<i class="fas fa-user mr-2 text-blue-500"></i>基本信息' +
                  '</h3>' +
                  '<div class="space-y-3">' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>' +
                      '<input type="text" id="input-name" value="' + (resume.basic_info?.name || '') + '" ' +
                             'class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />' +
                    '</div>' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-1">联系方式</label>' +
                      '<input type="text" id="input-contact" value="' + (resume.basic_info?.contact || '') + '" ' +
                             'class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />' +
                    '</div>' +
                    '<div>' +
                      '<label class="block text-sm font-medium text-gray-700 mb-1">目标岗位</label>' +
                      '<input type="text" id="input-target" value="' + (resume.basic_info?.target_position || '') + '" ' +
                             'class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />' +
                    '</div>' +
                  '</div>' +
                '</div>' +

                // 教育背景
                '<div class="bg-white rounded-lg shadow p-6">' +
                  '<div class="flex items-center justify-between mb-4">' +
                    '<h3 class="text-lg font-semibold flex items-center">' +
                      '<i class="fas fa-graduation-cap mr-2 text-blue-500"></i>教育背景' +
                    '</h3>' +
                    '<button onclick="addEducation()" class="text-sm text-blue-500 hover:text-blue-600 flex items-center">' +
                      '<i class="fas fa-plus mr-1"></i>添加' +
                    '</button>' +
                  '</div>' +
                  '<div id="education-list" class="space-y-4">' +
                    (resume.education?.map((edu, idx) => renderEducationItem(edu, idx)).join('') || 
                     '<p class="text-gray-400 text-sm text-center py-4">暂无教育背景，点击上方"添加"按钮</p>') +
                  '</div>' +
                '</div>' +

                // 工作经历
                '<div class="bg-white rounded-lg shadow p-6">' +
                  '<div class="flex items-center justify-between mb-4">' +
                    '<h3 class="text-lg font-semibold flex items-center">' +
                      '<i class="fas fa-briefcase mr-2 text-green-500"></i>工作经历' +
                    '</h3>' +
                    '<button onclick="addWorkExperience()" class="text-sm text-blue-500 hover:text-blue-600 flex items-center">' +
                      '<i class="fas fa-plus mr-1"></i>添加' +
                    '</button>' +
                  '</div>' +
                  '<div id="work-list" class="space-y-4">' +
                    (resume.work_experience?.map((exp, idx) => renderWorkItem(exp, idx)).join('') || 
                     '<p class="text-gray-400 text-sm text-center py-4">暂无工作经历，点击上方"添加"按钮</p>') +
                  '</div>' +
                '</div>' +

                // 项目经历
                '<div class="bg-white rounded-lg shadow p-6">' +
                  '<div class="flex items-center justify-between mb-4">' +
                    '<h3 class="text-lg font-semibold flex items-center">' +
                      '<i class="fas fa-project-diagram mr-2 text-purple-500"></i>项目经历' +
                    '</h3>' +
                    '<button onclick="addProject()" class="text-sm text-blue-500 hover:text-blue-600 flex items-center">' +
                      '<i class="fas fa-plus mr-1"></i>添加' +
                    '</button>' +
                  '</div>' +
                  '<div id="project-list" class="space-y-4">' +
                    (resume.projects?.map((proj, idx) => renderProjectItem(proj, idx)).join('') || 
                     '<p class="text-gray-400 text-sm text-center py-4">暂无项目经历，点击上方"添加"按钮</p>') +
                  '</div>' +
                '</div>' +

                // 专业技能
                '<div class="bg-white rounded-lg shadow p-6">' +
                  '<h3 class="text-lg font-semibold mb-4 flex items-center">' +
                    '<i class="fas fa-cogs mr-2 text-yellow-500"></i>专业技能' +
                  '</h3>' +
                  '<div class="flex flex-wrap gap-2 mb-3" id="skills-display">' +
                    (resume.skills?.map((skill, idx) => 
                      '<span class="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2">' +
                        skill +
                        '<button onclick="removeSkill(' + idx + ')" class="text-red-500 hover:text-red-600">' +
                          '<i class="fas fa-times text-xs"></i>' +
                        '</button>' +
                      '</span>'
                    ).join('') || '') +
                  '</div>' +
                  '<div class="flex gap-2">' +
                    '<input type="text" id="new-skill" placeholder="添加技能..." ' +
                           'class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />' +
                    '<button onclick="addSkill()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">' +
                      '添加' +
                    '</button>' +
                  '</div>' +
                '</div>';
              
              bindInputEvents();
            }

            // 渲染教育经历项
            function renderEducationItem(edu, index) {
              return '<div class="border rounded-lg p-4 relative">' +
                '<button onclick="removeEducation(' + index + ')" ' +
                        'class="absolute top-2 right-2 text-red-500 hover:text-red-600">' +
                  '<i class="fas fa-trash text-sm"></i>' +
                '</button>' +
                '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
                  '<input type="text" placeholder="学校" value="' + (edu.school || '') + '" ' +
                         'onchange="updateEducation(' + index + ', \\'school\\', this.value)" ' +
                         'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '<input type="text" placeholder="专业" value="' + (edu.major || '') + '" ' +
                         'onchange="updateEducation(' + index + ', \\'major\\', this.value)" ' +
                         'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '<input type="text" placeholder="学历" value="' + (edu.degree || '') + '" ' +
                         'onchange="updateEducation(' + index + ', \\'degree\\', this.value)" ' +
                         'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '<input type="text" placeholder="时间段(如:2017-2021)" value="' + (edu.duration || '') + '" ' +
                         'onchange="updateEducation(' + index + ', \\'duration\\', this.value)" ' +
                         'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                '</div>' +
              '</div>';
            }

            // 渲染工作经历项
            function renderWorkItem(exp, index) {
              return '<div class="border rounded-lg p-4 relative">' +
                '<button onclick="removeWorkExperience(' + index + ')" ' +
                        'class="absolute top-2 right-2 text-red-500 hover:text-red-600">' +
                  '<i class="fas fa-trash text-sm"></i>' +
                '</button>' +
                '<div class="space-y-3">' +
                  '<input type="text" placeholder="公司" value="' + (exp.company || '') + '" ' +
                         'onchange="updateWorkExperience(' + index + ', \\'company\\', this.value)" ' +
                         'class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
                    '<input type="text" placeholder="职位" value="' + (exp.position || '') + '" ' +
                           'onchange="updateWorkExperience(' + index + ', \\'position\\', this.value)" ' +
                           'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                    '<input type="text" placeholder="时间段(如:2024.01-至今)" value="' + (exp.duration || '') + '" ' +
                           'onchange="updateWorkExperience(' + index + ', \\'duration\\', this.value)" ' +
                           'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '</div>' +
                  '<textarea placeholder="工作描述" ' +
                            'onchange="updateWorkExperience(' + index + ', \\'description\\', this.value)" ' +
                            'class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" ' +
                            'rows="3">' + (exp.description || '') + '</textarea>' +
                '</div>' +
              '</div>';
            }

            // 渲染项目经历项
            function renderProjectItem(proj, index) {
              return '<div class="border rounded-lg p-4 relative">' +
                '<button onclick="removeProject(' + index + ')" ' +
                        'class="absolute top-2 right-2 text-red-500 hover:text-red-600">' +
                  '<i class="fas fa-trash text-sm"></i>' +
                '</button>' +
                '<div class="space-y-3">' +
                  '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
                    '<input type="text" placeholder="项目名称" value="' + (proj.name || '') + '" ' +
                           'onchange="updateProject(' + index + ', \\'name\\', this.value)" ' +
                           'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                    '<input type="text" placeholder="角色" value="' + (proj.role || '') + '" ' +
                           'onchange="updateProject(' + index + ', \\'role\\', this.value)" ' +
                           'class="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '</div>' +
                  '<input type="text" placeholder="时间段" value="' + (proj.duration || '') + '" ' +
                         'onchange="updateProject(' + index + ', \\'duration\\', this.value)" ' +
                         'class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />' +
                  '<textarea placeholder="项目描述" ' +
                            'onchange="updateProject(' + index + ', \\'description\\', this.value)" ' +
                            'class="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" ' +
                            'rows="3">' + (proj.description || '') + '</textarea>' +
                '</div>' +
              '</div>';
            }

            // 绑定输入事件
            function bindInputEvents() {
              document.getElementById('input-name')?.addEventListener('input', e => {
                resume.basic_info.name = e.target.value;
                resume.name = e.target.value || '未命名简历';
                markDirty();
                debouncePreview();
              });

              document.getElementById('input-contact')?.addEventListener('input', e => {
                resume.basic_info.contact = e.target.value;
                markDirty();
                debouncePreview();
              });

              document.getElementById('input-target')?.addEventListener('input', e => {
                resume.basic_info.target_position = e.target.value;
                markDirty();
                debouncePreview();
              });

              document.getElementById('new-skill')?.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                  addSkill();
                }
              });
            }

            // 教育背景操作
            window.addEducation = function() {
              if (!resume.education) resume.education = [];
              resume.education.push({
                school: '',
                major: '',
                degree: '',
                duration: ''
              });
              markDirty();
              renderEditor(resume);
            };

            window.removeEducation = function(index) {
              if (confirm('确定删除这条教育背景？')) {
                resume.education.splice(index, 1);
                markDirty();
                renderEditor(resume);
                renderPreview(resume);
              }
            };

            window.updateEducation = function(index, field, value) {
              resume.education[index][field] = value;
              markDirty();
              debouncePreview();
            };

            // 工作经历操作
            window.addWorkExperience = function() {
              if (!resume.work_experience) resume.work_experience = [];
              resume.work_experience.push({
                company: '',
                position: '',
                duration: '',
                description: ''
              });
              markDirty();
              renderEditor(resume);
            };

            window.removeWorkExperience = function(index) {
              if (confirm('确定删除这条工作经历？')) {
                resume.work_experience.splice(index, 1);
                markDirty();
                renderEditor(resume);
                renderPreview(resume);
              }
            };

            window.updateWorkExperience = function(index, field, value) {
              resume.work_experience[index][field] = value;
              markDirty();
              debouncePreview();
            };

            // 项目经历操作
            window.addProject = function() {
              if (!resume.projects) resume.projects = [];
              resume.projects.push({
                name: '',
                role: '',
                duration: '',
                description: '',
                achievements: [],
                tech_stack: []
              });
              markDirty();
              renderEditor(resume);
            };

            window.removeProject = function(index) {
              if (confirm('确定删除这个项目？')) {
                resume.projects.splice(index, 1);
                markDirty();
                renderEditor(resume);
                renderPreview(resume);
              }
            };

            window.updateProject = function(index, field, value) {
              resume.projects[index][field] = value;
              markDirty();
              debouncePreview();
            };

            // 技能操作
            window.addSkill = function() {
              const input = document.getElementById('new-skill');
              const skill = input.value.trim();
              if (skill) {
                if (!resume.skills) resume.skills = [];
                resume.skills.push(skill);
                input.value = '';
                markDirty();
                renderEditor(resume);
                renderPreview(resume);
              }
            };

            window.removeSkill = function(index) {
              resume.skills.splice(index, 1);
              markDirty();
              renderEditor(resume);
              renderPreview(resume);
            };

            // 防抖预览更新
            let previewTimer;
            function debouncePreview() {
              clearTimeout(previewTimer);
              previewTimer = setTimeout(() => {
                renderPreview(resume);
              }, 300);
            }

            // 渲染预览
            function renderPreview(resume) {
              const container = document.getElementById('preview-container');
              const template = document.getElementById('template-selector').value;
              container.innerHTML = renderTemplate(resume, template);
            }

            // 模板渲染
            function renderTemplate(resume, template) {
              switch(template) {
                case 'modern':
                  return renderModernTemplate(resume);
                case 'timeline':
                  return renderTimelineTemplate(resume);
                default:
                  return renderClassicTemplate(resume);
              }
            }

            // 经典模板
            function renderClassicTemplate(resume) {
              return '<div class="space-y-4 text-sm">' +
                '<div class="text-center border-b pb-4">' +
                  '<h1 class="text-2xl font-bold text-gray-900">' + (resume.basic_info?.name || '未命名') + '</h1>' +
                  '<p class="text-gray-600 mt-1">' + (resume.basic_info?.contact || '') + '</p>' +
                  '<p class="text-gray-600">' + (resume.basic_info?.target_position || '') + '</p>' +
                '</div>' +

                '<div class="border-t pt-3">' +
                  '<h3 class="font-bold text-base mb-2 text-gray-800"><i class="fas fa-graduation-cap mr-1 text-blue-500"></i>教育背景</h3>' +
                  (resume.education?.length > 0 ? resume.education.map(edu =>
                    '<div class="mb-2">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium">' + edu.school + '</span>' +
                        '<span class="text-gray-500">' + edu.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600">' + edu.major + ' · ' + edu.degree + '</div>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400">暂无教育背景</p>') +
                '</div>' +

                '<div class="border-t pt-3">' +
                  '<h3 class="font-bold text-base mb-2 text-gray-800"><i class="fas fa-briefcase mr-1 text-green-500"></i>工作经历</h3>' +
                  (resume.work_experience?.length > 0 ? resume.work_experience.map(exp =>
                    '<div class="mb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium">' + exp.position + '</span>' +
                        '<span class="text-gray-500">' + exp.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600">' + exp.company + '</div>' +
                      '<p class="text-gray-700 mt-1 text-xs leading-relaxed">' + (exp.description || '') + '</p>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400">暂无工作经历</p>') +
                '</div>' +

                '<div class="border-t pt-3">' +
                  '<h3 class="font-bold text-base mb-2 text-gray-800"><i class="fas fa-project-diagram mr-1 text-purple-500"></i>项目经历</h3>' +
                  (resume.projects?.length > 0 ? resume.projects.map(proj =>
                    '<div class="mb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium">' + proj.name + '</span>' +
                        '<span class="text-gray-500">' + proj.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600">' + proj.role + '</div>' +
                      '<p class="text-gray-700 mt-1 text-xs leading-relaxed">' + (proj.description || '') + '</p>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400">暂无项目经历</p>') +
                '</div>' +

                '<div class="border-t pt-3">' +
                  '<h3 class="font-bold text-base mb-2 text-gray-800"><i class="fas fa-cogs mr-1 text-yellow-500"></i>专业技能</h3>' +
                  '<div class="flex flex-wrap gap-1">' +
                    (resume.skills?.length > 0 ? resume.skills.map(skill =>
                      '<span class="px-2 py-1 bg-gray-100 rounded text-xs">' + skill + '</span>'
                    ).join('') : '<p class="text-gray-400">暂无技能</p>') +
                  '</div>' +
                '</div>' +
              '</div>';
            }

            // 现代模板
            function renderModernTemplate(resume) {
              return '<div class="space-y-4 text-sm">' +
                '<div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">' +
                  '<h1 class="text-2xl font-bold">' + (resume.basic_info?.name || '未命名') + '</h1>' +
                  '<p class="mt-1 opacity-90">' + (resume.basic_info?.contact || '') + '</p>' +
                  '<p class="opacity-90">' + (resume.basic_info?.target_position || '') + '</p>' +
                '</div>' +

                '<div class="bg-blue-50 p-4 rounded-lg">' +
                  '<h3 class="font-bold text-base mb-2 text-blue-900">教育背景</h3>' +
                  (resume.education?.length > 0 ? resume.education.map(edu =>
                    '<div class="mb-2">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium text-gray-800">' + edu.school + '</span>' +
                        '<span class="text-gray-600 text-xs">' + edu.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600 text-xs">' + edu.major + ' · ' + edu.degree + '</div>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400">暂无教育背景</p>') +
                '</div>' +

                '<div class="bg-green-50 p-4 rounded-lg">' +
                  '<h3 class="font-bold text-base mb-2 text-green-900">工作经历</h3>' +
                  (resume.work_experience?.length > 0 ? resume.work_experience.map(exp =>
                    '<div class="mb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium text-gray-800">' + exp.position + '</span>' +
                        '<span class="text-gray-600 text-xs">' + exp.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600 text-xs">' + exp.company + '</div>' +
                      '<p class="text-gray-700 mt-1 text-xs leading-relaxed">' + (exp.description || '') + '</p>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400">暂无工作经历</p>') +
                '</div>' +

                '<div class="bg-purple-50 p-4 rounded-lg">' +
                  '<h3 class="font-bold text-base mb-2 text-purple-900">项目经历</h3>' +
                  (resume.projects?.length > 0 ? resume.projects.map(proj =>
                    '<div class="mb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium text-gray-800">' + proj.name + '</span>' +
                        '<span class="text-gray-600 text-xs">' + proj.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600 text-xs">' + proj.role + '</div>' +
                      '<p class="text-gray-700 mt-1 text-xs leading-relaxed">' + (proj.description || '') + '</p>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400">暂无项目经历</p>') +
                '</div>' +

                '<div class="bg-yellow-50 p-4 rounded-lg">' +
                  '<h3 class="font-bold text-base mb-2 text-yellow-900">专业技能</h3>' +
                  '<div class="flex flex-wrap gap-1">' +
                    (resume.skills?.length > 0 ? resume.skills.map(skill =>
                      '<span class="px-2 py-1 bg-yellow-200 text-yellow-900 rounded text-xs">' + skill + '</span>'
                    ).join('') : '<p class="text-gray-400">暂无技能</p>') +
                  '</div>' +
                '</div>' +
              '</div>';
            }

            // 时间线模板（简化版）
            function renderTimelineTemplate(resume) {
              return '<div class="space-y-4 text-sm">' +
                '<div class="text-center border-b-2 border-blue-500 pb-4">' +
                  '<h1 class="text-2xl font-bold text-gray-900">' + (resume.basic_info?.name || '未命名') + '</h1>' +
                  '<p class="text-gray-600 mt-1">' + (resume.basic_info?.contact || '') + '</p>' +
                  '<p class="text-blue-600 font-medium">' + (resume.basic_info?.target_position || '') + '</p>' +
                '</div>' +

                '<div>' +
                  '<h3 class="font-bold text-base mb-3 text-gray-800 flex items-center">' +
                    '<span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>教育背景' +
                  '</h3>' +
                  (resume.education?.length > 0 ? resume.education.map(edu =>
                    '<div class="ml-4 border-l-2 border-gray-300 pl-4 pb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium">' + edu.school + '</span>' +
                        '<span class="text-xs text-gray-500">' + edu.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600 text-xs">' + edu.major + ' · ' + edu.degree + '</div>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400 ml-4">暂无教育背景</p>') +
                '</div>' +

                '<div>' +
                  '<h3 class="font-bold text-base mb-3 text-gray-800 flex items-center">' +
                    '<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>工作经历' +
                  '</h3>' +
                  (resume.work_experience?.length > 0 ? resume.work_experience.map(exp =>
                    '<div class="ml-4 border-l-2 border-gray-300 pl-4 pb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium">' + exp.position + '</span>' +
                        '<span class="text-xs text-gray-500">' + exp.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600 text-xs">' + exp.company + '</div>' +
                      '<p class="text-gray-700 mt-1 text-xs leading-relaxed">' + (exp.description || '') + '</p>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400 ml-4">暂无工作经历</p>') +
                '</div>' +

                '<div>' +
                  '<h3 class="font-bold text-base mb-3 text-gray-800 flex items-center">' +
                    '<span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>项目经历' +
                  '</h3>' +
                  (resume.projects?.length > 0 ? resume.projects.map(proj =>
                    '<div class="ml-4 border-l-2 border-gray-300 pl-4 pb-3">' +
                      '<div class="flex justify-between">' +
                        '<span class="font-medium">' + proj.name + '</span>' +
                        '<span class="text-xs text-gray-500">' + proj.duration + '</span>' +
                      '</div>' +
                      '<div class="text-gray-600 text-xs">' + proj.role + '</div>' +
                      '<p class="text-gray-700 mt-1 text-xs leading-relaxed">' + (proj.description || '') + '</p>' +
                    '</div>'
                  ).join('') : '<p class="text-gray-400 ml-4">暂无项目经历</p>') +
                '</div>' +

                '<div>' +
                  '<h3 class="font-bold text-base mb-3 text-gray-800 flex items-center">' +
                    '<span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>专业技能' +
                  '</h3>' +
                  '<div class="ml-4 flex flex-wrap gap-1">' +
                    (resume.skills?.length > 0 ? resume.skills.map(skill =>
                      '<span class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">' + skill + '</span>'
                    ).join('') : '<p class="text-gray-400">暂无技能</p>') +
                  '</div>' +
                '</div>' +
              '</div>';
            }

            // 标记数据已修改
            function markDirty() {
              isDirty = true;
              const status = document.getElementById('save-status');
              status.textContent = '未保存';
              status.className = 'text-sm text-orange-500';
            }

            // 保存简历
            document.getElementById('save-btn')?.addEventListener('click', function() {
              try {
                const resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
                const index = resumes.findIndex(r => r.id === resumeId);
                
                if (index === -1) {
                  throw new Error('简历不存在');
                }

                resume.updated_at = new Date().toISOString();
                resumes[index] = resume;
                localStorage.setItem('jobcopilot_resumes', JSON.stringify(resumes));

                isDirty = false;
                const status = document.getElementById('save-status');
                status.textContent = '已保存';
                status.className = 'text-sm text-green-500';

                setTimeout(() => {
                  status.className = 'text-sm text-gray-500';
                }, 2000);
              } catch (error) {
                alert('保存失败：' + error.message);
              }
            });

            // 导出 PDF
            document.getElementById('export-pdf-btn')?.addEventListener('click', async function() {
              const btn = this;
              const originalText = btn.innerHTML;
              btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>生成中...';
              btn.disabled = true;

              try {
                const previewElement = document.getElementById('preview-container');
                const options = {
                  margin: [10, 10, 10, 10],
                  filename: (resume.basic_info?.name || '简历') + '.pdf',
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                  },
                  jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                  },
                  pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy']
                  }
                };

                await html2pdf().from(previewElement).set(options).save();
                alert('PDF 导出成功！');
              } catch (error) {
                alert('PDF 导出失败：' + error.message);
              } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
              }
            });

            // 模板切换
            document.getElementById('template-selector')?.addEventListener('change', function() {
              renderPreview(resume);
            });

            // 监听页面关闭
            window.addEventListener('beforeunload', function(e) {
              if (isDirty) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
                return e.returnValue;
              }
            });

            // 初始化
            loadResume();
          })();
        `
      }} />
    </div>,
    { title: '编辑简历 - Job Copilot' }
  )
})

// 简历版本历史页
app.get('/resume/:id/versions', (c) => {
  const resumeId = c.req.param('id')
  
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* 面包屑 */}
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" class="hover:text-gray-700"><i class="fas fa-home"></i></a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <a href="/resumes" class="hover:text-gray-700">简历库</a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <a href={`/resume/${resumeId}`} id="resume-link" class="hover:text-gray-700">简历详情</a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <span class="text-gray-900 font-medium">版本历史</span>
        </nav>

        {/* 标题 */}
        <div class="mb-6">
          <h1 class="text-2xl font-bold">版本历史</h1>
          <p id="versions-count" class="text-sm text-gray-500 mt-1">共 0 个版本</p>
        </div>

        {/* 版本列表 */}
        <div id="versions-list" class="space-y-4">
          {/* 加载状态 */}
          <div class="text-center py-12">
            <i class="fas fa-spinner loading-spinner text-3xl text-gray-400 mb-4"></i>
            <p class="text-gray-500">加载中...</p>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var resumeId = '${resumeId}';
            var versionsList = document.getElementById('versions-list');
            var versionsCount = document.getElementById('versions-count');
            var resumeLink = document.getElementById('resume-link');
            
            var resumes = JSON.parse(localStorage.getItem('jobcopilot_resumes') || '[]');
            var versions = JSON.parse(localStorage.getItem('jobcopilot_resume_versions') || '[]');
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            
            var resume = resumes.find(function(r) { return r.id === resumeId; });
            if (resume) {
              resumeLink.textContent = resume.name || resume.basic_info?.name || '简历详情';
            }
            
            var resumeVersions = versions.filter(function(v) { return v.resume_id === resumeId; });
            resumeVersions.sort(function(a, b) { return b.version - a.version; });
            
            versionsCount.textContent = '共 ' + resumeVersions.length + ' 个版本';
            
            if (resumeVersions.length === 0) {
              versionsList.innerHTML = '<div class="text-center py-12 bg-gray-50 rounded-xl">' +
                '<i class="fas fa-history text-3xl text-gray-300 mb-4"></i>' +
                '<p class="text-gray-500">暂无版本记录</p>' +
              '</div>';
              return;
            }
            
            function formatDate(dateStr) {
              if (!dateStr) return '';
              var date = new Date(dateStr);
              return date.toLocaleString('zh-CN', { 
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
            
            function getJobTitle(jobId) {
              if (!jobId) return null;
              var job = jobs.find(function(j) { return j.id === jobId; });
              return job ? job.title : null;
            }
            
            versionsList.innerHTML = resumeVersions.map(function(version, index) {
              var isLatest = index === 0;
              var linkedJob = getJobTitle(version.linked_jd_id);
              var createdByText = {
                'manual': '手动保存',
                'auto': '自动保存',
                'agent': 'AI生成'
              }[version.created_by] || '未知';
              
              return '<div class="border border-gray-200 rounded-xl p-4 ' + (isLatest ? 'border-blue-300 bg-blue-50/30' : '') + '">' +
                '<div class="flex items-start justify-between">' +
                  '<div class="flex-1">' +
                    '<div class="flex items-center gap-2 mb-2">' +
                      '<span class="font-semibold">v' + version.version + '</span>' +
                      (isLatest ? '<span class="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">最新</span>' : '') +
                      (version.version_tag ? '<span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">' + version.version_tag + '</span>' : '') +
                      '<span class="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">' + createdByText + '</span>' +
                    '</div>' +
                    (version.changes_summary ? '<p class="text-sm text-gray-600 mb-2">' + version.changes_summary + '</p>' : '') +
                    (linkedJob ? 
                      '<p class="text-xs text-purple-600"><i class="fas fa-link mr-1"></i>定向岗位: ' + linkedJob + '</p>' : '') +
                  '</div>' +
                  '<div class="text-right">' +
                    '<p class="text-xs text-gray-400">' + formatDate(version.created_at) + '</p>' +
                  '</div>' +
                '</div>' +
              '</div>';
            }).join('');
          });
        `
      }} />
    </div>,
    { title: '版本历史 - Job Copilot' }
  )
})

// ==================== 面试题库页面（Phase 8 新增） ====================

// 面试题库列表页
app.get('/questions', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
              <a href="/questions" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-question-circle mr-1.5"></i><span class="hidden sm:inline">题库</span>
              </a>
            </nav>
            <a href="/questions/new" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
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
          <span class="text-gray-900 font-medium">面试题库</span>
        </nav>

        {/* 标题和统计 */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">面试题库</h1>
            <p id="questions-stats" class="text-sm text-gray-500 mt-1">共 0 道题目</p>
          </div>
          <div class="flex gap-2">
            <a href="/questions/import" class="px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              <i class="fas fa-file-import mr-1"></i>批量导入
            </a>
            <a href="/questions/new" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
              <i class="fas fa-plus mr-1"></i>添加题目
            </a>
          </div>
        </div>

        {/* 筛选条件 */}
        <div class="flex flex-wrap gap-4 mb-6">
          {/* 分类筛选 */}
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">分类:</span>
            <select id="filter-category" class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              <option value="">全部</option>
              <option value="自我介绍">自我介绍</option>
              <option value="项目经历">项目经历</option>
              <option value="专业能力">专业能力</option>
              <option value="行为面试">行为面试</option>
              <option value="情景模拟">情景模拟</option>
              <option value="职业规划">职业规划</option>
              <option value="反问环节">反问环节</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          {/* 来源筛选 */}
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">来源:</span>
            <select id="filter-source" class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              <option value="">全部</option>
              <option value="manual">手动添加</option>
              <option value="agent">AI生成</option>
              <option value="review">复盘总结</option>
            </select>
          </div>
          
          {/* 搜索 */}
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input type="text" id="search-input" placeholder="搜索题目..." 
                class="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* 分类统计卡片 */}
        <div id="category-stats" class="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
          {/* 由 JS 动态渲染 */}
        </div>

        {/* 题目列表 */}
        <div id="questions-list" class="space-y-3">
          {/* 骨架屏 */}
          <div class="p-4 border border-gray-200 rounded-xl">
            <div class="skeleton h-5 w-2/3 mb-3"></div>
            <div class="flex gap-2">
              <div class="skeleton h-6 w-16 rounded-full"></div>
              <div class="skeleton h-6 w-20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 空状态 */}
        <div id="empty-state" class="hidden text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-question-circle text-2xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无题目</h3>
          <p class="text-gray-500 mb-4">添加面试题目开始练习</p>
          <a href="/questions/new" class="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            <i class="fas fa-plus mr-2"></i>添加题目
          </a>
        </div>
      </main>

      {/* 页脚 */}
      <footer class="border-t border-gray-100 mt-auto">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>Job Copilot v0.9.0 - Phase 8 面试题库</span>
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var questionsList = document.getElementById('questions-list');
            var emptyState = document.getElementById('empty-state');
            var statsText = document.getElementById('questions-stats');
            var categoryStats = document.getElementById('category-stats');
            var filterCategory = document.getElementById('filter-category');
            var filterSource = document.getElementById('filter-source');
            var searchInput = document.getElementById('search-input');
            
            var questions = JSON.parse(localStorage.getItem('jobcopilot_questions') || '[]');
            var answers = JSON.parse(localStorage.getItem('jobcopilot_answers') || '[]');
            
            // 分类颜色映射
            var categoryColors = {
              '自我介绍': 'bg-blue-100 text-blue-700',
              '项目经历': 'bg-purple-100 text-purple-700',
              '专业能力': 'bg-green-100 text-green-700',
              '行为面试': 'bg-yellow-100 text-yellow-700',
              '情景模拟': 'bg-orange-100 text-orange-700',
              '职业规划': 'bg-pink-100 text-pink-700',
              '反问环节': 'bg-cyan-100 text-cyan-700',
              '其他': 'bg-gray-100 text-gray-700'
            };
            
            var difficultyLabels = {
              'easy': { text: '简单', color: 'bg-green-100 text-green-600' },
              'medium': { text: '中等', color: 'bg-yellow-100 text-yellow-600' },
              'hard': { text: '困难', color: 'bg-red-100 text-red-600' }
            };
            
            function render() {
              var filtered = questions.slice();
              
              // 筛选
              var category = filterCategory.value;
              var source = filterSource.value;
              var search = searchInput.value.toLowerCase().trim();
              
              if (category) {
                filtered = filtered.filter(function(q) { return q.category === category; });
              }
              if (source) {
                filtered = filtered.filter(function(q) { return q.source === source; });
              }
              if (search) {
                filtered = filtered.filter(function(q) {
                  return q.question.toLowerCase().includes(search) ||
                    (q.tags || []).some(function(t) { return t.toLowerCase().includes(search); });
                });
              }
              
              // 按更新时间倒序
              filtered.sort(function(a, b) { 
                return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at); 
              });
              
              statsText.textContent = '共 ' + questions.length + ' 道题目' + 
                (filtered.length !== questions.length ? '，已筛选 ' + filtered.length + ' 道' : '');
              
              if (questions.length === 0) {
                questionsList.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
              }
              
              emptyState.classList.add('hidden');
              
              // 渲染分类统计
              var catCounts = {};
              questions.forEach(function(q) {
                catCounts[q.category] = (catCounts[q.category] || 0) + 1;
              });
              
              categoryStats.innerHTML = Object.keys(categoryColors).map(function(cat) {
                var count = catCounts[cat] || 0;
                var isActive = category === cat;
                return '<button data-category="' + cat + '" class="px-3 py-2 rounded-lg text-xs font-medium transition-colors ' +
                  (isActive ? categoryColors[cat] + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-50 text-gray-600 hover:bg-gray-100') + '">' +
                  cat + ' <span class="ml-1">(' + count + ')</span></button>';
              }).join('');
              
              // 绑定分类点击
              categoryStats.querySelectorAll('button').forEach(function(btn) {
                btn.onclick = function() {
                  var cat = btn.dataset.category;
                  filterCategory.value = filterCategory.value === cat ? '' : cat;
                  render();
                };
              });
              
              // 渲染题目列表
              questionsList.innerHTML = filtered.map(function(q) {
                var hasAnswer = answers.some(function(a) { return a.question_id === q.id && a.is_current; });
                var catColor = categoryColors[q.category] || 'bg-gray-100 text-gray-700';
                var diff = difficultyLabels[q.difficulty] || difficultyLabels['medium'];
                
                return '<a href="/questions/' + q.id + '" class="block p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all">' +
                  '<div class="flex items-start justify-between gap-4">' +
                    '<div class="flex-1">' +
                      '<h3 class="font-medium text-gray-900 mb-2 line-clamp-2">' + q.question + '</h3>' +
                      '<div class="flex flex-wrap gap-2">' +
                        '<span class="px-2 py-0.5 text-xs rounded-full ' + catColor + '">' + q.category + '</span>' +
                        '<span class="px-2 py-0.5 text-xs rounded-full ' + diff.color + '">' + diff.text + '</span>' +
                        (q.has_ai_feedback ? '<span class="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600"><i class="fas fa-robot mr-1"></i>已点评</span>' : '') +
                        (hasAnswer ? '<span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600"><i class="fas fa-check mr-1"></i>已回答</span>' : '') +
                        (q.linked_jd_title ? '<span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600"><i class="fas fa-link mr-1"></i>' + q.linked_jd_title + '</span>' : '') +
                      '</div>' +
                    '</div>' +
                    '<div class="text-gray-400">' +
                      '<i class="fas fa-chevron-right"></i>' +
                    '</div>' +
                  '</div>' +
                '</a>';
              }).join('');
            }
            
            // 监听筛选变化
            filterCategory.onchange = render;
            filterSource.onchange = render;
            searchInput.oninput = render;
            
            render();
          });
        `
      }} />
    </div>,
    { title: '面试题库 - Job Copilot' }
  )
})

// 新建题目页
app.get('/questions/new', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/questions" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <i class="fas fa-arrow-left"></i>
              <span>返回题库</span>
            </a>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <h1 class="text-2xl font-bold mb-6">添加面试题目</h1>

        <form id="question-form" class="space-y-6">
          {/* 题目内容 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">题目内容 *</label>
            <textarea id="question-content" rows={3} required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入面试题目..."></textarea>
          </div>

          {/* 分类 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
            <select id="question-category" required
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">请选择分类</option>
              <option value="自我介绍">自我介绍</option>
              <option value="项目经历">项目经历</option>
              <option value="专业能力">专业能力</option>
              <option value="行为面试">行为面试</option>
              <option value="情景模拟">情景模拟</option>
              <option value="职业规划">职业规划</option>
              <option value="反问环节">反问环节</option>
              <option value="其他">其他</option>
            </select>
          </div>

          {/* 难度 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">难度</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="difficulty" value="easy" class="text-blue-500" />
                <span class="px-2 py-1 text-sm bg-green-100 text-green-600 rounded">简单</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="difficulty" value="medium" checked class="text-blue-500" />
                <span class="px-2 py-1 text-sm bg-yellow-100 text-yellow-600 rounded">中等</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="difficulty" value="hard" class="text-blue-500" />
                <span class="px-2 py-1 text-sm bg-red-100 text-red-600 rounded">困难</span>
              </label>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
            <input type="text" id="question-tags" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如: Java, 数据库, 系统设计" />
          </div>

          {/* 关联岗位 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">关联岗位（可选）</label>
            <select id="question-job" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">不关联岗位</option>
              {/* 由 JS 动态填充 */}
            </select>
          </div>

          {/* 提交按钮 */}
          <div class="flex gap-4">
            <a href="/questions" class="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
              取消
            </a>
            <button type="submit" class="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800">
              <i class="fas fa-plus mr-2"></i>添加题目
            </button>
          </div>
        </form>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var form = document.getElementById('question-form');
            var jobSelect = document.getElementById('question-job');
            
            // 加载岗位列表
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            jobs.filter(function(j) { return j.status === 'completed'; }).forEach(function(job) {
              var option = document.createElement('option');
              option.value = job.id;
              option.textContent = job.title + (job.company ? ' @ ' + job.company : '');
              option.dataset.title = job.title;
              jobSelect.appendChild(option);
            });
            
            form.onsubmit = function(e) {
              e.preventDefault();
              
              var content = document.getElementById('question-content').value.trim();
              var category = document.getElementById('question-category').value;
              var difficulty = document.querySelector('input[name="difficulty"]:checked').value;
              var tags = document.getElementById('question-tags').value.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
              var jobId = jobSelect.value;
              var jobTitle = jobId ? jobSelect.options[jobSelect.selectedIndex].dataset.title : '';
              
              var questions = JSON.parse(localStorage.getItem('jobcopilot_questions') || '[]');
              
              var newQuestion = {
                id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                question: content,
                category: category,
                difficulty: difficulty,
                tags: tags,
                source: 'manual',
                linked_jd_id: jobId || undefined,
                linked_jd_title: jobTitle || undefined,
                answer_count: 0,
                has_ai_feedback: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              questions.unshift(newQuestion);
              localStorage.setItem('jobcopilot_questions', JSON.stringify(questions));
              
              window.location.href = '/questions/' + newQuestion.id;
            };
          });
        `
      }} />
    </div>,
    { title: '添加题目 - Job Copilot' }
  )
})

// 题目详情页
app.get('/questions/:id', (c) => {
  const questionId = c.req.param('id')
  
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/questions" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <i class="fas fa-arrow-left"></i>
              <span>返回题库</span>
            </a>
            <button id="delete-btn" class="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
              <i class="fas fa-trash mr-1"></i>删除
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* 题目信息 */}
        <div id="question-info" class="mb-8">
          <div class="skeleton h-8 w-3/4 mb-4"></div>
          <div class="flex gap-2">
            <div class="skeleton h-6 w-20 rounded-full"></div>
            <div class="skeleton h-6 w-16 rounded-full"></div>
          </div>
        </div>

        {/* 回答区域 */}
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">我的回答</h2>
            <div class="flex gap-2">
              <button id="show-versions" class="text-sm text-gray-500 hover:text-gray-700">
                <i class="fas fa-history mr-1"></i>版本历史 (<span id="version-count">0</span>)
              </button>
            </div>
          </div>
          
          <textarea id="answer-content" rows={8}
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            placeholder="在此输入你的回答...可以使用 PREP/STAR 结构组织回答"></textarea>
          
          <div class="flex items-center justify-between mt-4">
            <div class="flex gap-2">
              <button id="save-answer" class="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
                <i class="fas fa-save mr-1"></i>保存回答
              </button>
              <button id="get-feedback" class="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg text-sm hover:bg-purple-50">
                <i class="fas fa-robot mr-1"></i>AI 点评
              </button>
            </div>
            <span id="save-status" class="text-sm text-gray-400"></span>
          </div>
        </div>

        {/* AI 反馈区域 */}
        <div id="feedback-section" class="hidden">
          <h2 class="text-lg font-semibold mb-4">
            <i class="fas fa-robot text-purple-500 mr-2"></i>AI 教练点评
          </h2>
          
          <div id="feedback-loading" class="hidden text-center py-8">
            <i class="fas fa-spinner loading-spinner text-3xl text-purple-400 mb-4"></i>
            <p class="text-gray-500">AI 正在分析你的回答...</p>
          </div>
          
          <div id="feedback-content" class="space-y-4">
            {/* 评分 */}
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">整体评分</span>
                <div class="flex items-center gap-2">
                  <span id="overall-score" class="text-3xl font-bold text-purple-600">-</span>
                  <span class="text-gray-400">/10</span>
                </div>
              </div>
              <p id="improvement-direction" class="text-sm text-gray-600 mt-2"></p>
            </div>
            
            {/* 必改项 */}
            <div id="must-fix-section" class="hidden">
              <h3 class="font-medium text-red-600 mb-2"><i class="fas fa-exclamation-circle mr-2"></i>必改项</h3>
              <ul id="must-fix-list" class="space-y-2 text-sm"></ul>
            </div>
            
            {/* 亮点 */}
            <div id="highlights-section" class="hidden">
              <h3 class="font-medium text-green-600 mb-2"><i class="fas fa-star mr-2"></i>亮点</h3>
              <ul id="highlights-list" class="space-y-2 text-sm"></ul>
            </div>
            
            {/* 优化建议 */}
            <div id="suggestions-section" class="hidden">
              <h3 class="font-medium text-yellow-600 mb-2"><i class="fas fa-lightbulb mr-2"></i>优化建议</h3>
              <ul id="suggestions-list" class="space-y-2 text-sm"></ul>
            </div>
            
            {/* 表达润色 */}
            <div id="polish-section" class="hidden">
              <h3 class="font-medium text-blue-600 mb-2"><i class="fas fa-magic mr-2"></i>表达润色</h3>
              <ul id="polish-list" class="space-y-2 text-sm"></ul>
            </div>
            
            {/* 优化后的回答 */}
            <div id="improved-answer-section" class="hidden">
              <h3 class="font-medium text-purple-600 mb-2"><i class="fas fa-wand-magic-sparkles mr-2"></i>建议回答</h3>
              <div id="improved-answer" class="bg-purple-50 rounded-xl p-4 text-sm whitespace-pre-wrap"></div>
              <button id="apply-improved" class="mt-2 text-sm text-purple-600 hover:text-purple-800">
                <i class="fas fa-copy mr-1"></i>使用此回答
              </button>
            </div>
          </div>
        </div>

        {/* 版本历史弹窗 */}
        <div id="versions-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden mx-4">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="font-semibold">回答历史版本</h3>
              <button id="close-versions" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div id="versions-list" class="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {/* 由 JS 渲染 */}
            </div>
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var questionId = '${questionId}';
            var questions = JSON.parse(localStorage.getItem('jobcopilot_questions') || '[]');
            var answers = JSON.parse(localStorage.getItem('jobcopilot_answers') || '[]');
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            
            var question = questions.find(function(q) { return q.id === questionId; });
            if (!question) {
              document.getElementById('question-info').innerHTML = '<p class="text-red-500">题目不存在</p>';
              return;
            }
            
            var categoryColors = {
              '自我介绍': 'bg-blue-100 text-blue-700',
              '项目经历': 'bg-purple-100 text-purple-700',
              '专业能力': 'bg-green-100 text-green-700',
              '行为面试': 'bg-yellow-100 text-yellow-700',
              '情景模拟': 'bg-orange-100 text-orange-700',
              '职业规划': 'bg-pink-100 text-pink-700',
              '反问环节': 'bg-cyan-100 text-cyan-700',
              '其他': 'bg-gray-100 text-gray-700'
            };
            
            // 渲染题目信息
            var catColor = categoryColors[question.category] || 'bg-gray-100 text-gray-700';
            document.getElementById('question-info').innerHTML = 
              '<h1 class="text-xl font-bold mb-4">' + question.question + '</h1>' +
              '<div class="flex flex-wrap gap-2">' +
                '<span class="px-3 py-1 text-sm rounded-full ' + catColor + '">' + question.category + '</span>' +
                (question.linked_jd_title ? '<span class="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600"><i class="fas fa-link mr-1"></i>' + question.linked_jd_title + '</span>' : '') +
                (question.tags || []).map(function(t) { return '<span class="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">' + t + '</span>'; }).join('') +
              '</div>';
            
            // 加载当前回答
            var answerContent = document.getElementById('answer-content');
            var questionAnswers = answers.filter(function(a) { return a.question_id === questionId; });
            questionAnswers.sort(function(a, b) { return b.version - a.version; });
            var currentAnswer = questionAnswers.find(function(a) { return a.is_current; });
            
            document.getElementById('version-count').textContent = questionAnswers.length;
            
            if (currentAnswer) {
              answerContent.value = currentAnswer.content;
              
              // 如果有 AI 反馈，显示
              if (currentAnswer.ai_feedback) {
                showFeedback(currentAnswer.ai_feedback);
              }
            }
            
            // 保存回答
            document.getElementById('save-answer').onclick = function() {
              var content = answerContent.value.trim();
              if (!content) {
                alert('请输入回答内容');
                return;
              }
              
              // 更新之前的当前版本
              answers.forEach(function(a) {
                if (a.question_id === questionId && a.is_current) {
                  a.is_current = false;
                }
              });
              
              var latestVersion = questionAnswers.length > 0 ? questionAnswers[0].version : 0;
              
              var newAnswer = {
                id: 'ans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                question_id: questionId,
                content: content,
                version: latestVersion + 1,
                is_current: true,
                created_at: new Date().toISOString()
              };
              
              answers.unshift(newAnswer);
              localStorage.setItem('jobcopilot_answers', JSON.stringify(answers));
              
              // 更新题目的回答计数
              question.answer_count = (question.answer_count || 0) + 1;
              question.updated_at = new Date().toISOString();
              localStorage.setItem('jobcopilot_questions', JSON.stringify(questions));
              
              questionAnswers.unshift(newAnswer);
              currentAnswer = newAnswer;
              document.getElementById('version-count').textContent = questionAnswers.length;
              document.getElementById('save-status').textContent = '已保存 v' + newAnswer.version;
              
              setTimeout(function() {
                document.getElementById('save-status').textContent = '';
              }, 3000);
            };
            
            // AI 点评
            document.getElementById('get-feedback').onclick = async function() {
              var content = answerContent.value.trim();
              if (!content) {
                alert('请先输入回答内容');
                return;
              }
              
              // 先保存
              document.getElementById('save-answer').click();
              
              document.getElementById('feedback-section').classList.remove('hidden');
              document.getElementById('feedback-loading').classList.remove('hidden');
              document.getElementById('feedback-content').classList.add('hidden');
              
              try {
                // 获取关联岗位信息
                var jobContext = null;
                if (question.linked_jd_id) {
                  var job = jobs.find(function(j) { return j.id === question.linked_jd_id; });
                  if (job && job.structured_jd) {
                    jobContext = {
                      title: job.title || job.structured_jd.title,
                      company: job.company || job.structured_jd.company,
                      requirements: job.structured_jd.requirements || []
                    };
                  }
                }
                
                var response = await fetch('/api/questions/' + questionId + '/feedback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    answer_id: currentAnswer?.id,
                    mode: jobContext ? 'jd_based' : 'general',
                    job_context: jobContext
                  })
                });
                
                var data = await response.json();
                
                if (data.success) {
                  // 更新本地数据
                  if (currentAnswer) {
                    currentAnswer.ai_feedback = data.feedback;
                    currentAnswer.feedback_requested_at = new Date().toISOString();
                    localStorage.setItem('jobcopilot_answers', JSON.stringify(answers));
                    
                    question.has_ai_feedback = true;
                    localStorage.setItem('jobcopilot_questions', JSON.stringify(questions));
                  }
                  
                  showFeedback(data.feedback, data.improved_answer);
                } else {
                  alert('获取 AI 点评失败: ' + data.error);
                }
              } catch (err) {
                alert('请求失败: ' + err.message);
              }
              
              document.getElementById('feedback-loading').classList.add('hidden');
              document.getElementById('feedback-content').classList.remove('hidden');
            };
            
            function showFeedback(feedback, improvedAnswer) {
              document.getElementById('feedback-section').classList.remove('hidden');
              document.getElementById('feedback-content').classList.remove('hidden');
              document.getElementById('feedback-loading').classList.add('hidden');
              
              document.getElementById('overall-score').textContent = feedback.overall_score || '-';
              document.getElementById('improvement-direction').textContent = feedback.improvement_direction || '';
              
              // 必改项
              var mustFixSection = document.getElementById('must-fix-section');
              var mustFixList = document.getElementById('must-fix-list');
              if (feedback.must_fix && feedback.must_fix.length > 0) {
                mustFixSection.classList.remove('hidden');
                mustFixList.innerHTML = feedback.must_fix.map(function(item) {
                  return '<li class="bg-red-50 p-3 rounded-lg text-red-700">' + item + '</li>';
                }).join('');
              } else {
                mustFixSection.classList.add('hidden');
              }
              
              // 亮点
              var highlightsSection = document.getElementById('highlights-section');
              var highlightsList = document.getElementById('highlights-list');
              if (feedback.highlights && feedback.highlights.length > 0) {
                highlightsSection.classList.remove('hidden');
                highlightsList.innerHTML = feedback.highlights.map(function(item) {
                  return '<li class="bg-green-50 p-3 rounded-lg text-green-700">' + item + '</li>';
                }).join('');
              } else {
                highlightsSection.classList.add('hidden');
              }
              
              // 优化建议
              var suggestionsSection = document.getElementById('suggestions-section');
              var suggestionsList = document.getElementById('suggestions-list');
              if (feedback.suggestions && feedback.suggestions.length > 0) {
                suggestionsSection.classList.remove('hidden');
                suggestionsList.innerHTML = feedback.suggestions.map(function(item) {
                  return '<li class="bg-yellow-50 p-3 rounded-lg text-yellow-700">' + item + '</li>';
                }).join('');
              } else {
                suggestionsSection.classList.add('hidden');
              }
              
              // 表达润色
              var polishSection = document.getElementById('polish-section');
              var polishList = document.getElementById('polish-list');
              if (feedback.polish && feedback.polish.length > 0) {
                polishSection.classList.remove('hidden');
                polishList.innerHTML = feedback.polish.map(function(item) {
                  return '<li class="bg-blue-50 p-3 rounded-lg text-blue-700">' + item + '</li>';
                }).join('');
              } else {
                polishSection.classList.add('hidden');
              }
              
              // 优化后的回答
              var improvedSection = document.getElementById('improved-answer-section');
              var improvedDiv = document.getElementById('improved-answer');
              if (improvedAnswer) {
                improvedSection.classList.remove('hidden');
                improvedDiv.textContent = improvedAnswer;
                
                document.getElementById('apply-improved').onclick = function() {
                  answerContent.value = improvedAnswer;
                  document.getElementById('save-answer').click();
                };
              } else {
                improvedSection.classList.add('hidden');
              }
            }
            
            // 版本历史
            document.getElementById('show-versions').onclick = function() {
              document.getElementById('versions-modal').classList.remove('hidden');
              
              var versionsList = document.getElementById('versions-list');
              versionsList.innerHTML = questionAnswers.map(function(ans) {
                return '<div class="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50" data-id="' + ans.id + '">' +
                  '<div class="flex items-center justify-between mb-2">' +
                    '<span class="font-medium">v' + ans.version + (ans.is_current ? ' <span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">当前</span>' : '') + '</span>' +
                    '<span class="text-xs text-gray-400">' + new Date(ans.created_at).toLocaleString('zh-CN') + '</span>' +
                  '</div>' +
                  '<p class="text-sm text-gray-600 line-clamp-3">' + ans.content + '</p>' +
                '</div>';
              }).join('');
              
              // 点击版本恢复
              versionsList.querySelectorAll('[data-id]').forEach(function(el) {
                el.onclick = function() {
                  var ansId = el.dataset.id;
                  var ans = answers.find(function(a) { return a.id === ansId; });
                  if (ans) {
                    answerContent.value = ans.content;
                    document.getElementById('versions-modal').classList.add('hidden');
                  }
                };
              });
            };
            
            document.getElementById('close-versions').onclick = function() {
              document.getElementById('versions-modal').classList.add('hidden');
            };
            
            // 删除题目
            document.getElementById('delete-btn').onclick = function() {
              if (confirm('确定要删除这道题目吗？相关的回答也会被删除。')) {
                questions = questions.filter(function(q) { return q.id !== questionId; });
                localStorage.setItem('jobcopilot_questions', JSON.stringify(questions));
                
                answers = answers.filter(function(a) { return a.question_id !== questionId; });
                localStorage.setItem('jobcopilot_answers', JSON.stringify(answers));
                
                window.location.href = '/questions';
              }
            };
          });
        `
      }} />
    </div>,
    { title: '题目详情 - Job Copilot' }
  )
})

// 批量导入页面
app.get('/questions/import', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/questions" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <i class="fas fa-arrow-left"></i>
              <span>返回题库</span>
            </a>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <h1 class="text-2xl font-bold mb-2">批量导入题目</h1>
        <p class="text-gray-500 mb-6">支持 JSON 格式批量导入面试题目</p>

        <form id="import-form" class="space-y-6">
          {/* JSON 输入 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">JSON 数据</label>
            <textarea id="import-data" rows={12}
              class="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`[
  {
    "question": "请介绍一下你自己",
    "category": "自我介绍",
    "difficulty": "easy",
    "tags": ["基础", "开场"]
  },
  {
    "question": "介绍一个你最有挑战的项目",
    "category": "项目经历",
    "difficulty": "medium"
  }
]`}></textarea>
          </div>

          {/* 格式说明 */}
          <div class="bg-gray-50 rounded-xl p-4">
            <h3 class="font-medium text-gray-700 mb-2"><i class="fas fa-info-circle mr-2"></i>格式说明</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• <code class="bg-gray-200 px-1 rounded">question</code>: 题目内容（必填）</li>
              <li>• <code class="bg-gray-200 px-1 rounded">category</code>: 分类（自我介绍/项目经历/专业能力/行为面试/情景模拟/职业规划/反问环节/其他）</li>
              <li>• <code class="bg-gray-200 px-1 rounded">difficulty</code>: 难度（easy/medium/hard）</li>
              <li>• <code class="bg-gray-200 px-1 rounded">tags</code>: 标签数组</li>
            </ul>
          </div>

          {/* 关联岗位 */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">关联岗位（可选）</label>
            <select id="import-job" 
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">不关联岗位</option>
            </select>
          </div>

          {/* 提交按钮 */}
          <div class="flex gap-4">
            <a href="/questions" class="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">
              取消
            </a>
            <button type="submit" class="flex-1 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800">
              <i class="fas fa-file-import mr-2"></i>导入
            </button>
          </div>
        </form>

        {/* 导入结果 */}
        <div id="import-result" class="hidden mt-6 p-4 bg-green-50 rounded-xl">
          <p class="text-green-700"><i class="fas fa-check-circle mr-2"></i>成功导入 <span id="import-count">0</span> 道题目</p>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var form = document.getElementById('import-form');
            var jobSelect = document.getElementById('import-job');
            
            // 加载岗位列表
            var jobs = JSON.parse(localStorage.getItem('jobcopilot_jobs') || '[]');
            jobs.filter(function(j) { return j.status === 'completed'; }).forEach(function(job) {
              var option = document.createElement('option');
              option.value = job.id;
              option.textContent = job.title + (job.company ? ' @ ' + job.company : '');
              option.dataset.title = job.title;
              jobSelect.appendChild(option);
            });
            
            form.onsubmit = function(e) {
              e.preventDefault();
              
              var dataStr = document.getElementById('import-data').value.trim();
              var jobId = jobSelect.value;
              var jobTitle = jobId ? jobSelect.options[jobSelect.selectedIndex].dataset.title : '';
              
              try {
                var items = JSON.parse(dataStr);
                if (!Array.isArray(items)) {
                  items = [items];
                }
                
                var questions = JSON.parse(localStorage.getItem('jobcopilot_questions') || '[]');
                var now = new Date().toISOString();
                var count = 0;
                
                items.forEach(function(item) {
                  if (!item.question && !item.q && !item.content) return;
                  
                  var newQuestion = {
                    id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    question: item.question || item.q || item.content,
                    category: item.category || item.type || '其他',
                    difficulty: item.difficulty || item.level || 'medium',
                    tags: item.tags || [],
                    source: 'manual',
                    linked_jd_id: jobId || undefined,
                    linked_jd_title: jobTitle || undefined,
                    answer_count: 0,
                    has_ai_feedback: false,
                    created_at: now,
                    updated_at: now
                  };
                  
                  questions.unshift(newQuestion);
                  count++;
                });
                
                localStorage.setItem('jobcopilot_questions', JSON.stringify(questions));
                
                document.getElementById('import-count').textContent = count;
                document.getElementById('import-result').classList.remove('hidden');
                
                setTimeout(function() {
                  window.location.href = '/questions';
                }, 1500);
                
              } catch (err) {
                alert('JSON 格式错误: ' + err.message);
              }
            };
          });
        `
      }} />
    </div>,
    { title: '批量导入 - Job Copilot' }
  )
})

// ==================== 投递跟踪页面（Phase 9 新增） ====================

// 投递跟踪列表页（看板视图）
app.get('/applications', (c) => {
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
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
              <a href="/resumes" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-folder-open mr-1.5"></i><span class="hidden sm:inline">简历库</span>
              </a>
              <a href="/questions" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <i class="fas fa-question-circle mr-1.5"></i><span class="hidden sm:inline">题库</span>
              </a>
              <a href="/applications" class="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-900">
                <i class="fas fa-paper-plane mr-1.5"></i><span class="hidden sm:inline">投递</span>
              </a>
            </nav>
            <button id="new-application-btn" class="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              <i class="fas fa-plus mr-1"></i><span class="hidden sm:inline">新建</span>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* 面包屑 */}
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <a href="/" class="hover:text-gray-700"><i class="fas fa-home"></i></a>
          <i class="fas fa-chevron-right text-xs text-gray-300"></i>
          <span class="text-gray-900 font-medium">投递跟踪</span>
        </nav>

        {/* 统计卡片 */}
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-white border border-gray-200 rounded-xl p-4">
            <div class="text-sm text-gray-500 mb-1">总投递</div>
            <div class="text-2xl font-bold" id="stat-total">0</div>
            <div class="text-xs text-gray-400 mt-1"><span id="stat-week">0</span> 本周</div>
          </div>
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div class="text-sm text-blue-600 mb-1">筛选中</div>
            <div class="text-2xl font-bold text-blue-700" id="stat-screening">0</div>
          </div>
          <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
            <div class="text-sm text-yellow-600 mb-1">面试中</div>
            <div class="text-2xl font-bold text-yellow-700" id="stat-interview">0</div>
          </div>
          <div class="bg-green-50 border border-green-100 rounded-xl p-4">
            <div class="text-sm text-green-600 mb-1">已获Offer</div>
            <div class="text-2xl font-bold text-green-700" id="stat-offer">0</div>
          </div>
          <div class="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div class="text-sm text-purple-600 mb-1">转化率</div>
            <div class="text-2xl font-bold text-purple-700"><span id="stat-rate">0</span>%</div>
          </div>
        </div>

        {/* 工具栏 */}
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-2">
            <button id="view-kanban" class="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg text-sm">
              <i class="fas fa-columns mr-1"></i>看板
            </button>
            <button id="view-list" class="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
              <i class="fas fa-list mr-1"></i>列表
            </button>
          </div>
          <div class="flex items-center gap-2 flex-1 max-w-md">
            <div class="relative flex-1">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input type="text" id="search-input" placeholder="搜索公司或职位..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <select id="filter-source" class="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">全部渠道</option>
              <option value="Boss直聘">Boss直聘</option>
              <option value="猎聘">猎聘</option>
              <option value="拉勾">拉勾</option>
              <option value="智联招聘">智联招聘</option>
              <option value="官网">官网</option>
              <option value="内推">内推</option>
              <option value="其他">其他</option>
            </select>
            <button id="export-btn" class="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>

        {/* 看板视图 */}
        <div id="kanban-view" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 已投递 */}
          <div class="bg-gray-50 rounded-xl p-3" data-status="applied">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-700">
                <i class="fas fa-paper-plane mr-1.5 text-gray-400"></i>
                已投递 <span class="count text-gray-400">(0)</span>
              </h3>
            </div>
            <div class="space-y-2 cards min-h-[100px]"></div>
          </div>
          
          {/* 筛选中 */}
          <div class="bg-blue-50/50 rounded-xl p-3" data-status="screening">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-blue-700">
                <i class="fas fa-search mr-1.5 text-blue-400"></i>
                筛选中 <span class="count text-blue-400">(0)</span>
              </h3>
            </div>
            <div class="space-y-2 cards min-h-[100px]"></div>
          </div>
          
          {/* 面试中 */}
          <div class="bg-yellow-50/50 rounded-xl p-3" data-status="interview">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-yellow-700">
                <i class="fas fa-user-tie mr-1.5 text-yellow-400"></i>
                面试中 <span class="count text-yellow-400">(0)</span>
              </h3>
            </div>
            <div class="space-y-2 cards min-h-[100px]"></div>
          </div>
          
          {/* 已获Offer */}
          <div class="bg-green-50/50 rounded-xl p-3" data-status="offer">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-green-700">
                <i class="fas fa-trophy mr-1.5 text-green-400"></i>
                Offer <span class="count text-green-400">(0)</span>
              </h3>
            </div>
            <div class="space-y-2 cards min-h-[100px]"></div>
          </div>
          
          {/* 已拒绝 */}
          <div class="bg-red-50/50 rounded-xl p-3" data-status="rejected">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-red-700">
                <i class="fas fa-times-circle mr-1.5 text-red-400"></i>
                已拒 <span class="count text-red-400">(0)</span>
              </h3>
            </div>
            <div class="space-y-2 cards min-h-[100px]"></div>
          </div>
          
          {/* 已撤回 */}
          <div class="bg-gray-100/50 rounded-xl p-3" data-status="withdrawn">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-500">
                <i class="fas fa-undo mr-1.5 text-gray-400"></i>
                已撤 <span class="count text-gray-400">(0)</span>
              </h3>
            </div>
            <div class="space-y-2 cards min-h-[100px]"></div>
          </div>
        </div>

        {/* 列表视图 */}
        <div id="list-view" class="hidden">
          <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">公司/职位</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">渠道</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">投递时间</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody id="list-body" class="divide-y divide-gray-100"></tbody>
            </table>
          </div>
        </div>

        {/* 空状态 */}
        <div id="empty-state" class="hidden text-center py-16">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-paper-plane text-3xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无投递记录</h3>
          <p class="text-gray-500 mb-4">开始记录你的求职投递</p>
          <button id="empty-new-btn" class="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
            <i class="fas fa-plus mr-2"></i>添加投递
          </button>
        </div>
      </main>

      {/* 新建投递弹窗 */}
      <div id="new-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold">新建投递记录</h3>
            <button id="close-modal" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form id="new-form" class="p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">公司名称 *</label>
              <input type="text" id="input-company" required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="如：字节跳动" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">职位名称 *</label>
              <input type="text" id="input-position" required
                class="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="如：产品经理" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">投递渠道</label>
                <select id="input-source" class="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="">请选择</option>
                  <option value="Boss直聘">Boss直聘</option>
                  <option value="猎聘">猎聘</option>
                  <option value="拉勾">拉勾</option>
                  <option value="智联招聘">智联招聘</option>
                  <option value="官网">官网</option>
                  <option value="内推">内推</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">投递日期</label>
                <input type="date" id="input-date" class="w-full px-3 py-2 border border-gray-200 rounded-lg" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">职位链接</label>
              <input type="url" id="input-url"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">薪资范围</label>
              <input type="text" id="input-salary"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="如：25-35K" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea id="input-notes" rows={2}
                class="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="其他备注信息..."></textarea>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" id="cancel-btn" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button type="submit" class="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                <i class="fas fa-plus mr-1"></i>添加
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 页脚 */}
      <footer class="border-t border-gray-100 mt-auto">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="text-sm text-gray-400 text-center">
            Job Copilot v1.0.0 - Phase 9 投递跟踪
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var applications = JSON.parse(localStorage.getItem('jobcopilot_applications') || '[]');
            
            var statusLabels = {
              'applied': '已投递',
              'screening': '筛选中',
              'interview': '面试中',
              'offer': '已获Offer',
              'rejected': '已拒绝',
              'withdrawn': '已撤回'
            };
            
            var statusColors = {
              'applied': 'bg-gray-100 text-gray-600',
              'screening': 'bg-blue-100 text-blue-600',
              'interview': 'bg-yellow-100 text-yellow-600',
              'offer': 'bg-green-100 text-green-600',
              'rejected': 'bg-red-100 text-red-600',
              'withdrawn': 'bg-gray-200 text-gray-500'
            };
            
            function formatDate(dateStr) {
              if (!dateStr) return '';
              var date = new Date(dateStr);
              return (date.getMonth() + 1) + '-' + date.getDate();
            }
            
            function updateStats() {
              var stats = { total: 0, applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 };
              var weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              var weekCount = 0;
              
              applications.forEach(function(app) {
                stats.total++;
                stats[app.status]++;
                if (new Date(app.applied_at) >= weekAgo) weekCount++;
              });
              
              document.getElementById('stat-total').textContent = stats.total;
              document.getElementById('stat-week').textContent = weekCount;
              document.getElementById('stat-screening').textContent = stats.screening;
              document.getElementById('stat-interview').textContent = stats.interview;
              document.getElementById('stat-offer').textContent = stats.offer;
              
              var interviewTotal = stats.interview + stats.offer + stats.rejected;
              var rate = stats.total > 0 ? Math.round((stats.offer / stats.total) * 1000) / 10 : 0;
              document.getElementById('stat-rate').textContent = rate;
            }
            
            function renderKanban() {
              var search = document.getElementById('search-input').value.toLowerCase();
              var source = document.getElementById('filter-source').value;
              
              var filtered = applications.filter(function(app) {
                if (search && !app.company.toLowerCase().includes(search) && !app.position.toLowerCase().includes(search)) return false;
                if (source && app.source !== source) return false;
                return true;
              });
              
              // 清空所有卡片
              document.querySelectorAll('[data-status] .cards').forEach(function(container) {
                container.innerHTML = '';
              });
              
              // 更新计数
              var counts = { applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0, withdrawn: 0 };
              
              filtered.forEach(function(app) {
                counts[app.status]++;
                var container = document.querySelector('[data-status="' + app.status + '"] .cards');
                if (!container) return;
                
                var card = document.createElement('a');
                card.href = '/applications/' + app.id;
                card.className = 'block bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow';
                card.innerHTML = 
                  '<div class="font-medium text-sm text-gray-900 truncate">' + app.company + '</div>' +
                  '<div class="text-xs text-gray-500 truncate mt-0.5">' + app.position + '</div>' +
                  '<div class="flex items-center justify-between mt-2">' +
                    '<span class="text-xs text-gray-400">' + formatDate(app.applied_at) + '</span>' +
                    (app.source ? '<span class="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">' + app.source + '</span>' : '') +
                  '</div>';
                container.appendChild(card);
              });
              
              // 更新计数显示
              Object.keys(counts).forEach(function(status) {
                var countEl = document.querySelector('[data-status="' + status + '"] .count');
                if (countEl) countEl.textContent = '(' + counts[status] + ')';
              });
              
              // 空状态
              var emptyState = document.getElementById('empty-state');
              var kanbanView = document.getElementById('kanban-view');
              if (applications.length === 0) {
                emptyState.classList.remove('hidden');
                kanbanView.classList.add('hidden');
              } else {
                emptyState.classList.add('hidden');
                kanbanView.classList.remove('hidden');
              }
            }
            
            function renderList() {
              var search = document.getElementById('search-input').value.toLowerCase();
              var source = document.getElementById('filter-source').value;
              
              var filtered = applications.filter(function(app) {
                if (search && !app.company.toLowerCase().includes(search) && !app.position.toLowerCase().includes(search)) return false;
                if (source && app.source !== source) return false;
                return true;
              });
              
              var tbody = document.getElementById('list-body');
              tbody.innerHTML = filtered.map(function(app) {
                return '<tr class="hover:bg-gray-50">' +
                  '<td class="px-4 py-3">' +
                    '<a href="/applications/' + app.id + '" class="font-medium text-gray-900 hover:text-blue-600">' + app.company + '</a>' +
                    '<div class="text-sm text-gray-500">' + app.position + '</div>' +
                  '</td>' +
                  '<td class="px-4 py-3">' +
                    '<span class="px-2 py-1 text-xs rounded-full ' + statusColors[app.status] + '">' + statusLabels[app.status] + '</span>' +
                  '</td>' +
                  '<td class="px-4 py-3 text-sm text-gray-500">' + (app.source || '-') + '</td>' +
                  '<td class="px-4 py-3 text-sm text-gray-500">' + formatDate(app.applied_at) + '</td>' +
                  '<td class="px-4 py-3 text-right">' +
                    '<a href="/applications/' + app.id + '" class="text-blue-600 hover:text-blue-800 text-sm">查看</a>' +
                  '</td>' +
                '</tr>';
              }).join('');
            }
            
            function render() {
              updateStats();
              renderKanban();
              renderList();
            }
            
            // 视图切换
            document.getElementById('view-kanban').onclick = function() {
              document.getElementById('kanban-view').classList.remove('hidden');
              document.getElementById('list-view').classList.add('hidden');
              this.classList.add('bg-gray-100', 'text-gray-900');
              this.classList.remove('text-gray-600');
              document.getElementById('view-list').classList.remove('bg-gray-100', 'text-gray-900');
              document.getElementById('view-list').classList.add('text-gray-600');
            };
            
            document.getElementById('view-list').onclick = function() {
              document.getElementById('list-view').classList.remove('hidden');
              document.getElementById('kanban-view').classList.add('hidden');
              this.classList.add('bg-gray-100', 'text-gray-900');
              this.classList.remove('text-gray-600');
              document.getElementById('view-kanban').classList.remove('bg-gray-100', 'text-gray-900');
              document.getElementById('view-kanban').classList.add('text-gray-600');
            };
            
            // 搜索和筛选
            document.getElementById('search-input').oninput = render;
            document.getElementById('filter-source').onchange = render;
            
            // 新建弹窗
            var modal = document.getElementById('new-modal');
            function openModal() { modal.classList.remove('hidden'); }
            function closeModal() { modal.classList.add('hidden'); }
            
            document.getElementById('new-application-btn').onclick = openModal;
            document.getElementById('empty-new-btn').onclick = openModal;
            document.getElementById('close-modal').onclick = closeModal;
            document.getElementById('cancel-btn').onclick = closeModal;
            modal.onclick = function(e) { if (e.target === modal) closeModal(); };
            
            // 设置默认日期
            document.getElementById('input-date').value = new Date().toISOString().slice(0, 10);
            
            // 提交新建
            document.getElementById('new-form').onsubmit = function(e) {
              e.preventDefault();
              
              var newApp = {
                id: 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                company: document.getElementById('input-company').value.trim(),
                position: document.getElementById('input-position').value.trim(),
                source: document.getElementById('input-source').value || undefined,
                applied_at: document.getElementById('input-date').value || new Date().toISOString(),
                job_url: document.getElementById('input-url').value.trim() || undefined,
                salary_range: document.getElementById('input-salary').value.trim() || undefined,
                notes: document.getElementById('input-notes').value.trim() || undefined,
                status: 'applied',
                status_history: [{ status: 'applied', changed_at: new Date().toISOString() }],
                interviews: [],
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              applications.unshift(newApp);
              localStorage.setItem('jobcopilot_applications', JSON.stringify(applications));
              
              closeModal();
              document.getElementById('new-form').reset();
              document.getElementById('input-date').value = new Date().toISOString().slice(0, 10);
              render();
            };
            
            // 导出
            document.getElementById('export-btn').onclick = function() {
              var data = JSON.stringify(applications, null, 2);
              var blob = new Blob([data], { type: 'application/json' });
              var url = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = url;
              a.download = 'applications_' + new Date().toISOString().slice(0, 10) + '.json';
              a.click();
              URL.revokeObjectURL(url);
            };
            
            render();
          });
        `
      }} />
    </div>,
    { title: '投递跟踪 - Job Copilot' }
  )
})

// 投递详情页
app.get('/applications/:id', (c) => {
  const appId = c.req.param('id')
  
  return c.render(
    <div class="min-h-screen bg-white flex flex-col">
      {/* 导航栏 */}
      <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div class="max-w-4xl mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <a href="/applications" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <i class="fas fa-arrow-left"></i>
              <span>返回列表</span>
            </a>
            <button id="delete-btn" class="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm">
              <i class="fas fa-trash mr-1"></i>删除
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* 基础信息 */}
        <div id="app-header" class="mb-8">
          <div class="skeleton h-8 w-1/2 mb-2"></div>
          <div class="skeleton h-6 w-1/3"></div>
        </div>

        {/* 状态更新 */}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-4">投递状态</h2>
          <div class="flex flex-wrap gap-2" id="status-buttons">
            <button data-status="applied" class="px-4 py-2 rounded-lg border text-sm status-btn">
              <i class="fas fa-paper-plane mr-1"></i>已投递
            </button>
            <button data-status="screening" class="px-4 py-2 rounded-lg border text-sm status-btn">
              <i class="fas fa-search mr-1"></i>筛选中
            </button>
            <button data-status="interview" class="px-4 py-2 rounded-lg border text-sm status-btn">
              <i class="fas fa-user-tie mr-1"></i>面试中
            </button>
            <button data-status="offer" class="px-4 py-2 rounded-lg border text-sm status-btn">
              <i class="fas fa-trophy mr-1"></i>已获Offer
            </button>
            <button data-status="rejected" class="px-4 py-2 rounded-lg border text-sm status-btn">
              <i class="fas fa-times-circle mr-1"></i>已拒绝
            </button>
            <button data-status="withdrawn" class="px-4 py-2 rounded-lg border text-sm status-btn">
              <i class="fas fa-undo mr-1"></i>已撤回
            </button>
          </div>
        </div>

        {/* 面试记录 */}
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">面试记录</h2>
            <button id="add-interview-btn" class="px-3 py-1.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800">
              <i class="fas fa-plus mr-1"></i>添加面试
            </button>
          </div>
          <div id="interviews-list" class="space-y-3">
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-calendar-alt text-2xl mb-2"></i>
              <p>暂无面试记录</p>
            </div>
          </div>
        </div>

        {/* 状态历史 */}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-4">状态历史</h2>
          <div id="status-history" class="space-y-2"></div>
        </div>

        {/* 备注 */}
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-4">备注</h2>
          <textarea id="notes-input" rows={4}
            class="w-full px-4 py-3 border border-gray-200 rounded-xl resize-y"
            placeholder="添加备注..."></textarea>
          <button id="save-notes" class="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            保存备注
          </button>
        </div>
      </main>

      {/* 添加面试弹窗 */}
      <div id="interview-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold">添加面试记录</h3>
            <button id="close-interview-modal" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form id="interview-form" class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">面试轮次 *</label>
                <select id="interview-round" required class="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="1">一面</option>
                  <option value="2">二面</option>
                  <option value="3">三面</option>
                  <option value="4">四面</option>
                  <option value="5">HR面</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">面试类型 *</label>
                <select id="interview-type" required class="w-full px-3 py-2 border border-gray-200 rounded-lg">
                  <option value="phone">电话面试</option>
                  <option value="video">视频面试</option>
                  <option value="onsite">现场面试</option>
                  <option value="written">笔试</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">面试时间</label>
              <input type="datetime-local" id="interview-time" class="w-full px-3 py-2 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">面试官</label>
              <input type="text" id="interview-interviewer" class="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="如：技术总监" />
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" id="cancel-interview" class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button type="submit" class="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                添加
              </button>
            </div>
          </form>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            var appId = '${appId}';
            var applications = JSON.parse(localStorage.getItem('jobcopilot_applications') || '[]');
            var app = applications.find(function(a) { return a.id === appId; });
            
            if (!app) {
              document.getElementById('app-header').innerHTML = '<p class="text-red-500">投递记录不存在</p>';
              return;
            }
            
            var statusLabels = {
              'applied': '已投递',
              'screening': '筛选中',
              'interview': '面试中',
              'offer': '已获Offer',
              'rejected': '已拒绝',
              'withdrawn': '已撤回'
            };
            
            var statusColors = {
              'applied': 'bg-gray-100 text-gray-700 border-gray-300',
              'screening': 'bg-blue-100 text-blue-700 border-blue-300',
              'interview': 'bg-yellow-100 text-yellow-700 border-yellow-300',
              'offer': 'bg-green-100 text-green-700 border-green-300',
              'rejected': 'bg-red-100 text-red-700 border-red-300',
              'withdrawn': 'bg-gray-200 text-gray-600 border-gray-400'
            };
            
            var interviewTypeLabels = {
              'phone': '电话面试',
              'video': '视频面试',
              'onsite': '现场面试',
              'written': '笔试'
            };
            
            function render() {
              // 头部信息
              document.getElementById('app-header').innerHTML = 
                '<h1 class="text-2xl font-bold mb-2">' + app.company + '</h1>' +
                '<p class="text-lg text-gray-600">' + app.position + '</p>' +
                '<div class="flex flex-wrap items-center gap-3 mt-3">' +
                  '<span class="px-3 py-1 rounded-full text-sm ' + statusColors[app.status] + '">' + statusLabels[app.status] + '</span>' +
                  (app.source ? '<span class="text-sm text-gray-500"><i class="fas fa-share-alt mr-1"></i>' + app.source + '</span>' : '') +
                  '<span class="text-sm text-gray-500"><i class="fas fa-calendar mr-1"></i>' + new Date(app.applied_at).toLocaleDateString('zh-CN') + '</span>' +
                  (app.salary_range ? '<span class="text-sm text-gray-500"><i class="fas fa-money-bill mr-1"></i>' + app.salary_range + '</span>' : '') +
                  (app.job_url ? '<a href="' + app.job_url + '" target="_blank" class="text-sm text-blue-600 hover:text-blue-800"><i class="fas fa-external-link-alt mr-1"></i>查看原帖</a>' : '') +
                '</div>';
              
              // 状态按钮
              document.querySelectorAll('.status-btn').forEach(function(btn) {
                var status = btn.dataset.status;
                btn.className = 'px-4 py-2 rounded-lg border text-sm status-btn transition-colors ' +
                  (status === app.status ? statusColors[status] + ' border-2' : 'border-gray-200 text-gray-600 hover:bg-gray-50');
              });
              
              // 面试记录
              var interviewsList = document.getElementById('interviews-list');
              if (app.interviews && app.interviews.length > 0) {
                interviewsList.innerHTML = app.interviews.map(function(interview) {
                  var roundText = ['', '一面', '二面', '三面', '四面', 'HR面'][interview.round] || '第' + interview.round + '轮';
                  return '<div class="border border-gray-200 rounded-xl p-4">' +
                    '<div class="flex items-center justify-between mb-2">' +
                      '<span class="font-medium">' + roundText + ' - ' + interviewTypeLabels[interview.type] + '</span>' +
                      (interview.result ? '<span class="px-2 py-0.5 text-xs rounded-full ' + 
                        (interview.result === 'passed' ? 'bg-green-100 text-green-600' : 
                         interview.result === 'failed' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600') + '">' +
                        (interview.result === 'passed' ? '通过' : interview.result === 'failed' ? '未通过' : '待定') + '</span>' : '') +
                    '</div>' +
                    (interview.scheduled_at ? '<p class="text-sm text-gray-500 mb-1"><i class="fas fa-clock mr-1"></i>' + new Date(interview.scheduled_at).toLocaleString('zh-CN') + '</p>' : '') +
                    (interview.interviewer ? '<p class="text-sm text-gray-500"><i class="fas fa-user mr-1"></i>' + interview.interviewer + '</p>' : '') +
                    (interview.feedback ? '<p class="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">' + interview.feedback + '</p>' : '') +
                  '</div>';
                }).join('');
              } else {
                interviewsList.innerHTML = '<div class="text-center py-8 text-gray-400">' +
                  '<i class="fas fa-calendar-alt text-2xl mb-2"></i>' +
                  '<p>暂无面试记录</p>' +
                '</div>';
              }
              
              // 状态历史
              var historyHtml = (app.status_history || []).slice().reverse().map(function(h, i) {
                return '<div class="flex items-start gap-3">' +
                  '<div class="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>' +
                  '<div>' +
                    '<span class="font-medium text-sm">' + statusLabels[h.status] + '</span>' +
                    '<span class="text-xs text-gray-400 ml-2">' + new Date(h.changed_at).toLocaleString('zh-CN') + '</span>' +
                    (h.note ? '<p class="text-sm text-gray-500 mt-0.5">' + h.note + '</p>' : '') +
                  '</div>' +
                '</div>';
              }).join('');
              document.getElementById('status-history').innerHTML = historyHtml || '<p class="text-gray-400">暂无状态变更记录</p>';
              
              // 备注
              document.getElementById('notes-input').value = app.notes || '';
            }
            
            // 状态按钮点击
            document.querySelectorAll('.status-btn').forEach(function(btn) {
              btn.onclick = function() {
                var newStatus = btn.dataset.status;
                if (newStatus === app.status) return;
                
                app.status = newStatus;
                app.status_history = app.status_history || [];
                app.status_history.push({
                  status: newStatus,
                  changed_at: new Date().toISOString()
                });
                app.updated_at = new Date().toISOString();
                
                localStorage.setItem('jobcopilot_applications', JSON.stringify(applications));
                render();
              };
            });
            
            // 保存备注
            document.getElementById('save-notes').onclick = function() {
              app.notes = document.getElementById('notes-input').value.trim();
              app.updated_at = new Date().toISOString();
              localStorage.setItem('jobcopilot_applications', JSON.stringify(applications));
              alert('备注已保存');
            };
            
            // 删除
            document.getElementById('delete-btn').onclick = function() {
              if (confirm('确定要删除这条投递记录吗？')) {
                applications = applications.filter(function(a) { return a.id !== appId; });
                localStorage.setItem('jobcopilot_applications', JSON.stringify(applications));
                window.location.href = '/applications';
              }
            };
            
            // 添加面试弹窗
            var interviewModal = document.getElementById('interview-modal');
            document.getElementById('add-interview-btn').onclick = function() {
              interviewModal.classList.remove('hidden');
            };
            document.getElementById('close-interview-modal').onclick = function() {
              interviewModal.classList.add('hidden');
            };
            document.getElementById('cancel-interview').onclick = function() {
              interviewModal.classList.add('hidden');
            };
            interviewModal.onclick = function(e) {
              if (e.target === interviewModal) interviewModal.classList.add('hidden');
            };
            
            document.getElementById('interview-form').onsubmit = function(e) {
              e.preventDefault();
              
              var newInterview = {
                id: 'int_' + Date.now(),
                round: parseInt(document.getElementById('interview-round').value),
                type: document.getElementById('interview-type').value,
                scheduled_at: document.getElementById('interview-time').value || undefined,
                interviewer: document.getElementById('interview-interviewer').value.trim() || undefined,
                result: 'pending',
                created_at: new Date().toISOString()
              };
              
              app.interviews = app.interviews || [];
              app.interviews.push(newInterview);
              
              // 自动更新状态为面试中
              if (app.status === 'applied' || app.status === 'screening') {
                app.status = 'interview';
                app.status_history.push({
                  status: 'interview',
                  changed_at: new Date().toISOString(),
                  note: '进入第' + newInterview.round + '轮面试'
                });
              }
              
              app.updated_at = new Date().toISOString();
              localStorage.setItem('jobcopilot_applications', JSON.stringify(applications));
              
              interviewModal.classList.add('hidden');
              document.getElementById('interview-form').reset();
              render();
            };
            
            render();
          });
        `
      }} />
    </div>,
    { title: '投递详情 - Job Copilot' }
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

// JD 定向简历生成 API
app.post('/api/job/:jobId/generate-resume', generateTargetedResume)

// 挂载匹配相关路由
app.route('/api/job', matchRoutes)

// 挂载面试准备相关路由
app.route('/api/job', interviewRoutes)

// 挂载简历优化相关路由
app.route('/api/job', optimizeRoutes)

// 挂载评测相关路由
app.route('/api/metrics', metricsRoutes)

// 挂载面试题库相关路由
app.route('/api/questions', questionRoutes)

// 挂载投递跟踪相关路由
app.route('/api/applications', applicationRoutes)

// API健康检查
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    phase: 'Phase 9 - 投递跟踪',
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
