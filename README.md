# Job Copilot - 智能求职助手

AI驱动的JD解析、简历匹配、面试准备工具

## 项目概述

- **名称**: Job Copilot
- **目标**: 为AI/产品/技术类求职者提供智能求职助手
- **核心功能**: JD解析、简历上传匹配、公司分析、面试准备、简历优化

## 当前状态

**Phase 3 - 公司分析与面试准备** ✅ 已完成

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

#### Phase 3 ✅ 已完成
- [x] **公司分析Agent**: ToB/ToC分流 + AI场景分析 + 竞品分析 (gpt-4.1)
- [x] **面试准备Agent**: 自我介绍 + 项目推荐 + 面试题 + PREP回答 (gpt-4.1)
- [x] **面试准备页面**: Tab切换展示各模块
- [x] **复制功能**: 一键复制各模块内容
- [x] **公司分析展示**: 集成到面试准备页

### 待开发功能

- [ ] Phase 4: 简历优化 Agent
- [ ] Phase 5: 体验优化与部署
- [ ] Phase 6: 模型评测与优化

## 访问地址

- **沙箱预览**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai
- **新建岗位**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/job/new
- **岗位库**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/jobs
- **我的简历**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/resume
- **开发方案文档**: https://3000-i6as8vu96xqdxc2jivh8w-ad490db5.sandbox.novita.ai/Job-Copilot-%E5%BC%80%E5%8F%91%E6%96%B9%E6%A1%88%E6%96%87%E6%A1%A3.md

## API 端点

### 页面路由
| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 首页 |
| `/job/new` | GET | 新建岗位解析页 |
| `/job/:id` | GET | 岗位详情页 |
| `/job/:id/match` | GET | 岗位匹配分析页 |
| `/job/:id/interview` | GET | 面试准备页 |
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
| `/api/job/:id/company` | POST | 单独执行公司分析 |
| `/api/job/:id/company` | GET | 获取公司分析结果 |

### 健康检查
| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | API健康检查 |

## Agent 架构

### Phase 3 新增 Agent

#### 公司分析 Agent (company-analyze)
- **模型**: gpt-4.1
- **输入**: 公司名称 + 岗位信息 + A/B分析结果
- **输出**:
  - 公司画像（行业、阶段、规模、业务模式）
  - AI场景分析（当前应用、潜在机会、行业趋势）
  - 竞品分析（竞争对手、差异化）
  - 面试洞察（公司文化、挑战、机会、建议）

#### 面试准备 Agent (interview-prep)
- **模型**: gpt-4.1
- **输入**: 岗位信息 + 简历 + 匹配结果 + 公司分析
- **输出**:
  - 自我介绍（1分钟/2分钟版本 + 表达建议）
  - 项目推荐（1-2个项目 + 讲述侧重点 + 追问预测）
  - 面试题目（关于你/关于公司/关于未来）
  - PREP回答（Point/Reason/Example/Point）
  - 面试策略（目标印象、核心信息、避免话题、反问问题）

### DAG 流程

```
┌─────────────────┐     ┌─────────────────┐
│   JD分析结果    │     │   匹配结果      │
│ (A/B维度)       │     │ (strengths/gaps)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
            ┌───────────────┐
            │ 公司分析Agent │ ← gpt-4.1
            └───────┬───────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
┌────────────────┐   ┌─────────────────┐
│   简历数据     │   │   公司分析结果   │
└────────┬───────┘   └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    │
                    ▼
           ┌───────────────┐
           │ 面试准备Agent │ ← gpt-4.1
           └───────────────┘
                    │
                    ▼
              面试准备材料
```

## 面试准备功能详情

### 自我介绍
- **1分钟版本**: 150-200字，开场+核心经历+求职动机
- **2分钟版本**: 300-400字，完整展示
- **表达建议**: 语速、肢体语言等建议

### 项目推荐
- 选择与目标岗位最匹配的1-2个项目
- 提供STAR故事大纲
- 预测面试官追问

### 面试题目（三类）
| 类型 | 说明 | 分类 |
|------|------|------|
| 关于你 | 过去经历和能力 | 经历/能力/性格 |
| 关于公司 | 对公司岗位的理解 | 理解/动机/规划 |
| 关于未来 | 职业规划和成长 | 规划/趋势/成长 |

### PREP回答结构
- **P**oint（观点）：直接回答问题
- **R**eason（原因）：解释为什么
- **E**xample（例子）：具体案例支撑
- **P**oint（重申）：总结强化观点

## 模型配置

| 用途 | 模型 | Agent |
|------|------|-------|
| 图片理解 | gpt-4o | JD预处理(图片)、简历预处理(文件) |
| 快速文本 | qwen-turbo | JD预处理(文本)、简历预处理(文本) |
| 中等复杂 | qwen-max | JD结构化、A维度分析、简历解析 |
| 高质量生成 | gpt-4.1 | B维度分析、匹配评估、公司分析、面试准备 |

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
│   │   ├── jd-analysis-b.ts
│   │   ├── resume-preprocess.ts
│   │   ├── resume-parse.ts
│   │   ├── match-evaluate.ts
│   │   ├── company-analyze.ts   # Phase 3 新增
│   │   └── interview-prep.ts    # Phase 3 新增
│   ├── core/               # 核心模块
│   │   ├── api-client.ts   # Vectorengine API
│   │   └── dag-executor.ts # DAG执行器
│   ├── routes/             # API路由
│   │   ├── job.ts          # 岗位相关API
│   │   ├── resume.ts       # 简历相关API
│   │   └── interview.ts    # 面试准备API (Phase 3 新增)
│   ├── utils/              # 工具函数
│   │   └── storage.ts      # 存储封装
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

### 2026-01-12 - Phase 3 完成
- 实现公司分析 Agent (ToB/ToC分流 + AI场景 + 竞品)
- 实现面试准备 Agent (自我介绍 + 项目推荐 + 面试题 + PREP)
- 添加面试准备页面 (Tab切换展示各模块)
- 实现一键复制功能
- 集成公司分析展示到面试准备页

### 2026-01-12 - Phase 2 完成
- 实现简历预处理和解析 Agent
- 实现匹配评估 Agent
- 添加简历相关 API 和页面
- 添加岗位匹配页面

### 2026-01-12 - Phase 1 完成
- 实现JD解析完整流程
- 4个Agent: 预处理、结构化、A维度、B维度
- DAG执行器支持依赖管理

### 2026-01-12 - Phase 0 完成
- 项目框架搭建
- Vectorengine API 集成
- 基础UI页面

---

**开发阶段**: Phase 3 - 公司分析与面试准备 ✅
**下一阶段**: Phase 4 - 简历优化
