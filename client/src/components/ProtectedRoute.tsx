import { Navigate, useLocation } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ReactNode, useEffect, useRef } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireInitialized?: boolean;
  requirePremium?: boolean;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireInitialized = false,
  requirePremium = false,
}: ProtectedRouteProps) {
  const { userState, userInfo } = useUser();
  const { saveContext } = useNavigation();
  const location = useLocation();
  const contextSaved = useRef(false);

  // 检查是否需要登录
  const needsAuth = requireAuth && userState === 'guest';
  
  // 在effect中保存上下文，避免在渲染时setState
  useEffect(() => {
    if (needsAuth && !contextSaved.current) {
      saveContext({
        action: 'upgrade',
        returnUrl: location.pathname,
      });
      contextSaved.current = true;
    }
  }, [needsAuth, location.pathname, saveContext]);

  if (needsAuth) {
    return <Navigate to="/login" replace />;
  }

  // 检查是否需要初始化
  if (requireInitialized && !userInfo?.isInitialized) {
    return <Navigate to="/welcome" replace />;
  }

  // 检查是否需要会员权限
  if (requirePremium && !userInfo?.isPremium) {
    // 跳转到会员页
    return <Navigate to="/membership" replace />;
  }

  return <>{children}</>;
}
