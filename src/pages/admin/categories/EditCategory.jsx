import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import slugify from "slugify";
import {
  getCategoryById,
  updateCategory,
} from "../services/categoryService";


export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dirty, setDirty] = useState(false);

  const [category, setCategory] = useState({
    name: "",
    slug: "",
    status: "active",
    createdBy: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await getCategoryById(id);
        setCategory(res.data);
      } catch {
        setError("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  /* ================= UNSAVED WARNING ================= */
  useEffect(() => {
    const warn = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* ================= CHANGE HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDirty(true);

    if (name === "name") {
      setCategory((prev) => ({
        ...prev,
        name: value,
        slug: slugify(value, { lower: true }),
      }));
    } else {
      setCategory((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = () => {
    setDirty(true);
    setCategory((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateCategory(id, category);
      setDirty(false);
      setSuccess("Category updated successfully");
      setTimeout(() => navigate("/admin/categories"), 1200);
    } catch {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded shadow p-6 w-full">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">Edit Category</h2>

          {/* STATUS TOGGLE */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {category.status === "active" ? "Active" : "Inactive"}
            </span>
            <button
              onClick={toggleStatus}
              className={`relative w-11 h-6 rounded-full transition focus:outline-none ${
                category.status === "active"
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition ${
                  category.status === "active"
                    ? "translate-x-5"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 text-green-700 p-2 rounded">
            {success}
          </div>
        )}

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
          <div>
            <label className="text-sm font-medium">Category Name</label>
            <input
              name="name"
              value={category.name}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <input
              value={category.slug}
              disabled
              className="w-full border p-2 rounded bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from category name
            </p>
          </div>

          {/* ================= AUDIT ================= */}
          <div className="text-xs text-gray-500 border-t pt-3">
            {category.createdAt && (
              <>
                Created by: {category.createdBy?.name || "System"} •{" "}
                {new Date(category.createdAt).toLocaleString()}
                <br />
              </>
            )}
            {category.updatedAt && (
              <>
                Updated by: {category.updatedBy?.name || "System"} •{" "}
                {new Date(category.updatedAt).toLocaleString()}
              </>
            )}
          </div>

          {/* ================= ACTIONS ================= */}
          <div className="flex gap-3 pt-4">
            <button
              disabled={saving || !dirty}
              className={`px-4 py-2 rounded text-white ${
                saving || !dirty
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Update Category"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="border px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
