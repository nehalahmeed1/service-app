import { Clock, PlayCircle, CheckCircle, XCircle } from "lucide-react";

const statusConfig = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    count: 12,
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: PlayCircle,
    color: "text-blue-600",
    bg: "bg-blue-100",
    count: 8,
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
    count: 54,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    count: 3,
  },
];

const OperationalStatus = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        ⚙️ Operational Status
      </h3>

      <div className="space-y-4">
        {statusConfig.map(
          ({ key, label, icon: Icon, color, bg, count }) => (
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

export default OperationalStatus;
