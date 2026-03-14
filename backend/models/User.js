const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  isPhoneVerified: { type: Boolean, default: false },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    pin: { type: String },
    address: { type: String },
  },
  otp: {
    sessionId: { type: String },
    purpose: { type: String },
  },
});

module.exports = mongoose.model("User", userSchema);
