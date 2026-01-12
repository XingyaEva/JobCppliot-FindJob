# Job Copilot 智能求职助手 - 完整开发方案文档

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

```
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
```

### 2.2 项目结构

```
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
```

### 2.3 API 客户端配置

```typescript
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
```

---

## 3. UI/UX 设计规范

### 3.1 设计原则

1. **简洁至上**：减少视觉干扰，聚焦核心功能
2. **信息层次**：通过排版和颜色区分信息重要性
3. **操作引导**：清晰的操作路径和状态反馈
4. **响应式**：适配桌面端和移动端

### 3.2 配色方案

```css
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
```

### 3.3 组件规范

#### 卡片组件
```css
/* 基础卡片 */
.card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
}

/* 悬停效果 */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

#### 按钮组件
```css
/* 主要按钮 */
.btn-primary {
  background: #000000;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
}

/* 次要按钮 */
.btn-secondary {
  background: white;
  border: 1px solid #E5E7EB;
  padding: 8px 16px;
  border-radius: 8px;
}
```

### 3.4 动画效果

```css
/* 加载动画 */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Agent 状态指示器 */
.agent-running {
  animation: pulse 2s infinite;
}

/* 折叠动画 */
.collapse-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.collapse-content.open {
  max-height: 1000px;
}
```

---

## 4. 页面设计

### 4.1 首页 `/`

**功能**：导航入口、快速操作、最近记录

```
┌────────────────────────────────────────────────────────┐
│  Job Copilot                     简历状态: 已上传 ✓   │
├────────────────────────────────────────────────────────┤
│                                                        │
│    ┌──────────────────────────────────────────┐       │
│    │        + 新建岗位解析                     │       │
│    │     上传 JD 截图 或 粘贴岗位描述          │       │
│    └──────────────────────────────────────────┘       │
│                                                        │
│    最近解析的岗位                        查看全部 →   │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│    │ AI产品  │  │ 后端开发│  │ 数据分析│             │
│    │ 字节跳动│  │ 阿里巴巴│  │ 腾讯    │             │
│    │ ToB AI  │  │ ToC 电商│  │ ToC 游戏│             │
│    └─────────┘  └─────────┘  └─────────┘             │
│                                                        │
│    [岗位库]  [我的简历]  [数据统计]  [设置]           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.2 新建岗位解析页 `/job/new`

**功能**：JD 输入、解析进度展示、结果跳转

```
┌────────────────────────────────────────────────────────┐
│  ← 新建岗位解析                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│    上传 JD 截图                                        │
│    ┌──────────────────────────────────────────┐       │
│    │         ☁️                               │       │
│    │    拖拽图片到此处，或点击选择             │       │
│    │    支持 JPG、PNG 格式                    │       │
│    └──────────────────────────────────────────┘       │
│                                                        │
│                    ─── 或者 ───                       │
│                                                        │
│    粘贴 JD 文本                                        │
│    ┌──────────────────────────────────────────┐       │
│    │ 将岗位描述文本粘贴到这里...              │       │
│    │                                          │       │
│    │                                          │       │
│    └──────────────────────────────────────────┘       │
│                                                        │
│              [ 🪄 开始解析 ]                          │
│                                                        │
│    ┌────────────── 解析进度 ──────────────┐           │
│    │  ✓ JD预处理 (1.2s)                    │           │
│    │  ✓ JD结构化 (2.3s)                    │           │
│    │  ◉ A维度分析 (进行中...)              │           │
│    │  ○ B维度分析                          │           │
│    └──────────────────────────────────────┘           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.3 岗位详情页 `/job/:id`

**功能**：展示结构化 JD、A/B 维度分析结果

```
┌────────────────────────────────────────────────────────┐
│  ← AI产品经理 @ 字节跳动                               │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐         │
│  │  AI产品经理                               │         │
│  │  🏢 字节跳动                              │         │
│  │  📍 北京-海淀  💰 30-60K·16薪            │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  [A] 岗位速览                                          │
│  ┌─────────────┐  ┌─────────────┐                     │
│  │ A1 技术栈   │  │ A2 产品类型 │                     │
│  │ AI/ML/NLP   │  │ ToB         │                     │
│  │ 密度：高    │  │             │                     │
│  └─────────────┘  └─────────────┘                     │
│  ┌─────────────┐  ┌─────────────┐                     │
│  │ A3 业务领域 │  │ A4 团队阶段 │                     │
│  │ AI/金融/电商│  │ 成长期      │                     │
│  └─────────────┘  └─────────────┘                     │
│                                                        │
│  [B] 岗位深度拆解                                      │
│  ┌──────────────────────────────────────────┐         │
│  │ ▼ B1 行业背景要求                        │         │
│  │   是否必需：否                            │         │
│  │   具体行业：AI、金融、电商                │         │
│  │   💡 有AI行业经验优先，但非硬性要求       │         │
│  └──────────────────────────────────────────┘         │
│  ┌──────────────────────────────────────────┐         │
│  │ ▶ B2 技术背景要求                        │         │
│  └──────────────────────────────────────────┘         │
│  ┌──────────────────────────────────────────┐         │
│  │ ▶ B3 产品经验要求                        │         │
│  └──────────────────────────────────────────┘         │
│  ┌──────────────────────────────────────────┐         │
│  │ ▶ B4 产品能力要求                        │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  [📄 上传简历进行匹配]  [📋 查看原始JD]               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.4 我的简历页 `/resume`

