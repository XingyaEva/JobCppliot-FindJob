/**
 * 飞书开放平台 API 封装
 * 
 * 支持将解析完成的岗位数据同步到飞书多维表格
 * 使用 tenant_access_token 鉴权，纯 REST API 调用，零额外依赖
 */

import type { Job } from '../types';

// ==================== 类型定义 ====================

/** 飞书配置 */
export interface FeishuConfig {
  appId: string;
  appSecret: string;
  appToken: string;      // 多维表格 app_token
  tableId: string;       // 数据表 table_id
  enabled: boolean;      // 是否启用同步
}

/** 飞书同步结果 */
export interface FeishuSyncResult {
  success: boolean;
  recordId?: string;
  error?: string;
  duration_ms?: number;
}

/** 字段信息 */
export interface FeishuField {
  field_id: string;
  field_name: string;
  type: number;
  description?: { text: string };
}

// ==================== Token 管理 ====================

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * 获取 tenant_access_token（带缓存，提前 5 分钟刷新）
 */
export async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });

  const data = await resp.json() as any;
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`获取飞书 token 失败: ${data.msg || 'unknown error'}`);
  }

  // 缓存 token，提前 5 分钟过期
  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: now + (data.expire - 300) * 1000,
  };

  console.log('[Feishu] 获取 tenant_access_token 成功');
  return data.tenant_access_token;
}

// ==================== Wiki / Sheet Token 转换 ====================

/**
 * 将知识库中的 wiki token 转换为可用的 bitable app_token
 * 
 * 支持三种场景：
 * 1. wiki → bitable（直接嵌入的多维表格）
 * 2. wiki → sheet → embedded bitable（电子表格中嵌入的多维表格）
 * 3. 直接的 bitable app_token
 * 
 * 需要应用开通 wiki:wiki:readonly 权限
 * 如果是 sheet 嵌入多维表格，还需要 sheets:spreadsheet 权限
 */
export async function resolveWikiToken(wikiToken: string, tenantToken: string): Promise<string> {
  const resp = await fetch(`https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=${wikiToken}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tenantToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await resp.json() as any;
  if (data.code !== 0 || !data.data?.node) {
    throw new Error(`Wiki token 解析失败 (code: ${data.code}): ${data.msg || 'unknown'}`);
  }

  const node = data.data.node;
  
  if (node.obj_type === 'bitable') {
    // 场景1：直接是多维表格
    console.log(`[Feishu] Wiki → Bitable 转换成功: ${wikiToken} -> ${node.obj_token}`);
    return node.obj_token;
  }
  
  if (node.obj_type === 'sheet') {
    // 场景2：知识库中的电子表格，多维表格嵌入其中
    console.log(`[Feishu] Wiki 节点是电子表格 (obj_token: ${node.obj_token})，尝试获取嵌入的多维表格...`);
    
    try {
      const bitableAppToken = await resolveSheetEmbeddedBitable(node.obj_token, tenantToken);
      console.log(`[Feishu] Wiki → Sheet → Bitable 转换成功: ${wikiToken} -> ${bitableAppToken}`);
      return bitableAppToken;
    } catch (sheetErr) {
      // sheets 权限不够或无法解析时，给出详细指引
      throw new Error(
        `该知识库节点是「电子表格」(非独立多维表格)，自动解析失败。\n` +
        `解决方案（二选一）：\n` +
        `方案A：开通 sheets:spreadsheet 权限并重新发布应用版本，然后重试。\n` +
        `方案B（推荐）：在飞书云文档中直接新建一个独立的「多维表格」，` +
        `其 URL 格式为 https://xxx.feishu.cn/base/xxx，将新 URL 填入此处即可。\n` +
        `原始错误: ${sheetErr instanceof Error ? sheetErr.message : String(sheetErr)}`
      );
    }
  }

  // 其他类型（docx 等）
  throw new Error(
    `该知识库节点类型为「${node.obj_type}」，不是多维表格。\n` +
    `请提供一个独立的多维表格 URL（格式：https://xxx.feishu.cn/base/xxx?table=tblXXX）。`
  );
}

/**
 * 从电子表格的元数据中获取嵌入的多维表格 app_token
 * 
 * 电子表格中可能嵌入多维表格 block，需要通过 metainfo 或 sheets 列表找到
 */
