/**
 * 用户 Dashboard 聚合 API 路由
 *
 * Phase A7: 提供用户看板页所需的 7 个聚合数据端点
 */

import { Hono } from 'hono';
import {
  jobStorage,
  applicationStorage,
  matchStorage,
  resumeStorage,
  interviewStorage,
  questionStorage,
  answerStorage,
  userActivityStorage,
  weeklyGoalStorage,
} from '../core/storage';
import type {
  DashboardSummaryData,
  DashboardFunnelStage,
  DashboardActivityWeek,
  DashboardSkillDimension,
  DashboardInsight,
  UserActivity,
  WeeklyGoal,
} from '../types';

export const dashboardRoutes = new Hono();

// ==================== 1. KPI 概览 ====================
/**
 * GET /api/user/dashboard/summary
 * 返回四张 KPI 卡片数据 + 周环比变化
 */
dashboardRoutes.get('/summary', async (c) => {
  try {
    const jobs = jobStorage.getAll();
    const apps = applicationStorage.getAll();
    const stats = applicationStorage.getStats();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 本周新增岗位
    const thisWeekJobs = jobs.filter(j => new Date(j.created_at) >= weekAgo);
    const lastWeekJobs = jobs.filter(j => {
      const t = new Date(j.created_at);
      return t >= twoWeeksAgo && t < weekAgo;
    });

    // 本周新增投递
    const thisWeekApps = apps.filter(a => new Date(a.applied_at) >= weekAgo);
    const lastWeekApps = apps.filter(a => {
      const t = new Date(a.applied_at);
      return t >= twoWeeksAgo && t < weekAgo;
    });

    // 面试中的数量
    const interviewingApps = apps.filter(a => a.status === 'interview');
    const thisWeekInterviews = interviewingApps.filter(a => {
      const lastChange = a.status_history?.[a.status_history.length - 1];
      return lastChange && new Date(lastChange.changed_at) >= weekAgo;
    });

    // Offer 数量
    const offerApps = apps.filter(a => a.status === 'offer');

    const summary: DashboardSummaryData = {
      trackedJobs: jobs.length,
      appliedJobs: stats.total,
      interviewCount: interviewingApps.length,
      offerCount: offerApps.length,
      weeklyChange: {
        tracked: thisWeekJobs.length - lastWeekJobs.length,
        applied: thisWeekApps.length - lastWeekApps.length,
        interview: thisWeekInterviews.length,
      },
    };

    return c.json({ success: true, data: summary });
  } catch (error) {
    console.error('[Dashboard] Summary error:', error);
    return c.json({ success: false, error: '获取概览数据失败' }, 500);
  }
});

// ==================== 2. 求职漏斗 ====================
/**
 * GET /api/user/dashboard/funnel
 * 返回 5 阶段求职漏斗
 */
dashboardRoutes.get('/funnel', async (c) => {
  try {
    const jobs = jobStorage.getAll();
    const apps = applicationStorage.getAll();
    const stats = applicationStorage.getStats();

    const trackedCount = jobs.length;
    const appliedCount = stats.total;
    const interviewCount = stats.byStatus.interview + stats.byStatus.offer;
    // 面试通过 = 进入 offer 阶段
    const passedCount = stats.byStatus.offer;
    const offerCount = stats.byStatus.offer;

    const stages: DashboardFunnelStage[] = [
      {
        stage: '收藏/追踪',
        count: trackedCount,
        rate: 100,
      },
      {
        stage: '已投递',
        count: appliedCount,
        rate: trackedCount > 0 ? Math.round((appliedCount / trackedCount) * 1000) / 10 : 0,
      },
      {
        stage: '获得面试',
        count: interviewCount,
        rate: trackedCount > 0 ? Math.round((interviewCount / trackedCount) * 1000) / 10 : 0,
      },
      {
        stage: '面试通过',
        count: passedCount,
        rate: trackedCount > 0 ? Math.round((passedCount / trackedCount) * 1000) / 10 : 0,
      },
      {
        stage: '获得 Offer',
        count: offerCount,
        rate: trackedCount > 0 ? Math.round((offerCount / trackedCount) * 1000) / 10 : 0,
      },
    ];

    return c.json({ success: true, data: { stages } });
  } catch (error) {
    console.error('[Dashboard] Funnel error:', error);
    return c.json({ success: false, error: '获取漏斗数据失败' }, 500);
  }
});

