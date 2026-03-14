const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/productmiddle");

// 🟢 Get all orders for the logged-in admin
router.get("/", auth, async (req, res) => {
  try {
    const adminphone = req.adminphone || req.query.phone;

    if (!adminphone)
      return res.status(400).json({ message: "Admin phone missing" });

    const orders = await Order.find({ adminphone }).sort({ createdAt: -1 }).populate("userId", "name phone")
      .sort({ createdAt: -1 });
    res.json(orders);;
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});

// 🟢 Assign delivery boy and mark as shipped
router.put("/:id/assign", auth, async (req, res) => {
  try {
    const { deliveryBoyName, deliveryBoyPhone } = req.body;

    if (!deliveryBoyName || !deliveryBoyPhone)
      return res.status(400).json({ message: "Missing delivery boy details" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        deliveryBoyName,
        deliveryBoyPhone,
        status: "Shipped",
      },
      { new: true }
    ).populate("userId", "name phone");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Delivery assigned successfully", order });
  } catch (err) {
    console.error("Error assigning delivery:", err);
    res.status(500).json({
      message: "Failed to assign delivery",
      error: err.message,
    });
  }
});

module.exports = router;
