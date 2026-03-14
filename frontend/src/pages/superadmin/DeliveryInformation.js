import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaMotorcycle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const DeliveryBoyInformation = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Secure Token Check ---------------- */
  useEffect(() => {
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchDeliveryBoys();
  }, [token]);

  /* ---------------- Fetch Delivery Boys ---------------- */
  const fetchDeliveryBoys = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/deliveries",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDeliveryBoys(res.data || []);
    } catch (err) {
      console.error("Fetch Delivery Boys Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError("Failed to load delivery boys.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  /* ---------------- Delete Delivery Boy ---------------- */
  const deleteDeliveryBoy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery boy?"))
      return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/deliveries/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDeliveryBoys((prev) =>
        prev.filter((boy) => boy._id !== id)
      );
    } catch (err) {
      console.error("Delete Delivery Boy Error:", err);

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
          Loading Delivery Boys...
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-5 mt-4">

      {/* HEADER SECTION */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg,#198754,#0dcaf0)",
          color: "#fff",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-white text-success shadow">
              <FaMotorcycle size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">
                Delivery Boy Information
              </h4>
              <small className="opacity-75">
                Manage all registered delivery partners
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Delivery Boys: {deliveryBoys.length}
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
                <th className="d-none d-md-table-cell" style={{ width: "8%" }}>#</th>
                <th className="d-none d-md-table-cell" style={{ width: "30%" }}>Name</th>
                <th style={{ width: "25%" }}>Phone</th>
                <th style={{ width: "20%" }}>Verified</th>
                <th className="d-md-none text-center" style={{ width: "10%" }}>View</th>
                <th className="text-center" style={{ width: "12%" }}>Delete</th>
              </tr>
            </thead>

            <tbody>
              {deliveryBoys.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-muted">
                      <FaMotorcycle size={40} className="mb-3 opacity-50" />
                      <h5>No Delivery Boys Found</h5>
                      <p className="mb-0">
                        There are currently no registered delivery partners.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                deliveryBoys.map((boy, index) => (
                  <tr key={boy._id} style={{ transition: "0.2s ease" }}>

                    <td className="d-none d-md-table-cell fw-semibold">
                      {index + 1}
                    </td>

                    <td className="d-none d-md-table-cell fw-bold text-dark">
                      {boy?.name}
                    </td>

                    <td className="fw-semibold text-secondary">
                      {boy?.phone}
                    </td>

                    <td>
                      {boy?.isPhoneVerified ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                          ✔ Verified
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                          ✖ Not Verified
                        </span>
                      )}
                    </td>

                    {/* MOBILE VIEW */}
                    <td className="d-md-none text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#deliveryModal"
                        onClick={() => setSelectedDelivery(boy)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger rounded-circle shadow-sm"
                        onClick={() => deleteDeliveryBoy(boy._id)}
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
      <div className="modal fade" id="deliveryModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">
                Delivery Boy Details
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedDelivery && (
                <div className="d-flex flex-column gap-3">

                  <div className="border-bottom pb-2">
                    <strong>Name:</strong> {selectedDelivery?.name}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Phone:</strong> {selectedDelivery?.phone}
                  </div>

                  <div>
                    <strong>Verified:</strong>{" "}
                    {selectedDelivery?.isPhoneVerified ? (
                      <span className="text-success fw-semibold">Yes</span>
                    ) : (
                      <span className="text-danger fw-semibold">No</span>
                    )}
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

export default DeliveryBoyInformation;
