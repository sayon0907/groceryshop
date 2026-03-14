const express = require("express");
const auth= require("../middleware/productmiddle");// ✅ gets the actual function
 
const router = express.Router()
const {
  sendOtpForRegister,
  verifyRegisterOtp,
  loginAdmin,
  sendOtpForForgot,
  verifyForgotOtpAndReset,
  getAllDeliveredOrders,
  adminorderhelp,
  searchadminorderhelp,
  orderhelpstatus,
} = require("../controllers/adminController.js");

// ──────────────── Admin Registration ────────────────
router.post("/register/send-otp", sendOtpForRegister);
router.post("/register/verify-otp", verifyRegisterOtp);

// ──────────────── Admin Login ────────────────
router.post("/login", loginAdmin);

// ──────────────── Admin Forgot Password ────────────────
router.post("/forgot/send-otp", sendOtpForForgot);
router.post("/forgot/verify-otp", verifyForgotOtpAndReset);
router.get("/me", auth, async (req, res) => {
  if (!req.admin)
    return res.status(403).json({ success: false, error: "Access denied" });
  res.json({ success: true, admin: req.admin });
});
router.get("/totaldelivered", auth, getAllDeliveredOrders);

router.get("/order-help", auth, adminorderhelp);
router.put("/order-help/:id/status", auth, orderhelpstatus);
router.get("/order-help/search/:orderId", auth, searchadminorderhelp);


module.exports = router;
