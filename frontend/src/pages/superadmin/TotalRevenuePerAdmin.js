import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import { FaChartLine } from "react-icons/fa";

const TotalRevenuePerAdmin = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [adminPhone, setAdminPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!token) {
      logout();
      navigate("/superadmin/login");
      return;
    }
    fetchRevenue();
  }, [token]);

  const fetchRevenue = async (phone = "") => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/revenue/total",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: phone ? { adminphone: phone } : {},
        }
      );

      const updatedData = res.data.data.revenuePerAdmin.map((item) => {
        const percentage = item.percentage || 0;
        const pendingRevenue = item.pendingRevenue || 0;
        const deliveredRevenue = item.deliveredRevenue || 0;
        const totalPaymentDone = item.totalPaymentDone || 0;

        const pendingCommission = (pendingRevenue * percentage) / 100;
        const deliveredCommission = (deliveredRevenue * percentage) / 100;
        const totalCommission = pendingCommission + deliveredCommission;

        return {
          ...item,
          percentage,
          pendingRevenue,
          deliveredRevenue,
          totalPaymentDone,
          pendingCommission,
          deliveredCommission,
          totalCommission,
        };
      });

      setData(updatedData);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError(err.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRevenue(adminPhone);
  };

  const handlePercentageChange = (index, value) => {
    const updated = [...data];
    const percentage = Number(value);

    updated[index].percentage = percentage;
    updated[index].pendingCommission =
      (updated[index].pendingRevenue * percentage) / 100;
    updated[index].deliveredCommission =
      (updated[index].deliveredRevenue * percentage) / 100;
    updated[index].totalCommission =
      updated[index].pendingCommission + updated[index].deliveredCommission;

    setData(updated);

    if (selectedAdmin?.adminPhone === updated[index].adminPhone) {
      setSelectedAdmin(updated[index]);
    }
  };

  const handlePaymentChange = (index, value) => {
    const updated = [...data];
    updated[index].totalPaymentDone = Number(value);
    setData(updated);

    if (selectedAdmin?.adminPhone === updated[index].adminPhone) {
      setSelectedAdmin(updated[index]);
    }
  };

  const savePercentage = async (adminPhone, percentage) => {
    try {
      await axios.put(
        `https://groceryshop-d27s.onrender.com/api/superadmin/admins/update-percentage/${adminPhone}`,
        { percentage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Percentage saved successfully");
    } catch {
      setError("Failed to save percentage");
    }
  };

  const savePayment = async (adminPhone, totalPaymentDone) => {
    try {
      await axios.put(
        `https://groceryshop-d27s.onrender.com/api/superadmin/admins/update-payment/${adminPhone}`,
        { totalPaymentDone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Payment updated successfully");
    } catch {
      setError("Failed to save payment");
    }
  };

  const openModal = (admin) => {
    if (!isMobile) return;
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      {/* PROFESSIONAL HEADER */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg,#0d6efd,#6610f2)",
          color: "#fff",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white text-primary p-3 rounded-circle shadow-sm">
            <FaChartLine size={22} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Revenue & Commission Overview</h4>
            <small className="opacity-75">
              Monitor total revenue, commission percentage and payment status per admin
            </small>
          </div>
        </div>
      </div>

      {/* Search Row */}
      <div className="row mb-3">
        <div className={isMobile ? "col-7" : "col-md-4"}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Admin Phone"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
          />
        </div>
        <div className={isMobile ? "col-5" : "col-md-2"}>
          <button className="btn btn-primary w-100" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          {!isMobile && (
            <div className="table-responsive">
              <table className="table table-bordered table-striped shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th>Admin Name</th>
                    <th>Delivered Revenue</th>
                    <th>Pending Revenue</th>
                    <th>Total Revenue</th>
                    <th>Percentage (%)</th>
                    <th>Delivered Commission</th>
                    <th>Pending Commission</th>
                    <th>Total Commission</th>
                    <th>Total Payment Done</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => {
                    const totalRevenue =
                      item.pendingRevenue + item.deliveredRevenue;

                    return (
                      <tr key={item.adminPhone}>
                        <td>
                          {item.adminName
                            ? `${item.adminName} (${item.adminPhone})`
                            : item.adminPhone}
                        </td>
                        <td>₹{item.deliveredRevenue.toLocaleString()}</td>
                        <td>₹{item.pendingRevenue.toLocaleString()}</td>
                        <td>₹{totalRevenue.toLocaleString()}</td>

                        <td>
                          <div className="d-flex">
                            <input
                              type="number"
                              className="form-control me-2"
                              value={item.percentage}
                              onChange={(e) =>
                                handlePercentageChange(index, e.target.value)
                              }
                            />
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                savePercentage(item.adminPhone, item.percentage)
                              }
                            >
                              Set
                            </button>
                          </div>
                        </td>

                        <td>₹{item.deliveredCommission.toLocaleString()}</td>
                        <td>₹{item.pendingCommission.toLocaleString()}</td>
                        <td>₹{item.totalCommission.toLocaleString()}</td>

                        <td>
                          <div className="d-flex">
                            <input
                              type="number"
                              className="form-control me-2"
                              value={item.totalPaymentDone}
                              onChange={(e) =>
                                handlePaymentChange(index, e.target.value)
                              }
                            />
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() =>
                                savePayment(item.adminPhone, item.totalPaymentDone)
                              }
                            >
                              Set
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Table */}
          {isMobile && (
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Admin</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.adminPhone}>
                    <td>
                      <strong>{item.adminName || "Admin"}</strong>
                      <br />
                      <small className="text-muted">{item.adminPhone}</small>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openModal(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Mobile Modal */}
      {isMobile && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedAdmin?.adminName} ({selectedAdmin?.adminPhone})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedAdmin && (
              <>
                <p>Delivered Revenue: ₹{selectedAdmin.deliveredRevenue}</p>
                <p>Pending Revenue: ₹{selectedAdmin.pendingRevenue}</p>
                <p>
                  Total Revenue: ₹
                  {selectedAdmin.deliveredRevenue +
                    selectedAdmin.pendingRevenue}
                </p>

                <hr />

                <label>Percentage (%)</label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={selectedAdmin.percentage}
                  onChange={(e) =>
                    handlePercentageChange(
                      data.findIndex(
                        (a) => a.adminPhone === selectedAdmin.adminPhone
                      ),
                      e.target.value
                    )
                  }
                />
                <button
                  className="btn btn-success w-100 mb-3"
                  onClick={() =>
                    savePercentage(
                      selectedAdmin.adminPhone,
                      selectedAdmin.percentage
                    )
                  }
                >
                  Save Percentage
                </button>

                <p>Delivered Commission: ₹{selectedAdmin.deliveredCommission}</p>
                <p>Pending Commission: ₹{selectedAdmin.pendingCommission}</p>
                <p>Total Commission: ₹{selectedAdmin.totalCommission}</p>

                <hr />

                <label>Total Payment Done</label>
                <input
                  type="number"
                  className="form-control mb-2"
                  value={selectedAdmin.totalPaymentDone}
                  onChange={(e) =>
                    handlePaymentChange(
                      data.findIndex(
                        (a) => a.adminPhone === selectedAdmin.adminPhone
                      ),
                      e.target.value
                    )
                  }
                />
                <button
                  className="btn btn-warning w-100"
                  onClick={() =>
                    savePayment(
                      selectedAdmin.adminPhone,
                      selectedAdmin.totalPaymentDone
                    )
                  }
                >
                  Save Payment
                </button>
              </>
            )}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default TotalRevenuePerAdmin;
