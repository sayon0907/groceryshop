import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaEnvelopeOpenText } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const ContactAdmin = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchContacts();
  }, [token]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/contact",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setContacts(res.data || []);
    } catch (err) {
      console.error("Fetch Contact Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError("Failed to load contacts.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this contact?")) return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/contact/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Delete Contact Error:", err);

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
        <p className="mt-3 fw-semibold text-muted">
          Loading Contact Messages...
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
            <div className="bg-white text-primary p-3 rounded-circle shadow">
              <FaEnvelopeOpenText size={22} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Contact Messages</h4>
              <small className="opacity-75">
                Manage customer inquiries and messages
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Messages: {contacts.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 shadow-sm">
          {error}
        </div>
      )}

      {/* TABLE CARD */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="card-body table-responsive p-0">

          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "#111827", color: "#fff" }}>
              <tr>
                <th className="d-none d-md-table-cell">#</th>
                <th>Name</th>
                <th className="d-none d-md-table-cell">Email</th>
                <th>Phone</th>
                <th className="d-none d-md-table-cell">Message</th>
                <th className="text-center">View</th>
                <th className="text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <FaEnvelopeOpenText size={40} className="mb-3 text-muted opacity-50" />
                    <h5 className="text-muted">No Messages Found</h5>
                    <p className="text-muted mb-0">
                      There are currently no contact messages.
                    </p>
                  </td>
                </tr>
              ) : (
                contacts.map((c, index) => (
                  <tr key={c._id} style={{ transition: "0.2s ease" }}>
                    <td className="d-none d-md-table-cell fw-semibold">
                      {index + 1}
                    </td>

                    <td className="fw-bold">{c?.name}</td>

                    <td className="d-none d-md-table-cell text-muted text-truncate">
                      {c?.email}
                    </td>

                    <td className="fw-semibold text-secondary">
                      {c?.phone}
                    </td>

                    <td className="d-none d-md-table-cell text-muted">
                      {c?.message && c.message.length > 70
                        ? c.message.substring(0, 70) + "..."
                        : c?.message}
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#contactModal"
                        onClick={() => setSelectedContact(c)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger rounded-circle shadow-sm"
                        style={{ width: "35px", height: "35px" }}
                        onClick={() => deleteContact(c._id)}
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
      <div className="modal fade" id="contactModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">Contact Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedContact && (
                <div className="d-flex flex-column gap-3">

                  <div className="border-bottom pb-2">
                    <strong>Name:</strong> {selectedContact?.name}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Email:</strong> {selectedContact?.email}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Phone:</strong> {selectedContact?.phone}
                  </div>

                  <div className="border-bottom pb-2">
                    <strong>Message:</strong>
                    <div className="mt-2 text-muted">
                      {selectedContact?.message}
                    </div>
                  </div>

                  <div>
                    <strong>Created At:</strong>{" "}
                    {selectedContact?.createdAt
                      ? new Date(selectedContact.createdAt).toLocaleString()
                      : ""}
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

export default ContactAdmin;
