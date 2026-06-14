import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Wallet, TrendingUp, Calendar, Package } from "lucide-react";

const Earnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await api.get("/users/earnings");
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Earnings Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track your delivery earnings and history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-6 h-6 text-primary-200" />
            <span className="text-xs font-medium text-primary-200 uppercase tracking-wide">All Time</span>
          </div>
          <p className="text-3xl font-extrabold">₹{data?.earnings?.total ?? 0}</p>
          <p className="text-sm text-primary-200 mt-1">Total Earnings</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">This Week</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">₹{data?.earnings?.thisWeek ?? 0}</p>
          <p className="text-sm text-slate-400 mt-1">Weekly Earnings</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-6 h-6 text-violet-500" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">This Month</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">₹{data?.earnings?.thisMonth ?? 0}</p>
          <p className="text-sm text-slate-400 mt-1">Monthly Earnings</p>
        </div>
      </div>

      {/* Recent deliveries */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" /> Recent Deliveries
          </h2>
          <span className="badge bg-primary-50 text-primary-600">
            {data?.totalDeliveries ?? 0} total
          </span>
        </div>

        {!data?.recentDeliveries || data.recentDeliveries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No completed deliveries yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentDeliveries.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-700">{order.orderNumber}</p>
                  <p className="text-xs text-slate-400">
                    {order.customerName} ·{" "}
                    {order.deliveredAt
                      ? new Date(order.deliveredAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-600">+₹{order.deliveryFee}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
