import { useState, useEffect } from "react";
import axios from "axios";
import {Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function DeliveryLogin() {
  const { login, token, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && token && role === "delivery") {
      navigate("/delivery/dashboard");
    }
  }, [token, role, authLoading, navigate]);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/delivery/login",
        { phone, password }
      );

      if (res.data.success) {
        login(res.data.token, "delivery");
        alert("Login successful!");
        navigate("/delivery/dashboard");
      } else {
        setError(res.data.error || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error during login");
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
          🚚 Delivery Login
        </h3>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Phone *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
  <div style={{ textAlign: "right", marginBottom: "15px" }}>
            <Link to="/delivery/forgot" style={{ fontSize: "14px", color: "#007bff" }}>
              Forgot password?
            </Link>
          </div>
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
            {loading ? "Logging in..." : "LOGIN"}
          </button>
           <p style={{ textAlign: "center", marginTop: "15px" }}>
          New user? <Link to="/delivery/register">Register</Link>
        </p>
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