**功能**：简历上传、解析状态、能力标签展示

```
┌────────────────────────────────────────────────────────┐
│  ← 我的简历                                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌───────────── 当前简历 ─────────────┐               │
│  │  张三                   ✓ 已解析   │               │
│  │  138xxxx8888 | zhangsan@email.com │               │
│  │  🎯 目标岗位：产品经理             │               │
│  │                                    │               │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ │               │
│  │  │ 行业   │ │ 技术   │ │ 产品   │ │               │
│  │  │电商/AI │ │数据分析│ │ToB/ToC │ │               │
│  │  └────────┘ └────────┘ └────────┘ │               │
│  │                                    │               │
│  │  [👁 查看详情]  [🔄 重新上传]      │               │
│  └────────────────────────────────────┘               │
│                                                        │
│  ─────────── 或上传新简历 ───────────                 │
│                                                        │
│    ┌──────────────────────────────────────────┐       │
│    │         ☁️                               │       │
│    │    拖拽简历文件到此处，或点击选择         │       │
│    │    支持 PDF、Word 格式                   │       │
│    └──────────────────────────────────────────┘       │
│                                                        │
│              [ 🪄 解析简历 ]                          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.5 岗位匹配页 `/job/:id/match`

**功能**：匹配度评估、维度分析、优势差距

```
┌────────────────────────────────────────────────────────┐
│  ← 岗位匹配分析                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌───────────── 匹配概览 ─────────────┐               │
│  │            比较匹配                 │               │
│  │              78/100                 │               │
│  │  ████████████████░░░░░░░░░░░░░░    │               │
│  │                                    │               │
│  │  💡 建议重点准备AI产品方法论和     │               │
│  │     ToB项目经验的表达              │               │
│  └────────────────────────────────────┘               │
│                                                        │
│  维度匹配详情                                          │
│  ┌──────────────────────────────────────────┐         │
│  │ ✅ A3 业务领域    [展开]                 │         │
│  ├──────────────────────────────────────────┤         │
│  │ ✅ B1 行业背景    [展开]                 │         │
│  ├──────────────────────────────────────────┤         │
│  │ ⚠️ B2 技术背景    [展开]                 │         │
│  ├──────────────────────────────────────────┤         │
│  │ ✅ B3 产品经验    [展开]                 │         │
│  ├──────────────────────────────────────────┤         │
│  │ ⚠️ B4 产品能力    [展开]                 │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  ┌───── 你的优势 ─────┐  ┌───── 需要补充 ─────┐      │
│  │ ✓ 电商行业经验丰富 │  │ ⚠ AI产品方法论    │      │
│  │ ✓ ToB产品全周期    │  │ ⚠ 大模型相关经验  │      │
│  │ ✓ 数据分析能力强   │  │                   │      │
│  └────────────────────┘  └────────────────────┘      │
│                                                        │
│  [🎤 生成面试准备 (Phase3)]  [✏️ 优化简历 (Phase4)]  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 5. 多 Agent 编排系统

