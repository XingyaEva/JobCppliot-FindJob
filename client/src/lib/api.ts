/**
 * FindJob - 统一 API 请求层
 * 
 * 所有前端 API 调用通过此模块发出。
 * - 自动注入 Authorization header（后续接入用户体系）
 * - 统一错误处理 & toast 通知
 * - 支持泛型响应类型
 * - 开发环境通过 vite proxy 转发到 localhost:8787
 */

// ==================== 配置 ====================

import { toast } from 'sonner';

const API_BASE = '/api';

// ==================== 类型 ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** 跳过自动错误提示 */
  silent?: boolean;
  /** 超时时间 (ms)，默认 30s */
  timeout?: number;
}

// ==================== 工具函数 ====================

/**
 * 构建带 query string 的 URL
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = `${API_BASE}${path}`;
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * 获取认证 token — 从统一的 UserContext token 管理读取
 */
function getAuthToken(): string | null {
  return localStorage.getItem('findjob_token');
}

/**
 * 构建通用 headers
 */
function buildHeaders(options?: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 合并自定义 headers
  if (options?.headers) {
    const customHeaders = options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : options.headers as Record<string, string>;
    Object.assign(headers, customHeaders);
  }

  return headers;
}

// ==================== 核心请求函数 ====================

/**
 * 通用 API 请求
 * @example
 * const jobs = await request<Job[]>('/jobs');
 * const job = await request<Job>('/job/123');
 * const result = await request<Job>('/job/parse', { method: 'POST', body: { content: '...' } });
 */
export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, silent, timeout = 30000, ...fetchOptions } = options;

  const url = buildUrl(path, params);
  const headers = buildHeaders(options);

  // 构建 fetch options
  const init: RequestInit = {
    ...fetchOptions,
    headers,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  // 超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  init.signal = controller.signal;

  try {
    const response = await fetch(url, init);
    clearTimeout(timeoutId);

    // 处理非 JSON 响应
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      if (!response.ok) {
        throw createApiError(response.status, `请求失败: ${response.statusText}`);
      }
      return response as unknown as T;
    }

    const json = await response.json();

    if (!response.ok) {
      const errorMessage = json?.error || json?.message || `请求失败 (${response.status})`;
      throw createApiError(response.status, errorMessage, json);
    }

    // 后端统一返回 { success, data, error } 格式
    // 某些接口直接返回数据（如 GET /jobs 返回数组）
    if (json && typeof json === 'object' && 'success' in json) {
      if (!json.success) {
        throw createApiError(response.status, json.error || '操作失败', json);
      }
      // 如果有 data 字段，返回 data；否则返回整个 json
      return (json.data !== undefined ? json.data : json) as T;
    }

    return json as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      const apiError = createApiError(408, '请求超时，请重试');
      if (!silent) notifyError(apiError);
      throw apiError;
    }

    if (isApiError(error)) {
      if (!silent) notifyError(error);
      throw error;
    }

    // 网络错误等
    const apiError = createApiError(0, '网络连接失败，请检查网络');
    if (!silent) notifyError(apiError);
    throw apiError;
  }
}

// ==================== 快捷方法 ====================

export const api = {
  get<T = unknown>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'POST', body });
  },

  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },

  delete<T = unknown>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },

  /**
   * 上传文件（FormData）
   */
  async upload<T = unknown>(path: string, formData: FormData, options?: RequestOptions) {
    const { params, silent, timeout = 120000, ...fetchOptions } = options || {};
    const url = buildUrl(path, params);

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // 注意：不设置 Content-Type，让浏览器自动设置 multipart/form-data

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok || (json && !json.success)) {
        const errorMessage = json?.error || '上传失败';
        throw createApiError(response.status, errorMessage, json);
      }

      return (json.data !== undefined ? json.data : json) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (!silent && isApiError(error)) notifyError(error);
      throw error;
    }
  },
};

// ==================== 错误处理 ====================

function createApiError(status: number, message: string, details?: unknown): ApiError {
  return { status, message, details };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
}

/**
 * 错误通知 — 使用 sonner toast
 * 在 App 中初始化 Toaster 后即可生效
 */
function notifyError(error: ApiError) {
  // 401 → 提示登录
  if (error.status === 401) {
    toast.error('请先登录', { description: '会话已过期，请重新登录' });
    // TODO: 跳转登录页
    return;
  }
  // 403 → 权限不足
  if (error.status === 403) {
    toast.error('权限不足', { description: error.message });
    return;
  }
  // 其他错误
  toast.error('操作失败', { description: error.message });
}

export default api;
