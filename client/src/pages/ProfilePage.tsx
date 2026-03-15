import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Briefcase,
  FileText,
  Shield,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Upload,
  Edit2,
  Check,
  Smartphone,
  Mail,
  Monitor,
  LogOut,
  UserX,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useUser } from "../contexts/UserContext";
import { LogoutConfirmModal } from "../components/LogoutConfirmModal";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { toast } from "sonner";

type Section = "basic" | "preference" | "attachments" | "security";

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, deleteAccount } = useUser();
  const [activeSection, setActiveSection] = useState<Section>("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 处理退出登录
  const handleLogout = () => {
    logout();
    toast.success("已退出登录");
    navigate("/");
  };

  // 处理注销账号
  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    
    if (success) {
      toast.success("账号已注销");
      navigate("/");
    } else {
      toast.error("注销失败，请稍后重试");
    }
  };

  const navItems = [
    { id: "basic" as Section, label: "基础资料", icon: User },
    { id: "preference" as Section, label: "求职偏好", icon: Briefcase },
    { id: "attachments" as Section, label: "资料附件", icon: FileText },
    { id: "security" as Section, label: "账号与安全", icon: Shield },
  ];

  // 模拟数据
  const profileData = {
    basic: {
      avatar: "",
      name: "张明",
      phone: "138****8888",
      email: "zhangming@example.com",
    },
    preference: {
      position: "产品经理",
      cities: ["北京", "上海"],
      industries: ["互联网", "人工智能"],
      experience: "3-5年",
      status: "在职-考虑机会",
    },
    additional: {
      salary: "20-30K",
      workMode: "远程优先",
      interviewTime: "工作日晚上或周末",
      growthFocus: "产品战略与管理能力",
    },
    attachments: {
      resume: {
        name: "张明_产品经理_2026.pdf",
        updateTime: "2026年3月5日 14:30",
      },
    },
  };

  return (
    <div className="flex gap-8 h-full">
      {/* 左侧轻导航 */}
      <div
        className="flex-shrink-0 w-[220px] rounded-[24px] p-6"
        style={{
          background: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(229, 229, 227, 0.2)",
          boxShadow:
            "0 2px 16px rgba(0, 0, 0, 0.01), 0 0 1px rgba(0, 0, 0, 0.01)",
          height: "fit-content",
        }}
      >
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-left transition-all duration-200"
                style={{
                  background: isActive
                    ? "rgba(0, 0, 0, 0.04)"
                    : "transparent",
                  color: isActive ? "#111827" : "#6B7280",
                }}
              >
                <Icon
                  className="w-[18px] h-[18px] flex-shrink-0"
                  strokeWidth={1.5}
                />
                <span
                  className="text-[14px] tracking-wide"
                  style={{ fontWeight: isActive ? 450 : 400 }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 右侧详情区 */}
      <div className="flex-1 flex flex-col gap-6">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1
              className="text-[24px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              {navItems.find((item) => item.id === activeSection)?.label}
            </h1>
            {activeSection === "preference" && (
              <p
                className="text-[12px] text-gray-400 tracking-wide"
                style={{ fontWeight: 400 }}
              >
                修改目标岗位后，首页推荐与岗位分析会相应调整。
              </p>
            )}
          </div>

          {activeSection !== "security" && (
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-[38px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                    onClick={() => setIsEditing(false)}
                    style={{ fontWeight: 400 }}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    className="h-[38px] rounded-[14px] bg-gray-900 hover:bg-gray-800 text-white text-[13px]"
                    onClick={() => setIsEditing(false)}
                    style={{ fontWeight: 450 }}
                  >
                    保存
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-[38px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                  onClick={() => setIsEditing(true)}
                  style={{ fontWeight: 400 }}
                >
                  <Edit2 className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                  编辑资料
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 内容区 */}
        <div className="flex flex-col gap-5">
          {/* 模块1：基础资料 */}
          {activeSection === "basic" && (
            <div
              className="rounded-[24px] p-8"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(229, 229, 227, 0.25)",
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
              }}
            >
              <div className="flex items-start gap-8">
                {/* 头像 */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-20 h-20 rounded-[18px] flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(250, 250, 249, 0.8), rgba(255, 255, 255, 0.9))",
                      border: "1px solid rgba(229, 229, 227, 0.35)",
                    }}
                  >
                    <User
                      className="w-10 h-10 text-gray-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  {isEditing && (
                    <button
                      className="text-[12px] text-gray-500 hover:text-gray-900 tracking-wide transition-colors"
                      style={{ fontWeight: 400 }}
                    >
                      更换头像
                    </button>
                  )}
                </div>

                {/* 基础信息 */}
                <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex flex-col gap-2.5">
                    <label
                      className="text-[12px] text-gray-400 tracking-wider uppercase"
                      style={{ fontWeight: 400 }}
                    >
                      昵称
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={profileData.basic.name}
                        className="px-4 py-2.5 rounded-[14px] text-[14px] text-gray-900 tracking-wide border outline-none transition-all duration-200"
                        style={{
                          background: "rgba(250, 250, 249, 0.5)",
                          borderColor: "rgba(229, 229, 227, 0.35)",
                          fontWeight: 400,
                        }}
                      />
                    ) : (
                      <span
                        className="text-[15px] text-gray-900 tracking-wide"
                        style={{ fontWeight: 450 }}
                      >
                        {profileData.basic.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label
                      className="text-[12px] text-gray-400 tracking-wider uppercase"
                      style={{ fontWeight: 400 }}
                    >
                      手机号
                    </label>
                    <span
                      className="text-[15px] text-gray-900 tracking-wide"
                      style={{ fontWeight: 450 }}
                    >
                      {profileData.basic.phone}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 col-span-2">
                    <label
                      className="text-[12px] text-gray-400 tracking-wider uppercase"
                      style={{ fontWeight: 400 }}
                    >
                      邮箱
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        defaultValue={profileData.basic.email}
                        className="px-4 py-2.5 rounded-[14px] text-[14px] text-gray-900 tracking-wide border outline-none transition-all duration-200"
                        style={{
                          background: "rgba(250, 250, 249, 0.5)",
                          borderColor: "rgba(229, 229, 227, 0.35)",
                          fontWeight: 400,
                        }}
                      />
                    ) : (
                      <span
                        className="text-[15px] text-gray-900 tracking-wide"
                        style={{ fontWeight: 450 }}
                      >
                        {profileData.basic.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 模块2：求职偏好 */}
          {activeSection === "preference" && (
            <>
              {/* 求职方向卡片 */}
              <div
                className="rounded-[24px] p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(229, 229, 227, 0.25)",
                  boxShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
                }}
              >
                <div className="flex flex-col gap-6">
                  <h3
                    className="text-[16px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    求职方向
                  </h3>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <Briefcase
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          目标岗位
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.preference.position}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <MapPin
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          目标城市
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.preference.cities.join("、")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <Building2
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          行业偏好
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.preference.industries.join("、")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <Calendar
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          工作年限
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.preference.experience}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 col-span-2">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <TrendingUp
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          当前状态
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.preference.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 补充偏好卡片 */}
              <div
                className="rounded-[24px] p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(229, 229, 227, 0.25)",
                  boxShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
                }}
              >
                <div className="flex flex-col gap-6">
                  <h3
                    className="text-[16px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    补充偏好
                  </h3>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <DollarSign
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          期望薪资
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.additional.salary}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <MapPin
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          工作模式偏好
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.additional.workMode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <Clock
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          面试偏好时间
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.additional.interviewTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <TrendingUp
                          className="w-[18px] h-[18px] text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          成长偏好
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.additional.growthFocus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 模块3：资料附件 */}
          {activeSection === "attachments" && (
            <div
              className="rounded-[24px] p-8"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(229, 229, 227, 0.25)",
                boxShadow:
                  "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
              }}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-[16px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    已上传简历
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-[36px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                    style={{ fontWeight: 400 }}
                  >
                    <Upload className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                    重新上传
                  </Button>
                </div>

                <div
                  className="rounded-[20px] p-6"
                  style={{
                    background: "rgba(250, 250, 249, 0.5)",
                    border: "1px solid rgba(229, 229, 227, 0.25)",
                  }}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid rgba(229, 229, 227, 0.35)",
                      }}
                    >
                      <FileText
                        className="w-7 h-7 text-gray-600"
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          {profileData.attachments.resume.name}
                        </span>
                        <span
                          className="text-[12px] text-gray-400 tracking-wide"
                          style={{ fontWeight: 400 }}
                        >
                          最近更新：{profileData.attachments.resume.updateTime}
                        </span>
                      </div>

                      <div
                        className="rounded-[14px] px-4 py-3"
                        style={{
                          background: "rgba(240, 253, 244, 0.4)",
                          border: "1px solid rgba(34, 197, 94, 0.12)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className="w-4 h-4 text-green-600"
                            strokeWidth={2}
                          />
                          <span
                            className="text-[13px] text-gray-700 tracking-wide"
                            style={{ fontWeight: 400 }}
                          >
                            已自动生成求职画像与项目经历提取
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[16px] px-5 py-4"
                  style={{
                    background: "rgba(250, 250, 249, 0.3)",
                    border: "1px solid rgba(229, 229, 227, 0.2)",
                  }}
                >
                  <p
                    className="text-[12px] text-gray-500 leading-relaxed tracking-wide"
                    style={{ fontWeight: 400 }}
                  >
                    上传新版本简历后，系统会重新分析你的经历与优势，并更新相关建议。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 模块4：账号与安全 */}
          {activeSection === "security" && (
            <>
              {/* 模块1：登录方式 */}
              <div
                className="rounded-[24px] p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(229, 229, 227, 0.25)",
                  boxShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
                }}
              >
                <div className="flex flex-col gap-6">
                  <h3
                    className="text-[16px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    登录方式
                  </h3>

                  {/* 登录方式列表 */}
                  <div className="flex flex-col gap-0">
                    {/* 手机号 */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <Smartphone
                            className="w-5 h-5 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            手机号
                          </span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-green-600"
                              strokeWidth={2}
                            />
                            <span
                              className="text-[13px] text-gray-600 tracking-wide"
                              style={{ fontWeight: 400 }}
                            >
                              138****8888
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                      >
                        修改
                      </Button>
                    </div>

                    {/* 邮箱 */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <Mail
                            className="w-5 h-5 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            邮箱
                          </span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-green-600"
                              strokeWidth={2}
                            />
                            <span
                              className="text-[13px] text-gray-600 tracking-wide"
                              style={{ fontWeight: 400 }}
                            >
                              zhan****@example.com
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                      >
                        修改
                      </Button>
                    </div>

                    {/* 微信 - 未绑定 */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path d="M8.5 11.5c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
                            <path d="M15.5 11.5c.5 0 1-.5 1-1s-.5-1-1-1-1 .5-1 1 .5 1 1 1z" />
                            <path d="M18 8c0-3.3-3.6-6-8-6S2 4.7 2 8c0 2.2 1.5 4.1 3.7 5.2-.2.7-.5 1.8-.5 1.8s1.3-.4 2.2-.8c.8.2 1.7.3 2.6.3 4.4 0 8-2.7 8-6z" />
                            <path d="M18 14c0 2.2-2.4 4-5.3 4-.6 0-1.2-.1-1.8-.2-.6.3-1.5.5-1.5.5s.2-.7.3-1.2C8.3 16.1 7 14.7 7 13c0-2.2 2.4-4 5.3-4 2.5 0 4.6 1.4 5.2 3.2.3.4.5.8.5 1.8z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            微信
                          </span>
                          <div className="flex items-center gap-2">
                            <XCircle
                              className="w-3.5 h-3.5 text-gray-400"
                              strokeWidth={2}
                            />
                            <span
                              className="text-[13px] text-gray-400 tracking-wide"
                              style={{ fontWeight: 400 }}
                            >
                              未绑定
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                      >
                        绑定
                      </Button>
                    </div>

                    {/* Apple - 未绑定 */}
                    <div className="flex items-center justify-between py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <svg
                            className="w-5 h-5 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            Apple
                          </span>
                          <div className="flex items-center gap-2">
                            <XCircle
                              className="w-3.5 h-3.5 text-gray-400"
                              strokeWidth={2}
                            />
                            <span
                              className="text-[13px] text-gray-400 tracking-wide"
                              style={{ fontWeight: 400 }}
                            >
                              未绑定
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                      >
                        绑定
                      </Button>
                    </div>
                  </div>

                  {/* 轻提示 */}
                  <div
                    className="rounded-[16px] px-5 py-4"
                    style={{
                      background: "rgba(250, 250, 249, 0.3)",
                      border: "1px solid rgba(229, 229, 227, 0.2)",
                    }}
                  >
                    <p
                      className="text-[12px] text-gray-500 leading-relaxed tracking-wide"
                      style={{ fontWeight: 400 }}
                    >
                      绑定更多方式后，你在切换设备时会更方便。
                    </p>
                  </div>
                </div>
              </div>

              {/* 模块2：账号安全 */}
              <div
                className="rounded-[24px] p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(229, 229, 227, 0.25)",
                  boxShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
                }}
              >
                <div className="flex flex-col gap-6">
                  <h3
                    className="text-[16px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    账号安全
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* 最近登录设备 */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <Monitor
                          className="w-5 h-5 text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          最近登录设备
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          MacBook Pro
                        </span>
                        <span
                          className="text-[12px] text-gray-500 tracking-wide"
                          style={{ fontWeight: 400 }}
                        >
                          macOS · Chrome 浏览器
                        </span>
                      </div>
                    </div>

                    {/* 最近登录时间 */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(250, 250, 249, 0.6)",
                          border: "1px solid rgba(229, 229, 227, 0.25)",
                        }}
                      >
                        <Clock
                          className="w-5 h-5 text-gray-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span
                          className="text-[12px] text-gray-400 tracking-wider uppercase"
                          style={{ fontWeight: 400 }}
                        >
                          最近登录时间
                        </span>
                        <span
                          className="text-[15px] text-gray-900 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          今天 14:32
                        </span>
                        <span
                          className="text-[12px] text-gray-500 tracking-wide"
                          style={{ fontWeight: 400 }}
                        >
                          来自 北京市 · 朝阳区
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 安全状态提示 */}
                  <div
                    className="rounded-[16px] px-5 py-4"
                    style={{
                      background: "rgba(240, 253, 244, 0.4)",
                      border: "1px solid rgba(34, 197, 94, 0.12)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className="w-5 h-5 text-green-600 flex-shrink-0"
                        strokeWidth={2}
                      />
                      <div className="flex-1">
                        <p
                          className="text-[13px] text-gray-700 tracking-wide"
                          style={{ fontWeight: 450 }}
                        >
                          账号安全状态良好
                        </p>
                        <p
                          className="text-[12px] text-gray-600 tracking-wide mt-1"
                          style={{ fontWeight: 400 }}
                        >
                          近期无异常登录记录
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 退出所有设备 */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-[36px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                      style={{ fontWeight: 400 }}
                    >
                      退出所有设备
                    </Button>
                  </div>
                </div>
              </div>

              {/* 模块3：账户管理 */}
              <div
                className="rounded-[24px] p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(229, 229, 227, 0.25)",
                  boxShadow:
                    "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
                }}
              >
                <div className="flex flex-col gap-6">
                  <h3
                    className="text-[16px] text-gray-900 tracking-tight"
                    style={{ fontWeight: 450 }}
                  >
                    账户管理
                  </h3>

                  <div className="flex flex-col gap-0">
                    {/* 退出登录 */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <LogOut
                            className="w-5 h-5 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            退出登录
                          </span>
                          <span
                            className="text-[12px] text-gray-500 tracking-wide"
                            style={{ fontWeight: 400 }}
                          >
                            退出当前设备
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                        onClick={() => setShowLogoutModal(true)}
                      >
                        退出
                      </Button>
                    </div>

                    {/* 注销账号 */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(254, 242, 242, 0.5)",
                            border: "1px solid rgba(239, 68, 68, 0.12)",
                          }}
                        >
                          <UserX
                            className="w-5 h-5 text-red-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            注销账号
                          </span>
                          <span
                            className="text-[12px] text-gray-500 tracking-wide"
                            style={{ fontWeight: 400 }}
                          >
                            永久删除账号及所有数据
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-red-600 hover:text-red-700 hover:bg-red-50/50 text-[13px]"
                        style={{ fontWeight: 400 }}
                        onClick={() => setShowDeleteModal(true)}
                      >
                        注销
                      </Button>
                    </div>

                    {/* 用户协议 */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <FileText
                            className="w-5 h-5 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            用户协议
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                      >
                        <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>

                    {/* 隐私政策 */}
                    <div className="flex items-center justify-between py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                          style={{
                            background: "rgba(250, 250, 249, 0.6)",
                            border: "1px solid rgba(229, 229, 227, 0.25)",
                          }}
                        >
                          <Shield
                            className="w-5 h-5 text-gray-600"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-[15px] text-gray-900 tracking-wide"
                            style={{ fontWeight: 450 }}
                          >
                            隐私政策
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-[34px] rounded-[14px] text-gray-600 hover:text-gray-900 text-[13px]"
                        style={{ fontWeight: 400 }}
                      >
                        <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 退出登录确认弹层 */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      {/* 注销账号确认弹层 */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}