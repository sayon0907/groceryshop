import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDetails, setDeliveryDetails] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { token, role } = useAuth();

  useEffect(() => {
    if (!token || role !== "admin") {
      alert("⚠️ Admin not logged in!");
      return;
    }
    fetchOrders();
  }, [token, role]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://groceryshop-d27s.onrender.com/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const initialDeliveryDetails = {};
      sorted.forEach((o) => {
        initialDeliveryDetails[o._id] = {
          deliveryBoyName: o.deliveryBoyName || "",
          deliveryBoyPhone: o.deliveryBoyPhone || "",
        };
      });

      setDeliveryDetails(initialDeliveryDetails);
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const assignDelivery = async (orderId) => {
    const { deliveryBoyName, deliveryBoyPhone } =
      deliveryDetails[orderId] || {};

    if (!deliveryBoyName || !deliveryBoyPhone)
      return alert("Please enter both delivery boy name and phone number.");

    try {
      const res = await axios.put(
        `https://groceryshop-d27s.onrender.com/api/admin/orders/${orderId}/assign`,
        { deliveryBoyName, deliveryBoyPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = res.data.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updatedOrder : o))
      );

      alert("✅ Delivery assigned successfully!");
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign delivery");
    }
  };

  const getGoogleMapsLink = (lat, lng) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

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
        Loading Orders
      </h6>

      <small className="text-muted">
        System is preparing the data.
      </small>

    </div>
  );


  return (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">
      <div
        className="mb-4 p-4 rounded-4 shadow-sm text-white"
        style={{
          background: "linear-gradient(135deg,#1e3c72,#2a5298)",
        }}
      >
        <h2 className="fw-bold mb-1">📦 Orders Management</h2>
        <p className="mb-0 opacity-75">
          Manage customer orders and assign delivery partners
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center mt-5">
          <h5>No orders found.</h5>
        </div>
      ) : (
        <>
          <div className="table-responsive shadow rounded-4 bg-white">
            <table className="table align-middle mb-0">
              <thead
                style={{
                  background:
                    "linear-gradient(to right,#141e30,#243b55)",
                  color: "#fff",
                }}
              >
                <tr className="text-center">
                  <th>User</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th className="d-md-none">View</th>
                  <th className="d-none d-md-table-cell">Total</th>
                  <th className="d-none d-md-table-cell">Address</th>
                  <th className="d-none d-md-table-cell">Coordinates</th>
                  <th className="d-none d-md-table-cell">Delivery</th>
                  <th className="d-none d-md-table-cell">Date</th>
                  <th className="d-none d-md-table-cell">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="text-center">
                    <td className="text-center">
                      <strong>{order.userId?.name || "Unknown"}</strong>
                      <div className="small text-muted">
                        {order.userId?.phone || "N/A"}
                      </div>
                    </td>

                    <td>
                      {order.products.map((p, i) => (
                        <div key={i}>
                          {p.name} × {p.quantity}
                        </div>
                      ))}
                    </td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-pill fw-semibold ${
                          order.status === "Pending" ||
                          order.status === "Order Confirmed"
                            ? "bg-warning text-dark"
                            : order.status === "Shipped"
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="d-md-none">
                      <button
                        className="btn btn-sm btn-primary rounded-pill px-3"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>

                    <td className="d-none d-md-table-cell fw-bold text-success">
                      ₹{order.totalAmount}
                    </td>

                    <td className="d-none d-md-table-cell">
                      {order.location?.address || "N/A"}
                    </td>

                    <td className="d-none d-md-table-cell small">
                      {order.location?.lat && order.location?.lng ? (
                        <a
                          href={getGoogleMapsLink(
                            order.location.lat,
                            order.location.lng
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm rounded-pill"
                        >
                          📍 View Map
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>

                    <td className="d-none d-md-table-cell">
                      <input
                        className="form-control form-control-sm mb-2 rounded-3"
                        placeholder="Name"
                        value={deliveryDetails[order._id]?.deliveryBoyName || ""}
                        onChange={(e) =>
                          setDeliveryDetails((prev) => ({
                            ...prev,
                            [order._id]: {
                              ...prev[order._id],
                              deliveryBoyName: e.target.value,
                            },
                          }))
                        }
                      />
                      <input
                        className="form-control form-control-sm rounded-3"
                        placeholder="Phone"
                        value={deliveryDetails[order._id]?.deliveryBoyPhone || ""}
                        onChange={(e) =>
                          setDeliveryDetails((prev) => ({
                            ...prev,
                            [order._id]: {
                              ...prev[order._id],
                              deliveryBoyPhone: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>

                    <td className="d-none d-md-table-cell small">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </td>

                    <td className="d-none d-md-table-cell">
                      <button
                        className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
                        onClick={() => assignDelivery(order._id)}
                      >
                        Assign & Ship
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE MODAL */}
          {selectedOrder && (
           <div className="d-md-none">

            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              onClick={() => setSelectedOrder(null)}
            >
              <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content rounded-4 shadow-lg border-0">
                  <div
                    className="modal-header text-white"
                    style={{
                      background:
                        "linear-gradient(135deg,#1e3c72,#2a5298)",
                    }}
                  >
                    <h5 className="modal-title fw-bold">
                      Order Full Details
                    </h5>
                    <button
                      className="btn-close btn-close-white"
                      onClick={() => setSelectedOrder(null)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <p><strong>User:</strong> {selectedOrder.userId?.name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.userId?.phone}</p>

                    <p><strong>Products:</strong></p>
                    {selectedOrder.products.map((p, i) => (
                      <div key={i}>
                        {p.name} × {p.quantity}
                      </div>
                    ))}

                    <p className="mt-2">
                      <strong>Date:</strong>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                    </p>

                    <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-3 py-1 rounded-pill fw-semibold ${
                          selectedOrder.status === "Pending" ||
                          selectedOrder.status === "Order Confirmed"
                            ? "bg-warning text-dark"
                            : selectedOrder.status === "Shipped"
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                        }`}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>

                    <p><strong>Address:</strong> {selectedOrder.location?.address}</p>

                    {selectedOrder.location?.lat &&
                    selectedOrder.location?.lng ? (
                      <>
                        <div className="small mb-2">
                          Lat: {selectedOrder.location.lat.toFixed(5)}, Lng:{" "}
                          {selectedOrder.location.lng.toFixed(5)}
                        </div>
                        <a
                          href={getGoogleMapsLink(
                            selectedOrder.location.lat,
                            selectedOrder.location.lng
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary w-100 rounded-pill"
                        >
                          📍 Open in Google Maps
                        </a>
                      </>
                    ) : (
                      "N/A"
                    )}

                    <hr />


                    <h6 className="fw-bold">Assign Delivery</h6>
                    <input
                      className="form-control mb-2 rounded-3"
                      placeholder="Delivery Boy Name"
                      value={
                        deliveryDetails[selectedOrder._id]?.deliveryBoyName || ""
                      }
                      onChange={(e) =>
                        setDeliveryDetails((prev) => ({
                          ...prev,
                          [selectedOrder._id]: {
                            ...prev[selectedOrder._id],
                            deliveryBoyName: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className="form-control rounded-3"
                      placeholder="Delivery Boy Phone"
                      value={
                        deliveryDetails[selectedOrder._id]?.deliveryBoyPhone || ""
                      }
                      onChange={(e) =>
                        setDeliveryDetails((prev) => ({
                          ...prev,
                          [selectedOrder._id]: {
                            ...prev[selectedOrder._id],
                            deliveryBoyPhone: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="modal-footer border-0">
                    <button
                      className="btn btn-success rounded-pill px-4 shadow-sm"
                      onClick={() => assignDelivery(selectedOrder._id)}
                    >
                      Assign & Ship
                    </button>
                    <button
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}