/**
 * FindJob - 认证路由
 * 
 * POST /api/auth/sms/send    — 发送短信验证码 (mock)
 * POST /api/auth/login        — 手机号 + 验证码登录/注册
 * POST /api/auth/refresh       — Token 刷新
 * POST /api/auth/logout        — 退出登录
 * GET  /api/auth/health        — 健康检查
 */

import { Hono } from 'hono';
import {
  userStorage,
  authTokenStorage,
  smsCodeStorage,
  quotaStorage,
  type StoredUser,
} from '../core/storage';
import { authRequired } from '../core/auth-middleware';

const auth = new Hono();

// ==================== 发送短信验证码 (mock) ====================
auth.post('/sms/send', async (c) => {
  try {
    const { phone } = await c.req.json<{ phone: string }>();

    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return c.json({ success: false, error: '请输入有效的手机号' }, 400);
    }

    // 检查冷却时间（60秒内不能重复发送）
    if (!smsCodeStorage.canSend(phone)) {
      return c.json({ success: false, error: '发送太频繁，请60秒后重试' }, 429);
    }

    // 生成验证码
    const sms = smsCodeStorage.create(phone);

    // ⚠️ Mock 模式：直接在响应中返回验证码（正式环境不会这样做）
    console.log(`[SMS Mock] 手机号 ${phone} 验证码: ${sms.code}`);

    return c.json({
      success: true,
      message: '验证码已发送',
      // 开发模式下返回验证码，方便测试
      _dev_code: sms.code,
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    return c.json({ success: false, error: '发送失败，请稍后重试' }, 500);
  }
});

// ==================== 手机号登录/注册 ====================
auth.post('/login', async (c) => {
  try {
    const { phone, code } = await c.req.json<{ phone: string; code: string }>();

    // 验证参数
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return c.json({ success: false, error: '请输入有效的手机号' }, 400);
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return c.json({ success: false, error: '请输入6位验证码' }, 400);
    }

    // 验证短信码
    const isValid = smsCodeStorage.verify(phone, code);
    if (!isValid) {
      return c.json({ success: false, error: '验证码错误或已过期' }, 401);
    }

    // 查找或创建用户
    let user = userStorage.getByPhone(phone);
    let isFirstLogin = false;

    if (!user) {
      // 新用户，自动注册
      user = userStorage.create({
        phone,
        role: 'user',
        isInitialized: false,
        isPremium: false,
      });
      isFirstLogin = true;

      // 为新用户创建默认额度
      quotaStorage.getOrCreate(user.id, false);

      console.log(`[Auth] 新用户注册: ${phone} → ${user.id}`);
    } else {
      console.log(`[Auth] 用户登录: ${phone} → ${user.id}`);
    }

    // 生成 token
    const authToken = authTokenStorage.create(user.id);

    return c.json({
      success: true,
      data: {
        token: authToken.token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          isFirstLogin,
          isInitialized: user.isInitialized,
          isPremium: user.isPremium,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return c.json({ success: false, error: '登录失败，请稍后重试' }, 500);
  }
});

// ==================== Token 刷新 ====================
auth.post('/refresh', authRequired, async (c) => {
  try {
    const userId = c.get('userId') as string;
    const user = c.get('user') as StoredUser;

    // 删除旧 token
    const oldToken = c.req.header('Authorization')?.split(' ')[1];
    if (oldToken) {
      authTokenStorage.deleteByToken(oldToken);
    }

    // 创建新 token
    const newToken = authTokenStorage.create(userId);

    return c.json({
      success: true,
      data: {
        token: newToken.token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          isFirstLogin: false,
          isInitialized: user.isInitialized,
          isPremium: user.isPremium,
        },
      },
    });
  } catch (error) {
    console.error('Token 刷新失败:', error);
    return c.json({ success: false, error: '刷新失败' }, 500);
  }
});

// ==================== 退出登录 ====================
auth.post('/logout', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (token) {
      authTokenStorage.deleteByToken(token);
    }
    return c.json({ success: true, message: '已退出登录' });
  } catch (error) {
    return c.json({ success: true, message: '已退出' }); // 退出总是成功
  }
});

// ==================== 健康检查 ====================
auth.get('/health', (c) => {
  return c.json({
    success: true,
    service: 'auth',
    timestamp: new Date().toISOString(),
    stats: {
      users: userStorage.getAll().length,
      activeSessions: authTokenStorage.getAll().length,
    },
  });
});

export default auth;
