const Delivery = require("../models/deliveryboy");
const Order = require("../models/Order");
const OrderHelp = require("../models/OrderHelp"); 
const DeliveredOrder = require("../models/DeliveredOrder");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtp, verifyOtp } = require("../utils/twoFactor");

// Helper: generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ──────────────── Send OTP for Registration ────────────────
exports.sendOtpForRegister = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ success: false, error: "Name, phone and password are required" });

    let user = await Delivery.findOne({ phone });

    if (user && user.isPhoneVerified)
      return res.status(400).json({ success: false, error: "User already registered" });

    if (!user) user = new Delivery({ name, phone });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);

    // Send OTP
    const otpRes = await sendOtp(phone);
    if (otpRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "OTP sending failed", details: otpRes });

    user.otp = { sessionId: otpRes.Details, purpose: "register" };
    await user.save();

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Verify OTP and Register ────────────────
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ success: false, error: "Phone and OTP are required" });

    const user = await Delivery.findOne({ phone });
    if (!user || !user.otp)
      return res.status(400).json({ success: false, error: "No OTP session found" });

    const verifyRes = await verifyOtp(user.otp.sessionId, otp);
    if (verifyRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "Invalid OTP" });

    user.isPhoneVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: "Registered successfully", token, name: user.name });
  } catch (err) {
    console.error("Verify OTP Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Login User ────────────────
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success: false, error: "Phone and password are required" });

    const user = await Delivery.findOne({ phone });
    if (!user) return res.status(400).json({ success: false, error: "User not found" });

    const validPass = await bcrypt.compare(password, user.passwordHash);
    if (!validPass) return res.status(400).json({ success: false, error: "Invalid password" });

    const token = generateToken(user._id);
    res.json({ success: true, message: "Login successful", token, name: user.name });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Send OTP for Forgot Password ────────────────
exports.sendOtpForForgot = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ success: false, error: "Phone is required" });

    const user = await Delivery.findOne({ phone });
    if (!user) return res.status(400).json({ success: false, error: "User not found" });

    const otpRes = await sendOtp(phone);
    if (otpRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "OTP sending failed" });

    user.otp = { sessionId: otpRes.Details, purpose: "forgot" };
    await user.save();

    res.json({ success: true, message: "OTP sent for password reset", name: user.name });
  } catch (err) {
    console.error("Forgot OTP Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Verify Forgot OTP and Reset Password ────────────────
exports.verifyForgotOtpAndReset = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword)
      return res.status(400).json({ success: false, error: "Phone, OTP and new password are required" });

    const user = await Delivery.findOne({ phone });
    if (!user || !user.otp)
      return res.status(400).json({ success: false, error: "No OTP session found" });

    const verifyRes = await verifyOtp(user.otp.sessionId, otp);
    if (verifyRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "Invalid OTP" });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful", name: user.name });
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
// 🟢 Get all orders assigned to a delivery boy
exports.orderdelivery = async (req, res) => {
  try {
    const deliveryBoyPhone = req.query.phone || req.deliveryBoy?.phone;

    if (!deliveryBoyPhone)
      return res.status(400).json({ message: "Delivery boy phone missing" });

    const orders = await Order.find({
      deliveryBoyPhone: deliveryBoyPhone,
      status: "Shipped", // or whatever status means "pending"
    })
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
    
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Failed to load orders" });
  }
};

// ✅ Mark order as delivered
exports.orderdelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    console.log(order);

    // 1️⃣ Create DeliveredOrder
    const deliveredOrder = new DeliveredOrder({
      userId: order.userId,
      products: order.products,
      totalAmount: order.totalAmount,
      location: order.location,
      date: order.date,
      status: "Delivered",
      deliveredAt: new Date(),
      deliveryBoyName: order.deliveryBoyName,
      deliveryBoyPhone: order.deliveryBoyPhone,
      adminphone: order.adminphone,
      image: order.image, // Carry over image path to delivered order
    });

    await deliveredOrder.save();

    // 2️⃣ Update OrderHelp tickets to point to new DeliveredOrder ID
    await OrderHelp.updateMany(
      { orderId: order._id },
      { $set: { orderId: deliveredOrder._id } }
    );

    // 3️⃣ Remove original order
    await order.deleteOne();

    res.json({ 
      message: "Order marked as delivered, tickets updated", 
      deliveredOrder 
    });

  } catch (err) {
    console.error("Error marking order delivered:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
};
 exports.totaldelivery=async (req, res) => {
  const { phone, date } = req.query;
  if (!phone) return res.status(400).json({ message: "Phone required" });
console.log(req.query);

  let filter = { deliveryBoyPhone: phone };
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.deliveredAt = { $gte: start, $lte: end };
  }

  const deliveredOrders = await DeliveredOrder.find(filter)
    .populate("userId", "name phone")
    .sort({ deliveredAt: -1 });

  res.json({
    totalDelivered: deliveredOrders.length,
    deliveredOrders,
  });
};
exports.getDeliveryProfile = (req, res) => {
  res.json(req.deliveryBoy);
};