async function resolveSheetEmbeddedBitable(sheetToken: string, tenantToken: string): Promise<string> {
  // 获取电子表格的元数据（v2 接口包含 blockInfo）
  const metaResp = await fetch(
    `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${sheetToken}/metainfo`,
    {
      headers: { 'Authorization': `Bearer ${tenantToken}` },
    }
  );

  const metaData = await metaResp.json() as any;
  
  if (metaData.code === 0 && metaData.data?.sheets) {
    // 遍历 sheets，查找 BITABLE_BLOCK 类型
    // blockToken 格式: "{bitable_app_token}_{table_id}"
    for (const sheet of metaData.data.sheets) {
      const blockInfo = sheet.blockInfo;
      if (blockInfo?.blockType === 'BITABLE_BLOCK' && blockInfo.blockToken) {
        // 提取 app_token（blockToken 中下划线前的部分，但 table_id 以 tbl 开头）
        const bt = blockInfo.blockToken as string;
        const tblIdx = bt.lastIndexOf('_tbl');
        if (tblIdx > 0) {
          const appToken = bt.substring(0, tblIdx);
          console.log(`[Feishu] 从 blockToken 提取 app_token: ${bt} -> ${appToken}`);
          return appToken;
        }
        // fallback: 直接返回整个 blockToken
        return bt;
      }
    }
  }

  // 如果 v2 接口没拿到，尝试 v3 sheets query + 用 blockToken 格式查找
  const sheetsResp = await fetch(
    `https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${sheetToken}/sheets/query`,
    {
      headers: { 'Authorization': `Bearer ${tenantToken}` },
    }
  );

  const sheetsData = await sheetsResp.json() as any;
  if (sheetsData.code === 0 && sheetsData.data?.sheets) {
    for (const sheet of sheetsData.data.sheets) {
      if (sheet.resource_type === 'bitable') {
        // v3 接口可能有 bitable_token 或需要回退到 v2 获取
        if (sheet.bitable_token) return sheet.bitable_token;
      }
    }
  }

  throw new Error(
    '在电子表格中未找到嵌入的多维表格。' +
    '请确认：1) 应用已开通 sheets:spreadsheet 权限并重新发布；' +
    '2) 该电子表格中确实包含多维表格 block。'
  );
}

// ==================== 字段操作 ====================

/**
 * 获取多维表格的字段列表
 */
export async function getTableFields(
  appToken: string,
  tableId: string,
  tenantToken: string
): Promise<FeishuField[]> {
  const resp = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
    {
      headers: { 'Authorization': `Bearer ${tenantToken}` },
    }
  );

  const data = await resp.json() as any;
  if (data.code !== 0) {
    throw new Error(`获取字段列表失败 (code: ${data.code}): ${data.msg}`);
  }

  return (data.data?.items || []) as FeishuField[];
}

// ==================== 记录写入 ====================

/**
 * 将 Job 数据映射为飞书多维表格的 fields 对象
 * 
 * 字段映射策略：
 * - 按字段名精确匹配写入（中文字段名）
 * - 不存在的字段自动忽略，不会报错
 * - 支持文本、单选、多选、超链接、日期等字段类型
 */
/**
 * 将 Job 数据映射为飞书多维表格的 fields 对象
 * 
 * 适配原始「求职进度追踪表」的 24 个字段：
 *   任务描述(Text), 公司(MultiSelect), 匹配度(MultiSelect), 优先级(SingleSelect),
 *   状态(SingleSelect), 投递渠道(SingleSelect), 面试进度(SingleSelect),
 *   投递时间(DateTime), 面试日期(DateTime), 岗位分析(Text), 产品类型(SingleSelect),
 *   业务领域(Text), 团队阶段(MultiSelect), 行业背景(Text), 技术背景(Text),
 *   产品经验(Text), 产品能力(Text), 公司业务/竞品调研/面试准备(Url),
 *   薪资(Text), 附件(Attachment), 技术栈(Text), 父记录(SingleLink),
 *   其他(Text), JD链接(Url)
 */
