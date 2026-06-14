import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api, { SOCKET_URL } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import { MapPin, Phone, Package, Navigation, CheckCircle2, Power } from "lucide-react";

const RiderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [locationError, setLocationError] = useState("");
  const { user } = useAuth();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    socketRef.current = io(SOCKET_URL);

    const interval = setInterval(fetchOrders, 15000);

    return () => {
      socketRef.current?.disconnect();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(interval);
    };
  }, []);

  const toggleTracking = () => {
    if (tracking) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setTracking(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationError("");
    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Update backend
        try {
          await api.put("/users/location", { lat: latitude, lng: longitude });
        } catch (err) {
          console.error(err);
        }

        // Broadcast via socket for real-time admin view
        socketRef.current?.emit("riderLocationUpdate", {
          riderId: user._id,
          name: user.name,
          vehicleNumber: user.vehicleNumber,
          lat: latitude,
          lng: longitude,
        });
      },
      (err) => {
        setLocationError("Unable to access location: " + err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const toggleActiveStatus = async () => {
    try {
      const { data } = await api.put("/users/toggle-status");
      setIsActive(data.isActive);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

const acceptOrder = async (orderId) => {
  try {
    await api.put(`/orders/${orderId}/accept`);
    fetchOrders();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to accept order"
    );
  }
};

const availableOrders = orders.filter(
  (o) => !o.assignedRider && o.status === "Pending"
);

const activeOrders = orders.filter(
  (o) =>
    o.status === "Accepted" ||
    o.status === "Picked Up"
);

const completedOrders = orders.filter(
  (o) => o.status === "Delivered"
);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">My Deliveries</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name}!</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleActiveStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            <Power className="w-4 h-4" />
            {isActive ? "Online" : "Offline"}
          </button>

          <button
            onClick={toggleTracking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tracking ? "bg-primary-600 text-white shadow-soft" : "btn-secondary"
            }`}
          >
            <Navigation className="w-4 h-4" />
            {tracking ? "Sharing Location" : "Share Live Location"}
          </button>
        </div>
      </div>

      {locationError && (
        <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl mb-4">
          {locationError}
        </div>
      )}

    
  {/* Available Orders */}

<div className="card mb-6">
  <h2 className="font-bold text-slate-800 mb-4">
    Available Orders ({availableOrders.length})
  </h2>

  {availableOrders.length === 0 ? (
    <p className="text-sm text-slate-400 text-center py-6">
      No available orders.
    </p>
  ) : (
    <div className="space-y-4">
      {availableOrders.map((order) => (
        <div
          key={order._id}
          className="border border-slate-100 rounded-2xl p-4"
        >
          <div className="flex justify-between mb-3">
            <div>
              <p className="font-bold text-slate-800">
                {order.orderNumber}
              </p>
              <p className="text-sm text-slate-500">
                {order.customerName}
              </p>
            </div>

            <StatusBadge status={order.status} />
          </div>

          <p className="text-sm text-slate-600 mb-3">
            {order.deliveryAddress}
          </p>

          <button
            onClick={() => acceptOrder(order._id)}
            className="btn-primary w-full"
          >
            Accept Order
          </button>
        </div>
      ))}
    </div>
  )}


</div>

{/* Active Deliveries */}

{/* Active Deliveries */}
<div className="card mb-6">
  <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
    <Package className="w-5 h-5 text-primary-500" />
    Active Deliveries ({activeOrders.length})
  </h2>

  {activeOrders.length === 0 ? (
    <p className="text-sm text-slate-400 text-center py-8">
      No active deliveries.
    </p>
  ) : (
    <div className="space-y-4">
      {activeOrders.map((order) => (
        <div
          key={order._id}
          className="border border-slate-100 rounded-2xl p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-slate-800">
                {order.orderNumber}
              </p>
              <p className="text-sm text-slate-500">
                {order.customerName}
              </p>
            </div>

            <StatusBadge status={order.status} />
          </div>

          <p className="text-sm text-slate-600 mb-3">
            {order.deliveryAddress}
          </p>

          <div className="space-y-2">
            {order.status === "Accepted" && (
              <button
                onClick={() =>
                  updateStatus(order._id, "Picked Up")
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
              >
                Pick Up Order
              </button>
            )}

            {order.status === "Picked Up" && (
              <button
                onClick={() =>
                  updateStatus(order._id, "Delivered")
                }
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>


{/* Completed */}
      <div className="card">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Completed Today ({completedOrders.length})
        </h2>
        {completedOrders.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No completed deliveries yet.</p>
        ) : (
          <div className="space-y-2">
            {completedOrders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-sm text-slate-700">{order.orderNumber}</p>
                  <p className="text-xs text-slate-400">{order.customerName}</p>
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

export default RiderDashboard;
