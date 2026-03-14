// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { Table, Spinner, Modal, Button } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";

// export default function AdminDeliveredPage() {
//   const { token, role, logout } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (role !== "admin") {
//       navigate("/admin/login");
//       return;
//     }

//     const fetchDeliveredOrders = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/api/admin/totaldelivered",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setOrders(res.data.deliveredOrders || []);
//       } catch (err) {
//         console.error(err);
//         logout();
//         navigate("/admin/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDeliveredOrders();
//   }, [token, role, navigate, logout]);

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <Spinner animation="border" variant="primary" />
//       </div>
//     );
//   }

//   const sortedOrders = [...orders].sort((a, b) => {
//     const dateA = a.deliveredAt ? new Date(a.deliveredAt) : new Date(0);
//     const dateB = b.deliveredAt ? new Date(b.deliveredAt) : new Date(0);
//     return dateB - dateA;
//   });

//   return (
//     <div className="container mt-5">
//       <h2 className="mb-4 text-center">Delivered Orders</h2>

//       {sortedOrders.length === 0 ? (
//         <p className="text-center text-muted">No delivered orders found.</p>
//       ) : (
//         <>
//           <Table striped bordered hover responsive className="align-middle text-center">
//             <thead className="table-dark">
//               <tr>
//                 <th className="d-none d-md-table-cell">#</th>
//                 <th>User</th>
//                 <th>Products</th>
//                 <th className="d-none d-md-table-cell">Total Amount (₹)</th>
//                 <th className="d-none d-md-table-cell">Delivery Boy</th>
//                 <th className="d-none d-md-table-cell">Delivered At</th>
//                 <th>Status</th>
//                 <th className="d-md-none">View</th> {/* mobile view */}
//               </tr>
//             </thead>

//             <tbody>
//               {sortedOrders.map((order, index) => {
//                 const isCancelled = (order.status || "").toLowerCase() === "cancelled";

//                 return (
//                   <tr
//                     key={order._id}
//                     className={isCancelled ? "table-danger" : ""}
//                   >
//                     {/* Desktop Index */}
//                     <td className="d-none d-md-table-cell fw-bold">{index + 1}</td>

//                     {/* User */}
//                     <td>
//                       <div className="fw-semibold">{order.userId?.name || "Unknown"}</div>
//                       <small className="text-muted d-none d-md-block">{order.userId?.phone || "N/A"}</small>
//                     </td>

//                     {/* Products */}
//                     <td className="text-start">
//                       {order.products.map((p, i) => (
//                         <div key={i}>• {p.name} × {p.quantity}</div>
//                       ))}
//                     </td>

//                     {/* Total Amount (Desktop only) */}
//                     <td className="d-none d-md-table-cell fw-semibold">{order.totalAmount}</td>

//                     {/* Delivery Boy (Desktop only) */}
//                     <td className="d-none d-md-table-cell">
//                       {order.deliveryBoyName || "N/A"} <br />
//                       <small className="text-muted">{order.deliveryBoyPhone || "N/A"}</small>
//                     </td>

//                     {/* Delivered At (Desktop only) */}
//                     <td className="d-none d-md-table-cell">
//                       {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "-"}
//                     </td>

//                     {/* Status */}
//                     <td>
//                       <span
//                         className={`badge ${isCancelled ? "bg-danger" : "bg-success"}`}
//                       >
//                         {isCancelled ? "❌ Cancelled" : "✅ Delivered"}
//                       </span>
//                     </td>

//                     {/* Mobile View Button */}
//                     <td className="d-md-none">
//                       <Button size="sm" variant="primary" onClick={() => setSelectedOrder(order)}>
//                         View
//                       </Button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>

//           {/* Mobile Modal */}
//           {selectedOrder && (
//             <Modal show={true} onHide={() => setSelectedOrder(null)} size="lg" centered>
//               <Modal.Header closeButton>
//                 <Modal.Title>Order Details</Modal.Title>
//               </Modal.Header>
//               <Modal.Body>
//                 <p>
//                   <strong>User:</strong> {selectedOrder.userId?.name || "Unknown"} <br />
//                   <strong>Phone:</strong> {selectedOrder.userId?.phone || "N/A"}
//                 </p>

//                 <p>
//                   <strong>Products:</strong><br />
//                   {selectedOrder.products.map((p, i) => (
//                     <div key={i}>• {p.name} × {p.quantity}</div>
//                   ))}
//                 </p>

//                 <p>
//                   <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
//                 </p>

//                 <p>
//                   <strong>Delivery Boy Name:</strong> {selectedOrder.deliveryBoyName || "N/A"} <br />
//                   <strong>Delivery Boy Phone:</strong> {selectedOrder.deliveryBoyPhone || "N/A"}
//                 </p>

//                 <p>
//                   <strong>Delivered At:</strong> {selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : "-"}
//                 </p>

