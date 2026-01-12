# Job Copilot - 智能求职助手

AI驱动的JD解析、简历匹配、面试准备、简历优化工具

## 项目概述

- **名称**: Job Copilot
- **版本**: v0.7.0
- **目标**: 为AI/产品/技术类求职者提供智能求职助手
- **核心功能**: JD解析、简历上传匹配、公司分析、面试准备、简历优化、模型评测

## 当前状态

**Phase 6 - 模型评测与优化** ✅ 已完成

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
- [x] 新建岗位解析页、岗位详情页、岗位库页面

#### Phase 2 ✅
- [x] **简历预处理Agent**: 文件/文本预处理 (gpt-4o/qwen-turbo)
- [x] **简历解析Agent**: 结构化简历 + 能力标签提取 (qwen-max)
- [x] **匹配评估Agent**: 多维度匹配评估 (gpt-4.1)
- [x] 简历相关API、我的简历页面、岗位匹配页面

#### Phase 3 ✅
- [x] **公司分析Agent**: ToB/ToC分流 + AI场景分析 + 竞品分析 (gpt-4.1)
- [x] **面试准备Agent**: 自我介绍 + 项目推荐 + 面试题 + PREP回答 (gpt-4.1)
- [x] **面试准备页面**: Tab切换展示各模块
- [x] **复制功能**: 一键复制各模块内容
- [x] **公司分析展示**: 集成到面试准备页

#### Phase 4 ✅
- [x] **简历优化Agent**: 关键词注入 + 差距弥补 + 亮点强化 (gpt-4.1)
- [x] **简历优化页面**: 分段展示优化前后对比
- [x] **用户建议输入**: 支持用户输入修改建议重新优化
- [x] **优化记录保存**: 保存优化历史到localStorage
- [x] **一键复制**: 支持复制各段优化内容或全部内容

#### Phase 5 ✅ 已完成
- [x] **统一导航栏**: 全站统一的顶部导航，支持响应式
- [x] **面包屑导航**: 各页面显示当前位置和返回路径
- [x] **使用流程指引**: 首页展示5步流程，实时显示完成状态
- [x] **数据管理功能**: 
  - 导出数据（JSON格式）
  - 清空所有数据
  - 删除单个岗位（含关联数据）
  - 删除简历
- [x] **骨架屏加载**: 列表页显示骨架屏优化加载体验
- [x] **Toast通知**: 操作反馈统一使用Toast提示
- [x] **响应式优化**: 移动端适配，导航栏和布局优化
- [x] **Cloudflare Pages部署**: ✅ 已部署到生产环境

#### Phase 6 ✅ 已完成
- [x] **评测框架搭建**: metrics.ts 评测数据收集器
- [x] **评测数据采集**: Agent 执行自动记录评测数据
- [x] **评测仪表盘**: /metrics 可视化页面，图表展示
- [x] **模型对比实验**: A/B 测试不同模型配置
- [x] **Prompt 优化**: prompt-templates.ts 统一管理优化后的 Prompt
- [x] **成本优化**: cost-optimizer.ts 模型成本估算、智能选择策略

### 待开发功能

- [ ] 更多 A/B 测试实验
- [ ] 基于真实评测数据调优模型选择

## 访问地址

### 🌐 生产环境（Cloudflare Pages）
- **首页**: https://job-copilot.pages.dev
- **新建岗位**: https://job-copilot.pages.dev/job/new
- **岗位库**: https://job-copilot.pages.dev/jobs
- **我的简历**: https://job-copilot.pages.dev/resume
- **评测仪表盘**: https://job-copilot.pages.dev/metrics
- **API健康检查**: https://job-copilot.pages.dev/api/health

### 🔧 开发环境（沙箱）
- **沙箱预览**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai
- **新建岗位**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/job/new
- **岗位库**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/jobs
- **我的简历**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/resume

## 使用流程

```
1. 解析岗位 → 2. 上传简历 → 3. 匹配评估 → 4. 面试准备 → 5. 优化简历
```

