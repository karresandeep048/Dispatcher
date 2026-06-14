import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Truck, AlertCircle, Store, Bike } from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "rider",
    phone: "",
    storeName: "",
    vehicleNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(form);
      navigate(data.role === "admin" ? "/admin" : "/rider");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-emerald-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-soft mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Join DispatchHub today</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "admin" })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  form.role === "admin"
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <Store className={`w-6 h-6 ${form.role === "admin" ? "text-primary-600" : "text-slate-400"}`} />
                <span className="text-sm font-semibold text-slate-700">Store Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "rider" })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  form.role === "rider"
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <Bike className={`w-6 h-6 ${form.role === "rider" ? "text-primary-600" : "text-slate-400"}`} />
                <span className="text-sm font-semibold text-slate-700">Delivery Rider</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>

            {form.role === "admin" ? (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Store Name</label>
                <input
                  name="storeName"
                  value={form.storeName}
                  onChange={handleChange}
                  placeholder="Green Valley Pharmacy"
                  className="input-field"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Vehicle Number
                </label>
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="MH-12-AB-1234"
                  className="input-field"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
