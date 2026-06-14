import React, { useEffect, useState } from "react";
import api from "../utils/api";
import StatusBadge from "../components/StatusBadge";
import { Plus, X, Truck, MapPin, Phone, Package } from "lucide-react";

const emptyItem = { name: "", quantity: 1, price: 0 };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // order being assigned
  const [selectedRider, setSelectedRider] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    items: [{ ...emptyItem }],
    deliveryFee: 30,
    notes: "",
  });

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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = field === "name" ? value : Number(value);
    setForm({ ...form, items });
  };

  const addItemRow = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });

  const removeItemRow = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const totalAmount = form.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/orders", {
        ...form,
        totalAmount,
      });
      setShowModal(false);
      setForm({
        customerName: "",
        customerPhone: "",
        deliveryAddress: "",
        items: [{ ...emptyItem }],
        deliveryFee: 30,
        notes: "",
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRider) return;
    try {
      await api.put(`/orders/${assignModal._id}/assign`, { riderId: selectedRider });
      setAssignModal(null);
      setSelectedRider("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign rider");
    }
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
          <h1 className="text-2xl font-extrabold text-slate-800">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Create, dispatch and track deliveries</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No orders yet. Create your first order.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-3 pr-4 font-semibold">Order #</th>
                <th className="pb-3 pr-4 font-semibold">Customer</th>
                <th className="pb-3 pr-4 font-semibold">Address</th>
                <th className="pb-3 pr-4 font-semibold">Amount</th>
                <th className="pb-3 pr-4 font-semibold">Rider</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-slate-700">{order.orderNumber}</td>
                  <td className="py-3 pr-4">
                    <p className="text-slate-700">{order.customerName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.customerPhone}
                    </p>
                  </td>
                  <td className="py-3 pr-4 max-w-xs">
                    <p className="text-slate-600 flex items-start gap-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                      {order.deliveryAddress}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-slate-700">
                    ₹{order.totalAmount + order.deliveryFee}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {order.assignedRider ? order.assignedRider.name : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => setAssignModal(order)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" /> Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">Create New Order</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Customer Name</label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="input-field"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
                  <input
                    required
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="input-field"
                    placeholder="+91 90000 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  className="input-field resize-none"
                  placeholder="123 Main St, Apt 4B, Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Items</label>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        required
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                        className="input-field flex-1"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="input-field w-16"
                        title="Quantity"
                      />
                      <input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                        className="input-field w-24"
                        placeholder="Price ₹"
                        title="Price per item"
                      />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItemRow(idx)} className="text-slate-400 hover:text-rose-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-primary-600 text-sm font-semibold mt-2 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add item
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.deliveryFee}
                    onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Total Amount</label>
                  <div className="input-field bg-slate-100 font-bold text-slate-700">
                    ₹{totalAmount + Number(form.deliveryFee || 0)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Call before delivery"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Creating..." : "Create Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Rider Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-soft w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-800">Assign Rider</h2>
              <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                Order <span className="font-semibold text-slate-700">{assignModal.orderNumber}</span> to:
              </p>
              {riders.length === 0 ? (
                <p className="text-sm text-slate-400">No riders available.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {riders.map((rider) => (
                    <label
                      key={rider._id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        selectedRider === rider._id
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rider"
                        value={rider._id}
                        checked={selectedRider === rider._id}
                        onChange={(e) => setSelectedRider(e.target.value)}
                        className="accent-primary-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700">{rider.name}</p>
                        <p className="text-xs text-slate-400">{rider.vehicleNumber || "No vehicle"}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${rider.isActive ? "bg-emerald-400" : "bg-slate-300"}`}></span>
                    </label>
                  ))}
                </div>
              )}
              <button onClick={handleAssign} disabled={!selectedRider} className="btn-primary w-full">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
