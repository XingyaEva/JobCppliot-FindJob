/**
 * Python PDF Parser 客户端
 * 调用独立的 Python 微服务进行 PDF 解析
 */

// 配置 Python 微服务 URL
// 从环境变量读取，在 wrangler.jsonc 中配置
// @ts-ignore - Cloudflare Workers 环境变量
const PYTHON_SERVICE_URL = globalThis.PYTHON_SERVICE_URL || 'https://pdf-parser-service-production.up.railway.app';

export interface PythonParseResult {
  success: boolean;
  text?: string;
  pages?: number;
  duration_ms?: number;
  file_size?: number;
  method?: string;
  error?: string;
  is_scanned?: boolean;
  sample_text_length?: number;
  has_images?: boolean;
}

/**
 * 使用 Python 服务快速解析 PDF
 */
export async function parsePDFWithPython(
  fileBuffer: ArrayBuffer,
  fileName: string
): Promise<PythonParseResult> {
  try {
    console.log(`[Python Service] 调用解析服务: ${PYTHON_SERVICE_URL}/parse`);
    
    // 构建 FormData
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), fileName);
    
    // 调用 Python 服务
    const response = await fetch(`${PYTHON_SERVICE_URL}/parse`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[Python Service] 解析完成: ${result.pages} 页, ${result.duration_ms}ms`);
    
    return result;
  } catch (error) {
    console.error('[Python Service] 调用失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 快速分析 PDF 类型（不提取全文）
 */
export async function analyzePDFType(
  fileBuffer: ArrayBuffer,
  fileName: string
): Promise<PythonParseResult> {
  try {
    console.log(`[Python Service] 分析 PDF 类型: ${fileName}`);
    
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), fileName);
    
    const response = await fetch(`${PYTHON_SERVICE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log(`[Python Service] 分析完成: ${result.is_scanned ? '扫描件' : '数字PDF'}`);
    
    return result;
  } catch (error) {
    console.error('[Python Service] 分析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 检查 Python 服务健康状态
 */
export async function checkPythonServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5秒超时
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.warn('[Python Service] 健康检查失败:', error);
    return false;
  }
}
