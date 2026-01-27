import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ padding: 40, border: "3px solid red" }}>
      <h1>ADMIN LAYOUT</h1>
      <Outlet />
    </div>
  );
}
