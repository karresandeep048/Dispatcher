import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import {
  Package,
  Bike,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  MapPin,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordersRes, ridersRes] = await Promise.all([
        api.get("/orders"),
        api.get("/users/riders"),
      ]);
      setOrders(ordersRes.data);
      setRiders(ridersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    dispatched: orders.filter((o) => o.status === "Dispatched").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    activeRiders: riders.filter((r) => r.isActive).length,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your delivery operations in real-time
          </p>
        </div>
        <Link to="/admin/orders" className="btn-primary flex items-center gap-2">
          <Package className="w-4 h-4" />
          Manage Orders
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Package} label="Total Orders" value={stats.total} accent="bg-gradient-to-br from-primary-500 to-primary-700" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} accent="bg-gradient-to-br from-amber-400 to-amber-500" />
        <StatCard icon={TrendingUp} label="Dispatched" value={stats.dispatched} accent="bg-gradient-to-br from-blue-400 to-blue-600" />
        <StatCard icon={CheckCircle2} label="Delivered" value={stats.delivered} accent="bg-gradient-to-br from-emerald-400 to-emerald-600" />
        <StatCard icon={Bike} label="Active Riders" value={`${stats.activeRiders}/${riders.length}`} accent="bg-gradient-to-br from-violet-400 to-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 6).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{order.orderNumber}</p>
                    <p className="text-xs text-slate-400">{order.customerName} · {order.deliveryAddress}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Riders Snapshot */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Riders</h2>
            <Link
              to="/admin/tracking"
              className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" /> Track
            </Link>
          </div>

          {riders.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No riders registered yet.</p>
          ) : (
            <div className="space-y-3">
              {riders.map((rider) => (
                <div key={rider._id} className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 flex-shrink-0">
                    {rider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{rider.name}</p>
                    <p className="text-xs text-slate-400 truncate">{rider.vehicleNumber || "No vehicle info"}</p>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      rider.isActive ? "bg-emerald-400" : "bg-slate-300"
                    }`}
                    title={rider.isActive ? "Online" : "Offline"}
                  ></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
