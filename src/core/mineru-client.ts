/**
 * MinerU API 客户端
 * 
 * 用于 PDF/Word/PPT 文档解析，输出 Markdown 格式
 * 文档：https://mineru.net/doc/docs/
 */

// MinerU API 配置
const MINERU_CONFIG = {
  baseUrl: 'https://mineru.net/api/v4',
  token: 'eyJ0eXBlIjoiSldUIiwiYWxnIjoiSFM1MTIifQ.eyJqdGkiOiI2NDkwMDA0OSIsInJvbCI6IlJPTEVfUkVHSVNURVIiLCJpc3MiOiJPcGVuWExhYiIsImlhdCI6MTc2ODM3Mjk0OCwiY2xpZW50SWQiOiJsa3pkeDU3bnZ5MjJqa3BxOXgydyIsInBob25lIjoiMTk1MjA2MDYzMDUiLCJvcGVuSWQiOm51bGwsInV1aWQiOiIxNGFhODBkOC00YmMyLTRlYTYtYmYwZi01NDRmOGIwZDQyNDkiLCJlbWFpbCI6IiIsImV4cCI6MTc2OTU4MjU0OH0.m0JXHpkiArXDCgLAxt0LSOZm6LEzI7h56yh3JMReRokGCGMXc3p9hmw_iJdKRbaG-7XHNQ0ftlAP_AyGaPAEVQ',
  // 轮询配置
  pollInterval: 1000,  // 1秒轮询一次（Phase 1 优化：加快轮询速度）
  maxPollAttempts: 120, // 最多轮询120次（2分钟）
};

/** 任务状态 */
export type MinerUTaskState = 'pending' | 'running' | 'done' | 'failed' | 'converting' | 'waiting-file';

/** 解析进度 */
export interface ExtractProgress {
  extracted_pages: number;
  total_pages: number;
  start_time: string;
}

/** 创建任务响应 */
export interface CreateTaskResponse {
  code: number;
  msg: string;
  trace_id: string;
  data: {
    task_id: string;
  };
}

/** 批量上传响应 */
export interface BatchUploadResponse {
  code: number;
  msg: string;
  trace_id: string;
  data: {
    batch_id: string;
    file_urls: string[];
  };
}

/** 任务结果响应 */
export interface TaskResultResponse {
  code: number;
  msg: string;
  trace_id: string;
  data: {
    task_id: string;
    data_id?: string;
    state: MinerUTaskState;
    full_zip_url?: string;
    err_msg?: string;
    extract_progress?: ExtractProgress;
  };
}

/** 批量任务结果响应 */
export interface BatchResultResponse {
  code: number;
  msg: string;
  trace_id: string;
  data: {
    batch_id: string;
    extract_result: Array<{
      file_name: string;
      state: MinerUTaskState;
      full_zip_url?: string;
      err_msg?: string;
      data_id?: string;
      extract_progress?: ExtractProgress;
    }>;
  };
}

/** 解析选项 */
export interface ParseOptions {
  /** 
   * 是否开启 OCR
   * 默认 true - 简历通常有复杂的头部布局（姓名、照片、联系方式区域），OCR 模式能更好识别
   * 注意：VLM 模型可能跳过特殊排版区域，导致个人信息丢失
   */
  isOcr?: boolean;
  /** 是否开启公式识别 */
  enableFormula?: boolean;
  /** 是否开启表格识别 */
  enableTable?: boolean;
  /** 语言，默认 ch */
  language?: string;
  /** 页码范围，如 "1-10" */
  pageRanges?: string;
  /** 模型版本：pipeline 或 vlm */
  modelVersion?: 'pipeline' | 'vlm';
}

/** 解析结果 */
export interface ParseResult {
  success: boolean;
  markdown?: string;
  zipUrl?: string;
  error?: string;
  taskId?: string;
  progress?: {
    state: MinerUTaskState;
    extractedPages?: number;
    totalPages?: number;
  };
}

/**
 * 获取请求头
 */
