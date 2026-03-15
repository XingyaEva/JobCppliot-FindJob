import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '../contexts/NavigationContext';
import api from '../lib/api';

export type UpgradeScenario = 'job-pool' | 'resume-version' | 'interview-mock' | 'ai-analysis';

/**
 * 额度检查 Hook
 * 用于检查用户是否超出权益额度，并触发拦截弹层
 */
export function useQuotaCheck() {
  const { userInfo, quotaInfo, updateQuota } = useUser();
  const { saveContext } = useNavigation();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeScenario, setUpgradeScenario] = useState<UpgradeScenario>('job-pool');

  /**
   * 检查额度是否充足
   * @param type 额度类型
   * @returns true=可以继续，false=需要升级
   */
  const checkQuota = async (type: 'job-pool' | 'resume-version' | 'interview-mock'): Promise<boolean> => {
    // 如果是会员，直接通过
    if (userInfo?.isPremium) {
      return true;
    }

    try {
      // 获取最新额度
      const quota = await api.get<{
        jobPool: { used: number; limit: number };
        resumeVersions: { used: number; limit: number };
        interviewMocks: { used: number; limit: number };
      }>('/user/quota');
      
      updateQuota(quota);

      // 检查是否超额
      let exceeded = false;
      let scenario: UpgradeScenario = 'job-pool';

      switch (type) {
        case 'job-pool':
          exceeded = quota.jobPool.used >= quota.jobPool.limit;
          scenario = 'job-pool';
          break;
        case 'resume-version':
          exceeded = quota.resumeVersions.used >= quota.resumeVersions.limit;
          scenario = 'resume-version';
          break;
        case 'interview-mock':
          exceeded = quota.interviewMocks.used >= quota.interviewMocks.limit;
          scenario = 'interview-mock';
          break;
      }

      if (exceeded) {
        // 保存上下文
        saveContext({
          action: 'upgrade',
          data: { scenario },
          returnUrl: window.location.pathname,
        });

        // 显示拦截弹层
        setUpgradeScenario(scenario);
        setShowUpgradeModal(true);
        return false;
      }
    } catch (error) {
      console.error('Quota check failed:', error);
    }

    return true;
  };

  return {
    checkQuota,
    showUpgradeModal,
    setShowUpgradeModal,
    upgradeScenario,
  };
}
