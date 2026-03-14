const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const DeliveredOrder = require("../models/DeliveredOrder");
const Admin = require("../models/Admin");
const auth = require("../middleware/productmiddle");

// Helper to calculate % change
const calcChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

// ✅ GET /api/adminstat/stats (Filtered by adminphone)
router.get("/stats", auth, async (req, res) => {
  try {
    const adminphone = req.adminphone;
    const admin = await Admin.findOne({ phone: adminphone });

    if (!admin || !admin.location?.lat || !admin.location?.lng) {
      return res.status(404).json({ error: "Admin location not found" });
    }

    const { lat, lng } = admin.location;

    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const adminFilter = { adminphone };

    // 🌍 10 km in degrees (approx)
    const kmToDeg = 10 / 111;

    // 📊 Current nearby users (within 10 km)
    const nearbyUsers = await User.find({
      "location.lat": { $gte: lat - kmToDeg, $lte: lat + kmToDeg },
      "location.lng": { $gte: lng - kmToDeg, $lte: lng + kmToDeg },
    });
    const totalNearbyUsers = nearbyUsers.length;

    // 📆 Nearby users created last month
    const nearbyUsersLastMonth = await User.find({
      "location.lat": { $gte: lat - kmToDeg, $lte: lat + kmToDeg },
      "location.lng": { $gte: lng - kmToDeg, $lte: lng + kmToDeg },
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    });
    const totalNearbyUsersLastMonth = nearbyUsersLastMonth.length;

    // ❌ Exclude cancelled orders from counts and sales
    const deliveredFilter = { ...adminFilter, status: { $ne: "Cancelled" } };

    const totalOrders = await Order.countDocuments(adminFilter); // All orders, including active
    const totalProducts = await Product.countDocuments(adminFilter);
    const totalDeliveredOrders = await DeliveredOrder.countDocuments(deliveredFilter);

    const ordersLastMonth = await Order.countDocuments({
      ...adminFilter,
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    });
    const productsLastMonth = await Product.countDocuments({
      ...adminFilter,
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    });
    const deliveredLastMonth = await DeliveredOrder.countDocuments({
      ...deliveredFilter,
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
    });

    // 💰 Sales calculations (exclude cancelled)
    const deliveredAgg = await DeliveredOrder.aggregate([
      { $match: deliveredFilter },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const ordersAgg = await Order.aggregate([
      { $match: adminFilter }, // include all orders, or filter if needed
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalSales = (deliveredAgg[0]?.total || 0) + (ordersAgg[0]?.total || 0);

    const deliveredLastAgg = await DeliveredOrder.aggregate([
      {
        $match: {
          ...deliveredFilter,
          createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const ordersLastAgg = await Order.aggregate([
      {
        $match: {
          ...adminFilter,
          createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const salesLastMonth = (deliveredLastAgg[0]?.total || 0) + (ordersLastAgg[0]?.total || 0);

    // 📈 % Changes (includes nearby user change)
    const changes = {
      nearbyUsersChange: calcChange(totalNearbyUsers, totalNearbyUsersLastMonth),
      ordersChange: calcChange(totalOrders, ordersLastMonth),
      productsChange: calcChange(totalProducts, productsLastMonth),
      deliveredChange: calcChange(totalDeliveredOrders, deliveredLastMonth),
      salesChange: calcChange(totalSales, salesLastMonth),
    };

    res.json({
      adminphone,
      totalNearbyUsers,
      totalOrders,
      totalProducts,
      totalDeliveredOrders,
      totalSales,
      changes,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});


module.exports = router;




// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const Product = require("../models/Product");
// const Order = require("../models/Order");
// const DeliveredOrder = require("../models/DeliveredOrder");
// const Admin = require("../models/Admin");
// const auth = require("../middleware/productmiddle");

// // Helper to calculate % change
// const calcChange = (current, previous) => {
//   if (previous === 0) return current > 0 ? 100 : 0;
//   return (((current - previous) / previous) * 100).toFixed(1);
// };

// // ✅ GET /api/adminstat/stats (Filtered by adminphone)
// router.get("/stats", auth, async (req, res) => {
//   try {
//     const adminphone = req.adminphone;
//     const admin = await Admin.findOne({ phone: adminphone });

//     if (!admin) {
//       return res.status(404).json({ error: "Admin not found" });
//     }

//     const now = new Date();
//     const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

//     // ✅ Filter by adminphone
//     const adminFilter = { adminphone };

//     // ✅ User filter by location (optional)
//     const userFilter =
//       admin?.location?.lat && admin?.location?.lng
//         ? { "location.lat": admin.location.lat, "location.lng": admin.location.lng }
//         : {};

//     // 📊 Current totals
//     const totalUsers = await User.countDocuments(userFilter);
//     const totalOrders = await Order.countDocuments(adminFilter);
//     const totalProducts = await Product.countDocuments(adminFilter);
//     const totalDeliveredOrders = await DeliveredOrder.countDocuments(adminFilter);

//     // 📆 Last month totals
//     const usersLastMonth = await User.countDocuments({
//       ...userFilter,
//       createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
//     });
//     const ordersLastMonth = await Order.countDocuments({
//       ...adminFilter,
//       createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
//     });
//     const productsLastMonth = await Product.countDocuments({
//       ...adminFilter,
//       createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
//     });
//     const deliveredLastMonth = await DeliveredOrder.countDocuments({
//       ...adminFilter,
//       createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
//     });

//     // 💰 Combine Total Sales (Delivered + Orders)
//     const deliveredAgg = await DeliveredOrder.aggregate([
//       { $match: adminFilter },
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
//     ]);
//     const ordersAgg = await Order.aggregate([
//       { $match: adminFilter },
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
//     ]);
//     const totalSales =
//       (deliveredAgg[0]?.total || 0) + (ordersAgg[0]?.total || 0);

//     // 💰 Sales last month (Delivered + Orders)
//     const deliveredLastAgg = await DeliveredOrder.aggregate([
//       {
//         $match: {
//           ...adminFilter,
//           createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
//     ]);
//     const ordersLastAgg = await Order.aggregate([
//       {
//         $match: {
//           ...adminFilter,
//           createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
//         },
//       },
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
//     ]);
//     const salesLastMonth =
//       (deliveredLastAgg[0]?.total || 0) + (ordersLastAgg[0]?.total || 0);

//     // 📈 % Changes
//     const changes = {
//       usersChange: calcChange(totalUsers, usersLastMonth),
//       ordersChange: calcChange(totalOrders, ordersLastMonth),
//       productsChange: calcChange(totalProducts, productsLastMonth),
//       deliveredChange: calcChange(totalDeliveredOrders, deliveredLastMonth),
//       salesChange: calcChange(totalSales, salesLastMonth),
//     };

//     // ✅ Response
//     res.json({
//       adminphone,
//       totalUsers,
//       totalOrders,
//       totalProducts,
//       totalDeliveredOrders,
//       totalSales,
//       changes,
//     });
//   } catch (err) {
//     console.error("Error fetching stats:", err);
//     res.status(500).json({ error: "Server error fetching stats" });
//   }
// });

// module.exports = router;







// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const Product = require("../models/Product");
// const Order = require("../models/Order");
// const DeliveredOrder = require("../models/DeliveredOrder");

// router.get("/stats", async (req, res) => {
//   try {
//     // 📊 Count stats
//     const totalUsers = await User.countDocuments();
//     const totalOrders = await Order.countDocuments();
//     const totalProducts = await Product.countDocuments();
//     const totalDeliveredOrders = await DeliveredOrder.countDocuments();

//     // 💰 Total Sales (combine Delivered + Pending Orders)
//     const deliveredSalesAgg = await DeliveredOrder.aggregate([
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
//     ]);
//     const orderSalesAgg = await Order.aggregate([
//       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
//     ]);

//     const deliveredSales = deliveredSalesAgg[0]?.total || 0;
//     const orderSales = orderSalesAgg[0]?.total || 0;
//     const totalSales = deliveredSales + orderSales;

//     // ✅ Send combined stats
//     res.json({
//       totalUsers,
//       totalOrders,
//       totalProducts,
//       totalDeliveredOrders,
//       totalSales,
//     });
//   } catch (err) {
//     console.error("Error fetching admin stats:", err);
//     res.status(500).json({ error: "Failed to load stats" });
//   }
// });

// module.exports = router;
