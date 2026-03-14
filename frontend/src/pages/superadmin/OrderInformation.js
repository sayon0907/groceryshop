import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const OrderInformation = () => {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || role !== "superadmin") {
      logout();
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [token, role]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders(res.data || []);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/login");
      } else {
        setError("Failed to load orders.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?"))
      return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/orders/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      {/* ✅ Responsive Heading Style */}
      <style>
        {`
          .page-title {
            font-size: 28px;
            font-weight: 700;
          }

          @media (max-width: 768px) {
            .page-title {
              font-size: 20px;
            }
          }
        `}
      </style>

      {/* ✅ Professional Header */}
      <div
        className="p-4 mb-4 rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg,#198754,#0d6efd)",
          color: "#fff",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white text-success p-3 rounded-circle shadow-sm">
            <FaShoppingCart size={20} />
          </div>
          <div>
            <h3 className="page-title mb-0">SuperAdmin Orders</h3>
            <small className="opacity-75">
              Manage and monitor all system orders
            </small>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-2 table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th className="d-none d-md-table-cell">#</th>
                <th>User</th>
                <th className="d-none d-md-table-cell">Admin Phone</th>
                <th className="d-none d-md-table-cell">Total</th>
                <th>Status</th>
                <th>View</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order._id}>
                    <td className="d-none d-md-table-cell">
                      {index + 1}
                    </td>

                    <td>
                      {order.userId?.name} ({order.userId?.phone})
                    </td>

                    <td className="d-none d-md-table-cell">
                      {order.adminphone}
                    </td>

                    <td className="d-none d-md-table-cell">
                      ₹{order.totalAmount}
                    </td>

                    <td>
                      <span className="badge bg-info text-dark">
                        {order.status}
                      </span>

                      {order.status === "Shipped" && (
                        <div className="mt-1 text-success small">
                          <div>
                            <strong>Boy:</strong>{" "}
                            {order.deliveryBoyName}
                          </div>
                          <div>
                            <strong>Phone:</strong>{" "}
                            {order.deliveryBoyPhone}
                          </div>
                        </div>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#orderModal"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FaEye />
                      </button>
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteOrder(order._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <div className="modal fade" id="orderModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Order Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedOrder && (
                <>
                  <p><strong>User:</strong> {selectedOrder.userId?.name} ({selectedOrder.userId?.phone})</p>
                  <p><strong>Admin Phone:</strong> {selectedOrder.adminphone}</p>
                  <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>

                  {selectedOrder.status === "Shipped" && (
                    <>
                      <p><strong>Delivery Boy:</strong> {selectedOrder.deliveryBoyName}</p>
                      <p><strong>Delivery Boy Phone:</strong> {selectedOrder.deliveryBoyPhone}</p>
                    </>
                  )}

                  <p><strong>Estimate:</strong> {selectedOrder.deliveryEstimate}</p>
                  <p><strong>Address:</strong> {selectedOrder.location?.address}</p>
                  <p><strong>Pin:</strong> {selectedOrder.userPin}</p>
                  <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>

                  <p><strong>Products:</strong></p>
                  <ul>
                    {selectedOrder.products?.map((p, i) => (
                      <li key={i}>
                        {p.name} - {p.quantity} × ₹{p.price}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInformation;




// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { FaTrash, FaEye, FaShoppingCart } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import "bootstrap/dist/css/bootstrap.min.css";

// const OrderInformation = () => {
//   const { token, role, logout } = useAuth();
//   const navigate = useNavigate();

//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!token || role !== "superadmin") {
//       logout();
//       navigate("/login");
//       return;
//     }
//     fetchOrders();
//   }, [token, role]);

//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await axios.get(
//         "http://localhost:5000/api/superadmin/orders",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setOrders(res.data || []);
//     } catch (err) {
//       console.error(err);

//       if (err.response?.status === 401 || err.response?.status === 403) {
//         logout();
//         navigate("/login");
//       } else {
//         setError("Failed to load orders.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [token, logout, navigate]);

//   const deleteOrder = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this order?"))
//       return;

//     try {
//       await axios.delete(
//         `http://localhost:5000/api/superadmin/orders/${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setOrders((prev) => prev.filter((order) => order._id !== id));
//     } catch (err) {
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         logout();
//         navigate("/login");
//       } else {
//         alert("Delete failed");
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="text-center p-5">
//         <div className="spinner-border text-primary"></div>
//         <p className="mt-3 fw-semibold text-secondary">
//           Loading Orders...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid px-3 px-md-5 mt-4">

//       {/* HEADER SECTION */}
//       <div
//         className="p-4 mb-4 rounded-4 shadow-sm"
//         style={{
//           background: "linear-gradient(135deg,#0d6efd,#6610f2)",
//           color: "#fff",
//         }}
//       >
//         <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
//           <div className="d-flex align-items-center gap-3">
//             <div className="p-3 bg-white text-primary rounded-circle shadow">
//               <FaShoppingCart size={22} />
//             </div>
//             <div>
//               <h4 className="fw-bold mb-0">SuperAdmin Orders</h4>
//               <small className="opacity-75">
//                 Manage and monitor all system orders
//               </small>
//             </div>
//           </div>

//           <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
//             Total Orders: {orders.length}
//           </span>
//         </div>
//       </div>

//       {error && (
//         <div className="alert alert-danger shadow-sm rounded-3">
//           {error}
//         </div>
//       )}

//       {/* TABLE CARD */}
//       <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
//         <div className="card-body table-responsive p-0">

//           <table className="table align-middle mb-0 table-hover">
//             <thead style={{ background: "#111827", color: "#fff" }}>
//               <tr>
//                 <th className="d-none d-md-table-cell">#</th>
//                 <th>User</th>
//                 <th className="d-none d-md-table-cell">Admin Phone</th>
//                 <th className="d-none d-md-table-cell">Total</th>
//                 <th>Status</th>
//                 <th className="text-center">View</th>
//                 <th className="text-center">Delete</th>
//               </tr>
//             </thead>

//             <tbody>
//               {orders.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" className="text-center py-5">
//                     <FaShoppingCart size={40} className="mb-3 opacity-50" />
//                     <h5>No orders found</h5>
//                   </td>
//                 </tr>
//               ) : (
//                 orders.map((order, index) => (
//                   <tr key={order._id} style={{ transition: "0.2s ease" }}>
//                     <td className="d-none d-md-table-cell fw-semibold">
//                       {index + 1}
//                     </td>

//                     <td>
//                       <span className="fw-semibold">
//                         {order.userId?.name}
//                       </span>
//                       <div className="text-muted small">
//                         {order.userId?.phone}
//                       </div>
//                     </td>

//                     <td className="d-none d-md-table-cell text-muted">
//                       {order.adminphone}
//                     </td>

//                     <td className="d-none d-md-table-cell fw-bold text-success">
//                       ₹{order.totalAmount}
//                     </td>

//                     <td>
//                       <span
//                         className={`badge px-3 py-2 ${
//                           order.status === "Pending"
//                             ? "bg-warning text-dark"
//                             : order.status === "Shipped"
//                             ? "bg-info text-dark"
//                             : order.status === "Delivered"
//                             ? "bg-success"
//                             : "bg-secondary"
//                         }`}
//                       >
//                         {order.status}
//                       </span>

//                       {order.status === "Shipped" && (
//                         <div className="mt-2 text-success small">
//                           <div>
//                             <strong>Boy:</strong>{" "}
//                             {order.deliveryBoyName}
//                           </div>
//                           <div>
//                             <strong>Phone:</strong>{" "}
//                             {order.deliveryBoyPhone}
//                           </div>
//                         </div>
//                       )}
//                     </td>

//                     <td className="text-center">
//                       <button
//                         className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
//                         data-bs-toggle="modal"
//                         data-bs-target="#orderModal"
//                         onClick={() => setSelectedOrder(order)}
//                       >
//                         <FaEye />
//                       </button>
//                     </td>

//                     <td className="text-center">
//                       <button
//                         className="btn btn-sm btn-danger rounded-circle shadow-sm"
//                         onClick={() => deleteOrder(order._id)}
//                         style={{ width: "35px", height: "35px" }}
//                       >
//                         <FaTrash size={14} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* MODAL */}
//       <div className="modal fade" id="orderModal" tabIndex="-1">
//         <div className="modal-dialog modal-lg modal-dialog-centered">
//           <div className="modal-content rounded-4 border-0 shadow-lg">

//             <div className="modal-header bg-dark text-white">
//               <h5 className="modal-title fw-bold">Order Details</h5>
//               <button
//                 type="button"
//                 className="btn-close btn-close-white"
//                 data-bs-dismiss="modal"
//               ></button>
//             </div>

//             <div className="modal-body">
//               {selectedOrder && (
//                 <div className="d-flex flex-column gap-2">

//                   <p><strong>User:</strong> {selectedOrder.userId?.name} ({selectedOrder.userId?.phone})</p>
//                   <p><strong>Admin Phone:</strong> {selectedOrder.adminphone}</p>
//                   <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
//                   <p><strong>Status:</strong> {selectedOrder.status}</p>

//                   {selectedOrder.status === "Shipped" && (
//                     <>
//                       <p><strong>Delivery Boy:</strong> {selectedOrder.deliveryBoyName}</p>
//                       <p><strong>Delivery Boy Phone:</strong> {selectedOrder.deliveryBoyPhone}</p>
//                     </>
//                   )}

//                   <hr />

//                   <p><strong>Estimate:</strong> {selectedOrder.deliveryEstimate}</p>
//                   <p><strong>Address:</strong> {selectedOrder.location?.address}</p>
//                   <p><strong>Pin:</strong> {selectedOrder.userPin}</p>
//                   <p><strong>Latitude:</strong> {selectedOrder.location?.lat}</p>
//                   <p><strong>Longitude:</strong> {selectedOrder.location?.lng}</p>
//                   <p><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>

//                   <hr />

//                   <p><strong>Products:</strong></p>
//                   <ul>
//                     {selectedOrder.products?.map((p, i) => (
//                       <li key={i}>
//                         {p.name} — {p.quantity} × ₹{p.price}
//                       </li>
//                     ))}
//                   </ul>

//                 </div>
//               )}
//             </div>

//             <div className="modal-footer">
//               <button className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">
//                 Close
//               </button>
//             </div>

//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default OrderInformation;
