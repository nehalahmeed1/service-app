import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";

import AdminDashboard from "@/pages/admin/dashboard/AdminDashboard";
import Categories from "@/pages/admin/categories/Categories";
import SubCategories from "@/pages/admin/subCategories/SubCategories";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/sub-categories" element={<SubCategories />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
