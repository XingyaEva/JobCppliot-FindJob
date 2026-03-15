#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FindJob V2.0 PRD 生成器 - Part 2 (Ch5-Ch9)
面试工作台、决策中心、成长中心、首页/驾驶舱、AI Agent设计
"""

import sys
sys.path.insert(0, '/home/user/webapp/webapp/prd_output')
from generate_prd_v2 import *


# ============================================================
# 第5章 面试工作台
# ============================================================

def add_chapter_5(doc):
    doc.add_heading('第五章 面试工作台', level=1)
    p(doc, '面试工作台覆盖面试准备的全链路：题库练习→面试辅导→模拟面试→实时陪伴→面试复盘。目标是让用户"有准备地上战场，有复盘地提升能力"。')

    # F12
    add_feature_block(doc,
        fid='F12', name='面试题库与AI评分', priority='P0', status_done=False,
        desc='提供1000+面试题库（技术/行为/场景三大分类），支持按难度、标签筛选。用户练习回答后，AI给出即时评分和反馈（优势、不足、优化建议、参考答案）。',
        user_story='作为一名求职者，我希望有大量高质量面试题可以练习，并且每次练习后能得到专业点评，知道自己哪里答得好、哪里需要改进。',
        preconditions=['用户已登录', '题库已初始化'],
        main_flow=[
            '进入面试工作台 > 题库模块',
            '按分类浏览：技术面试题 / 行为面试题 / 场景面试题',
            '按难度筛选：简单 / 中等 / 困难',
            '按标签筛选：系统设计、算法、产品设计、领导力等',
            '选择题目，输入回答文本',
            '提交回答，系统调用面试教练Agent进行AI评分',
            '返回评分结果：总分(1-10)、亮点、必改项、优化建议、表达润色、参考答案',
            '支持收藏题目、查看练习历史、统计练习进度',
        ],
        alt_flows=[
            '基于目标岗位JD自动推荐相关题目',
            '支持从面试记录中导入真实面试题到题库',
        ],
        exception_handling=[
            '异常E1：AI评分超时(>10s) → 显示"评分中..."，后台异步完成后推送通知',
            '异常E2：回答内容过短(<20字) → 提示"回答内容过短，请补充更多细节"',
            '异常E3：AI评分解析失败 → 返回默认反馈框架 + 提示"AI解析异常，建议重试"',
        ],
        output_spec='''{questionId, score: 1-10, feedback: {must_fix: string[], suggestions: string[], polish: string[], highlights: string[], improvement_direction: string}, improved_answer?: string, practiceRecordId}''',
        prompt_example='''System Prompt (面试教练Agent):
你是一位资深的面试教练，拥有丰富的招聘和候选人辅导经验。
请对以下面试问答进行专业点评。

评分标准（1-10分）：
- 1-3分：回答有严重问题，需要完全重写
- 4-5分：回答勉强及格，需要较大改进
- 6-7分：回答合格，有优化空间
- 8-9分：回答优秀，小幅润色即可
- 10分：回答完美

点评要求：
1. must_fix：指出回答中的硬伤（逻辑错误、与岗位要求相悖、态度问题）
2. suggestions：给出可操作的优化建议
3. polish：提供更专业的表达方式或更有吸引力的措辞
4. highlights：肯定做得好的地方，增强候选人信心
5. improvement_direction：一句话总结最需要改进的方向''',
        acceptance=[
            '题库包含≥200道题（初始版本）',
            'AI评分在5秒内返回',
            '评分结果包含至少2条亮点和2条改进建议',
            '支持至少3种筛选条件组合',
        ],
        ui_desc='面试工作台中栏展示题目列表（左侧筛选栏+题目卡片列表）。右侧为答题区域：题目显示+文本输入框+提交按钮。下方显示AI评分结果卡片。'
    )

    # F13
    add_feature_block(doc,
        fid='F13', name='面试辅导与准备', priority='P0', status_done=True,
        desc='基于目标岗位的JD分析和用户简历，AI生成个性化面试准备材料：自我介绍（1分钟/2分钟版本）、项目推荐（最匹配的1-2个项目+STAR大纲）、常见问题预测与PREP回答框架、整体面试策略。',
        user_story='作为一名求职者，面试前我希望有一份针对性的准备材料，包括怎么做自我介绍、准备哪些项目故事、可能被问到什么问题。',
        preconditions=['目标岗位已完成JD解析和匹配评估', '用户有简历数据'],
        main_flow=[
            '用户在岗位详情页点击"开始面试准备"',
            '系统调用面试准备Agent，输入：简历+JD+匹配结果+公司分析',
            '生成自我介绍：version_1min(150-200字) + version_2min(300-400字) + key_points + delivery_tips',
            '生成项目推荐：1-2个最相关项目的STAR故事大纲 + 预期追问',
            '生成面试题预测：关于你的(经历/能力/性格) + 关于公司(了解/匹配/贡献) + 关于未来(规划/期望)',
            '生成面试策略：目标印象、核心信息、避免话题、反问问题',
            '用户可编辑和保存准备材料',
        ],
        alt_flows=[
            '无特定岗位时，生成通用面试准备材料',
            '用户可自定义面试重点方向',
        ],
        exception_handling=[
            '异常E1：生成超时(>15s) → 分步返回（先返回自我介绍，其余异步完成）',
            '异常E2：简历信息不足 → 生成通用版本 + 标注"以下内容基于有限信息，建议补充简历后重新生成"',
        ],
        output_spec='''{self_introduction: {version_1min, version_2min, key_points[], delivery_tips[]}, project_recommendations: [{project_name, match_reason, focus_points[], expected_questions[], story_outline}], interview_questions: {about_you: [{question, category, prep_answer: {point, reason, example, point_reiterate}}], about_company: [...], about_future: [...]}, overall_strategy: {impression_goal, key_messages[], avoid_topics[], closing_questions[]}}''',
        prompt_example='''面试准备Agent输出示例:
{
  "self_introduction": {
    "version_1min": "您好，我是张三，5年产品经验，专注ToB SaaS产品...",
    "version_2min": "扩展版，增加项目细节和数据...",
    "key_points": ["数据驱动决策", "从0到1产品经验", "跨团队协作"],
    "delivery_tips": ["保持语速适中", "强调关键数字时稍作停顿"]
  }
}''',
        acceptance=[
            '面试准备材料在15秒内生成完成',
            '自我介绍版本字数在规定范围内',
            '项目推荐与目标岗位相关度高',
            '面试题预测覆盖3种以上类型',
        ],
        ui_desc='岗位详情页的面试准备Tab。卡片式展示：自我介绍卡（可切换1min/2min版本）、项目推荐卡、题目预测卡（可展开查看PREP回答）、策略卡。'
    )

    # F14
    add_feature_block(doc,
        fid='F14', name='模拟面试', priority='P1', status_done=False,
        desc='AI模拟面试官，根据目标岗位生成面试场景（技术面/HR面/压力面），逐题提问并即时评分，面试结束后生成完整报告（总分、各维度分析、优劣势、改进建议）。',
        user_story='作为一名求职者，我希望在真正面试前能进行模拟练习，体验真实的面试节奏，获得系统性的反馈。',
        preconditions=['用户已登录'],
        main_flow=[
            '进入面试工作台 > 模拟面试',
            '选择面试配置：场景（技术面/HR面/压力面）、目标岗位（可选）、难度、时长',
            '点击"开始模拟"，系统生成题目列表（含每题建议时长）',
            '逐题呈现：显示题目 → 用户输入回答 → 提交 → AI即时评分 → 显示下一题',
            '用户可在过程中跳过或结束',
            '面试结束，生成完整报告：总分、内容/逻辑/表达各维度分、strengths/improvements/recommendations',
            '报告保存到模拟面试历史',
        ],
        alt_flows=[
            '中途放弃 → 保存已完成部分，状态标记为"abandoned"',
            '超时未提交 → 提示并自动进入下一题',
        ],
        exception_handling=[
            '异常E1：题目生成失败 → 使用题库中的默认题目组合',
            '异常E2：单题AI评分失败 → 跳过评分继续面试，结束后统一评分',
            '异常E3：网络中断 → 本地缓存已提交答案，恢复后继续',
        ],
        output_spec='''{sessionId, scenario, totalQuestions, totalTime, scores: {content, logic, expression, overall}, report: {summary, strengths[], improvements[], recommendations[]}}''',
        acceptance=[
            '模拟面试开始到第一题呈现<5秒',
            '每题AI评分<8秒',
            '完整报告在面试结束后10秒内生成',
            '支持至少3种面试场景',
        ],
        ui_desc='全屏模拟面试界面。顶部进度条+倒计时。中央大字体显示题目。下方文本输入区。右侧显示即时评分(可收起)。结束后跳转报告页。'
    )

    # F15
    add_feature_block(doc,
        fid='F15', name='实时面试陪伴助手', priority='P2', status_done=False,
        desc='在真实面试过程中提供实时辅助，类似"面试教练耳麦"。基于面试题目实时提供答题要点、注意事项和非语言暗示建议（眼神接触、手势、微笑、停顿）。',
        user_story='作为一名求职者，真实面试时如果能有一个AI助手提示我答题要点和肢体语言建议，我会更有信心。',
        preconditions=['用户正在参加面试', '已提前输入面试相关信息'],
        main_flow=[
            '面试开始前，输入面试信息（公司、岗位、面试轮次）',
            '系统基于JD分析预加载相关知识',
            '面试中，用户输入面试官的问题（文字输入或语音转写）',
            '系统实时返回：答题要点(3-5个bullet)、STAR框架提示、注意事项',
            '同时提供非语言建议：保持眼神接触、适当手势、微笑、关键点前停顿',
            '面试结束后自动生成面试记录',
        ],
        alt_flows=['语音转写模式（未来支持）：麦克风输入 → 语音转文字 → AI分析'],
        exception_handling=[
            '异常E1：AI响应延迟(>5s) → 先显示通用建议框架',
            '异常E2：问题理解错误 → 用户可重新输入或修正',
        ],
        output_spec='实时提示：{keyPoints[], starHint, warnings[], bodyLanguageTips[]}',
        prompt_example='''面试辅助 Action Library（非语言建议）:
- 眼神接触：回答关键论点时保持与面试官眼神交流
- 手势：列举要点时用手指计数
- 身体前倾：表达对问题的重视和思考
- 微笑：开场和结束时自然微笑
- 停顿：重要数据前停顿1秒，增强记忆效果
- 语速：保持中等语速，关键词适当放慢''',
        acceptance=[
            'AI提示在3秒内返回',
            '每个问题至少提供3个答题要点',
            '非语言建议与面试场景相关',
        ],
        ui_desc='极简界面：顶部输入框（问题输入）、中央答题要点卡片（大字体）、底部非语言提示条。设计为手机可用的小窗口模式。'
    )

    # F16
    add_feature_block(doc,
        fid='F16', name='面试复盘系统', priority='P0', status_done=True,
        desc='面试结束后，用户录入面试题目和回答，AI进行全面复盘：每题评分（内容/逻辑/表达/专业度）、优化答案、整体建议。支持查看历史复盘和进步趋势。',
        user_story='作为一名求职者，每次面试后我希望有系统化的复盘，知道哪些问题答得好、哪些需要改进，下次面试能做得更好。',
        preconditions=['用户已完成一次面试', '面试记录已创建'],
        main_flow=[
            '用户在面试工作台创建面试记录：公司、岗位、时间、轮次、面试官',
            '录入面试题目和自己的回答（逐题录入）',
            '可选：添加面试笔记和个人感受',
            '点击"AI复盘"，系统调用面试教练Agent',
            'AI对每道题进行评分：内容(85) + 逻辑(80) + 表达(75) + 专业度(90) = 总分(82)',
            '每题输出：strengths(STAR结构清晰/数据量化)、weaknesses(缺少失败反思)、optimizedAnswer(优化后回答)、suggestions(补充建议)',
            '输出整体建议：overall_suggestions[]',
            '复盘结果保存，支持查看历史对比',
        ],
        alt_flows=[
            '只输入题目不输入回答 → 系统仅生成参考答案，不评分',
            '关联已有岗位 → AI结合JD分析给出更有针对性的反馈',
        ],
        exception_handling=[
            '异常E1：单题评分失败 → 标注"此题评分暂不可用"，不影响其他题',
            '异常E2：录入题目过多(>20题) → 提示"建议录入最关键的10-15题进行深度复盘"',
        ],
        output_spec='''{interviewId, scores: {content, logic, expression, professionalism, overall}, feedback: [{questionId, question, yourAnswer, score, strengths[], weaknesses[], optimizedAnswer, suggestions[]}], overallSuggestions[]}''',
        acceptance=[
            '完整复盘在15秒内完成（10题以内）',
            '每题至少2条strengths和2条weaknesses',
            '优化后回答保持真实性不编造经历',
            '整体建议具有可操作性',
        ],
        ui_desc='面试工作台 > 面试复盘。左栏面试列表，中栏详情（题目+回答+评分），右栏AI反馈面板（每题展开显示详细反馈和优化答案）。'
    )


# ============================================================
# 第6章 决策中心
# ============================================================

def add_chapter_6(doc):
    doc.add_heading('第六章 决策中心', level=1)
    p(doc, '决策中心帮助用户在拿到Offer后做出理性决策，从"感觉决策"升级为"数据驱动决策"。包含Offer管理、多维对比、谈薪辅助和AI选择建议。')

    # F17
    add_feature_block(doc,
        fid='F17', name='Offer管理', priority='P0', status_done=False,
        desc='录入和管理所有收到的Offer，包含薪资详情（基本工资/年终奖/股票期权）、福利信息、各维度评分和状态管理。',
        user_story='作为一名求职者，收到多个Offer时，我希望有一个地方集中管理所有Offer的详细信息，不遗漏任何重要细节。',
        preconditions=['用户已登录'],
        main_flow=[
            '进入决策中心 > Offer列表',
            '点击"添加Offer"',
            '填写Offer信息：公司、岗位、基本月薪、年终奖、期权/股票、福利（五险一金/年假/其他）',
            '各维度评分（1-100）：薪资、发展空间、团队、文化、城市、稳定性',
            '各维度权重设置（总和100%）',
            '系统计算加权总分',
            'Offer状态管理：pending → accepted/rejected',
            '可选：关联到对应的岗位记录',
        ],
        alt_flows=['从面试记录自动创建Offer草稿'],
        exception_handling=[
            '异常E1：薪资格式错误 → 提示"请输入数字格式的月薪"',
            '异常E2：权重总和≠100% → 自动归一化或提示修正',
        ],
        output_spec='{id, company, position, baseSalary, bonus, stockOptions, benefits: {insurance, vacation, other[]}, scores: {salary, development, team, culture, location, stability}, weights: {...}, finalScore, status, decisionDate}',
        acceptance=[
            '支持同时管理最多10个Offer',
            '加权评分实时计算',
            '支持Offer状态流转',
        ],
        ui_desc='决策中心左栏Offer卡片列表（公司名/岗位/薪资/评分/状态）。中栏Offer详情表单。右栏系统推荐卡片。'
    )

    # F18
    add_feature_block(doc,
        fid='F18', name='Offer多维对比', priority='P0', status_done=False,
        desc='选择2-3个Offer进行多维度横向对比。展示薪资维度对比矩阵（固定薪资/奖金/期权/级别/汇报线）、成长维度（业务增长/团队质量/学习价值）、生活维度（工作量/城市因素），AI给出综合排名和推荐。',
        user_story='作为一名拿到多个Offer的求职者，我需要一个清晰的对比视图，帮我理性分析每个Offer的优劣势，做出最适合自己的选择。',
        preconditions=['至少有2个Offer'],
        main_flow=[
            '选择要对比的Offer（2-3个）',
            '设置各维度权重（收入/成长/城市/工作生活平衡）',
            '系统展示对比矩阵：固定薪资、奖金、期权、级别/汇报线、业务增长性、团队质量、学习价值、工作量、城市因素、长期职业匹配',
            '系统调用AI分析，生成综合建议',
            'AI输出：推荐选择(recommendation)、推荐理由(reasons[])、注意事项(cautions[])、替代建议(alternatives)',
            '用户可调整权重重新计算',
            '支持保存对比结果和标记目标Offer',
        ],
        alt_flows=['仅1个Offer → 仅显示该Offer的优劣分析，不进行对比'],
        exception_handling=[
            '异常E1：Offer信息不完整 → 标注缺失维度为"信息不足"',
            '异常E2：AI建议生成失败 → 仅展示数据对比矩阵',
            '异常E3：对比数量超过3个 → 提示"最多支持3个Offer同时对比"',
        ],
        output_spec='''{comparison: {offers: [{id, company, finalScore, rank}], matrix: {salary: {offer1: score, offer2: score}, development: {...}, ...}}, aiSuggestion: {recommendation, reasons[], cautions[], alternatives}}''',
        acceptance=[
            '对比矩阵在3秒内渲染',
            'AI建议在10秒内生成',
            '权重调整实时更新排名',
            '对比结果可保存和分享',
        ],
        ui_desc='决策中心Offer对比页面。顶部并排显示对比Offer概要。中间为关键维度对比表格（高亮最优项）。下方AI综合建议卡（结论+理由+风险提示）。'
    )

    # F19
    add_feature_block(doc,
        fid='F19', name='谈薪助手', priority='P1', status_done=False,
        desc='提供谈薪话术库（系统预置+用户自定义），覆盖常见场景（初次报价、拒绝低价、争取更高、接受Offer）。每个话术包含脚本、技巧和示例。支持AI根据具体Offer生成个性化谈薪建议。',
        user_story='作为一名求职者，谈薪是我最紧张的环节，我希望有专业的话术参考和策略指导。',
        preconditions=['用户有相关Offer'],
        main_flow=[
            '进入决策中心 > 谈薪助手',
            '浏览话术库：按场景分类（初次报价/拒绝低价/争取更高/接受/拒绝）',
            '每个话术包含：标题、脚本模板、技巧tips[]、示例examples[]',
            '基于特定Offer生成个性化谈薪策略',
            '记录谈薪过程：轮次、我的期望、对方报价、谈判笔记、结果',
            '支持用户自定义添加话术',
        ],
        alt_flows=['AI根据市场薪资数据建议合理薪资范围'],
        exception_handling=[
            '异常E1：话术库加载失败 → 显示本地缓存的基础话术',
        ],
        output_spec='话术：{id, scenario, title, script, tips[], examples[], category}; 谈薪记录：{id, offerId, round, myExpectation, theirOffer, notes, result}',
        prompt_example='''系统预置话术示例:
场景：初次报价
标题：委婉表达期望薪资
话术：根据我的经验和市场行情，我期望的薪资范围是XX-XX，不知道贵司是否能够接受？
技巧：
1. 不要第一时间报出具体数字
2. 先了解对方的预算范围
3. 留出谈判空间''',
        acceptance=[
            '预置至少3种场景的话术',
            '谈薪记录支持多轮记录',
            '个性化建议在5秒内生成',
        ],
        ui_desc='决策中心 > 谈薪模块。左侧场景分类导航。中间话术卡片展示（可展开/折叠）。右侧谈薪记录时间线。'
    )

    # F20
    add_feature_block(doc,
        fid='F20', name='AI选择建议', priority='P1', status_done=False,
        desc='综合用户的职业目标、个人偏好、Offer数据和市场信息，AI给出个性化的Offer选择建议，包括推荐结论、风险提醒和长期发展分析。',
        user_story='作为一名求职者，面对多个看似都不错的Offer，我需要AI从更长远的角度帮我分析，给出综合建议。',
        preconditions=['至少有1个Offer', '用户已设置职业目标（可选）'],
        main_flow=[
            '用户请求AI建议',
            '系统综合分析：Offer数据 + 用户画像 + 职业目标 + 市场趋势',
            'AI输出推荐结论、推荐理由（3-5条）、风险提醒（2-3条）、替代建议',
            '用户可提供补充信息（如"我比较看重发展空间和团队氛围"）后重新生成',
        ],
        alt_flows=['用户无明确职业目标 → AI基于行业趋势和Offer数据给出通用建议'],
        exception_handling=[
            '异常E1：分析信息不足 → 标注信息缺失部分，给出有限建议',
        ],
        output_spec='{recommendation, reasons[], cautions[], alternatives, longTermAnalysis}',
        acceptance=[
            '建议在10秒内生成',
            '建议与用户偏好相关',
            '包含至少2条风险提醒',
        ],
        ui_desc='决策中心右栏AI建议面板。结论卡片（推荐公司+原因）、风险提醒卡（红色边框）、替代分析卡。底部操作：标记目标Offer、保存结果。'
    )


# ============================================================
# 第7章 成长中心
# ============================================================

def add_chapter_7(doc):
    doc.add_heading('第七章 成长中心', level=1)
    p(doc, '成长中心是FindJob区别于所有竞品的核心差异化模块。它不是一次性的求职工具，而是长期陪伴用户职业发展的AI伙伴系统。设计风格比其他工作台"更柔和"，强调陪伴感而非效率感。')

    # F21
    add_feature_block(doc,
        fid='F21', name='AI成长伴侣', priority='P0', status_done=False,
        desc='AI成长伴侣是一个长期对话式AI助手，具备职业咨询能力。能理解用户的求职焦虑、职业困惑，提供专业建议和情感支持。支持多轮对话，能调取用户的面试记录、Offer信息等上下文。',
        user_story='作为一名求职者，我经常感到焦虑和迷茫，希望有一个了解我情况的AI"导师"，可以随时聊聊职业发展的困惑。',
        preconditions=['用户已登录'],
        main_flow=[
            '进入成长中心 > 成长伴侣',
            '显示对话界面：顶部"成长伴侣·在线"标识',
            '用户发送消息（文本）',
            '系统调用成长伴侣Agent（启用联网搜索），结合用户上下文生成回复',
            '回复中可嵌入行动建议（如跳转到面试复盘、制定周计划等）',
            '对话历史自动保存，支持续接上次对话',
            '重要洞察自动存入长期记忆（F24）',
        ],
        alt_flows=[
            '新用户首次使用 → 伴侣主动发起："你好，我是你的成长伴侣。聊聊你目前的求职状况吧？"',
            '用户长期未使用 → 推送关怀消息',
        ],
        exception_handling=[
            '异常E1：LLM响应超时 → 显示"我在想想..."，10秒后重试',
            '异常E2：用户输入负面情绪 → 优先安抚，然后给出建设性建议',
            '异常E3：用户提问超出求职范围 → 温和引导回求职话题',
        ],
        output_spec='''{conversationId, reply: string, suggestions: [{type: "action"|"plan"|"link", text, link?}], timestamp}''',
        prompt_example='''成长伴侣Agent调用示例:
用户："我最近面试总是挂在二面，该怎么办？"

AI回复："我理解你的焦虑。让我们分析一下可能的原因：
1. 准备不足：二面通常更深入，需要展示深度思考...
2. 表达问题：可能逻辑不够清晰...

建议你：
- 去面试复盘模块，仔细分析每次二面的问题
- 针对性地准备STAR案例
- 多做模拟面试练习

需要我帮你制定一个2周的专项提升计划吗？"

suggestions: [
  {type: "action", text: "查看面试复盘", link: "/interviews?tab=review"},
  {type: "plan", text: "制定提升计划", action: "create_plan"}
]''',
        acceptance=[
            '首次回复<3秒（流式输出）',
            '回复具有同理心和专业性',
            '能引用用户的历史数据（面试/Offer等）',
            '行动建议可点击跳转',
        ],
        ui_desc='成长中心中栏：上方伴侣状态卡（头像+在线状态+系统说明）。中间对话区域（气泡样式）。下方输入框+快捷操作按钮（安排周计划/运行复盘/创建Skill）。'
    )

    # F22
    add_feature_block(doc,
        fid='F22', name='Skills自动化', priority='P1', status_done=False,
        desc='用户可创建自动化"技能"（类似IFTTT），按定时或事件触发执行。系统预置常用Skill（每天一道题、每周岗位扫描等），用户也可自定义。研究显示启用Skills的用户14日留存高出非启用用户24个百分点。',
        user_story='作为一名求职者，我希望系统能自动帮我做一些重复性工作，比如每天推送一道面试题，每周汇总新岗位。',
        preconditions=['用户已登录'],
        main_flow=[
            '进入成长中心 > Skills管理',
            '查看系统预置Skills：每天一道题(cron: 0 8 * * *)、每周岗位扫描、面试倒计时提醒',
            '启用/禁用Skill',
            '创建自定义Skill：名称、描述、触发规则（定时cron/事件触发）、执行动作（通知/AI分析/数据聚合）',
            '手动运行Skill测试',
            '查看运行历史和结果',
        ],
        alt_flows=['新用户注册后引导开启2个核心Skill（"每天一道题"+"每周岗位扫描"）'],
        exception_handling=[
            '异常E1：Skill运行失败 → 记录错误日志，标记状态，下次自动重试',
            '异常E2：cron表达式格式错误 → 实时校验并提示',
        ],
        output_spec='{id, name, description, triggerRule: {type, cron?}, action: {type, template?}, isEnabled, isSystem, runHistory: [{runAt, status, result}], lastRunAt, nextRunAt}',
        acceptance=[
            '系统预置至少3个Skill',
            '定时Skill在预定时间±1分钟内触发',
            '运行历史完整记录',
        ],
        ui_desc='成长中心 > Skills列表。每个Skill为卡片：名称+描述+开关+最近运行状态。点击展开详情：触发规则+运行历史时间线。右上角"创建Skill"按钮。'
    )

    # F23
    add_feature_block(doc,
        fid='F23', name='周计划与周复盘', priority='P1', status_done=False,
        desc='帮助用户制定每周求职计划（目标+任务列表），周末进行复盘。AI基于完成情况和历史数据提供洞察（模式识别、改进建议、下周调整）。',
        user_story='作为一名求职者，我需要有节奏地推进求职，每周有明确的目标和任务，周末能回顾总结，持续进步。',
        preconditions=['用户已登录'],
        main_flow=[
            '进入成长中心 > 周计划',
            '创建本周计划：设定目标（投递N个岗位、完成N次模拟面试等）、添加任务（具体行动+截止日）',
            '日常标记任务完成状态',
            '系统自动计算完成率',
            '周末点击"开始复盘"：输入反思（本周亮点、遇到的问题）',
            'AI生成洞察：patterns（识别行为模式）、suggestions（改进建议）、improvements（下周调整方案）',
            '复盘保存，支持查看历史周计划和完成率趋势',
        ],
        alt_flows=['AI主动建议本周计划（基于当前求职状态）'],
        exception_handling=[
            '异常E1：AI洞察生成失败 → 仅保存用户文字复盘，标注"AI分析稍后更新"',
        ],
        output_spec='''{id, weekStartDate, weekEndDate, goals[], tasks: [{id, content, dueDate, isCompleted, completedAt}], completionRate, reflection, highlights[], problems[], aiInsights: {patterns[], suggestions[], improvements[]}, status}''',
        prompt_example='''AI周复盘洞察示例:
用户反思："本周完成了6个岗位投递，但只有2个回复。面试准备不充分。"

AI洞察：
patterns: ["你的投递回复率只有33%，可能是简历匹配度不够高", "连续3周都没完成模拟面试目标"]
suggestions: ["建议使用定向简历功能，提高简历匹配度", "可以将模拟面试拆分成每天15分钟的小目标"]
improvements: ["下周目标调整为：投递5个高匹配岗位（质量优先）", "每天晚上8点固定15分钟练习1道题"]''',
        acceptance=[
            '周计划创建<3秒',
            '完成率实时更新',
            'AI洞察在10秒内生成',
            '历史周计划可查看对比',
        ],
        ui_desc='成长中心 > 周计划列表（按周排列）。点击进入：顶部目标概览+完成率进度条，中间任务列表（勾选式），底部复盘区域（用户输入+AI洞察卡片）。'
    )

    # F24
    add_feature_block(doc,
        fid='F24', name='长期记忆系统', priority='P1', status_done=False,
        desc='存储用户的长期职业信息：职业目标、经验总结、学习笔记。AI对话中自动提取重要信息存入记忆，并在后续对话中调用，实现"了解用户"的个性化服务。',
        user_story='作为一名求职者，我希望系统能"记住"我的职业目标和之前的总结，这样每次聊天不用从头说起。',
        preconditions=['用户已登录'],
        main_flow=[
            '进入成长中心 > 长期记忆',
            '手动创建记忆条目：分类（职业目标/经验总结/学习笔记）、标题、内容、标签、重要性',
            'AI对话中自动提取关键信息存入记忆',
            '查看和管理记忆条目（搜索、分类筛选、编辑、删除）',
            'AI在后续对话和分析中自动调用相关记忆作为上下文',
        ],
        alt_flows=['记忆条目可关联到岗位、面试、Offer等实体'],
        exception_handling=[
            '异常E1：自动记忆提取误判 → 用户可删除不准确的记忆条目',
        ],
        output_spec='{id, category, title, content, tags[], importance, relatedEntities: {opportunities?, interviews?, offers?}, createdAt, updatedAt}',
        acceptance=[
            '支持至少3种记忆分类',
            '搜索支持全文模糊匹配',
            'AI对话中能引用相关记忆',
        ],
        ui_desc='成长中心右栏 > 记忆面板。分类Tab切换。列表展示记忆条目（标题+标签+时间）。支持快速搜索和标签筛选。'
    )


# ============================================================
# 第8章 首页与数据驾驶舱
# ============================================================

def add_chapter_8(doc):
    doc.add_heading('第八章 首页与数据驾驶舱', level=1)

    # F25
    add_feature_block(doc,
        fid='F25', name='首页（今日工作台）', priority='P0', status_done=True,
        desc='用户登录后的首页，展示今日求职全景：个性化欢迎信息、三大核心数据卡片（本周新机会/进行中投递/本月面试）、今日待办事项（待完成的任务和行动）、近期面试日程、AI助手建议。',
        user_story='作为一名求职者，每天打开系统我想一眼看到今天该做什么、有什么新进展、即将面临什么面试。',
        preconditions=['用户已登录'],
        main_flow=[
            '用户进入首页',
            '顶部显示欢迎信息（用户名+当前日期）',
            '三大数据卡片：本周新机会(数量+趋势) / 进行中投递(数量+待回复数) / 本月面试(数量+最近面试)',
            '左栏：今日待办列表（待完成的简历修改、面试准备、题目练习）',
            '右栏：近期面试日程（时间+公司+轮次+时长）',
            '底部：AI助手建议卡（3条优化建议+查看详情按钮）',
        ],
        alt_flows=['新用户首页 → 引导式体验：添加第一个岗位'],
        exception_handling=[
            '异常E1：数据加载失败 → 显示缓存数据 + "数据可能不是最新的"提示',
        ],
        output_spec='首页数据聚合API返回：{opportunities: {weekNew, trend}, applications: {active, pending}, interviews: {monthTotal, nextInterview}, todos: [{task, deadline}], upcomingInterviews: [{company, stage, date, duration}], aiSuggestions: [{text, action}]}',
        acceptance=[
            '首页加载<2秒',
            '数据卡片数值准确反映实际状态',
            '待办列表按紧急度排序',
            'AI建议具有针对性',
        ],
        ui_desc='首页全宽布局：顶部欢迎区、三列数据卡片、两栏内容区（左待办+右面试日程）、底部AI建议横幅。响应式Grid布局。'
    )

    # F26
    add_feature_block(doc,
        fid='F26', name='数据驾驶舱（Dashboard）', priority='P1', status_done=True,
        desc='面向运营和管理的数据看板，展示北极星指标（求职闭环率）、6大KPI、闭环漏斗、趋势图表、模块表现、AI质量指标、成本指标、异常告警和自动诊断。',
        user_story='作为产品负责人/运营人员，我需要实时掌握产品的健康状况、用户转化情况和AI服务质量。',
        preconditions=['用户有管理权限', '数据采集系统正常运行'],
        main_flow=[
            '进入数据驾驶舱页面',
            '顶部工具栏：搜索、视图切换（概览/阶段）、时间范围选择（7d/30d/90d）、导出、订阅',
            '6大KPI卡片：北极星指标(28.4%, 目标32%) / 活跃用户(3842) / 7日留存(31.7%) / 高价值用户(1126) / Agent成功率(96.2%) / 单位闭环成本(¥14.8)',
            '闭环漏斗可视化：6层漏斗（首页→岗位解析→定向简历→面试训练→投递记录→Offer阶段）',
            '北极星趋势图：折线图展示过去N天的北极星指标变化',
            '模块表现：各模块使用率和变化趋势的柱状图',
            'AI质量面板：Agent成功率、字段完整率、用户采纳率、重跑率、投诉率',
            '成本面板：单次任务成本、月均用户成本、闭环成本、高价值行为成本、API错误率',
            '异常告警列表：severity(critical/warning/info) + 告警内容 + 建议',
            '自动诊断：AI分析数据异常的根因和建议',
        ],
        alt_flows=[
            '用户分群视图：定向/迷茫/长期三类用户的分别指标',
            '阶段视图：按用户求职阶段展示指标',
        ],
        exception_handling=[
            '异常E1：数据加载超时 → 逐块加载，先显示KPI再加载图表',
            '异常E2：某项指标数据缺失 → 显示"暂无数据"占位',
        ],
        output_spec='参见后台监控API（第12章附录）：/api/analytics/kpi, /api/analytics/funnel, /api/analytics/trends, /api/analytics/modules, /api/analytics/ai-quality, /api/analytics/costs, /api/analytics/alerts, /api/analytics/diagnosis',
        acceptance=[
            '驾驶舱首屏加载<3秒',
            'KPI数值实时更新（≤5分钟延迟）',
            '图表交互流畅（悬浮提示、缩放、筛选）',
            '异常告警按severity排序',
        ],
        ui_desc='全宽驾驶舱布局。顶部工具栏+KPI卡片行（6列），中间漏斗+趋势图（2列），下方模块表现+AI质量+成本（3列），底部告警和诊断区域。使用Recharts渲染图表。'
    )

    # F27
    add_feature_block(doc,
        fid='F27', name='全局悬浮AI助手', priority='P0', status_done=True,
        desc='全局悬浮在页面右下角的AI聊天助手。可在任何页面快速唤起，支持自然语言对话，能理解当前页面上下文。可执行快捷操作：解析JD、生成简历、开始面试准备等。与成长伴侣共享对话历史。',
        user_story='作为一名用户，我希望在任何页面都能快速和AI对话，不需要切换到特定模块。比如在机会页面直接问"帮我分析这个岗位"。',
        preconditions=['用户已登录'],
        main_flow=[
            '页面右下角显示悬浮AI按钮（圆形，带AI图标）',
            '点击展开聊天面板（400x500px悬浮窗口）',
            '用户输入消息',
            '系统调用全局Chat Agent，结合当前页面上下文',
            'AI回复（流式输出），可包含操作建议链接',
            '支持拖拽移动、最小化、关闭',
            '对话历史持久化',
        ],
        alt_flows=[
            '快捷命令：输入"/"弹出命令面板（/parse解析JD、/resume生成简历、/interview面试准备）',
            '自动建议：根据当前页面自动显示相关操作建议',
        ],
        exception_handling=[
            '异常E1：AI响应超时 → 显示"思考中..."动画，10秒后提示重试',
            '异常E2：网络断开 → 消息队列本地缓存，恢复后自动发送',
        ],
        output_spec='{conversationId, reply, suggestions: [{type, text, link?}]}',
        acceptance=[
            '悬浮按钮在所有页面可见',
            '展开到可交互<500ms',
            '首次响应<3秒（流式输出）',
            '支持Markdown格式渲染',
        ],
        ui_desc='右下角固定悬浮按钮（56px圆形）。展开为对话面板：顶部标题栏（AI助手+最小化/关闭按钮），中间消息区域，底部输入框+发送按钮。毛玻璃背景效果。',
        prompt_example='''全局Chat Agent配置:
- 模型: qwen-plus
- 联网搜索: 启用
- 上下文管理: 注入当前页面路径和页面关键数据
- Temperature: 0.7

System Prompt核心:
你是FindJob AI求职助手。你可以帮助用户：
1. 分析岗位JD
2. 优化简历
3. 准备面试
4. 对比Offer
5. 职业规划建议
请结合用户当前所在页面的上下文给出针对性回答。'''
    )


# ============================================================
# 第9章 AI Agent设计
# ============================================================

def add_chapter_9(doc):
    doc.add_heading('第九章 AI Agent 设计', level=1)

    # 9.1
    doc.add_heading('9.1 Agent 总览矩阵', level=2)
    p(doc, 'FindJob V2.0 共设计15+个专业AI Agent，每个Agent有独立的职责、输入/输出规范和模型配置。以下为完整Agent矩阵：')

    add_table(doc,
        ['Agent名称', '所属模块', '职责', '模型', '优先级', '状态'],
        [
            ['JD预处理Agent', '机会工作台', '文本清洗/图片OCR识别', 'qwen-turbo / qwen-vl-max', 'P0', '已实现'],
            ['JD结构化Agent', '机会工作台', '提取JD结构化字段', 'qwen-plus (jsonMode)', 'P0', '已实现'],
            ['A维度分析Agent', '机会工作台', '技术栈/产品类型/业务领域/团队阶段', 'qwen-max (jsonMode)', 'P0', '已实现'],
            ['B维度分析Agent', '机会工作台', '行业/技术/经验/能力隐性需求', 'qwen-max (jsonMode)', 'P0', '已实现'],
            ['公司分析Agent', '机会工作台', '公司背景/AI场景/竞品/面试洞察', 'qwen-max (联网搜索)', 'P0', '已实现'],
            ['简历解析Agent', '资产中心', '从PDF/图片提取简历结构化数据', 'qwen-plus / qwen-vl-max', 'P0', '已实现'],
            ['匹配评估Agent', '机会工作台', '多维度匹配评估(5维雷达)', 'qwen-max (jsonMode)', 'P0', '已实现'],
            ['简历优化Agent', '资产中心', '关键词注入+差距弥补+亮点强化', 'qwen-max (jsonMode)', 'P0', '已实现'],
            ['简历版本Agent', '资产中心', '生成定向简历版本', 'qwen-max', 'P0', '已实现'],
            ['面试准备Agent', '面试工作台', '个性化面试准备材料', 'qwen-plus (jsonMode)', 'P0', '已实现'],
            ['面试教练Agent', '面试工作台', '面试回答点评+评分', 'qwen-plus', 'P0', '已实现'],
            ['市场调研Agent', '机会工作台', '行业和岗位市场分析', 'qwen-max (联网搜索)', 'P1', '已实现'],
            ['全局Chat Agent', '全局', '自然语言对话+操作引导', 'qwen-plus (联网搜索)', 'P0', '已实现'],
            ['路由Agent', 'DAG引擎', '分析用户意图，路由到对应Agent', 'qwen-turbo', 'P0', '已实现'],
            ['Offer分析Agent', '决策中心', 'Offer对比分析+AI建议', 'qwen-max', 'P1', '规划中'],
            ['成长伴侣Agent', '成长中心', '长期对话+职业咨询', 'qwen-plus (联网搜索)', 'P0', '规划中'],
            ['周复盘Agent', '成长中心', '周复盘AI洞察', 'qwen-plus', 'P1', '规划中'],
        ],
        col_widths=[3.5, 2.5, 4, 3, 1.5, 2]
    )

    # 9.2
    doc.add_heading('9.2 Agent 详细设计', level=2)

    doc.add_heading('9.2.1 JD解析Agent链路', level=3)
    p(doc, 'JD解析是FindJob的核心链路，由4个Agent按DAG依赖顺序执行：')

    p(doc, 'Agent 1: JD预处理Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'jd-preprocess'],
            ['职责', '文本清洗（去噪/修正/统一格式）或图片OCR（视觉模型识别文字）'],
            ['输入', '原始JD文本 或 图片二进制数据'],
            ['输出', '清洗后的纯文本，保留结构层次'],
            ['模型', '文本: qwen-turbo (temp=0.3, maxTokens=2048) | 图片: qwen-vl-max (jsonMode=true)'],
            ['依赖', '无（DAG层级0，可与简历解析并行）'],
            ['耗时', '文本<2s, 图片<5s'],
            ['重试策略', '失败后自动重试，最多3次'],
        ],
        col_widths=[3, 13.5]
    )

    p(doc, 'Agent 2: JD结构化Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'jd-structure'],
            ['职责', '将清洗后的文本提取为标准JSON结构'],
            ['输入', '清洗后的JD文本'],
            ['输出', '{title, company, location, salary, responsibilities[], requirements[], preferred[], others}'],
            ['模型', 'qwen-plus (jsonMode=true)'],
            ['依赖', 'jd-preprocess (DAG层级1)'],
            ['耗时', '<3s'],
        ],
        col_widths=[3, 13.5]
    )

    p(doc, 'Agent 3: A维度分析Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'jd-analysis-a'],
            ['职责', '分析岗位定位：A1技术栈 + A2产品类型 + A3业务领域 + A4团队阶段'],
            ['输入', '结构化JD + 原始文本(前2000字)'],
            ['输出', '{A1_tech_stack, A2_product_type, A3_business_domain, A4_team_stage}'],
            ['模型', 'qwen-max (jsonMode=true)'],
            ['依赖', 'jd-structure (DAG层级2，与B分析并行)'],
            ['耗时', '<5s'],
        ],
        col_widths=[3, 13.5]
    )

    p(doc, 'Agent 4: B维度分析Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'jd-analysis-b'],
            ['职责', '挖掘隐性需求：B1行业 + B2技术(学历+技术深度) + B3产品经验 + B4核心能力'],
            ['输入', '结构化JD + 原始文本'],
            ['输出', '{B1_industry_requirement, B2_tech_requirement, B3_product_experience, B4_capability_requirement}'],
            ['模型', 'qwen-max (jsonMode=true)'],
            ['依赖', 'jd-structure (DAG层级2，与A分析并行)'],
            ['耗时', '<5s'],
        ],
        col_widths=[3, 13.5]
    )

    doc.add_heading('9.2.2 简历处理Agent链路', level=3)
    p(doc, '简历处理包含解析、匹配和优化三个关键Agent：')

    p(doc, '简历解析Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'resume-parse'],
            ['职责', '从PDF/DOCX/图片中提取简历结构化数据'],
            ['输入', '简历文件（文本/图片）'],
            ['输出', '{basic_info, education[], work_experience[], projects[], skills[], ability_tags}'],
            ['模型', '文本: qwen-plus | 图片: qwen-vl-max'],
            ['备用', '外部PDF解析服务(PYTHON_SERVICE_URL): https://pdf-parser-service-y24s.onrender.com'],
            ['耗时', '<5s'],
        ],
        col_widths=[3, 13.5]
    )

    p(doc, '匹配评估Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'match-evaluate'],
            ['职责', '基于简历+JD分析进行5维匹配评估'],
            ['输入', '简历结构化数据 + JD结构化数据 + A/B维度分析结果'],
            ['输出', '{match_level, match_score, dimension_match(5维), strengths[], gaps[], interview_focus_suggestion}'],
            ['模型', 'qwen-max (jsonMode=true, maxTokens=8192)'],
            ['依赖', 'resume-parse + jd-analysis-a + jd-analysis-b (DAG层级3)'],
            ['耗时', '<10s'],
        ],
        col_widths=[3, 13.5]
    )

    p(doc, '简历优化Agent', bold=True)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'resume-optimize'],
            ['职责', '关键词注入 + 差距弥补 + 亮点强化'],
            ['输入', '基础简历 + JD分析 + A/B维度 + 匹配结果 + 用户建议(可选)'],
            ['输出', '{optimization_summary, sections(各段original/optimized/changes), optimization_effect}'],
            ['模型', 'qwen-max (jsonMode=true)'],
            ['依赖', 'match-evaluate (DAG层级4)'],
            ['耗时', '<15s'],
        ],
        col_widths=[3, 13.5]
    )

    doc.add_heading('9.2.3 面试辅导Agent', level=3)
    add_table(doc,
        ['属性', '内容'],
        [
            ['Agent ID', 'interview-coach'],
            ['职责', '面试回答点评 + 评分 + 优化建议 + 题目推荐'],
            ['输入', '面试问题 + 用户回答 + 模式(jd_based/通用) + 岗位上下文(可选)'],
            ['输出', '{feedback: {must_fix[], suggestions[], polish[], overall_score, highlights[], improvement_direction}, improved_answer?}'],
            ['模型', 'qwen-plus'],
            ['耗时', '单题<5s, 批量点评支持并行'],
            ['特殊能力', '支持批量点评(batchCoaching) + 题目推荐(suggestQuestions)'],
        ],
        col_widths=[3, 13.5]
    )

    # 9.3
    doc.add_heading('9.3 DAG引擎架构', level=2)
    p(doc, 'FindJob的DAG执行引擎是核心调度系统，管理多Agent间的依赖关系和并行执行：')

    doc.add_heading('9.3.1 核心类设计', level=3)
    p(doc, 'BaseAgent 抽象基类：', bold=True)
    bullet(doc, 'config: AgentConfig（name, description, model?, jsonMode?）')
    bullet(doc, 'status: AgentStatus（pending/running/completed/failed）')
    bullet(doc, 'metrics: AgentResultWithMetrics（agent_name, model, input/output chars, token estimates, duration_ms, cost_usd_est, success, error?, timestamp）')
    bullet(doc, '方法：execute() → AgentResult, getMetrics() → AgentResultWithMetrics')

    doc.add_paragraph()
    p(doc, 'DAGExecutor 调度器：', bold=True)
    bullet(doc, '解析Agent依赖图，确定执行层级')
    bullet(doc, '同层级Agent并行执行（Promise.all）')
    bullet(doc, '单Agent失败自动重试（最多3次，指数退避）')
    bullet(doc, '实时状态通知（DAGState包含每个节点的status和result）')
    bullet(doc, '成本追踪（累计Token消耗和预估费用）')
    bullet(doc, '实验管理（A/B测试Prompt版本）')

    # 9.4
    doc.add_heading('9.4 模型选型策略', level=2)
    add_table(doc,
        ['模型', '提供商', '适用场景', '成本/1K tokens', '特点'],
        [
            ['qwen-max', 'dashscope', '复杂分析（A/B维度、匹配评估、简历优化）', '¥0.02', '质量最高，推理能力强'],
            ['qwen-plus', 'dashscope', '中等复杂度（JD结构化、面试辅导、对话）', '¥0.008', '性价比最优，日常首选'],
            ['qwen-turbo', 'dashscope', '简单任务（预处理、路由、分类）', '¥0.003', '速度最快，成本最低'],
            ['qwen-vl-max', 'dashscope', '视觉任务（图片OCR、截图识别）', '¥0.03', '多模态视觉模型'],
            ['GPT-4.1系列', 'vectorengine', '备用/高质量需求', '¥0.06', '灾备通道，dashscope故障时启用'],
        ],
        col_widths=[3, 2.5, 4.5, 2.5, 4]
    )

    p(doc, '模型选型原则：', bold=True)
    bullet(doc, '成本分层：简单任务用turbo，中等用plus，复杂用max，控制整体成本')
    bullet(doc, '质量优先：涉及用户核心体验的Agent（匹配评估、简历优化）使用最高质量模型')
    bullet(doc, '灾备切换：主通道（dashscope）故障时自动切换到备用通道（vectorengine）')
    bullet(doc, '实验驱动：通过A/B测试持续优化模型选择和Prompt')


# ============================================================
# Part 2 集成
# ============================================================

def add_part2(doc):
    """添加Part 2所有章节"""
    print("  第5章 面试工作台...")
    add_chapter_5(doc)
    print("  第6章 决策中心...")
    add_chapter_6(doc)
    print("  第7章 成长中心...")
    add_chapter_7(doc)
    print("  第8章 首页与数据驾驶舱...")
    add_chapter_8(doc)
    print("  第9章 AI Agent设计...")
    add_chapter_9(doc)


if __name__ == '__main__':
    # 测试单独运行Part 2
    from generate_prd_v2 import main as create_part1
    doc = create_part1()
    add_part2(doc)
    output_path = '/home/user/webapp/webapp/prd_output/FindJob_PRD_V2.0_part2.docx'
    doc.save(output_path)
    print(f"  Part 1+2 保存成功: {output_path}")
