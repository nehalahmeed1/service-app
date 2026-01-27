export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
