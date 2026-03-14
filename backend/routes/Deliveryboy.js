const express = require("express");
const deliveryMiddleware = require("../middleware/delivery");
const router = express.Router();

const {
  sendOtpForRegister,
  verifyRegisterOtp,
  loginUser,
  sendOtpForForgot,
  verifyForgotOtpAndReset,
  orderdelivery,
  orderdelivered,
  totaldelivery,
  getDeliveryProfile
} = require("../controllers/DeliveryController");

// Authentication routes
router.post("/register/send-otp", sendOtpForRegister);
router.post("/register/verify-otp", verifyRegisterOtp);
router.post("/login", loginUser);
router.post("/forgot/send-otp", sendOtpForForgot);
router.post("/forgot/verify-otp", verifyForgotOtpAndReset);

// Protected delivery routes
router.get("/orders", deliveryMiddleware, orderdelivery);
router.put("/orders/:id/delivered", deliveryMiddleware, orderdelivered);
// // 🟢 Get delivered orders count + list (optionally by date)
router.get("/delivered-orders",deliveryMiddleware,totaldelivery)
router.get("/me", deliveryMiddleware, getDeliveryProfile);

module.exports = router;
