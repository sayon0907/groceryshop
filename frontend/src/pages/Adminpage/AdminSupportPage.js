import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchDetails, setSearchDetails] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || role !== "admin") {
      alert("⚠️ Please login as Admin");
      logout();
      navigate("/admin/login");
      return;
    }
    fetchTickets();
  }, [token, role]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("https://groceryshop-d27s.onrender.com/api/admin/order-help", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(res.data.tickets || []);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        navigate("/admin/login");
      } else {
        alert("Failed to load tickets");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `https://groceryshop-d27s.onrender.com/api/admin/order-help/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTickets();
      if (orderDetails?._id === id)
        setOrderDetails((prev) => ({ ...prev, status }));
      if (searchDetails?._id === id)
        setSearchDetails((prev) => ({ ...prev, status }));
    } catch {
      alert("Failed to update status");
    }
  };

  const searchOrderById = async () => {
    if (!searchId.trim()) return alert("Enter Order ID");
    try {
      const res = await axios.get(
        `https://groceryshop-d27s.onrender.com/api/admin/order-help/search/${searchId.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let order = null;
      if (Array.isArray(res.data.tickets)) order = res.data.tickets[0];
      else if (res.data.ticket) order = res.data.ticket;

      if (!order) return alert("Order not found");

      setSearchDetails(order);
      setShowSearchModal(true);
    } catch {
      alert("Order not found");
    }
  };

  const filteredTickets = tickets
    .filter((t) => statusFilter === "All" || t.status === statusFilter)
    .filter((t) =>
      t.orderId?.toLowerCase().includes(searchId.toLowerCase())
    );

if (loading)
  return (
    <div className="container py-5 text-center">

      <div className="mb-4">
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "2.5rem", height: "2.5rem" }}
        ></div>
      </div>

      <h6 className="fw-semibold text-dark mb-2">
        Loading Support Tickets
      </h6>

      <small className="text-muted">
        System is preparing the data.
      </small>

    </div>
  );


  return (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
      
      {/* HEADER */}
      <div
        className="mb-4 p-4 rounded-4 shadow text-white"
        style={{
          background: "linear-gradient(135deg,#1e3c72,#2a5298)",
        }}
      >
        <h2 className="fw-bold mb-1">🛠 Order Help Dashboard</h2>
        <p className="opacity-75 mb-0">
          Manage and resolve customer support tickets efficiently
        </p>
      </div>

      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-body p-4">

          {/* SEARCH + FILTER */}
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="input-group shadow-sm">
                <input
                  type="text"
                  className="form-control rounded-start-pill"
                  placeholder="Search by Order ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button
                  className="btn btn-primary rounded-end-pill px-4"
                  onClick={searchOrderById}
                >
                  Search
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <select
                className="form-select rounded-pill shadow-sm fw-semibold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Tickets</option>
                <option value="Open">🔴 Open</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Resolved">🟢 Resolved</option>
              </select>
            </div>
          </div>

          {/* TABLE */}
          {filteredTickets.length === 0 ? (
            <div className="alert alert-info text-center rounded-3 shadow-sm">
              No support tickets found
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead
                  style={{
                    background: "linear-gradient(to right,#141e30,#243b55)",
                    color: "#fff",
                  }}
                >
                  <tr>
                    <th>User</th>
                    <th className="d-none d-md-table-cell">Phone</th>
                    <th className="d-none d-md-table-cell">Email</th>
                    <th className="d-none d-md-table-cell">Order ID</th>
                    <th>Problem</th>
                    <th className="d-none d-md-table-cell">Message</th>
                    <th>Status</th>
                    <th className="d-none d-md-table-cell">Update</th>
                    <th className="d-md-none">View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr key={t._id}>
                      <td className="fw-semibold">{t.name}</td>
                      <td className="d-none d-md-table-cell">{t.phone}</td>
                      <td className="d-none d-md-table-cell">{t.email}</td>
                      <td className="d-none d-md-table-cell">{t.orderId}</td>
                      <td>{t.problem}</td>
                      <td className="d-none d-md-table-cell">{t.message}</td>
                      <td>
                        <span
                          className={`badge rounded-pill px-3 ${
                            t.status === "Resolved"
                              ? "bg-success"
                              : t.status === "In Progress"
                              ? "bg-warning text-dark"
                              : "bg-danger"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <select
                          className="form-select form-select-sm rounded-pill"
                          value={t.status}
                          onChange={(e) =>
                            updateStatus(t._id, e.target.value)
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="d-md-none">
                        <button
                          className="btn btn-primary btn-sm rounded-pill w-100"
                          onClick={() => {
                            setOrderDetails(t);
                            setShowViewModal(true);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    {/* VIEW POPUP (MOBILE ONLY) */}
      {isMobile && showViewModal && orderDetails && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowViewModal(false)}
        >
          <div className="modal-dialog modal-dialog-scrollable modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-primary shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  📦 Ticket Details {orderDetails.orderId || "N/A"}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="text-primary">👤 User Info</h6>
                  <p>
                    <b>Name:</b> {orderDetails.name} <br />
                    <b>Phone:</b> {orderDetails.phone || "N/A"} <br />
                    <b>Email:</b> {orderDetails.email || "N/A"}
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="text-primary">🛠 Problem</h6>
                  <p>
                    <b>Issue:</b> {orderDetails.problem} <br />
                    <b>Message:</b> {orderDetails.message}
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="text-primary">📊 Status</h6>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={orderDetails.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setOrderDetails((prev) => ({ ...prev, status: newStatus }));
                      updateStatus(orderDetails._id, newStatus);
                    }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <p className="mt-2">
                    <b>Created At:</b> {new Date(orderDetails.createdAt).toLocaleString()}
                  </p>
                </div>

                {orderDetails.products?.length > 0 && (
                  <div>
                    <h6 className="text-primary">🛒 Products</h6>
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.products.map((p, i) => (
                          <tr key={p._id}>
                            <td>{i + 1}</td>
                            <td>{p.name}</td>
                            <td>₹{p.price}</td>
                            <td>{p.quantity}</td>
                            <td>₹{p.price * p.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      
    </div>
  );
}


