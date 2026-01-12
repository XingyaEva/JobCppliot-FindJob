# Job Copilot - 智能求职助手

AI驱动的JD解析、简历匹配、面试准备工具

## 项目概述

- **名称**: Job Copilot
- **目标**: 为AI/产品/技术类求职者提供智能求职助手
- **核心功能**: JD解析、简历上传匹配、公司分析、面试准备、简历优化

## 当前状态

**Phase 1 - JD解析** ✅ 已完成

### 已实现功能

#### Phase 0 ✅
- [x] 项目框架搭建 (Hono + TailwindCSS + Cloudflare Workers)
- [x] UI基础页面（首页、岗位库、简历页）
- [x] Vectorengine API 客户端集成
- [x] 前端交互基础功能
- [x] LocalStorage 数据存储封装

#### Phase 1 ✅
- [x] **JD预处理Agent**: 图片OCR (gpt-4o) / 文本清洗 (qwen-turbo)
- [x] **JD结构化Agent**: 提取岗位名称、公司、职责、要求等 (qwen-max)
- [x] **A维度分析Agent**: 技术栈、产品类型、业务领域、团队阶段 (qwen-max)
- [x] **B维度分析Agent**: 行业背景、技术背景、产品经验、产品能力 (gpt-4.1)
- [x] **DAG执行器**: 多Agent依赖管理和并行执行
- [x] **新建岗位解析页**: 图片上传/文本粘贴、解析进度可视化
- [x] **岗位详情页**: A/B维度分析结果展示
- [x] **岗位库页面**: 岗位列表展示

### 待开发功能

- [ ] Phase 2: 简历解析与匹配评估
- [ ] Phase 3: 公司分析与面试准备
- [ ] Phase 4: 简历优化 Agent
- [ ] Phase 5: 体验优化与部署
- [ ] Phase 6: 模型评测与优化

## 访问地址

- **沙箱预览**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai
- **新建岗位**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/job/new
- **岗位库**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/jobs

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 首页 |
| `/job/new` | GET | 新建岗位解析页 |
| `/job/:id` | GET | 岗位详情页 |
| `/jobs` | GET | 岗位库页面 |
| `/resume` | GET | 我的简历页面 |
| `/api/health` | GET | API健康检查 |
| `/api/job/parse` | POST | 异步解析JD |
| `/api/job/parse-sync` | POST | 同步解析JD |
| `/api/job/:id` | GET | 获取岗位详情 |
| `/api/job/:id/status` | GET | 获取解析状态 |
| `/api/jobs` | GET | 获取岗位列表 |

## Agent DAG 架构

```
输入 (图片/文本)
     │
     ▼
┌─────────────────┐
│  JD预处理Agent  │ ← gpt-4o(图片) / qwen-turbo(文本)
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  JD结构化Agent  │ ← qwen-max
└─────────────────┘
     │
     ├──────────────┐
     ▼              ▼
┌──────────┐  ┌──────────┐
│ A维度    │  │ B维度    │ ← 依赖A维度结果
│ 分析     │  │ 分析     │
│(qwen-max)│  │(gpt-4.1) │
└──────────┘  └──────────┘
```

## A/B 维度分析说明

### A维度 - 岗位定位
| 维度 | 内容 |
|------|------|
| A1 | 技术栈分析 (关键词、密度) |
| A2 | 产品类型 (ToB/ToC/平台等) |
| A3 | 业务领域 (主领域、次领域) |
| A4 | 团队阶段 (0-1/1-N/成熟期) |

### B维度 - 隐性需求
| 维度 | 内容 |
|------|------|
| B1 | 行业背景要求 (是否必需、年限) |
| B2 | 技术背景要求 (学历、技术深度) |
| B3 | 产品经验要求 (产品类型、全周期、0-1) |
| B4 | 产品能力要求 (核心能力拆解) |

## 技术架构

- **前端**: HTML + TailwindCSS (CDN) + Vanilla JS
- **后端**: Hono (TypeScript) on Cloudflare Workers
- **AI API**: Vectorengine API (OpenAI兼容)
- **数据存储**: LocalStorage (MVP阶段)

## 模型配置

| 用途 | 模型 | Agent |
|------|------|-------|
| 图片理解 | gpt-4o | JD预处理(图片) |
| 快速文本 | qwen-turbo | JD预处理(文本) |
| 中等复杂 | qwen-max | JD结构化、A维度分析 |
| 高质量生成 | gpt-4.1 | B维度分析 |

## 项目结构

```
webapp/
├── src/
│   ├── index.tsx           # 主应用入口
│   ├── renderer.tsx        # JSX渲染器
│   ├── agents/             # Agent实现
│   │   ├── base.ts         # Agent基类
│   │   ├── jd-preprocess.ts
│   │   ├── jd-structure.ts
│   │   ├── jd-analysis-a.ts
│   │   └── jd-analysis-b.ts
│   ├── core/               # 核心模块
│   │   ├── api-client.ts   # Vectorengine API
│   │   ├── dag-executor.ts # DAG执行器
│   │   └── storage.ts      # 存储封装
│   ├── routes/             # API路由
│   │   └── job.ts          # 岗位相关API
│   └── types/              # 类型定义
├── public/static/          # 静态资源
├── dist/                   # 构建输出
└── README.md
```

## 本地开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
pm2 start ecosystem.config.cjs

# 测试
curl http://localhost:3000/api/health
```

## 更新日志

### 2026-01-12 - Phase 1 完成
- 实现JD解析完整流程
- 4个Agent: 预处理、结构化、A维度、B维度
- DAG执行器支持依赖管理和并行执行
- 新建解析页支持图片上传和文本粘贴
- 详情页展示A/B维度分析结果
- 解析进度可视化

### 2026-01-12 - Phase 0 完成
- 项目框架搭建
- Vectorengine API 集成
- 基础UI页面

---

**开发阶段**: Phase 1 - JD解析 ✅
**下一阶段**: Phase 2 - 简历解析与匹配
