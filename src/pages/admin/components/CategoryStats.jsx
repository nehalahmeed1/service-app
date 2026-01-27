export default function CategoryStats({ categories }) {
  const total = categories.length;
  const active = categories.filter(c => c.status === "active").length;
  const inactive = total - active;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Stat label="Total" value={total} />
      <Stat label="Active" value={active} color="green" />
      <Stat label="Inactive" value={inactive} color="gray" />
    </div>
  );
}

function Stat({ label, value, color = "black" }) {
  return (
    <div className="bg-white border rounded p-4 text-center">
      <div className={`text-2xl font-bold text-${color}-600`}>
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