### 5.1 DAG 执行器设计

```typescript
// src/core/dag-executor.ts

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

class DAGExecutor {
  private nodes: Map<string, DAGNode>;
  private results: Map<string, any>;
  
  async execute(input: any): Promise<DAGState> {
    // 1. 拓扑排序确定执行顺序
    // 2. 按层级并行执行无依赖节点
    // 3. 传递前置节点输出到后续节点
    // 4. 实时更新节点状态
    // 5. 错误处理和重试机制
  }
}
```

### 5.2 JD 解析 DAG

```
┌─────────────┐
│ jd-preprocess │ (图片: gpt-4o / 文本: qwen-turbo)
└──────┬──────┘
       │ cleanedText
       ▼
┌─────────────┐
│ jd-structure  │ (qwen-max)
└──────┬──────┘
       │ structuredJD
       ▼
┌─────────────┐
│ jd-analysis-a │ (qwen-max)
└──────┬──────┘
       │ aAnalysis
       ▼
┌─────────────┐
│ jd-analysis-b │ (gpt-4.1)
└─────────────┘
       │ bAnalysis
       ▼
    完成
```

### 5.3 简历解析 DAG

```
┌─────────────────┐
│ resume-preprocess │ (图片: gpt-4o / 文本: qwen-turbo)
└────────┬────────┘
         │ cleanedText
         ▼
┌─────────────┐
│ resume-parse  │ (qwen-max)
└─────────────┘
         │ structuredResume + abilityTags
         ▼
      完成
```

### 5.4 匹配评估 DAG

```
┌───────────────┐     ┌───────────────┐
│ structuredJD  │     │ structuredResume │
│ + aAnalysis   │     │ + abilityTags    │
│ + bAnalysis   │     │                  │
└───────┬───────┘     └────────┬────────┘
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
          ┌───────────────┐
          │ match-evaluate │ (gpt-4.1)
          └───────────────┘
                   │
                   ▼
              匹配结果
```

### 5.5 面试准备 DAG (Phase 3)

```
┌───────────────┐
│ 匹配结果      │
└───────┬───────┘
        │
   ┌────┴────┐
   │         │
   ▼         ▼
┌──────┐  ┌──────────┐
│公司分析│  │面试准备   │
│(gpt-4.1)│  │(gpt-4.1) │
└──────┘  └──────────┘
   │         │
   └────┬────┘
        │
        ▼
    综合输出
```

---

## 6. 各 Agent 详细设计

### 6.1 JD 预处理 Agent (jd-preprocess)

**功能**：处理图片 OCR 或文本清洗，输出干净的 JD 文本

| 属性 | 值 |
|------|-----|
| **Agent 名称** | jd-preprocess |
| **主模型** | gpt-4o (图片) / qwen-turbo (文本) |
| **备用模型** | gpt-4.1 / qwen-max |
| **输入** | 图片 URL 或文本 |
| **输出** | 清洗后的 JD 文本 |

**Prompt 设计**：

```markdown
## 系统提示词 (图片模式)

你是一个专业的 OCR 文本提取专家。请从图片中提取所有岗位描述相关的文本内容。

### 任务
1. 识别图片中的所有文字
2. 过滤无关内容（广告、导航栏等）
3. 保留岗位相关信息（职责、要求、福利等）
4. 整理格式，便于后续解析

### 输出要求
- 纯文本格式
- 保留原始结构（标题、列表等）
- 删除重复内容
- 修正 OCR 常见错误
```

```markdown
## 系统提示词 (文本模式)

你是一个文本清洗专家。请清洗以下岗位描述文本。

### 任务
1. 去除无关内容（广告、版权声明等）
2. 统一格式（标点、换行）
3. 修正错别字
4. 保持信息完整性

### 输出要求
- 纯文本格式
- 结构清晰
- 便于后续结构化解析
```

