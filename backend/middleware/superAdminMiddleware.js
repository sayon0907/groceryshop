const jwt = require("jsonwebtoken");

const superAdminAuth = (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check role
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied: Not superadmin" });
    }

    // Optionally attach user info to request
    req.superadmin = { role: decoded.role };

    next();
  } catch (err) {
    console.error("SuperAdmin Auth Error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = superAdminAuth;
