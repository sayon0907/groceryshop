const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Admin = require("../models/Admin");
const Delivery = require("../models/deliveryboy");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Contact = require("../models/Usercontract");
const OrderHelp = require("../models/OrderHelp");
const DeliveredOrder = require("../models/DeliveredOrder");

const superAdminAuth = require("../middleware/superAdminMiddleware");


// =============================
// LOGIN
// =============================
router.post("/login", async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!phone || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (
      phone !== process.env.SUPERADMIN_PHONE ||
      email !== process.env.SUPERADMIN_EMAIL
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.SUPERADMIN_PASSWORD_HASH) {
      return res.status(500).json({ message: "Password hash not configured" });
    }

    const isMatch = await bcrypt.compare(
      password,
      process.env.SUPERADMIN_PASSWORD_HASH
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret missing" });
    }

    const token = jwt.sign(
      { role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "SuperAdmin Login Successful",
      token,
    });

  } catch (err) {
    console.error("SuperAdmin Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// =============================
// DASHBOARD (UPDATED)
// =============================
router.get("/dashboard", superAdminAuth, async (req, res) => {
  try {
    const users = await User.countDocuments();
    const admins = await Admin.countDocuments();
    const deliveryBoys = await Delivery.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    const contacts = await Contact.countDocuments();
    const orderHelp = await OrderHelp.countDocuments();

    const deliveredOrders = await DeliveredOrder.countDocuments({
      status: { $regex: "^delivered$", $options: "i" }
    });

    const cancelledOrders = await DeliveredOrder.countDocuments({
      status: { $regex: "^cancelled$", $options: "i" }
    });

    // 🔹 Pending Revenue (Active Orders)
    const pendingAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const pendingRevenue = pendingAgg[0]?.total || 0;

    // 🔹 Delivered Revenue
    const deliveredAgg = await DeliveredOrder.aggregate([
      {
        $match: { status: { $regex: "^delivered$", $options: "i" } }
      },
      {
        $group: { _id: null, total: { $sum: "$totalAmount" } }
      }
    ]);
    const deliveredRevenue = deliveredAgg[0]?.total || 0;

    const totalRevenue =   deliveredRevenue;

    // 🔹 Revenue Per Admin
    const adminList = await Admin.find().select("name");

    const revenuePerAdmin = await Promise.all(
      adminList.map(async (admin) => {

        const adminPendingAgg = await Order.aggregate([
          { $match: { adminId: admin._id } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const adminDeliveredAgg = await DeliveredOrder.aggregate([
          {
            $match: {
              adminId: admin._id,
              status: { $regex: "^delivered$", $options: "i" }
            }
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const adminPendingRevenue = adminPendingAgg[0]?.total || 0;
        const adminDeliveredRevenue = adminDeliveredAgg[0]?.total || 0;

        return {
          adminId: admin._id,
          adminName: admin.name,
          pendingRevenue: adminPendingRevenue,
          totalRevenue: adminPendingRevenue + adminDeliveredRevenue
        };
      })
    );

    res.json({
      users,
      admins,
      deliveryBoys,
      products,
      orders,
      contacts,
      orderHelp,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      pendingRevenue,
      totalRevenuePerAdmin: revenuePerAdmin,
      pendingRevenuePerAdmin: revenuePerAdmin.map(a => ({
        adminId: a.adminId,
        adminName: a.adminName,
        pendingRevenue: a.pendingRevenue
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =============================
// USERS
// =============================
router.get("/users", superAdminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:id", superAdminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// ADMINS
// =============================
router.get("/admins", superAdminAuth, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-passwordHash -__v")
      .sort({ createdAt: -1 });

    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/admins/:id", superAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
  // Find admin first
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Delete all products of this admin
    await Product.deleteMany({ adminphone: admin.phone });

    // Delete admin
    await Admin.findByIdAndDelete(id);

    res.json({ message: "Admin and related products deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =============================
// DELIVERIES
// =============================
router.get("/deliveries", superAdminAuth, async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .select("-passwordHash -__v")
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

router.delete("/deliveries/:id", superAdminAuth, async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery not found" });
    }
    res.json({ message: "Delivery deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete delivery" });
  }
});


// =============================
// PRODUCTS
// =============================
router.get("/products", superAdminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.delete("/products/:id", superAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});


// =============================
// ORDERS
// =============================
router.get("/orders", superAdminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "userId",
        select: "name phone location.pin",
      })
      .sort({ createdAt: -1 });

    const ordersWithPin = orders.map((order) => ({
      ...order.toObject(),
      userPin: order.userId?.location?.pin || "N/A",
    }));

    res.json(ordersWithPin);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.delete("/orders/:id", superAdminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});


// =============================
// DELIVERED ORDERS
// =============================
router.get("/deliveredorders", superAdminAuth, async (req, res) => {
  try {
    const orders = await DeliveredOrder.find({ status: "Delivered" })
      .populate("userId", "name phone")
      .sort({ deliveredAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.delete("/deliveredorders/:id", superAdminAuth, async (req, res) => {
  try {
    const order = await DeliveredOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});


// =============================
// CANCELLED ORDERS
// =============================
router.get("/cancelledorders", superAdminAuth, async (req, res) => {
  try {
    const orders = await DeliveredOrder.find({ status: "Cancelled" })
      .populate("userId", "name phone")
      .sort({ deliveredAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.delete("/cancelledorders/:id", superAdminAuth, async (req, res) => {
  try {
    const order = await DeliveredOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order" });
  }
});


// =============================
// ORDER HELP
// =============================
router.get("/orderhelp", superAdminAuth, async (req, res) => {
  try {
    const helps = await OrderHelp.find()
      .populate("userId", "name phone email")
      .sort({ createdAt: -1 });

    res.json(helps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order help requests" });
  }
});

router.delete("/orderhelp/:id", superAdminAuth, async (req, res) => {
  try {
    const help = await OrderHelp.findByIdAndDelete(req.params.id);
    if (!help) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Order help request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete order help request" });
  }
});


// =============================
// CONTACT
// =============================
router.get("/contact", superAdminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

router.delete("/contact/:id", superAdminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact)
      return res.status(404).json({ message: "Contact not found" });

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete contact" });
  }
});


// =============================
// ME
// =============================
router.get("/me", superAdminAuth, (req, res) => {
  res.json({
    role: "superadmin",
    email: process.env.SUPERADMIN_EMAIL,
    phone: process.env.SUPERADMIN_PHONE,
  });
});

//pecentage revenue update//
router.get("/revenue/total", superAdminAuth, async (req, res) => {
  try {
    const { adminphone } = req.query;

    // 1️⃣ Pending Revenue
    const pendingMatch = { status: { $in: ["Order Confirmed", "Shipped"] } };
    if (adminphone) pendingMatch.adminphone = adminphone;

    const pendingRevenue = await Order.aggregate([
      { $match: pendingMatch },
      {
        $group: {
          _id: "$adminphone",
          pendingRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // 2️⃣ Delivered Revenue
    const deliveredMatch = { status: "Delivered" };
    if (adminphone) deliveredMatch.adminphone = adminphone;

    const deliveredRevenue = await DeliveredOrder.aggregate([
      { $match: deliveredMatch },
      {
        $group: {
          _id: "$adminphone",
          deliveredRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const allAdminPhones = new Set([
      ...pendingRevenue.map((p) => p._id),
      ...deliveredRevenue.map((d) => d._id),
    ]);

    const revenuePerAdmin = [];

    for (let phone of allAdminPhones) {
      const pending = pendingRevenue.find((p) => p._id === phone) || {};
      const delivered = deliveredRevenue.find((d) => d._id === phone) || {};

      const admin = await Admin.findOne({ phone });

      const percentage = admin?.percentage || 0;
      const totalPaymentDone = admin?.totalPaymentDone || 0;

      const pendingRev = pending.pendingRevenue || 0;
      const deliveredRev = delivered.deliveredRevenue || 0;

      const pendingCommission = (pendingRev * percentage) / 100;
      const deliveredCommission = (deliveredRev * percentage) / 100;
      const totalCommission = pendingCommission + deliveredCommission;
      const remainingDue = totalCommission - totalPaymentDone;

      revenuePerAdmin.push({
        adminPhone: phone,
        adminName: admin?.name || phone,
        pendingRevenue: pendingRev,
        deliveredRevenue: deliveredRev,
        percentage,
        totalPaymentDone,
        pendingCommission,
        deliveredCommission,
        totalCommission,
        remainingDue,
      });
    }

    revenuePerAdmin.sort(
      (a, b) =>
        b.pendingRevenue + b.deliveredRevenue -
        (a.pendingRevenue + a.deliveredRevenue)
    );

    res.json({ data: { revenuePerAdmin } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/admins/update-percentage/:adminphone", superAdminAuth, async (req, res) => {
  try {
    const { adminphone } = req.params;
    const { percentage } = req.body;

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: "Percentage must be 0-100" });
    }

    const admin = await Admin.findOneAndUpdate(
      { phone: adminphone },
      { percentage },
      { new: true, upsert: true }
    );

    res.json({ message: "Percentage updated successfully", admin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/admins/update-payment/:adminphone", superAdminAuth, async (req, res) => {
  try {
    const { adminphone } = req.params;
    const { totalPaymentDone } = req.body;

    const admin = await Admin.findOneAndUpdate(
      { phone: adminphone },
      { totalPaymentDone },
      { new: true }
    );

    res.json({ message: "Payment updated successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Failed to update payment" });
  }
});


module.exports = router;