// ==================== 3. 求职活跃趋势 ====================
/**
 * GET /api/user/dashboard/activity-trend
 * 返回近 4 周操作量趋势
 */
dashboardRoutes.get('/activity-trend', async (c) => {
  try {
    const weeksParam = parseInt(c.req.query('weeks') || '4');
    const weeks = Math.min(Math.max(weeksParam, 1), 12);

    // 优先从 userActivityStorage 读取
    let weekData = userActivityStorage.aggregateByWeek(weeks);

    // 如果 userActivityStorage 没有数据，从各 storage 的 created_at 推导
    const hasData = weekData.some(w => w.parseJobs > 0 || w.applyResumes > 0 || w.interviewPrep > 0);

    if (!hasData) {
      weekData = inferActivityTrend(weeks);
    }

    const result: DashboardActivityWeek[] = weekData.map(w => ({
      week: w.weekLabel,
      parseJobs: w.parseJobs,
      applyResumes: w.applyResumes,
      interviewPrep: w.interviewPrep,
    }));

    return c.json({ success: true, data: { weeks: result } });
  } catch (error) {
    console.error('[Dashboard] Activity trend error:', error);
    return c.json({ success: false, error: '获取活跃趋势失败' }, 500);
  }
});

/**
 * 从各 storage 的 created_at 推导活跃趋势（兜底方案）
 */
function inferActivityTrend(weeksCount: number) {
  const jobs = jobStorage.getAll();
  const apps = applicationStorage.getAll();
  const interviews = interviewStorage.getAll();

  const nowDate = new Date();
  const result = [];

  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekEnd = new Date(nowDate);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const inRange = (dateStr: string) => {
      const t = new Date(dateStr).getTime();
      return t >= weekStart.getTime() && t <= weekEnd.getTime();
    };

    result.push({
      weekLabel: `第${weeksCount - i}周`,
      weekStart,
      parseJobs: jobs.filter(j => inRange(j.created_at)).length,
      applyResumes: apps.filter(a => inRange(a.applied_at)).length,
      interviewPrep: interviews.filter(p => inRange(p.created_at)).length,
    });
  }

  return result;
}

// ==================== 4. 能力雷达图 ====================
/**
 * GET /api/user/dashboard/skill-radar
 * 返回 6 维度平均能力画像
 */
