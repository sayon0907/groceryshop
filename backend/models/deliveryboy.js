const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // make required during registration
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    sessionId: String,
    purpose: String,
  },
});

module.exports = mongoose.model("Delivery", deliverySchema);
