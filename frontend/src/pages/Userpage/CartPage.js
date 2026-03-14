import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash } from "react-icons/fa";
export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= LOAD ADDRESS ================= */
  useEffect(() => {
    const savedAddress = localStorage.getItem("userAddress");
    if (savedAddress) setAddress(savedAddress);
  }, []);

  /* ================= LOAD LOCATION ================= */
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");

    if (savedLocation) {
      const parsed = JSON.parse(savedLocation);
      if (parsed.lat && parsed.lng) {
        setUserLocation(parsed);
        setLoading(false);
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
        };
        localStorage.setItem("userLocation", JSON.stringify(location));
        setUserLocation(location);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  /* ================= FETCH CART ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (userLocation.lat && userLocation.lng) {
      fetchCart();
    }
  }, [userLocation]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://groceryshop-d27s.onrender.com/api/cart", {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data?.products || []);
    } catch (err) {
      console.error("Cart load error:", err);
      alert("❌ Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHANGE QUANTITY ================= */
  const handleQuantityChange = async (productId, newQty) => {
    const product = cart.find((item) => item.productId?._id === productId)?.productId;
    if (!product || newQty < 1 || newQty > product.quantity) return;

    setCart((prev) =>
      prev.map((item) =>
        item.productId?._id === productId ? { ...item, quantity: newQty } : item
      )
    );

    try {
      await axios.post(
        "https://groceryshop-d27s.onrender.com/api/cart/set-quantity",
        { productId, quantity: newQty, lat: userLocation.lat, lng: userLocation.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      fetchCart(); // rollback if API fails
    }
  };

  /* ================= REMOVE PRODUCT ================= */
  const handleRemove = async (productId) => {
    const oldCart = [...cart];
    setCart((prev) => prev.filter((item) => item.productId?._id !== productId));

    try {
      await axios.post(
        "https://groceryshop-d27s.onrender.com/api/cart/remove",
        { productId, lat: userLocation.lat, lng: userLocation.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      setCart(oldCart); // rollback
    }
  };

  /* ================= TOTAL ================= */
  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.productId?.actualPrice || 0) * item.quantity,
    0
  );

  /* ================= CHECKOUT ================= */
  const confirmCheckout = async () => {
    if (!address) return alert("Please select delivery address.");
    if (cart.length === 0) return alert("Cart is empty.");

    try {
      setPlacingOrder(true);
      const adminphone = cart[0]?.productId?.adminphone || "";

      const orderData = {
        products: cart.map((item) => ({
          productId: item.productId?._id,
          name: item.productId?.name,
          price: item.productId?.actualPrice,
          quantity: item.quantity,
          image: item.productId?.images?.[0] || "",
        })),
        adminphone,
        totalAmount,
        lat: userLocation.lat,
        lng: userLocation.lng,
        address,
        date: new Date(),
      };

      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/order/create",
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        await axios.post(
          "https://groceryshop-d27s.onrender.com/api/cart/clear",
          { lat: userLocation.lat, lng: userLocation.lng },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCart([]);
        setShowModal(false);
        alert("✅ Order placed successfully!");
      } else {
        alert("❌ Failed to place order.");
      }
    } catch (err) {
      console.error("Order error:", err.response?.data);
      alert("❌ Order failed.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const resolveImageUrl = (path) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `https://groceryshop-d27s.onrender.com/${path}`;
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid bg-light py-4">
      <div className="container">
        <h3 className="fw-bold mb-4">My Cart ({cart.length})</h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : cart.length === 0 ? (
          <div className="card p-5 text-center shadow-sm">
            <h5>Your cart is empty</h5>
          </div>
        ) : (
          <div className="row">
            {/* LEFT */}
            <div className="col-lg-8">
              {cart.map((item) => {
                const product = item.productId;
                if (!product) return null;
                const inStock = product.quantity > 0;

                return (
                  <div
                    key={product._id}
                    className="card mb-3 p-3 shadow-sm border-0"
                    style={{ borderRadius: "10px" }}
                  >
                    <div className="row align-items-center">
                      <div className="col-md-3 col-4 text-center">
                        <img
                          src={resolveImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="img-fluid"
                          style={{ height: "140px", objectFit: "contain" }}
                        />
                      </div>

                      <div className="col-md-9 col-8">
                        <h5 className="fw-bold mb-1">
                          {product.name}
                          <span
                            className={`badge ms-2 ${
                              inStock ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </h5>

                        <div className="mb-3">
                          {product.mainPrice && (
                            <span className="text-muted text-decoration-line-through me-2">
                              ₹{product.mainPrice}
                            </span>
                          )}
                          <span className="fs-4 fw-bold text-dark">
                            ₹{product.actualPrice}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center border rounded"
                            style={{ height: "40px" }}
                          >
                            <button
                              className="btn btn-light px-3"
                              disabled={!inStock}
                              onClick={() =>
                                handleQuantityChange(product._id, item.quantity - 1)
                              }
                            >
                              −
                            </button>
                            <span className="px-3 fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-light px-3"
                              disabled={!inStock || item.quantity >= product.quantity}
                              onClick={() =>
                                handleQuantityChange(product._id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>

                         <button
  className="btn btn-outline-danger d-none d-md-inline-block"
  onClick={() => handleRemove(product._id)}
>
  Remove
</button>

<button
  className="btn btn-link text-danger d-md-none p-0"
  onClick={() => handleRemove(product._id)}
>
  <FaTrash size={28} />
</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT */}
            <div className="col-lg-4 mt-4 mt-lg-0">
              <div
                className="card p-4 shadow-sm border-0"
                style={{ position: "sticky", top: "20px", borderRadius: "10px" }}
              >
                <h5 className="fw-bold mb-3">PRICE DETAILS</h5>

                <div className="d-flex justify-content-between mb-2">
                  <span>Price ({cart.length} items)</span>
                  <span>₹{totalAmount}</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold fs-4">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>

                <button
                  className="btn btn-warning w-100 mt-4 fw-bold"
                  style={{ height: "48px", borderRadius: "8px" }}
                  onClick={() => setShowModal(true)}
                >
                  PLACE ORDER
                </button>

                <div className="mt-3 small text-muted">
                  <strong>Deliver to:</strong> {address || "No address selected"}
                  {userLocation.lat && userLocation.lng && (
                    <div>
                      <strong>Latitude:</strong> {userLocation.lat} |
                      <strong> Longitude:</strong> {userLocation.lng}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Order</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Total:</strong> ₹{totalAmount}
                  </p>
                  <p>
                    <strong>Address:</strong> {address}
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={confirmCheckout}
                    disabled={placingOrder}
                  >
                    {placingOrder ? "Processing..." : "Yes, Place Order"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}