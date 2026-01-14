/**
 * 面试题库 API 路由
 * 
 * Phase 8: 面试题库功能
 */

import { Hono } from 'hono';
import { 
  questionStorage, 
  answerStorage,
} from '../core/storage';
import { getInterviewCoaching, suggestQuestions } from '../agents/interview-coach';
import { QuestionCategory, QuestionSource, QuestionDifficulty } from '../types';

export const questionRoutes = new Hono();

// ==================== 题目 CRUD ====================

/**
 * 获取题目列表
 * GET /api/questions
 * Query: category, source, search, jobId, page, limit
 */
questionRoutes.get('/', async (c) => {
  try {
    const category = c.req.query('category') as QuestionCategory | undefined;
    const source = c.req.query('source') as QuestionSource | undefined;
    const search = c.req.query('search');
    const jobId = c.req.query('jobId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    let questions = questionStorage.getAll();

    // 筛选
    if (category) {
      questions = questions.filter(q => q.category === category);
    }
    if (source) {
      questions = questions.filter(q => q.source === source);
    }
    if (jobId) {
      questions = questions.filter(q => q.linked_jd_id === jobId);
    }
    if (search) {
      questions = questionStorage.search(search);
    }

    // 分页
    const total = questions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedQuestions = questions.slice(offset, offset + limit);

    // 统计
    const stats = questionStorage.getStats();

    return c.json({
      success: true,
      questions: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error('[Questions] List error:', error);
    return c.json({ success: false, error: '获取题目列表失败' }, 500);
  }
});

/**
 * 获取单个题目
 * GET /api/questions/:id
 */
questionRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const question = questionStorage.getById(id);

    if (!question) {
      return c.json({ success: false, error: '未找到题目' }, 404);
    }

    // 获取相关回答
    const answers = answerStorage.getByQuestionId(id);
    const currentAnswer = answers.find(a => a.is_current);

    return c.json({
      success: true,
      question,
      answers,
      currentAnswer,
    });
  } catch (error) {
    console.error('[Questions] Get error:', error);
    return c.json({ success: false, error: '获取题目失败' }, 500);
  }
});

/**
 * 创建题目
 * POST /api/questions
 */
questionRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      question, 
      category, 
      difficulty = 'medium',
      tags = [],
      source = 'manual',
      linked_jd_id,
      linked_jd_title,
    } = body;

    if (!question || !category) {
      return c.json({ success: false, error: '缺少必要参数' }, 400);
    }

    const newQuestion = questionStorage.create({
      question,
      category,
      difficulty,
      tags,
      source,
      linked_jd_id,
      linked_jd_title,
    });

    return c.json({ success: true, question: newQuestion });
  } catch (error) {
    console.error('[Questions] Create error:', error);
    return c.json({ success: false, error: '创建题目失败' }, 500);
  }
});

/**
 * 更新题目
 * PUT /api/questions/:id
 */
questionRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();

    const question = questionStorage.update(id, updates);
    if (!question) {
      return c.json({ success: false, error: '未找到题目' }, 404);
    }

    return c.json({ success: true, question });
  } catch (error) {
    console.error('[Questions] Update error:', error);
    return c.json({ success: false, error: '更新题目失败' }, 500);
  }
});

/**
 * 删除题目
 * DELETE /api/questions/:id
 */
questionRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deleted = questionStorage.delete(id);

    if (!deleted) {
      return c.json({ success: false, error: '未找到题目' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('[Questions] Delete error:', error);
    return c.json({ success: false, error: '删除题目失败' }, 500);
  }
});

// ==================== 批量导入 ====================

/**
 * 批量导入题目
 * POST /api/questions/import
 */
questionRoutes.post('/import', async (c) => {
  try {
    const body = await c.req.json();
    const { items, linked_jd_id, linked_jd_title } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return c.json({ success: false, error: '导入数据格式错误' }, 400);
    }

    // 处理导入数据
    const importItems = items.map((item: any) => ({
      question: item.question || item.q || item.content,
      category: (item.category || item.type || '其他') as QuestionCategory,
      difficulty: (item.difficulty || item.level || 'medium') as QuestionDifficulty,
      tags: item.tags || [],
      source: 'manual' as QuestionSource,
      linked_jd_id,
      linked_jd_title,
    })).filter(item => item.question);

    const created = questionStorage.importBatch(importItems);

    return c.json({
      success: true,
      imported: created.length,
      questions: created,
    });
  } catch (error) {
    console.error('[Questions] Import error:', error);
    return c.json({ success: false, error: '导入失败' }, 500);
  }
});

