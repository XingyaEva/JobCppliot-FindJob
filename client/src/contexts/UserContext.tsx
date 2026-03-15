import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../lib/api';

// ==================== 类型定义 ====================

export type UserState = 
  | 'guest'                      // 游客态（未登录）
  | 'logged-in-uninitialized'    // 已登录但未完善资料
  | 'logged-in-initialized'      // 已登录已完善资料
  | 'free-user'                  // 免费用户
  | 'premium-user'               // 会员用户
  | 'quota-exceeded';            // 权益不足用户

export interface UserInfo {
  id?: string;
  phone?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  isFirstLogin?: boolean;
  isInitialized?: boolean;
  isPremium?: boolean;
}

export interface QuotaInfo {
  jobPool: { used: number; limit: number };
  resumeVersions: { used: number; limit: number };
  interviewMocks: { used: number; limit: number };
}

interface UserContextType {
  // 状态
  userState: UserState;
  userInfo: UserInfo | null;
  quotaInfo: QuotaInfo | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  // 方法
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  deleteAccount: () => Promise<boolean>;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  updateQuota: (quota: QuotaInfo) => void;
  checkAuth: () => Promise<boolean>;
}

// ==================== Token 管理 ====================

const TOKEN_KEY = 'findjob_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  // 同时清理旧键（兼容迁移）
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
}

// ==================== Context ====================

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<UserState>('guest');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 计算派生状态
  const isAuthenticated = userState !== 'guest';
  const isAdmin = userInfo?.role === 'admin';

  // 根据 UserInfo 计算 UserState
  const computeUserState = useCallback((info: UserInfo): UserState => {
    if (info.isFirstLogin || !info.isInitialized) {
      return 'logged-in-uninitialized';
    }
    if (info.isPremium) {
      return 'premium-user';
    }
    return 'free-user';
  }, []);

  // 初始化：检查是否已有 token
  useEffect(() => {
    const token = getToken();
    // 兼容旧键
    const legacyToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    
    if (token || legacyToken) {
      // 如果用旧键存的 token，迁移到新键
      if (!token && legacyToken) {
        setToken(legacyToken);
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
      }
      checkAuth().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token: string, info: UserInfo) => {
    setToken(token);
    setUserInfo(info);
    setUserState(computeUserState(info));
  }, [computeUserState]);

  const logout = useCallback(() => {
    clearToken();
    setUserInfo(null);
    setQuotaInfo(null);
    setUserState('guest');
    // 清理旧 Zustand 持久化数据
    localStorage.removeItem('findjob-user');
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      await api.delete('/user/delete');
      logout();
      return true;
    } catch (error) {
      console.error('Delete account failed:', error);
      return false;
    }
  }, [logout]);

  const updateUserInfo = useCallback((info: Partial<UserInfo>) => {
    setUserInfo(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...info };
      // 重新计算状态
      if (info.isInitialized !== undefined || info.isPremium !== undefined) {
        setUserState(computeUserState(updated));
      }
      return updated;
    });
  }, [computeUserState]);

  const updateQuota = useCallback((quota: QuotaInfo) => {
    setQuotaInfo(quota);
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const data = await api.get<{ user: UserInfo }>('/user/status');
      setUserInfo(data.user);
      setUserState(computeUserState(data.user));
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      // 网络错误时不清除登录态，保持当前状态
      return false;
    }
  }, [computeUserState]);

  return (
    <UserContext.Provider value={{
      userState,
      userInfo,
      quotaInfo,
      isAuthenticated,
      isAdmin,
      isLoading,
      login,
      logout,
      deleteAccount,
      updateUserInfo,
      updateQuota,
      checkAuth,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
