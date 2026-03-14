const axios = require("axios");
const API_KEY = process.env.TWO_FACTOR_API_KEY;

// Send OTP using 2Factor API
async function sendOtp(phone) {
  try {
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN`;
    const { data } = await axios.get(url);
    console.log("OTP sent response:", data); // debug
    return data;
  } catch (err) {
    console.error("Send OTP Error:", err.response?.data || err.message);
    return { Status: "Failure", Details: "OTP sending error" };
  }
}

// Verify OTP using 2Factor API
async function verifyOtp(sessionId, otp) {
  try {
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
    const { data } = await axios.get(url);
    console.log("OTP verify response:", data); // debug
    return data;
  } catch (err) {
    console.error("Verify OTP Error:", err.response?.data || err.message);
    return { Status: "Failure", Details: "OTP verification error" };
  }
}

module.exports = { sendOtp, verifyOtp };
