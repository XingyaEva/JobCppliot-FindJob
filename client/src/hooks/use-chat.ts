/**
 * FindJob - AI 聊天 Hook
 *
 * 管理消息列表、流式输出、上下文注入
 * 结合 Zustand (消息持久化) + SSE (流式传输)
 */

import { useState, useCallback, useRef } from 'react';
import { streamChat } from '../lib/sse';
import type { ChatMessage } from '../types/api';

interface UseChatOptions {
  /** 当前页面上下文 */
  currentPage?: string;
  /** 页面数据（岗位名、简历信息等） */
  pageData?: Record<string, unknown>;
  /** 最大历史消息数 */
  maxHistory?: number;
  /** localStorage key */
  storageKey?: string;
}

interface UseChatReturn {
  /** 消息列表 */
  messages: ChatMessage[];
  /** 当前正在流式输出的文本 */
  streamingContent: string;
  /** 是否正在等待/生成 */
  isLoading: boolean;
  /** 发送消息 */
  sendMessage: (content: string) => void;
  /** 中断生成 */
  stopGeneration: () => void;
  /** 清空消息 */
  clearMessages: () => void;
  /** 错误信息 */
  error: string | null;
}

/**
 * AI 聊天 Hook
 *
 * @example
 * const { messages, sendMessage, isLoading } = useChat({ currentPage: 'opportunities' });
 * sendMessage('帮我分析这个岗位');
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    currentPage = 'home',
    pageData,
    maxHistory = 20,
    storageKey = 'findjob-chat',
  } = options;

  // 从 localStorage 恢复历史
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 持久化消息
  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(msgs.slice(-maxHistory)));
      } catch {
        // Storage full, ignore
      }
    },
    [storageKey, maxHistory]
  );

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: 'user', content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setStreamingContent('');
      setIsLoading(true);
      setError(null);

      // 创建 AbortController
      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulated = '';

      try {
        await streamChat('/chat', {
          body: {
            messages: newMessages.slice(-maxHistory),
            currentPage,
            pageData,
          },
          signal: controller.signal,
          onMessage: (chunk) => {
            accumulated += chunk;
            setStreamingContent(accumulated);
          },
          onDone: () => {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: accumulated,
            };
            const updatedMessages = [...newMessages, assistantMessage];
            setMessages(updatedMessages);
            persistMessages(updatedMessages);
            setStreamingContent('');
            setIsLoading(false);
          },
          onError: (err) => {
            setError(err.message);
            setIsLoading(false);
            // 即使出错，也保留用户消息
            persistMessages(newMessages);
          },
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // 用户手动中断，保留已生成的内容
          if (accumulated) {
            const partialMessage: ChatMessage = {
              role: 'assistant',
              content: accumulated + '\n\n*[生成已中断]*',
            };
            const updatedMessages = [...newMessages, partialMessage];
            setMessages(updatedMessages);
            persistMessages(updatedMessages);
          }
          setStreamingContent('');
          setIsLoading(false);
        } else {
          setError(String(err));
          setIsLoading(false);
        }
      }
    },
    [messages, isLoading, currentPage, pageData, maxHistory, persistMessages]
  );

  // 中断生成
  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // 清空消息
  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    messages,
    streamingContent,
    isLoading,
    sendMessage,
    stopGeneration,
    clearMessages,
    error,
  };
}

export default useChat;
