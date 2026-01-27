import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubCategory } from "../../../services/subCategoryService";
import { fetchCategories } from "../../../services/categoryService";

export default function CreateSubCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH CATEGORIES ================= */
  const loadCategories = async () => {
    try {
      const res = await fetchCategories({
        page: 1,
        limit: 100,
        status: "active",
      });

      const list =
        res?.data?.data ||
        res?.data ||
        [];

      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !categoryId) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createSubCategory({
        name: name.trim(),
        category_id: categoryId,
      });

      navigate("/admin/sub-categories");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create sub-category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        Create Sub-Category
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sub-Category Name */}
        <div>
          <label className="block mb-1 font-medium">
            Sub-Category Name
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="e.g. Bathroom Plumbing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block mb-1 font-medium">
            Parent Category
          </label>
          <select
            className="w-full border p-2 rounded bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select Category</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Sub-Category"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
