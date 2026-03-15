import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

type TabType = "terms" | "privacy";

export function TermsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("terms");

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[880px] flex flex-col gap-8 py-12">
        {/* 返回按钮 */}
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span
            className="text-[13px] tracking-wide"
            style={{ fontWeight: 400 }}
          >
            返回
          </span>
        </Link>

        {/* 标题和切换 */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center"
              style={{
                background: "rgba(250, 250, 249, 0.6)",
                border: "1px solid rgba(229, 229, 227, 0.25)",
              }}
            >
              <FileText className="w-6 h-6 text-gray-600" strokeWidth={1.5} />
            </div>
            <h1
              className="text-[28px] text-gray-900 tracking-tight"
              style={{ fontWeight: 450 }}
            >
              {activeTab === "terms" ? "用户协议" : "隐私政策"}
            </h1>
          </div>

          {/* 标签切换 */}
          <div
            className="inline-flex rounded-[999px] p-1"
            style={{
              background: "rgba(250, 250, 249, 0.6)",
              border: "1px solid rgba(229, 229, 227, 0.25)",
              width: "fit-content",
            }}
          >
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-6 py-2 rounded-[999px] text-[13px] tracking-wide transition-all ${
                activeTab === "terms"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              style={{ fontWeight: activeTab === "terms" ? 450 : 400 }}
            >
              用户协议
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-6 py-2 rounded-[999px] text-[13px] tracking-wide transition-all ${
                activeTab === "privacy"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              style={{ fontWeight: activeTab === "privacy" ? 450 : 400 }}
            >
              隐私政策
            </button>
          </div>
        </div>

        {/* 内容卡片 */}
        <div
          className="rounded-[24px] p-10"
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(229, 229, 227, 0.25)",
            boxShadow:
              "0 4px 24px rgba(0, 0, 0, 0.012), 0 0 1px rgba(0, 0, 0, 0.015)",
          }}
        >
          <div className="prose prose-gray max-w-none">
            {activeTab === "terms" ? (
              <TermsContent />
            ) : (
              <PrivacyContent />
            )}
          </div>
        </div>

        {/* 更新时间 */}
        <div className="text-center">
          <p
            className="text-[12px] text-gray-400 tracking-wide"
            style={{ fontWeight: 400 }}
          >
            最后更新时间：2026 年 3 月 1 日
          </p>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          1. 服务说明
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          FindJob 是一个 AI
          驱动的求职操作系统，为你提供岗位分析、简历优化、面试训练和职业成长建议。通过使用本服务，你同意遵守本协议的所有条款。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          2. 账号注册与使用
        </h2>
        <div className="flex flex-col gap-3">
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.1
            你需要提供真实、准确的个人信息来注册账号。你对账号的所有活动负责。
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.2 请妥善保管你的账号信息，不要与他人共享。如发现账号异常，请立即联系我们。
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.3 我们保留在必要时暂停或终止账号的权利，特别是在违反本协议的情况下。
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          3. 服务内容与限制
        </h2>
        <div className="flex flex-col gap-3">
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            3.1 免费版提供基础功能，会员版提供更完整的能力。具体权益请参见会员权益页。
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            3.2 我们会持续优化服务，但不保证服务永不中断或完全无误。
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            3.3 你上传的内容仅用于为你提供个性化服务，我们不会将其用于其他商业目的。
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          4. 知识产权
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          FindJob
          的所有内容、设计、技术和商标均受知识产权法保护。未经授权，不得复制、修改或用于商业用途。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          5. 免责声明
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          FindJob
          提供的建议和分析仅供参考，不构成任何求职保证。最终的求职决策应由你自行判断。我们不对因使用本服务而产生的任何直接或间接损失负责。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          6. 协议变更
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          我们保留随时修改本协议的权利。如有重大变更，我们会通过站内通知或邮件的方式告知你。继续使用服务即表示你接受修改后的协议。
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          1. 我们收集哪些信息
        </h2>
        <div className="flex flex-col gap-3">
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            1.1 账号信息：手机号、邮箱、昵称等注册信息
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            1.2 求职信息：简历、目标岗位、工作经历等职业相关信息
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            1.3 使用数据：你在平台上的操作记录、训练记录和偏好设置
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            1.4 设备信息：IP 地址、浏览器类型、操作系统等技术信息
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          2. 我们如何使用这些信息
        </h2>
        <div className="flex flex-col gap-3">
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.1 为你提供个性化的岗位分析、简历优化和面试训练服务
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.2 改进和优化我们的产品功能
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.3 向你发送服务通知、更新和建议
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            2.4 保障平台安全，防止欺诈和滥用
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          3. 信息共享与披露
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          我们不会出售或出租你的个人信息。只有在以下情况下，我们可能会共享你的信息：
        </p>
        <div className="flex flex-col gap-3">
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            3.1 经过你的明确同意
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            3.2 为了提供服务，与可信的第三方服务商共享（如云存储、支付服务）
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            3.3 根据法律法规或政府要求
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          4. 信息安全
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          我们采用行业标准的安全措施来保护你的信息，包括加密传输、访问控制和定期安全审计。但请注意，没有任何系统是绝对安全的。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          5. 你的权利
        </h2>
        <div className="flex flex-col gap-3">
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            5.1 访问和更新：你可以随时查看和修改你的个人信息
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            5.2 删除和注销：你可以要求删除特定信息或注销账号
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            5.3 数据导出：你可以要求导出你的个人数据
          </p>
          <p
            className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
            style={{ fontWeight: 400 }}
          >
            5.4 撤回同意：你可以随时撤回对某些数据处理的同意
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          6. Cookie 和类似技术
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          我们使用 Cookie 和类似技术来改善你的体验、分析使用情况和提供个性化内容。你可以通过浏览器设置管理
          Cookie，但这可能影响部分功能的使用。
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2
          className="text-[18px] text-gray-900 tracking-tight"
          style={{ fontWeight: 450 }}
        >
          7. 联系我们
        </h2>
        <p
          className="text-[14px] text-gray-700 tracking-wide leading-relaxed"
          style={{ fontWeight: 400 }}
        >
          如果你对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
          <br />
          邮箱：privacy@findjob.ai
          <br />
          地址：[公司地址]
        </p>
      </section>
    </div>
  );
}
