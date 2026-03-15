import { useState, useRef } from "react";
import { Upload, FileText, Check, X, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import api from "../lib/api";
import { toast } from "sonner";

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { updateUserInfo } = useUser();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<string>("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const salaryRanges = [
    "10-15K",
    "15-20K",
    "20-30K",
    "30-40K",
    "40-50K",
    "50K+",
  ];

  const industries = [
    "互联网",
    "金融",
    "教育",
    "医疗",
    "企业服务",
    "电商",
    "游戏",
    "人工智能",
  ];

  const workStyles = [
    { id: "flexible", label: "灵活安排", desc: "接受适度出差和加班" },
    { id: "balanced", label: "平衡优先", desc: "偏好工作生活平衡" },
    { id: "strict", label: "严格边界", desc: "不接受出差和加班" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".doc") || file.name.endsWith(".docx"))) {
      setUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const data = await api.put<{ user: any }>("/user/profile", {
        salaryRange: selectedSalary,
        industries: selectedIndustries,
        workStyle: selectedWorkStyle,
      });
      updateUserInfo({
        isInitialized: true,
        ...(data?.user || {}),
      });
      toast.success("个人资料更新成功！");
      navigate("/");
    } catch (error) {
      toast.error("更新失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-20 py-16"
      style={{ background: "#FAFAF9" }}
    >
      <div className="w-full max-w-[1120px] flex flex-col gap-10">
        {/* 标题区 */}
        <div className="flex flex-col gap-5 text-center">
          <h1
            className="text-[34px] leading-[1.3] text-gray-900 tracking-tight"
            style={{ fontWeight: 450 }}
          >
            再补充一点基础信息，
            <br />
            我们会把建议做得更准
          </h1>
          <p
            className="text-[14px] text-gray-500 leading-[1.75] tracking-wide"
            style={{ fontWeight: 400 }}
          >
            上传简历效果最好，也可以先只填写偏好。
          </p>
        </div>

        {/* 两列卡片布局 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 左列：上传简历主卡 */}
          <div
            className="rounded-[28px] p-10"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(229, 229, 227, 0.25)",
              boxShadow:
                "0 6px 32px rgba(0, 0, 0, 0.015), 0 0 1px rgba(0, 0, 0, 0.015)",
            }}
          >
            <div className="flex flex-col gap-7">
              {/* 卡片标题 */}
              <div className="flex flex-col gap-3">
                <h2
                  className="text-[19px] text-gray-900 tracking-tight"
                  style={{ fontWeight: 450 }}
                >
                  上传你的简历
                </h2>
                <p
                  className="text-[13px] text-gray-500 leading-[1.7] tracking-wide"
                  style={{ fontWeight: 400 }}
                >
                  上传后，我们会自动生成求职画像、提取项目经历，并给出更具体的优化建议。
                </p>
              </div>

              {/* 上传区域 */}
              {!uploadedFile ? (
                <div
                  className="relative rounded-[20px] p-12 flex flex-col items-center justify-center gap-5 transition-all duration-300 cursor-pointer"
                  style={{
                    background: isDragging
                      ? "rgba(250, 250, 249, 0.9)"
                      : "rgba(250, 250, 249, 0.3)",
                    border: isDragging
                      ? "1px solid rgba(0, 0, 0, 0.1)"
                      : "1px solid rgba(229, 229, 227, 0.3)",
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div
                    className="w-16 h-16 rounded-[18px] flex items-center justify-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(229, 229, 227, 0.35)",
                      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <Upload
                      className="w-7 h-7 text-gray-400"
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="flex flex-col items-center gap-2.5">
                    <p
                      className="text-[15px] text-gray-900 tracking-wide"
                      style={{ fontWeight: 450 }}
                    >
                      点击上传或拖拽文件到此处
                    </p>
                    <p
                      className="text-[12px] text-gray-400 tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      支持 PDF、DOC、DOCX 格式
                    </p>
                  </div>
                </div>
              ) : (
                // 已上传状态
                <div
                  className="rounded-[20px] p-8"
                  style={{
                    background: "rgba(240, 253, 244, 0.5)",
                    border: "1px solid rgba(34, 197, 94, 0.12)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(34, 197, 94, 0.08)",
                        }}
                      >
                        <FileText
                          className="w-6 h-6 text-green-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <Check
                            className="w-4 h-4 text-green-600"
                            strokeWidth={2.5}
                          />
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            简历已接收
                          </span>
                        </div>
                        <p
                          className="text-[13px] text-gray-600 tracking-wide leading-relaxed"
                          style={{ fontWeight: 400 }}
                        >
                          {uploadedFile.name}
                        </p>
                        <p
                          className="text-[12px] text-gray-500 tracking-wide mt-0.5 leading-relaxed"
                          style={{ fontWeight: 400 }}
                        >
                          后续会自动为你生成求职画像
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              )}

              {/* 次级入口 */}
              {!uploadedFile && (
                <button
                  className="text-[13px] text-gray-400 hover:text-gray-600 tracking-wide transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  先跳过，稍后再传
                </button>
              )}
            </div>
          </div>

          {/* 右列：偏好补充卡 */}
          <div
            className="rounded-[28px] p-10"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(229, 229, 227, 0.25)",
              boxShadow:
                "0 6px 32px rgba(0, 0, 0, 0.015), 0 0 1px rgba(0, 0, 0, 0.015)",
            }}
          >
            <div className="flex flex-col gap-8">
              {/* 期望薪资 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[15px] text-gray-900 tracking-wide"
                    style={{ fontWeight: 450 }}
                  >
                    期望薪资
                  </label>
                  <span
                    className="text-[11px] text-gray-400 tracking-wider"
                    style={{ fontWeight: 400 }}
                  >
                    选填
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {salaryRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedSalary(range)}
                      className="px-5 py-2.5 rounded-[999px] text-[13px] tracking-wide transition-all duration-200"
                      style={{
                        background:
                          selectedSalary === range
                            ? "rgba(0, 0, 0, 0.05)"
                            : "rgba(250, 250, 249, 0.5)",
                        border:
                          selectedSalary === range
                            ? "1px solid rgba(0, 0, 0, 0.15)"
                            : "1px solid rgba(229, 229, 227, 0.35)",
                        color: selectedSalary === range ? "#111827" : "#6B7280",
                        fontWeight: selectedSalary === range ? 450 : 400,
                      }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* 行业偏好 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[15px] text-gray-900 tracking-wide"
                    style={{ fontWeight: 450 }}
                  >
                    行业偏好
                  </label>
                  <span
                    className="text-[11px] text-gray-400 tracking-wider"
                    style={{ fontWeight: 400 }}
                  >
                    可多选
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className="px-5 py-2.5 rounded-[999px] text-[13px] tracking-wide transition-all duration-200"
                      style={{
                        background: selectedIndustries.includes(industry)
                          ? "rgba(0, 0, 0, 0.05)"
                          : "rgba(250, 250, 249, 0.5)",
                        border: selectedIndustries.includes(industry)
                          ? "1px solid rgba(0, 0, 0, 0.15)"
                          : "1px solid rgba(229, 229, 227, 0.35)",
                        color: selectedIndustries.includes(industry)
                          ? "#111827"
                          : "#6B7280",
                        fontWeight: selectedIndustries.includes(industry)
                          ? 450
                          : 400,
                      }}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* 工作方式偏好 */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[15px] text-gray-900 tracking-wide"
                    style={{ fontWeight: 450 }}
                  >
                    出差与加班偏好
                  </label>
                  <span
                    className="text-[11px] text-gray-400 tracking-wider"
                    style={{ fontWeight: 400 }}
                  >
                    选填
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {workStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedWorkStyle(style.id)}
                      className="rounded-[16px] p-5 text-left transition-all duration-200"
                      style={{
                        background:
                          selectedWorkStyle === style.id
                            ? "rgba(250, 250, 249, 0.7)"
                            : "rgba(250, 250, 249, 0.3)",
                        border:
                          selectedWorkStyle === style.id
                            ? "1px solid rgba(0, 0, 0, 0.12)"
                            : "1px solid rgba(229, 229, 227, 0.3)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="text-[14px] text-gray-900 tracking-wide"
                            style={{
                              fontWeight: selectedWorkStyle === style.id ? 450 : 400,
                            }}
                          >
                            {style.label}
                          </span>
                          <span
                            className="text-[12px] text-gray-500 tracking-wide leading-relaxed"
                            style={{ fontWeight: 400 }}
                          >
                            {style.desc}
                          </span>
                        </div>
                        {selectedWorkStyle === style.id && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: "rgba(0, 0, 0, 0.06)",
                            }}
                          >
                            <Check
                              className="w-3 h-3 text-gray-700"
                              strokeWidth={2.5}
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮区 */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-[240px] h-[52px] rounded-[16px] bg-gray-900 hover:bg-gray-800 text-white text-[15px] shadow-none transition-all duration-200"
            style={{ fontWeight: 450 }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "提交中..." : "完成设置"}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="w-[240px] h-[48px] rounded-[16px] text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 text-[14px] shadow-none transition-all duration-200"
            style={{ fontWeight: 400 }}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            先进入首页
          </Button>
        </div>

        {/* 底部提示 */}
        {!uploadedFile && (
          <div className="text-center -mt-4">
            <p
              className="text-[11px] text-gray-400 leading-relaxed tracking-wide"
              style={{ fontWeight: 400 }}
            >
              上传简历后可获得更具体的匹配与面试建议。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}