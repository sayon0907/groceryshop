import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const UserInformation = () => {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate("/superadmin/login", { replace: true });
  }, [logout, navigate]);

  const api = axios.create({
    baseURL: "https://groceryshop-d27s.onrender.com/api",
  });

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token, handleUnauthorized]);

  useEffect(() => {
    if (!token || role !== "superadmin") {
      handleUnauthorized();
      return;
    }
    fetchUsers();
  }, [token, role]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        const modal = document.getElementById("userModal");
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

  const fetchUsers = async () => {
    try {
      const res = await api.get("/superadmin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?"))
      return;

    try {
      await api.delete(`/superadmin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete User Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 fw-semibold text-secondary">
          Loading User Information...
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
            <div className="bg-white text-primary p-3 rounded-circle shadow">
              <FaUsers size={22} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">User Information</h4>
              <small className="opacity-75">
                Manage all registered users
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="card-body table-responsive p-0">
          <table className="table align-middle mb-0 table-hover">
            <thead style={{ background: "#111827", color: "#fff" }}>
              <tr>
                <th className="d-none d-md-table-cell">#</th>
                <th className="d-none d-md-table-cell">Name</th>
                <th>Phone</th>
                <th>Verified</th>
                <th className="d-none d-md-table-cell">Email</th>
                <th className="d-none d-md-table-cell">Address</th>
                <th className="d-none d-md-table-cell">Pin</th>
                <th className="d-none d-md-table-cell">Lat</th>
                <th className="d-none d-md-table-cell">Lng</th>
                <th className="d-md-none text-center">View</th>
                <th className="text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <div className="text-muted">
                      <FaUsers size={40} className="mb-3 opacity-50" />
                      <h5>No Users Found</h5>
                      <p className="mb-0">
                        There are currently no registered users.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user._id}>
                    <td className="d-none d-md-table-cell fw-semibold">
                      {index + 1}
                    </td>

                    <td className="d-none d-md-table-cell fw-bold text-dark">
                      {user.name}
                    </td>

                    <td className="fw-semibold text-secondary">
                      {user.phone}
                    </td>

                    <td>
                      {user.isPhoneVerified ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                          ✔ Verified
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                          ✖ Not Verified
                        </span>
                      )}
                    </td>

                    <td className="d-none d-md-table-cell">
                      {user.email}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {user.location?.address}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {user.location?.pin}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {user.location?.lat}
                    </td>
                    <td className="d-none d-md-table-cell">
                      {user.location?.lng}
                    </td>

                    {/* MOBILE VIEW BUTTON */}
                    <td className="d-md-none text-center">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#userModal"
                        onClick={() => setSelectedUser(user)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    {/* DELETE */}
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger rounded-circle shadow-sm"
                        style={{ width: "35px", height: "35px" }}
                        onClick={() => deleteUser(user._id)}
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
      <div className="modal fade d-md-none" id="userModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">User Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedUser && (
                <div className="d-flex flex-column gap-3">
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Phone:</strong> {selectedUser.phone}</div>
                  <div>
                    <strong>Verified:</strong>{" "}
                    {selectedUser.isPhoneVerified ? (
                      <span className="text-success fw-semibold">Yes</span>
                    ) : (
                      <span className="text-danger fw-semibold">No</span>
                    )}
                  </div>
                  <div><strong>Address:</strong> {selectedUser.location?.address}</div>
                  <div><strong>Pin:</strong> {selectedUser.location?.pin}</div>
                  <div><strong>Latitude:</strong> {selectedUser.location?.lat}</div>
                  <div><strong>Longitude:</strong> {selectedUser.location?.lng}</div>
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

export default UserInformation;
