/**
 * 飞书集成 API 路由
 * 
 * 提供飞书多维表格配置管理、连接测试、手动同步等功能
 */

import { Hono } from 'hono';
import {
  getFeishuConfig,
  setFeishuConfig,
  testFeishuConnection,
  syncJobToFeishu,
  initFeishuConfigFromEnv,
  type FeishuConfig,
} from '../core/feishu';

const feishuRoutes = new Hono();

/**
 * GET /api/feishu/config - 获取当前飞书配置（隐藏敏感信息）
 */
feishuRoutes.get('/config', (c) => {
  // 尝试从环境变量初始化
  const env = (c.env || {}) as Record<string, string>;
  initFeishuConfigFromEnv(env);

  const config = getFeishuConfig();
  if (!config) {
    return c.json({
      success: true,
      configured: false,
      config: null,
    });
  }

  return c.json({
    success: true,
    configured: true,
    config: {
      appId: config.appId ? `${config.appId.slice(0, 8)}...${config.appId.slice(-4)}` : '',
      appSecret: config.appSecret ? '********' : '',
      appToken: config.appToken || '',
      tableId: config.tableId || '',
      enabled: config.enabled,
    },
  });
});

/**
 * POST /api/feishu/config - 保存飞书配置
 */
feishuRoutes.post('/config', async (c) => {
  try {
    const body = await c.req.json();
    const { appId, appSecret, appToken, tableId, enabled } = body;

    if (!appId || !appSecret || !appToken || !tableId) {
      return c.json({
        success: false,
        error: '缺少必要参数: appId, appSecret, appToken, tableId',
      }, 400);
    }

    const config: FeishuConfig = {
      appId: appId.trim(),
      appSecret: appSecret.trim(),
      appToken: appToken.trim(),
      tableId: tableId.trim(),
      enabled: enabled !== false,
    };

    setFeishuConfig(config);

    return c.json({
      success: true,
      message: '飞书配置已保存（运行时有效）',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '保存配置失败',
    }, 500);
  }
});

/**
 * POST /api/feishu/test - 测试飞书连接
 */
feishuRoutes.post('/test', async (c) => {
  try {
    // 支持临时传入配置测试，也支持用已保存的配置测试
    let testConfig: FeishuConfig | undefined;
    
    try {
      const body = await c.req.json();
      if (body.appId && body.appSecret && body.appToken && body.tableId) {
        testConfig = {
          appId: body.appId.trim(),
          appSecret: body.appSecret.trim(),
          appToken: body.appToken.trim(),
          tableId: body.tableId.trim(),
          enabled: true,
        };
      }
    } catch {
      // 没有 body，使用已保存配置
    }

    // 如果没有运行时配置，尝试从环境变量初始化
    if (!testConfig) {
      const env = (c.env || {}) as Record<string, string>;
      initFeishuConfigFromEnv(env);
    }

    const result = await testFeishuConnection(testConfig);

    return c.json({
      success: result.success,
      message: result.message,
      fields: result.fields?.map(f => ({
        name: f.field_name,
        type: f.type,
        id: f.field_id,
      })),
      resolvedAppToken: result.resolvedAppToken,
    });
  } catch (error) {
    return c.json({
      success: false,
      message: error instanceof Error ? error.message : '测试连接失败',
    }, 500);
  }
});

/**
 * POST /api/feishu/toggle - 切换启用/禁用
 */
feishuRoutes.post('/toggle', async (c) => {
  try {
    const config = getFeishuConfig();
    if (!config) {
      return c.json({ success: false, error: '请先配置飞书信息' }, 400);
    }

    const body = await c.req.json();
    const enabled = body.enabled !== undefined ? Boolean(body.enabled) : !config.enabled;

    setFeishuConfig({ ...config, enabled });

    return c.json({
      success: true,
      enabled,
      message: enabled ? '飞书同步已启用' : '飞书同步已禁用',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '切换失败',
    }, 500);
  }
});

/**
 * POST /api/feishu/sync-job - 手动同步指定岗位到飞书
 */
feishuRoutes.post('/sync-job', async (c) => {
  try {
    const body = await c.req.json();
    const { job, existingRecordId } = body;

    if (!job || !job.id) {
      return c.json({ success: false, error: '缺少岗位数据' }, 400);
    }

    // 尝试从环境变量初始化
    const env = (c.env || {}) as Record<string, string>;
    initFeishuConfigFromEnv(env);

    // 如果传入了 existingRecordId，则覆盖更新已有记录
    const result = await syncJobToFeishu(job, existingRecordId || undefined);

    return c.json({
      success: result.success,
      recordId: result.recordId,
      error: result.error,
      duration_ms: result.duration_ms,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : '同步失败',
    }, 500);
  }
});

export default feishuRoutes;
