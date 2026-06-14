const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/users/riders
// @desc    Get all riders (admin only)
router.get("/riders", protect, adminOnly, async (req, res) => {
  try {
    const riders = await User.find({ role: "rider" }).select("-password");
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/location
// @desc    Update rider's current location
router.put("/location", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const user = await User.findById(req.user._id);
    user.currentLocation = { lat, lng, updatedAt: new Date() };
    await user.save();

    res.json({ message: "Location updated", currentLocation: user.currentLocation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/locations
// @desc    Get real-time locations of all active riders (admin only)
router.get("/locations", protect, adminOnly, async (req, res) => {
  try {
    const riders = await User.find({ role: "rider", isActive: true }).select(
      "name vehicleNumber currentLocation phone"
    );
    res.json(riders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/earnings
// @desc    Get earnings dashboard for logged-in rider
router.get("/earnings", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const deliveredOrders = await Order.find({
      assignedRider: req.user._id,
      status: "Delivered",
    }).sort({ deliveredAt: -1 });

    const totalDeliveries = deliveredOrders.length;

    res.json({
      earnings: user.earnings,
      totalDeliveries,
      recentDeliveries: deliveredOrders.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/toggle-status
// @desc    Toggle rider active status (online/offline)
router.put("/toggle-status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