每个步骤完成后，首页会显示完成状态。

## API 端点

### 页面路由
| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 首页（含使用指引） |
| `/job/new` | GET | 新建岗位解析页 |
| `/job/:id` | GET | 岗位详情页 |
| `/job/:id/match` | GET | 岗位匹配分析页 |
| `/job/:id/interview` | GET | 面试准备页 |
| `/job/:id/optimize` | GET | 简历优化页 |
| `/jobs` | GET | 岗位库页面 |
| `/resume` | GET | 我的简历页面 |

### 岗位 API
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/job/parse-sync` | POST | 同步解析JD |
| `/api/job/:id` | GET | 获取岗位详情 |
| `/api/jobs` | GET | 获取岗位列表 |
| `/api/job/:id` | DELETE | 删除岗位 |
| `/api/job/:id/match` | POST | 执行匹配评估 |
| `/api/job/:id/match` | GET | 获取匹配结果 |

### 简历 API
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/resume/parse` | POST | 解析简历 |
| `/api/resume` | GET | 获取所有简历 |
| `/api/resume/:id` | GET | 获取简历详情 |
| `/api/resume/:id` | DELETE | 删除简历 |

### 面试准备 API
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/job/:id/interview` | POST | 生成面试准备材料 |
| `/api/job/:id/interview` | GET | 获取面试准备结果 |

### 简历优化 API
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/job/:id/optimize` | POST | 执行简历优化 |
| `/api/job/:id/optimize` | GET | 获取优化结果 |
| `/api/job/:id/optimize/regenerate` | POST | 根据用户建议重新优化 |

### 健康检查
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | API健康检查 |

## Phase 5 新增功能

### 统一导航系统
- 全站统一的顶部导航栏
- 响应式设计，移动端折叠显示
- 当前页面高亮显示
- 简历状态实时显示

### 数据管理
- **导出数据**: 将所有数据导出为JSON文件
- **清空数据**: 一键清空所有localStorage数据
- **删除岗位**: 删除单个岗位及其关联的匹配、面试、优化记录
- **删除简历**: 删除当前简历

### 使用流程指引
首页显示5步使用流程：
1. 解析岗位 - 上传JD截图或粘贴文本
2. 上传简历 - 上传简历文件或粘贴文本
3. 匹配评估 - AI分析简历与岗位匹配度
4. 面试准备 - 生成自我介绍、面试题、PREP回答
5. 优化简历 - 根据岗位要求优化简历内容

### 体验优化
- 骨架屏：列表加载时显示骨架占位
- Toast通知：操作结果统一提示
- 卡片悬停效果：提升交互反馈
- 滚动条美化：统一滚动条样式

## 模型配置

| 用途 | 模型 | Agent |
|------|------|-------|
| 图片理解 | gpt-4o | JD预处理(图片)、简历预处理(文件) |
| 快速文本 | qwen-turbo | JD预处理(文本)、简历预处理(文本) |
| 中等复杂 | qwen-max | JD结构化、A维度分析、简历解析 |
| 高质量生成 | gpt-4.1 | B维度分析、匹配评估、公司分析、面试准备、简历优化 |

## 项目结构

