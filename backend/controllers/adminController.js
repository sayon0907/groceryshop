const Admin = require("../models/Admin");
const OrderHelp = require("../models/OrderHelp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtp, verifyOtp } = require("../utils/twoFactor");
const sendconfigcode = require("../middleware/sendconfigcode"); // direct import
const DeliveredOrder=require("../models/DeliveredOrder")
const Order = require("../models/Order");
// Helper: generate JWT token
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, name: admin.name, role: admin.role || "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ──────────────── Send OTP for Admin Registration ────────────────
exports.sendOtpForRegister = async (req, res) => {
  try {
    const { name, phone, password, location } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ success: false, error: "Name, phone, and password are required" });

    let admin = await Admin.findOne({ phone });

    if (admin && admin.isPhoneVerified)
      return res.status(400).json({ success: false, error: "Admin already registered" });

    const confirmationCode = Math.floor(100000 + Math.random() * 900000);

    if (!admin) {
      admin = new Admin({ name, phone, confirmationCode, location });
    } else {
      admin.confirmationCode = confirmationCode;
      admin.name = name;
      if (location) admin.location = location;
    }

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(password, salt);

    // Send OTP via SMS
    const otpRes = await sendOtp(phone);
    if (otpRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "OTP sending failed", details: otpRes });

    admin.otp = { sessionId: otpRes.Details, purpose: "register" };
    await admin.save();

    // Send confirmation code via email
    await sendconfigcode(confirmationCode, phone);

    res.json({ success: true, message: "Admin OTP and confirmation code sent", name: admin.name });
  } catch (err) {
    console.error("Admin Send OTP Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Verify Admin OTP ────────────────
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { phone, otp, confirmationCode } = req.body;
    if (!phone || !otp || !confirmationCode)
      return res.status(400).json({ success: false, error: "Phone, OTP, and confirmation code are required" });

    const admin = await Admin.findOne({ phone });
    if (!admin || !admin.otp || !admin.confirmationCode)
      return res.status(400).json({ success: false, error: "No OTP session found" });

    if (admin.confirmationCode.toString() !== confirmationCode.toString())
      return res.status(400).json({ success: false, error: "Invalid confirmation code" });

    const verifyRes = await verifyOtp(admin.otp.sessionId, otp);
    if (verifyRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "Invalid OTP" });

    admin.isPhoneVerified = true;
    admin.otp = undefined;
    admin.confirmationCode = undefined;
    await admin.save();

    const token = generateToken(admin);
    res.json({ success: true, message: "Admin registered successfully", token, name: admin.name });
  } catch (err) {
    console.error("Admin Verify OTP Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Admin Login ────────────────
exports.loginAdmin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success: false, error: "Phone and password are required" });

    const admin = await Admin.findOne({ phone });
    if (!admin) return res.status(400).json({ success: false, error: "Admin not found" });

    const validPass = await bcrypt.compare(password, admin.passwordHash);
    if (!validPass) return res.status(400).json({ success: false, error: "Invalid password" });

    const token = generateToken(admin);
    res.json({ success: true, message: "Admin login successful", token, name: admin.name });
  } catch (err) {
    console.error("Admin Login Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Send OTP for Forgot Password ────────────────
exports.sendOtpForForgot = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: "Phone is required" });

    const admin = await Admin.findOne({ phone });
    if (!admin) return res.status(400).json({ success: false, error: "Admin not found" });

    const otpRes = await sendOtp(phone);
    if (otpRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "OTP sending failed" });

    admin.otp = { sessionId: otpRes.Details, purpose: "forgot" };
    await admin.save();

    res.json({ success: true, message: "OTP sent for admin password reset", name: admin.name });
  } catch (err) {
    console.error("Admin Forgot OTP Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ──────────────── Verify Forgot OTP and Reset Password ────────────────
exports.verifyForgotOtpAndReset = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword)
      return res.status(400).json({ success: false, error: "Phone, OTP, and new password are required" });

    const admin = await Admin.findOne({ phone });
    if (!admin || !admin.otp) return res.status(400).json({ success: false, error: "No OTP session found" });

    const verifyRes = await verifyOtp(admin.otp.sessionId, otp);
    if (verifyRes.Status !== "Success")
      return res.status(400).json({ success: false, error: "Invalid OTP" });

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(newPassword, salt);
    admin.otp = undefined;
    await admin.save();

    const token = generateToken(admin);
    res.json({ success: true, message: "Admin password reset successful", token, name: admin.name });
  } catch (err) {
    console.error("Admin Reset Password Error:", err.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
/////////////////////////////////////////////////////////
// 🟢 Admin — Get all delivered orders
exports.getAllDeliveredOrders = async (req, res) => {
  try {
    const deliveredOrders = await DeliveredOrder.find({adminphone:req.adminphone})
      .populate("userId", "name phone")
      .populate("products.productId", "name price");

    res.status(200).json({ success: true, deliveredOrders });
  } catch (error) {
    console.error("Error fetching delivered orders:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.adminorderhelp = async (req, res) => {
  try {
    const tickets = await OrderHelp.find({adminphone:req.adminphone})
    
    res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
    });
  }
};
exports.searchadminorderhelp = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Try finding in Order first
    let order = await Order.findOne({ _id: orderId });

    // If not found, try DeliveredOrder
    if (!order) {
      order = await DeliveredOrder.findOne({ _id: orderId });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, ticket: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.orderhelpstatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await OrderHelp.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = status;
    await ticket.save();

    res.json({
      success: true,
      message: "Status updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};