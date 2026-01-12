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
        {/* 自定义样式 */}
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="bg-white text-gray-900 antialiased">
        {children}
        {/* 前端JS */}
        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
