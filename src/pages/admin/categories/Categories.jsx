import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryTable from "../components/CategoryTable";
import { getCategoriesPaginated } from "../services/categoryService";

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);

      const res = await getCategoriesPaginated({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });

      setCategories(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, [search, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-gray-500">
            Manage service categories used across the platform
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/categories/create")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Create Category
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Search by name or slug"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-center text-gray-500">
          Loading categories…
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          refresh={() => fetchCategories(meta.page)}
          search={search}
          statusFilter={statusFilter}
        />
      )}

      {/* PAGINATION */}
      <div className="flex justify-between items-center text-sm">
        <span>
          Page {meta.page} of {meta.pages}
        </span>

        <div className="space-x-2">
          <button
            disabled={meta.page <= 1}
            onClick={() => fetchCategories(meta.page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={meta.page >= meta.pages}
            onClick={() => fetchCategories(meta.page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
