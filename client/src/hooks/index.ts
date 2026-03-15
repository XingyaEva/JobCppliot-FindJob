/**
 * FindJob - Hooks barrel export
 */

// 岗位
export {
  useJobs,
  useJob,
  useJobStatus,
  useParseJD,
  useParseJDSync,
  useParseJDAsync,
  useParseJDUrl,
  useUpdateJob,
  useDeleteJob,
} from './use-jobs';

// 简历
export {
  useResumes,
  useResume,
  useResumeVersions,
  useResumesByJob,
  useResumeProgress,
  useUploadResume,
  useParseResumeText,
  useUpdateResume,
  useDeleteResume,
  useCreateResumeVersion,
  useLinkResumeToJob,
  useUnlinkResumeFromJob,
} from './use-resumes';
export type { ResumeVersion, ResumeListResponse, ParseProgress } from './use-resumes';

// 匹配
export {
  useMatchResult,
  useEvaluateMatch,
} from './use-match';

// 面试 & 题库
export {
  useInterviewPrep,
  useGenerateInterviewPrep,
  useCompanyAnalysis,
  useGenerateCompanyAnalysis,
  useQuestions,
  useQuestionAnswers,
  useSubmitAnswer,
  useRequestFeedback,
  useImportFromInterview,
  useSuggestQuestions,
} from './use-interview';

// 简历优化
export {
  useOptimizeResult,
  useGenerateResume,
  useRegenerateResume,
} from './use-optimize';

// AI 聊天
export { useChat } from './use-chat';

// Dashboard
export {
  useDashboardSummary,
  useDashboardFunnel,
  useDashboardActivityTrend,
  useDashboardSkillRadar,
  useDashboardActivities,
  useDashboardInsights,
  useWeeklyGoals,
  useUpdateWeeklyGoal,
  useCreateWeeklyGoal,
  useDeleteWeeklyGoal,
} from './use-dashboard';

// 待办事项
export {
  useTodos,
  useCreateTodo,
  useUpdateTodo,
  useCompleteTodo,
  useDismissTodo,
  useDeleteTodo,
} from './use-todos';

// 投递记录 / Offer
export {
  useApplications,
  useApplication,
  useApplicationStats,
  useCreateApplication,
  useCreateApplicationFromJob,
  useUpdateApplication,
  useUpdateApplicationStatus,
  useDeleteApplication,
  useAddInterview,
} from './use-applications';