---

### 6.2 JD 结构化 Agent (jd-structure)

**功能**：将清洗后的文本转换为结构化 JSON

| 属性 | 值 |
|------|-----|
| **Agent 名称** | jd-structure |
| **主模型** | qwen-max |
| **备用模型** | gpt-4.1 |
| **输入** | 清洗后的 JD 文本 |
| **输出** | 结构化 JD (JSON) |

**Prompt 设计**：

```markdown
## 系统提示词

你是一个专业的职位描述解析专家。请将以下JD文本解析为结构化JSON格式。

## 输出 JSON Schema
{
  "title": "岗位名称",
  "company": "公司名称",
  "location": "工作地点",
  "salary": "薪资范围",
  "responsibilities": ["职责1", "职责2", ...],
  "requirements": ["要求1", "要求2", ...],
  "preferred": ["加分项1", "加分项2", ...],
  "others": {
    "team_size": "团队规模",
    "report_to": "汇报对象",
    "benefits": ["福利1", "福利2", ...]
  }
}

## 解析规则
1. 提取所有可识别的字段
2. 无法识别的字段留空或设为null
3. 职责和要求必须完整提取
4. 直接输出JSON，不要添加markdown代码块
```

---

### 6.3 JD A 维度分析 Agent (jd-analysis-a)

**功能**：从技术栈、产品类型、业务领域、团队阶段四个维度分析 JD

| 属性 | 值 |
|------|-----|
| **Agent 名称** | jd-analysis-a |
| **主模型** | qwen-max |
| **备用模型** | gpt-4.1 |
| **输入** | 结构化 JD |
| **输出** | A 维度分析结果 |

**Prompt 设计**：

```markdown
## 系统提示词

你是一个资深的求职顾问，擅长从JD中提取关键信息帮助求职者快速了解岗位。

## 分析维度

### A1: 技术栈分析
- 提取JD中提到的所有技术关键词
- 判断技术密度：高/中/低
- 高密度：超过5个技术要求，技术是核心能力
- 中密度：3-5个技术要求，技术是辅助能力
- 低密度：1-2个或无技术要求

### A2: 产品类型判断
- ToB：面向企业的产品
- ToC：面向消费者的产品
- ToG：面向政府的产品
- 平台型：双边市场产品
- 基础设施：开发者工具、中间件等

### A3: 业务领域识别
- 主要领域：最核心的业务方向
- 次要领域：其他相关业务方向
- 领域示例：电商、金融、AI、教育、社交、游戏、企业服务等

### A4: 团队阶段判断
- 从0到1：全新产品，需要探索和创新
- 成长期：产品已验证，需要快速迭代
- 成熟期：产品稳定，需要精细化运营
- 转型期：业务调整，需要创新突破

## 输出 JSON Schema
{
  "A1_tech_stack": {
    "keywords": ["技术1", "技术2"],
    "density": "高/中/低",
    "summary": "一句话总结技术要求"
  },
  "A2_product_type": {
    "type": "ToB/ToC/ToG/平台型/基础设施",
    "reason": "判断依据"
  },
  "A3_business_domain": {
    "primary": "主要领域",
    "secondary": ["次要领域1", "次要领域2"],
    "summary": "领域特点总结"
  },
  "A4_team_stage": {
    "stage": "从0到1/成长期/成熟期/转型期",
    "evidence": ["判断依据1", "判断依据2"],
    "summary": "团队阶段总结"
  }
}

## 注意事项
- 所有判断必须基于JD原文，不要推测
- 如果信息不足，标注为"未明确"
- 直接输出JSON，不要添加markdown代码块
```

---

### 6.4 JD B 维度分析 Agent (jd-analysis-b)

**功能**：深度分析行业要求、技术要求、产品经验、能力要求

| 属性 | 值 |
|------|-----|
| **Agent 名称** | jd-analysis-b |
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 结构化 JD + A 维度分析结果 |
| **输出** | B 维度深度分析 |

**Prompt 设计**：

