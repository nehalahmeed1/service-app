import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminApprovalPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("admin_token");

  // Fetch pending admins
  const fetchPendingAdmins = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/admin/manage/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setAdmins(res.data);
    } catch (err) {
      setError("Failed to load pending admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  // Approve admin
  const approveAdmin = async (id) => {
    if (!window.confirm("Approve this admin?")) return;

    try {
      await axios.patch(
        `${API_BASE_URL}/admin/manage/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert("Approval failed");
    }
  };

  // Reject admin
  const rejectAdmin = async (id) => {
    if (!window.confirm("Reject this admin?")) return;

    try {
      await axios.patch(
        `${API_BASE_URL}/admin/manage/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert("Rejection failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Pending Admin Approvals
      </h1>

      {admins.length === 0 ? (
        <p className="text-gray-600">No pending admins</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-t">
                  <td className="p-2">{admin.name}</td>
                  <td className="p-2">{admin.email}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => approveAdmin(admin._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectAdmin(admin._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
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
