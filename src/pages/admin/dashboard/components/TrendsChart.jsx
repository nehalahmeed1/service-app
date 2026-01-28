import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

// Temporary mock data (replace with API later)
const mockTrendData = [
  { label: "Mon", bookings: 12, revenue: 2400 },
  { label: "Tue", bookings: 18, revenue: 3600 },
  { label: "Wed", bookings: 9, revenue: 1800 },
  { label: "Thu", bookings: 22, revenue: 4400 },
  { label: "Fri", bookings: 30, revenue: 6000 },
  { label: "Sat", bookings: 26, revenue: 5200 },
  { label: "Sun", bookings: 15, revenue: 3000 },
];

const TrendsChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">
            Bookings & Revenue Trend
          </h3>
        </div>

        <span className="text-xs text-gray-500">
          Last 7 days
        </span>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#94a3b8"
            />

            <Tooltip />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="bookings"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-600 rounded-full" />
          Bookings
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-600 rounded-full" />
          Revenue
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;
