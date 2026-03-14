// middleware/delivery.js
const jwt = require("jsonwebtoken");
const Delivery = require("../models/deliveryboy");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const deliveryBoy = await Delivery.findById(decoded.id).select("-passwordHash");
    if (!deliveryBoy)
      return res.status(404).json({ message: "Delivery boy not found." });

    req.deliveryBoy = deliveryBoy;
    next();
  } catch (err) {
    console.error("🚫 Delivery Auth Error:", err.message);
    const isExpired = err.name === "TokenExpiredError";
    res.status(401).json({
      message: isExpired ? "Token expired. Please login again." : "Invalid token.",
    });
  }
};
