import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaShieldAlt } from "react-icons/fa";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function SuperAdminLogin() {
  const { login, token, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && token && role === "superadmin") {
      navigate("/superadmin");
    }
  }, [token, role, authLoading, navigate]);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/superadmin/login",
        { phone, email, password }
      );

      if (res.data.success) {
        login(res.data.token, "superadmin");
        navigate("/superadmin");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src={logo} alt="logo" style={{ width: "150px" }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <FaShieldAlt size={28} color="#243c8f" />
          <h3 style={{ marginTop: "10px", fontWeight: "600" }}>
            SuperAdmin Login
          </h3>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Secure access to dashboard
          </p>
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div style={inputWrapper}>
            <input
              type="text"
              placeholder="Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={inputWrapper}>
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={inputWrapper}>
            <input
              type="password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

        </form>
      </div>
    </div>
  );
}

/* ================== STYLES ================== */

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  padding: "20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "40px 30px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
};

const inputWrapper = {
  marginBottom: "18px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none",
  transition: "0.3s",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg,#243c8f,#6610f2)",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};

const linkStyle = {
  color: "#243c8f",
  textDecoration: "none",
  fontWeight: "500",
};

const errorStyle = {
  background: "#ffe6e6",
  color: "#cc0000",
  padding: "10px",
  borderRadius: "8px",
  textAlign: "center",
  marginBottom: "15px",
  fontSize: "14px",
};