export function mapJobToFeishuFields(job: Job): Record<string, any> {
  const jd = job.structured_jd;
  const aAnalysis = job.a_analysis;
  const bAnalysis = job.b_analysis;

  const fields: Record<string, any> = {};

  // === 任务描述 (Text, 主字段) — 岗位标题 ===
  if (job.title) {
    fields['任务描述'] = job.title;
  }

  // === 公司 (MultiSelect) ===
  if (job.company) {
    fields['公司'] = [job.company];
  }

  // === 薪资 (Text) ===
  if (jd?.salary) {
    fields['薪资'] = jd.salary;
  }

  // === JD链接 (Url) ===
  if (job.job_url) {
    fields['JD链接'] = { link: job.job_url, text: job.title || job.job_url };
  }

  // === 状态 (SingleSelect) — 默认「未投」 ===
  fields['状态'] = '未投';

  // === 投递时间 (DateTime, 毫秒时间戳) ===
  const parseTs = job.created_at ? new Date(job.created_at).getTime() : Date.now();
  if (!isNaN(parseTs)) {
    fields['投递时间'] = parseTs;
  }

  // === A维度分析 ===
  if (aAnalysis) {
    // 产品类型 (SingleSelect)
    if (aAnalysis.A2_product_type?.type) {
      fields['产品类型'] = aAnalysis.A2_product_type.type;
    }
    // 业务领域 (Text)
    if (aAnalysis.A3_business_domain?.primary) {
      fields['业务领域'] = aAnalysis.A3_business_domain.primary;
    }
    // 团队阶段 (MultiSelect)
    if (aAnalysis.A4_team_stage?.stage) {
      fields['团队阶段'] = [aAnalysis.A4_team_stage.stage];
    }
    // 技术栈 (Text)
    if (aAnalysis.A1_tech_stack?.keywords?.length) {
      fields['技术栈'] = Array.isArray(aAnalysis.A1_tech_stack.keywords)
        ? aAnalysis.A1_tech_stack.keywords.join('、')
        : String(aAnalysis.A1_tech_stack.keywords);
    }
  }

  // === B维度分析 ===
  if (bAnalysis) {
    // 行业背景 (Text)
    if (bAnalysis.B1_industry_requirement?.summary) {
      fields['行业背景'] = bAnalysis.B1_industry_requirement.summary;
    }
    // 技术背景 (Text)
    if (bAnalysis.B2_tech_requirement?.summary) {
      fields['技术背景'] = bAnalysis.B2_tech_requirement.summary;
    } else if (bAnalysis.B2_tech_requirement?.education) {
      fields['技术背景'] = `学历: ${bAnalysis.B2_tech_requirement.education}`;
    }
    // 产品经验 (Text)
    if (bAnalysis.B3_product_requirement?.summary) {
      fields['产品经验'] = bAnalysis.B3_product_requirement.summary;
    }
    // 产品能力 (Text)
    if (bAnalysis.B4_capability_requirement?.summary) {
      fields['产品能力'] = bAnalysis.B4_capability_requirement.summary;
    }
  }

  // === 岗位分析 (Text) — 综合摘要 ===
  const analysisParts: string[] = [];
  if (jd?.location) analysisParts.push(`📍 ${jd.location}`);
  if (jd?.highlights?.length) {
    analysisParts.push(`✅ 亮点: ${(Array.isArray(jd.highlights) ? jd.highlights : [jd.highlights]).join('；')}`);
  }
  if (jd?.risks?.length) {
    analysisParts.push(`⚠️ 风险: ${(Array.isArray(jd.risks) ? jd.risks : [jd.risks]).join('；')}`);
  }
  if (jd?.responsibilities?.length) {
    analysisParts.push(`📋 职责: ${jd.responsibilities.slice(0, 3).join('；')}`);
  }
  if (analysisParts.length > 0) {
    fields['岗位分析'] = analysisParts.join('\n');
  }

  // === 其他 (Text) — 数据来源标记 ===
  const sourceLabel = job.source_type === 'image' ? '图片解析' : job.source_type === 'url' ? 'URL抓取' : '文本解析';
  fields['其他'] = `[Job Copilot 自动同步] 来源: ${sourceLabel}`;

  return fields;
}

/**
 * 向多维表格新增一条记录
 */
export async function createRecord(
  appToken: string,
  tableId: string,
  fields: Record<string, any>,
  tenantToken: string
): Promise<string> {
  const resp = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tenantToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );

  const data = await resp.json() as any;
  if (data.code !== 0) {
    throw new Error(`写入记录失败 (code: ${data.code}): ${data.msg}`);
  }

  const recordId = data.data?.record?.record_id;
  console.log(`[Feishu] 新增记录成功: ${recordId}`);
  return recordId;
}

// ==================== 配置管理 ====================

// 运行时配置存储（内存）
let feishuConfig: FeishuConfig | null = null;
// 缓存解析后的真实 app_token（wiki token → bitable app_token）
let resolvedAppToken: string | null = null;

/**
 * 获取当前飞书配置
 */