dashboardRoutes.get('/skill-radar', async (c) => {
  try {
    const matches = matchStorage.getAll();

    // 默认维度
    const defaultDimensions: DashboardSkillDimension[] = [
      { dimension: '技术匹配', score: 0, fullMark: 100 },
      { dimension: '经验匹配', score: 0, fullMark: 100 },
      { dimension: '学历匹配', score: 0, fullMark: 100 },
      { dimension: '行业匹配', score: 0, fullMark: 100 },
      { dimension: '软实力', score: 0, fullMark: 100 },
      { dimension: '薪资匹配', score: 0, fullMark: 100 },
    ];

    if (matches.length === 0) {
      return c.json({
        success: true,
        data: {
          dimensions: defaultDimensions,
          overallScore: 0,
          matchCount: 0,
        },
      });
    }

    // 从 dimension_match 中提取各维度分数
    const dimensionScores: Record<string, number[]> = {
      '技术匹配': [],
      '经验匹配': [],
      '学历匹配': [],
      '行业匹配': [],
      '软实力': [],
      '薪资匹配': [],
    };

    for (const match of matches) {
      const dm = (match as any).dimension_match;
      if (!dm) continue;

      // 从 match 结构中提取：根据状态符号计算分数
      const statusToScore = (status?: string): number => {
        if (!status) return 50;
        if (status === '✅') return 90;
        if (status === '⚠️') return 60;
        if (status === '❌') return 30;
        return 50;
      };

      if (dm.B2_tech) dimensionScores['技术匹配'].push(statusToScore(dm.B2_tech.status));
      if (dm.B3_product) dimensionScores['经验匹配'].push(statusToScore(dm.B3_product.status));
      if (dm.B1_industry) dimensionScores['行业匹配'].push(statusToScore(dm.B1_industry.status));
      if (dm.B4_capability) dimensionScores['软实力'].push(statusToScore(dm.B4_capability.status));
      if (dm.A3_business_domain) dimensionScores['学历匹配'].push(statusToScore(dm.A3_business_domain.status));

      // 用 match_score 作为薪资匹配的代理
      if ((match as any).match_score) {
        dimensionScores['薪资匹配'].push((match as any).match_score);
      }
    }

    const dimensions: DashboardSkillDimension[] = defaultDimensions.map(d => {
      const scores = dimensionScores[d.dimension];
      const avg = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      return { ...d, score: avg };
    });

    const allScores = dimensions.map(d => d.score).filter(s => s > 0);
    const overallScore = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

    return c.json({
      success: true,
      data: {
        dimensions,
        overallScore,
        matchCount: matches.length,
      },
    });
  } catch (error) {
    console.error('[Dashboard] Skill radar error:', error);
    return c.json({ success: false, error: '获取能力雷达失败' }, 500);
  }
});

// ==================== 5. 近期动态时间线 ====================
/**
 * GET /api/user/dashboard/activities
 * 返回最近 20 条用户操作记录
 */
dashboardRoutes.get('/activities', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    let activities = userActivityStorage.getRecent(limit);

    // 如果没有活动记录，从各 storage 推导历史
    if (activities.length === 0) {
      activities = inferRecentActivities(limit);
    }

    const result = activities.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      time: formatRelativeTime(a.created_at),
      created_at: a.created_at,
    }));

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error('[Dashboard] Activities error:', error);
    return c.json({ success: false, error: '获取近期动态失败' }, 500);
  }
});

/**
 * 从各 storage 推导近期活动（兜底方案）
 */
