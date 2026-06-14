const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, default: 30 },
status: {
  type: String,
  enum: [
    "Pending",
    "Accepted",
    "Picked Up",
    "Delivered",
    "Cancelled",
  ],
  default: "Pending",
},
    assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dispatchedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
