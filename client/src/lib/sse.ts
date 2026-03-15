/**
 * FindJob - SSE 流式请求工具
 *
 * 用于 AI 对话等需要流式返回的场景
 * 兼容后端 POST /api/chat 的 SSE 响应格式
 */

export interface SSEMessage {
  /** 原始事件类型 (默认 'message') */
  event?: string;
  /** 数据内容 */
  data: string;
  /** 事件 ID */
  id?: string;
}

export interface StreamChatOptions {
  /** 请求体 */
  body: unknown;
  /** 每收到一段文本时回调 */
  onMessage: (content: string) => void;
  /** 流结束后回调 */
  onDone?: () => void;
  /** 出错时回调 */
  onError?: (error: Error) => void;
  /** AbortController 用于中断 */
  signal?: AbortSignal;
}

/**
 * 流式调用 AI 对话接口
 * 后端返回标准 SSE 格式:
 *   data: {"choices":[{"delta":{"content":"xxx"}}]}
 *   data: [DONE]
 */
export async function streamChat(
  path: string,
  options: StreamChatOptions
): Promise<void> {
  const { body, onMessage, onDone, onError, signal } = options;

  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`/api${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SSE 请求失败 (${response.status}): ${errorText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按行解析 SSE
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 最后一行可能不完整，保留到下次

      for (const line of lines) {
        const trimmed = line.trim();

        // 空行 = 事件分隔符
        if (!trimmed) continue;

        // 解析 data: 前缀
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);

          // [DONE] 标记
          if (data === '[DONE]') {
            onDone?.();
            return;
          }

          // 尝试解析 JSON（兼容 OpenAI / 百炼 格式）
          try {
            const json = JSON.parse(data);

            // 标准 OpenAI 格式: choices[0].delta.content
            const content =
              json?.choices?.[0]?.delta?.content ??
              json?.content ??
              json?.text ??
              null;

            if (content) {
              onMessage(content);
            }
          } catch {
            // 非 JSON 格式，直接当作文本
            if (data && data !== 'undefined') {
              onMessage(data);
            }
          }
        }
      }
    }

    // 流正常结束
    onDone?.();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      // 用户手动中断，不报错
      onDone?.();
      return;
    }
    onError?.(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 通用 SSE 事件监听器
 * 适用于 GET /api/xxx 类型的事件流（如进度推送）
 */
export function createEventSource(
  path: string,
  handlers: {
    onMessage?: (data: string) => void;
    onError?: (error: Event) => void;
    onOpen?: () => void;
  }
): EventSource {
  const url = `/api${path}`;
  const eventSource = new EventSource(url);

  if (handlers.onMessage) {
    eventSource.onmessage = (event) => {
      handlers.onMessage!(event.data);
    };
  }

  if (handlers.onError) {
    eventSource.onerror = handlers.onError;
  }

  if (handlers.onOpen) {
    eventSource.onopen = handlers.onOpen;
  }

  return eventSource;
}

export default streamChat;
