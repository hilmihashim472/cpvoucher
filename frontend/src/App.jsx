import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { AuthProvider } from "./hooks/useAuth.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import LandingPage from "./pages/shared/Landing";
import HomePage from "./pages/user/Home";
import CategoriesPage from "./pages/user/Categories";
import VoucherDetailPage from "./pages/user/VoucherDetail";
import CartPage from "./pages/user/Cart";
import OrderHistoryPage from "./pages/user/OrderHistory";
import ProfileUserPage from "./pages/user/ProfileUser";
import LoginPage from "./pages/shared/Login";
import RegisterPage from "./pages/shared/Register";
import ForgotPasswordPage from "./pages/shared/ForgotPassword";
import AdminDashboardPage from "./pages/admin/Dashboard";
import VoucherListPage from "./pages/admin/VoucherList";
import AddVoucherPage from "./pages/admin/AddVoucher";
import UserListPage from "./pages/admin/UserList";
import OrderListPage from "./pages/admin/OrderList";
import CategoryListPage from "./pages/admin/CategoryList";
import AddCategoryPage from "./pages/admin/AddCategory";
import ProfileAdminPage from "./pages/admin/ProfileAdmin";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vouchers/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <VoucherDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders-history"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ProfileUserPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/vouchers"
          element={
            <AdminRoute>
              <VoucherListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/vouchers/add"
          element={
            <AdminRoute>
              <AddVoucherPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <OrderListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <CategoryListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories/add"
          element={
            <AdminRoute>
              <AddCategoryPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <ProfileAdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
