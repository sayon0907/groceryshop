import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function AdminVerifyForgot() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const phone = localStorage.getItem("phone");

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || !newPassword) {
      setError("OTP and new password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/admin/forgot/verify-otp",
        { phone, otp, newPassword }
      );

      if (res.data.success) {
        alert("Password reset successfully!");
        localStorage.removeItem("phone");
        navigate("/admin/login");
      } else {
        setError(res.data.error || "Failed to reset password");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #b8c6db, #f5c6ec)",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src={logo} alt="logo" style={{ width: "160px" }} />
        </div>

        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          Reset Password
        </h3>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <form onSubmit={resetPassword}>
          <input
            type="text"
            placeholder="OTP *"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="New Password *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "#243c8f",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Resetting..." : "RESET PASSWORD"}
          </button>
          
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 5px",
  marginBottom: "15px",
  border: "none",
  borderBottom: "1px solid #ccc",
  outline: "none",
  fontSize: "14px",
};
