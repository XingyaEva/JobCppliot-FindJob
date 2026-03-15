import { createBrowserRouter } from "react-router";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";

// === 核心业务页面 ===
import { HomePage } from "./pages/HomePage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { AssetsPage } from "./pages/AssetsPage";
import { InterviewsPage } from "./pages/InterviewsPage";
import { DecisionsPage } from "./pages/DecisionsPage";
import { GrowthPage } from "./pages/GrowthPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

// === 用户体系页面 ===
import { LoginRegisterPage } from "./pages/LoginRegisterPage";
import { PhoneLoginPage } from "./pages/PhoneLoginPage";
import { LoginSuccessPage } from "./pages/LoginSuccessPage";
import { WelcomePage } from "./pages/WelcomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { DeleteAccountPage } from "./pages/DeleteAccountPage";
import { RegisterPromptDemoPage } from "./pages/RegisterPromptDemoPage";

// === 会员与支付页面 ===
import { MembershipPage } from "./pages/MembershipPage";
import { SubscriptionPlansPage } from "./pages/SubscriptionPlansPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PurchaseSuccessPage } from "./pages/PurchaseSuccessPage";
import { UpgradeInterceptDemoPage } from "./pages/UpgradeInterceptDemoPage";

// === 公共页面 ===
import { TermsPage } from "./pages/TermsPage";
import { ErrorStatePage } from "./pages/ErrorStatePage";

export const router = createBrowserRouter([
  // ====== 独立页面（无 AppShell） ======
  {
    path: "/login",
    Component: LoginRegisterPage,
  },
  {
    path: "/phone-login",
    Component: PhoneLoginPage,
  },
  {
    path: "/login-success",
    element: (
      <ProtectedRoute>
        <LoginSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/welcome",
    element: (
      <ProtectedRoute>
        <WelcomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile-setup",
    element: (
      <ProtectedRoute>
        <ProfileSetupPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-prompt-demo",
    Component: RegisterPromptDemoPage,
  },

  // ====== 主应用路由（有 AppShell） ======
  {
    path: "/",
    Component: AppShell,
    children: [
      // --- 核心业务 ---
      { index: true, Component: HomePage },
      { path: "my-dashboard", Component: UserDashboardPage },
      { path: "opportunities", Component: OpportunitiesPage },
      { path: "assets", Component: AssetsPage },
      { path: "interviews", Component: InterviewsPage },
      { path: "decisions", Component: DecisionsPage },
      { path: "growth", Component: GrowthPage },

      // --- 个人中心（需要登录） ---
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // --- 会员与支付（需要登录） ---
      {
        path: "membership",
        element: (
          <ProtectedRoute>
            <MembershipPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "subscription-plans",
        element: (
          <ProtectedRoute>
            <SubscriptionPlansPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "purchase-success",
        element: (
          <ProtectedRoute>
            <PurchaseSuccessPage />
          </ProtectedRoute>
        ),
      },

      // --- 账户管理（需要登录） ---
      {
        path: "delete-account",
        element: (
          <ProtectedRoute>
            <DeleteAccountPage />
          </ProtectedRoute>
        ),
      },

      // --- 其他公共页面 ---
      { path: "terms", Component: TermsPage },
      { path: "error-state", Component: ErrorStatePage },
      { path: "upgrade-intercept-demo", Component: UpgradeInterceptDemoPage },

      // --- 管理员路由 ---
      { path: "admin/dashboard", Component: AdminDashboardPage },

      // --- 404 ---
      {
        path: "*",
        element: <ErrorStatePage />,
      },
    ],
  },
]);