export function getFeishuConfig(): FeishuConfig | null {
  return feishuConfig;
}

/**
 * 设置飞书配置
 */
export function setFeishuConfig(config: FeishuConfig): void {
  feishuConfig = config;
  resolvedAppToken = null; // 清除缓存，下次使用时重新解析
  console.log(`[Feishu] 配置已更新, enabled: ${config.enabled}`);
}

/**
 * 从环境变量初始化配置（仅在运行时配置为空时使用）
 */
export function initFeishuConfigFromEnv(env: Record<string, string>): void {
  if (feishuConfig) return; // 运行时配置优先

  const appId = env.FEISHU_APP_ID;
  const appSecret = env.FEISHU_APP_SECRET;
  const appToken = env.FEISHU_APP_TOKEN;
  const tableId = env.FEISHU_TABLE_ID;

  if (appId && appSecret && appToken && tableId) {
    feishuConfig = {
      appId,
      appSecret,
      appToken,
      tableId,
      enabled: env.FEISHU_ENABLED !== 'false', // 默认启用
    };
    console.log('[Feishu] 从环境变量初始化配置成功');
  }
}

// ==================== 主入口 ====================

/**
 * 同步岗位数据到飞书多维表格
 * 
 * 这是对外暴露的主方法，在 job.ts 中解析完成后调用
 * 自动处理：获取 token → wiki 转换 → 字段映射 → 写入记录
 */
export async function syncJobToFeishu(job: Job): Promise<FeishuSyncResult> {
  const startTime = Date.now();

  try {
    if (!feishuConfig || !feishuConfig.enabled) {
      return { success: false, error: '飞书同步未启用' };
    }

    const { appId, appSecret, appToken, tableId } = feishuConfig;

    // 1. 获取 tenant_access_token
    const tenantToken = await getTenantAccessToken(appId, appSecret);

    // 2. 解析 app_token（wiki token 需要转换）
    if (!resolvedAppToken) {
      try {
        // 先尝试直接使用（非 wiki 场景）
        await getTableFields(appToken, tableId, tenantToken);
        resolvedAppToken = appToken;
      } catch {
        // 直接使用失败，尝试作为 wiki token 转换
        console.log('[Feishu] 直接 app_token 无效，尝试 wiki token 转换...');
        try {
          resolvedAppToken = await resolveWikiToken(appToken, tenantToken);
        } catch (wikiErr) {
          throw new Error(
            `app_token 无效且 wiki token 转换失败。` +
            `如果你的多维表格在知识库中，请确保应用已开通 wiki:wiki:readonly 权限。` +
            `原始错误: ${wikiErr instanceof Error ? wikiErr.message : String(wikiErr)}`
          );
        }
      }
    }

    // 3. 映射 Job → 飞书字段
    const fields = mapJobToFeishuFields(job);

    // 4. 写入记录
    const recordId = await createRecord(resolvedAppToken, tableId, fields, tenantToken);

    const duration = Date.now() - startTime;
    console.log(`[Feishu] 同步完成: ${job.title} @ ${job.company}, 耗时 ${duration}ms`);

    return { success: true, recordId, duration_ms: duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Feishu] 同步失败: ${errorMsg}`);
    return { success: false, error: errorMsg, duration_ms: duration };
  }
}

/**
 * 测试飞书连接（验证配置是否正确）
 */
export async function testFeishuConnection(config?: FeishuConfig): Promise<{
  success: boolean;
  message: string;
  fields?: FeishuField[];
  resolvedAppToken?: string;
}> {
  const cfg = config || feishuConfig;
  if (!cfg) {
    return { success: false, message: '未配置飞书信息' };
  }

  try {
    // 1. 测试 token 获取
    const tenantToken = await getTenantAccessToken(cfg.appId, cfg.appSecret);

    // 2. 解析 app_token
    let actualAppToken = cfg.appToken;
    try {
      await getTableFields(actualAppToken, cfg.tableId, tenantToken);
    } catch {
      // 尝试 wiki 转换
      console.log('[Feishu] 测试: 尝试 wiki token 转换...');
      actualAppToken = await resolveWikiToken(cfg.appToken, tenantToken);
    }

    // 3. 获取字段列表
    const fields = await getTableFields(actualAppToken, cfg.tableId, tenantToken);

    return {
      success: true,
      message: `连接成功！表格共 ${fields.length} 个字段`,
      fields,
      resolvedAppToken: actualAppToken,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
