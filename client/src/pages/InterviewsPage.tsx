/**
 * InterviewsPage — 面试工作台
 *
 * A4 API 接入版本:
 * - 题库通过 useQuestions() 从后端获取（fallback to mock data）
 * - 提交回答通过 useSubmitAnswer
 * - AI 反馈通过 useRequestFeedback
 * - 面试准备通过 useInterviewPrep/useGenerateInterviewPrep
 * - 公司分析通过 useCompanyAnalysis
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { 
  Search, 
  Plus, 
  Filter,
  ChevronRight,
  Sparkles,
  Mic,
  FileText,
  Trash2,
  Copy,
  RotateCcw,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  BookmarkPlus,
  Eye,
  MoreHorizontal,
  Upload,
  Link as LinkIcon,
  Star,
  ExternalLink,
  Clock,
  BarChart3,
  Flame,
  Lightbulb,
  Loader2,
} from "lucide-react";
import {
  useQuestions,
  useQuestionAnswers,
  useSubmitAnswer,
  useRequestFeedback,
  useSuggestQuestions,
  useImportFromInterview,
} from "../hooks";
import { toast } from "sonner";
import { useGuestCheck } from "../hooks/useGuestCheck";
import { useQuotaCheck } from "../hooks/useQuotaCheck";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { UpgradeInterceptModal } from "../components/UpgradeInterceptModal";

// A4: 时间差格式化
function formatTimeDiff(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return date.toLocaleDateString("zh-CN");
  } catch {
    return dateStr;
  }
}
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InterviewBankMiddleColumn } from "../components/InterviewBankMiddleColumn";
import { InterviewBankRightColumn } from "../components/InterviewBankRightColumn";
import { InterviewSimulationMiddleColumn } from "../components/InterviewSimulationMiddleColumn";
import { InterviewSimulationRightColumn } from "../components/InterviewSimulationRightColumn";
import { InterviewAssistantMiddleColumn } from "../components/InterviewAssistantMiddleColumn";
import { InterviewAssistantRightColumn } from "../components/InterviewAssistantRightColumn";
import { EmergencyHelpModal } from "../components/EmergencyHelpModal";
import { InterviewReviewLeftColumn } from "../components/InterviewReviewLeftColumn";
import { InterviewReviewMiddleColumn } from "../components/InterviewReviewMiddleColumn";
import { InterviewReviewRightColumn } from "../components/InterviewReviewRightColumn";

// 题目数据（增强版）
const interviewQuestions = [
  {
    id: 1,
    title: "请介绍一个你做过的 AI 产品项目",
    type: "行为面",
    category: "AI 场景",
    source: "根据字节跳动 AI 产品经理岗位生成",
    lastPractice: "2天前",
    score: 7.5,
    mastery: "中等",
    intent: "面试官想看你是否具备项目拆解能力、资源判断能力，以及对 AI 场景落地的实际理解。",
    practiceCount: 3,
    averageScore: 6.8,
    bestScore: 7.5,
    structure: {
      steps: [
        {
          title: "项目背景",
          timePercent: "20%",
          points: [
            "业务场景和痛点",
            "为什么选择这个项目",
            "项目的战略意义"
          ]
        },
        {
          title: "判断与决策",
          timePercent: "30%",
          points: [
            "价值评估的维度",
            "资源投入的判断过程",
            "技术可行性分析"
          ]
        },
        {
          title: "执行过程",
          timePercent: "30%",
          points: [
            "关键动作和里程碑",
            "遇到的挑战和解决方案",
            "团队协作方式"
          ]
        },
        {
          title: "结果与反思",
          timePercent: "20%",
          points: [
            "量化结果和业务影响",
            "个人收获和能力提升",
            "可复用的方法论"
          ]
        }
      ]
    },
    standardAnswer: "这个项目是我在 2023 年主导的一个 AI 内容推荐系统。当时用户内容消费效率较低，平均停留时长只有 8 分钟。我判断这个问题值得投入资源的原因有三点：第一，数据显示用户流失主要发生在前 3 分钟，说明冷启动是核心痛点；第二，我们已有较完整的用户行为数据，技术可行性高；第三，竞品已验证推荐系统能带来 30% 以上的停留时长提升。\n\n项目执行中，我负责需求拆解、算法协同和效果评估。最关键的决策是选择了协同过滤 + 内容理解的混合策略，而不是纯深度学习方案，因为我们的数据量还不足以支撑后者。过程中最大的挑战是冷启动用户的推荐效果差，我们通过引入内容标签和用户画像预测解决了这个问题。\n\n最终推荐点击率提升了 30%，用户停留时长增加到 23 分钟，这个结果直接推动了 DAU 提升 25%。这个经历让我深刻理解了如何用数据判断项目价值，以及如何在资源约束下做技术选型。",
    referenceCount: 2341,
    practiceHistory: [
      { date: "2天前", score: 7.5, improvement: "补充了数据支撑，结构更清晰" },
      { date: "5天前", score: 6.8, improvement: "增加了判断过程的细节描述" },
      { date: "1周前", score: 6.2, improvement: "首次练习，结构基本完整" }
    ],
    relatedJobs: [
      { company: "字节跳动", position: "AI 产品经理", relevance: "高相关", status: "已投递" },
      { company: "阿里巴巴", position: "高级产品经理", relevance: "中相关", status: "待研究" }
    ],
    relatedQuestions: [2, 4]
  },
  {
    id: 2,
    title: "描述一次你如何解决技术难题的经历",
    type: "项目面",
    category: "技术深度",
    source: "系统推荐 · 高频题",
    lastPractice: "5天前",
    score: 8.2,
    mastery: "良好",
    intent: "考察你的技术深度、问题分析能力和解决方案设计能力。",
    practiceCount: 4,
    averageScore: 7.8,
    bestScore: 8.2,
    structure: {
      steps: [
        {
          title: "问题背景",
          timePercent: "15%",
          points: [
            "技术问题的表现和影响",
            "业务紧急程度",
            "初步的问题假设"
          ]
        },
        {
          title: "问题分析",
          timePercent: "35%",
          points: [
            "如何定位问题根因",
            "使用的分析工具和方法",
            "排查过程中的关键发现"
          ]
        },
        {
          title: "解决方案",
          timePercent: "35%",
          points: [
            "方案设计思路",
            "为什么选择这个方案",
            "实施过程和验证方法"
          ]
        },
        {
          title: "结果和沉淀",
          timePercent: "15%",
          points: [
            "问题解决效果",
            "举一反三的机制建设",
            "技术沉淀和文档"
          ]
        }
      ]
    },
    standardAnswer: "在一个高并发电商项目中，我们遇到了订单系统在大促期间频繁超时的问题。当时业务方非常焦急，因为这直接影响转化率，每分钟损失预估在 10 万元以上。\n\n我第一时间组织了技术攻关小组。通过监控数据分析，我发现问题集中在订单创建的库存扣减环节。进一步排查发现，是 MySQL 行锁导致的锁等待问题。当时有三个方案：1) 优化 SQL；2) 分库分表；3) 引入 Redis 预扣减。考虑到时间紧迫，我选择了方案 1 + 方案 3 的组合：先优化热点商品的查询路径，同时用 Redis 做库存缓存和预扣减，最后用异步队列同步到 MySQL。\n\n实施后，订单创建的 P99 延迟从 3 秒降到 200ms，系统在大促期间稳定运行，成功支撑了 5 倍于平时的流量。这次经历让我学会了在高压下快速定位问题的方法，以及如何在完美方案和时间窗口之间做权衡。事后我们还整理了《高并发场景技术选型指南》，避免类似问题再次发生。",
    referenceCount: 3892,
    practiceHistory: [
      { date: "5天前", score: 8.2, improvement: "增加了方案对比和权衡思考" },
      { date: "1周前", score: 7.9, improvement: "补充了问题定位的具体过程" },
      { date: "2周前", score: 7.5, improvement: "强化了结果量化和业务影响" },
      { date: "3周前", score: 7.3, improvement: "首次练习，技术描述清晰" }
    ],
    relatedJobs: [
      { company: "字节跳动", position: "前端技术专家", relevance: "高相关", status: "已投递" },
      { company: "腾讯", position: "高级前端工程师", relevance: "高相关", status: "待投递" }
    ],
    relatedQuestions: [5, 1]
  },
  {
    id: 3,
    title: "如何平衡产品创新与用户体验",
    type: "业务面",
    category: "产品策略",
    source: "我的薄弱项",
    lastPractice: "未练习",
    score: null,
    mastery: "待练习",
    intent: "评估你对产品价值权衡的理解，以及在资源有限情况下的决策能力。",
    practiceCount: 0,
    averageScore: 0,
    bestScore: 0,
    structure: {
      steps: [
        {
          title: "问题理解",
          timePercent: "20%",
          points: [
            "创新与体验的本质矛盾",
            "你对「平衡」的定义",
            "具体场景举例"
          ]
        },
        {
          title: "判断框架",
          timePercent: "40%",
          points: [
            "如何评估创新的价值",
            "如何衡量体验损失",
            "决策的优先级原则"
          ]
        },
        {
          title: "实践案例",
          timePercent: "30%",
          points: [
            "具体项目经历",
            "权衡过程和最终决策",
            "结果和反思"
          ]
        },
        {
          title: "方法论总结",
          timePercent: "10%",
          points: [
            "可复用的决策模型",
            "团队如何达成共识",
            "持续优化机制"
          ]
        }
      ]
    },
    standardAnswer: "我认为产品创新和用户体验并不是完全对立的，关键在于找到合适的切入点和节奏。在我过去的经历中，我主要通过三个维度来做平衡：用户价值、商业价值和技术可行性。\n\n举个例子，我们曾计划在工具类产品中引入 AI 对话功能。这是个很创新的想法，但担心会破坏原有的简洁体验。我的判断过程是：首先，通过用户调研发现，30% 的用户有「不知道如何使用高级功能」的痛点，AI 对话可以解决这个问题，所以用户价值是成立的。其次，这个功能可以提升付费转化率，商业价值也成立。但技术上，如果做成强制入口，会影响熟练用户的效率。\n\n最终我们采取了「渐进式创新」的策略：AI 对话作为可选功能，默认收起，只在新用户首次使用时主动引导。这样既保留了创新点，又不影响老用户体验。上线后，新用户的功能激活率提升了 45%，老用户的流失率没有明显变化。\n\n这个经历让我明白，平衡的本质不是妥协，而是找到创新和体验的交集。方法论上，我会用「分层发布 + A/B 测试」来验证，避免一刀切的决策。",
    referenceCount: 1876,
    practiceHistory: [],
    relatedJobs: [
      { company: "阿里巴巴", position: "高级产品经理", relevance: "高相关", status: "待研究" },
      { company: "美团", position: "产品专家", relevance: "中相关", status: "待研究" }
    ],
    relatedQuestions: [4, 7]
  },
  {
    id: 4,
    title: "如何评估一个 AI 功能的价值",
    type: "AI 场景",
    category: "价值判断",
    source: "根据阿里 AI 产品岗位生成",
    lastPractice: "1周前",
    score: 6.8,
    mastery: "需提升",
    intent: "考察你对 AI 产品价值的判断框架和商业思维。",
    practiceCount: 2,
    averageScore: 6.5,
    bestScore: 6.8,
    structure: {
      steps: [
        {
          title: "价值维度拆解",
          timePercent: "30%",
          points: [
            "用户价值：解决什么问题",
            "商业价值：如何变现或增长",
            "技术价值：是否有壁垒",
            "成本评估：投入产出比"
          ]
        },
        {
          title: "评估方法",
          timePercent: "30%",
          points: [
            "定量指标：数据如何衡量",
            "定性判断：用户反馈方式",
            "对比基准：与现有方案的差异"
          ]
        },
        {
          title: "实践案例",
          timePercent: "30%",
          points: [
            "具体的 AI 功能项目",
            "如何做价值评估",
            "最终决策和结果"
          ]
        },
        {
          title: "决策框架",
          timePercent: "10%",
          points: [
            "可复用的评估模型",
            "快速验证的方法"
          ]
        }
      ]
    },
    standardAnswer: "评估 AI 功能的价值，我会用「用户价值 × 商业价值 × 技术可行性 - 成本」这个公式来思考。\n\n以我之前负责的「AI 简历优化」功能为例。用户价值方面，我们发现 70% 的用户简历存在格式混乱、重点不突出的问题，传统的模板解决不了个性化需求，AI 可以根据岗位要求自动优化，这是刚需。商业价值上，这个功能可以作为付费点，我们预估可以提升 20% 的会员转化率。技术可行性方面，我们已有简历解析和 NLP 的技术积累，成本可控。\n\n具体评估时，我们做了 MVP 验证：先用人工模拟 AI 的效果，给 100 个用户提供优化建议，观察他们的使用意愿和付费意愿。结果显示，85% 的用户认为有价值，40% 愿意为此付费。基于这个数据，我们决定投入开发。\n\n上线后，功能使用率达到 60%，会员转化率提升了 18%，接近预期。但我们也发现，AI 生成的内容有时过于模板化，用户满意度只有 75 分。于是我们迭代了「AI + 人工润色」的混合方案，满意度提升到 88 分。\n\n这个经历让我明白，评估 AI 功能不能只看技术炫酷，要回归用户价值和商业本质。同时，要用低成本的方式快速验证，避免大投入后发现方向错误。",
    referenceCount: 2103,
    practiceHistory: [
      { date: "1周前", score: 6.8, improvement: "补充了定量评估方法" },
      { date: "3周前", score: 6.2, improvement: "首次练习，案例不够具体" }
    ],
    relatedJobs: [
      { company: "阿里巴巴", position: "AI 产品经理", relevance: "高相关", status: "待研究" },
      { company: "字节跳动", position: "AI 产品经理", relevance: "高相关", status: "已投递" }
    ],
    relatedQuestions: [1, 3]
  },
  {
    id: 5,
    title: "前端性能优化的实践经验",
    type: "技术深度",
    category: "工程能力",
    source: "系统推荐 · 本周重点",
    lastPractice: "3天前",
    score: 8.5,
    mastery: "良好",
    intent: "深度考察你的前端技术能力和工程实践经验。",
    practiceCount: 5,
    averageScore: 8.1,
    bestScore: 8.5,
    structure: {
      steps: [
        {
          title: "性能问题诊断",
          timePercent: "25%",
          points: [
            "如何发现性能问题",
            "使用的分析工具",
            "问题的量化指标"
          ]
        },
        {
          title: "优化方案设计",
          timePercent: "40%",
          points: [
            "针对性的优化策略",
            "技术方案选型",
            "优化的优先级排序"
          ]
        },
        {
          title: "实施和验证",
          timePercent: "25%",
          points: [
            "具体的实施过程",
            "遇到的技术挑战",
            "优化效果的对比"
          ]
        },
        {
          title: "长期机制",
          timePercent: "10%",
          points: [
            "性能监控体系",
            "团队规范建设"
          ]
        }
      ]
    },
    standardAnswer: "我在一个 ToB SaaS 产品中主导了一次全面的性能优化，将首屏加载时间从 8 秒降到 2.5 秒，用户体验显著提升。\n\n问题诊断阶段，我使用 Lighthouse 和 Chrome DevTools 进行分析，发现主要瓶颈有三个：1) 首屏 JS bundle 体积达到 2.5MB；2) 首页请求了 40+ 个接口，串行执行；3) 图片未做压缩和懒加载。基于 FCP、LCP、TTI 三个核心指标，我制定了优化计划。\n\n技术方案上，我采取了分层优化策略：第一层是「快速见效」的优化，包括代码分割（按路由拆分，首屏 bundle 降到 600KB）、接口合并（将 40 个请求优化为 8 个）、图片懒加载和 WebP 格式。第二层是「架构化」，引入了 SSR 预渲染关键路径，以及 Service Worker 做资源缓存。\n\n实施过程中，最大的挑战是 SSR 改造成本高，我们采取了「关键页面先行」的策略，优先优化首页和核心功能页。同时为了避免缓存问题，我们引入了版本化的资源管理方案。\n\n最终效果非常显著：FCP 从 5s 降到 1.2s，LCP 从 8s 降到 2.5s，用户的跳出率下降了 35%。更重要的是，我们建立了性能监控平台，每次发布都会自动跑性能测试，确保不会性能回退。\n\n这次优化让我深刻理解了性能优化不是单点技术问题，而是系统性工程，需要从诊断、设计、实施到监控形成闭环。",
    referenceCount: 4521,
    practiceHistory: [
      { date: "3天前", score: 8.5, improvement: "补充了长期监控机制" },
      { date: "1周前", score: 8.3, improvement: "增加了技术挑战的描述" },
      { date: "2周前", score: 8.0, improvement: "强化了结果量化" },
      { date: "3周前", score: 7.8, improvement: "增加了方案对比" },
      { date: "1个月前", score: 7.6, improvement: "首次练习，技术深度足够" }
    ],
    relatedJobs: [
      { company: "字节跳动", position: "前端技术专家", relevance: "高相关", status: "已投递" },
      { company: "阿里巴巴", position: "前端架构师", relevance: "高相关", status: "待研究" }
    ],
    relatedQuestions: [2, 8]
  },
  {
    id: 6,
    title: "如何推动跨部门合作",
    type: "团队协作",
    category: "软技能",
    source: "系统推荐 · 高频题",
    lastPractice: "未练习",
    score: null,
    mastery: "待练习",
    intent: "评估你的沟通能力、协调能力和项目推进能力。",
    practiceCount: 0,
    averageScore: 0,
    bestScore: 0,
    structure: {
      steps: [
        {
          title: "背景和挑战",
          timePercent: "20%",
          points: [
            "跨部门合作的具体场景",
            "面临的主要困难",
            "各方的诉求和矛盾点"
          ]
        },
        {
          title: "推动策略",
          timePercent: "40%",
          points: [
            "如何对齐目标和利益",
            "建立信任的方法",
            "协调机制的设计",
            "关键节点的把控"
          ]
        },
        {
          title: "执行过程",
          timePercent: "30%",
          points: [
            "具体的推动动作",
            "遇到阻力时的应对",
            "如何保持项目进度"
          ]
        },
        {
          title: "结果和复盘",
          timePercent: "10%",
          points: [
            "合作的最终成果",
            "可复用的协作模式"
          ]
        }
      ]
    },
    standardAnswer: "我在推动一个跨部门的用户增长项目时，需要协调产品、技术、运营、市场四个部门。最大的挑战是各部门的 OKR 不一致，产品关注功能体验，技术关注稳定性，运营关注短期转化，市场关注品牌。\n\n我的推动策略分三步：第一步是「找到共同目标」。我召集各部门负责人开了一次对齐会，用数据说明用户增长对各部门 OKR 的贡献：产品可以获得更多用户反馈，技术可以验证架构扩展性，运营可以提升 KPI，市场可以扩大品牌影响力。最终我们对齐到「3 个月内新增 50 万注册用户」这个共同目标上。\n\n第二步是「建立协作机制」。我设计了「双周会 + 日报」的沟通机制，双周会同步进度和问题，日报让信息透明化。同时我建立了「决策矩阵」，明确哪些问题由谁拍板，避免扯皮。\n\n第三步是「把控关键节点」。在项目初期，技术团队因为资源紧张延期了开发排期，我主动协调了其他项目的优先级，并承诺如果影响技术部门的稳定性指标，我来承担责任。这个动作让技术团队感受到支持，后续配合度非常高。\n\n最终项目提前一周完成，新增用户达到 58 万，超出预期。更重要的是，这次合作建立了信任，后续类似项目的推动效率提升了 50%。\n\n这个经历让我明白，跨部门合作的核心是「利益对齐 + 机制保障 + 关键时刻的支持」。你要站在对方角度思考问题,用共赢的方式推动,而不是强压。",
    referenceCount: 3214,
    practiceHistory: [],
    relatedJobs: [
      { company: "字节跳动", position: "项目管理", relevance: "中相关", status: "待研究" },
      { company: "腾讯", position: "产品经理", relevance: "中相关", status: "待研究" }
    ],
    relatedQuestions: [3, 7]
  },
  {
    id: 7,
    title: "为什么选择这个岗位",
    type: "职业规划",
    category: "动机匹配",
    source: "系统推荐 · 高频题",
    lastPractice: "1周前",
    score: 7.0,
    mastery: "中等",
    intent: "了解你的职业规划、动机真实性和岗位匹配度。",
    practiceCount: 2,
    averageScore: 6.8,
    bestScore: 7.0,
    structure: {
      steps: [
        {
          title: "岗位理解",
          timePercent: "25%",
          points: [
            "你对这个岗位的认知",
            "岗位的核心职责和挑战",
            "为什么这个岗位吸引你"
          ]
        },
        {
          title: "能力匹配",
          timePercent: "35%",
          points: [
            "你的核心能力",
            "如何匹配岗位需求",
            "过往经历的支撑"
          ]
        },
        {
          title: "职业规划",
          timePercent: "30%",
          points: [
            "你的短期和长期目标",
            "这个岗位如何帮助你成长",
            "对行业和公司的思考"
          ]
        },
        {
          title: "真诚表达",
          timePercent: "10%",
          points: [
            "你的真实动机",
            "为什么是这家公司"
          ]
        }
      ]
    },
    standardAnswer: "我选择这个前端技术专家岗位，主要基于三方面的思考：岗位匹配度、成长空间和公司平台。\n\n岗位匹配度方面，我在前端领域深耕了 6 年，从业务开发到架构设计再到团队管理都有经验。我特别关注的是这个岗位的职责描述中提到的「前端基础设施建设」和「技术难题攻坚」，这两点正是我过去三年的核心工作。我主导过公司级的组件库建设，也解决过多个高并发场景下的性能问题。我相信我的经验可以快速产生价值。\n\n成长空间方面，我看重的是这个岗位可以让我从单一技术深度走向「技术深度 + 业务理解 + 团队影响力」的综合能力。在你们的业务场景下，我可以接触到更大规模的用户和更复杂的技术挑战，这对我的成长非常关键。特别是 AI 和前端结合的方向，是我未来 3-5 年想深入的领域。\n\n关于为什么是字节跳动，我认为有两点：第一是技术氛围，我从社区和朋友那里了解到字节的工程师文化很纯粹，鼓励技术创新和开源贡献，这和我的价值观一致。第二是业务多样性，字节有多条产品线，我可以在不同场景下验证技术方案，这比单一产品的公司更有挑战性。\n\n我的职业目标是 3 年内成为前端架构领域的专家，5 年内能够影响行业的技术方向。我相信在字节这个平台上，这个目标是可以实现的。",
    referenceCount: 5678,
    practiceHistory: [
      { date: "1周前", score: 7.0, improvement: "增加了对公司的具体了解" },
      { date: "2周前", score: 6.5, improvement: "首次练习，偏模板化" }
    ],
    relatedJobs: [
      { company: "字节跳动", position: "前端技术专家", relevance: "高相关", status: "已投递" },
      { company: "阿里巴巴", position: "前端架构师", relevance: "高相关", status: "待研究" }
    ],
    relatedQuestions: [8, 6]
  },
  {
    id: 8,
    title: "遇到最大的挫折是什么，如何克服",
    type: "压力题",
    category: "抗压能力",
    source: "系统推荐",
    lastPractice: "未练习",
    score: null,
    mastery: "待练习",
    intent: "考察你的自我认知、抗压能力和成长思维。",
    practiceCount: 0,
    averageScore: 0,
    bestScore: 0,
    structure: {
      steps: [
        {
          title: "挫折场景",
          timePercent: "25%",
          points: [
            "具体的挫折事件",
            "当时的处境和压力",
            "挫折的严重程度"
          ]
        },
        {
          title: "应对过程",
          timePercent: "40%",
          points: [
            "情绪管理和心态调整",
            "分析问题的方法",
            "具体的行动和尝试",
            "寻求帮助的方式"
          ]
        },
        {
          title: "结果和成长",
          timePercent: "25%",
          points: [
            "最终如何走出困境",
            "这次挫折带来的收获",
            "能力或认知的提升"
          ]
        },
        {
          title: "反思和总结",
          timePercent: "10%",
          points: [
            "如果重来会怎么做",
            "形成的抗压方法论"
          ]
        }
      ]
    },
    standardAnswer: "我职业生涯中最大的挫折是在第一次带团队时，一个核心项目失败，导致团队被解散，我也被调离管理岗位。\n\n当时我刚晋升 Team Leader，接手了一个创新项目，要在 3 个月内从 0 到 1 做一个新产品。我充满信心，但过程中犯了很多错误：一是没有充分调研用户需求，闭门造车；二是为了赶进度，忽略了代码质量和测试；三是团队沟通不畅，大家有意见也不敢说。最终产品上线后，用户反馈很差，DAU 不到预期的 20%，公司决定砍掉项目。\n\n那段时间压力特别大，我甚至怀疑自己不适合做管理。但我告诉自己，逃避解决不了问题。我做了三件事：第一，主动找老板复盘，承认自己的问题，不找客观理由。老板看到我的态度后，反而给了我很多建议。第二,我逐一找团队成员聊天，听他们的真实想法，发现很多问题我之前根本没意识到。第三，我开始系统学习管理知识，读了《格鲁夫给经理人的第一课》等书，并找了一位管理导师定期请教。\n\n半年后，我重新获得了带团队的机会。这次我完全改变了方法：先做 MVP 验证需求，建立透明的沟通机制，关注团队成员的成长。项目最终成功上线，还获得了公司的创新奖。\n\n这次挫折让我成长很多。我明白了管理不是凭感觉，而是需要方法论和持续学习。更重要的是，我学会了面对失败时不要逃避，而是要主动复盘、快速调整。现在遇到困难，我会更冷静地分析问题，而不是焦虑。",
    referenceCount: 2897,
    practiceHistory: [],
    relatedJobs: [
      { company: "字节跳动", position: "前端技术专家", relevance: "中相关", status: "已投递" },
      { company: "腾讯", position: "项目管理", relevance: "中相关", status: "待研究" }
    ],
    relatedQuestions: [6, 7]
  },
];

// AI 反馈模拟数据
const mockFeedback = {
  totalScore: 7.8,
  conclusion: "已具备基本通过水平，但证据表达仍偏弱",
  dimensions: [
    { name: "结构性", score: 8.0, max: 10 },
    { name: "岗位相关性", score: 7.5, max: 10 },
    { name: "证据强度", score: 7.0, max: 10 },
    { name: "表达清晰度", score: 8.5, max: 10 },
    { name: "差异化程度", score: 7.0, max: 10 },
  ],
  strengths: [
    "回答结构完整，按照 STAR 法则展开，逻辑清晰",
    "技术深度足够，体现了对前端性能优化的系统性理解",
    "有量化的结果数据，如「首屏加载时间从 8 秒降到 2.5 秒」",
  ],
  improvements: [
    "判断过程偏空泛，缺少你如何做资源取舍的具体细节",
    "结尾没有回扣岗位需求，导致相关性弱了一层",
    "可以补充团队协作方式，展现软技能",
  ],
  suggestion: "建议在「判断与决策」部分增加更多细节，比如：你是如何评估不同优化方案的优先级的？为什么选择先做代码分割而不是其他方案？这样可以体现你的思考深度。同时，在结尾可以加一句：「这次经历让我理解了性能优化不仅是技术问题，更需要权衡业务优先级和用户体验，这也是我想在贵司前端架构师岗位上继续深入的方向。」",
};

// 历史回答记录
const historyAnswers = [
  {
    id: 1,
    date: "2天前",
    score: 7.5,
    improvement: "补充了数据支撑，结构更清晰",
  },
  {
    id: 2,
    date: "5天前",
    score: 6.8,
    improvement: "增加了判断过程的细节描述",
  },
];

// 面试模拟场景预设
const simulationScenarios = [
  {
    id: "bytedance-tech",
    name: "字节跳动技术面试",
    company: "字节跳动",
    type: "技术面试",
    difficulty: "中级" as const,
    duration: 45,
    description: "模拟字节跳动前端技术面试场景，包含算法、系统设计、项目经验等环节。AI 面试官会根据你的回答进行深度追问。"
  },
  {
    id: "alibaba-behavior",
    name: "阿里巴巴行为面试",
    company: "阿里巴巴",
    type: "行为面试",
    difficulty: "中级" as const,
    duration: 30,
    description: "基于阿里巴巴价值观，考察团队协作、问题解决、创新能力等软实力。采用 STAR 法则进行评估。"
  },
  {
    id: "tencent-comprehensive",
    name: "腾讯综合面试",
    company: "腾讯",
    type: "综合面试",
    difficulty: "高级" as const,
    duration: 60,
    description: "技术 + 行为混合面试，全面考察候选人的综合能力。包含产品思维、技术深度、业务理解等多个维度。"
  },
  {
    id: "startup-pressure",
    name: "创业公司压力面试",
    company: "创业公司",
    type: "压力面试",
    difficulty: "高级" as const,
    duration: 20,
    description: "快节奏的压力面试，AI 会快速追问和挑战你的回答，考察应变能力和抗压能力。"
  }
];

// 历史模拟记录
const simulationHistory = [
  {
    id: 1,
    scenario: "字节跳动技术面试",
    date: "2天前",
    duration: 42,
    score: 8.2,
    status: "已完成"
  },
  {
    id: 2,
    scenario: "阿里巴巴行为面试",
    date: "5天前",
    duration: 28,
    score: 7.5,
    status: "已完成"
  },
  {
    id: 3,
    scenario: "腾讯综合面试",
    date: "1周前",
    duration: 55,
    score: 7.8,
    status: "已完成"
  },
  {
    id: 4,
    scenario: "字节跳动技术面试",
    date: "2周前",
    duration: 40,
    score: 7.2,
    status: "已完成"
  },
  {
    id: 5,
    scenario: "阿里巴巴行为面试",
    date: "3周前",
    duration: 30,
    score: 6.8,
    status: "已完成"
  }
];

export function InterviewsPage() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("coaching"); // coaching, simulation, bank, assistant, review
  const [selectedQuestion, setSelectedQuestion] = useState(interviewQuestions[0]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [answer, setAnswer] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [showStandardAnswer, setShowStandardAnswer] = useState(false);

  // 游客检查 & 额度检查
  const { checkGuest, showLoginPrompt, setShowLoginPrompt, loginScenario } = useGuestCheck();
  const { checkQuota, showUpgradeModal, setShowUpgradeModal, upgradeScenario } = useQuotaCheck();

  // === A4 API Integration ===
  // 从后端加载题库，fallback to mock data
  const { data: apiQuestions, isLoading: questionsLoading } = useQuestions();
  const submitAnswer = useSubmitAnswer();
  const requestFeedback = useRequestFeedback();
  const suggestQuestions = useSuggestQuestions();

  // 合并 API 数据和 mock 数据
  // 当后端有题目时优先展示 API 数据；空或加载失败时回退到 mock
  const displayQuestions = useMemo(() => {
    const apiList = Array.isArray(apiQuestions) ? apiQuestions :
      (apiQuestions as any)?.questions ?? [];
    if (apiList.length > 0) {
      // 将 API 题目映射为前端展示格式
      return apiList.map((q: any, idx: number) => ({
        id: q.id || idx + 1,
        title: q.question || q.title,
        type: q.category || "通用",
        category: q.category || "其他",
        source: q.source === "agent" ? "AI 生成" : q.source === "review" ? "面试复盘" : "手动添加",
        lastPractice: q.updated_at ? formatTimeDiff(q.updated_at) : "—",
        score: 0,
        mastery: q.answer_count > 3 ? "良好" : q.answer_count > 0 ? "中等" : "未练习",
        intent: "",
        practiceCount: q.answer_count || 0,
        averageScore: 0,
        bestScore: 0,
        structure: { steps: [] },
        standardAnswer: "",
        referenceCount: 0,
        practiceHistory: [],
        relatedJobs: [],
        relatedQuestions: [],
        _apiId: q.id, // 用于 API 调用
      }));
    }
    return interviewQuestions;
  }, [apiQuestions]);

  // 提交回答到后端（先检查登录）
  const handleSubmitAnswer = async () => {
    if (!checkGuest('start-interview')) return;
    if (!(await checkQuota('interview-mock'))) return;
    if (!answer.trim()) {
      toast.error("请先输入回答");
      return;
    }
    const apiId = (selectedQuestion as any)?._apiId;
    if (apiId) {
      try {
        await submitAnswer.mutateAsync({ questionId: apiId, content: answer });
        toast.success("回答已提交");
      } catch {
        toast.error("提交失败");
      }
    }
  };

  // 请求 AI 反馈（先检查登录）
  const handleRequestFeedback = async () => {
    if (!checkGuest('start-interview')) return;
    if (!(await checkQuota('interview-mock'))) return;
    const apiId = (selectedQuestion as any)?._apiId;
    if (apiId && answer.trim()) {
      try {
        await requestFeedback.mutateAsync({
          questionId: apiId,
          question: selectedQuestion.title,
          answer: answer,
          mode: "general",
        });
        toast.success("AI 反馈已生成");
      } catch {
        toast.error("获取反馈失败");
      }
    }
  };
  
  // 面试模拟状态
  const [simulationStatus, setSimulationStatus] = useState<"idle" | "configuring" | "running" | "paused" | "completed">("idle");
  const [selectedScenario, setSelectedScenario] = useState(simulationScenarios[0]);
  const [simulationMessages, setSimulationMessages] = useState<Array<{
    id: number;
    role: "ai" | "user";
    content: string;
    timestamp: string;
    score?: number;
  }>>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messageIdCounter, setMessageIdCounter] = useState(1);
  
  // 面试陪伴助手状态
  const [assistantStatus, setAssistantStatus] = useState<"idle" | "running" | "paused" | "completed">("idle");
  const [assistantElapsedTime, setAssistantElapsedTime] = useState(0);
  const [assistantCurrentStage, setAssistantCurrentStage] = useState("opening");
  const [assistantNotes, setAssistantNotes] = useState<Array<{
    id: number;
    content: string;
    timestamp: string;
  }>>([]);
  const [assistantNoteIdCounter, setAssistantNoteIdCounter] = useState(1);
  const [showEmergencyHelp, setShowEmergencyHelp] = useState(false);
  const [selectedInterviewInfo, setSelectedInterviewInfo] = useState({
    company: "字节跳动",
    position: "前端技术专家",
    round: "二面（技术深度）",
    type: "技术面试" as const,
    reminders: [
      "重点讲项目经验和技术深度",
      "准备算法题和系统设计题",
      "询问团队规模和技术栈"
    ]
  });
  
  // 面试复盘状态
  const [reviewMode, setReviewMode] = useState<"create" | "view" | null>(null);
  const [reviewDetailLevel, setReviewDetailLevel] = useState<"detailed" | "simple">("detailed");
  const [reviewSelectedTemplate, setReviewSelectedTemplate] = useState<"technical" | "behavioral" | "hr" | null>(null);
  const [selectedReviewRecord, setSelectedReviewRecord] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [reviewCurrentStep, setReviewCurrentStep] = useState(1);
  
  const modules = [
    { id: "bank", label: "面试题库" },
    { id: "coaching", label: "面试辅导" },
    { id: "simulation", label: "面试模拟" },
    { id: "assistant", label: "面试陪伴助手" },
    { id: "review", label: "面试复盘" },
  ];
  
  const filters = [
    { id: "all", label: "全部" },
    { id: "frequent", label: "高频题" },
    { id: "weak", label: "我的薄弱项" },
    { id: "weekly", label: "本周重点" },
  ];
  
  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulationStatus === "running") {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationStatus]);
  
  // 面试模拟控制函数（先检查登录和额度）
  const handleSimulationStart = async () => {
    if (!checkGuest('start-interview')) return;
    if (!(await checkQuota('interview-mock'))) return;
    setSimulationStatus("running");
    setElapsedTime(0);
    setSimulationMessages([
      {
        id: messageIdCounter,
        role: "ai",
        content: `你好！我是来自${selectedScenario.company}的面试官。很高兴见到你，让我们开始今天的面试吧。首先，请你做一个简单的自我介绍，重点说说你的技术背景和项目经验。`,
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setMessageIdCounter(prev => prev + 1);
  };
  
  const handleSimulationPause = () => {
    setSimulationStatus("paused");
  };
  
  const handleSimulationResume = () => {
    setSimulationStatus("running");
  };
  
  const handleSimulationStop = () => {
    setSimulationStatus("completed");
  };
  
  const handleSendMessage = (message: string) => {
    // 添加用户消息
    const userMessage = {
      id: messageIdCounter,
      role: "user" as const,
      content: message,
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      score: Math.random() * 2 + 7 // 模拟评分 7-9
    };
    setSimulationMessages(prev => [...prev, userMessage]);
    setMessageIdCounter(prev => prev + 1);
    
    // 模拟 AI 回复
    setTimeout(() => {
      const aiResponses = [
        "很好的回答！你提到的项目经验很有价值。能详细说说你在这个项目中遇到的最大技术挑战是什么吗？",
        "我注意到你对这个技术栈很熟悉。那你能说说在实际应用中，你是如何权衡性能和开发效率的吗？",
        "不错的经历。如果让你重新设计这个系统，你会做哪些改进？为什么？",
        "你的思路很清晰。接下来我想问一个场景题：如果你遇到一个线上紧急故障，你会如何快速定位和解决？",
        "很好。最后一个问题，你为什么想加入我们公司？对这个岗位有什么期待？"
      ];
      const aiMessage = {
        id: messageIdCounter + 1,
        role: "ai" as const,
        content: aiResponses[Math.min(simulationMessages.filter(m => m.role === "user").length, aiResponses.length - 1)],
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      };
      setSimulationMessages(prev => [...prev, aiMessage]);
      setMessageIdCounter(prev => prev + 2);
    }, 1500);
  };
  
  const handleSimulationHelp = () => {
    alert("💡 提示：尝试用 STAR 法则组织你的回答：\n• Situation: 当时的背景情况\n• Task: 你需要完成的任务\n• Action: 你采取的具体行动\n• Result: 最终的成果和影响");
  };
  
  const handleSimulationSkip = () => {
    if (confirm("确定要跳过当前问题吗？这会影响最终评分。")) {
      const skipMessage = {
        id: messageIdCounter,
        role: "ai" as const,
        content: "好的，我们继续下一个问题。请描述一次你在团队中解决冲突的经历。",
        timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
      };
      setSimulationMessages(prev => [...prev, skipMessage]);
      setMessageIdCounter(prev => prev + 1);
    }
  };
  
  // 推荐练习算法
  const getRecommendedQuestions = () => {
    const current = selectedQuestion;
    const otherQuestions = displayQuestions.filter(q => q.id !== current.id);
    
    // 优先练习：关联岗位相同 且 得分低于7分 或 未练习
    const priority = otherQuestions.find(q => 
      q.relatedJobs?.some(job => 
        current.relatedJobs?.some(cJob => cJob.company === job.company)
      ) && (q.bestScore === 0 || q.bestScore < 7)
    );
    
    // 巩固练习：当前题目的关联题目 且 已练习但得分不高
    const strengthen = otherQuestions.find(q =>
      current.relatedQuestions?.includes(q.id) && q.bestScore > 0 && q.bestScore < 8
    );
    
    // 拓展练习：同类型但未练习的题目
    const expand = otherQuestions.find(q =>
      q.type === current.type && q.practiceCount === 0
    );
    
    const recommendations = [];
    if (priority) {
      recommendations.push({
        type: "priority",
        question: priority,
        reason: "与你投递的岗位高度相关，建议优先练习"
      });
    }
    if (strengthen) {
      recommendations.push({
        type: "strengthen",
        question: strengthen,
        reason: "与当前题目关联，可以巩固薄弱环节"
      });
    }
    if (expand) {
      recommendations.push({
        type: "expand",
        question: expand,
        reason: "同类型题目，可以拓展知识面"
      });
    }
    
    return recommendations;
  };
  
  // 生成得分趋势数据
  const getTrendData = () => {
    if (!selectedQuestion.practiceHistory || selectedQuestion.practiceHistory.length === 0) {
      return [];
    }
    return selectedQuestion.practiceHistory.map((record, index) => ({
      date: `${record.date} (${index + 1})`, // 确保每个日期都是唯一的
      score: record.score,
      id: `${selectedQuestion.id}-${index}` // 唯一 ID
    })).reverse();
  };
  
  const recommendedQuestions = getRecommendedQuestions();
  const trendData = getTrendData();

  return (
    <div className="h-full flex flex-col bg-background -m-8">
      {/* 页面标题区 */}
      <div className="flex-shrink-0 px-7 pt-6 pb-5">
        <h1 className="text-[30px] leading-[38px] font-semibold tracking-tight mb-2">面试</h1>
        <p className="text-sm leading-[22px] text-muted-foreground">
          把准备、训练、模拟和复盘，组织成一套连续的面试提升系统。
        </p>
      </div>

      {/* 顶部工具条 */}
      <div className="flex-shrink-0 px-7 pb-5">
        <div className="flex items-center justify-between">
          {/* 左侧 */}
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索题目、面试记录、复盘"
                className="w-[280px] h-11 pl-10 pr-4 bg-card rounded-[14px] text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            
            {/* 子模块切换胶囊 */}
            <div className="flex items-center gap-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`
                    h-[34px] px-[14px] rounded-[999px] text-[13px] font-medium transition-all
                    ${activeModule === module.id
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  {module.label}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧 */}
          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium">
              <PlayCircle className="w-4 h-4" />
              开始模拟
            </button>
            <button className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium">
              <Upload className="w-4 h-4" />
              导入录音/文字
            </button>
            <button className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              新建训练
            </button>
          </div>
        </div>
      </div>

      {/* 三栏主体布局 */}
      <div className="flex-1 overflow-hidden px-7 pb-6">
        <div className="h-full flex gap-5">
          {/* 左栏：动态渲染 */}
          {activeModule === "review" ? (
            <InterviewReviewLeftColumn
              selectedRecord={selectedReviewRecord}
              onSelectRecord={(record) => {
                setSelectedReviewRecord(record);
                setReviewMode("view");
              }}
              onNewReview={() => {
                setReviewMode("create");
                setSelectedReviewRecord(null);
              }}
            />
          ) : (
            // 训练题目列表
            <div className="w-[248px] flex-shrink-0 bg-card rounded-[24px] border border-border p-[18px] flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
              {/* 头部 */}
              <div className="flex items-center justify-between mb-[18px]">
                <h2 className="text-lg font-semibold">训练列表</h2>
                <button className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* 筛选胶囊 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`
                      h-[30px] px-3 rounded-[999px] text-xs font-medium transition-all
                      ${activeFilter === filter.id
                        ? "bg-secondary text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/50"
                      }
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* 题目列表 */}
              <div className="flex-1 overflow-y-auto space-y-2.5" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.15) transparent'
              }}>
                {questionsLoading && (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    加载题目...
                  </div>
                )}
                {displayQuestions.map((question) => (
                  <div
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className={`
                      relative min-h-[92px] rounded-[16px] p-[14px] cursor-pointer transition-all
                      ${selectedQuestion.id === question.id
                        ? "bg-secondary shadow-sm border-l-2 border-l-primary"
                        : "bg-secondary/30 hover:bg-secondary/50"
                      }
                    `}
                  >
                    <div className="space-y-2">
                      {/* 第一行：题目标题 + 掌握度 */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium leading-[20px] line-clamp-2 flex-1">
                          {question.title}
                        </h3>
                        <span className={`
                          px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap flex-shrink-0
                          ${question.mastery === "良好" ? "bg-green-50 text-green-700" :
                            question.mastery === "中等" ? "bg-blue-50 text-blue-700" :
                            question.mastery === "需提升" ? "bg-orange-50 text-orange-700" :
                            "bg-secondary text-muted-foreground"}
                        `}>
                          {question.mastery}
                        </span>
                      </div>

                      {/* 第二行：类型标签 */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{question.type}</span>
                        <span>·</span>
                        <span>{question.category}</span>
                      </div>

                      {/* 第三行：练习信息 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{question.lastPractice}</span>
                        {question.score && (
                          <span className="font-medium">{question.score} 分</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 中栏：动态渲染 */}
          {activeModule === "simulation" ? (
            <InterviewSimulationMiddleColumn
              scenario={selectedScenario}
              status={simulationStatus}
              onStart={handleSimulationStart}
              onPause={handleSimulationPause}
              onResume={handleSimulationResume}
              onStop={handleSimulationStop}
              messages={simulationMessages}
              onSendMessage={handleSendMessage}
              elapsedTime={elapsedTime}
              totalScore={simulationMessages.filter(m => m.role === "user" && m.score).reduce((sum, m) => sum + (m.score || 0), 0) / Math.max(simulationMessages.filter(m => m.role === "user" && m.score).length, 1)}
            />
          ) : activeModule === "bank" ? (
            <InterviewBankMiddleColumn
              question={selectedQuestion}
              questionIndex={displayQuestions.findIndex(q => q.id === selectedQuestion.id)}
              totalQuestions={displayQuestions.length}
              onStartPractice={() => setActiveModule("coaching")}
            />
          ) : activeModule === "assistant" ? (
            <InterviewAssistantMiddleColumn
              status={assistantStatus}
              interviewInfo={selectedInterviewInfo}
              onStart={() => setAssistantStatus("running")}
              onPause={() => setAssistantStatus("paused")}
              onResume={() => setAssistantStatus("running")}
              onStop={() => setAssistantStatus("completed")}
              elapsedTime={assistantElapsedTime}
              currentStage={assistantCurrentStage}
              onStageChange={(stage) => setAssistantCurrentStage(stage)}
              notes={assistantNotes}
              onAddNote={(content) => {
                const note = {
                  id: assistantNoteIdCounter,
                  content,
                  timestamp: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
                };
                setAssistantNotes(prev => [...prev, note]);
                setAssistantNoteIdCounter(prev => prev + 1);
              }}
              onShowEmergencyHelp={() => setShowEmergencyHelp(true)}
            />
          ) : activeModule === "review" ? (
            <InterviewReviewMiddleColumn
              mode={reviewMode}
              detailLevel={reviewDetailLevel}
              selectedTemplate={reviewSelectedTemplate}
              reviewData={reviewData}
              onBack={() => {
                setReviewMode(null);
                setSelectedReviewRecord(null);
              }}
              onSave={(data) => {
                setReviewData(data);
              }}
              onComplete={() => {
                setReviewMode("view");
              }}
              onEdit={() => {
                setReviewMode("create");
              }}
              onExport={() => {
                alert("导出功能开发中...");
              }}
              onDelete={() => {
                if (confirm("确定要删除这条复盘记录吗？")) {
                  setReviewMode(null);
                  setSelectedReviewRecord(null);
                }
              }}
            />
          ) : (
            // 面试辅导模式的中栏
            <div className="w-[520px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
              {/* 题目头部 */}
              <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-700 text-xs font-medium">
                      {selectedQuestion.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {displayQuestions.findIndex(q => q.id === selectedQuestion.id) + 1} / {displayQuestions.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <h2 className="text-[22px] leading-[32px] font-semibold mb-2">
                  {selectedQuestion.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{selectedQuestion.source}</span>
                </div>
              </div>

              {/* 回答编辑区 */}
              <div className="flex-1 overflow-y-auto p-5" style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,0,0,0.15) transparent'
              }}>
                <div className="space-y-4">
                  {/* 输入模式切换 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInputMode("text")}
                      className={`
                        flex-1 h-[36px] rounded-[10px] text-xs font-medium transition-all
                        ${inputMode === "text"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      <FileText className="w-3.5 h-3.5 inline-block mr-1.5" />
                      文字回答
                    </button>
                    <button
                      onClick={() => setInputMode("voice")}
                      className={`
                        flex-1 h-[36px] rounded-[10px] text-xs font-medium transition-all
                        ${inputMode === "voice"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }
                      `}
                    >
                      <Mic className="w-3.5 h-3.5 inline-block mr-1.5" />
                      语音回答
                    </button>
                  </div>

                  {/* 文字输入区 */}
                  {inputMode === "text" && (
                    <div>
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="在这里输入你的回答..."
                        className="w-full h-[280px] p-4 rounded-[14px] bg-secondary/30 border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 text-sm leading-[22px]"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(0,0,0,0.15) transparent'
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          已输入 {answer.length} 字
                        </span>
                        <div className="flex gap-2">
                          <button className="h-[28px] px-3 rounded-[8px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center gap-1.5">
                            <Copy className="w-3 h-3" />
                            粘贴
                          </button>
                          <button className="h-[28px] px-3 rounded-[8px] bg-secondary hover:bg-secondary/80 transition-colors text-xs font-medium flex items-center gap-1.5">
                            <Trash2 className="w-3 h-3" />
                            清空
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 语音输入区 */}
                  {inputMode === "voice" && (
                    <div className="flex flex-col items-center justify-center h-[280px] rounded-[14px] bg-secondary/30 border border-border">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Mic className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">点击开始录音</p>
                      <button className="h-[36px] px-6 rounded-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                        开始录音
                      </button>
                    </div>
                  )}

                  {/* 标准答案查看 */}
                  <button
                    onClick={() => setShowStandardAnswer(!showStandardAnswer)}
                    className="w-full h-[36px] rounded-[10px] bg-secondary/50 hover:bg-secondary transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {showStandardAnswer ? "隐藏" : "查看"}标准答案
                  </button>

                  {showStandardAnswer && (
                    <div className="p-4 rounded-[14px] bg-blue-50/50 border border-blue-200">
                      <p className="text-xs leading-[20px] text-foreground/80">
                        {selectedQuestion.standardAnswer || "暂无标准答案"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 底部操作栏 */}
              <div className="flex-shrink-0 p-5 border-t border-border">
                <div className="flex gap-2">
                  <button className="h-[44px] px-4 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    重新回答
                  </button>
                  <button className="flex-1 h-[44px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    提交评分
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 右栏：动态渲染 */}
          {activeModule === "simulation" ? (
            <InterviewSimulationRightColumn
              scenario={selectedScenario}
              status={simulationStatus}
              elapsedTime={elapsedTime}
              messages={simulationMessages}
              onHelp={handleSimulationHelp}
              onSkip={handleSimulationSkip}
            />
          ) : activeModule === "bank" ? (
            <InterviewBankRightColumn
              question={selectedQuestion}
              allQuestions={displayQuestions}
              recommendedQuestions={recommendedQuestions}
              trendData={trendData}
            />
          ) : activeModule === "assistant" ? (
            <InterviewAssistantRightColumn
              status={assistantStatus}
              elapsedTime={assistantElapsedTime}
              currentStage={assistantCurrentStage}
              notes={assistantNotes.length}
            />
          ) : activeModule === "review" ? (
            <InterviewReviewRightColumn
              mode={reviewMode}
              currentStep={reviewCurrentStep}
              detailLevel={reviewDetailLevel}
              hasAnalysis={reviewMode === "view"}
            />
          ) : (
            // 面试辅导模式的右栏（AI 反馈）
            <div className="flex-1 overflow-y-auto p-5" style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.15) transparent'
            }}>
              <div className="space-y-5">
                {/* 头部 */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI 反馈</h3>
                  <p className="text-xs leading-[18px] text-muted-foreground">
                    基于你的回答，AI 给出专业的评估和改进建议
                  </p>
                </div>

                {/* 五维评分卡片 */}
                <div className="rounded-[18px] bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-border p-5">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    综合评分：{mockFeedback.totalScore} 分
                  </h4>
                  <div className="space-y-3">
                    {mockFeedback.dimensions.map((dim, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">{dim.name}</span>
                          <span className="text-xs font-semibold">{dim.score} 分</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${(dim.score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 优点 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    优点
                  </h4>
                  <div className="space-y-2">
                    {mockFeedback.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-[12px] bg-green-50/50 border border-green-200">
                        <span className="text-green-600 font-bold text-xs mt-0.5">✓</span>
                        <p className="text-xs leading-[20px] text-foreground/80 flex-1">{strength}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 待改进 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    待改进
                  </h4>
                  <div className="space-y-2">
                    {mockFeedback.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-[12px] bg-orange-50/50 border border-orange-200">
                        <span className="text-orange-600 font-bold text-xs mt-0.5">!</span>
                        <p className="text-xs leading-[20px] text-foreground/80 flex-1">{improvement}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI 建议 */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI 优化建议
                  </h4>
                  <div className="p-4 rounded-[14px] bg-purple-50/50 border border-purple-200">
                    <p className="text-xs leading-[20px] text-foreground/80 whitespace-pre-line">
                      {mockFeedback.suggestion}
                    </p>
                  </div>
                </div>

                {/* 底部操作 */}
                <div className="flex gap-2">
                  <button className="flex-1 h-[36px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">
                    保存反馈
                  </button>
                  <button className="flex-1 h-[36px] rounded-[10px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">
                    继续优化
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 登录拦截弹层 */}
      {showLoginPrompt && (
        <LoginPromptModal
          scenario={loginScenario}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      {/* 额度拦截弹层 */}
      {showUpgradeModal && (
        <UpgradeInterceptModal
          scenario={upgradeScenario}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* 紧急救援弹窗 */}
      <EmergencyHelpModal
        isOpen={showEmergencyHelp}
        onClose={() => setShowEmergencyHelp(false)}
      />
    </div>
  );
}