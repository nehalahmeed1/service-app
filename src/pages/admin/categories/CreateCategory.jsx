import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { createCategory } from "../services/categoryService";

export default function CreateCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dirty, setDirty] = useState(false);

  /* ================= SLUG ================= */
  const slug = slugify(name || "", { lower: true, strict: true });

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

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      await createCategory({ name, status });
      setDirty(false);
      setSuccess("Category created successfully");

      setTimeout(() => {
        navigate("/admin/categories");
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow border w-full p-6">
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4">
          <div>
            <h1 className="text-2xl font-bold">Create Category</h1>
            <p className="text-sm text-gray-500">
              Categories help organize services across the platform
            </p>
          </div>

          {/* STATUS TOGGLE */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {status === "active" ? "Active" : "Inactive"}
            </span>
            <button
              onClick={() => {
                setDirty(true);
                setStatus(status === "active" ? "inactive" : "active");
              }}
              className={`relative w-11 h-6 rounded-full transition ${
                status === "active"
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition ${
                  status === "active" ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 text-green-700 p-3 rounded text-sm">
            {success}
          </div>
        )}

        {/* ================= FORM ================= */}
        <form
          onSubmit={submitHandler}
          className="space-y-6 max-w-3xl"
        >
          {/* NAME */}
          <div>
            <label className="block font-medium mb-1">
              Category Name
            </label>
            <input
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-black"
              placeholder="e.g. Electrical"
              value={name}
              onChange={(e) => {
                setDirty(true);
                setName(e.target.value);
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Visible to users across the platform
            </p>
          </div>

          {/* SLUG */}
          <div>
            <label className="block font-medium mb-1">Slug</label>
            <input
              disabled
              value={slug || "auto-generated"}
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated, immutable, used in URLs
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !dirty}
              className={`px-5 py-2 rounded text-white ${
                loading || !dirty
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-900"
              }`}
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
