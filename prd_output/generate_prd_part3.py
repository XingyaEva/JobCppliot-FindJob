#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FindJob V2.0 PRD 生成器 - Part 3 (Ch10-Ch13 + 附录)
Prompt工程、技术实现、NFR与指标、未来路线图、附录
"""

import sys
sys.path.insert(0, '/home/user/webapp/webapp/prd_output')
from generate_prd_v2 import *


# ============================================================
# 第10章 Prompt 工程
# ============================================================

def add_chapter_10(doc):
    doc.add_heading('第十章 Prompt 工程体系', level=1)

    # 10.1
    doc.add_heading('10.1 Prompt 设计方法论', level=2)
    p(doc, 'FindJob V2.0 采用模块化、可测试、可迭代的Prompt工程体系。每个Agent的Prompt由以下层级组成：')
    doc.add_paragraph()

    add_table(doc,
        ['层级', '内容', '说明'],
        [
            ['System Prompt', '角色定义 + 核心任务 + 输出Schema + 约束条件', '每个Agent独立配置，版本化管理'],
            ['通用Fragment', 'JSON输出约束、Token优化、错误处理、中文本地化', '多Agent共享的标准化片段'],
            ['Few-Shot示例', '1-2个高质量输入输出示例', '覆盖正常和边界情况'],
            ['User Message', '动态构建的上下文数据', '基于用户输入和前序Agent输出构建'],
        ],
        col_widths=[3, 6, 7.5]
    )

    # 10.2
    doc.add_heading('10.2 通用Prompt Fragment库', level=2)

    doc.add_heading('10.2.1 JSON输出约束', level=3)
    para = doc.add_paragraph()
    run = para.add_run('''## 输出格式约束
- 直接输出 JSON，不要添加 markdown 代码块
- 所有字符串字段使用中文
- 数组字段为空时返回空数组 []
- 字符串字段为空时返回空字符串 ""
- 严格按照 Schema 结构输出，不要添加额外字段''')
    run.font.size = Pt(9.5)
    run.font.name = 'Consolas'

    doc.add_heading('10.2.2 Token优化约束', level=3)
    para = doc.add_paragraph()
    run = para.add_run('''## 输出精简要求
- summary 类字段限制 50 字以内
- 描述类字段限制 100 字以内
- 列表字段最多 5 项
- 避免重复信息
- 使用简洁表述''')
    run.font.size = Pt(9.5)
    run.font.name = 'Consolas'

    doc.add_heading('10.2.3 错误处理约束', level=3)
    para = doc.add_paragraph()
    run = para.add_run('''## 信息不足处理
- 如信息不足，标注"信息不足"或使用合理默认值
- 不要编造具体数据（如具体数字、日期）
- 基于上下文进行合理推断''')
    run.font.size = Pt(9.5)
    run.font.name = 'Consolas'

    doc.add_heading('10.2.4 中文本地化', level=3)
    para = doc.add_paragraph()
    run = para.add_run('''## 语言要求
- 所有输出使用简体中文
- 技术术语可保留英文（如 ToB、SaaS）
- 专有名词保持原样''')
    run.font.size = Pt(9.5)
    run.font.name = 'Consolas'

    # 10.3
    doc.add_heading('10.3 核心Prompt模板详解', level=2)

    doc.add_heading('10.3.1 JD结构化Prompt', level=3)
    para = doc.add_paragraph()
    run = para.add_run('''你是专业的招聘信息分析师。

## 任务
将 JD 文本提取为结构化 JSON。

## 输出 Schema
{
  "title": "岗位名称（如：AI产品经理）",
  "company": "公司名称（未知填\\"未知公司\\"）",
  "location": "工作地点（未知填\\"未知\\"）",
  "salary": "薪资范围（如：25-50K 14薪，未知填\\"面议\\"）",
  "responsibilities": ["职责1", "职责2", ...],
  "requirements": ["要求1", "要求2", ...],
  "preferred": ["加分项1", "加分项2", ...],
  "others": "其他信息"
}

## 提取规则
- title：明确的岗位名称，不含公司名
- responsibilities：每条职责独立成项，保持原文要点
- requirements：硬性要求，按重要程度排序
- preferred：软性要求/加分项
- 数量限制：每个列表字段最多 10 项

## 示例输入
"""
AI产品经理 - 字节跳动
地点：北京  薪资：30-50K
职责：1. 负责AI产品规划和设计 2. 推动产品从0到1落地
要求：1. 本科及以上 2. 3年产品经验
加分：有AI项目经验优先
"""

## 示例输出
{
  "title": "AI产品经理",
  "company": "字节跳动",
  "location": "北京",
  "salary": "30-50K",
  "responsibilities": ["负责AI产品规划和设计", "推动产品从0到1落地"],
  "requirements": ["本科及以上", "3年产品经验"],
  "preferred": ["有AI项目经验优先"],
  "others": ""
}''')
    run.font.size = Pt(9)
    run.font.name = 'Consolas'
    para.paragraph_format.left_indent = Cm(0.5)

    doc.add_heading('10.3.2 匹配评估Prompt', level=3)
    para = doc.add_paragraph()
    run = para.add_run('''你是一个资深的招聘匹配分析专家，擅长评估候选人与岗位的匹配度。

## 任务
基于提供的简历信息和岗位分析结果，进行多维度匹配评估。

## 匹配度等级规则（严格遵循）
| 等级 | 条件 |
| 非常匹配 | A3业务领域一致 + B1-B4全部满足(4项) |
| 比较匹配 | A3一致 + B1-B4满足3项 |
| 匹配度还可以 | A3相关 + B1-B4满足2项 |
| 不是很匹配 | A3不相关 或 B1-B4仅满足1项 |
| 不匹配 | B1-B4均不满足 |

## 输出 Schema
{
  "match_level": "非常匹配|比较匹配|匹配度还可以|不是很匹配|不匹配",
  "match_score": 85,
  "dimension_match": {
    "A3_business_domain": {"status": "match|partial|mismatch", "evidence": "...", "detail": "..."},
    "B1_industry": {...},
    "B2_tech": {...},
    "B3_product": {...},
    "B4_capability": {...}
  },
  "strengths": ["优势1", "优势2", "优势3"],
  "gaps": ["差距1", "差距2", "差距3"],
  "interview_focus_suggestion": "面试重点建议"
}

## 评分标准
- 85-100分：非常匹配，核心要求全部满足
- 70-84分：比较匹配，大部分要求满足
- 55-69分：匹配度还可以，有部分差距
- 0-54分：匹配度较低，差距较大

## 分析原则
1. 客观评估，基于简历实际内容
2. strengths 和 gaps 各 3-5 条，简洁有力
3. interview_focus_suggestion 针对差距给出建议''')
    run.font.size = Pt(9)
    run.font.name = 'Consolas'
    para.paragraph_format.left_indent = Cm(0.5)

    # 10.4
    doc.add_heading('10.4 上下文管理策略', level=2)
    p(doc, '由于LLM的Token上下文窗口限制，FindJob采用Map-Reduce策略管理长文本上下文：')
    bullet(doc, 'Map阶段：将JD和简历分别送入独立Agent分析（JD→A/B维度，简历→结构化解析），产出精炼的结构化数据')
    bullet(doc, 'Reduce阶段：后续Agent（匹配评估、简历优化）仅接收结构化数据作为输入，不重复传入原始长文本')
    bullet(doc, '关键数据截断：原始JD文本截取前2000字作为参考，超长简历分section处理')
    bullet(doc, '对话历史管理：全局Chat Agent保留最近10轮对话 + 系统摘要')

    # 10.5
    doc.add_heading('10.5 幻觉控制机制', level=2)
    p(doc, '防止AI编造不存在的信息是Prompt工程的核心挑战。FindJob采用以下幻觉控制策略：')
    bullet(doc, '事实检查（Fact-Check）：输出中涉及数字、日期、公司名等事实性信息时，要求Agent标注信息来源（"基于JD"/"基于简历"/"推断"）')
    bullet(doc, '占位符策略：信息不足时使用占位符（"信息不足"/"JD未明确提及"）而非编造')
    bullet(doc, 'Validator验证：JSON解析后检查关键字段的合理性（如match_score必须在0-100范围内）')
    bullet(doc, 'UI提示：当AI输出包含推断内容时，前端显示"以下内容基于AI推断，建议核实"的提示')
    bullet(doc, '用户反馈：支持用户标记"AI回答不准确"，数据用于后续优化Prompt')


# ============================================================
# 第11章 技术实现方案
# ============================================================

def add_chapter_11(doc):
    doc.add_heading('第十一章 技术实现方案', level=1)

    # 11.1
    doc.add_heading('11.1 前端实现', level=2)

    doc.add_heading('11.1.1 组件架构', level=3)
    p(doc, 'FindJob前端包含80+React组件，分为三层：')
    add_table(doc,
        ['层级', '数量', '说明', '示例'],
        [
            ['UI基础组件', '67个', 'ShadCN UI组件库（基于Radix UI + CVA）', 'Button, Input, Dialog, Table, Tabs, Card, Accordion, Popover...'],
            ['业务组件', '17个', '各模块的三栏布局组件', 'DecisionsLeftColumn, InterviewBankMiddleColumn, GrowthRightColumn...'],
            ['页面组件', '7个', '路由级页面', 'HomePage, OpportunitiesPage, AssetsPage, InterviewsPage, DecisionsPage, GrowthPage, DashboardPage'],
            ['布局组件', '1个', '全局AppShell（导航+内容区）', 'AppShell（含悬浮AI助手）'],
        ],
        col_widths=[3, 2, 5, 6.5]
    )

    doc.add_heading('11.1.2 状态管理', level=3)
    bullet(doc, 'React useState / useReducer：组件内部状态')
    bullet(doc, 'React Router Outlet：页面路由数据传递')
    bullet(doc, 'API调用：fetch + custom hooks（规划中引入React Query进行缓存）')

    doc.add_heading('11.1.3 构建配置', level=3)
    p(doc, '双构建模式（Vite 6）：')
    bullet(doc, '客户端构建：React SPA → dist/index.html + dist/assets/*.js/css（约1MB JS + 125KB CSS）')
    bullet(doc, '服务端构建：Hono Worker → dist/_worker.js（约924KB，处理API和SSR）')
    bullet(doc, '路由配置：_routes.json 控制Cloudflare Pages的请求分发')

    # 11.2
    doc.add_heading('11.2 后端实现', level=2)

    doc.add_heading('11.2.1 API路由架构', level=3)
    add_table(doc,
        ['路由模块', '文件', '接口数', '说明'],
        [
            ['岗位管理', 'routes/job.ts (29KB)', '~15', 'JD解析、岗位CRUD、匹配评估、定向简历生成'],
            ['简历管理', 'routes/resume.ts (42KB)', '~12', '简历CRUD、解析、版本管理、导出'],
            ['面试管理', 'routes/interview.ts (5.6KB)', '~5', '面试记录、复盘'],
            ['题库管理', 'routes/questions.ts (10.6KB)', '~8', '题库CRUD、练习记录、AI评分'],
            ['简历优化', 'routes/optimize.ts (5.9KB)', '~3', '简历优化、版本生成'],
            ['投递管理', 'routes/applications.ts (10.7KB)', '~8', '投递记录、状态管理、统计'],
            ['指标管理', 'routes/metrics.ts (11.8KB)', '~6', 'AI成本追踪、性能指标'],
            ['市场分析', 'routes/market.ts (3.5KB)', '~3', '市场调研、行业分析'],
            ['对话管理', 'routes/chat.ts (7.3KB)', '~4', '全局Chat、对话历史'],
            ['飞书集成', 'routes/feishu.ts (5KB)', '~4', '飞书数据同步'],
        ],
        col_widths=[3, 4.5, 2, 7]
    )

    doc.add_heading('11.2.2 LLM调用层', level=3)
    p(doc, 'LLM调用通过统一的API客户端和配置中心管理：')
    bullet(doc, 'api-client.ts：统一封装chat()函数，支持agentId路由到对应模型配置')
    bullet(doc, 'llm-config.ts：集中管理所有Agent的模型、温度、Token限制等配置')
    bullet(doc, 'prompt-templates.ts：Prompt模板库，支持getOptimizedPrompt()按Agent名获取')
    bullet(doc, '双通道支持：dashscope（主）+ vectorengine（备），自动故障切换')

    # 11.3
    doc.add_heading('11.3 数据库设计', level=2)
    p(doc, 'FindJob使用PostgreSQL 14+，共设计30+张表，覆盖用户、岗位、简历、面试、Offer、成长和系统监控等领域。详细SQL脚本见附录A。')

    doc.add_heading('11.3.1 核心表清单', level=3)
    add_table(doc,
        ['领域', '表名', '说明', '关键字段'],
        [
            ['用户', 'users', '用户表', 'id, username, email, career_stage, target_position'],
            ['机会', 'opportunities', '岗位表', 'id, user_id, company, position, parsed_data(JSONB), match_score, status'],
            ['简历', 'resumes', '简历表', 'id, user_id, title, content(JSONB), is_master, version, based_on_opportunity_id'],
            ['项目', 'projects', '项目经历表', 'id, user_id, title, star_data(JSONB), tech_stack[]'],
            ['作品', 'portfolios', '作品集表', 'id, user_id, title, file_url, file_type, tags[]'],
            ['证书', 'certificates', '证书技能表', 'id, user_id, name, issuer, category, level'],
            ['面试', 'interviews', '面试记录表', 'id, user_id, opportunity_id, questions(JSONB), scores(JSONB), status'],
            ['面试复盘', 'interview_reviews', '复盘表', 'id, interview_id, scores(JSONB), feedback(JSONB)'],
            ['题库', 'question_bank', '面试题库', 'id, category, difficulty, question, tags[]'],
            ['练习', 'practice_records', '练习记录', 'id, user_id, question_id, score, feedback(JSONB)'],
            ['模拟面试', 'simulation_sessions', '模拟会话', 'id, user_id, scenario, questions(JSONB), report(JSONB)'],
            ['陪练', 'coaching_appointments', '真人陪练预约', 'id, user_id, appointment_time, status'],
            ['话术', 'script_library', '话术库', 'id, scenario, script, tips[], is_system'],
            ['Offer', 'offers', 'Offer表', 'id, user_id, base_salary, bonus, scores(JSONB), weights(JSONB), final_score'],
            ['Offer对比', 'offer_comparisons', '对比历史', 'id, offer_ids[], ai_suggestion(JSONB)'],
            ['谈薪', 'salary_negotiations', '谈薪记录', 'id, offer_id, round, my_expectation, their_offer'],
            ['对话', 'conversations', '对话记录', 'id, user_id, conversation_id, role, content'],
            ['Skills', 'automation_skills', '自动化', 'id, trigger_rule(JSONB), action(JSONB), is_enabled'],
            ['周计划', 'weekly_plans', '周计划', 'id, goals[], tasks(JSONB), completion_rate, ai_insights(JSONB)'],
            ['记忆', 'long_term_memory', '长期记忆', 'id, category, title, content, tags[], importance'],
            ['事件', 'analytics_events', '行为事件', 'id, event_type, event_name, event_data(JSONB)'],
            ['日指标', 'daily_metrics', '每日汇总', 'id, metric_date, metric_name, metric_value'],
            ['AI成本', 'ai_cost_logs', 'AI成本', 'id, service_type, model, input_tokens, output_tokens, cost_amount'],
            ['告警', 'system_alerts', '异常告警', 'id, severity, type, message, status'],
            ['配置', 'system_configs', '系统配置', 'id, config_key, config_value, config_type'],
            ['文件', 'file_uploads', '文件上传', 'id, user_id, filename, file_url, usage_type'],
            ['通知', 'notifications', '通知', 'id, user_id, type, title, is_read'],
            ['版本', 'schema_migrations', '数据库版本', 'version, applied_at'],
        ],
        col_widths=[2, 3.5, 3, 8]
    )

    doc.add_heading('11.3.2 关键视图', level=3)
    bullet(doc, 'v_user_job_funnel：用户求职闭环视图（统计每个用户的岗位数→投递数→面试数→Offer数→接受数）')
    bullet(doc, 'v_user_activity：用户活跃度视图（总事件数、活跃天数、最后活跃时间）')

    # 11.4
    doc.add_heading('11.4 部署架构', level=2)
    add_table(doc,
        ['组件', '部署方式', '说明'],
        [
            ['前端SPA', 'Cloudflare Pages', '全球CDN分发，自动HTTPS'],
            ['后端Worker', 'Cloudflare Workers', 'Serverless，按需计费，全球边缘节点'],
            ['PDF解析服务', 'Render.com', '独立Python服务，处理复杂PDF解析'],
            ['LLM API', '阿里云百炼 + VectorEngine', '双通道，自动故障切换'],
            ['数据库', 'PostgreSQL (规划中)', '当前使用Cloudflare KV/D1过渡'],
            ['CI/CD', 'Wrangler CLI', 'npm run deploy → wrangler pages deploy'],
        ],
        col_widths=[3, 4, 9.5]
    )


# ============================================================
# 第12章 非功能需求与运营指标
# ============================================================

def add_chapter_12(doc):
    doc.add_heading('第十二章 非功能需求与运营指标', level=1)

    # 12.1
    doc.add_heading('12.1 性能要求', level=2)
    add_table(doc,
        ['指标', '目标值', '说明'],
        [
            ['页面加载时间', '<2秒', '首页、列表页首次加载'],
            ['JD文本预处理', '<2秒', '文本清洗模式'],
            ['JD图片OCR', '<5秒', '图片识别模式（qwen-vl-max）'],
            ['JD完整解析', '<15秒', '结构化+A维度+B维度（并行优化后）'],
            ['匹配评估', '<10秒', '完整5维匹配分析'],
            ['简历优化', '<15秒', '定向简历生成'],
            ['面试准备材料', '<15秒', '完整面试准备包'],
            ['AI对话首字', '<3秒', '流式输出首字延迟'],
            ['AI评分单题', '<5秒', '面试回答评分'],
            ['并发能力', '100 QPS', '峰值并发请求'],
            ['JS包大小', '<1.5MB (gzip <300KB)', '前端JavaScript包'],
        ],
        col_widths=[4, 3, 9.5]
    )

    # 12.2
    doc.add_heading('12.2 安全与隐私', level=2)
    bullet(doc, '文件安全：上传的简历/证书文件解析后删除原文件，仅保留结构化JSON数据')
    bullet(doc, '会话安全：用户会话24小时无操作自动过期，JWT Token有效期2小时')
    bullet(doc, 'PII脱敏：隐私模式下自动脱敏手机号、邮箱、身份证号等敏感信息')
    bullet(doc, '传输加密：全站HTTPS，API通信使用Bearer Token认证')
    bullet(doc, '数据隔离：用户间数据完全隔离（user_id外键约束）')
    bullet(doc, 'AI安全：LLM输出经过内容审核，拒绝生成歧视性/不当内容')

    # 12.3
    doc.add_heading('12.3 兼容性', level=2)
    add_table(doc,
        ['平台/浏览器', '最低版本', '说明'],
        [
            ['Chrome', '90+', '主要支持浏览器'],
            ['Firefox', '88+', '全功能支持'],
            ['Safari', '14+', '全功能支持'],
            ['Edge', '90+', '全功能支持'],
            ['移动端', 'iOS 14+ / Android 10+', '响应式适配（查看为主，编辑有限）'],
            ['文件格式', 'PDF/DOCX/TXT/PNG/JPG', '简历导入支持格式'],
        ],
        col_widths=[4, 3, 9.5]
    )

    # 12.4
    doc.add_heading('12.4 北极星指标与运营指标体系', level=2)

    doc.add_heading('12.4.1 北极星指标', level=3)
    p(doc, '求职闭环率 = 进入Offer/决策阶段的用户数 / 进入首页的用户数', bold=True, size=12)
    p(doc, '当前值：10.0%    目标值：32%')
    p(doc, '闭环率定义了用户从"看机会"到"拿到Offer"的完整转化效率，是衡量产品核心价值的唯一指标。')

    doc.add_heading('12.4.2 过程指标', level=3)
    add_table(doc,
        ['指标', '当前值', '目标值', '说明'],
        [
            ['模块进入率-机会', '72%', '85%', '进入机会工作台的用户比例'],
            ['模块进入率-资产', '58%', '70%', '进入资产中心的用户比例'],
            ['模块进入率-面试', '49%', '65%', '进入面试工作台的用户比例'],
            ['模块进入率-决策', '21%', '35%', '进入决策中心的用户比例'],
            ['模块进入率-成长', '34%', '50%', '进入成长中心的用户比例'],
            ['岗位解析→定向简历', '60%', '75%', '核心漏斗转化环节'],
            ['定向简历→面试训练', '72.7%', '80%', '武器准备到实战的转化'],
        ],
        col_widths=[4, 2.5, 2.5, 7.5]
    )

    doc.add_heading('12.4.3 AI质量指标', level=3)
    add_table(doc,
        ['指标', '当前值', '目标值', '告警阈值', '说明'],
        [
            ['Agent成功率', '96.2%', '99%', '<95%', 'API调用成功率'],
            ['字段完整率', '94.7%', '97%', '<90%', '输出JSON字段完整度'],
            ['用户采纳率', '87.3%', '92%', '<80%', '用户接受AI建议的比例'],
            ['重跑率', '8.4%', '<5%', '>10%', '用户重新触发AI的比例'],
            ['投诉/幻觉率', '1.2%', '<0.5%', '>2%', '用户标记AI不准确的比例'],
        ],
        col_widths=[3, 2, 2, 2, 7.5]
    )

    doc.add_heading('12.4.4 成本指标', level=3)
    add_table(doc,
        ['指标', '当前值', '说明'],
        [
            ['单次任务平均成本', '¥2.8', '一次完整AI任务的API费用'],
            ['单用户月均成本', '¥38.6', '每用户每月AI消耗'],
            ['单位闭环成本', '¥14.8', '一个用户完成求职闭环的AI成本'],
            ['高价值行为成本', '¥6.2', '导致用户高价值行为的AI成本'],
            ['API错误率', '0.4%', 'AI API调用失败率'],
        ],
        col_widths=[4, 2.5, 10]
    )

    # 12.5 开发里程碑
    doc.add_heading('12.5 开发里程碑与实现状态', level=2)
    p(doc, '以下里程碑表清晰标注每个阶段的实现状态（[已实现] / [规划中]），便于阅读者了解当前产品所处阶段。', bold=True)
    doc.add_paragraph()

    doc.add_heading('12.5.1 阶段一：基础设施搭建（1-2周）', level=3)
    add_table(doc,
        ['任务', '状态', '完成时间', '说明'],
        [
            ['项目框架搭建（Hono + Vite + Cloudflare）', '[已实现]', '2026-01', '已部署到Cloudflare Pages'],
            ['LLM服务集成（dashscope + vectorengine）', '[已实现]', '2026-01', 'api-client.ts + llm-config.ts'],
            ['Multi-Agent DAG引擎', '[已实现]', '2026-02', 'dag-executor.ts，支持并行和重试'],
            ['Prompt模板库', '[已实现]', '2026-02', 'prompt-templates.ts，12+模板'],
            ['前端React SPA框架', '[已实现]', '2026-03', 'React 18 + React Router + Tailwind v4'],
            ['ShadCN UI组件库', '[已实现]', '2026-03', '67个基础组件'],
            ['设计系统（theme.css）', '[已实现]', '2026-03', '颜色/圆角/阴影/间距完整定义'],
            ['数据库设计（SQL脚本）', '[已实现]', '2026-03', '30+表，含视图/触发器/索引'],
            ['JWT认证', '[规划中]', '-', '用户注册/登录/Token管理'],
            ['OSS文件上传', '[规划中]', '-', '简历/证书文件存储'],
            ['Redis缓存', '[规划中]', '-', '热数据缓存/会话管理'],
            ['日志系统', '[规划中]', '-', '结构化日志/错误追踪'],
        ],
        col_widths=[5.5, 2, 2.5, 6.5]
    )

    doc.add_heading('12.5.2 阶段二：核心API实现（3-4周）', level=3)
    add_table(doc,
        ['任务', '状态', '说明'],
        [
            ['JD解析完整链路（预处理→结构化→A/B分析→公司分析）', '[已实现]', '4个Agent已上线，DAG协调完成'],
            ['简历解析（PDF/图片→结构化JSON）', '[已实现]', '支持文本和图片模式+备用PDF服务'],
            ['匹配评估（5维雷达+等级判定）', '[已实现]', '完整匹配规则实现'],
            ['简历优化（关键词注入+差距弥补+亮点强化）', '[已实现]', '支持用户自定义建议'],
            ['简历版本生成', '[已实现]', '关联岗位的定向简历版本'],
            ['面试准备材料生成', '[已实现]', '自我介绍+项目推荐+题目预测+策略'],
            ['面试记录与AI复盘', '[已实现]', '多维评分+优化答案'],
            ['面试教练（辅导评分+题目推荐）', '[已实现]', '支持JD-based和通用模式'],
            ['投递跟踪管理', '[已实现]', '状态管理+统计'],
            ['全局Chat对话', '[已实现]', '联网搜索+流式输出'],
            ['飞书数据同步', '[已实现]', 'Feishu API集成'],
            ['高保真前端页面（7大模块）', '[已实现]', '80+组件，已完成Figma→React转化'],
            ['全局悬浮AI助手', '[已实现]', 'AppShell集成，全局可用'],
            ['API接口规范文档', '[已实现]', '90+接口规范定义'],
            ['Offer管理与对比', '[规划中]', 'Offer CRUD + AI对比建议'],
            ['谈薪助手', '[规划中]', '话术库 + 个性化谈薪策略'],
            ['题库系统（1000+题）', '[规划中]', '题库CRUD + AI评分'],
            ['模拟面试', '[规划中]', '完整模拟面试流程'],
        ],
        col_widths=[6, 2, 8.5]
    )

    doc.add_heading('12.5.3 阶段三：高级功能（2-3周）', level=3)
    add_table(doc,
        ['任务', '状态', '说明'],
        [
            ['成长伴侣AI对话', '[规划中]', '长期对话+上下文记忆+情感支持'],
            ['Skills自动化引擎', '[规划中]', '定时/事件触发+执行+历史记录'],
            ['周计划与周复盘', '[规划中]', 'AI洞察+模式识别+改进建议'],
            ['长期记忆系统', '[规划中]', '自动提取+分类+检索+对话调用'],
            ['AI增强简历编辑器', '[规划中]', '模块化编辑+hover AI建议'],
            ['STAR项目素材库', '[规划中]', 'STAR法则结构化管理'],
            ['实时面试陪伴', '[规划中]', '面试中实时答题提示'],
            ['WebSocket实时通信', '[规划中]', '流式AI输出+实时通知'],
            ['数据驾驶舱完整后端', '[规划中]', '8个监控API + 数据聚合'],
            ['异常告警系统', '[规划中]', '自动诊断+告警+建议'],
        ],
        col_widths=[5, 2, 9.5]
    )

    doc.add_heading('12.5.4 阶段四：联调测试（1-2周）', level=3)
    add_table(doc,
        ['任务', '状态', '说明'],
        [
            ['前后端完整联调', '[规划中]', '所有模块API对接前端'],
            ['功能测试', '[规划中]', '核心功能验收测试'],
            ['性能测试', '[规划中]', '压力测试、LLM响应时间测试'],
            ['安全测试', '[规划中]', 'XSS/CSRF/注入/认证安全测试'],
            ['BUG修复', '[规划中]', '测试问题修复'],
        ],
        col_widths=[5, 2, 9.5]
    )

    doc.add_heading('12.5.5 里程碑总览', level=3)
    add_table(doc,
        ['里程碑', '目标日期', '状态', '核心交付物'],
        [
            ['M1 - MVP上线', '2个月', '[进行中] 约60%完成', '完整求职链路：岗位解析→简历匹配→定向简历→面试准备→投递管理'],
            ['M2 - Beta内测', '3个月', '[规划中]', 'Skills自动化+成长伴侣+完整监控+性能优化'],
            ['M3 - 正式版', '6个月', '[规划中]', '全部功能上线、用户1000+、AI质量稳定、商业化准备'],
        ],
        col_widths=[3, 2, 3.5, 8]
    )

    p(doc, '当前产品进度说明：', bold=True, size=11)
    bullet(doc, '已实现部分：项目框架、LLM集成、DAG引擎、12+Prompt模板、10个后端路由模块(含JD解析/简历解析/匹配评估/简历优化/面试准备/面试教练/投递管理/全局Chat等)、7大模块高保真前端页面(80+组件)、设计系统、数据库设计、API规范文档')
    bullet(doc, '进行中部分：前后端SPA架构整合（双构建方案实施中）、基础设施迁移')
    bullet(doc, '规划中部分：用户认证系统、Offer管理/对比、题库系统、模拟面试、成长伴侣、Skills自动化、周计划/复盘、长期记忆、完整后台监控后端、安全与性能测试、商业化功能')


# ============================================================
# 第13章 未来路线图
# ============================================================

def add_chapter_13(doc):
    doc.add_heading('第十三章 未来产品路线图', level=1)
    p(doc, '本章规划FindJob从V2.0到V3.0的产品演进路线，包含商业化体系、各工作台功能深化和技术演进。')

    # 13.1
    doc.add_heading('13.1 商业化体系', level=2)

    doc.add_heading('13.1.1 用户体系设计', level=3)
    add_table(doc,
        ['用户等级', '注册方式', '权限范围'],
        [
            ['游客', '无需注册', '首页浏览、产品介绍、1次JD解析体验'],
            ['免费用户', '邮箱/手机注册', '每月3次JD解析、1份简历管理、基础题库（50题）、AI对话20次/月'],
            ['会员用户', '订阅付费', '无限JD解析、无限简历、完整题库、无限AI对话、模拟面试、Offer对比、成长伴侣'],
            ['企业用户', '企业认证', '团队管理、批量岗位导入、定制Agent、数据分析看板、API接入'],
        ],
        col_widths=[3, 3, 10.5]
    )

    doc.add_heading('13.1.2 定价策略', level=3)
    add_table(doc,
        ['套餐', '月价', '年价（月均）', '核心权益', '对标竞品价格'],
        [
            ['免费版', '¥0', '¥0', '基础体验（JD解析3次/月+1份简历+50题题库）', '-'],
            ['标准版', '¥49/月', '¥29/月(¥348/年)', '无限JD解析+5份简历+完整题库+模拟面试5次/月+AI对话100次', 'Jobscan $49.95, Teal $29'],
            ['专业版', '¥99/月', '¥59/月(¥708/年)', '标准版全部+无限简历+无限模拟面试+Offer对比+成长伴侣+Skills+定向简历', 'Jobscan $89.95, Huntr $40'],
            ['求职冲刺包', '¥199（30天）', '-', '30天不限量使用全部功能（一次性购买）', '短期冲刺场景'],
        ],
        col_widths=[2.5, 2, 3, 5.5, 3.5]
    )

    p(doc, '定价原则：', bold=True)
    bullet(doc, '成本覆盖：专业版月均AI成本约¥38.6/用户，定价¥99确保正毛利')
    bullet(doc, '价值锚定：对标国际竞品价格的50-60%，本地化价格优势明显')
    bullet(doc, '分层清晰：免费版解决"是什么"，标准版解决"好用"，专业版解决"全面"')
    bullet(doc, '冲刺包设计：针对求职高峰期用户，30天高密度使用场景')

    doc.add_heading('13.1.3 营收模式', level=3)
    add_table(doc,
        ['营收来源', '预期占比', '说明'],
        [
            ['订阅收入', '70%', '标准版+专业版月/年订阅'],
            ['冲刺包', '15%', '一次性购买，求职高峰期'],
            ['企业服务', '10%', '企业版定制+API接入'],
            ['增值服务', '5%', '真人陪练预约、简历模板、高级报告'],
        ],
        col_widths=[3, 3, 10.5]
    )

    # 13.2
    doc.add_heading('13.2 功能演进路线', level=2)

    doc.add_heading('13.2.1 V2.1 - 机会工作台增强（Q2 2026）', level=3)
    bullet(doc, '智能推荐引擎：基于用户画像和历史行为，自动推荐匹配岗位')
    bullet(doc, '多平台JD自动采集：浏览器插件一键采集BOSS直聘/拉勾/猎聘/LinkedIn岗位')
    bullet(doc, '岗位对比功能：2-3个岗位横向对比（类似Offer对比）')
    bullet(doc, '公司评价集成：集成脉脉/看准网公司评价数据')

    doc.add_heading('13.2.2 V2.2 - 资产中心增强（Q3 2026）', level=3)
    bullet(doc, 'AI简历排版引擎：自动生成多种排版风格的简历PDF（清新/商务/创意）')
    bullet(doc, '简历A/B测试：同一岗位投递不同版本简历，追踪哪个版本回复率更高')
    bullet(doc, '智能作品集生成：基于项目数据自动生成在线作品集页面')
    bullet(doc, '求职画像AI优化：AI分析用户求职画像，建议补充或调整方向')

    doc.add_heading('13.2.3 V2.3 - 面试工作台增强（Q3 2026）', level=3)
    bullet(doc, '语音模拟面试：语音输入+语音识别+AI语音反馈（完整语音对话）')
    bullet(doc, '视频面试分析：录制视频面试，AI分析表情、肢体语言、语速')
    bullet(doc, '面试题贡献社区：用户分享真实面试题，积分激励')
    bullet(doc, '企业面试风格库：各大企业面试风格、偏好、高频题整理')

    doc.add_heading('13.2.4 V2.4 - 决策中心增强（Q4 2026）', level=3)
    bullet(doc, '薪资数据库：行业/岗位/城市的薪资中位数数据（脱敏统计）')
    bullet(doc, '生活成本对比：不同城市的生活成本对比（房租/交通/餐饮）')
    bullet(doc, '长期职业路径模拟：基于Offer选择，AI模拟5年职业发展路径')
    bullet(doc, '前同事评价：脱敏的前员工评价参考')

    doc.add_heading('13.2.5 V3.0 - 平台化（2027）', level=3)
    bullet(doc, '技能图谱系统：可视化个人技能图谱，与市场需求趋势对比')
    bullet(doc, '求职社区：求职经验分享、互助问答、导师连接')
    bullet(doc, '企业端产品：帮助HR筛选候选人、AI面试官、人才画像')
    bullet(doc, '跨端支持：iOS App / Android App / 微信小程序')

    # 13.3
    doc.add_heading('13.3 技术演进路线', level=2)
    add_table(doc,
        ['阶段', '技术升级', '时间', '说明'],
        [
            ['V2.0', 'Cloudflare Pages/Workers + KV存储', '当前', '快速迭代，验证产品价值'],
            ['V2.1', '独立PostgreSQL数据库 + Redis缓存', 'Q2 2026', '支撑数据量增长'],
            ['V2.2', 'WebSocket实时通信 + 消息队列', 'Q3 2026', '支撑实时对话和异步任务'],
            ['V2.3', '微服务拆分（AI服务独立）', 'Q4 2026', '独立扩展AI服务'],
            ['V3.0', '多端支持 + 独立后端框架', '2027', 'NestJS/Spring Boot + 移动端App'],
        ],
        col_widths=[2, 5.5, 2.5, 6.5]
    )

    # 13.4
    doc.add_heading('13.4 风险评估', level=2)
    add_table(doc,
        ['风险类型', '风险描述', '概率', '影响', '应对策略'],
        [
            ['技术风险', 'LLM服务不稳定/宕机', '中', '高', '双通道(dashscope+vectorengine)+降级策略'],
            ['技术风险', 'AI输出质量波动', '中', '高', 'Prompt版本管理+A/B测试+用户反馈闭环'],
            ['市场风险', '竞品快速跟进', '高', '中', '加速迭代+深化数据壁垒+社区建设'],
            ['成本风险', 'LLM API成本上升', '低', '中', '多模型分层+缓存优化+自建模型探索'],
            ['运营风险', '用户获取成本高', '中', '高', '内容营销+口碑传播+免费层级引流'],
            ['合规风险', '用户数据隐私', '低', '高', '数据最小化+加密+隐私合规审计'],
        ],
        col_widths=[2.5, 4, 1.5, 1.5, 7]
    )


# ============================================================
# 附录
# ============================================================

def add_appendix(doc):
    doc.add_heading('附录', level=1)

    # 附录A - SQL
    doc.add_heading('附录A：数据库完整SQL脚本', level=2)
    p(doc, '以下为FindJob V2.0完整数据库DDL脚本（PostgreSQL 14+）。包含30+张表、索引、触发器、视图和初始数据。')
    p(doc, '（完整SQL脚本请参见项目文件：figma_design/DATABASE_DESIGN.sql）')
    doc.add_paragraph()

    # 展示核心建表语句摘要
    p(doc, '核心表结构摘要：', bold=True)

    sql_samples = [
        ('用户表 users', '''CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    career_stage VARCHAR(20), -- 校招/社招/转行
    target_position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);'''),
        ('岗位表 opportunities', '''CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    salary_range VARCHAR(50),
    location VARCHAR(100),
    jd_content TEXT,
    parsed_data JSONB, -- {responsibilities, requirements, skills, benefits}
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    analysis JSONB, -- {strengths, weaknesses, suggestions}
    status VARCHAR(20) DEFAULT 'saved',
    tags TEXT[],
    source VARCHAR(50)
);'''),
        ('Offer表 offers', '''CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    base_salary INTEGER NOT NULL, -- 月薪（单位：分）
    bonus INTEGER DEFAULT 0,
    stock_options TEXT,
    benefits JSONB,
    scores JSONB, -- {salary, development, team, culture, location, stability}
    weights JSONB,
    final_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending'
);'''),
    ]

    for title, sql in sql_samples:
        doc.add_heading(title, level=3)
        para = doc.add_paragraph()
        run = para.add_run(sql)
        run.font.size = Pt(8.5)
        run.font.name = 'Consolas'
        para.paragraph_format.left_indent = Cm(0.5)

    # 附录B - API
    doc.add_heading('附录B：API接口规范摘要', level=2)
    p(doc, '以下为FindJob V2.0核心API接口摘要（完整规范请参见：figma_design/API_SPECIFICATION.md）。')
    doc.add_paragraph()

    add_table(doc,
        ['模块', '接口', '方法', '说明'],
        [
            ['认证', '/api/auth/register', 'POST', '用户注册'],
            ['认证', '/api/auth/login', 'POST', '用户登录'],
            ['认证', '/api/auth/profile', 'GET/PUT', '获取/更新用户信息'],
            ['机会', '/api/opportunities/parse', 'POST', 'AI解析岗位JD'],
            ['机会', '/api/opportunities', 'GET/POST', '岗位列表/创建'],
            ['机会', '/api/opportunities/{id}/generate-resume', 'POST', 'AI生成定向简历'],
            ['资产', '/api/resumes', 'GET', '简历列表'],
            ['资产', '/api/resumes/{id}', 'GET', '简历详情'],
            ['资产', '/api/resumes/{id}/export', 'GET', '导出简历(PDF/DOCX)'],
            ['资产', '/api/projects', 'GET', '项目列表'],
            ['面试', '/api/interviews', 'GET/POST', '面试记录列表/创建'],
            ['面试', '/api/interviews/{id}/review', 'POST', 'AI面试复盘'],
            ['面试', '/api/questions', 'GET', '题库列表'],
            ['面试', '/api/questions/{id}/practice', 'POST', '题目练习+AI评分'],
            ['面试', '/api/simulation/start', 'POST', '开始模拟面试'],
            ['面试', '/api/simulation/{id}/answer', 'POST', '提交模拟答案'],
            ['面试', '/api/simulation/{id}/end', 'POST', '结束模拟面试'],
            ['决策', '/api/offers', 'GET/POST', 'Offer列表/创建'],
            ['决策', '/api/offers/compare', 'POST', 'AI对比Offers'],
            ['决策', '/api/offers/salary-scripts', 'GET', '谈薪话术'],
            ['成长', '/api/growth/chat', 'POST', 'AI成长伴侣对话'],
            ['成长', '/api/growth/skills', 'GET/POST', 'Skills列表/创建'],
            ['成长', '/api/growth/skills/{id}/run', 'POST', '手动运行Skill'],
            ['成长', '/api/growth/plans', 'GET/POST', '周计划列表/创建'],
            ['成长', '/api/growth/plans/{id}/reflect', 'POST', '周复盘+AI洞察'],
            ['成长', '/api/growth/memory', 'GET/POST', '长期记忆管理'],
            ['监控', '/api/analytics/kpi', 'GET', '核心KPI'],
            ['监控', '/api/analytics/funnel', 'GET', '闭环漏斗数据'],
            ['监控', '/api/analytics/trends', 'GET', '趋势数据'],
            ['监控', '/api/analytics/modules', 'GET', '模块表现'],
            ['监控', '/api/analytics/ai-quality', 'GET', 'AI质量指标'],
            ['监控', '/api/analytics/costs', 'GET', '成本数据'],
            ['监控', '/api/analytics/alerts', 'GET', '异常告警'],
            ['监控', '/api/analytics/diagnosis', 'GET', '自动诊断'],
        ],
        col_widths=[2, 5.5, 2, 7]
    )

    # 附录C - 错误码
    doc.add_heading('附录C：错误码定义', level=2)
    add_table(doc,
        ['错误码', '说明'],
        [
            ['400', '请求参数错误（Bad Request）'],
            ['401', '未登录（Unauthorized）'],
            ['403', '无权限（Forbidden）'],
            ['404', '资源不存在（Not Found）'],
            ['429', '请求过于频繁（Too Many Requests）'],
            ['500', '服务器错误（Internal Server Error）'],
            ['10001', '用户名已存在'],
            ['10002', '邮箱已被注册'],
            ['20001', '岗位不存在'],
            ['20002', 'JD解析失败'],
            ['20003', '简历生成失败'],
            ['30001', '简历不存在'],
            ['30002', '简历导出失败'],
            ['40001', '面试记录不存在'],
            ['40004', 'AI评分失败'],
            ['50001', 'Offer不存在'],
            ['50002', 'Offer数量超过限制'],
            ['60001', 'Skill不存在'],
            ['60002', 'Skill运行失败'],
            ['90001', 'AI服务不可用'],
            ['90002', 'AI响应超时'],
            ['90003', 'AI配额不足'],
            ['90004', 'AI响应格式错误'],
            ['90005', 'AI内容审核未通过'],
        ],
        col_widths=[3, 13.5]
    )

    # 附录D - 术语
    doc.add_heading('附录D：术语表', level=2)
    add_table(doc,
        ['术语', '说明'],
        [
            ['ATS', 'Applicant Tracking System，简历自动筛选系统'],
            ['STAR', 'Situation-Task-Action-Result，结构化项目描述方法'],
            ['PREP', 'Point-Reason-Example-Point，结构化回答框架'],
            ['DAG', 'Directed Acyclic Graph，有向无环图（Agent调度）'],
            ['LLM', 'Large Language Model，大语言模型'],
            ['Agent', '执行特定任务的AI模块，包含独立的Prompt和配置'],
            ['北极星指标', 'North Star Metric，产品最核心的成功指标'],
            ['Skill', '成长中心的自动化任务，支持定时/事件触发'],
            ['求职闭环', '从岗位发现到Offer接受的完整流程'],
            ['定向简历', '针对特定岗位AI优化的简历版本'],
        ],
        col_widths=[3, 13.5]
    )


# ============================================================
# Part 3 集成
# ============================================================

def add_part3(doc):
    """添加Part 3所有章节"""
    print("  第10章 Prompt工程...")
    add_chapter_10(doc)
    print("  第11章 技术实现方案...")
    add_chapter_11(doc)
    print("  第12章 非功能需求与运营指标...")
    add_chapter_12(doc)
    print("  第13章 未来路线图...")
    add_chapter_13(doc)
    print("  附录...")
    add_appendix(doc)


if __name__ == '__main__':
    # 完整生成
    from generate_prd_v2 import main as create_part1
    from generate_prd_part2 import add_part2

    doc = create_part1()
    add_part2(doc)
    add_part3(doc)

    output_path = '/home/user/webapp/webapp/prd_output/FindJob_PRD_V2.0.docx'
    doc.save(output_path)
    print(f"\n  === 完整PRD V2.0 生成成功 ===")
    print(f"  文件路径: {output_path}")

    import os
    size = os.path.getsize(output_path)
    print(f"  文件大小: {size / 1024:.1f} KB")
