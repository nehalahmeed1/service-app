import { useEffect, useState } from "react";
import { fetchPendingProviders } from "@/services/approvalService";
import { Link } from "react-router-dom";

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED"];

export default function AdminApprovalPage() {
  const [providers, setProviders] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingProviders({
        status,
        search,
      });
      setProviders(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [status]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    loadProviders();
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Provider Approvals</h1>
        <p className="text-gray-500 text-sm">
          Review provider applications and verification status
        </p>
      </div>

      {/* TABS + SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* STATUS TABS */}
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                status === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="border rounded px-3 py-2 text-sm w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-800 text-white rounded text-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading providers...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded shadow p-6 text-gray-600">
          No providers found
        </div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Provider</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-left">Approved By</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr
                  key={provider._id}
                  className="border-t hover:bg-gray-50"
                >
                  {/* NAME (CLICKABLE) */}
                  <td className="p-3 font-medium text-blue-600">
                    <Link to={`/admin/approvals/${provider._id}`}>
                      {provider.name}
                    </Link>
                  </td>

                  <td className="p-3">{provider.email}</td>

                  {/* STATUS */}
                  <td className="p-3 text-center">
                    <StatusBadge status={provider.status} />
                  </td>

                  {/* APPROVED BY */}
                  <td className="p-3">
                    {provider.approval?.approvedBy
                      ? provider.approval.approvedBy.name
                      : "-"}
                  </td>

                  {/* DATE */}
                  <td className="p-3 text-sm text-gray-500">
                    {provider.approval?.approvedAt
                      ? new Date(
                          provider.approval.approvedAt
                        ).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
