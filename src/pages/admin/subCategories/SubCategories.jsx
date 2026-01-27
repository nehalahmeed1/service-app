import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSubCategories,
  toggleSubCategoryStatus,
  deleteSubCategory,
  bulkUploadSubCategories,
} from "../../../services/subCategoryService";

export default function SubCategories() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchSubCategories({
        search,
        status,
        page: 1,
        limit: 50,
      });
      setList(res?.data || []);
    } catch {
      setError("Failed to load sub-categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status]);

  /* ================= BULK UPLOAD ================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await bulkUploadSubCategories(formData);
      alert("Bulk upload successful");
      loadData();
    } catch (err) {
      alert(
        err?.response?.data?.message || "Bulk upload failed"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ================= ACTIONS ================= */
  const handleToggleStatus = async (id) => {
    await toggleSubCategoryStatus(id);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-category?")) return;
    await deleteSubCategory(id);
    loadData();
  };

  return (
    <div>
      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sub-Categories</h1>
          <p className="text-gray-500">
            Manage sub-categories under each category
          </p>
        </div>

        <div className="flex gap-2">
          <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer text-sm">
            {uploading ? "Uploading..." : "Bulk Upload"}
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={() => navigate("/admin/sub-categories/create")}
            className="bg-black text-white px-4 py-2 rounded"
          >
            + Create Sub-Category
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex gap-3 mb-4">
        <input
          className="border px-3 py-2 rounded w-64"
          placeholder="Search by name or slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">
                  {item.category_id?.name}
                </td>
                <td className="px-4 py-3">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.status === "active"}
                      onChange={() => handleToggleStatus(item._id)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() =>
                      navigate(`/admin/sub-categories/${item._id}/edit`)
                    }
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="text-red-600 text-center mt-4">{error}</p>
      )}
    </div>
  );
}
