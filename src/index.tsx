/**
 * Job Copilot - 智能求职助手
 * 主入口文件
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import { chat, chatWithImage, MODELS } from './core/api-client'

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
          <p>Job Copilot - 智能求职助手 | Phase 0 Demo</p>
        </div>
      </footer>
    </div>,
    { title: 'Job Copilot - 智能求职助手' }
  )
})

// 新建岗位解析页（占位）
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
        <div class="p-8 bg-gray-50 rounded-xl text-center">
          <i class="fas fa-tools text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">Phase 1 开发中...</p>
          <p class="text-sm text-gray-400 mt-2">JD 解析功能将在下一阶段实现</p>
        </div>
      </main>
    </div>,
    { title: '新建岗位解析 - Job Copilot' }
  )
})

// 岗位库页面（占位）
app.get('/jobs', (c) => {
  return c.render(
    <div class="min-h-screen bg-white">
      <header class="border-b border-gray-100">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <a href="/" class="text-gray-500 hover:text-gray-700 mr-4">
            <i class="fas fa-arrow-left"></i>
          </a>
          <h1 class="text-xl font-bold">岗位库</h1>
        </div>
      </header>
      <main class="max-w-6xl mx-auto px-4 py-8">
        <div class="p-8 bg-gray-50 rounded-xl text-center">
          <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
          <p class="text-gray-500">暂无岗位记录</p>
        </div>
      </main>
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

// API健康检查
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    phase: 'Phase 0 - 项目初始化',
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

// API测试 - 测试图片识别
app.post('/api/test/vision', async (c) => {
  try {
    const body = await c.req.json()
    const { imageUrl } = body

    if (!imageUrl) {
      return c.json({
        success: false,
        error: '请提供 imageUrl 参数',
      }, 400)
    }

    const response = await chatWithImage(
      '你是一个图片识别专家。',
      '请描述这张图片的内容。',
      imageUrl,
      { model: MODELS.VISION }
    )

    return c.json({
      success: true,
      response,
      model: MODELS.VISION,
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
