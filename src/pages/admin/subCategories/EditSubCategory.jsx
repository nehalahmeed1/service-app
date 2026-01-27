import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchSubCategoryById,
  updateSubCategory,
  toggleSubCategoryStatus,
} from "../../../services/subCategoryService";

export default function EditSubCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("inactive");
  const [categoryName, setCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
    loadSubCategory();
  }, []);

  const loadSubCategory = async () => {
    try {
      const res = await fetchSubCategoryById(id);

      // 🔍 DEBUG (remove later if you want)
      console.log("SubCategory API response:", res);

      /**
       * ✅ SUPPORT ALL POSSIBLE BACKEND SHAPES
       */
      const sub =
        res?.subCategory ||
        res?.data?.subCategory ||
        res?.data?.data ||
        res?.data ||
        null;

      if (!sub) {
        throw new Error("Sub-category not found in API response");
      }

      setName(sub.name || "");
      setSlug(sub.slug || "");
      setStatus(sub.status || "inactive");
      setCategoryName(sub.category_id?.name || "");
    } catch (err) {
      console.error("Load sub-category failed:", err);
      setError("Failed to load sub-category");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateSubCategory(id, { name });
      navigate("/admin/sub-categories");
    } catch {
      setError("Update failed");
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const handleToggleStatus = async () => {
    try {
      await toggleSubCategoryStatus(id);
      setStatus((prev) =>
        prev === "active" ? "inactive" : "active"
      );
    } catch {
      alert("Failed to update status");
    }
  };

  if (loading) {
    return <p className="text-center py-6">Loading...</p>;
  }

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        Edit Sub-Category
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NAME */}
        <div>
          <label className="block font-medium mb-1">
            Sub-Category Name
          </label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="block font-medium mb-1">Slug</label>
          <input
            className="w-full border p-2 rounded bg-gray-100"
            value={slug}
            disabled
          />
        </div>

        {/* CATEGORY (LOCKED) */}
        <div>
          <label className="block font-medium mb-1">
            Parent Category
          </label>
          <input
            className="w-full border p-2 rounded bg-gray-100"
            value={categoryName}
            disabled
          />
        </div>

        {/* STATUS TOGGLE (MATCH CATEGORY PAGE) */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Status</span>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`relative inline-flex h-6 w-11 rounded-full transition ${
              status === "active"
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                status === "active"
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button className="bg-black text-white px-4 py-2 rounded">
            Update
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
