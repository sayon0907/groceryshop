import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaBoxOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductInformation = () => {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- Protect Route ---------------- */
  useEffect(() => {
    if (!token || role !== "superadmin") {
      logout();
      navigate("/superadmin/login");
      return;
    }
    fetchProducts();
  }, [token, role]);

  /* ---------------- Fetch Products ---------------- */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/superadmin/products",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch Products Error:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/superadmin/login");
      } else {
        setError("Failed to load products.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  /* ---------------- Delete Product ---------------- */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(
        `https://groceryshop-d27s.onrender.com/api/superadmin/products/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete Product Error:", err);

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
          Loading Products...
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
            <div className="p-3 bg-white text-primary rounded-circle shadow">
              <FaBoxOpen size={22} />
            </div>
            <div>
              <h4 className="fw-bold mb-0">Product Management</h4>
              <small className="opacity-75">
                SuperAdmin Product Information
              </small>
            </div>
          </div>

          <span className="badge bg-light text-dark fs-6 px-4 py-2 shadow-sm">
            Total Products: {products.length}
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
        <div className="card-body p-0">
          <div className="table-responsive">

            <table className="table align-middle mb-0 table-hover">
              <thead style={{ background: "#111827", color: "#fff" }}>
                <tr className="text-center">
                  <th className="d-none d-md-table-cell">#</th>
                  <th>Name</th>
                  <th className="d-none d-md-table-cell">Admin</th>
                  <th className="d-none d-md-table-cell">Phone</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <FaBoxOpen size={40} className="mb-3 opacity-50" />
                      <h5>No products found</h5>
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product._id} className="text-center">

                      <td className="d-none d-md-table-cell fw-semibold">
                        {index + 1}
                      </td>

                      <td className="fw-semibold text-dark">
                        {product.name}
                      </td>

                      <td className="d-none d-md-table-cell text-muted">
                        {product.adminname}
                      </td>

                      <td className="d-none d-md-table-cell text-muted">
                        {product.adminphone}
                      </td>

                      <td className="fw-bold text-success">
                        ₹{product.actualPrice}
                      </td>

                      <td>
                        {product.quantity > 0 ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
                            In Stock
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary rounded-circle shadow-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#productModal"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <FaEye />
                        </button>
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-danger rounded-circle shadow-sm"
                          style={{ width: "35px", height: "35px" }}
                          onClick={() => deleteProduct(product._id)}
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
      </div>

      {/* MODAL */}
      <div className="modal fade" id="productModal" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-fullscreen-sm-down">
          <div className="modal-content rounded-4 border-0 shadow-lg">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title fw-bold">Product Details</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedProduct && (
                <div className="container-fluid">
                  <div className="row g-4">

                    <div className="col-md-5 text-center">
                      <img
                        src={selectedProduct.images?.[0]}
                        alt="product"
                        className="img-fluid rounded-4 shadow"
                        style={{ maxHeight: "350px", objectFit: "cover" }}
                      />
                    </div>

                    <div className="col-md-7">

                      <h5 className="fw-bold mb-3">
                        {selectedProduct.name}
                      </h5>

                      <p className="text-muted">
                        {selectedProduct.description}
                      </p>

                      <hr />

                      <p><strong>Main Price:</strong> ₹{selectedProduct.mainPrice}</p>
                      <p><strong>Actual Price:</strong> ₹{selectedProduct.actualPrice}</p>
                      <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {selectedProduct.location
                          ? `Lat: ${selectedProduct.location.lat}, Lng: ${selectedProduct.location.lng}`
                          : "Not Available"}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {selectedProduct.quantity > 0 ? (
                          <span className="badge bg-success">In Stock</span>
                        ) : (
                          <span className="badge bg-danger">Out of Stock</span>
                        )}
                      </p>

                      <hr />

                      <p><strong>Admin:</strong> {selectedProduct.adminname}</p>
                      <p><strong>Phone:</strong> {selectedProduct.adminphone}</p>
                      <p><strong>Rating:</strong> {selectedProduct.rating}</p>
                      <p><strong>Category:</strong> {selectedProduct.category}</p>

                      <p>
                        <strong>Created At:</strong>{" "}
                        {selectedProduct.createdAt
                          ? new Date(selectedProduct.createdAt).toLocaleString()
                          : "N/A"}
                      </p>

                    </div>

                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">
                Close
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductInformation;
