//model/admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isPhoneVerified: { type: Boolean, default: false },
  confirmationCode: { type: Number }, // optional now
  otp: {
    sessionId: String,
    purpose: String,
  },
  percentage: {
  type: Number,
  default: 0, // e.g. 20 means 20%
},
    // Total Payment Already Given To Admin
    totalPaymentDone: {
      type: Number,
      default: 0,
    },
  location: {
    lat: Number,
    lng: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
