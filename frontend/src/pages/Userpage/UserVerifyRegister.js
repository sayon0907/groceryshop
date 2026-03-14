import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function VerifyRegister() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const phone = localStorage.getItem("phone");
  const navigate = useNavigate();

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/auth/register/verify-otp",
        { phone, otp },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("Registration successful!");
        localStorage.removeItem("phone");
        localStorage.removeItem("password");
        navigate("/login");
      } else {
        setError(res.data.error || "OTP verification failed");
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
          Verify OTP
        </h3>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP *"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
            {loading ? "Verifying..." : "VERIFY OTP"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already verified? <Link to="/login">Login</Link>
        </p>
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
