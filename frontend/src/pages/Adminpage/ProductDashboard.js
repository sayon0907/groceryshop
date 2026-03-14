import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import "./ProductDashboard.css";

export default function ProductDashboard() {
  const { token, role, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    mainPrice: "",
    actualPrice: "",
    rating: "",
    category: "",
    quantity: "", // ✅ added
    images: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || role !== "admin") {
      logout();
      return;
    }
    fetchProducts();
  }, [token, role]);

  const handleLogout = () => {
    toast.info("Session expired. Logging out...");
    logout();
  };

  const handleAuthError = (err) => {
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      handleLogout();
    } else {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://groceryshop-d27s.onrender.com/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      handleAuthError(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      mainPrice: "",
      actualPrice: "",
      rating: "",
      category: "",
      quantity: "", // ✅ reset added
      images: [],
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`https://groceryshop-d27s.onrender.com/api/admin/products/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product updated successfully");
      } else {
        await axios.post("https://groceryshop-d27s.onrender.com/api/admin/products", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added successfully");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      handleAuthError(err);
      toast.error("Operation failed");
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      mainPrice: product.mainPrice,
      actualPrice: product.actualPrice,
      rating: product.rating,
      category: product.category,
      quantity: product.quantity || "", // ✅ added
      images: product.images,
    });
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      await axios.delete(`https://groceryshop-d27s.onrender.com/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      handleAuthError(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="dashboard-container">
      <ToastContainer />
      <div className="dashboard-header">
        <h1>Product Dashboard</h1>
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="form-card">
        <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInput}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleInput}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              placeholder="Enter product description"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Main Price (₹)</label>
              <input
                type="number"
                name="mainPrice"
                value={form.mainPrice}
                onChange={handleInput}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Actual Price (₹)</label>
              <input
                type="number"
                name="actualPrice"
                value={form.actualPrice}
                onChange={handleInput}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Rating (1-5)</label>
              <input
                type="number"
                name="rating"
                value={form.rating}
                onChange={handleInput}
                placeholder="4.5"
              />
            </div>
            <div className="form-group">
              <label>Quantity</label> {/* ✅ Added field */}
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleInput}
                placeholder="Enter stock quantity"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <input type="file" multiple onChange={handleImageUpload} />
            <div className="preview-row">
              {form.images.map((img, i) => (
                <img key={i} src={img} alt="preview" className="preview-img" />
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel
            </button>
          )}
        </form>
      </div>

      <h2 className="product-list-title">Products</h2>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p._id} className="product-card new-design">
              <div className="product-image">
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} />
                ) : (
                  <div className="image-placeholder">
                    <i className="fa fa-camera" aria-hidden="true"></i>
                  </div>
                )}
              </div>

              <div className="product-info">
                <h3>{p.name}</h3>
                <p className="description">{p.description}</p>

                <div className="price-section">
                  <span className="actual-price">₹{p.actualPrice}</span>
                  <span className="old-price">₹{p.mainPrice}</span>
                </div>

                <div className="rating">
                  <i className="fa fa-star" style={{ color: "#fbbf24" }}></i>
                  <span>{p.rating}</span>
                </div>

                <div className="category-badge">{p.category}</div>

                {/* ✅ Quantity display */}
                <div className="quantity-info">
                  <strong>In Stock:</strong> {p.quantity ?? 0}
                </div>

                <div className="action-buttons">
                  <button onClick={() => handleEdit(p)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
