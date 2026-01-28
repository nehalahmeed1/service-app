import { CalendarDays } from "lucide-react";

const ranges = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const DateFilter = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="w-4 h-4 text-gray-500" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {ranges.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateFilter;