```markdown
## 系统提示词

你是一个资深HR和求职教练，擅长深度解读JD中的隐含要求，帮助求职者精准匹配。

## 分析维度

### B1: 行业背景要求
分析JD对行业经验的要求程度：
- required: 是否为硬性要求（true/false）
- preferred: 是否为优先条件（true/false）
- years: 年限要求（如"3年以上"、"不限"）
- specific_industry: 具体行业名称
- summary: 一句人话总结

### B2: 技术背景要求
分析技术能力要求的深度：
- education: 学历要求
- tech_depth: 技术能力要求层次
  - "了解": 基础认知即可
  - "熟悉": 有实践经验
  - "精通": 深度专业能力
- summary: 一句人话总结

### B3: 产品经验要求
分析产品经历要求：
- product_types: 要求的产品类型经验
- need_full_cycle: 是否需要全周期经验
- need_0to1: 是否需要从0到1经验
- summary: 一句人话总结

### B4: 产品能力要求
分析软技能要求：
- capabilities: 能力列表
  - name: 能力名称
  - detail: 具体要求描述
- summary: 一句人话总结

## 输出 JSON Schema
{
  "B1_industry_requirement": {
    "required": true/false,
    "preferred": true/false,
    "years": "年限要求",
    "specific_industry": "具体行业",
    "key_sentence": "JD原文关键句",
    "summary": "人话总结"
  },
  "B2_tech_requirement": {
    "education": "学历要求",
    "tech_depth": {
      "了解": ["技术1"],
      "熟悉": ["技术2"],
      "精通": ["技术3"]
    },
    "key_sentence": "JD原文关键句",
    "summary": "人话总结"
  },
  "B3_product_experience": {
    "product_types": ["产品类型1", "产品类型2"],
    "need_full_cycle": true/false,
    "need_0to1": true/false,
    "key_sentence": "JD原文关键句",
    "summary": "人话总结"
  },
  "B4_capability_requirement": {
    "capabilities": [
      {"name": "能力名", "detail": "具体描述"}
    ],
    "key_sentence": "JD原文关键句",
    "summary": "人话总结"
  }
}

## 注意事项
- 提取JD原文作为判断依据（key_sentence）
- summary 用口语化的"人话"表达
- 直接输出JSON，不要添加markdown代码块
```

---

### 6.5 简历预处理 Agent (resume-preprocess)

**功能**：处理简历文件（PDF/Word）或文本，输出干净文本

| 属性 | 值 |
|------|-----|
| **Agent 名称** | resume-preprocess |
| **主模型** | gpt-4o (文件) / qwen-turbo (文本) |
| **备用模型** | gpt-4.1 / qwen-max |
| **输入** | 简历文件或文本 |
| **输出** | 清洗后的简历文本 |

**Prompt 设计**：

```markdown
## 系统提示词

你是一个专业的简历解析专家。请从输入内容中提取简历信息。

### 任务
1. 识别简历中的所有文字内容
2. 整理为结构清晰的文本
3. 保留关键信息：
   - 个人基本信息
   - 教育背景
   - 工作经历
   - 项目经验
   - 技能证书
4. 去除格式干扰（表格边框、页眉页脚等）

### 输出要求
- 纯文本格式
- 保持原有信息层次
- 时间线清晰
- 内容完整无遗漏
```

---

### 6.6 简历解析 Agent (resume-parse)

**功能**：将简历文本转换为结构化数据，并提取能力标签

| 属性 | 值 |
|------|-----|
| **Agent 名称** | resume-parse |
| **主模型** | qwen-max |
| **备用模型** | gpt-4.1 |
| **输入** | 清洗后的简历文本 |
| **输出** | 结构化简历 + 能力标签 |

**Prompt 设计**：

