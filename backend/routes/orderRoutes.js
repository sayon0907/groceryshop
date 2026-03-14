const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const DeliveredOrder = require("../models/DeliveredOrder");
const Product = require("../models/Product");
const { authMiddleware } = require("../middleware/auth");

/*
|--------------------------------------------------------------------
| CREATE NEW ORDER (User)
|--------------------------------------------------------------------
*/
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { products, totalAmount, lat, lng, address, date, adminphone,image } =
      req.body;
      console.log("Received order data:", req.body);
      
    if (!products || products.length === 0)
      return res.status(400).json({ success: false, message: "No products in order" });

    // Decrease product stock & remove if zero
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: `Product not found` });

      if (product.quantity < item.quantity)
        return res.status(400).json({
          success: false,
          message: `❌ Not enough stock for ${product.name}`,
        });

   product.quantity -= item.quantity;

// If quantity becomes negative (shouldn't happen), set it to 0
if (product.quantity < 0) product.quantity = 0;

await product.save(); // always save the product
    }

    // Create order
    const order = new Order({
      userId: req.user.id,
      products,
      totalAmount,
      location: { lat, lng, address },
      date,
      adminphone,      
      status: "Order Confirmed",
      deliveryEstimate: "Within 1 Day",
    });
    console.log("Creating order with data:", order);

    await order.save();
    res.json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

/*
|--------------------------------------------------------------------
| GET ACTIVE ORDERS (User)
|--------------------------------------------------------------------
*/
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      status: { $ne: "Delivered" },
    })
      .sort({ createdAt: -1 })
      .populate("products.productId", "name actualPrice images");

    res.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
|--------------------------------------------------------------------
| GET DELIVERED ORDERS (User)
|--------------------------------------------------------------------
*/
router.get("/my/delivered", authMiddleware, async (req, res) => {
  try {
    const deliveredOrders = await DeliveredOrder.find({ userId: req.user.id })
      .sort({ deliveredAt: -1 })
      .populate("products.productId", "name actualPrice images");

    res.json({ success: true, deliveredOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/*
|--------------------------------------------------------------------
| MARK ORDER AS DELIVERED (Admin / Delivery Boy)
|--------------------------------------------------------------------
*/
router.put("/deliver/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const delivered = await DeliveredOrder.create({
      userId: order.userId,
      products: order.products,
      totalAmount: order.totalAmount,
      location: order.location,
      adminPhone: order.adminphone,
      status: "Delivered",
      deliveredAt: new Date(),
      deliveryBoyName: order.deliveryBoyName,
      deliveryBoyPhone: order.deliveryBoyPhone,
    });

    await Order.findByIdAndDelete(order._id);

    res.json({ success: true, message: "Order marked as delivered", delivered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/*
|--------------------------------------------------------------------
| GET SINGLE ORDER (User)
|--------------------------------------------------------------------
*/
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    let order =
      (await Order.findById(req.params.id) 
        .populate("userId", "name email")
        .populate("products.productId", "name actualPrice images")) ||
      (await DeliveredOrder.findById(req.params.id)
        .populate("userId", "name email")
        .populate("products.productId", "name actualPrice images"));

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
});

/*
|--------------------------------------------------------------------
| GET ALL ORDERS (Admin)
|--------------------------------------------------------------------
*/
router.get("/admin/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("products.productId", "name actualPrice images");

    const deliveredOrders = await DeliveredOrder.find()
      .populate("userId", "name email")
      .populate("products.productId", "name actualPrice images");

    res.json({ success: true, activeOrders: orders, deliveredOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

/*
|--------------------------------------------------------------------
| UPDATE ORDER STATUS (Admin)
|--------------------------------------------------------------------
*/
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status || order.status;
    await order.save();

    res.json({ success: true, message: `Order marked as ${order.status}`, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

module.exports = router;
