const User = require("../models/User");
const OrderHelp = require("../models/OrderHelp");
const Order = require("../models/Order");
const DeliveredOrder = require("../models/DeliveredOrder");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtp, verifyOtp } = require("../utils/twoFactor");

// ================= TOKEN =================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ================= SEND OTP REGISTER =================
exports.sendOtpForRegister = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, phone, email and password are required",
      });
    }

    const emailUser = await User.findOne({
      email,
      isPhoneVerified: true,
    });

    if (emailUser) {
      return res.status(400).json({
        success: false,
        error: "Email already used",
      });
    }

    let user = await User.findOne({
      $or: [{ phone }, { email }],
    });

    if (user && user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        error: "User already registered",
      });
    }

    if (!user) {
      user = new User({ name, phone, email });
    } else {
      user.name = name;
      user.phone = phone;
      user.email = email;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);

    const otpRes = await sendOtp(phone);

    if (otpRes.Status !== "Success") {
      return res.status(400).json({
        success: false,
        error: "OTP sending failed",
      });
    }

    user.otp = {
      sessionId: otpRes.Details,
      purpose: "register",
    };

    await user.save();

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= VERIFY REGISTER OTP =================
exports.verifyRegisterOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone and OTP required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        error: "No OTP session found",
      });
    }

    const verifyRes = await verifyOtp(user.otp.sessionId, otp);

    if (verifyRes.Status !== "Success") {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    user.isPhoneVerified = true;
    user.otp = undefined;

    await user.save();

    const token = generateToken(user._id);

   res.json({
  success: true,
  message: "Registered successfully",
  token,
  role: "user",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
  },
});
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: "Phone and password required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        error: "Please verify phone first",
      });
    }

    const validPass = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPass) {
      return res.status(400).json({
        success: false,
        error: "Invalid password",
      });
    }

    const token = generateToken(user._id);

  res.json({
  success: true,
  message: "Login successful",
  token,
  role: "user",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
  },
});
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= FORGOT OTP =================
exports.sendOtpForForgot = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    const otpRes = await sendOtp(phone);

    if (otpRes.Status !== "Success") {
      return res.status(400).json({
        success: false,
        error: "OTP sending failed",
      });
    }

    user.otp = {
      sessionId: otpRes.Details,
      purpose: "forgot",
    };

    await user.save();

    res.json({
      success: true,
      message: "OTP sent for password reset",
      name: user.name,
    });
  } catch (err) {
    console.error("Forgot OTP Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= RESET PASSWORD =================
exports.verifyForgotOtpAndReset = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Phone, OTP and new password required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        error: "No OTP session",
      });
    }

    const verifyRes = await verifyOtp(user.otp.sessionId, otp);

    if (verifyRes.Status !== "Success") {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    user.otp = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
      name: user.name,
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= GET ME =================
// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Get Me Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= UPDATE LOCATION =================
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, pin, address } = req.body.location;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Lat & Lng required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    user.location = { lat, lng, pin, address };

    await user.save();

    res.json({
      success: true,
      message: "Location updated",
      location: user.location,
    });
  } catch (err) {
    console.error("Update Location Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// ================= ORDER SUPPORT =================
exports.ordersupport = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      userId,
      orderId,
      problem,
      otherProblem,
      message,
    } = req.body;

    if (!orderId || !problem || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (problem === "Other" && !otherProblem) {
      return res.status(400).json({
        success: false,
        message: "Other problem description required",
      });
    }

    // 🔍 Find order (active or delivered)
    const order =
      (await Order.findById(orderId)) ||
      (await DeliveredOrder.findById(orderId));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const ticket = await OrderHelp.create({
      user: req.user._id, // from auth middleware
      userId,
      name,
      phone,
      email,
      orderId,
      adminphone: order.adminphone || null,
      problem: problem === "Other" ? otherProblem : problem,
      otherProblem: problem === "Other" ? otherProblem : "",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Order Help Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= CANCEL ORDER =================
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Already cancelled",
      });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    for (const item of order.products) {
      const productId =
        typeof item.productId === "object"
          ? item.productId._id
          : item.productId;

      await Product.findByIdAndUpdate(productId, {
        $inc: { quantity: item.quantity },
      });
    }

    const orderObj = order.toObject();
    delete orderObj._id;

    const deliveredOrder = await DeliveredOrder.create({
      ...orderObj,
      status: "Cancelled",
      deliveredAt: new Date(),
    });

    await OrderHelp.updateMany(
      { orderId: order._id },
      { $set: { orderId: deliveredOrder._id } }
    );

    await Order.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};