/**
 * FindJob - 用户路由
 * 
 * GET    /api/user/status     — 获取当前用户状态（含 token 验证）
 * PUT    /api/user/profile     — 更新个人资料（完善/编辑）
 * GET    /api/user/quota       — 获取使用额度
 * DELETE /api/user/delete      — 注销账户
 */

import { Hono } from 'hono';
import {
  userStorage,
  authTokenStorage,
  quotaStorage,
  type StoredUser,
} from '../core/storage';
import { authRequired } from '../core/auth-middleware';

const user = new Hono();

// 所有路由都需要登录
user.use('*', authRequired);

// ==================== 获取用户状态 ====================
user.get('/status', async (c) => {
  try {
    const currentUser = c.get('user') as StoredUser;

    return c.json({
      success: true,
      data: {
        user: {
          id: currentUser.id,
          phone: currentUser.phone,
          email: currentUser.email,
          nickname: currentUser.nickname,
          avatar: currentUser.avatar,
          role: currentUser.role,
          isFirstLogin: false,
          isInitialized: currentUser.isInitialized,
          isPremium: currentUser.isPremium,
        },
      },
    });
  } catch (error) {
    console.error('获取用户状态失败:', error);
    return c.json({ success: false, error: '获取用户状态失败' }, 500);
  }
});

// ==================== 更新个人资料 ====================
user.put('/profile', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const body = await c.req.json();

    // 允许更新的字段白名单
    const allowedFields = ['nickname', 'email', 'avatar', 'salaryRange', 'industries', 'workStyle'];
    const updates: Partial<StoredUser> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updates as any)[field] = body[field];
      }
    }

    // 如果有 industries 且是 JSON 字符串，解析它
    if (typeof updates.industries === 'string') {
      try {
        updates.industries = JSON.parse(updates.industries);
      } catch {
        // 保持原样
      }
    }

    // 如果填写了关键资料，标记为已初始化
    if (body.salaryRange || body.industries || body.workStyle) {
      updates.isInitialized = true;
    }

    const updated = userStorage.update(userId, updates);
    if (!updated) {
      return c.json({ success: false, error: '用户不存在' }, 404);
    }

    return c.json({
      success: true,
      data: {
        user: {
          id: updated.id,
          phone: updated.phone,
          email: updated.email,
          nickname: updated.nickname,
          avatar: updated.avatar,
          role: updated.role,
          isFirstLogin: false,
          isInitialized: updated.isInitialized,
          isPremium: updated.isPremium,
        },
      },
      message: '资料更新成功',
    });
  } catch (error) {
    console.error('更新资料失败:', error);
    return c.json({ success: false, error: '更新失败，请稍后重试' }, 500);
  }
});

// ==================== 获取使用额度 ====================
user.get('/quota', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const currentUser = c.get('user') as StoredUser;

    const quota = quotaStorage.getOrCreate(userId, currentUser.isPremium);

    return c.json({
      success: true,
      data: {
        quota: {
          jobPool: quota.jobPool,
          resumeVersions: quota.resumeVersions,
          interviewMocks: quota.interviewMocks,
        },
      },
    });
  } catch (error) {
    console.error('获取额度失败:', error);
    return c.json({ success: false, error: '获取额度失败' }, 500);
  }
});

// ==================== 注销账户 ====================
user.delete('/delete', async (c) => {
  try {
    const userId = c.get('userId') as string;
    const currentUser = c.get('user') as StoredUser;

    console.log(`[User] 账户注销: ${currentUser.phone} → ${userId}`);

    // 1. 删除所有 token
    authTokenStorage.deleteByUserId(userId);

    // 2. 删除额度记录
    quotaStorage.delete(userId);

    // 3. 删除用户
    userStorage.delete(userId);

    return c.json({
      success: true,
      message: '账户已注销',
    });
  } catch (error) {
    console.error('注销失败:', error);
    return c.json({ success: false, error: '注销失败，请稍后重试' }, 500);
  }
});

export default user;
