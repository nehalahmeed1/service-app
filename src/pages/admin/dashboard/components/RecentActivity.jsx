import { CheckCircle, XCircle, UserPlus, ClipboardList } from "lucide-react";

const defaultActivities = [
  {
    id: 1,
    message: "New booking created (ID #1023)",
    time: "5 minutes ago",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: 2,
    message: "Provider John Doe approved",
    time: "20 minutes ago",
    icon: UserPlus,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: 3,
    message: "Payment failed for booking #1018",
    time: "1 hour ago",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    id: 4,
    message: "Booking #1009 marked as completed",
    time: "2 hours ago",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
];

const getTimeAgo = (value) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day ago`;
};

const RecentActivity = ({ data }) => {
  const activities =
    Array.isArray(data?.recentActivity) && data.recentActivity.length
      ? data.recentActivity.map((item) => ({
          id: item.id,
          message: item.message,
          time: getTimeAgo(item.time),
          icon: ClipboardList,
          color: "text-blue-600",
          bg: "bg-blue-100",
        }))
      : defaultActivities;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <h3 className="font-semibold text-gray-800 mb-4">
        🕒 Recent Activity
      </h3>

      {/* Timeline */}
      <ul className="space-y-4">
        {activities.map(
          ({ id, message, time, icon: Icon, color, bg }) => (
            <li key={id} className="flex gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${bg}`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>

              <div>
                <p className="text-sm text-gray-700">
                  {message}
                </p>
                <p className="text-xs text-gray-400">
                  {time}
                </p>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default RecentActivity;