```markdown
## 系统提示词

你是一个专业的简历解析和能力评估专家。请解析简历并提取能力标签。

## 输出 JSON Schema
{
  "basic_info": {
    "name": "姓名",
    "contact": "联系方式",
    "target_position": "目标岗位"
  },
  "education": [
    {
      "school": "学校",
      "major": "专业",
      "degree": "学历",
      "duration": "时间段"
    }
  ],
  "work_experience": [
    {
      "company": "公司",
      "position": "职位",
      "duration": "时间段",
      "description": "工作描述"
    }
  ],
  "projects": [
    {
      "name": "项目名",
      "role": "角色",
      "duration": "时间段",
      "description": "项目描述",
      "achievements": ["成果1", "成果2"],
      "tech_stack": ["技术1", "技术2"]
    }
  ],
  "skills": ["技能1", "技能2"],
  "ability_tags": {
    "industry": ["行业标签1", "行业标签2"],
    "technology": ["技术标签1", "技术标签2"],
    "product": ["产品标签1", "产品标签2"],
    "capability": ["能力标签1", "能力标签2"]
  }
}

## 能力标签提取规则

### industry (行业标签)
基于工作经历判断：电商、金融、AI、教育、医疗、社交、游戏、企业服务等

### technology (技术标签)
基于技能和项目判断：数据分析、AI/ML、前端、后端、移动端等

### product (产品标签)
基于产品经验判断：ToB、ToC、SaaS、平台、工具、内容等

### capability (能力标签)
基于描述判断：需求分析、产品设计、项目管理、数据驱动、沟通协调、团队管理等

## 注意事项
- 只提取简历中明确体现的能力
- 每个标签类别提取2-5个最相关的标签
- 直接输出JSON，不要添加markdown代码块
```

---

### 6.7 匹配评估 Agent (match-evaluate)

**功能**：基于简历和 JD 分析结果，进行多维度匹配评估

| 属性 | 值 |
|------|-----|
| **Agent 名称** | match-evaluate |
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 结构化简历 + JD 分析结果 |
| **输出** | 匹配评估结果 |

**Prompt 设计**：

```markdown
## 系统提示词

你是一个资深的招聘匹配分析专家，擅长评估候选人与岗位的匹配度。

## 匹配度等级规则（严格遵循）
| 等级 | 条件 | 分数区间 |
|------|------|----------|
| 非常匹配 | A3业务领域一致 + B1-B4全部满足(4项) | 85-100 |
| 比较匹配 | A3一致 + B1-B4满足3项 | 70-84 |
| 匹配度还可以 | A3相关 + B1-B4满足2项 | 55-69 |
| 不是很匹配 | A3不相关 或 B1-B4仅满足1项 | 40-54 |
| 不匹配 | B1-B4均不满足 | 0-39 |

## 维度匹配判断标准

### A3 业务领域
- ✅ 匹配：简历行业经验与岗位业务领域一致
- ⚠️ 部分：有相关行业经验但不完全一致
- ❌ 不匹配：没有相关行业经验

### B1 行业背景
- ✅ 匹配：满足行业经验年限要求
- ⚠️ 部分：有经验但年限不足
- ❌ 不匹配：完全没有相关行业经验

### B2 技术背景
- ✅ 匹配：学历达标 + 技术能力基本符合
- ⚠️ 部分：学历或技术能力有一项不足
- ❌ 不匹配：学历和技术能力都不符合

### B3 产品经验
- ✅ 匹配：产品类型经验匹配 + 全周期/0-1经验符合
- ⚠️ 部分：产品类型相关但细分不同
- ❌ 不匹配：产品类型完全不同

### B4 产品能力
- ✅ 匹配：核心能力要求全部具备
- ⚠️ 部分：具备大部分能力，有1-2项欠缺
- ❌ 不匹配：核心能力缺失较多

## 输出 JSON Schema
{
  "match_level": "非常匹配/比较匹配/匹配度还可以/不是很匹配/不匹配",
  "match_score": 0-100,
  "dimension_match": {
    "A3_business_domain": {
      "status": "✅/⚠️/❌",
      "jd_requirement": "JD要求",
      "resume_match": "简历情况",
      "gap_analysis": "差距分析"
    },
    "B1_industry": { ... },
    "B2_tech": { ... },
    "B3_product": { ... },
    "B4_capability": { ... }
  },
  "strengths": ["优势1", "优势2"],
  "gaps": ["差距1", "差距2"],
  "interview_focus_suggestion": "面试重点建议"
}

## 注意事项
- 客观评估，不过度推断
- match_score 与 match_level 一致
- strengths 至少2-3条
- 直接输出JSON，不要添加markdown代码块
```

