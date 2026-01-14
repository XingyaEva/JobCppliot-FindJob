/**
 * 投递跟踪 API 路由
 * 
 * Phase 9: 投递跟踪功能
 */

import { Hono } from 'hono';
import { applicationStorage, jobStorage } from '../core/storage';
import { ApplicationStatus, InterviewType } from '../types';

export const applicationRoutes = new Hono();

// ==================== 投递记录 CRUD ====================

/**
 * 获取投递列表
 * GET /api/applications
 * Query: status, source, search, page, limit
 */
applicationRoutes.get('/', async (c) => {
  try {
    const status = c.req.query('status') as ApplicationStatus | undefined;
    const source = c.req.query('source');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');

    let applications = applicationStorage.getAll();

    // 筛选
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    if (source) {
      applications = applications.filter(app => app.source === source);
    }
    if (search) {
      applications = applicationStorage.search(search);
    }

    // 按更新时间倒序
    applications.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // 分页
    const total = applications.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedApps = applications.slice(offset, offset + limit);

    // 统计
    const stats = applicationStorage.getStats();

    return c.json({
      success: true,
      applications: paginatedApps,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error('[Applications] List error:', error);
    return c.json({ success: false, error: '获取投递列表失败' }, 500);
  }
});

/**
 * 获取单个投递记录
 * GET /api/applications/:id
 */
applicationRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const application = applicationStorage.getById(id);

    if (!application) {
      return c.json({ success: false, error: '未找到投递记录' }, 404);
    }

    // 获取关联岗位信息
    let job = null;
    if (application.job_id) {
      job = jobStorage.getById(application.job_id);
    }

    return c.json({
      success: true,
      application,
      job,
    });
  } catch (error) {
    console.error('[Applications] Get error:', error);
    return c.json({ success: false, error: '获取投递记录失败' }, 500);
  }
});

/**
 * 创建投递记录
 * POST /api/applications
 */
applicationRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const {
      company,
      position,
      job_url,
      status = 'applied',
      applied_at,
      salary_range,
      notes,
      tags = [],
      source,
      job_id,
    } = body;

    if (!company || !position) {
      return c.json({ success: false, error: '公司名称和职位名称必填' }, 400);
    }

    const application = applicationStorage.create({
      job_id,
      company,
      position,
      job_url,
      status,
      applied_at: applied_at || new Date().toISOString(),
      salary_range,
      notes,
      tags,
      source,
    });

    return c.json({ success: true, application });
  } catch (error) {
    console.error('[Applications] Create error:', error);
    return c.json({ success: false, error: '创建投递记录失败' }, 500);
  }
});

/**
 * 从岗位创建投递记录
 * POST /api/applications/from-job/:jobId
 */
applicationRoutes.post('/from-job/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    const { source } = await c.req.json().catch(() => ({}));

    const job = jobStorage.getById(jobId);
    if (!job) {
      return c.json({ success: false, error: '未找到岗位' }, 404);
    }

    // 检查是否已有投递记录
    const existing = applicationStorage.getByJobId(jobId);
    if (existing) {
      return c.json({ 
        success: false, 
        error: '该岗位已有投递记录',
        application: existing,
      }, 400);
    }

    const application = applicationStorage.createFromJob(job, source);

    return c.json({ success: true, application });
  } catch (error) {
    console.error('[Applications] Create from job error:', error);
    return c.json({ success: false, error: '创建投递记录失败' }, 500);
  }
});

/**
 * 更新投递记录
 * PUT /api/applications/:id
 */
applicationRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    // 不允许直接更新 status，需要通过专门的状态更新接口
    delete updates.status;
    delete updates.status_history;
    delete updates.interviews;

    const application = applicationStorage.update(id, updates);
    if (!application) {
      return c.json({ success: false, error: '未找到投递记录' }, 404);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.error('[Applications] Update error:', error);
    return c.json({ success: false, error: '更新投递记录失败' }, 500);
  }
});

/**
 * 删除投递记录
 * DELETE /api/applications/:id
 */
applicationRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deleted = applicationStorage.delete(id);

    if (!deleted) {
      return c.json({ success: false, error: '未找到投递记录' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('[Applications] Delete error:', error);
    return c.json({ success: false, error: '删除投递记录失败' }, 500);
  }
});

// ==================== 状态管理 ====================

/**
 * 更新投递状态
 * PUT /api/applications/:id/status
 */
applicationRoutes.put('/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status, note } = await c.req.json();

    if (!status) {
      return c.json({ success: false, error: '状态必填' }, 400);
    }

    const validStatuses: ApplicationStatus[] = [
      'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'
    ];
    if (!validStatuses.includes(status)) {
      return c.json({ success: false, error: '无效的状态值' }, 400);
    }

    const application = applicationStorage.updateStatus(id, status, note);
    if (!application) {
      return c.json({ success: false, error: '未找到投递记录' }, 404);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.error('[Applications] Update status error:', error);
    return c.json({ success: false, error: '更新状态失败' }, 500);
  }
});

// ==================== 面试管理 ====================

/**
 * 添加面试记录
 * POST /api/applications/:id/interview
 */
applicationRoutes.post('/:id/interview', async (c) => {
  try {
    const id = c.req.param('id');
    const { round, type, scheduled_at, interviewer, feedback, result } = await c.req.json();

    if (!round || !type) {
      return c.json({ success: false, error: '面试轮次和类型必填' }, 400);
    }

    const validTypes: InterviewType[] = ['phone', 'video', 'onsite', 'written'];
    if (!validTypes.includes(type)) {
      return c.json({ success: false, error: '无效的面试类型' }, 400);
    }

    const application = applicationStorage.addInterview(id, {
      round,
      type,
      scheduled_at,
      interviewer,
      feedback,
      result,
    });

    if (!application) {
      return c.json({ success: false, error: '未找到投递记录' }, 404);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.error('[Applications] Add interview error:', error);
    return c.json({ success: false, error: '添加面试记录失败' }, 500);
  }
});

/**
 * 更新面试记录
 * PUT /api/applications/:id/interview/:interviewId
 */
applicationRoutes.put('/:id/interview/:interviewId', async (c) => {
  try {
    const appId = c.req.param('id');
    const interviewId = c.req.param('interviewId');
    const updates = await c.req.json();

    const application = applicationStorage.updateInterview(appId, interviewId, updates);
    if (!application) {
      return c.json({ success: false, error: '未找到投递记录或面试记录' }, 404);
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.error('[Applications] Update interview error:', error);
    return c.json({ success: false, error: '更新面试记录失败' }, 500);
  }
});

// ==================== 统计与导出 ====================

/**
 * 获取统计数据
 * GET /api/applications/stats
 */
applicationRoutes.get('/stats/overview', async (c) => {
  try {
    const stats = applicationStorage.getStats();
    return c.json({ success: true, stats });
  } catch (error) {
    console.error('[Applications] Stats error:', error);
    return c.json({ success: false, error: '获取统计数据失败' }, 500);
  }
});

/**
 * 导出投递数据
 * GET /api/applications/export
 * Query: format (json/csv)
 */
applicationRoutes.get('/export/data', async (c) => {
  try {
    const format = c.req.query('format') || 'json';
    const applications = applicationStorage.getAll();

    if (format === 'csv') {
      // 生成 CSV
      const headers = ['公司', '职位', '状态', '投递时间', '投递渠道', '薪资范围', '备注'];
      const statusLabels: Record<ApplicationStatus, string> = {
        applied: '已投递',
        screening: '筛选中',
        interview: '面试中',
        offer: '已获Offer',
        rejected: '已拒绝',
        withdrawn: '已撤回',
      };

      const rows = applications.map(app => [
        app.company,
        app.position,
        statusLabels[app.status],
        app.applied_at,
        app.source || '',
        app.salary_range || '',
        app.notes || '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="applications_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // 默认 JSON 格式
    return c.json({
      success: true,
      data: applications,
      exported_at: new Date().toISOString(),
      total: applications.length,
    });
  } catch (error) {
    console.error('[Applications] Export error:', error);
    return c.json({ success: false, error: '导出数据失败' }, 500);
  }
});

export default applicationRoutes;
