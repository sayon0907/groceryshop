import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const baseURL = "https://groceryshop-d27s.onrender.com/api"; // easily replace for prod

  /* ================= FETCH USER ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseURL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && res.data.user) {
          const { name, phone, email } = res.data.user;
          setForm((prev) => ({
            ...prev,
            name: name || "",
            phone: phone || "",
            email: email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
        alert("❌ Failed to load user info");
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= SUBMIT MESSAGE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/auth/contact`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("✅ Message sent successfully");
        setForm((prev) => ({ ...prev, message: "" }));
      } else {
        alert(res.data.error || "❌ Failed to send message");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
        padding: "40px 15px",
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{ width: "100%", maxWidth: "650px", borderRadius: "20px" }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-dark mb-2">📞 Contact Support</h3>
            <p className="text-muted mb-0">
              We’re here to help you. Send us your message.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-muted">Full Name</label>
              <input
                type="text"
                className="form-control rounded-4 shadow-sm"
                name="name"
                value={form.name}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-muted">Phone Number</label>
              <input
                type="text"
                className="form-control rounded-4 shadow-sm"
                name="phone"
                value={form.phone}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-muted">Email Address *</label>
              <input
                type="email"
                className="form-control rounded-4 shadow-sm"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-muted">Message *</label>
              <textarea
                className="form-control rounded-4 shadow-sm"
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button
              className="btn w-100 rounded-pill py-2 fw-semibold text-white shadow"
              style={{ background: "linear-gradient(90deg, #4f46e5, #6366f1)", border: "none" }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}