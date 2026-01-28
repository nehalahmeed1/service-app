import { useEffect, useState } from "react";
import { fetchDashboardStats } from "@/services/dashboardService";

// Components
import DateFilter from "./components/DateFilter";
import KpiGrid from "./components/KpiGrid";
import TrendsChart from "./components/TrendsChart";
import OperationalStatus from "./components/OperationalStatus";
import TopCategories from "./components/TopCategories";
import AlertsPanel from "./components/AlertsPanel";
import RecentActivity from "./components/RecentActivity";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    fetchDashboardStats()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-600">Failed to load dashboard</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          📊 Admin Dashboard
        </h1>
        <DateFilter value={range} onChange={setRange} />
      </div>

      {/* KPI GRID */}
      <KpiGrid data={data} />

      {/* TRENDS */}
      <TrendsChart />

      {/* MID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OperationalStatus />
        <TopCategories />
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel />
        <RecentActivity />
      </div>
    </div>
  );
};

export default AdminDashboard;
