import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const CancelledOrders = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/CancelledOrders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders(res.data || []);
    } catch (err) {
      console.error("Fetch Cancelled Orders Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError("Failed to load cancelled orders.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/CancelledOrders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      console.error("Delete Cancelled Order Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        alert("Failed to delete order.");
      }
    }
  };

  const getTotalAmount = (order) => {
    if (order?.totalAmount) return order.totalAmount;
    if (!order?.products || order.products.length === 0) return 0;

    return order.products.reduce(
      (sum, p) => sum + (p.price * p.quantity || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger"></div>
        <p className="mt-3 fw-semibold text-muted">
          Loading Cancelled Orders...
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-5 mt-4">

      {/* HEADER */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg,#dc3545,#a71d2a)",
          color: "#fff",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white text-danger p-3 rounded-circle shadow">
              <FaTimesCircle size={22} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Cancelled Orders</h4>
              <small className="opacity-75">
                Manage all cancelled customer orders
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 shadow-sm">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="card-body table-responsive p-0">

          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "#111827", color: "#fff" }}>
              <tr>
                <th className="d-none d-md-table-cell">#</th>
                <th>User</th>
                <th>Total</th>
                <th className="d-none d-md-table-cell">Status</th>
                <th className="d-none d-md-table-cell">Admin Phone</th>
                <th className="text-center">View</th>
                <th className="text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <FaTimesCircle size={40} className="mb-3 text-danger opacity-50" />
                    <h5 className="text-muted">No Cancelled Orders</h5>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order._id} style={{ transition: "0.2s ease" }}>
                    <td className="d-none d-md-table-cell fw-semibold">
                      {index + 1}
                    </td>

                    <td>
                      <div className="fw-bold">
                        {order.userId?.name}
                      </div>
                      <div className="text-muted small">
                        {order.userId?.phone}
                      </div>
                    </td>

                    <td className="fw-semibold text-danger">
                      ₹{getTotalAmount(order)}
                    </td>

                    <td className="d-none d-md-table-cell">
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                        {order.status}
                      </span>
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {order.adminphone}
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#orderModal"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger rounded-circle shadow-sm"
                        style={{ width: "35px", height: "35px" }}
                        onClick={() => deleteOrder(order._id)}
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
      <div className="modal fade" id="orderModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">Order Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedOrder && (
                <div className="d-flex flex-column gap-3">

                  <div className="border-bottom pb-2">
                    <strong>User:</strong> {selectedOrder.userId?.name}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Phone:</strong> {selectedOrder.userId?.phone}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Admin Phone:</strong> {selectedOrder.adminphone}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Status:</strong>{" "}
                    <span className="text-danger fw-semibold">
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Cancelled At:</strong>{" "}
                    {selectedOrder.deliveredAt
                      ? new Date(selectedOrder.deliveredAt).toLocaleString()
                      : "N/A"}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Created At:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Address:</strong>{" "}
                    {selectedOrder.location?.address}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Location:</strong>{" "}
                    {selectedOrder.location?.lat},{" "}
                    {selectedOrder.location?.lng}
                  </div>


                  <div>
                    <strong>Products:</strong>
                    <ul className="mt-2">
                      {selectedOrder.products?.map((p, i) => (
                        <li key={i}>
                          {p.name} - ₹{p.price} × {p.quantity} = ₹
                          {p.price * p.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="fw-bold text-danger fs-5">
                    Total Amount: ₹{getTotalAmount(selectedOrder)}
                  </div>

                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary rounded-pill px-4"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default CancelledOrders;
