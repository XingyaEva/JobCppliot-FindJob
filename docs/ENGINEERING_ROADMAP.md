# FindJob 工程化升级路线图

> 最后更新：2026-03-12

## 总体策略

**保留现有 Hono + React 架构，渐进式升级基础设施。**

不推倒重来，不换框架，逐步把原型级基础设施替换为生产级。

## 当前架构

```
前端: React 18 + shadcn/ui + Zustand + React Query + Vite
后端: Hono (TypeScript) on Cloudflare Workers
存储: Cloudflare KV / localStorage（临时）
AI:   14 个 Agent (OpenAI GPT-4)
```

## 目标架构

```
前端: React 18 + shadcn/ui + Zustand + React Query + Vite   ← 不变
后端: Hono (TypeScript) on 阿里云 ECS / FC                   ← 换部署环境
数据库: 阿里云 RDS PostgreSQL                                 ← 新增
存储: 阿里云 OSS                                              ← 新增
认证: JWT + 手机号 + 微信登录                                  ← 新增
支付: 微信 + 支付宝                                           ← 新增（需企业主体）
监控: Sentry + PostHog                                        ← 新增
```

## 7 步升级计划

### Step 1: 正式代码仓库 ✅
- [x] GitHub 仓库已建立
- [x] .gitignore 完善
- [x] .env.example 创建
- [x] README 更新
- [ ] 创建 dev 分支

### Step 2: 正式数据库
- [ ] 阿里云 RDS PostgreSQL 开通
- [ ] MVP 9 张核心表建表
- [ ] storage.ts 改造（KV → PostgreSQL）
- [ ] 逐个 API 路由切换
- [ ] 数据迁移验证

### Step 3: 正式认证
- [ ] JWT 认证中间件
- [ ] 注册/登录 API
- [ ] 阿里云短信验证码
- [ ] Token 刷新机制
- [ ] 现有 UserContext 改造

### Step 4: 正式文件存储
- [ ] 阿里云 OSS Bucket 创建
- [ ] 文件上传 API
- [ ] 安全 URL 生成
- [ ] 简历上传流程改造

### Step 5: 正式部署环境
- [ ] 域名购买与备案
- [ ] 阿里云 ECS 或 FC 配置
- [ ] Nginx + HTTPS
- [ ] staging / production 环境分离
- [ ] CI/CD 脚本

### Step 6: 埋点与监控
- [ ] Sentry 前后端接入
- [ ] PostHog 8 个核心事件
- [ ] AI 调用日志
- [ ] 简单运营后台

### Step 7: 支付闭环（需企业主体）
- [ ] 企业主体注册
- [ ] 微信商户号申请
- [ ] 订单系统
- [ ] 支付回调
- [ ] 权益同步

## MVP 核心链路

```
首页 → 登录/游客 → 输入 JD → 岗位解析 → 匹配分析 → 定向简历 → 保存 → 会员拦截 → 支付
```

## 关键决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 2026-03-12 | 保留 Hono，不迁移 Next.js | 已有大量可运行代码，迁移成本高，单人维护 |
| 2026-03-12 | 数据库选阿里云 RDS | 面向中国用户，国内访问快 |
| 2026-03-12 | 认证自建（JWT + 手机号） | 中国用户需要手机号登录，Clerk 不支持 |
| 2026-03-12 | 存储选阿里云 OSS | 和 RDS 同生态，内网互通 |
| 2026-03-12 | 支付等企业主体后再接 | 微信/支付宝需要企业资质 |
