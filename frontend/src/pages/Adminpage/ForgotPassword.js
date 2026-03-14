import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function AdminForgotPassword() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOtp = async () => {
    setError("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/admin/forgot/send-otp",
        { phone }
      );

      if (res.data.success) {
        localStorage.setItem("phone", phone);
        navigate("/admin/verify-forgot");
      } else {
        setError(res.data.error || "Failed to send OTP");
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
          Forgot Password
        </h3>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          style={inputStyle}
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          style={{
            ...buttonStyle,
            background: loading ? "#aaa" : "#243c8f",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending OTP..." : "SEND OTP"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Remember password? <Link to="/login">Login</Link>
        </p>
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
