// src/pages/DeliveryBoyDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryBoyDashboard() {
  const { token, logout, deliveryBoy } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("Please login again!");
      logout();
      navigate("/delivery/login");
      return;
    }
    fetchAssignedOrders();
  }, [token]);

  const fetchAssignedOrders = async () => {
    try {
      const res = await axios.get("https://groceryshop-d27s.onrender.com/api/delivery/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching assigned orders:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        logout();
        navigate("/delivery/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (orderId) => {
    if (!window.confirm("Confirm delivery for this order?")) return;

    try {
      await axios.put(
        `https://groceryshop-d27s.onrender.com/api/delivery/orders/${orderId}/delivered`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      alert("✅ Order marked as delivered!");
    } catch (err) {
      console.error("Error updating delivery:", err);
      alert("❌ Failed to mark as delivered");
    }
  };

  const goToDeliveredOrders = () => navigate("/delivery/delivered");

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading your deliveries...</p>
      </div>
    );

  return (
    <div className="container-fluid p-3 dashboard-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <button onClick={goToDeliveredOrders} className="btn btn-outline-success mb-2">
          📦 Delivered Orders
        </button>
        <button onClick={logout} className="btn btn-outline-danger mb-2">
          Logout
        </button>
      </div>

      <h3 className="text-center text-primary fw-bold mb-4">
        🚚 Delivery Dashboard
      </h3>

      {/* Orders Section */}
      {orders.length === 0 ? (
        <div className="text-center text-muted py-5">
          <h5>No pending deliveries 🎉</h5>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={order._id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title fw-bold text-dark mb-2">
                    👤 {order.userId?.name || "Unknown User"}
                  </h6>
                  <h6 className="card-title fw-bold text-dark mb-2">
                    👤 {order.userId?.phone || "invalid number"}
                  </h6>
                  <div className="mb-2">
                    <strong>🛍️ Products:</strong>
                    <ul className="list-unstyled small mt-1">
                      {order.products.map((p, i) => (
                        <li key={i}>
                          {p.name} × {p.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mb-1">
                    <strong>💰 Total:</strong> ₹{order.totalAmount}
                  </p>

                  <p className="mb-1">
                    <strong>📍 Address:</strong>{" "}
                    {order.location?.address || "N/A"}
                  </p>

                  {order.location?.lat && order.location?.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${order.location.lat},${order.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm mt-2"
                    >
                      View on Map
                    </a>
                  )}

                  <p className="text-muted small mt-2">
                    <strong>🕓 Date:</strong>{" "}
                    {new Date(order.date).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <button
                    className="btn btn-success w-100 mt-auto"
                    onClick={() => markAsDelivered(order._id)}
                  >
                    ✅ Mark as Delivered
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
