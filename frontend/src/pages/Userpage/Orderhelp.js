import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function OrderHelp() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const baseURL = "https://groceryshop-d27s.onrender.com/api";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    userId: "",
    orderId: "",
    problem: "",
    otherProblem: "",
    message: "",
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);

  /* ================= FETCH USER + ORDERS ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, activeRes, deliveredRes] = await Promise.all([
          axios.get(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}/order/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseURL}/order/my/delivered`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.data.success && userRes.data.user) {
          const { name, phone, email, _id } = userRes.data.user;
          setForm((prev) => ({ ...prev, name, phone, email, userId: _id }));
        }

        const activeOrders = activeRes.data.orders || [];
        const deliveredOrders = deliveredRes.data.deliveredOrders || [];

        const mappedActive = activeOrders.map((o) => ({
          ...o,
          label: o.status?.toLowerCase() === "shipped" ? "Shipped" : "Pending",
        }));

        const mappedDelivered = deliveredOrders.map((o) => {
          const status = o.status?.toLowerCase();
          if (status === "cancelled") return { ...o, label: "Cancelled" };
          return { ...o, label: "Delivered" };
        });

        setOrders([...mappedActive, ...mappedDelivered]);
      } catch (err) {
        console.error("Fetch error:", err);
        alert("❌ Failed to load orders");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  /* ================= CLOSE DROPDOWNS ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".custom-dropdown")) {
        setShowOrderDropdown(false);
        setShowProblemDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ================= SUBMIT HELP REQUEST ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderId || !form.problem) return alert("Select Order and Problem");
    if (form.problem === "Other" && !form.otherProblem.trim())
      return alert("Specify your problem");

    setLoading(true);
    try {
      const res = await axios.post(`${baseURL}/auth/order-help`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("✅ Help request submitted successfully");
        setForm((prev) => ({
          ...prev,
          orderId: "",
          problem: "",
          otherProblem: "",
          message: "",
        }));
      } else {
        alert(res.data.error || "❌ Failed to submit request");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  const selectedOrder = orders.find((o) => o._id === form.orderId);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #eef2ff, #f8fafc)", padding: "40px 15px" }}
    >
      <div className="card border-0 shadow-lg" style={{ width: "100%", maxWidth: "750px", borderRadius: "20px" }}>
        <div className="card-body p-5">
          {/* Header */}
        <div className="d-flex justify-content-center align-items-center mb-4">
  <h4 className="fw-bold text-dark mb-0 text-center">
    🛠 Order Help & Support
  </h4>
</div>

          <form onSubmit={handleSubmit}>
            {/* Name & Phone & Email & UserID */}
            {["name", "phone", "email", "userId"].map((field) => (
              <div className="mb-3" key={field}>
                <label className="form-label fw-semibold text-muted">
                  {field === "name" ? "Full Name" : field === "phone" ? "Mobile Number" : field === "email" ? "Email Address *" : "User ID"}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  className="form-control rounded-4 shadow-sm"
                  name={field}
                  value={form[field]}
                  onChange={field === "email" ? handleChange : undefined}
                  readOnly={field !== "email"}
                  required={field === "email"}
                />
              </div>
            ))}

            {/* Order Dropdown */}
            <div className="mb-4 position-relative custom-dropdown">
              <label className="form-label fw-semibold text-muted">Order ID *</label>
              <div
                className="form-control d-flex justify-content-between align-items-center rounded-4 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => setShowOrderDropdown(!showOrderDropdown)}
              >
                {selectedOrder ? selectedOrder._id : "Select Order"}
                <span style={{ fontSize: "14px" }}>▼</span>
              </div>
              {showOrderDropdown && (
                <div className="card position-absolute w-100 mt-2 shadow-lg border-0" style={{ zIndex: 1000, maxHeight: "250px", overflowY: "auto", borderRadius: "15px" }}>
                  {orders.map((o) => (
                    <div
                      key={o._id}
                      className="d-flex justify-content-between align-items-center px-3 py-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setForm({ ...form, orderId: o._id });
                        setShowOrderDropdown(false);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="fw-semibold">{o._id}</div>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge rounded-pill px-3 ${
                            o.label === "Delivered"
                              ? "bg-success"
                              : o.label === "Cancelled"
                              ? "bg-danger"
                              : o.label === "Pending"
                              ? "bg-warning text-dark"
                              : "bg-info"
                          }`}
                        >
                          {o.label}
                        </span>
                        <strong>₹{o.totalAmount}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Problem Dropdown */}
            <div className="mb-4 position-relative custom-dropdown">
              <label className="form-label fw-semibold text-muted">Problem Type *</label>
              <div
                className="form-control d-flex justify-content-between align-items-center rounded-4 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => setShowProblemDropdown(!showProblemDropdown)}
              >
                {form.problem ? form.problem : "Select Problem"}
                <span style={{ fontSize: "14px" }}>▼</span>
              </div>
              {showProblemDropdown && (
                <div className="card position-absolute w-100 mt-2 shadow-lg border-0" style={{ borderRadius: "15px" }}>
                  {[
                    "Order not delivered",
                    "Wrong item received",
                    "Item damaged",
                    "Payment issue",
                    "Cancel order",
                    "Refund issue",
                    "Other",
                  ].map((problem) => (
                    <div
                      key={problem}
                      className="px-3 py-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setForm({ ...form, problem });
                        setShowProblemDropdown(false);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {problem}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Problem */}
            {form.problem === "Other" && (
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">Specify your problem *</label>
                <input
                  type="text"
                  className="form-control rounded-4 shadow-sm"
                  name="otherProblem"
                  value={form.otherProblem}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Message */}
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
              {loading ? "Submitting..." : "Submit Help Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}