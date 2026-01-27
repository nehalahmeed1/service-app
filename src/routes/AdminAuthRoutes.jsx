import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRegister from "../pages/admin/auth/AdminRegister";
import AdminLogin from "../pages/admin/auth/AdminLogin";

const AdminAuthRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
};

export default AdminAuthRoutes;
