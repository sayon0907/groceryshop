import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OrdersPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const baseURL = "https://groceryshop-d27s.onrender.com/api";

  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    try {
      await axios.put(`${baseURL}/auth/cancel/${selectedOrderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === selectedOrderId ? { ...order, status: "Cancelled" } : order
        )
      );
      closeCancelModal();
    } catch (err) {
      alert("❌ Failed to cancel order.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchOrders = async () => {
      try {
        const [activeRes, deliveredRes] = await Promise.all([
          axios.get(`${baseURL}/order/my`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${baseURL}/order/my/delivered`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setOrders(activeRes.data.orders || []);
        setDeliveredOrders(deliveredRes.data.deliveredOrders || []);
      } catch (err) {
        if (err.response?.status === 401) navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading your orders...</p>
      </div>
    );

  const ProductItem = ({ product }) => {
    const imageUrl =
      product.productId?.images?.[0] || product.image || "/placeholder.png";
    const productName = product.productId?.name || product.name || "Product removed";

    return (
      <div className="d-flex align-items-center p-3 rounded-4 mb-3 bg-light border">
        <img
          src={imageUrl}
          alt={productName}
          className="rounded-3"
          style={{ width: "75px", height: "75px", objectFit: "cover" }}
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
        <div className="ms-3 flex-grow-1">
          <p className="fw-semibold mb-1">{productName}</p>
          <small className="text-muted">
            Qty: {product.quantity} • ₹{product.price}
          </small>
        </div>
      </div>
    );
  };

  const OrderCard = ({ order, isDelivered }) => {
    const status = order.status?.toLowerCase();

    const getStatusBadge = () => {
      if (status === "cancelled") return <span className="badge bg-danger px-3 py-2">❌ Cancelled</span>;
      if (isDelivered || status === "delivered") return <span className="badge bg-success px-3 py-2">✅ Delivered</span>;
      if (status === "shipped") return <span className="badge bg-info text-dark px-3 py-2">🚚 Shipped</span>;
      return <span className="badge bg-warning text-dark px-3 py-2">🕒 {order.status}</span>;
    };

    const canCancel = !isDelivered && !["shipped", "cancelled", "delivered"].includes(status);

    return (
      <div className="card border-0 shadow-sm mb-4 rounded-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <div>
              <small className="text-muted">Order ID: {order._id}</small>
              <div className="mt-2">{getStatusBadge()}</div>
            </div>
          </div>

          <hr />

          <div className="mb-3">
            <small className="text-muted">Delivery Address</small>
            <p className="fw-semibold mb-0">📍 {order.location?.address || "No address provided"}</p>
          </div>

          {order.products?.map((p, idx) => (
            <ProductItem key={idx} product={p} />
          ))}

          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
            <div>
              <small className="text-muted d-block">Total Amount</small>
              <h5 className="fw-bold text-primary mb-0">₹{order.totalAmount}</h5>
            </div>

            {canCancel && (
              <button
                className="btn rounded-pill px-4 text-white"
                style={{ backgroundColor: "#dc3545", border: "none" }}
                onClick={() => openCancelModal(order._id)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <div className="p-4 mb-4 rounded-4 text-white" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
        <h3 className="mb-1">📦 My Orders</h3>
        <p className="mb-0 opacity-75">Track and manage your orders</p>
      </div>

      <h5 className="mb-3">🟡 Current Orders</h5>
      {orders.length === 0 ? <div className="text-center text-muted py-4">No active orders.</div> :
        orders.map((order) => <OrderCard key={order._id} order={order} />)}

      <h5 className="mt-5 mb-3">🟢 Delivered Orders</h5>
      {deliveredOrders.length === 0 ? <div className="text-center text-muted py-4">No delivered orders yet.</div> :
        deliveredOrders.map((order) => <OrderCard key={order._id} order={order} isDelivered />)}

      {showCancelModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Order</h5>
                <button type="button" className="btn-close" onClick={closeCancelModal}></button>
              </div>
              <div className="modal-body">Are you sure you want to cancel this order?</div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeCancelModal}>No</button>
                <button className="btn btn-danger" onClick={handleCancelOrder}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}