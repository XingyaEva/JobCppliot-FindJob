# Job Copilot - 智能求职助手

AI驱动的JD解析、简历匹配、面试准备工具

## 项目概述

- **名称**: Job Copilot
- **目标**: 为AI/产品/技术类求职者提供智能求职助手
- **核心功能**: JD解析、简历上传匹配、公司分析、面试准备、简历优化

## 当前状态

**Phase 0 - 项目初始化** ✅ 已完成

### 已实现功能

- [x] 项目框架搭建 (Hono + TailwindCSS + Cloudflare Workers)
- [x] UI基础页面（首页、岗位库、简历页）
- [x] Vectorengine API 客户端集成
- [x] 前端交互基础功能（Tab切换、折叠面板、Toast提示）
- [x] LocalStorage 数据存储封装
- [x] Agent 基类设计
- [x] 类型系统定义

### 待开发功能

- [ ] Phase 1: JD 解析功能
- [ ] Phase 2: 简历解析与匹配评估
- [ ] Phase 3: 公司分析与面试准备
- [ ] Phase 4: 简历优化 Agent
- [ ] Phase 5: 体验优化与部署
- [ ] Phase 6: 模型评测与优化

## 访问地址

- **沙箱预览**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai
- **API健康检查**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/api/health

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 首页 |
| `/job/new` | GET | 新建岗位解析页（占位） |
| `/jobs` | GET | 岗位库页面 |
| `/resume` | GET | 我的简历页面 |
| `/api/health` | GET | API健康检查 |
| `/api/test` | POST | 测试LLM API连接 |
| `/api/test/vision` | POST | 测试图片识别API |

## 技术架构

- **前端**: HTML + TailwindCSS (CDN) + Vanilla JS
- **后端**: Hono (TypeScript) on Cloudflare Workers
- **AI API**: Vectorengine API (OpenAI兼容)
- **数据存储**: LocalStorage (MVP阶段)

## 模型配置

| 用途 | 模型 | 备注 |
|------|------|------|
| 图片理解 | gpt-4o | JD图片解析 |
| 快速文本 | qwen-turbo | Router、预处理 |
| 中等复杂 | qwen-max | JD分析、简历解析 |
| 高质量生成 | gpt-4.1 | 匹配评估、面试准备 |

## 开发计划

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 0 | 项目初始化 | ✅ 完成 |
| Phase 1 | JD 解析 | 🔜 待开始 |
| Phase 2 | 简历解析与匹配 | ⏳ 计划中 |
| Phase 3 | 公司分析与面试准备 | ⏳ 计划中 |
| Phase 4 | 简历优化 | ⏳ 计划中 |
| Phase 5 | 体验优化与部署 | ⏳ 计划中 |
| Phase 6 | 模型评测与优化 | ⏳ 计划中 |

## 本地开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev:sandbox

# 或使用 PM2
pm2 start ecosystem.config.cjs
```

## 项目结构

```
webapp/
├── src/
│   ├── index.tsx        # 主应用入口
│   ├── renderer.tsx     # JSX渲染器
│   ├── agents/          # Agent实现
│   ├── core/            # 核心模块
│   ├── types/           # 类型定义
│   └── utils/           # 工具函数
├── public/
│   └── static/          # 静态资源
├── dist/                # 构建输出
├── ecosystem.config.cjs # PM2配置
├── wrangler.jsonc       # Cloudflare配置
├── package.json
└── README.md
```

## 更新日志

### 2026-01-12 - Phase 0 完成
- 完成项目框架搭建
- 集成 Vectorengine API
- 设计 Agent 基类和类型系统
- 实现基础 UI 页面

---

**开发阶段**: Phase 0 - 项目初始化 ✅
**下一阶段**: Phase 1 - JD 解析
