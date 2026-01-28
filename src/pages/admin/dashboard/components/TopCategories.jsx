import { Trophy } from "lucide-react";

// Temporary mock data (replace with API later)
const categories = [
  { name: "Home Cleaning", jobs: 120 },
  { name: "Plumbing", jobs: 92 },
  { name: "Electrical", jobs: 68 },
  { name: "AC Repair", jobs: 41 },
  { name: "Pest Control", jobs: 29 },
];

const TopCategories = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-semibold text-gray-800">
          Top Categories
        </h3>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {categories.map((cat, index) => (
          <li
            key={cat.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700">
                {cat.name}
              </span>
            </div>

            <span className="text-sm font-semibold text-gray-900">
              {cat.jobs} jobs
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopCategories;
