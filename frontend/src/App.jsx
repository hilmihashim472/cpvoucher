import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/user/Home";
import CategoriesPage from "./pages/user/Categories";
import VoucherDetailPage from "./pages/user/VoucherDetail";
import CartPage from "./pages/user/Cart";
import OrderHistoryPage from "./pages/user/VoucherHistory";
import ProfileUserPage from "./pages/user/ProfileUser";
import LoginPage from "./pages/shared/Login";
import RegisterPage from "./pages/shared/Register";
import AdminDashboardPage from "./pages/admin/Dashboard";
import VoucherListPage from "./pages/admin/VoucherList";
import AddVoucherPage from "./pages/admin/AddVoucher";
import UserListPage from "./pages/admin/UserList";
import OrderListPage from "./pages/admin/OrderList";
import CategoryListPage from "./pages/admin/CategoryList";
import AddCategoryPage from "./pages/admin/AddCategory";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/profile" element={<ProfileUserPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
      </Routes>
    </>
  );
}

export default App;