function inferRecentActivities(limit: number): UserActivity[] {
  const activities: UserActivity[] = [];

  // 从岗位解析记录
  for (const job of jobStorage.getRecent(10)) {
    activities.push({
      id: `infer-job-${job.id}`,
      type: 'parse',
      title: `解析了${job.company ? job.company + '「' + job.title + '」' : '「' + job.title + '」'} JD`,
      relatedEntityId: job.id,
      relatedEntityType: 'job',
      created_at: job.created_at,
    });
  }

  // 从投递记录
  for (const app of applicationStorage.getAll().slice(0, 10)) {
    activities.push({
      id: `infer-app-${app.id}`,
      type: 'apply',
      title: `投递了${app.company}「${app.position}」`,
      relatedEntityId: app.id,
      relatedEntityType: 'application',
      created_at: app.applied_at,
    });
  }

  // 从面试准备记录
  for (const prep of interviewStorage.getAll().slice(0, 5)) {
    const job = jobStorage.getById(prep.job_id);
    activities.push({
      id: `infer-interview-${prep.id}`,
      type: 'interview',
      title: `完成了${job ? job.company + '的' : ''}面试准备`,
      relatedEntityId: prep.id,
      relatedEntityType: 'interview',
      created_at: prep.created_at,
    });
  }

  // 从简历记录
  for (const resume of resumeStorage.getAll().slice(0, 5)) {
    activities.push({
      id: `infer-resume-${resume.id}`,
      type: 'resume',
      title: resume.is_master ? `上传了简历「${resume.name}」` : `生成了定向简历「${resume.name}」`,
      relatedEntityId: resume.id,
      relatedEntityType: 'resume',
      created_at: resume.created_at,
    });
  }

  // 按时间排序，取最近的
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const t = new Date(isoString).getTime();
  const diff = now - t;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${Math.floor(days / 30)} 个月前`;
}

// ==================== 6. AI 洞察建议 ====================
/**
 * GET /api/user/dashboard/insights
 * 基于规则引擎扫描用户数据，生成 AI 洞察建议
 */
dashboardRoutes.get('/insights', async (c) => {
  try {
    const insights: DashboardInsight[] = [];
    let insightId = 1;

    const jobs = jobStorage.getAll();
    const apps = applicationStorage.getAll();
    const matches = matchStorage.getAll();
    const resumes = resumeStorage.getAll();
    const questions = questionStorage.getAll();

    const now = new Date();

    // 规则 1: 高匹配未投递岗位
    const appliedJobIds = new Set(apps.map(a => a.job_id).filter(Boolean));
    const highMatchUnApplied = matches.filter(m => {
      const score = (m as any).match_score;
      return score >= 80 && !appliedJobIds.has(m.job_id);
    });

    if (highMatchUnApplied.length > 0) {
      insights.push({
        id: String(insightId++),
        type: 'opportunity',
        title: `匹配度 80+ 的新岗位`,
        description: `发现 ${highMatchUnApplied.length} 个高匹配度岗位尚未投递，建议优先处理`,
        action: '查看岗位',
        actionPath: '/opportunities',
        priority: 'high',
      });
    }

    // 规则 2: 简历待优化
    const masterResume = resumes.find(r => r.is_master);
    if (masterResume) {
      const daysSinceUpdate = (now.getTime() - new Date(masterResume.updated_at).getTime()) / 86400000;
      if (daysSinceUpdate > 7) {
        insights.push({
          id: String(insightId++),
          type: 'improvement',
          title: '简历优化建议',
          description: `主简历已 ${Math.floor(daysSinceUpdate)} 天未更新，建议根据最新面试反馈进行优化`,
          action: '优化简历',
          actionPath: '/assets',
          priority: 'medium',
        });
      }
    } else if (resumes.length === 0) {
      insights.push({
        id: String(insightId++),
        type: 'improvement',
        title: '上传简历',
        description: '还没有上传简历，上传后可以使用智能匹配和定向简历生成功能',
        action: '上传简历',
        actionPath: '/assets',
        priority: 'high',
      });
    }

    // 规则 3: 面试准备提醒
    const upcomingInterviews = apps.filter(a => {
      if (a.status !== 'interview') return false;
      return a.interviews?.some(i => {
        if (!i.scheduled_at) return false;
        const scheduledTime = new Date(i.scheduled_at).getTime();
        return scheduledTime > now.getTime() && scheduledTime - now.getTime() < 48 * 3600000;
      });
    });

    if (upcomingInterviews.length > 0) {
      const nextInterview = upcomingInterviews[0];
      insights.push({
        id: String(insightId++),
        type: 'preparation',
        title: '面试准备提醒',
        description: `${nextInterview.company} 的面试即将到来，建议做好充分准备`,
        action: '开始准备',
        actionPath: '/interviews',
        priority: 'high',
      });
    }

    // 规则 4: 投递后无进展提醒
    const staleApps = apps.filter(a => {
      if (a.status !== 'applied') return false;
      const daysSinceApply = (now.getTime() - new Date(a.applied_at).getTime()) / 86400000;
      return daysSinceApply > 5;
    });

    if (staleApps.length > 0) {
      insights.push({
        id: String(insightId++),
        type: 'warning',
        title: '投递跟进提醒',
        description: `${staleApps.length} 个投递超过 5 天无进展，建议主动跟进或考虑其他机会`,
        action: '查看投递',
        actionPath: '/decisions',
        priority: 'medium',
      });
    }

    // 规则 5: 刷题建议
    const answeredQuestions = questions.filter(q => q.answer_count > 0);
    const totalQuestions = questions.length;
    if (totalQuestions > 0 && answeredQuestions.length / totalQuestions < 0.5) {
      insights.push({
        id: String(insightId++),
        type: 'preparation',
        title: '面试题练习',
        description: `题库中 ${totalQuestions - answeredQuestions.length} 道题目尚未练习，坚持练习可以提升面试表现`,
        action: '开始练习',
        actionPath: '/interviews',
        priority: 'low',
      });
    }

    // 规则 6: 新岗位未评估
    const matchedJobIds = new Set(matches.map(m => m.job_id));
    const unMatchedJobs = jobs.filter(j => j.status === 'completed' && !matchedJobIds.has(j.id));
    if (unMatchedJobs.length > 0) {
      insights.push({
        id: String(insightId++),
        type: 'opportunity',
        title: '岗位匹配评估',
        description: `${unMatchedJobs.length} 个已解析岗位尚未进行匹配评估，快来看看适不适合你`,
        action: '去评估',
        actionPath: '/opportunities',
        priority: 'medium',
      });
    }

    // 按优先级排序
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // 最多返回 5 条
    return c.json({ success: true, data: insights.slice(0, 5) });
  } catch (error) {
    console.error('[Dashboard] Insights error:', error);
    return c.json({ success: false, error: '获取 AI 洞察失败' }, 500);
  }
});

// ==================== 7. 本周目标 ====================
/**
 * GET /api/user/dashboard/weekly-goals
 * 返回本周目标列表（不存在则自动创建默认目标）
 */
dashboardRoutes.get('/weekly-goals', async (c) => {
  try {
    const goals = weeklyGoalStorage.ensureCurrentWeek();

    // 自动从实际数据更新进度
    updateGoalProgress(goals);

    return c.json({ success: true, data: goals });
  } catch (error) {
    console.error('[Dashboard] Weekly goals error:', error);
    return c.json({ success: false, error: '获取周目标失败' }, 500);
  }
});

/**
 * PUT /api/user/dashboard/weekly-goals/:id
 * 更新周目标进度
 */
dashboardRoutes.put('/weekly-goals/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    // 只允许更新部分字段
    const allowed: Partial<WeeklyGoal> = {};
    if (typeof updates.current === 'number') allowed.current = updates.current;
    if (typeof updates.target === 'number') allowed.target = updates.target;
    if (typeof updates.text === 'string') allowed.text = updates.text;
    if (typeof updates.completed === 'boolean') allowed.completed = updates.completed;

    const goal = weeklyGoalStorage.update(id, allowed);
    if (!goal) {
      return c.json({ success: false, error: '未找到目标' }, 404);
    }

    return c.json({ success: true, data: goal });
  } catch (error) {
    console.error('[Dashboard] Update goal error:', error);
    return c.json({ success: false, error: '更新目标失败' }, 500);
  }
});

/**
 * 根据实际数据自动更新目标进度
 */
function updateGoalProgress(goals: WeeklyGoal[]): void {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const goal of goals) {
    if (!goal.autoGenerated) continue;

    let current = 0;

    if (goal.text.includes('解析') && goal.text.includes('岗位')) {
      current = jobStorage.getAll().filter(j => new Date(j.created_at) >= weekAgo).length;
    } else if (goal.text.includes('投递') && goal.text.includes('简历')) {
      current = applicationStorage.getAll().filter(a => new Date(a.applied_at) >= weekAgo).length;
    } else if (goal.text.includes('面试准备')) {
      current = interviewStorage.getAll().filter(p => new Date(p.created_at) >= weekAgo).length;
    } else if (goal.text.includes('面试题')) {
      current = answerStorage.getAll().filter(a => new Date(a.created_at) >= weekAgo).length;
    }

    if (current !== goal.current) {
      weeklyGoalStorage.update(goal.id, { current });
      goal.current = current;
      goal.completed = current >= goal.target;
    }
  }
}

export default dashboardRoutes;
