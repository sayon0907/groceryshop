import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DeliveryBoyDeliveredPage() {
  const { token, deliveryBoy, logout, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ Fetch only AFTER auth restored
  useEffect(() => {
    if (authLoading) return;

    if (!token || !deliveryBoy?.phone) {
      logout();
      navigate("/delivery/login");
      return;
    }

    fetchDeliveredOrders();
  }, [authLoading, token, deliveryBoy]);

  const fetchDeliveredOrders = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/delivery/delivered-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            phone: deliveryBoy.phone, // 🔥 REQUIRED BY BACKEND
            date,
          },
        }
      );

      setOrders(res.data.deliveredOrders || []);
      setCount(res.data.totalDelivered || 0);
    } catch (err) {
      console.error("Error fetching delivered orders:", err);

      if (err.response?.status === 401) {
        logout();
        navigate("/delivery/login");
      } else {
        alert("Failed to fetch delivered orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/delivery/login");
  };

  if (authLoading || loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success"></div>
        <p className="mt-2">Loading delivered orders...</p>
      </div>
    );
  }

  return (
<div className="container mt-5">
      <button
        onClick={handleLogout}
        className="btn btn-danger position-absolute top-0 end-0 m-3"
      >
        Logout
      </button>

      <h2 className="text-center mb-4">✅ Delivered Orders Summary</h2>

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h5>
          Total Delivered:{" "}
          <span className="badge bg-success fs-6">{count}</span>
        </h5>

        <div className="d-flex align-items-center mt-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-control me-2"
            style={{ width: "200px" }}
          />
          <button className="btn btn-primary" onClick={fetchDeliveredOrders}>
            Search
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted">No delivered orders found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped text-center align-middle shadow-sm">
            <thead className="table-success">
              <tr>
                <th>User</th>
                <th>Products</th>
                <th>Total</th>
                <th>Address</th>
                <th>Delivered At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.userId?.name || "Unknown"}</td>
                  <td>
                    {order.products.map((p, i) => (
                      <div key={i}>
                        {p.name} × {p.quantity}
                      </div>
                    ))}
                  </td>
                  <td>₹{order.totalAmount}</td>
                  <td>{order.location?.address || "N/A"}</td>
                  <td>
                    {new Date(order.deliveredAt).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
