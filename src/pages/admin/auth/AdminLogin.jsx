import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin, firebaseAdminLogin } from "../../../services/adminAuthService";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError("");

    try {
      /**
       * 🔥 STEP 1: Firebase Auth
       */
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const firebaseToken = await cred.user.getIdToken();

      /**
       * 🔥 STEP 2: Sync with Backend (create/find admin)
       */
      const data = await firebaseAdminLogin(firebaseToken);

      if (data.role !== "ADMIN" && data.role !== "SUPER_ADMIN") {
        throw new Error("Not authorized as admin");
      }

      /**
       * 🔥 STEP 3: Store session
       */
      if (!data?.token) {
        throw new Error("Admin token missing. Please login again.");
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_role", data.role);

      navigate("/admin", { replace: true });

    } catch (error) {
      console.error(error);

      /**
       * 🔁 OPTIONAL FALLBACK: manual login (legacy)
       */
      try {
        const data = await loginAdmin(form);

        if (!data?.token) {
          throw new Error("Legacy admin login is not supported for this API");
        }

        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_role", data.admin.role);
        localStorage.setItem("admin_status", data.admin.status);

        navigate("/admin", { replace: true });
      } catch (err) {
        setApiError(
          err?.response?.data?.message || "Invalid email or password"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h2>

        {apiError && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border p-2 rounded pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2 text-gray-600"
              >
                👁️
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don’t have an admin account?{" "}
          <Link
            to="/admin/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
