import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateCategory, deleteCategory } from "../services/categoryService";

export default function CategoryTable({
  categories,
  refresh,
  search,
  statusFilter,
}) {
  const navigate = useNavigate();

  /* ================= BULK STATE ================= */
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected =
    selectedIds.length > 0 &&
    selectedIds.length === categories.length;

  /* ================= FILTER ================= */
  const filtered = categories.filter((cat) => {
    const q = search.toLowerCase();

    const matchesSearch =
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || cat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= SELECT HANDLERS ================= */
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* ================= BULK ACTIONS ================= */
  const bulkUpdateStatus = async (status) => {
    await Promise.all(
      selectedIds.map((id) =>
        updateCategory(id, { status })
      )
    );
    setSelectedIds([]);
    refresh();
  };

  const bulkDelete = async () => {
    if (
      !window.confirm(
        `Delete ${selectedIds.length} categories?`
      )
    )
      return;

    await Promise.all(
      selectedIds.map((id) => deleteCategory(id))
    );
    setSelectedIds([]);
    refresh();
  };

  /* ================= SINGLE ACTIONS ================= */
  const toggleStatus = async (cat) => {
    await updateCategory(cat._id, {
      status: cat.status === "active" ? "inactive" : "active",
    });
    refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* ================= BULK BAR ================= */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
          <div className="text-sm text-gray-700">
            {selectedIds.length} selected
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdateStatus("active")}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Activate
            </button>

            <button
              onClick={() => bulkUpdateStatus("inactive")}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Deactivate
            </button>

            <button
              onClick={bulkDelete}
              className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b sticky top-0 z-10">
          <tr>
            <th className="p-3 text-center w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-3 text-left font-semibold">
              Category
            </th>
            <th className="p-3 text-center font-semibold w-32">
              Status
            </th>
            <th className="p-3 text-right font-semibold w-32">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan="4"
                className="p-8 text-center text-gray-500"
              >
                No categories found
              </td>
            </tr>
          )}

          {filtered.map((cat) => (
            <tr
              key={cat._id}
              className="border-t hover:bg-gray-50"
            >
              {/* CHECKBOX */}
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cat._id)}
                  onChange={() => toggleSelectOne(cat._id)}
                />
              </td>

              {/* CATEGORY INFO */}
              <td className="p-3">
                <div className="font-medium">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-500">
                  /{cat.slug}
                </div>
              </td>

              {/* STATUS TOGGLE */}
              <td className="p-3 text-center">
                <button
                  onClick={() => toggleStatus(cat)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    cat.status === "active"
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 bg-white rounded-full transform transition ${
                      cat.status === "active"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </td>

              {/* ACTIONS */}
              <td className="p-3 text-right space-x-3">
                <button
                  onClick={() =>
                    navigate(
                      `/admin/categories/${cat._id}/edit`
                    )
                  }
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteCategory(cat._id).then(refresh)
                  }
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
