/**
 * 待办事项 API 路由（混合方案 C）
 *
 * Phase A7: 自动推导 + 手动创建的混合待办系统
 */

import { Hono } from 'hono';
import {
  todoStorage,
  applicationStorage,
  jobStorage,
  resumeStorage,
  matchStorage,
  interviewStorage,
  weeklyGoalStorage,
  generateId,
  now as nowFn,
} from '../core/storage';
import type { TodoItem, TodoPriority } from '../types';

export const todoRoutes = new Hono();

// ==================== 自动推导引擎 ====================

/**
 * 自动推导待办项
 * 扫描已有数据，按规则生成待办，去重后与手动项合并
 */
function generateAutoTodos(): TodoItem[] {
  const autoTodos: TodoItem[] = [];
  const now = new Date();

  // ---- 规则 1: 面试准备 ----
  // 触发：application.interviews[].scheduled_at 在未来 48h 内
  const apps = applicationStorage.getAll();
  for (const app of apps) {
    if (app.status !== 'interview' && app.status !== 'applied') continue;
    if (!app.interviews) continue;

    for (const interview of app.interviews) {
      if (!interview.scheduled_at) continue;
      const scheduledTime = new Date(interview.scheduled_at).getTime();
      const hoursUntil = (scheduledTime - now.getTime()) / 3600000;

      if (hoursUntil > 0 && hoursUntil <= 48) {
        const ruleName = `interview-prep-${app.id}-${interview.id}`;
        // 检查是否已存在（去重）
        const existing = todoStorage.findByRule(ruleName);
        if (!existing) {
          autoTodos.push({
            id: generateId(),
            text: `准备 ${app.company} 第${interview.round}轮${typeLabel(interview.type)}面试`,
            source: 'auto',
            priority: hoursUntil <= 12 ? 'high' : 'medium',
            completed: false,
            dismissed: false,
            dueTime: interview.scheduled_at,
            relatedType: 'application',
            relatedId: app.id,
            ruleName,
            created_at: nowFn(),
            updated_at: nowFn(),
          });
        }
      }
    }
  }

  // ---- 规则 2: 简历优化 ----
  // 触发：resume.updated_at 超过 7 天 且有 match.score < 70
  const resumes = resumeStorage.getAll();
  const matches = matchStorage.getAll();

  for (const resume of resumes) {
    if (!resume.is_master) continue;
    const daysSinceUpdate = (now.getTime() - new Date(resume.updated_at).getTime()) / 86400000;
    if (daysSinceUpdate <= 7) continue;

    // 检查是否有低匹配度的岗位
    const lowMatchJobs = matches.filter(m => {
      const score = (m as any).match_score;
      return score && score < 70;
    });

    if (lowMatchJobs.length > 0) {
      const ruleName = `resume-optimize-${resume.id}`;
      const existing = todoStorage.findByRule(ruleName);
      if (!existing) {
        const job = jobStorage.getById(lowMatchJobs[0].job_id);
        autoTodos.push({
          id: generateId(),
          text: `优化简历以提升${job ? ' ' + job.company : ''}匹配度`,
          source: 'auto',
          priority: 'medium',
          completed: false,
          dismissed: false,
          relatedType: 'resume',
          relatedId: resume.id,
          ruleName,
          created_at: nowFn(),
          updated_at: nowFn(),
        });
      }
    }
  }

  // ---- 规则 3: 投递跟进 ----
  // 触发：application.status === 'applied' 且 applied_at 超过 5 天无状态变更
  for (const app of apps) {
    if (app.status !== 'applied') continue;
    const daysSinceApply = (now.getTime() - new Date(app.applied_at).getTime()) / 86400000;
    if (daysSinceApply <= 5) continue;

    const ruleName = `follow-up-${app.id}`;
    const existing = todoStorage.findByRule(ruleName);
    if (!existing) {
      autoTodos.push({
        id: generateId(),
        text: `跟进 ${app.company}「${app.position}」投递进展`,
        source: 'auto',
        priority: daysSinceApply > 10 ? 'high' : 'medium',
        completed: false,
        dismissed: false,
        relatedType: 'application',
        relatedId: app.id,
        ruleName,
        created_at: nowFn(),
        updated_at: nowFn(),
      });
    }
  }

  // ---- 规则 4: 周目标冲刺 ----
  // 触发：weeklyGoal.current < target 且本周剩余天数 <= 2
  const dayOfWeek = now.getDay();
  const daysUntilWeekEnd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  if (daysUntilWeekEnd <= 2) {
    const goals = weeklyGoalStorage.getCurrentWeek();
    for (const goal of goals) {
      if (goal.completed || goal.current >= goal.target) continue;

      const ruleName = `goal-sprint-${goal.id}`;
      const existing = todoStorage.findByRule(ruleName);
      if (!existing) {
        autoTodos.push({
          id: generateId(),
          text: `完成本周目标：${goal.text}（${goal.current}/${goal.target}）`,
          source: 'auto',
          priority: 'high',
          completed: false,
          dismissed: false,
          relatedType: 'goal',
          relatedId: goal.id,
          ruleName,
          created_at: nowFn(),
          updated_at: nowFn(),
        });
      }
    }
  }

  // ---- 规则 5: 新岗位评估 ----
  // 触发：有已完成的 job 但未做匹配评估
  const matchedJobIds = new Set(matches.map(m => m.job_id));
  const unMatchedJobs = jobStorage.getAll().filter(
    j => j.status === 'completed' && !matchedJobIds.has(j.id)
  );

  // 最多生成 3 条
  for (const job of unMatchedJobs.slice(0, 3)) {
    const ruleName = `evaluate-job-${job.id}`;
    const existing = todoStorage.findByRule(ruleName);
    if (!existing) {
      autoTodos.push({
        id: generateId(),
        text: `评估 ${job.company}「${job.title}」匹配度`,
        source: 'auto',
        priority: 'low',
        completed: false,
        dismissed: false,
        relatedType: 'job',
        relatedId: job.id,
        ruleName,
        created_at: nowFn(),
        updated_at: nowFn(),
      });
    }
  }

  // 持久化新的 auto todos
  for (const todo of autoTodos) {
    todoStorage.create({
      text: todo.text,
      source: todo.source,
      priority: todo.priority,
      completed: false,
      dismissed: false,
      dueTime: todo.dueTime,
      relatedType: todo.relatedType,
      relatedId: todo.relatedId,
      ruleName: todo.ruleName,
    });
  }

  return autoTodos;
}