function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MINERU_CONFIG.token}`,
  };
}

/**
 * 通过 URL 创建解析任务
 */
export async function createTaskByUrl(
  fileUrl: string,
  options: ParseOptions = {}
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  try {
    const response = await fetch(`${MINERU_CONFIG.baseUrl}/extract/task`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        url: fileUrl,
        // 默认开启 OCR：简历头部通常有复杂布局（姓名+照片+联系方式），VLM 可能跳过导致丢失个人信息
        is_ocr: options.isOcr ?? true,
        enable_formula: options.enableFormula ?? false,  // 简历一般不需要公式
        enable_table: options.enableTable ?? true,       // 简历可能有技能表格
        language: options.language ?? 'ch',
        page_ranges: options.pageRanges,
        model_version: options.modelVersion ?? 'vlm',    // VLM 模型效果更好
      }),
    });

    const result: CreateTaskResponse = await response.json();
    
    if (result.code !== 0) {
      console.error('[MinerU] 创建任务失败:', result.msg);
      return { success: false, error: result.msg };
    }

    console.log('[MinerU] 任务创建成功, task_id:', result.data.task_id);
    return { success: true, taskId: result.data.task_id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    console.error('[MinerU] 创建任务异常:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 申请批量上传 URL（用于前端直传）
 */
export async function requestUploadUrls(
  files: Array<{ name: string; dataId?: string; isOcr?: boolean; pageRanges?: string }>,
  options: ParseOptions = {}
): Promise<{ success: boolean; batchId?: string; uploadUrls?: string[]; error?: string }> {
  try {
    const response = await fetch(`${MINERU_CONFIG.baseUrl}/file-urls/batch`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        files: files.map(f => ({
          name: f.name,
          data_id: f.dataId,
          // 默认开启 OCR：解决简历头部特殊布局导致的信息丢失问题
          is_ocr: f.isOcr ?? options.isOcr ?? true,
          page_ranges: f.pageRanges ?? options.pageRanges,
        })),
        enable_formula: options.enableFormula ?? false,
        enable_table: options.enableTable ?? true,
        language: options.language ?? 'ch',
        model_version: options.modelVersion ?? 'vlm',
      }),
    });

    const result: BatchUploadResponse = await response.json();
    
    if (result.code !== 0) {
      console.error('[MinerU] 申请上传URL失败:', result.msg);
      return { success: false, error: result.msg };
    }

    console.log('[MinerU] 上传URL申请成功, batch_id:', result.data.batch_id);
    return {
      success: true,
      batchId: result.data.batch_id,
      uploadUrls: result.data.file_urls,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    console.error('[MinerU] 申请上传URL异常:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 查询单个任务结果
 */
export async function getTaskResult(taskId: string): Promise<TaskResultResponse> {
  const response = await fetch(`${MINERU_CONFIG.baseUrl}/extract/task/${taskId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
}

/**
 * 查询批量任务结果
 */
