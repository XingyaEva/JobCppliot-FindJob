# FindJob - AI 智能求职平台

> AI 驱动的全链路求职助手：JD 解析 → 匹配分析 → 定向简历 → 面试准备 → Offer 决策 → 成长陪伴

## 项目状态

| 模块 | 状态 | 说明 |
|------|------|------|
| JD 解析（A/B 维度） | ✅ 已完成 | 14 个 AI Agent，支持图片/文本/URL |
| 简历解析与管理 | ✅ 已完成 | PDF/DOCX 解析，版本管理 |
| 岗位匹配分析 | ✅ 已完成 | 多维度匹配评分 |
| 定向简历生成 | ✅ 已完成 | 基于 JD 定制化简历 |
| 面试准备 | ✅ 已完成 | 题库 + AI 模拟 + 复盘 |
| 用户 Dashboard | ✅ 已完成 | 7 个聚合 API |
| 用户体系（前端） | 🔄 进行中 | 登录/注册/会员页面 |
| 正式数据库 | ⏳ 待开始 | KV → PostgreSQL |
| 正式认证 | ⏳ 待开始 | JWT + 手机号登录 |
| 支付系统 | ⏳ 待开始 | 微信/支付宝 |

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS + shadcn/ui + Zustand + React Query
- **后端**: Hono (TypeScript)
- **AI**: OpenAI GPT-4 / Claude（14 个 Agent）
- **构建**: Vite
- **当前部署**: Cloudflare Pages（原型阶段）
- **目标部署**: 阿里云 ECS + RDS + OSS（正式上线）

## 目录结构

```
src/
├── agents/          # 14 个 AI Agent（JD 解析、简历分析、面试辅导等）
├── components/      # React 组件（AppShell、Layout、Sidebar）
├── core/            # 核心基础设施
│   ├── llm/         # LLM 客户端封装（多模型支持）
│   ├── storage.ts   # 数据存储层（待升级为 PostgreSQL）
│   ├── api-client.ts
│   ├── dag-executor.ts
│   └── ...
├── pages/           # 页面组件（7 大模块）
├── routes/          # Hono API 路由（12 个路由模块）
├── types/           # TypeScript 类型定义
├── index.tsx        # 应用入口
└── renderer.tsx     # SSR 渲染器
```

## 本地开发

```bash
# 安装依赖
npm install

# 前端开发（热重载）
npm run dev

# 完整构建 + 本地预览
npm run build
npm run preview

# 沙箱模式（Cloudflare Workers 模拟）
npm run dev:sandbox
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并填入你的密钥：

```bash
cp .env.example .env.local
```

详见 `.env.example` 中的说明。

## 工程化路线图

```
Phase 1 ✅  代码仓库（GitHub）
Phase 2 ⏳  正式数据库（阿里云 RDS PostgreSQL）
Phase 3 ⏳  正式认证（JWT + 手机号 + 微信登录）
Phase 4 ⏳  正式文件存储（阿里云 OSS）
Phase 5 ⏳  正式部署（阿里云 ECS + 域名 + HTTPS）
Phase 6 ⏳  埋点与监控（Sentry + PostHog）
Phase 7 ⏳  支付闭环（微信/支付宝，需企业主体）
```

## 核心 AI Agent

| Agent | 文件 | 功能 |
|-------|------|------|
| JD 预处理 | `agents/jd-preprocess.ts` | OCR + 文本清洗 |
| JD 结构化 | `agents/jd-structure.ts` | 提取职位/公司/要求 |
| A 维度分析 | `agents/jd-analysis-a.ts` | 技术栈、产品类型、团队等 |
| B 维度分析 | `agents/jd-analysis-b.ts` | 深度拆解、隐性要求 |
| 简历预处理 | `agents/resume-preprocess.ts` | PDF/DOCX 解析 |
| 简历解析 | `agents/resume-parse.ts` | 结构化提取 |
| 匹配评估 | `agents/match-evaluate.ts` | 多维匹配评分 |
| 简历优化 | `agents/resume-optimize.ts` | AI 优化建议 |
| 简历版本 | `agents/resume-version.ts` | 定向版本生成 |
| 公司分析 | `agents/company-analyze.ts` | 公司背景调研 |
| 面试准备 | `agents/interview-prep.ts` | 生成面试题 |
| 面试辅导 | `agents/interview-coach.ts` | AI 模拟面试 |
| 市场调研 | `agents/market-research.ts` | 行业/薪资分析 |

## License

MIT
