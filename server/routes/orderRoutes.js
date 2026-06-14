const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create Order (Admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLocation,
      items,
      totalAmount,
      deliveryFee,
      notes,
    } = req.body;

    const orderNumber =
      "ORD-" + Date.now().toString().slice(-8);

    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryLocation,
      items,
      totalAmount,
      deliveryFee: deliveryFee || 30,
      notes,
      createdBy: req.user._id,
      status: "Pending",
    });

    const io = req.app.get("io");
    io.emit("orderCreated", order);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get Orders
router.get("/", protect, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      orders = await Order.find()
        .populate(
          "assignedRider",
          "name vehicleNumber phone"
        )
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        $or: [
          { assignedRider: null },
          { assignedRider: req.user._id },
        ],
      })
        .populate(
          "assignedRider",
          "name vehicleNumber phone"
        )
        .sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Rider Accept Order
router.put("/:id/accept", protect, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({
        message: "Only riders can accept orders",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.assignedRider) {
      return res.status(400).json({
        message: "Order already accepted",
      });
    }

    order.assignedRider = req.user._id;
    order.status = "Accepted";
    order.dispatchedAt = new Date();

    await order.save();

    const io = req.app.get("io");
    io.emit("orderUpdated", order);

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Order Status
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      req.user.role === "rider" &&
      (!order.assignedRider ||
        order.assignedRider.toString() !==
          req.user._id.toString())
    ) {
      return res.status(403).json({
        message:
          "Not authorized to update this order",
      });
    }

    order.status = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();

      if (order.assignedRider) {
        const rider = await User.findById(
          order.assignedRider
        );

        if (rider) {
          rider.earnings.total +=
            order.deliveryFee;

          rider.earnings.thisWeek +=
            order.deliveryFee;

          rider.earnings.thisMonth +=
            order.deliveryFee;

          await rider.save();
        }
      }
    }

    await order.save();

    const io = req.app.get("io");
    io.emit("orderUpdated", order);

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get Single Order
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    ).populate(
      "assignedRider",
      "name vehicleNumber phone"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;