// ==================== 回答管理 ====================

/**
 * 保存回答
 * POST /api/questions/:id/answer
 */
questionRoutes.post('/:id/answer', async (c) => {
  try {
    const questionId = c.req.param('id');
    const { content, version_tag } = await c.req.json();

    if (!content) {
      return c.json({ success: false, error: '回答内容不能为空' }, 400);
    }

    const question = questionStorage.getById(questionId);
    if (!question) {
      return c.json({ success: false, error: '未找到题目' }, 404);
    }

    const answer = answerStorage.save(questionId, content, version_tag);

    return c.json({ success: true, answer });
  } catch (error) {
    console.error('[Questions] Save answer error:', error);
    return c.json({ success: false, error: '保存回答失败' }, 500);
  }
});

/**
 * 获取回答历史
 * GET /api/questions/:id/answers
 */
questionRoutes.get('/:id/answers', async (c) => {
  try {
    const questionId = c.req.param('id');
    const answers = answerStorage.getByQuestionId(questionId);

    return c.json({
      success: true,
      answers,
      total: answers.length,
    });
  } catch (error) {
    console.error('[Questions] Get answers error:', error);
    return c.json({ success: false, error: '获取回答历史失败' }, 500);
  }
});

// ==================== AI 教练点评 ====================

/**
 * 获取 AI 点评
 * POST /api/questions/:id/feedback
 */
questionRoutes.post('/:id/feedback', async (c) => {
  try {
    const questionId = c.req.param('id');
    const { answer_id, mode = 'general', job_context } = await c.req.json();

    const question = questionStorage.getById(questionId);
    if (!question) {
      return c.json({ success: false, error: '未找到题目' }, 404);
    }

    // 获取回答
    let answer;
    if (answer_id) {
      answer = answerStorage.getById(answer_id);
    } else {
      answer = answerStorage.getCurrentAnswer(questionId);
    }

    if (!answer) {
      return c.json({ success: false, error: '未找到回答' }, 404);
    }

    // 调用 AI 教练
    const coaching = await getInterviewCoaching({
      question: question.question,
      answer: answer.content,
      mode,
      job_context,
    });

    // 保存反馈到回答记录
    answerStorage.updateFeedback(answer.id, coaching.feedback);

    return c.json({
      success: true,
      feedback: coaching.feedback,
      improved_answer: coaching.improved_answer,
    });
  } catch (error) {
    console.error('[Questions] Get feedback error:', error);
    return c.json({ success: false, error: 'AI 点评失败' }, 500);
  }
});

// ==================== 题目建议 ====================

/**
 * 基于 JD 生成题目建议
 * POST /api/questions/suggest
 */
questionRoutes.post('/suggest', async (c) => {
  try {
    const { job_title, company, requirements, category } = await c.req.json();

    if (!job_title || !requirements) {
      return c.json({ success: false, error: '缺少岗位信息' }, 400);
    }

    const questions = await suggestQuestions(
      job_title,
      company || '',
      requirements,
      category
    );

    return c.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('[Questions] Suggest error:', error);
    return c.json({ success: false, error: '生成题目建议失败' }, 500);
  }
});

// ==================== 从面试准备导入 ====================

/**
 * 从面试准备结果导入题目
 * POST /api/questions/import-from-interview/:jobId
 */
questionRoutes.post('/import-from-interview/:jobId', async (c) => {
  try {
    const jobId = c.req.param('jobId');
    
    // 获取面试准备数据
    const { interviewStorage } = await import('../core/storage');
    const prep = interviewStorage.getByJobId(jobId);
    
    if (!prep) {
      return c.json({ success: false, error: '未找到面试准备数据' }, 404);
    }

    // 提取问题
    const importItems: Array<{
      question: string;
      category: QuestionCategory;
      tags: string[];
      source: QuestionSource;
      linked_jd_id: string;
      linked_jd_title?: string;
    }> = [];

    // 从 interview_questions 提取
    if (prep.interview_questions) {
      for (const q of prep.interview_questions) {
        importItems.push({
          question: q.question,
          category: '专业能力', // 默认分类
          tags: ['面试准备', 'AI生成'],
          source: 'agent',
          linked_jd_id: jobId,
        });
      }
    }

    // 批量导入
    const created = questionStorage.importBatch(importItems);

    return c.json({
      success: true,
      imported: created.length,
      questions: created,
    });
  } catch (error) {
    console.error('[Questions] Import from interview error:', error);
    return c.json({ success: false, error: '导入失败' }, 500);
  }
});

export default questionRoutes;
