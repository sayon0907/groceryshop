// middleware/productmiddle.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // ✅ Fetch admin from DB
    const admin = await Admin.findById(decoded.id).select("-passwordHash");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // ✅ Attach admin info to request
    req.admin = admin;              // main admin object
    req.adminphone = admin.phone;   // convenience shortcut

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = auth;