```
webapp/
├── src/
│   ├── index.tsx           # 主应用入口（含所有页面路由）
│   ├── renderer.tsx        # JSX渲染器（含全局样式和脚本）
│   ├── components/         # 可复用组件
│   │   └── layout.tsx      # 布局组件（导航、面包屑、页脚）
│   ├── agents/             # Agent实现
│   │   ├── jd-preprocess.ts
│   │   ├── jd-structure.ts
│   │   ├── jd-analysis-a.ts
│   │   ├── jd-analysis-b.ts
│   │   ├── resume-preprocess.ts
│   │   ├── resume-parse.ts
│   │   ├── match-evaluate.ts
│   │   ├── company-analyze.ts
│   │   ├── interview-prep.ts
│   │   └── resume-optimize.ts
│   ├── core/               # 核心模块
│   │   ├── api-client.ts   # Vectorengine API
│   │   └── dag-executor.ts # DAG执行器
│   ├── routes/             # API路由
│   │   ├── job.ts
│   │   ├── resume.ts
│   │   ├── interview.ts
│   │   └── optimize.ts
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

### 2026-01-12 - Phase 6 完成 🎉
- **6.1-6.4 评测框架**:
  - 实现评测数据收集框架 (metrics.ts)
  - 实现实验配置管理 (experiment.ts)
  - 创建评测仪表盘页面 (/metrics)
    - 总览卡片：调用次数、成功率、平均耗时、成本
    - 调用趋势图表
    - 模型使用分布饼图
    - Agent 性能对比表
    - 实验管理面板
    - 调用日志列表
  - 修改 Agent 基类自动记录评测数据
  - 前端自动保存评测数据到 localStorage
- **6.5 Prompt 优化**:
  - 创建 prompt-templates.ts 统一管理 Prompt 模板
  - 优化所有 Agent 的系统提示词
  - 添加 Token 优化约束、JSON 输出约束、错误处理指导
  - 为每个 Agent 提供 Few-shot 示例和最佳实践
- **6.6 成本优化**:
  - 创建 cost-optimizer.ts 模型成本管理模块
  - 配置各模型定价信息（GPT-4o/4.1、Qwen、DeepSeek）
  - 实现智能模型选择策略（质量优先/平衡/经济）
  - 添加 Token 估算和成本预警功能
  - 新增成本相关 API 端点 (/api/metrics/cost/*)

### 2026-01-12 - Phase 5 完成 🎉
- 实现统一导航栏（响应式设计）
- 添加面包屑导航
- 实现使用流程指引（首页5步流程）
- 实现数据管理功能（导出/清空/删除）
- 添加骨架屏加载效果
- 统一Toast通知
- 响应式布局优化
- **Cloudflare Pages 生产部署完成**
  - 生产地址: https://job-copilot.pages.dev

### 2026-01-12 - Phase 4 完成
- 实现简历优化 Agent
- 添加简历优化页面
- 实现用户建议输入和重新优化
- 实现一键复制功能

### 2026-01-12 - Phase 3 完成
- 实现公司分析 Agent
- 实现面试准备 Agent
- 添加面试准备页面

### 2026-01-12 - Phase 2 完成
- 实现简历解析和匹配评估
- 添加简历页面和匹配页面

### 2026-01-12 - Phase 1 完成
- 实现JD解析完整流程

### 2026-01-12 - Phase 0 完成
- 项目框架搭建

## Phase 6 新增功能

### 评测仪表盘 (/metrics)
- **总览面板**: 调用次数、成功率、平均耗时、总成本
- **趋势图表**: 调用量随时间变化趋势
- **模型分布**: 各模型使用占比饼图
- **Agent 性能**: 各 Agent 性能对比表
- **实验管理**: A/B 测试实验配置
- **调用日志**: 最近调用记录列表

### Prompt 优化
- 统一 Prompt 模板库 (src/core/prompt-templates.ts)
- 结构化输出控制、Few-shot 示例
- Token 优化约束（字段长度限制、数量限制）
- 错误处理指导（信息不足时的处理方式）

### 成本优化
- 模型定价配置（支持 GPT-4o/4.1、Qwen、DeepSeek）
- 三种成本策略：quality（质量优先）、balanced（平衡）、economy（经济）
- Token 估算和成本预警
- Agent 模型推荐配置

### 成本 API 端点
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/metrics/cost` | GET | 获取成本统计和模型对比 |
| `/api/metrics/cost/models` | GET | 获取模型成本详情 |
| `/api/metrics/cost/agents` | GET | 获取 Agent 模型推荐 |
| `/api/metrics/cost/estimate` | POST | 估算调用成本 |

---

**开发阶段**: Phase 6 - 模型评测与优化 ✅ 已完成
**生产地址**: https://job-copilot.pages.dev
**评测仪表盘**: https://job-copilot.pages.dev/metrics