---

### 6.8 公司分析 Agent (company-analyze) - Phase 3

| 属性 | 值 |
|------|-----|
| **Agent 名称** | company-analyze |
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 公司名称 + 岗位信息 |
| **输出** | 公司分析 + AI场景 + 竞品分析 |

---

### 6.9 面试准备 Agent (interview-prep) - Phase 3

| 属性 | 值 |
|------|-----|
| **Agent 名称** | interview-prep |
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 匹配结果 + 简历 + JD |
| **输出** | 面试问题预测 + 自我介绍 + PREP回答 |

---

### 6.10 简历优化 Agent (resume-optimize) - Phase 4

| 属性 | 值 |
|------|-----|
| **Agent 名称** | resume-optimize |
| **主模型** | gpt-4.1 |
| **备用模型** | qwen-max |
| **输入** | 匹配结果 + 原始简历 |
| **输出** | 优化建议 + 优化后内容 |

---

## 7. API 接口设计

### 7.1 岗位相关 API

#### POST /api/job/parse-sync

**同步解析 JD**

请求体：
```json
{
  "type": "image" | "text",
  "content": "JD文本内容",
  "imageUrl": "图片URL或Base64"
}
```

响应：
```json
{
  "success": true,
  "job": {
    "id": "xxx",
    "title": "岗位名称",
    "company": "公司",
    "status": "completed",
    "structured_jd": { ... },
    "a_analysis": { ... },
    "b_analysis": { ... },
    "created_at": "2026-01-12T..."
  },
  "dagState": {
    "nodes": [
      { "id": "preprocess", "name": "JD预处理", "status": "completed" },
      ...
    ],
    "current_phase": 4,
    "total_phases": 4,
    "is_complete": true
  }
}
```

#### GET /api/jobs

**获取岗位列表**

响应：
```json
{
  "success": true,
  "jobs": [
    { "id": "xxx", "title": "...", "company": "...", ... }
  ]
}
```

#### GET /api/job/:id

**获取岗位详情**

响应：
```json
{
  "success": true,
  "job": { ... }
}
```

#### DELETE /api/job/:id

**删除岗位**

响应：
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 7.2 简历相关 API

#### POST /api/resume/parse

**解析简历**

请求体：
```json
{
  "type": "file" | "text",
  "content": "简历文本",
  "fileData": "Base64编码的文件",
  "fileName": "resume.pdf"
}
```

响应：
```json
{
  "success": true,
  "resume": {
    "id": "xxx",
    "basic_info": { ... },
    "education": [ ... ],
    "work_experience": [ ... ],
    "projects": [ ... ],
    "skills": [ ... ],
    "ability_tags": { ... },
    "status": "completed"
  },
  "dagState": { ... }
}
```

#### GET /api/resume

**获取所有简历**

#### GET /api/resume/:id

**获取简历详情**

#### DELETE /api/resume/:id

**删除简历**

### 7.3 匹配相关 API

#### POST /api/job/:id/match

**执行匹配评估**

请求体：
```json
{
  "resumeId": "简历ID"
}
```

响应：
```json
{
  "success": true,
  "match": {
    "id": "xxx",
    "job_id": "xxx",
    "resume_id": "xxx",
    "match_level": "比较匹配",
    "match_score": 78,
    "dimension_match": { ... },
    "strengths": [ ... ],
    "gaps": [ ... ],
    "interview_focus_suggestion": "...",
    "created_at": "..."
  }
}
```

#### GET /api/job/:id/match

**获取匹配结果**

### 7.4 健康检查

#### GET /api/health

响应：
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T...",
  "version": "0.3.0",
  "phase": "Phase 2 - 简历解析与匹配"
}
```

---

## 8. 数据模型

### 8.1 Job (岗位)

```typescript
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
```

### 8.2 Resume (简历)

```typescript
interface Resume {
  id: string;
  raw_content: string;
  basic_info: {
    name: string;
    contact: string;
    target_position: string;
  };
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  skills: string[];
  ability_tags: AbilityTags;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}
