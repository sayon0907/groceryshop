const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // 🔥 Check JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: "JWT secret not configured",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    // Fetch user
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // 🔥 Attach clean user object
    req.user = {
      id: user._id,
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role || "user",
    };

    next();
  } catch (err) {
    console.error("🔒 Auth Error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired, please login again",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

module.exports = { authMiddleware };