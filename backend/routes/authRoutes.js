const express = require("express");
const router = express.Router();
const {
  sendOtpForRegister,
  verifyRegisterOtp,
  loginUser,
  sendOtpForForgot,
  verifyForgotOtpAndReset,
  getMe,
  updateLocation,
  ordersupport,
  cancelOrder,
} = require("../controllers/authController");
const { submitContact } = require("../controllers/contactController");
const { authMiddleware } = require("../middleware/auth");

// ───── Auth Routes ─────
router.post("/register/send-otp", sendOtpForRegister);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/login", loginUser);
router.post("/forgot/send-otp", sendOtpForForgot);
router.post("/forgot/verify-otp", verifyForgotOtpAndReset);

// ───── User Routes ─────
router.get("/me", authMiddleware, getMe);
router.put("/me/location", authMiddleware, updateLocation);

// ───── Contact Route ─────
// Option 1: Public (most common)
router.post("/contact",authMiddleware, submitContact);
router.post("/order-help",authMiddleware, ordersupport)
router.put("/cancel/:id", authMiddleware, cancelOrder);
// Option 2: Private (if you want only logged-in users)
// router.post("/contact", authMiddleware, submitContact);

module.exports = router;
