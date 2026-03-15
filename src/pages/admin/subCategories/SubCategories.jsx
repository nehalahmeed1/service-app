import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchSubCategories,
  toggleSubCategoryStatus,
  deleteSubCategory,
  bulkUploadSubCategories,
  bulkUpdateSubCategoryPricing,
} from "../../../services/subCategoryService";

export default function SubCategories() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [businessLevel, setBusinessLevel] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkPricingModel, setBulkPricingModel] = useState("STANDARD");
  const [bulkPricingUnitType, setBulkPricingUnitType] = useState("UNIT");
  const [bulkPricingRate, setBulkPricingRate] = useState("");

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchSubCategories({
        search,
        status,
        businessLevel,
        page: 1,
        limit: 50,
      });
      setList(res?.data || []);
      setSelectedIds((prev) =>
        prev.filter((id) => (res?.data || []).some((item) => item._id === id))
      );
    } catch {
      setError("Failed to load sub-categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, businessLevel]);

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

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!list.length) return;
    const allIds = list.map((item) => item._id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const handleApplyBulkPricing = async () => {
    if (!selectedIds.length) {
      alert("Select at least one sub-category");
      return;
    }

    const parsedRate = Number(bulkPricingRate || 0);
    if (!Number.isFinite(parsedRate) || parsedRate < 0) {
      alert("Rate must be a non-negative number");
      return;
    }

    try {
      await bulkUpdateSubCategoryPricing(
        selectedIds.map((id) => ({
          id,
          pricingModel: bulkPricingModel,
          pricingUnitType: bulkPricingUnitType,
          pricingRate: parsedRate,
        }))
      );
      alert("Pricing updated for selected sub-categories");
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to apply bulk pricing");
    }
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

        <select
          className="border px-3 py-2 rounded"
          value={businessLevel}
          onChange={(e) => setBusinessLevel(e.target.value)}
        >
          <option value="all">All Levels</option>
          <option value="INDIVIDUAL">Individual</option>
          <option value="SMALL_TEAM">Small Team</option>
          <option value="ENTERPRISE">Enterprise</option>
        </select>
      </div>

      <div className="mb-4 bg-white border rounded p-3 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Pricing Model</label>
          <select
            className="border px-3 py-2 rounded bg-white"
            value={bulkPricingModel}
            onChange={(e) => setBulkPricingModel(e.target.value)}
          >
            <option value="STANDARD">Standard</option>
            <option value="QUANTITY_BASED">Quantity Based</option>
            <option value="AREA_BASED">Area Based</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Pricing Unit</label>
          <select
            className="border px-3 py-2 rounded bg-white"
            value={bulkPricingUnitType}
            onChange={(e) => setBulkPricingUnitType(e.target.value)}
          >
            <option value="UNIT">Unit</option>
            <option value="SQFT">Sq Ft</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Rate (Rs)</label>
          <input
            type="number"
            min="0"
            className="border px-3 py-2 rounded w-36"
            placeholder="e.g. 150"
            value={bulkPricingRate}
            onChange={(e) => setBulkPricingRate(e.target.value)}
          />
        </div>
        <button
          onClick={handleApplyBulkPricing}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Apply to Selected ({selectedIds.length})
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={list.length > 0 && list.every((item) => selectedIds.includes(item._id))}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Business Level</th>
              <th className="px-4 py-3 text-left">Pricing Model</th>
              <th className="px-4 py-3 text-left">Pricing Unit</th>
              <th className="px-4 py-3 text-left">Rate (Rs)</th>
              <th className="px-4 py-3 text-left">Base Price (Rs)</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item._id)}
                    onChange={() => toggleSelectOne(item._id)}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">
                  {item.category_id?.name}
                </td>
                <td className="px-4 py-3">
                  {item.businessLevel || item.category_id?.businessLevel}
                </td>
                <td className="px-4 py-3">
                  {item.pricingModel || "STANDARD"}
                </td>
                <td className="px-4 py-3">
                  {item.pricingUnitType || "UNIT"}
                </td>
                <td className="px-4 py-3">
                  {Number(item.pricingRate || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {Number(item.basePrice || 0).toLocaleString()}
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
                    <div className="relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
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
