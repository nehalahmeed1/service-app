import { useState } from "react";
import { createCategory } from "../services/categoryService";

const CategoryForm = ({ refresh }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await createCategory({ name });
      setName("");
      refresh();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="bg-white p-4 rounded shadow">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Category name"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="bg-black text-white px-4 rounded"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
