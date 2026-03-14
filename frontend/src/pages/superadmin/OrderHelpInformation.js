import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaHeadset } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderHelp = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [helps, setHelps] = useState([]);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchHelps();
  }, [token]);

  const fetchHelps = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/orderhelp",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHelps(res.data || []);
    } catch (err) {
      console.error("Fetch Help Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError("Failed to load help requests.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const deleteHelp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/orderhelp/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHelps((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Delete Help Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        alert("Delete failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 fw-semibold text-secondary">
          Loading Order Help Requests...
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
          background: "linear-gradient(135deg,#0d6efd,#6610f2)",
          color: "#fff",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-white text-primary shadow">
              <FaHeadset size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Order Help Requests</h4>
              <small className="opacity-75">
                Manage and review customer support issues
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Requests: {helps.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm rounded-3">
          {error}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="card-body table-responsive p-0">

          <table className="table align-middle mb-0 table-hover">
            <thead
              style={{
                background: "#111827",
                color: "#fff",
              }}
            >
              <tr>
                <th className="d-none d-md-table-cell">#</th>
                <th>User</th>
                <th className="d-none d-md-table-cell">Email</th>
                <th className="d-none d-md-table-cell">Admin Phone</th>
                <th>Status</th>
                <th className="text-center">View</th>
                <th className="text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {helps.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="text-muted">
                      <FaHeadset size={40} className="mb-3 opacity-50" />
                      <h5>No Help Requests Found</h5>
                      <p className="mb-0">
                        There are currently no support tickets.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                helps.map((h, index) => (
                  <tr key={h._id} style={{ transition: "0.2s ease" }}>

                    <td className="d-none d-md-table-cell fw-semibold">
                      {index + 1}
                    </td>

                    <td>
                      <div className="fw-bold">
                        {h?.userId?.name || h?.name}
                      </div>
                      <div className="text-muted small">
                        {h?.userId?.phone || h?.phone}
                      </div>
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {h?.userId?.email || h?.email}
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {h?.adminphone}
                    </td>

                    <td>
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2">
                        {h?.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#helpModal"
                        onClick={() => setSelectedHelp(h)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger rounded-circle shadow-sm"
                        onClick={() => deleteHelp(h._id)}
                        style={{ width: "35px", height: "35px" }}
                      >
                        <FaTrash size={14} />
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
      <div className="modal fade" id="helpModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">
                Order Help Details
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedHelp && (
                <div className="row g-3">

                  <div className="col-md-6">
                    <strong>User Name:</strong>
                    <div>{selectedHelp?.userId?.name || selectedHelp?.name}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Phone:</strong>
                    <div>{selectedHelp?.userId?.phone || selectedHelp?.phone}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Email:</strong>
                    <div>{selectedHelp?.userId?.email || selectedHelp?.email}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Admin Phone:</strong>
                    <div>{selectedHelp?.adminphone}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Order ID:</strong>
                    <div>{selectedHelp?.orderId}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <div>{selectedHelp?.status}</div>
                  </div>

                  <div className="col-12">
                    <strong>Problem:</strong>
                    <div>{selectedHelp?.problem}</div>
                  </div>

                  {selectedHelp?.otherProblem && (
                    <div className="col-12">
                      <strong>Other Problem:</strong>
                      <div>{selectedHelp?.otherProblem}</div>
                    </div>
                  )}

                  <div className="col-12">
                    <strong>Message:</strong>
                    <div>{selectedHelp?.message}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Created At:</strong>
                    <div>
                      {selectedHelp?.createdAt
                        ? new Date(selectedHelp.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Updated At:</strong>
                    <div>
                      {selectedHelp?.updatedAt
                        ? new Date(selectedHelp.updatedAt).toLocaleString()
                        : ""}
                    </div>
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

export default OrderHelp;
