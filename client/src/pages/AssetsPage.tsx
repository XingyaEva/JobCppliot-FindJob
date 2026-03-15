/**
 * AssetsPage — 资产中心
 *
 * A3 全链路 API 接入版本:
 * - 左栏简历列表通过 useResumes() 从后端获取
 * - 中栏简历详情通过 useResume(id) 获取
 * - 上传简历通过 useUploadResume / useParseResumeText
 * - 解析进度通过 useResumeProgress(id) 轮询
 * - 更新简历通过 useUpdateResume
 * - 删除简历通过 useDeleteResume
 * - 版本历史通过 useResumeVersions(id)
 * - 空状态 / 加载态 / 错误态完整覆盖
 */

import { useState, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Save,
  Copy,
  FileText,
  GitBranch,
  Edit3,
  Sparkles,
  Trash2,
  GripVertical,
  Eye,
  Code,
  User,
  Briefcase,
  FolderOpen,
  Award,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Loader2,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  useResumes,
  useResume,
  useUploadResume,
  useParseResumeText,
  useUpdateResume,
  useDeleteResume,
  useResumeVersions,
  useCreateResumeVersion,
  useResumeProgress,
} from "../hooks";
import type { Resume } from "../types/api";
import { toast } from "sonner";
import { useGuestCheck } from "../hooks/useGuestCheck";
import { useQuotaCheck } from "../hooks/useQuotaCheck";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { UpgradeInterceptModal } from "../components/UpgradeInterceptModal";

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

function getResumeStatusBadge(resume: Resume): { label: string; color: string } {
  if (resume.is_master) return { label: "基础版", color: "bg-blue-50 text-blue-700" };
  if (resume.linked_jd_ids?.length > 0) return { label: "定向版", color: "bg-purple-50 text-purple-700" };
  if (resume.version_tag) return { label: resume.version_tag, color: "bg-secondary text-muted-foreground" };
  return { label: `v${resume.version || 1}`, color: "bg-secondary text-muted-foreground" };
}

function getStatusColor(status: Resume["status"]): string {
  switch (status) {
    case "completed": return "bg-green-50 text-green-700";
    case "processing":
    case "parsing": return "bg-blue-50 text-blue-700";
    case "pending": return "bg-orange-50 text-orange-700";
    case "error": return "bg-red-50 text-red-700";
    default: return "bg-secondary text-foreground";
  }
}

function getStatusLabel(status: Resume["status"]): string {
  switch (status) {
    case "completed": return "已解析";
    case "processing":
    case "parsing": return "解析中";
    case "pending": return "待解析";
    case "error": return "解析失败";
    default: return String(status);
  }
}

// ==================== 主组件 ====================