//                 <p>
//                   <strong>Status:</strong>{" "}
//                   <span className={`badge ${(selectedOrder.status || "").toLowerCase() === "cancelled" ? "bg-danger" : "bg-success"}`}>
//                     {(selectedOrder.status || "").toLowerCase() === "cancelled" ? "❌ Cancelled" : "✅ Delivered"}
//                   </span>
//                 </p>
//               </Modal.Body>
//               <Modal.Footer>
//                 <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
//                   Close
//                 </Button>
//               </Modal.Footer>
//             </Modal>
//           )}
//         </>
//       )}
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Table, Spinner, Modal, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminDeliveredPage() {
  const { token, role, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Detect screen resize (Mobile only popup)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/admin/login");
      return;
    }

    const fetchDeliveredOrders = async () => {
      try {
        const res = await axios.get(
          "https://groceryshop-d27s.onrender.com/api/admin/totaldelivered",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(res.data.deliveredOrders || []);
      } catch (err) {
        console.error(err);
        logout();
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveredOrders();
  }, [token, role, navigate, logout]);

if (loading)
  return (
    <div className="container py-5 text-center">

      <div className="mb-4">
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        ></div>
      </div>

      <h5 className="fw-semibold text-dark mb-2">
        Loading Delivered Orders
      </h5>

      <p className="text-muted mb-0">
        Please wait while we retrieve the latest records.
      </p>

    </div>
  );

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.deliveredAt ? new Date(a.deliveredAt) : new Date(0);
    const dateB = b.deliveredAt ? new Date(b.deliveredAt) : new Date(0);
    return dateB - dateA;
  });

  return (
    <div className="container-fluid py-4 px-md-5 bg-light min-vh-100">

      {/* Header */}
      <div
        className="mb-4 p-4 rounded-4 text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg,#141e30,#243b55)",
        }}
      >
        <h2 className="fw-bold mb-1">🚚 Delivered Orders</h2>
        <p className="mb-0 opacity-75">
          View all successfully delivered and cancelled orders
        </p>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="text-center p-4 shadow-sm rounded-4">
          <p className="text-muted mb-0">No delivered orders found.</p>
        </Card>
      ) : (
        <>
          <div className="table-responsive shadow rounded-4 bg-white">
            <Table hover responsive className="align-middle mb-0 text-center">
              <thead
                style={{
                  background: "linear-gradient(to right,#1f4037,#99f2c8)",
                  color: "#fff",
                }}
              >
                <tr>
                  <th className="d-none d-md-table-cell">#</th>
                  <th>User</th>
                  <th>Products</th>
                  <th className="d-none d-md-table-cell">Total (₹)</th>
                  <th className="d-none d-md-table-cell">Delivery Boy</th>
                  <th className="d-none d-md-table-cell">Delivered At</th>
                  <th>Status</th>
                  <th className="d-md-none">View</th>
                </tr>
              </thead>

              <tbody>
                {sortedOrders.map((order, index) => {
                  const isCancelled =
                    (order.status || "").toLowerCase() === "cancelled";

                  return (
                    <tr
                      key={order._id}
                      className={isCancelled ? "table-danger" : ""}
                    >
                      <td className="d-none d-md-table-cell fw-bold">
                        {index + 1}
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {order.userId?.name || "Unknown"}
                        </div>
                        <small className="text-muted d-none d-md-block">
                          {order.userId?.phone || "N/A"}
                        </small>
                      </td>

                      {/* Desktop Products center */}
                      <td>
                        <div className="d-flex flex-column align-items-center">
                          {order.products?.map((p, i) => (
                            <div key={i}>
                              • {p.name} × {p.quantity}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="d-none d-md-table-cell fw-semibold text-success">
                        ₹{order.totalAmount}
                      </td>

                      <td className="d-none d-md-table-cell">
                        {order.deliveryBoyName || "N/A"} <br />
                        <small className="text-muted">
                          {order.deliveryBoyPhone || "N/A"}
                        </small>
                      </td>

                      <td className="d-none d-md-table-cell small">
                        {order.deliveredAt
                          ? new Date(order.deliveredAt).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={`badge px-3 py-2 rounded-pill ${
                            isCancelled ? "bg-danger" : "bg-success"
                          }`}
                        >
                          {isCancelled ? "❌ Cancelled" : "✅ Delivered"}
                        </span>
                      </td>

                      {/* Mobile only View button */}
                      <td className="d-md-none">
                        <Button
                          size="sm"
                          className="rounded-pill px-3"
                          variant="primary"
                          onClick={() => {
                            if (isMobile) setSelectedOrder(order);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Mobile Only Modal */}
          {isMobile && selectedOrder && (
            <Modal
              show={true}
              onHide={() => setSelectedOrder(null)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Order Details</Modal.Title>
              </Modal.Header>

              <Modal.Body className="text-start">

                <p>
                  <strong>User:</strong>{" "}
                  {selectedOrder.userId?.name || "Unknown"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.userId?.phone || "N/A"}
                </p>

                <hr />

                <p className="mb-2">
                  <strong>Products:</strong>
                </p>

                <div className="mb-3">
                  {selectedOrder.products?.map((p, i) => (
                    <div key={i}>
                      • {p.name} × {p.quantity}
                    </div>
                  ))}
                </div>

                <hr />

                <p>
                  <strong>Total Amount:</strong> ₹
                  {selectedOrder.totalAmount}
                </p>

                <p>
                  <strong>Delivery Boy Name:</strong>{" "}
                  {selectedOrder.deliveryBoyName || "N/A"}
                </p>

                <p>
                  <strong>Delivery Boy Phone:</strong>{" "}
                  {selectedOrder.deliveryBoyPhone || "N/A"}
                </p>

                <p>
                  <strong>Delivered At:</strong>{" "}
                  {selectedOrder.deliveredAt
                    ? new Date(selectedOrder.deliveredAt).toLocaleString()
                    : "-"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge px-3 py-2 rounded-pill ${
                      (selectedOrder.status || "").toLowerCase() ===
                      "cancelled"
                        ? "bg-danger"
                        : "bg-success"
                    }`}
                  >
                    {(selectedOrder.status || "").toLowerCase() ===
                    "cancelled"
                      ? "❌ Cancelled"
                      : "✅ Delivered"}
                  </span>
                </p>

              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}