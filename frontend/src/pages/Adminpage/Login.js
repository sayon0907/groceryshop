import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import logo from "../../assets/FRAMZONE Logo Design.png";

export default function AdminLogin() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, token, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token && role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [token, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Phone and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/admin/login",
        { phone, password }
      );

      if (res.data.success && res.data.token) {
        const token = res.data.token;
        login(token, "admin");

        const decoded = jwtDecode(token);
        localStorage.setItem("name", decoded.name || "");
        localStorage.setItem(
          "location",
          JSON.stringify(decoded.location || {})
        );

        navigate("/admin/dashboard");
      } else {
        setError(res.data.error || "Invalid credentials");
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
          Admin Login
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
            <Link
              to="/admin/forgot"
              style={{ fontSize: "14px", color: "#007bff" }}
            >
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
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Not Registered? <Link to="/admin/register">Register</Link>
        </p>

        {/* 👇 Are you user button */}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              fontWeight: "bold",
              padding: 0,
            }}
          >
            Are you a User?          
            </button>
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