export async function getBatchResult(batchId: string): Promise<BatchResultResponse> {
  const response = await fetch(`${MINERU_CONFIG.baseUrl}/extract-results/batch/${batchId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return response.json();
}

/**
 * 轮询等待任务完成
 */
export async function waitForTaskCompletion(
  taskId: string,
  onProgress?: (progress: { state: MinerUTaskState; extractedPages?: number; totalPages?: number }) => void
): Promise<ParseResult> {
  let attempts = 0;
  
  while (attempts < MINERU_CONFIG.maxPollAttempts) {
    attempts++;
    
    try {
      const result = await getTaskResult(taskId);
      
      if (result.code !== 0) {
        return { success: false, error: result.msg, taskId };
      }

      const { state, full_zip_url, err_msg, extract_progress } = result.data;
      
      // 报告进度
      if (onProgress) {
        onProgress({
          state,
          extractedPages: extract_progress?.extracted_pages,
          totalPages: extract_progress?.total_pages,
        });
      }

      // 检查状态
      if (state === 'done') {
        // 下载并解析 Markdown
        if (full_zip_url) {
          const markdown = await downloadAndExtractMarkdown(full_zip_url);
          return {
            success: true,
            markdown,
            zipUrl: full_zip_url,
            taskId,
            progress: { state },
          };
        }
        return { success: false, error: '解析完成但未返回结果URL', taskId };
      }

      if (state === 'failed') {
        return { success: false, error: err_msg || '解析失败', taskId };
      }

      // 继续等待
      console.log(`[MinerU] 任务 ${taskId} 状态: ${state}, 进度: ${extract_progress?.extracted_pages || 0}/${extract_progress?.total_pages || '?'}`);
      await sleep(MINERU_CONFIG.pollInterval);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('[MinerU] 轮询异常:', errorMsg);
      // 继续重试
      await sleep(MINERU_CONFIG.pollInterval);
    }
  }

  return { success: false, error: '解析超时，请稍后重试', taskId };
}

/**
 * 轮询等待批量任务完成（单文件）
 */
export async function waitForBatchCompletion(
  batchId: string,
  fileName: string,
  onProgress?: (progress: { state: MinerUTaskState; extractedPages?: number; totalPages?: number }) => void
): Promise<ParseResult> {
  let attempts = 0;
  
  while (attempts < MINERU_CONFIG.maxPollAttempts) {
    attempts++;
    
    try {
      const result = await getBatchResult(batchId);
      
      if (result.code !== 0) {
        return { success: false, error: result.msg };
      }

      // 找到对应文件的结果
      const fileResult = result.data.extract_result.find(r => r.file_name === fileName);
      
      if (!fileResult) {
        // 可能还在等待上传
        console.log(`[MinerU] 批量任务 ${batchId} 等待文件 ${fileName} 上传...`);
        await sleep(MINERU_CONFIG.pollInterval);
        continue;
      }

      const { state, full_zip_url, err_msg, extract_progress } = fileResult;
      
      // 报告进度
      if (onProgress) {
        onProgress({
          state,
          extractedPages: extract_progress?.extracted_pages,
          totalPages: extract_progress?.total_pages,
        });
      }

      // 检查状态
      if (state === 'done') {
        if (full_zip_url) {
          const markdown = await downloadAndExtractMarkdown(full_zip_url);
          return {
            success: true,
            markdown,
            zipUrl: full_zip_url,
            progress: { state },
          };
        }
        return { success: false, error: '解析完成但未返回结果URL' };
      }

      if (state === 'failed') {
        return { success: false, error: err_msg || '解析失败' };
      }

      // 继续等待
      console.log(`[MinerU] 批量任务 ${batchId} 文件 ${fileName} 状态: ${state}`);
      await sleep(MINERU_CONFIG.pollInterval);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('[MinerU] 批量轮询异常:', errorMsg);
      await sleep(MINERU_CONFIG.pollInterval);
    }
  }

  return { success: false, error: '解析超时，请稍后重试' };
}

/**
 * 下载 ZIP 并提取 Markdown 内容
 */
async function downloadAndExtractMarkdown(zipUrl: string): Promise<string> {
  try {
    // 注意：Cloudflare Workers 环境无法解压 ZIP
    // 这里我们返回 ZIP URL，让调用方决定如何处理
    // 或者可以直接请求 .md 文件（MinerU 的 ZIP 中包含同名 .md 文件）
    
    // MinerU 的输出结构：
    // - {filename}.md - Markdown 文件
    // - {filename}_content_list.json - 内容列表
    // - images/ - 图片目录
    
    // 尝试直接获取 Markdown 文件
    // ZIP URL 格式: https://cdn-mineru.openxlab.org.cn/pdf/{uuid}.zip
    // 对应的 MD 可能在: https://cdn-mineru.openxlab.org.cn/pdf/{uuid}/{filename}.md
    
    // 由于无法直接获取，我们暂时返回 ZIP URL
    // 后续可以通过服务端代理或其他方式处理
    console.log('[MinerU] ZIP 下载地址:', zipUrl);
    
    // 尝试获取 ZIP 内容并解析
    const response = await fetch(zipUrl);
    if (!response.ok) {
      throw new Error(`下载 ZIP 失败: ${response.status}`);
    }

    // 获取 ZIP 的 ArrayBuffer
    const zipBuffer = await response.arrayBuffer();
    
    // 使用简单的 ZIP 解析（仅提取 .md 文件）
    const markdown = await extractMarkdownFromZip(zipBuffer);
    
    if (markdown) {
      return markdown;
    }

    // 如果解析失败，返回提示信息
    return `[MinerU 解析完成]\n\n结果文件: ${zipUrl}\n\n请下载 ZIP 文件查看完整内容。`;
    
  } catch (error) {
    console.error('[MinerU] 下载/解析 ZIP 失败:', error);
    return `[MinerU 解析完成]\n\n结果文件: ${zipUrl}\n\n自动提取失败，请手动下载查看。`;
  }
}

/**
 * 从 ZIP Buffer 中提取 Markdown 内容
 * 简化版 ZIP 解析，仅支持未压缩或 DEFLATE 压缩的 .md 文件
 */
async function extractMarkdownFromZip(zipBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const data = new Uint8Array(zipBuffer);
    const files: { name: string; content: Uint8Array }[] = [];
    
    let offset = 0;
    
    // 遍历 ZIP 文件条目
    while (offset < data.length - 4) {
      // 检查本地文件头签名 (0x04034b50)
      if (data[offset] !== 0x50 || data[offset + 1] !== 0x4b ||
          data[offset + 2] !== 0x03 || data[offset + 3] !== 0x04) {
        break;
      }
      
      // 解析本地文件头
      const compressionMethod = data[offset + 8] | (data[offset + 9] << 8);
      const compressedSize = data[offset + 18] | (data[offset + 19] << 8) |
                            (data[offset + 20] << 16) | (data[offset + 21] << 24);
      const uncompressedSize = data[offset + 22] | (data[offset + 23] << 8) |
                              (data[offset + 24] << 16) | (data[offset + 25] << 24);
      const fileNameLength = data[offset + 26] | (data[offset + 27] << 8);
      const extraFieldLength = data[offset + 28] | (data[offset + 29] << 8);
      
      // 获取文件名
      const fileNameBytes = data.slice(offset + 30, offset + 30 + fileNameLength);
      const fileName = new TextDecoder().decode(fileNameBytes);
      
      // 计算数据开始位置
      const dataStart = offset + 30 + fileNameLength + extraFieldLength;
      
      // 只处理 .md 文件
      if (fileName.endsWith('.md') && !fileName.includes('/')) {
        const compressedData = data.slice(dataStart, dataStart + compressedSize);
        
        if (compressionMethod === 0) {
          // 未压缩
          files.push({ name: fileName, content: compressedData });
        } else if (compressionMethod === 8) {
          // DEFLATE 压缩 - 使用 DecompressionStream
          try {
            const decompressed = await decompressDeflate(compressedData);
            files.push({ name: fileName, content: decompressed });
          } catch (e) {
            console.warn('[MinerU] DEFLATE 解压失败:', fileName);
          }
        }
      }
      
      // 移动到下一个条目
      offset = dataStart + compressedSize;
    }
    
    // 返回第一个 .md 文件的内容
    if (files.length > 0) {
      return new TextDecoder('utf-8').decode(files[0].content);
    }
    
    return null;
  } catch (error) {
    console.error('[MinerU] ZIP 解析错误:', error);
    return null;
  }
}

/**
 * 使用 DecompressionStream 解压 DEFLATE 数据
 */
async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  // 添加 zlib 头（用于 deflate-raw）
  const stream = new DecompressionStream('deflate-raw');
  const writer = stream.writable.getWriter();
  writer.write(data);
  writer.close();
  
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // 合并所有块
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 一站式 PDF 解析（通过 URL）
 * 
 * @example
 * const result = await parseDocumentByUrl('https://example.com/resume.pdf');
 * if (result.success) {
 *   console.log(result.markdown);
 * }
 */
export async function parseDocumentByUrl(
  fileUrl: string,
  options: ParseOptions = {},
  onProgress?: (progress: { state: MinerUTaskState; extractedPages?: number; totalPages?: number }) => void
): Promise<ParseResult> {
  // 1. 创建任务
  const createResult = await createTaskByUrl(fileUrl, options);
  if (!createResult.success || !createResult.taskId) {
    return { success: false, error: createResult.error };
  }

  // 2. 等待完成
  return waitForTaskCompletion(createResult.taskId, onProgress);
}

/**
 * 获取上传 URL 并等待解析完成（用于前端直传场景）
 */
export async function getUploadUrlAndParse(
  fileName: string,
  options: ParseOptions = {}
): Promise<{
  success: boolean;
  uploadUrl?: string;
  batchId?: string;
  error?: string;
}> {
  const result = await requestUploadUrls([{ name: fileName }], options);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    uploadUrl: result.uploadUrls?.[0],
    batchId: result.batchId,
  };
}
