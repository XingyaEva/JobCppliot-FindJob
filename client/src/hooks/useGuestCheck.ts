import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { LoginScenario } from '../components/LoginPromptModal';

/**
 * 游客态检查 Hook
 * 用于检查用户是否为游客，如果是则显示登录拦截弹层
 */
export function useGuestCheck() {
  const { userState } = useUser();
  const { saveContext } = useNavigation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginScenario, setLoginScenario] = useState<LoginScenario>('save-job');

  /**
   * 检查是否是游客
   * @param scenario 操作场景
   * @returns true=可以继续，false=需要登录
   */
  const checkGuest = (scenario: LoginScenario): boolean => {
    // 如果已登录，直接通过
    if (userState !== 'guest') {
      return true;
    }

    // 保存上下文
    saveContext({
      action: scenarioToAction(scenario),
      data: { scenario },
      returnUrl: window.location.pathname,
    });

    // 显示登录拦截弹层
    setLoginScenario(scenario);
    setShowLoginPrompt(true);
    return false;
  };

  /**
   * 场景转操作类型
   */
  const scenarioToAction = (scenario: LoginScenario): 'save-job' | 'save-resume' | 'save-interview' | 'save-decision' | 'access-growth' | 'upgrade' => {
    switch (scenario) {
      case 'save-job':
        return 'save-job';
      case 'save-resume':
        return 'save-resume';
      case 'start-interview':
        return 'save-interview';
      case 'save-decision':
        return 'save-decision';
      case 'access-growth':
        return 'access-growth';
      default:
        return 'save-job';
    }
  };

  return {
    checkGuest,
    showLoginPrompt,
    setShowLoginPrompt,
    loginScenario,
  };
}
