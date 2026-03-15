import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSubCategory } from "../../../services/subCategoryService";
import { fetchCategories } from "../../../services/categoryService";

export default function CreateSubCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [businessLevel, setBusinessLevel] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [pricingModel, setPricingModel] = useState("STANDARD");
  const [pricingUnitType, setPricingUnitType] = useState("UNIT");
  const [pricingRate, setPricingRate] = useState("");
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

    const parsedBasePrice = Number(basePrice || 0);
    if (!Number.isFinite(parsedBasePrice) || parsedBasePrice < 0) {
      setError("Base price must be a non-negative number");
      return;
    }
    const parsedPricingRate = Number(pricingRate || 0);
    if (!Number.isFinite(parsedPricingRate) || parsedPricingRate < 0) {
      setError("Pricing rate must be a non-negative number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createSubCategory({
        name: name.trim(),
        category_id: categoryId,
        basePrice: parsedBasePrice,
        pricingModel,
        pricingUnitType,
        pricingRate: parsedPricingRate,
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
            onChange={(e) => {
              const selectedId = e.target.value;
              setCategoryId(selectedId);
              const selected = categories.find((cat) => cat._id === selectedId);
              setBusinessLevel(selected?.businessLevel || "");
            }}
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

        <div>
          <label className="block mb-1 font-medium">
            Business Level
          </label>
          <input
            className="w-full border p-2 rounded bg-gray-100"
            value={businessLevel || "Auto from category"}
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Base Price (Rs)
          </label>
          <input
            type="number"
            min="0"
            className="w-full border p-2 rounded"
            placeholder="e.g. 499"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 font-medium">Pricing Model</label>
            <select
              className="w-full border p-2 rounded bg-white"
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value)}
            >
              <option value="STANDARD">Standard</option>
              <option value="QUANTITY_BASED">Quantity Based</option>
              <option value="AREA_BASED">Area Based</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Pricing Unit</label>
            <select
              className="w-full border p-2 rounded bg-white"
              value={pricingUnitType}
              onChange={(e) => setPricingUnitType(e.target.value)}
            >
              <option value="UNIT">Unit</option>
              <option value="SQFT">Sq Ft</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Rate (Rs)</label>
            <input
              type="number"
              min="0"
              className="w-full border p-2 rounded"
              placeholder="e.g. 180"
              value={pricingRate}
              onChange={(e) => setPricingRate(e.target.value)}
            />
          </div>
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