function typeLabel(type?: string): string {
  const labels: Record<string, string> = {
    phone: '电话',
    video: '视频',
    onsite: '现场',
    written: '笔试',
  };
  return type ? labels[type] || '' : '';
}

// ==================== API 路由 ====================

/**
 * GET /api/todos
 * 获取待办列表：自动推导 + 手动创建的混合结果
 */
todoRoutes.get('/', async (c) => {
  try {
    // 先清理过期项
    todoStorage.cleanup();

    // 触发自动推导（会去重）
    generateAutoTodos();

    // 返回所有活跃的待办
    const active = todoStorage.getActive();

    // 按优先级 + 截止时间排序
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    active.sort((a, b) => {
      // 优先级不同，按优先级
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;

      // 有截止时间的排前面
      if (a.dueTime && !b.dueTime) return -1;
      if (!a.dueTime && b.dueTime) return 1;
      if (a.dueTime && b.dueTime) {
        return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
      }

      // 新的排前面
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // 也返回今天已完成的（供 UI 展示）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCompleted = todoStorage.getAll().filter(t =>
      t.completed && new Date(t.updated_at) >= today
    );

    return c.json({
      success: true,
      data: {
        active,
        completed: todayCompleted,
        stats: {
          total: active.length + todayCompleted.length,
          active: active.length,
          completed: todayCompleted.length,
          auto: active.filter(t => t.source === 'auto').length,
          manual: active.filter(t => t.source === 'manual').length,
        },
      },
    });
  } catch (error) {
    console.error('[Todos] List error:', error);
    return c.json({ success: false, error: '获取待办列表失败' }, 500);
  }
});

/**
 * POST /api/todos
 * 手动创建待办
 */
todoRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { text, priority = 'medium', dueTime } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return c.json({ success: false, error: '待办内容不能为空' }, 400);
    }

    const todo = todoStorage.create({
      text: text.trim(),
      source: 'manual',
      priority: priority as TodoPriority,
      completed: false,
      dismissed: false,
      dueTime: dueTime || undefined,
    });

    return c.json({ success: true, data: todo });
  } catch (error) {
    console.error('[Todos] Create error:', error);
    return c.json({ success: false, error: '创建待办失败' }, 500);
  }
});

/**
 * PUT /api/todos/:id
 * 更新待办
 */
todoRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = todoStorage.getById(id);

    if (!existing) {
      return c.json({ success: false, error: '未找到待办' }, 404);
    }

    const updates: Partial<TodoItem> = {};

    // 所有待办都可以标记完成
    if (typeof body.completed === 'boolean') updates.completed = body.completed;

    // 自动推导的只能标记完成或关闭
    if (existing.source === 'auto') {
      if (typeof body.dismissed === 'boolean') updates.dismissed = body.dismissed;
    } else {
      // 手动创建的可以修改所有字段
      if (typeof body.text === 'string') updates.text = body.text.trim();
      if (body.priority) updates.priority = body.priority;
      if (body.dueTime !== undefined) updates.dueTime = body.dueTime || undefined;
    }

    const todo = todoStorage.update(id, updates);
    if (!todo) {
      return c.json({ success: false, error: '更新失败' }, 500);
    }

    return c.json({ success: true, data: todo });
  } catch (error) {
    console.error('[Todos] Update error:', error);
    return c.json({ success: false, error: '更新待办失败' }, 500);
  }
});

/**
 * DELETE /api/todos/:id
 * 删除待办（仅限手动创建的）
 */
todoRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const existing = todoStorage.getById(id);

    if (!existing) {
      return c.json({ success: false, error: '未找到待办' }, 404);
    }

    // 自动推导的不能删除，只能 dismiss
    if (existing.source === 'auto') {
      todoStorage.dismiss(id);
      return c.json({ success: true, message: '已关闭自动推导的待办' });
    }

    const deleted = todoStorage.delete(id);
    if (!deleted) {
      return c.json({ success: false, error: '删除失败' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('[Todos] Delete error:', error);
    return c.json({ success: false, error: '删除待办失败' }, 500);
  }
});

/**
 * GET /api/todos/auto-generate
 * 仅返回自动推导的待办（调试/预览用）
 */
todoRoutes.get('/auto-generate', async (c) => {
  try {
    generateAutoTodos();
    const autoTodos = todoStorage.getActive().filter(t => t.source === 'auto');
    return c.json({ success: true, data: autoTodos });
  } catch (error) {
    console.error('[Todos] Auto-generate error:', error);
    return c.json({ success: false, error: '自动推导失败' }, 500);
  }
});

export default todoRoutes;