export function AssetsPage() {
  // 选中资产类别 & 选中条目
  const [selectedAsset, setSelectedAsset] = useState("resumes");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [expandedAssets, setExpandedAssets] = useState(["resumes"]);
  const [editMode, setEditMode] = useState<"preview" | "edit">("preview");
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // 上传抽屉
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "text">("file");
  const [textInput, setTextInput] = useState("");
  const [textName, setTextName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API hooks
  const { data: resumeListData, isLoading: listLoading, error: listError, refetch: refetchList } = useResumes();
  const { data: selectedResume, isLoading: detailLoading } = useResume(selectedResumeId);
  const { data: versions } = useResumeVersions(selectedResumeId);
  const uploadResume = useUploadResume();
  const parseResumeText = useParseResumeText();
  const updateResume = useUpdateResume();
  const deleteResume = useDeleteResume();
  const createVersion = useCreateResumeVersion();

  // 游客检查 & 额度检查
  const { checkGuest, showLoginPrompt, setShowLoginPrompt, loginScenario } = useGuestCheck();
  const { checkQuota, showUpgradeModal, setShowUpgradeModal, upgradeScenario } = useQuotaCheck();

  // 解析中的简历轮询进度
  const parsingResumeId =
    selectedResume && (selectedResume as Resume).status === "processing"
      ? (selectedResume as Resume).id
      : null;
  const { data: progressData } = useResumeProgress(parsingResumeId, !!parsingResumeId);

  // 提取简历列表
  const resumes: Resume[] = (resumeListData as any)?.resumes ?? (Array.isArray(resumeListData) ? resumeListData : []);
  const resumeCount = resumes.length;

  // 自动选中第一份简历
  if (!selectedResumeId && resumes.length > 0) {
    setSelectedResumeId(resumes[0].id);
  }

  // 当前选中的简历对象（从详情 or 列表）
  const currentResume: Resume | null = (selectedResume as Resume) ?? resumes.find((r) => r.id === selectedResumeId) ?? null;

  // 展开/折叠资产类别
  const toggleAsset = (assetId: string) => {
    if (expandedAssets.includes(assetId)) {
      setExpandedAssets(expandedAssets.filter((id) => id !== assetId));
    } else {
      setExpandedAssets([...expandedAssets, assetId]);
    }
  };

  // ==================== 上传处理 ====================

  // 打开上传抽屉前检查登录和额度
  const handleOpenUpload = useCallback(async () => {
    if (!checkGuest('save-resume')) return;
    if (!(await checkQuota('resume-version'))) return;
    setShowUploadDrawer(true);
  }, [checkGuest, checkQuota]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.[^.]+$/, ""));

      try {
        const result = await uploadResume.mutateAsync(formData);
        const newResume = (result as any)?.resume;
        if (newResume?.id) {
          setSelectedResumeId(newResume.id);
        }
        toast.success("简历上传成功", { description: "正在解析中..." });
        setShowUploadDrawer(false);
      } catch {
        toast.error("上传失败", { description: "请检查文件格式后重试" });
      }
    },
    [uploadResume]
  );

  const handleTextParse = useCallback(async () => {
    if (!textInput.trim()) {
      toast.error("请输入简历内容");
      return;
    }
    try {
      const result = await parseResumeText.mutateAsync({
        content: textInput,
        name: textName || "文本简历",
      });
      const newResume = (result as any)?.resume;
      if (newResume?.id) {
        setSelectedResumeId(newResume.id);
      }
      toast.success("简历解析成功");
      setShowUploadDrawer(false);
      setTextInput("");
      setTextName("");
    } catch {
      toast.error("解析失败", { description: "请检查内容格式后重试" });
    }
  }, [textInput, textName, parseResumeText]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteResume.mutateAsync(id);
        if (selectedResumeId === id) {
          setSelectedResumeId(null);
        }
        toast.success("简历已删除");
      } catch {
        toast.error("删除失败");
      }
    },
    [deleteResume, selectedResumeId]
  );

  const handleCreateVersion = useCallback(async () => {
    if (!selectedResumeId) return;
    if (!checkGuest('save-resume')) return;
    if (!(await checkQuota('resume-version'))) return;
    try {
      await createVersion.mutateAsync({ resumeId: selectedResumeId, tag: `手动版本 ${new Date().toLocaleDateString("zh-CN")}` });
      toast.success("版本创建成功");
    } catch {
      toast.error("版本创建失败");
    }
  }, [selectedResumeId, createVersion, checkGuest, checkQuota]);

  // ==================== 渲染 ====================

  return (
    <div className="h-full flex flex-col bg-background -m-8">
      {/* 页面标题区 */}
      <div className="flex-shrink-0 px-7 pt-6 pb-5">
        <h1 className="text-[30px] leading-[38px] font-semibold tracking-tight mb-2">资产</h1>
        <p className="text-sm leading-[22px] text-muted-foreground">
          把简历、项目、成果和求职画像组织成可持续迭代的求职资产。
        </p>
      </div>

      {/* 顶部工具条 */}
      <div className="flex-shrink-0 px-7 pb-5">
        <div className="h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索简历、项目、证据"
                className="w-[280px] h-11 pl-10 pr-4 bg-card rounded-[14px] text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex items-center gap-2">
              {["全部", "简历", "项目", "成果"].map((filter, index) => (
                <button
                  key={filter}
                  className={`h-8 px-3 rounded-[999px] text-xs font-medium transition-all ${
                    index === 0 ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenUpload}
              className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              新建资产
            </button>
            <button
              onClick={handleOpenUpload}
              className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              导入
            </button>
            <button className="flex items-center gap-2 px-4 h-11 rounded-[14px] bg-card border border-border hover:bg-secondary/80 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
        </div>
      </div>

      {/* 三栏主体布局 */}
      <div className="flex-1 overflow-hidden px-7 pb-6">
        <div className="h-full flex gap-5">
          {/* ============ 左栏：资产树导航 ============ */}
          <div
            className="w-[264px] flex-shrink-0 bg-card rounded-[24px] border border-border p-[18px] flex flex-col"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-[18px]">
              <h2 className="text-lg font-semibold">我的资产</h2>
              <button
                onClick={handleOpenUpload}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              {/* 求职画像 */}
              <button
                onClick={() => setSelectedAsset("profile")}
                className={`w-full h-[42px] px-3 rounded-[12px] flex items-center gap-2.5 transition-all text-sm font-medium ${
                  selectedAsset === "profile" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="flex-1 text-left">求职画像</span>
              </button>

              {/* 简历库 — 接入真实 API */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedAsset("resumes");
                    toggleAsset("resumes");
                  }}
                  className={`w-full h-[42px] px-3 rounded-[12px] flex items-center gap-2.5 transition-all text-sm font-medium ${
                    selectedAsset === "resumes" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {expandedAssets.includes("resumes") ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <FileText className="w-4 h-4" />
                  <span className="flex-1 text-left">简历库</span>
                  {listLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="text-xs opacity-70">{resumeCount}</span>
                  )}
                </button>

                {expandedAssets.includes("resumes") && (
                  <div className="ml-5 space-y-1.5">
                    {listLoading && (
                      <div className="py-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        加载中...
                      </div>
                    )}
                    {listError && (
                      <div className="py-3 flex flex-col items-center gap-2">
                        <p className="text-xs text-red-500">加载失败</p>
                        <button onClick={() => refetchList()} className="text-xs text-primary hover:text-primary/80">
                          重试
                        </button>
                      </div>
                    )}
                    {!listLoading && !listError && resumes.length === 0 && (
                      <div className="py-4 flex flex-col items-center gap-2">
                        <FileText className="w-6 h-6 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">暂无简历</p>
                        <button
                          onClick={handleOpenUpload}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          上传简历
                        </button>
                      </div>
                    )}
                    {resumes.map((resume) => {
                      const badge = getResumeStatusBadge(resume);
                      const isActive = selectedResumeId === resume.id;
                      const isParsing = resume.status === "processing" || resume.status === "parsing";
                      return (
                        <button
                          key={resume.id}
                          onClick={() => setSelectedResumeId(resume.id)}
                          className={`w-full h-[34px] px-2.5 rounded-[10px] flex items-center gap-2 transition-all text-[13px] ${
                            isActive ? "bg-secondary/80 font-semibold shadow-sm" : "text-muted-foreground hover:bg-secondary/30"
                          }`}
                        >
                          {isParsing && <Loader2 className="w-3 h-3 animate-spin text-blue-500 flex-shrink-0" />}
                          <span className="flex-1 text-left truncate">
                            {resume.name || resume.basic_info?.name || "未命名简历"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap ${badge.color}`}>
                            {badge.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 项目素材库（后续接入） */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedAsset("projects");
                    toggleAsset("projects");
                  }}
                  className={`w-full h-[42px] px-3 rounded-[12px] flex items-center gap-2.5 transition-all text-sm font-medium ${
                    selectedAsset === "projects" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {expandedAssets.includes("projects") ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <FolderOpen className="w-4 h-4" />
                  <span className="flex-1 text-left">项目素材库</span>
                  <span className="text-xs opacity-70">—</span>
                </button>
                {expandedAssets.includes("projects") && (
                  <div className="ml-5 py-3 text-center">
                    <p className="text-xs text-muted-foreground">从简历解析结果自动提取</p>
                  </div>
                )}
              </div>

              {/* 成就证据库（后续接入） */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedAsset("achievements");
                    toggleAsset("achievements");
                  }}
                  className={`w-full h-[42px] px-3 rounded-[12px] flex items-center gap-2.5 transition-all text-sm font-medium ${
                    selectedAsset === "achievements"
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                >
                  {expandedAssets.includes("achievements") ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <Award className="w-4 h-4" />
                  <span className="flex-1 text-left">成就证据库</span>
                  <span className="text-xs opacity-70">—</span>
                </button>
                {expandedAssets.includes("achievements") && (
                  <div className="ml-5 py-3 text-center">
                    <p className="text-xs text-muted-foreground">从简历解析结果自动提取</p>
                  </div>
                )}
              </div>
            </div>

            {/* 底部统计 */}
            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">简历版本</span>
                <span className="font-medium">{resumeCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">项目素材</span>
                <span className="font-medium">{resumes.reduce((sum, r) => sum + (r.projects?.length || 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">技能标签</span>
                <span className="font-medium">{resumes.reduce((sum, r) => sum + (r.skills?.length || 0), 0)}</span>
              </div>
            </div>
          </div>

          {/* ============ 中栏：主编辑与查看区 ============ */}
          <div
            className="w-[560px] flex-shrink-0 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            {/* 无选中 / 加载中 / 错误态 */}
            {!selectedResumeId && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">从左侧选择一份简历查看</p>
                  <button
                    onClick={handleOpenUpload}
                    className="h-[38px] px-5 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    上传简历
                  </button>
                </div>
              </div>
            )}

            {selectedResumeId && detailLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">加载简历详情...</span>
                </div>
              </div>
            )}

            {selectedResumeId && !detailLoading && currentResume && (
              <ResumeDetailPanel
                resume={currentResume}
                editMode={editMode}
                setEditMode={setEditMode}
                hoveredSection={hoveredSection}
                setHoveredSection={setHoveredSection}
                onSave={async (data) => {
                  try {
                    await updateResume.mutateAsync({ resumeId: currentResume.id, data });
                    toast.success("保存成功");
                  } catch {
                    toast.error("保存失败");
                  }
                }}
                onCreateVersion={handleCreateVersion}
                onDelete={() => handleDelete(currentResume.id)}
                isSaving={updateResume.isPending}
                progressData={progressData as any}
              />
            )}
          </div>

          {/* ============ 右栏：AI 建议与版本信息 ============ */}
          <div
            className="flex-1 bg-card rounded-[24px] border border-border overflow-hidden flex flex-col"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div
              className="flex-1 overflow-y-auto p-5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent" }}
            >
              <div className="space-y-5">
                {/* 版本历史 */}
                {selectedResumeId && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">版本历史</h3>
                      <button
                        onClick={handleCreateVersion}
                        disabled={createVersion.isPending}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        {createVersion.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        新建版本
                      </button>
                    </div>
                    {versions && Array.isArray(versions) && versions.length > 0 ? (
                      <div className="space-y-2">
                        {(versions as any[]).slice(0, 8).map((v: any) => (
                          <div key={v.id} className="p-3 rounded-[12px] bg-secondary/30 border border-border/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{v.tag || `v${v.version_number}`}</span>
                              <span className="text-[10px] text-muted-foreground">{formatDate(v.created_at)}</span>
                            </div>
                            {v.change_summary && <p className="text-[11px] text-muted-foreground">{v.change_summary}</p>}
                            <span
                              className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                v.source === "agent" ? "bg-purple-50 text-purple-700" : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {v.source === "agent" ? "AI 生成" : v.source === "manual" ? "手动" : v.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-3 text-center">暂无版本记录</p>
                    )}
                  </div>
                )}

                {/* AI 建议（基于当前简历状态动态生成） */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI 建议</h3>
                  <p className="text-xs leading-[18px] text-muted-foreground mb-3">这些调整会更有助于提升岗位匹配度。</p>
                  {currentResume ? (
                    <AISuggestionsPanel resume={currentResume} />
                  ) : (
                    <p className="text-xs text-muted-foreground py-4 text-center">选择简历后查看 AI 建议</p>
                  )}
                </div>
              </div>
            </div>

            {/* 底部统计 */}
            {currentResume && (
              <div className="flex-shrink-0 p-5 border-t border-border bg-secondary/30">
                <h4 className="text-sm font-semibold mb-3">简历概况</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">版本号</span>
                    <span className="font-medium">v{currentResume.version || 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">关联岗位</span>
                    <span className="font-medium">{currentResume.linked_jd_ids?.length || 0} 个</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">更新时间</span>
                    <span className="font-medium">{currentResume.updated_at ? formatDate(currentResume.updated_at) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">状态</span>
                    <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-medium ${getStatusColor(currentResume.status)}`}>
                      {getStatusLabel(currentResume.status)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* ============ 上传抽屉 ============ */}
      {showUploadDrawer && (
        <UploadDrawer
          uploadMode={uploadMode}
          setUploadMode={setUploadMode}
          textInput={textInput}
          setTextInput={setTextInput}
          textName={textName}
          setTextName={setTextName}
          fileInputRef={fileInputRef}
          onFileUpload={handleFileUpload}
          onTextParse={handleTextParse}
          isUploading={uploadResume.isPending}
          isParsing={parseResumeText.isPending}
          onClose={() => setShowUploadDrawer(false)}
        />
      )}
    </div>
  );
}

// ==================== 简历详情面板 ====================

function ResumeDetailPanel({
  resume,
  editMode,
  setEditMode,
  hoveredSection,
  setHoveredSection,
  onSave,
  onCreateVersion,
  onDelete,
  isSaving,
  progressData,
}: {
  resume: Resume;
  editMode: "preview" | "edit";
  setEditMode: (mode: "preview" | "edit") => void;
  hoveredSection: string | null;
  setHoveredSection: (id: string | null) => void;
  onSave: (data: Partial<Resume>) => Promise<void>;
  onCreateVersion: () => void;
  onDelete: () => void;
  isSaving: boolean;
  progressData: any;
}) {
  const isParsing = resume.status === "processing" || resume.status === "parsing";
  const isError = resume.status === "error";
  const isCompleted = resume.status === "completed";

  // 构建简历各段内容
  const personalInfo = resume.basic_info
    ? `${resume.basic_info.name || "—"}\n联系方式：${resume.basic_info.contact || "—"}\n期望职位：${resume.basic_info.target_position || "—"}`
    : "暂无个人信息";

  const educationInfo =
    resume.education?.length > 0
      ? resume.education.map((e) => `${e.school} · ${e.major} · ${e.degree} · ${e.duration}`).join("\n")
      : "暂无教育经历";

  const workInfo =
    resume.work_experience?.length > 0
      ? resume.work_experience.map((w) => `${w.company} · ${w.position} · ${w.duration}\n${w.description}`).join("\n\n")
      : "暂无工作经历";

  const projectInfo =
    resume.projects?.length > 0
      ? resume.projects
          .map(
            (p) =>
              `${p.name} · ${p.role} · ${p.duration}\n${p.description}${
                p.achievements?.length > 0 ? "\n成果: " + p.achievements.join("、") : ""
              }${p.tech_stack?.length > 0 ? "\n技术栈: " + p.tech_stack.join("、") : ""}`
          )
          .join("\n\n")
      : "暂无项目经历";

  const skillsInfo =
    resume.skills?.length > 0
      ? `专业技能：${resume.skills.join("、")}${
          resume.ability_tags
            ? `\n行业标签：${(resume.ability_tags.industry || []).join("、") || "—"}\n技术标签：${
                (resume.ability_tags.technology || []).join("、") || "—"
              }\n产品标签：${(resume.ability_tags.product || []).join("、") || "—"}\n能力标签：${
                (resume.ability_tags.capability || []).join("、") || "—"
              }`
            : ""
        }`
      : "暂无技能信息";

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent" }}>
      <div className="space-y-5">
        {/* 顶部信息头 */}
        <div>
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex-1">
              <h2 className="text-2xl leading-8 font-semibold mb-2.5">
                {resume.name || resume.basic_info?.name || "未命名简历"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {resume.updated_at ? `${formatDate(resume.updated_at)} 更新` : ""}
                {resume.linked_jd_ids?.length > 0 ? ` · 关联 ${resume.linked_jd_ids.length} 个岗位` : ""}
                {resume.version_tag ? ` · ${resume.version_tag}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-[8px] text-[11px] font-medium ${getStatusColor(resume.status)}`}>
                {getStatusLabel(resume.status)}
              </span>
              {resume.is_master && (
                <span className="px-2.5 py-1 rounded-[8px] bg-blue-50 text-blue-700 text-[11px] font-medium">基础版</span>
              )}
              <button
                onClick={onDelete}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                title="删除简历"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 解析进度条 */}
          {isParsing && progressData && (
            <div className="mb-4 p-3 rounded-[12px] bg-blue-50/50 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {progressData.message || "解析中..."}
                </span>
                <span className="text-xs text-blue-600 font-medium">{Math.round(progressData.progress || 0)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-blue-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressData.progress || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* 解析失败提示 */}
          {isError && (
            <div className="mb-4 p-3 rounded-[12px] bg-red-50/50 border border-red-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-700">解析失败</p>
                <p className="text-xs text-red-600 mt-0.5">{resume.error_message || "请重试或使用文本方式上传"}</p>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {isCompleted && (
            <div className="flex gap-2.5">
              <button
                onClick={() => onSave({})}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 h-[38px] rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存
              </button>
              <button
                onClick={onCreateVersion}
                className="flex items-center gap-2 px-4 h-[38px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                另存为新版本
              </button>
              <button className="flex items-center gap-2 px-4 h-[38px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                导出 PDF
              </button>
              <button className="flex items-center gap-2 px-4 h-[38px] rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium">
                <GitBranch className="w-4 h-4" />
                对比版本
              </button>
            </div>
          )}
        </div>

        {/* 简历编辑区 */}
        {isCompleted && (
          <div className="rounded-[18px] border border-border bg-card overflow-hidden">
            <div className="h-10 px-4 flex items-center justify-between border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode("preview")}
                  className={`px-3 h-7 rounded-lg text-xs font-medium transition-all ${
                    editMode === "preview" ? "bg-card shadow-sm" : "hover:bg-secondary/50"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1.5" />
                  预览
                </button>
                <button
                  onClick={() => setEditMode("edit")}
                  className={`px-3 h-7 rounded-lg text-xs font-medium transition-all ${
                    editMode === "edit" ? "bg-card shadow-sm" : "hover:bg-secondary/50"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 inline mr-1.5" />
                  编辑
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <span>就绪</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </>
                )}
              </div>
            </div>

            <div className="p-6 space-y-5 min-h-[520px]">
              <ResumeSection title="个人信息" content={personalInfo} hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} sectionId="personal" />
              <ResumeSection title="教育经历" content={educationInfo} hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} sectionId="education" />
              <ResumeSection title="工作经历" content={workInfo} hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} sectionId="work" />
              <ResumeSection title="项目经历" content={projectInfo} hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} sectionId="project" />
              <ResumeSection title="技能与证书" content={skillsInfo} hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} sectionId="skills" />
            </div>
          </div>
        )}

        {/* 待解析或解析中 — 原始内容预览 */}
        {!isCompleted && resume.raw_content && (
          <div className="rounded-[18px] border border-border bg-card overflow-hidden">
            <div className="h-10 px-4 flex items-center border-b border-border bg-secondary/30">
              <span className="text-xs font-medium text-muted-foreground">原始内容</span>
            </div>
            <div className="p-6">
              <pre className="text-sm whitespace-pre-wrap text-muted-foreground max-h-[400px] overflow-y-auto">{resume.raw_content.slice(0, 3000)}</pre>
            </div>
          </div>
        )}

        {/* 结构摘要 */}
        {isCompleted && (
          <div>
            <h3 className="text-sm font-semibold mb-3">结构摘要</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-[74px] rounded-[16px] bg-secondary/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">教育经历</p>
                <p className="text-sm font-medium">{resume.education?.length || 0} 段</p>
              </div>
              <div className="h-[74px] rounded-[16px] bg-secondary/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">工作经历</p>
                <p className="text-sm font-medium">{resume.work_experience?.length || 0} 段</p>
              </div>
              <div className="h-[74px] rounded-[16px] bg-secondary/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">项目经历</p>
                <p className="text-sm font-medium">{resume.projects?.length || 0} 个项目</p>
              </div>
              <div className="h-[74px] rounded-[16px] bg-secondary/50 border border-border p-3.5">
                <p className="text-xs text-muted-foreground mb-1">技能标签</p>
                <p className="text-sm font-medium">{resume.skills?.length || 0} 个</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== AI 建议面板 ====================

function AISuggestionsPanel({ resume }: { resume: Resume }) {
  // 基于简历数据动态生成建议
  const suggestions: Array<{ id: number; title: string; priority: string; description: string }> = [];

  if (!resume.basic_info?.target_position) {
    suggestions.push({
      id: 1,
      title: "补充期望职位",
      priority: "高",
      description: "当前未填写期望职位，补充后可以更精准地匹配相关岗位。",
    });
  }

  if ((resume.projects?.length || 0) < 2) {
    suggestions.push({
      id: 2,
      title: "补充项目经历",
      priority: "高",
      description: "项目经历较少，建议补充 2-3 个有代表性的项目，突出核心贡献和量化成果。",
    });
  }

  if ((resume.skills?.length || 0) < 5) {
    suggestions.push({
      id: 3,
      title: "丰富技能标签",
      priority: "中",
      description: "技能标签偏少，建议对照目标岗位要求补充相关技术栈和工具技能。",
    });
  }

  const hasQuantifiedResults = resume.work_experience?.some((w) => /\d+%|\d+万|\d+个|提升|增长/.test(w.description));
  if (!hasQuantifiedResults && (resume.work_experience?.length || 0) > 0) {
    suggestions.push({
      id: 4,
      title: "补充结果量化",
      priority: "高",
      description: "工作经历中缺少量化数据支撑，补充具体数字（如提升比例、用户量级等）能显著提升竞争力。",
    });
  }

  if (suggestions.length === 0 && resume.status === "completed") {
    suggestions.push({
      id: 5,
      title: "简历质量良好",
      priority: "低",
      description: "当前简历各模块完整度较高。建议对标具体岗位，进一步定向优化关键词匹配。",
    });
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="min-h-[96px] rounded-[16px] bg-secondary/50 border border-border p-3.5"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-sm flex-1">{suggestion.title}</h4>
            <span
              className={`px-2 py-0.5 rounded-[6px] text-[10px] font-medium whitespace-nowrap ml-2 ${
                suggestion.priority === "高" ? "bg-orange-50 text-orange-700" : suggestion.priority === "中" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
              }`}
            >
              {suggestion.priority}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground mb-3">{suggestion.description}</p>
          <div className="flex gap-2">
            <button className="flex-1 h-[30px] rounded-[8px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium">
              采纳
            </button>
            <button className="flex-1 h-[30px] rounded-[8px] bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">
              改写
            </button>
            <button className="w-[30px] h-[30px] rounded-[8px] bg-card border border-border hover:bg-secondary transition-colors flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== 上传抽屉 ====================

function UploadDrawer({
  uploadMode,
  setUploadMode,
  textInput,
  setTextInput,
  textName,
  setTextName,
  fileInputRef,
  onFileUpload,
  onTextParse,
  isUploading,
  isParsing,
  onClose,
}: {
  uploadMode: "file" | "text";
  setUploadMode: (mode: "file" | "text") => void;
  textInput: string;
  setTextInput: (v: string) => void;
  textName: string;
  setTextName: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (file: File) => void;
  onTextParse: () => void;
  isUploading: boolean;
  isParsing: boolean;
  onClose: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* 抽屉 */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <h2 className="text-lg font-semibold">导入简历</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 模式切换 */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-secondary rounded-[12px]">
            <button
              onClick={() => setUploadMode("file")}
              className={`flex-1 h-9 rounded-[10px] text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                uploadMode === "file" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Upload className="w-4 h-4" />
              上传文件
            </button>
            <button
              onClick={() => setUploadMode("text")}
              className={`flex-1 h-9 rounded-[10px] text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                uploadMode === "text" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              粘贴文本
            </button>
          </div>

          {uploadMode === "file" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) onFileUpload(file);
                }}
                className={`border-2 border-dashed rounded-[16px] p-10 text-center cursor-pointer transition-all ${
                  isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/30"
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-sm font-medium">上传解析中...</p>
                    <p className="text-xs text-muted-foreground">AI 正在智能分析你的简历</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium">点击或拖拽文件到此处</p>
                    <p className="text-xs text-muted-foreground">支持 PDF、Word、TXT 格式</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {uploadMode === "text" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">简历名称</label>
                <input
                  type="text"
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                  placeholder="例：张三的简历"
                  className="w-full h-10 px-4 bg-secondary rounded-[10px] text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">简历内容</label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="粘贴你的简历文本内容..."
                  rows={15}
                  className="w-full px-4 py-3 bg-secondary rounded-[12px] text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                  style={{ scrollbarWidth: "thin" }}
                />
              </div>
              <button
                onClick={onTextParse}
                disabled={isParsing || !textInput.trim()}
                className="w-full h-11 rounded-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isParsing ? "AI 解析中..." : "AI 智能解析"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ==================== 简历章节组件 ====================

function ResumeSection({
  title,
  content,
  hoveredSection,
  setHoveredSection,
  sectionId,
}: {
  title: string;
  content: string;
  hoveredSection: string | null;
  setHoveredSection: (id: string | null) => void;
  sectionId: string;
}) {
  const isHovered = hoveredSection === sectionId;

  return (
    <div className="group relative" onMouseEnter={() => setHoveredSection(sectionId)} onMouseLeave={() => setHoveredSection(null)}>
      {isHovered && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary rounded-r-full" />}
      <div className={`pl-3 pr-10 py-2 rounded-lg transition-all ${isHovered ? "bg-secondary/30" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <div className="text-sm leading-[22px] text-foreground/90 whitespace-pre-line">{content}</div>
      </div>
      {isHovered && (
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <button className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-colors flex items-center justify-center">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-colors flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-colors flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          </button>
          <button className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm hover:bg-secondary transition-colors flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
