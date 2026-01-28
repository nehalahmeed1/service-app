import { useEffect, useState } from "react";
import { fetchDashboardStats } from "@/services/dashboardService";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Admin Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Total Bookings" value={data.kpis.totalBookings} />
        <KpiCard title="Revenue" value={`₹${data.kpis.totalRevenue}`} />
        <KpiCard title="Active Providers" value={data.kpis.activeProviders} />
        <KpiCard title="Active Customers" value={data.kpis.activeCustomers} />
      </div>

      {/* JOB STATUS */}
      <div>
        <h2 className="font-semibold text-lg">Operational Status</h2>
        <ul className="list-disc ml-6">
          {data.jobStatus.map((item) => (
            <li key={item._id}>
              {item._id}: {item.count}
            </li>
          ))}
        </ul>
      </div>

      {/* ALERTS */}
      <div>
        <h2 className="font-semibold text-lg">⚠️ Alerts</h2>
        <p>Pending Providers: {data.alerts.pendingProviders}</p>
        <p>Pending Categories: {data.alerts.pendingCategoryChanges}</p>
        <p>Failed Payments: {data.alerts.failedPayments}</p>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4">
    <p className="text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
