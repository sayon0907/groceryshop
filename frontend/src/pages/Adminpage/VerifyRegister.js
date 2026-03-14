import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function AdminVerifyRegister() {
  const [otp, setOtp] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phone = localStorage.getItem("phone");
  const location = JSON.parse(localStorage.getItem("location") || "{}");
  const navigate = useNavigate();

  const verifyOtpAndCode = async () => {
    setError("");

    if (!otp || !confirmationCode) {
      setError("Both OTP and confirmation code are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/admin/register/verify-otp",
        { phone, otp, confirmationCode, location }
      );

      if (response.data.success) {
        const token = response.data.token;
        const decoded = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("name", decoded.name || "");
        localStorage.setItem(
          "location",
          JSON.stringify(decoded.location || {})
        );

        localStorage.removeItem("phone");
        localStorage.removeItem("password");

        alert(`Registration successful! Welcome, ${decoded.name || "User"}`);
        navigate("/admin/dashboard");
      } else {
        setError(response.data.error || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={logo} alt="logo" style={{ width: 160 }} />
        </div>

        <h3 style={{ textAlign: "center", marginBottom: 20 }}>
          Verify Account
        </h3>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          style={inputStyle}
        />

        <input
          type="text"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          placeholder="Enter Confirmation Code"
          style={inputStyle}
        />

        <button
          onClick={verifyOtpAndCode}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: loading ? "#aaa" : "#243c8f",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Verifying..." : "VERIFY"}
        </button>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #b8c6db, #f5c6ec)",
};

const cardStyle = {
  width: "380px",
  background: "#fff",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 5px",
  marginBottom: "15px",
  border: "none",
  borderBottom: "1px solid #ccc",
  outline: "none",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold",
};
