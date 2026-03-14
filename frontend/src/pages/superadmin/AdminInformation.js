import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminInformation = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Secure Token Check ---------------- */
  useEffect(() => {
    if (!token) {
      logout();
      navigate("/superadmin/login");
      return;
    }
    fetchAdmins();
  }, [token]);

  /* ---------------- Close Modal On Desktop Resize ---------------- */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        const modal = document.getElementById("adminModal");
        if (modal) {
          modal.classList.remove("show");
          modal.style.display = "none";
        }

        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();

        document.body.classList.remove("modal-open");
        document.body.style = "";
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAdmins = async () => {
    try {
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/admins",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdmins(res.data);
    } catch (err) {
      console.error("Fetch Admin Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError("Failed to load admins.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?"))
      return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/admins/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Delete Admin Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        alert("Failed to delete admin.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 fw-semibold text-secondary">
          Loading Admin Information...
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
          background: "linear-gradient(135deg,#0d6efd,#6610f2)",
          color: "#fff",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-3 rounded-circle bg-white text-primary shadow"
            >
              <FaUserShield size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Admin Information</h4>
              <small className="opacity-75">
                Manage all registered administrators
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Admins: {admins.length}
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
                <th className="d-none d-md-table-cell">Name</th>
                <th>Phone</th>
                <th>Verified</th>
                <th className="d-none d-md-table-cell">Created</th>
                <th className="d-none d-md-table-cell">Latitude</th>
                <th className="d-none d-md-table-cell">Longitude</th>
                <th className="d-md-none text-center">View</th>
                <th className="text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="text-muted">
                      <FaUserShield size={40} className="mb-3 opacity-50" />
                      <h5>No Admins Found</h5>
                      <p className="mb-0">
                        There are currently no registered admins.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr
                    key={admin._id}
                    style={{ transition: "0.2s ease" }}
                  >
                    <td className="d-none d-md-table-cell fw-semibold">
                      {index + 1}
                    </td>

                    <td className="d-none d-md-table-cell fw-bold text-dark">
                      {admin.name}
                    </td>

                    <td className="fw-semibold text-secondary">
                      {admin.phone}
                    </td>

                    <td>
                      {admin.isPhoneVerified ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                          ✔ Verified
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                          ✖ Not Verified
                        </span>
                      )}
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {admin.location?.lat || "—"}
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {admin.location?.lng || "—"}
                    </td>

                    {/* MOBILE VIEW */}
                    <td className="d-md-none text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#adminModal"
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger rounded-circle shadow-sm"
                        onClick={() => deleteAdmin(admin._id)}
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

      {/* MOBILE MODAL */}
      <div className="modal fade d-md-none" id="adminModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">Admin Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedAdmin && (
                <div className="d-flex flex-column gap-3">

                  <div className="border-bottom pb-2">
                    <strong>Name:</strong> {selectedAdmin.name}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Phone:</strong> {selectedAdmin.phone}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Verified:</strong>{" "}
                    {selectedAdmin.isPhoneVerified ? (
                      <span className="text-success fw-semibold">Yes</span>
                    ) : (
                      <span className="text-danger fw-semibold">No</span>
                    )}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Created:</strong>{" "}
                    {new Date(selectedAdmin.createdAt).toLocaleString()}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Latitude:</strong>{" "}
                    {selectedAdmin.location?.lat || "—"}
                  </div>

                  <div>
                    <strong>Longitude:</strong>{" "}
                    {selectedAdmin.location?.lng || "—"}
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

export default AdminInformation;
