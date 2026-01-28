import {
  CalendarCheck,
  IndianRupee,
  Users,
  UserCheck,
} from "lucide-react";

const kpisConfig = [
  {
    key: "totalBookings",
    label: "Total Bookings",
    icon: CalendarCheck,
  },
  {
    key: "totalRevenue",
    label: "Revenue",
    icon: IndianRupee,
    prefix: "₹",
  },
  {
    key: "activeProviders",
    label: "Active Providers",
    icon: UserCheck,
  },
  {
    key: "activeCustomers",
    label: "Active Customers",
    icon: Users,
  },
];

const KpiGrid = ({ data }) => {
  const kpis = data?.kpis || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpisConfig.map(({ key, label, icon: Icon, prefix }) => (
        <div
          key={key}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {prefix}
              {kpis[key] ?? 0}
            </p>
          </div>

          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiGrid;
