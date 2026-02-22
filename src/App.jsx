import { Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH ================= */
import Login from "./pages/login";
import Register from "./pages/register";

/* ================= ADMIN AUTH ================= */
import AdminRegister from "./pages/admin/auth/AdminRegister";
import AdminLogin from "./pages/admin/auth/AdminLogin";

/* ================= ADMIN ================= */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import AdminApprovalPage from "./pages/admin/approvals/AdminApprovalPage";
import AdminApprovalDetailPage from "./pages/admin/approvals/AdminApprovalDetailPage";
import Categories from "./pages/admin/categories/Categories";
import CreateCategory from "./pages/admin/categories/CreateCategory";
import EditCategory from "./pages/admin/categories/EditCategory";

/* ================= ADMIN SUB-CATEGORIES ================= */
import SubCategories from "./pages/admin/subCategories/SubCategories";
import CreateSubCategory from "./pages/admin/subCategories/CreateSubCategory";
import EditSubCategory from "./pages/admin/subCategories/EditSubCategory";

/* ================= REGISTER ================= */
import CustomerRegister from "./pages/register/customer";
import ProviderRegister from "./pages/register/provider";

/* ================= CUSTOMER ================= */
import ServiceProviderSearch from "./pages/service-provider-search";
import ServiceProviderProfile from "./pages/service-provider-profile";
import CustomerProfile from "./pages/customer-profile";
import EditCustomerProfile from "./pages/customer-profile/edit";

/* ================= PROVIDER ================= */
import ProviderDashboard from "./pages/provider-dashboard";
import ProviderProfile from "./pages/provider-profile";
import EditProviderProfile from "./pages/provider-profile/edit";

/* ================= PROVIDER MODULES ================= */
import ProviderRequestsPage from "@/provider/requests/ProviderRequestsPage";
import ProviderJobsPage from "@/provider/jobs/ProviderJobsPage";
import ProviderEarningsPage from "@/provider/earnings/ProviderEarningsPage";
import ProviderPerformancePage from "@/provider/performance/ProviderPerformancePage";
import ProviderSchedulePage from "@/provider/schedule/ProviderSchedulePage";
import ProviderServicesPage from "@/provider/services/ProviderServicesPage";
import ProviderOnboardingPage from "@/provider/onboarding/ProviderOnboardingPage";
import ProviderVerificationCenterPage from "@/provider/verification/ProviderVerificationCenterPage";
import ProviderVerificationHistoryPage from "@/provider/verification/ProviderVerificationHistoryPage";
import ProviderKpiPage from "@/provider/kpi/ProviderKpiPage";
import ProviderGrowthHubPage from "@/provider/business/ProviderGrowthHubPage";

/* ================= LAYOUTS ================= */
import MainLayout from "@/layouts/MainLayout";
import ProviderLayout from "@/layouts/ProviderLayout";

/* ================= GUARDS ================= */
import ProtectedRoute from "@/routes/ProtectedRoute";
import RoleRoute from "@/routes/RoleRoute";
import ProviderOnboardingGuard from "@/routes/ProviderOnboardingGuard";
import AdminAuthGuard from "@/routes/AdminAuthGuard";
import AuthRedirect from "@/routes/AuthRedirect";

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= ADMIN AUTH ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />

      {/* ================= ADMIN (PROTECTED) ================= */}
      <Route path="/admin" element={<AdminAuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="approvals" element={<AdminApprovalPage />} />
          <Route
            path="approvals/:providerId"
            element={<AdminApprovalDetailPage />}
          />

          <Route path="categories" element={<Categories />} />
          <Route path="categories/create" element={<CreateCategory />} />
          <Route path="categories/:id/edit" element={<EditCategory />} />

          <Route path="sub-categories" element={<SubCategories />} />
          <Route path="sub-categories/create" element={<CreateSubCategory />} />
          <Route path="sub-categories/:id/edit" element={<EditSubCategory />} />

          <Route path="providers" element={<div>Providers</div>} />
          <Route path="customers" element={<div>Customers</div>} />
          <Route path="reports" element={<div>Reports</div>} />
        </Route>
      </Route>

      {/* ================= REGISTRATION ================= */}
      <Route path="/register/customer" element={<CustomerRegister />} />
      <Route path="/register/provider" element={<ProviderRegister />} />

      {/* ================= CUSTOMER ================= */}
      <Route element={<MainLayout />}>
        <Route
          path="/customer/home"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="CUSTOMER">
                <ServiceProviderSearch />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/provider/:providerId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="CUSTOMER">
                <ServiceProviderProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="CUSTOMER">
                <CustomerProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile/edit"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="CUSTOMER">
                <EditCustomerProfile />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ================= PROVIDER DASHBOARD ================= */}
      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRole="PROVIDER">
              <ProviderLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route element={<ProviderOnboardingGuard />}>
          <Route path="/provider/onboarding" element={<ProviderOnboardingPage />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/requests" element={<ProviderRequestsPage />} />
          <Route path="/provider/jobs" element={<ProviderJobsPage />} />
          <Route path="/provider/earnings" element={<ProviderEarningsPage />} />
          <Route
            path="/provider/performance"
            element={<ProviderPerformancePage />}
          />
          <Route path="/provider/schedule" element={<ProviderSchedulePage />} />
          <Route path="/provider/services" element={<ProviderServicesPage />} />
          <Route path="/provider/kpi" element={<ProviderKpiPage />} />
          <Route path="/provider/growth-hub" element={<ProviderGrowthHubPage />} />
          <Route
            path="/provider/verification-center"
            element={<ProviderVerificationCenterPage />}
          />
          <Route
            path="/provider/verification-history"
            element={<ProviderVerificationHistoryPage />}
          />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route
            path="/provider/profile/edit"
            element={<EditProviderProfile />}
          />
        </Route>
      </Route>

      {/* ================= ROOT ================= */}
      <Route path="/" element={<AuthRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
