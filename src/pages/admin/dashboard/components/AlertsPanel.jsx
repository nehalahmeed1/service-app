import { AlertTriangle, Users, Layers, CreditCard } from "lucide-react";

// Temporary mock alerts (replace with API later)
const alerts = [
  {
    key: "pendingProviders",
    label: "Pending Provider Approvals",
    count: 3,
    icon: Users,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
  },
  {
    key: "pendingCategories",
    label: "Pending Category Changes",
    count: 2,
    icon: Layers,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    key: "failedPayments",
    label: "Failed Payments",
    count: 1,
    icon: CreditCard,
    color: "text-red-600",
    bg: "bg-red-100",
  },
];

const AlertsPanel = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-gray-800">
          Alerts & Risks
        </h3>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map(
          ({ key, label, count, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-sm text-gray-700">
                  {label}
                </span>
              </div>

              <span className="font-semibold text-gray-900">
                {count}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