```

### 8.3 Match (匹配结果)

```typescript
interface Match {
  id: string;
  job_id: string;
  resume_id: string;
  match_level: MatchLevel;
  match_score: number;
  dimension_match: {
    A3_business_domain: DimensionMatch;
    B1_industry: DimensionMatch;
    B2_tech: DimensionMatch;
    B3_product: DimensionMatch;
    B4_capability: DimensionMatch;
  };
  strengths: string[];
  gaps: string[];
  interview_focus_suggestion: string;
  created_at: string;
}

type MatchLevel = 
  | '非常匹配' 
  | '比较匹配' 
  | '匹配度还可以' 
  | '不是很匹配' 
  | '不匹配';
```

### 8.4 存储方案

当前使用浏览器 localStorage 存储：

```typescript
const STORAGE_KEYS = {
  JOBS: 'jobcopilot_jobs',
  RESUMES: 'jobcopilot_resumes',
  MATCHES: 'jobcopilot_matches',
  INTERVIEWS: 'jobcopilot_interviews',
  OPTIMIZATIONS: 'jobcopilot_optimizations',
};
```

后续可迁移至 Cloudflare D1/KV 实现持久化。

---

## 9. 开发路线图

### Phase 0: 项目初始化 ✅ 已完成

- [x] Hono + TypeScript 项目搭建
- [x] Vectorengine API 客户端集成
- [x] 类型系统定义
- [x] 本地存储封装
- [x] 基础 UI 组件

### Phase 1: JD 解析 ✅ 已完成

- [x] JD 预处理 Agent（图片 OCR + 文本清洗）
- [x] JD 结构化 Agent
- [x] JD A 维度分析 Agent
- [x] JD B 维度分析 Agent
- [x] DAG 执行器
- [x] 新建解析页面
- [x] 岗位详情页面
- [x] 岗位库页面

### Phase 2: 简历解析与匹配 ✅ 进行中

- [x] 简历预处理 Agent
- [x] 简历解析 Agent
- [x] 匹配评估 Agent
- [x] 简历 API 路由
- [x] 我的简历页面
- [x] 岗位匹配页面
- [ ] 完整功能测试

### Phase 3: 面试准备（计划中）

- [ ] 公司分析 Agent
- [ ] 面试问题预测 Agent
- [ ] 自我介绍生成 Agent
- [ ] 项目推荐 Agent
- [ ] 面试准备页面

### Phase 4: 简历优化（计划中）

- [ ] 简历优化 Agent
- [ ] 优化建议展示
- [ ] 一键优化功能
- [ ] 优化前后对比

---

## 10. 部署与运维

### 10.1 本地开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 启动开发服务器
npm run dev:sandbox

# 使用 PM2 管理
pm2 start ecosystem.config.cjs
```

### 10.2 Cloudflare 部署

```bash
# 登录 Cloudflare
npx wrangler login

# 部署到 Pages
npm run deploy
```

### 10.3 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| VECTORENGINE_API_KEY | API 密钥 | 是 |
| NODE_ENV | 环境标识 | 否 |

### 10.4 监控指标

- API 响应时间
- Agent 执行时间
- 错误率
- 用户操作埋点

---

## 附录

### A. 常见问题

**Q: 为什么选择 Vectorengine API？**
A: 统一的接口管理多个模型（GPT-4o/Qwen/GPT-4.1），简化开发复杂度。

**Q: 为什么使用 localStorage 而不是数据库？**
A: Phase 0-2 优先验证核心功能，后续迁移至 Cloudflare D1。

**Q: 如何处理大文件简历？**
A: 当前通过 Base64 传输，建议使用 Cloudflare R2 存储。

### B. 更新日志

- **2026-01-12**: Phase 2 简历解析与匹配功能完成
- **2026-01-12**: Phase 1 JD 解析功能完成
- **2026-01-12**: Phase 0 项目初始化完成

---

> 文档版本: v1.0  
> 最后更新: 2026-01-12  
> 作者: Job Copilot Team
