/**
 * OpportunitiesPage — 机会工作台
 *
 * A2 全链路 API 接入版本:
 * - 岗位列表通过 useJobs() 从后端获取
 * - 岗位详情通过 useJob(id) 获取
 * - 新增岗位通过 useParseJD / useParseJDUrl / useParseJDAsync 调用后端 DAG
 * - 支持 Loading / Empty / Error 状态
 * - 详情 Tab 展示 structured_jd, a_analysis, b_analysis 真实数据
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  MapPin,
  DollarSign,
  Building,
  ExternalLink,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  Target,
  MessageSquare,
  BarChart3,
  Clock,
  MoreVertical,
  MoreHorizontal,
  Heart,
  Grid,
  List,
  X,
  Upload,
  Link as LinkIcon,
  AlignLeft,
  Loader2,
  RefreshCw,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { useJobs, useJob, useParseJD, useParseJDAsync, useParseJDUrl, useDeleteJob } from "../hooks";
import { useJobStore } from "../stores";
import { useGuestCheck } from "../hooks/useGuestCheck";
import { useQuotaCheck } from "../hooks/useQuotaCheck";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { UpgradeInterceptModal } from "../components/UpgradeInterceptModal";
import type { Job } from "../types/api";
import { toast } from "sonner";

// ==================== 工具函数 ====================

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString("zh-CN");
  } catch {
    return dateStr;
  }
}

function getStatusColor(status: Job["status"]): string {
  switch (status) {
    case "completed": return "bg-green-50 text-green-700";
    case "processing": return "bg-blue-50 text-blue-700";
    case "pending": return "bg-orange-50 text-orange-700";
    case "error": return "bg-red-50 text-red-700";
    default: return "bg-secondary text-foreground";
  }
}

function getStatusLabel(status: Job["status"]): string {
  switch (status) {
    case "completed": return "已解析";
    case "processing": return "解析中";
    case "pending": return "待处理";
    case "error": return "解析失败";
    default: return status;
  }
}

function extractTags(job: Job): string[] {
  const tags: string[] = [];
  if (job.a_analysis?.A1_tech_stack?.keywords) {
    tags.push(...job.a_analysis.A1_tech_stack.keywords.slice(0, 4));
  }
  if (tags.length === 0 && job.structured_jd?.requirements) {
    // 从 requirements 中提取关键词
    job.structured_jd.requirements.slice(0, 3).forEach((r) => {
      const words = r.split(/[，,、]/);
      if (words[0] && words[0].length <= 10) tags.push(words[0].trim());
    });
  }
  return tags.slice(0, 4);
}

// ==================== 主组件 ====================

export function OpportunitiesPage() {
  // API hooks
  const { data: jobs, isLoading, error: fetchError, refetch } = useJobs();

  // 客户端状态
  const { selectedJobId, selectJob } = useJobStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  // 过滤和搜索
  const filteredJobs = (jobs || []).filter((job) => {
    // 状态过滤
    if (activeFilter !== "all" && job.status !== activeFilter) return false;
    // 搜索过滤
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.structured_jd?.location?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // 选中第一个（如果还没选中）
  useEffect(() => {
    if (!selectedJobId && filteredJobs.length > 0) {
      selectJob(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedJobId, selectJob]);

  // 统计
  const statusCounts = {
    all: (jobs || []).length,
    completed: (jobs || []).filter((j) => j.status === "completed").length,
    processing: (jobs || []).filter((j) => j.status === "processing").length,
    pending: (jobs || []).filter((j) => j.status === "pending").length,
    error: (jobs || []).filter((j) => j.status === "error").length,
  };

  const filters = [
    { id: "all", label: "全部", count: statusCounts.all },
    { id: "completed", label: "已解析", count: statusCounts.completed },
    { id: "processing", label: "解析中", count: statusCounts.processing },
    { id: "pending", label: "待处理", count: statusCounts.pending },
    { id: "error", label: "失败", count: statusCounts.error },
  ].filter((f) => f.id === "all" || f.count > 0);

  const tabs = [
    { id: "overview", label: "概览" },
    { id: "jd", label: "JD 解析" },
    { id: "skills", label: "能力模型" },
    { id: "match", label: "匹配诊断" },
    { id: "company", label: "公司分析" },
    { id: "records", label: "投递记录" },
  ];

  // 游客检查 & 额度检查
  const { checkGuest, showLoginPrompt, setShowLoginPrompt, loginScenario } = useGuestCheck();
  const { checkQuota, showUpgradeModal, setShowUpgradeModal, upgradeScenario } = useQuotaCheck();

  // 新增岗位：先检查登录和额度
  const handleAddJob = useCallback(async () => {
    if (!checkGuest('save-job')) return;
    if (!(await checkQuota('job-pool'))) return;
    setShowAddDrawer(true);
  }, [checkGuest, checkQuota]);

  // 新增岗位成功后的回调
  const handleParseSuccess = useCallback(() => {
    setShowAddDrawer(false);
    refetch();
  }, [refetch]);

  return (
    <div className="h-full flex flex-col bg-background -m-8">
      {/* 页面标题与工具条 */}
      <div className="flex-shrink-0 px-7 pt-6 pb-5 border-b border-border bg-card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[30px] leading-[38px] font-semibold tracking-tight mb-2">机会</h1>
            <p className="text-sm leading-[22px] text-muted-foreground">收集岗位、理解岗位、推进更值得投入的机会</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索岗位、公司、城市"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[280px] h-11 pl-10 pr-4 bg-card rounded-[14px] text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium whitespace-nowrap"
              title="刷新列表"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleAddJob}
              className="flex items-center gap-2 px-5 h-11 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              新增岗位
            </button>
          </div>
        </div>
      </div>

      {/* 主体双栏布局 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-7 py-5">
          <div className="h-full flex gap-5">
            {/* 左栏：岗位列表 */}
            <div className="w-[392px] flex-shrink-0 bg-card rounded-[24px] border border-border p-[18px] flex flex-col" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center justify-between h-14 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold">岗位列表</h2>
                  <span className="text-xs text-muted-foreground">
                    {filteredJobs.length} 个岗位
                  </span>
                </div>
              </div>

              {/* 筛选标签行 */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`
                      h-[30px] px-3 rounded-[999px] text-xs font-medium transition-all whitespace-nowrap
                      ${activeFilter === filter.id
                        ? "bg-secondary text-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground hover:bg-secondary/50"
                      }
                    `}
                  >
                    {filter.label}
                    <span className="ml-1.5 opacity-70">{filter.count}</span>
                  </button>
                ))}
              </div>

              {/* 岗位列表区 */}
              <div
                className="flex-1 overflow-y-auto -mr-1 pr-1 space-y-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent" }}
              >
                {/* Loading 状态 */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-3" />
                    <p className="text-sm">加载岗位列表...</p>
                  </div>
                )}

                {/* Error 状态 */}
                {fetchError && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 text-orange-500 mb-3" />
                    <p className="text-sm mb-3">加载失败</p>
                    <button onClick={() => refetch()} className="text-sm text-primary hover:text-primary/80">
                      点击重试
                    </button>
                  </div>
                )}

                {/* Empty 状态 */}
                {!isLoading && !fetchError && filteredJobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium mb-1">
                      {searchQuery || activeFilter !== "all" ? "没有匹配的岗位" : "还没有岗位"}
                    </p>
                    <p className="text-xs mb-4">
                      {searchQuery || activeFilter !== "all"
                        ? "尝试调整筛选条件"
                        : "点击「新增岗位」开始你的求职之旅"}
                    </p>
                    {!searchQuery && activeFilter === "all" && (
                      <button
                        onClick={() => setShowAddDrawer(true)}
                        className="flex items-center gap-2 px-4 h-9 rounded-[14px] bg-primary text-primary-foreground text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        新增岗位
                      </button>
                    )}
                  </div>
                )}

                {/* 岗位卡片列表 */}
                {!isLoading &&
                  filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJobId === job.id}
                      onClick={() => {
                        selectJob(job.id);
                        setActiveTab("overview");
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* 右栏：岗位详情 */}
            <div className="flex-1 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col" style={{ boxShadow: "var(--shadow-sm)" }}>
              {selectedJobId ? (
                <JobDetailPanel jobId={selectedJobId} activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">选择一个岗位查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 新增岗位抽屉 */}
      {showAddDrawer && (
        <AddJobDrawer onClose={() => setShowAddDrawer(false)} onSuccess={handleParseSuccess} />
      )}

      {/* 登录拦截弹层 */}
      {showLoginPrompt && (
        <LoginPromptModal
          scenario={loginScenario}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      {/* 额度拦截弹层 */}
      {showUpgradeModal && (
        <UpgradeInterceptModal
          scenario={upgradeScenario}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}

// ==================== 岗位卡片 ====================

function JobCard({ job, isSelected, onClick }: { job: Job; isSelected: boolean; onClick: () => void }) {
  const tags = extractTags(job);
  const deleteMutation = useDeleteJob();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定删除「${job.title || "未命名岗位"}」吗？`)) {
      deleteMutation.mutate(job.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-card rounded-[18px] p-4 border cursor-pointer transition-all
        ${isSelected
          ? "border-primary/30 bg-secondary/30 shadow-sm"
          : "border-border hover:border-border/80 hover:shadow-sm"
        }
      `}
      style={{
        minHeight: "110px",
        boxShadow: isSelected ? "var(--shadow-sm)" : "none",
      }}
    >
      {/* 选中态左侧竖线 */}
      {isSelected && <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-r-full" />}

      {/* 第一行：岗位名称 + 操作 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-[22px] truncate">
            {job.title || job.structured_jd?.title || "解析中..."}
          </h3>
          {job.status === "processing" && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={handleDelete}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* 第二行：公司 + 城市 + 薪资 */}
      <p className="text-[13px] text-foreground/80 mb-2 truncate">
        {[
          job.company || job.structured_jd?.company,
          job.structured_jd?.location,
          job.structured_jd?.salary,
        ]
          .filter(Boolean)
          .join(" · ") || "等待解析..."}
      </p>

      {/* 第三行：来源 + 时间 + 状态 */}
      <div className="flex items-center gap-2 mb-2.5 text-xs text-muted-foreground">
        <span>{job.source_type === "image" ? "截图导入" : "文本导入"}</span>
        <span>·</span>
        <span>{formatDate(job.created_at)}</span>
        <span>·</span>
        <span className={`px-2 py-0.5 rounded-[999px] text-[11px] font-medium ${getStatusColor(job.status)}`}>
          {getStatusLabel(job.status)}
        </span>
      </div>

      {/* 第四行：标签 */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map((tag) => (
            <span key={tag} className="h-6 px-2.5 rounded-[999px] bg-secondary border border-border text-[11px] flex items-center">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 错误提示 */}
      {job.status === "error" && job.error_message && (
        <p className="text-[11px] text-red-500 mt-2 truncate" title={job.error_message}>
          {job.error_message}
        </p>
      )}
    </div>
  );
}

// ==================== 岗位详情面板 ====================

function JobDetailPanel({
  jobId,
  activeTab,
  setActiveTab,
  tabs,
}: {
  jobId: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string }[];
}) {
  const { data: job, isLoading, error } = useJob(jobId);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <p className="text-sm">加载岗位详情失败</p>
        </div>
      </div>
    );
  }

  const jd = job.structured_jd;
  const aAnalysis = job.a_analysis;

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent" }}>
      <div className="space-y-[22px]">
        {/* 顶部信息头 */}
        <div style={{ minHeight: "112px" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-[28px] leading-9 font-semibold mb-3">
                {job.title || jd?.title || "解析中..."}
              </h2>
              <p className="text-[13px] text-muted-foreground">
                {[
                  job.company || jd?.company,
                  jd?.location,
                  jd?.salary,
                  formatDate(job.created_at) + "添加",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {job.job_url && (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1"
                >
                  查看原始链接 <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* 主按钮组 */}
          {job.status === "completed" && (
            <div className="flex gap-2.5 mb-2.5">
              <button className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                <Target className="w-4 h-4" />
                匹配诊断
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
                <FileText className="w-4 h-4" />
                生成定向简历
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                开始面试准备
              </button>
            </div>
          )}

          {/* 解析中状态 */}
          {job.status === "processing" && (
            <div className="flex items-center gap-3 p-4 rounded-[14px] bg-blue-50 border border-blue-200 mb-2.5">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">正在解析中...</p>
                <p className="text-xs text-blue-700">AI 正在深度分析 JD，通常需要 30-60 秒</p>
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {job.status === "error" && (
            <div className="flex items-center gap-3 p-4 rounded-[14px] bg-red-50 border border-red-200 mb-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">解析失败</p>
                <p className="text-xs text-red-700">{job.error_message || "未知错误，请重试"}</p>
              </div>
            </div>
          )}
        </div>

        {/* 结论卡片（仅已完成时显示） */}
        {job.status === "completed" && aAnalysis && (
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 rounded-[18px] bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">产品类型</p>
              <p className="text-xl font-semibold mb-1">{aAnalysis.A2_product_type?.type || "-"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed truncate">{aAnalysis.A2_product_type?.reason || ""}</p>
            </div>
            <div className="h-24 rounded-[18px] bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">业务领域</p>
              <p className="text-xl font-semibold mb-1">{aAnalysis.A3_business_domain?.primary || "-"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed truncate">{aAnalysis.A3_business_domain?.summary || ""}</p>
            </div>
            <div className="h-24 rounded-[18px] bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">团队阶段</p>
              <p className="text-xl font-semibold mb-1">{aAnalysis.A4_team_stage?.stage || "-"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed truncate">{aAnalysis.A4_team_stage?.evidence || ""}</p>
            </div>
            <div className="h-24 rounded-[18px] bg-card border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">技术栈密度</p>
              <p className="text-xl font-semibold mb-1">{aAnalysis.A1_tech_stack?.density || "-"}</p>
              <p className="text-xs text-muted-foreground leading-relaxed truncate">{aAnalysis.A1_tech_stack?.summary || ""}</p>
            </div>
          </div>
        )}

        {/* Tab 导航 */}
        {job.status === "completed" && (
          <>
            <div className="flex gap-2 border-b border-border -mb-[22px] pb-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    h-9 px-3.5 rounded-[999px] text-[13px] font-medium transition-all
                    ${activeTab === tab.id
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-5">
              {activeTab === "overview" && <OverviewTab job={job} />}
              {activeTab === "jd" && <JDAnalysisTab job={job} />}
              {activeTab === "skills" && <SkillsModelTab job={job} />}
              {activeTab === "match" && <MatchDiagnosisTab job={job} />}
              {activeTab === "company" && <CompanyAnalysisTab job={job} />}
              {activeTab === "records" && <RecordsTab job={job} />}
            </div>
          </>
        )}

        {/* 未完成时显示原始内容 */}
        {job.status !== "completed" && job.raw_content && (
          <div>
            <h3 className="text-sm font-semibold mb-3">原始内容</h3>
            <div className="rounded-[14px] bg-secondary/50 border border-border p-4 text-sm text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {job.raw_content.slice(0, 2000)}
              {job.raw_content.length > 2000 && "..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Tab 内容组件 ====================

function OverviewTab({ job }: { job: Job }) {
  const aAnalysis = job.a_analysis;
  const bAnalysis = job.b_analysis;

  return (
    <div className="space-y-[18px]">
      {/* 一句话总结 */}
      <div>
        <h3 className="text-sm font-semibold mb-2.5">一句话总结</h3>
        <div className="rounded-[18px] bg-secondary/50 border border-border p-[18px]" style={{ minHeight: "76px" }}>
          <p className="text-[15px] leading-6 text-foreground/90">
            {aAnalysis?.A2_product_type?.reason
              ? `这是一个${aAnalysis.A2_product_type.type}的岗位，${aAnalysis.A3_business_domain?.summary || ""}`
              : "解析数据加载中..."}
          </p>
        </div>
      </div>

      {/* 岗位基础判断 */}
      {aAnalysis && (
        <div>
          <h3 className="text-sm font-semibold mb-2.5">岗位基础判断</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-[72px] rounded-[16px] bg-card border border-border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">产品类型</p>
              <p className="font-medium">{aAnalysis.A2_product_type?.type || "-"}</p>
            </div>
            <div className="h-[72px] rounded-[16px] bg-card border border-border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">业务领域</p>
              <p className="font-medium">{aAnalysis.A3_business_domain?.primary || "-"}</p>
            </div>
            <div className="h-[72px] rounded-[16px] bg-card border border-border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">团队阶段</p>
              <p className="font-medium">{aAnalysis.A4_team_stage?.stage || "-"}</p>
            </div>
            <div className="h-[72px] rounded-[16px] bg-card border border-border p-3.5">
              <p className="text-xs text-muted-foreground mb-1">技术栈密度</p>
              <p className="font-medium">{aAnalysis.A1_tech_stack?.density || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 核心能力要求 */}
      {bAnalysis?.B4_capability_requirement?.capabilities && (
        <div>
          <h3 className="text-sm font-semibold mb-2.5">核心能力要求</h3>
          <div className="space-y-2">
            {bAnalysis.B4_capability_requirement.capabilities.map((cap, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-[14px] bg-secondary/50 border border-border">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{cap.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cap.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 建议下一步 */}
      <div>
        <h3 className="text-sm font-semibold mb-2.5">建议下一步</h3>
        <div className="flex gap-2.5">
          <button className="flex-1 h-10 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
            匹配诊断
          </button>
          <button className="flex-1 h-10 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
            生成定向简历
          </button>
          <button className="flex-1 h-10 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
            开始面试准备
          </button>
        </div>
      </div>
    </div>
  );
}

function JDAnalysisTab({ job }: { job: Job }) {
  const jd = job.structured_jd;
  const aAnalysis = job.a_analysis;
  const bAnalysis = job.b_analysis;

  return (
    <div className="flex gap-4">
      {/* 左侧结构化信息 */}
      <div className="w-[248px] flex-shrink-0">
        <h3 className="text-sm font-semibold mb-3">岗位信息</h3>
        <div className="rounded-[18px] bg-secondary/50 border border-border p-4 space-y-2.5">
          {[
            { label: "岗位名称", value: jd?.title || job.title },
            { label: "公司", value: jd?.company || job.company },
            { label: "薪资", value: jd?.salary },
            { label: "地点", value: jd?.location },
            { label: "学历要求", value: bAnalysis?.B2_tech_requirement?.education },
            { label: "行业经验", value: bAnalysis?.B1_industry_requirement?.years },
          ].map(
            (item) =>
              item.value && (
                <div key={item.label}>
                  <p className="text-[11px] text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-[13px]">{item.value}</p>
                </div>
              )
          )}
        </div>
      </div>

      {/* 右侧分析区 */}
      <div className="flex-1 space-y-[18px]">
        {/* 岗位速览 */}
        {aAnalysis && (
          <div>
            <h3 className="text-sm font-semibold mb-3">岗位速览</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-[68px] rounded-[16px] bg-card border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">技术栈密度</p>
                <p className="font-medium">{aAnalysis.A1_tech_stack?.density || "-"}</p>
              </div>
              <div className="h-[68px] rounded-[16px] bg-card border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">产品类型</p>
                <p className="font-medium">{aAnalysis.A2_product_type?.type || "-"}</p>
              </div>
              <div className="h-[68px] rounded-[16px] bg-card border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">业务领域</p>
                <p className="font-medium">{aAnalysis.A3_business_domain?.primary || "-"}</p>
              </div>
              <div className="h-[68px] rounded-[16px] bg-card border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">团队阶段</p>
                <p className="font-medium">{aAnalysis.A4_team_stage?.stage || "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* 技能要求 */}
        <div>
          <h3 className="text-sm font-semibold mb-3">技能要求</h3>
          <div className="space-y-3">
            {aAnalysis?.A1_tech_stack?.keywords && aAnalysis.A1_tech_stack.keywords.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">核心技术栈 ({aAnalysis.A1_tech_stack.keywords.length}项)</p>
                <div className="flex flex-wrap gap-2">
                  {aAnalysis.A1_tech_stack.keywords.map((kw) => (
                    <span key={kw} className="px-3 py-1.5 rounded-[999px] bg-green-50 text-green-700 border border-green-200 text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jd?.requirements && jd.requirements.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">岗位要求 ({jd.requirements.length}项)</p>
                <div className="space-y-1.5">
                  {jd.requirements.map((req, i) => (
                    <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-border">
                      {req}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {jd?.responsibilities && jd.responsibilities.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">岗位职责 ({jd.responsibilities.length}项)</p>
                <div className="space-y-1.5">
                  {jd.responsibilities.map((resp, i) => (
                    <p key={i} className="text-sm text-foreground/80 pl-3 border-l-2 border-primary/20">
                      {resp}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {jd?.preferred && jd.preferred.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">加分项 ({jd.preferred.length}项)</p>
                <div className="flex flex-wrap gap-2">
                  {jd.preferred.map((p, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-[999px] bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillsModelTab({ job }: { job: Job }) {
  const bAnalysis = job.b_analysis;

  const skillSections = [
    {
      title: "行业经验要求",
      data: bAnalysis?.B1_industry_requirement,
      render: (data: typeof bAnalysis.B1_industry_requirement) => (
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">经验年限：</span>{data?.years || "未指定"}</p>
          <p><span className="text-muted-foreground">特定行业：</span>{data?.specific_industry || "不限"}</p>
          <p><span className="text-muted-foreground">必须/优先：</span>{data?.required ? "必须" : data?.preferred ? "优先" : "不限"}</p>
          {data?.summary && <p className="text-xs text-muted-foreground pt-1">{data.summary}</p>}
        </div>
      ),
    },
    {
      title: "技术能力要求",
      data: bAnalysis?.B2_tech_requirement,
      render: (data: typeof bAnalysis.B2_tech_requirement) => (
        <div className="space-y-3">
          {data?.tech_depth?.['精通']?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">精通</p>
              <div className="flex flex-wrap gap-1.5">
                {data.tech_depth['精通'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-[999px] bg-red-50 text-red-700 border border-red-200 text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
          {data?.tech_depth?.['熟悉']?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">熟悉</p>
              <div className="flex flex-wrap gap-1.5">
                {data.tech_depth['熟悉'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-[999px] bg-orange-50 text-orange-700 border border-orange-200 text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
          {data?.tech_depth?.['了解']?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">了解</p>
              <div className="flex flex-wrap gap-1.5">
                {data.tech_depth['了解'].map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-[999px] bg-blue-50 text-blue-700 border border-blue-200 text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
          {data?.summary && <p className="text-xs text-muted-foreground pt-1">{data.summary}</p>}
        </div>
      ),
    },
    {
      title: "产品经验要求",
      data: bAnalysis?.B3_product_experience,
      render: (data: typeof bAnalysis.B3_product_experience) => (
        <div className="space-y-2 text-sm">
          {data?.product_types?.length > 0 && (
            <p><span className="text-muted-foreground">产品类型：</span>{data.product_types.join("、")}</p>
          )}
          <p><span className="text-muted-foreground">需要全周期经验：</span>{data?.need_full_cycle ? "是" : "否"}</p>
          <p><span className="text-muted-foreground">需要 0→1 经验：</span>{data?.need_0to1 ? "是" : "否"}</p>
          {data?.summary && <p className="text-xs text-muted-foreground pt-1">{data.summary}</p>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {bAnalysis ? (
        skillSections.map((section) =>
          section.data ? (
            <div key={section.title} className="rounded-[18px] bg-card border border-border p-5">
              <h3 className="text-sm font-semibold mb-3">{section.title}</h3>
              {section.render(section.data)}
            </div>
          ) : null
        )
      ) : (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">暂无能力模型数据</p>
        </div>
      )}
    </div>
  );
}

function MatchDiagnosisTab({ job }: { job: Job }) {
  // TODO: A3 阶段接入 useMatchResult / useEvaluateMatch
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-16">
        <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium mb-1">尚未进行匹配诊断</p>
        <p className="text-xs text-muted-foreground mb-4">上传简历后，AI 将自动进行多维匹配分析</p>
        <button className="flex items-center gap-2 px-5 h-10 rounded-[14px] bg-primary text-primary-foreground text-sm font-medium">
          <Target className="w-4 h-4" />
          开始匹配诊断
        </button>
      </div>
    </div>
  );
}

function CompanyAnalysisTab({ job }: { job: Job }) {
  // TODO: A5 阶段接入 useCompanyAnalysis / useGenerateCompanyAnalysis
  return (
    <div className="space-y-[14px]">
      <div className="flex flex-col items-center justify-center py-16">
        <Building className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium mb-1">尚未进行公司分析</p>
        <p className="text-xs text-muted-foreground mb-4">AI 将搜索公司信息，生成面试情报</p>
        <button className="flex items-center gap-2 px-5 h-10 rounded-[14px] bg-primary text-primary-foreground text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          生成公司分析
        </button>
      </div>
    </div>
  );
}

function RecordsTab({ job }: { job: Job }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-4">操作时间线</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="w-px flex-1 bg-border mt-2" />
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-medium text-sm">添加岗位</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(job.created_at).toLocaleString("zh-CN")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {job.source_type === "image" ? "通过截图导入" : "通过文本导入"}
              </p>
            </div>
          </div>

          {job.status === "completed" && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-sm">AI 分析完成</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.updated_at).toLocaleString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">完成 JD 结构化解析与深度分析</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== 新增岗位抽屉 ====================

function AddJobDrawer({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [addMode, setAddMode] = useState<"text" | "url">("text");
  const [jdContent, setJdContent] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [jdUrl, setJdUrl] = useState("");

  const parseMutation = useParseJD();
  const parseUrlMutation = useParseJDUrl();

  const isSubmitting = parseMutation.isPending || parseUrlMutation.isPending;

  const handleSubmit = async () => {
    if (addMode === "text") {
      if (!jdContent.trim()) {
        toast.error("请输入岗位描述");
        return;
      }
      parseMutation.mutate(
        { type: "text", content: jdContent },
        {
          onSuccess: () => {
            toast.success("岗位解析已开始");
            onSuccess();
          },
          onError: (err) => {
            toast.error("解析失败", { description: String(err) });
          },
        }
      );
    } else if (addMode === "url") {
      if (!jdUrl.trim()) {
        toast.error("请输入岗位链接");
        return;
      }
      parseUrlMutation.mutate(
        { url: jdUrl },
        {
          onSuccess: () => {
            toast.success("岗位解析已开始");
            onSuccess();
          },
          onError: (err) => {
            toast.error("URL 解析失败", { description: String(err) });
          },
        }
      );
    }
  };

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* 抽屉 */}
      <div className="fixed right-0 top-0 bottom-0 w-[520px] bg-card shadow-lg z-50 flex flex-col">
        {/* 头部 */}
        <div className="h-[76px] px-6 flex items-center justify-between border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold mb-1">新增岗位</h2>
            <p className="text-xs text-muted-foreground">粘贴文本或输入岗位链接，AI 自动解析</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 输入方式 Tabs */}
        <div className="px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setAddMode("text")}
              className={`flex items-center gap-2 h-[34px] px-4 rounded-[999px] text-sm font-medium transition-all ${addMode === "text" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
            >
              <AlignLeft className="w-4 h-4" />
              粘贴文本
            </button>
            <button
              onClick={() => setAddMode("url")}
              className={`flex items-center gap-2 h-[34px] px-4 rounded-[999px] text-sm font-medium transition-all ${addMode === "url" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
            >
              <LinkIcon className="w-4 h-4" />
              输入 URL
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {addMode === "text" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">岗位标题（可选）</label>
                <input
                  type="text"
                  placeholder="例如：高级前端开发工程师"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  className="w-full h-11 px-4 bg-secondary rounded-[14px] text-sm border-0 focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">岗位描述 *</label>
                <textarea
                  placeholder="粘贴完整的 JD 文本内容..."
                  value={jdContent}
                  onChange={(e) => setJdContent(e.target.value)}
                  className="w-full min-h-[260px] px-4 py-3 bg-secondary rounded-[14px] text-sm border-0 resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {jdContent.length > 0 ? `${jdContent.length} 字` : "支持任意格式的 JD 文本"}
                </p>
              </div>
            </div>
          )}

          {addMode === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">岗位链接 *</label>
                <input
                  type="url"
                  placeholder="粘贴 Boss直聘、拉勾网等平台的岗位链接"
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  className="w-full h-11 px-4 bg-secondary rounded-[14px] text-sm border-0 focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div className="p-4 rounded-[14px] bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-2">支持平台</p>
                <p className="text-sm">Boss直聘、拉勾网、猎聘、智联招聘等主流平台</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-[14px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "解析中..." : "开始解析"}
          </button>
        </div>
      </div>
    </>
  );
}
