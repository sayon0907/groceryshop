  import { useAuth } from "../../context/AuthContext";
  import logo from "../../assets/FRAMZONE Logo Design.png";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import L from "leaflet";

// ======================
// Setup Leaflet icons
// ======================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ======================
// MapUpdater component
// ======================
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.setView([position.lat, position.lng], 13);
    }
  }, [position, map]);
  return null;
};

// ======================
// LocationPicker component
// ======================
const LocationPicker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

// ======================
// Constant for distance calculation
// ======================
const EARTH_RADIUS_KM = 6371;

export default function UserFrontPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState({
    lat: null,
    lng: null,
    pin: "",
    address: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [category, setCategory] = useState("all");
  const [creatorId, setCreatorId] = useState("all");
  const [trackId, setTrackId] = useState("");
  const [cart, setCart] = useState([]);
  const cartRef = useRef([]);
  const lastLocationRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [showMobileTrackDropdown, setShowMobileTrackDropdown] = useState(false);

  const [trackedOrder, setTrackedOrder] = useState(null);

  const navigate = useNavigate();
const { token, role, logout } = useAuth();
  // ======================
  // Verify login + fetch user info
  // ======================
useEffect(() => {
  const fetchUser = async () => {
    if (!token) {
      setLoggedIn(false);
      return;
    }

    try {
      const res = await axios.get(
        "https://groceryshop-d27s.onrender.com/api/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = res.data.user;

      if (!user || role !== "user") {
        logout();
        setLoggedIn(false);
        navigate("/login", { replace: true });
        return;
      }

      setLoggedIn(true);

      if (user.location) {
        setUserLocation(user.location);
      }

    } catch (err) {
      console.error("Auth error:", err);
      logout();
      setLoggedIn(false);
      navigate("/login", { replace: true });
    }
  };

  fetchUser();
}, [token, role, navigate, logout]);
  // ======================
  // Sync login status between tabs
  // ======================
useEffect(() => {
  const handleStorageChange = () => {
    const newToken = localStorage.getItem("token");
    setLoggedIn(!!newToken);
  };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (userLocation.address) {
      localStorage.setItem("userAddress", userLocation.address);
      if (loggedIn) saveUserLocation(userLocation);
    }
  }, [userLocation.address, loggedIn]);

  // ======================
  // Fetch user cart
  // ======================
  useEffect(() => {
    let ignore = false;
    const fetchCart = async () => {
      try {
        if (!userLocation.lat || !userLocation.lng) return;
        const res = await axios.get("https://groceryshop-d27s.onrender.com/api/cart", {
          params: { lat: userLocation.lat, lng: userLocation.lng },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ignore) setCart(res.data?.products || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    if (token && userLocation.lat && userLocation.lng) fetchCart();
    return () => {
      ignore = true;
    };
  }, [token, userLocation.lat, userLocation.lng]);

  // ======================
  // Fetch all products
  // ======================
  useEffect(() => {
    axios
      .get("https://groceryshop-d27s.onrender.com/api/products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
        setVisibleProducts(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // ======================
  // Category + Creator filters
  // ======================
  const categories = ["all", ...new Set(visibleProducts.map((p) => p.category))];
  const creators = ["all", ...new Set(visibleProducts.map((p) => p.adminname || "Admin"))];

  const handleCategory = (cat) => {
    setCategory(cat);
    filterProducts(cat, creatorId);
  };

  const handleCreator = (creator) => {
    setCreatorId(creator);
    filterProducts(category, creator);
  };

  const filterProducts = (cat, creator) => {
    let temp = visibleProducts;
    if (cat !== "all") temp = temp.filter((p) => p.category?.toLowerCase() === cat.toLowerCase());
    if (creator !== "all") temp = temp.filter((p) => (p.adminname || "Admin") === creator);
    setFiltered(temp);
  };

  // ======================
  // Distance calculator
  // ======================
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ======================
  // Filter by user location
  // ======================
  const filterByLocation = (loc) => {
    if (!loc.lat || !loc.lng) return;
    const nearby = products.filter((p) => {
      if (p.location?.lat && p.location?.lng)
        return getDistance(loc.lat, loc.lng, p.location.lat, p.location.lng) <= 10;
      return false;
    });
    setFiltered(nearby);
    setVisibleProducts(nearby);
    setCategory("all");
    setCreatorId("all");
    validateCartDistance(loc);
  };

  // ======================
  // Validate cart distance
  // ======================
  const validateCartDistance = (loc) => {
    if (cart.length === 0) return;
    const productLoc = cart[0]?.productId?.location || cart[0]?.location;
    if (!productLoc) return;

    const distance = getDistance(loc.lat, loc.lng, productLoc.lat, productLoc.lng);
    if (distance > 10) {
      cartRef.current = cart;
      setCart([]);
      alert("❌ You are more than 10km away from product location. Cart is emptied!");
    } else if (!cart.length && cartRef.current.length && distance <= 10) {
      setCart(cartRef.current);
      cartRef.current = [];
    }
    lastLocationRef.current = loc;
  };

  // ======================
  // Add to cart via API
  // ======================
  const handleAddCart = async (product) => {
    try {
      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (!userLocation?.lat || !userLocation?.lng) {
        alert("Please select your location first");
        return;
      }

      const existingItem = cart.find(
        (item) => item.productId._id === product._id
      );

      if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
          alert(`⚠ Only ${product.quantity} available in stock.`);
          return;
        }

        const res = await axios.post(
          "https://groceryshop-d27s.onrender.com/api/cart/set-quantity",
          {
            productId: product._id,
            quantity: existingItem.quantity + 1,
            lat: userLocation.lat,
            lng: userLocation.lng,
            address: userLocation.address,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert(`${product.name} increase to the cart.`);
        setCart(res.data.products || []);
        return;
      }

      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/cart/add",
        {
          productId: product._id,
          lat: userLocation.lat,
          lng: userLocation.lng,
          address: userLocation.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCart(res.data.products || []);
      alert(`${product.name} added to the cart.`);

    } catch (err) {
      console.error("❌ Add to Cart failed:", err.response?.data || err);
      alert(err.response?.data?.error || "Server error while adding to cart");
    }
  };

  // ======================
  // Track product by ID
  // ======================
  const handleTrack = async () => {
    try {
      if (!trackId.trim()) return alert("Please enter a valid Order ID");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const res = await axios.get(`https://groceryshop-d27s.onrender.com/api/order/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // backend may return different shapes; handle common cases
      if (res.data?.success && res.data?.order) {
        setTrackedOrder(res.data.order);
        setTrackId("");
        setShowMobileTrackDropdown(false);
      } else if (res.data?.order) {
        setTrackedOrder(res.data.order);
        setTrackId("");
        setShowMobileTrackDropdown(false);
      } else if (res.data?.success && res.data?.data) {
        setTrackedOrder(res.data.data);
        setTrackId("");
        setShowMobileTrackDropdown(false);
      } else {
        alert("❌ Order not found");
        setTrackedOrder(null);
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      const message = err.response?.data?.message || err.response?.data?.error || "Server error while tracking order";
      alert(message);
      setTrackedOrder(null);
    }
  };

  // ======================
  // Get current location
  // ======================
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return alert("⚠ Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
      },
      () => alert("❌ Unable to get location")
    );
  };

  // ======================
  // Save user location to backend
  // ======================
  const saveUserLocation = async (loc) => {
    if (!token) return;
    try {
      await axios.put(
        "https://groceryshop-d27s.onrender.com/api/auth/me/location",
        { location: loc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error saving location:", err);
    }
  };

  // ======================
  // React to location change
  // ======================
  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      if (loggedIn) saveUserLocation(userLocation);
      localStorage.setItem("userLocation", JSON.stringify(userLocation));
      filterByLocation(userLocation);
    }
  }, [userLocation.lat, userLocation.lng]);

  // ======================
  // Pin code lookup
  // ======================
  useEffect(() => {
    if (!userLocation.pin || userLocation.pin.length < 3) return;
    const fetchFromPin = async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?postalcode=${userLocation.pin}&country=India&format=json`
        );
        if (res.data.length > 0) {
          const loc = {
            lat: parseFloat(res.data[0].lat),
            lng: parseFloat(res.data[0].lon),
            pin: userLocation.pin,
            address: userLocation.address || "",
          };
          setUserLocation(loc);
        }
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    };
    fetchFromPin();
  }, [userLocation.pin]);

  // ======================
  // Logout handler
  // ======================
const handleLogout = () => {
  logout(); // remove token from context/localStorage
  setLoggedIn(false);
};
  // ======================
  // Search handler
  // ======================
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFiltered(visibleProducts);
      return;
    }

    const lower = term.toLowerCase();
    const results = visibleProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower)
    );
    setFiltered(results);
  };

  // Get first 5 products for promotional row
  const promoProducts = visibleProducts.slice(0, 5);

  // ======================
  // Render section
  // ======================
  return (
    <>
      {/* TOP ANNOUNCEMENT (small) — keep only this green background */}
      <div className="bg-success text-white py-2 text-center" style={{ fontSize: "0.82rem" }}>
        🚚 Delivery within 10km • Fresh from local farmers
      </div>

      {/* HEADER — make header white so only the announcement is green */}
<header className="bg-white text-dark border-bottom">
  <div className="container-fluid px-3 py-2">

    {/* ================= DESKTOP HEADER ================= */}
    <div className="d-none d-md-flex align-items-center gap-3 header-row">

      {/* LOGO */}
      <div className="d-flex align-items-center">
        <img src={logo} alt="logo" style={{ width: "160px" }} />
      </div>

      {/* LOCATION + SEARCH */}
      <div className="d-flex align-items-center gap-2 flex-grow-1">
        <button
          className="btn-location d-flex align-items-center gap-1"
          onClick={() => setShowMap(true)}
          title={userLocation.address}
        >
          📍
          <span className="location-label">
            {userLocation.address
              ? userLocation.address.split(",")[0]
              : "Location"}
          </span>
        </button>

        <div className="flex-grow-1 position-relative">
          <input
            type="text"
            placeholder="Search Product"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control rounded-pill"
            style={{ paddingRight: "45px" }}
          />
          <button
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y border-0 text-dark"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="d-flex gap-2 align-items-center">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/admin")}
          style={{ fontWeight: 600 }}
        >
          Seller
        </button>

   {token && role === "user" ? (
  <button className="btn-cta-logout" onClick={handleLogout}>
    Logout
  </button>
) : (
  <button
    className="btn-cta-login"
    onClick={() => navigate("/login")}
  >
    Login
  </button>
)}

        <button
          className="btn-cart position-relative"
          onClick={() => navigate("/cart")}
          aria-label="Cart"
        >
          <span style={{ fontSize: "1.15rem" }}>🛒</span>
          {cart.length > 0 && (
            <span className="cart-badge">{cart.length}</span>
          )}
        </button>
      </div>
    </div>

    {/* ================= MOBILE HEADER ================= */}
    <div className="d-md-none">

      {/* TOP ROW */}
      <div className="d-flex align-items-center justify-content-between">
        <img src={logo} alt="logo" style={{ width: "120px" }} />

        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin")}
            style={{ fontWeight: 600 }}
          >
            Seller
          </button>

      {token && role === "user" ? (
  <button className="btn-cta-logout" onClick={handleLogout}>
    Logout
  </button>
) : (
  <button
    className="btn-cta-login"
    onClick={() => navigate("/login")}
  >
    Login
  </button>
)}

          <button
            className="btn-cart position-relative"
            onClick={() => navigate("/cart")}
            style={{ borderRadius: "12px" }}
          >
            <span style={{ fontSize: "1.15rem" }}>🛒</span>
            {cart.length > 0 && (
              <span className="cart-badge">{cart.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* LOCATION + SEARCH */}
      <div className="d-flex gap-2 align-items-center mt-2">
        <button
          className="btn-location d-flex align-items-center gap-1"
          onClick={() => setShowMap(true)}
          title={userLocation.address}
          style={{
            padding: "6px 10px",
            borderRadius: "20px",
            maxWidth: "140px",
            fontSize: "0.85rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          📍
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {userLocation.address
              ? userLocation.address.split(",")[0]
              : "Location"}
          </span>
        </button>

        <div className="flex-grow-1 position-relative">
          <input
            type="text"
            placeholder="Search Product"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="form-control rounded-pill"
            style={{ paddingRight: "45px" }}
          />
          <button
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y border-0 text-dark"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* ================= NAV MENU ================= */}
  <nav className="bg-white py-2 border-top">
    <div className="container-fluid px-3">
      <div className="d-flex gap-3 overflow-auto desktop-nav">
        <Link to="/" className="nav-link text-dark text-nowrap">
          Home
        </Link>
       <a href="#shop" className="nav-link text-dark text-nowrap">
  Shop
</a>

        <Link to="/order" className="nav-link text-dark text-nowrap">
          Order
        </Link>
        <Link to="/help" className="nav-link text-dark text-nowrap">
          Order Help
        </Link>
        <Link to="/contact" className="nav-link text-dark text-nowrap">
          Contact
        </Link>
      </div>
    </div>
  </nav>
</header>


      {/* MAIN */}
      <main className="bg-light" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="container-fluid px-3 py-3">
          <div className="row g-3">
            {/* LEFT (filters stack on mobile) - hidden on mobile */}
            <div className="d-none d-lg-block col-lg-3">
              <div className="bg-white rounded-3 p-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">🔍 Track Order</h6>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Enter Order ID"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    className="form-control form-control-sm mb-2 rounded-2"
                  />
                  <button className="btn btn-dark btn-sm w-100 fw-600" onClick={handleTrack}>🔍 TRACK</button>
                </div>

                <hr />

                {/* Categories Dropdown */}
                <div className="mb-3">
                  <div className="position-relative">
                    <button
                      className="btn btn-success rounded-pill w-100 fw-bold mb-2"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                      ✓ {category === "all" ? "ALL CATEGORIES" : category.toUpperCase()} ▾
                    </button>
                    {showCategoryDropdown && (
                      <div className="dropdown-menu-custom w-100" style={{ zIndex: 1050 }}>
                        {categories.map((c) => (
                          <button
                            key={c}
                            className="dropdown-item-custom"
                            onClick={() => {
                              handleCategory(c);
                              setShowCategoryDropdown(false);
                            }}
                            style={{
                              backgroundColor: category === c ? "#198754" : "transparent",
                              color: category === c ? "white" : "inherit",
                              borderColor: category === c ? "#198754" : "#dee2e6",
                            }}
                          >
                            {c === "all" ? "All Categories" : c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <hr />

                {/* Seller Dropdown */}
                <div>
                  <div className="position-relative">
                    <button
                      className="btn btn-info rounded-pill w-100 fw-bold"
                      onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                    >
                      👤 {creatorId === "all" ? "ALL SELLERS" : creatorId} ▾
                    </button>
                    {showSellerDropdown && (
                      <div className="dropdown-menu-custom w-100" style={{ zIndex: 1050 }}>
                        {creators.map((cr) => (
                          <button
                            key={cr}
                            className="dropdown-item-custom"
                            onClick={() => {
                              handleCreator(cr);
                              setShowSellerDropdown(false);
                            }}
                            style={{
                              backgroundColor: creatorId === cr ? "#0d6efd" : "transparent",
                              color: creatorId === cr ? "white" : "inherit",
                              borderColor: creatorId === cr ? "#0d6efd" : "#dee2e6",
                            }}
                          >
                            {cr === "all" ? "All Sellers" : cr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER */}
            <div className="col-12 col-lg-9">
              {/* Mobile: Track order input - REDUCED HEIGHT */}
              <div className="mb-2 d-lg-none">
                <div className="bg-white rounded-3 p-1 shadow-sm">
                  <div className="d-flex gap-1">
                    <input
                      type="text"
                      placeholder="Order ID"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      className="form-control form-control-sm rounded-2"
                      style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                    />
                    <button className="btn btn-dark btn-sm" onClick={handleTrack} style={{ padding: "4px 8px", fontSize: "0.8rem" }}>🔍</button>
                  </div>
                </div>
              </div>

              <div className="position-relative rounded-3 overflow-hidden mb-3 shadow-sm" style={{ height: "220px" }}>
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop"
                  alt="Fresh Farm Products"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
                  <div className="container px-3">
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <span className="badge bg-white text-success mb-2 fw-bold">🌾 EXCLUSIVE OFFER</span>
                        <h3 className="text-white fw-bold">Fresh Farm Products</h3>
                        <p className="text-white small">Get the freshest organic products directly from local farmers. Fast delivery within 10km radius.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropdowns for Mobile */}
              <div className="mb-3 d-flex gap-2 d-lg-none position-relative">
                <div className="position-relative flex-grow-1">
                  <button
                    className="btn btn-brown rounded-pill text-white w-100"
                    style={{ backgroundColor: "#8B5E3C", padding: "6px 10px", fontSize: "0.9rem" }}
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    Categories ▾
                  </button>
                  {showCategoryDropdown && (
                    <div className="dropdown-menu-custom w-100" style={{ zIndex: 1050 }}>
                      {categories.map((c) => (
                        <button
                          key={c}
                          className="dropdown-item-custom"
                          onClick={() => {
                            handleCategory(c);
                            setShowCategoryDropdown(false);
                          }}
                          style={{
                            backgroundColor: category === c ? "#198754" : "transparent",
                            color: category === c ? "white" : "inherit",
                            borderColor: category === c ? "#198754" : "#dee2e6",
                          }}
                        >
                          {c === "all" ? "All Categories" : c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="position-relative flex-grow-1">
                  <button
                    className="btn btn-brown rounded-pill text-white w-100"
                    style={{ backgroundColor: "#8B5E3C", padding: "6px 10px", fontSize: "0.9rem" }}
                    onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                  >
                    Seller ▾
                  </button>
                  {showSellerDropdown && (
                    <div className="dropdown-menu-custom w-100" style={{ zIndex: 1050 }}>
                      {creators.map((cr) => (
                        <button
                          key={cr}
                          className="dropdown-item-custom"
                          onClick={() => {
                            handleCreator(cr);
                            setShowSellerDropdown(false);
                          }}
                          style={{
                            backgroundColor: creatorId === cr ? "#0d6efd" : "transparent",
                            color: creatorId === cr ? "white" : "inherit",
                            borderColor: creatorId === cr ? "#0d6efd" : "#dee2e6",
                          }}
                        >
                          {cr === "all" ? "All Sellers" : cr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Products grid: 2 per mobile, 3 per tablet, 4 per desktop */}
              {filtered.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted fs-5">No products found matching your filters</p>
                </div>
              ) : (
<>
  <h5 className="fw-bold text-dark mb-3">ALL PRODUCTS</h5>

  <div className="row g-3" id="shop">
    {filtered.map((p) => (
      <div className="col-6 col-md-4 col-lg-3" key={p._id}>
        <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">

          {/* IMAGE */}
          <div
            className="position-relative bg-light"
            style={{ height: "120px", overflow: "hidden", cursor: "pointer" }}
            onClick={() => {
              setSelectedProduct(p);
              setShowProductModal(true);
            }}
          >
            {p.images?.[0] ? (
              <img
                src={p.images[0]}
                alt={p.name}
                className="product-thumb"
                style={{ transition: "transform 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                <span className="text-muted">No Image</span>
              </div>
            )}

            <span className="position-absolute top-2 start-2 badge bg-success fw-bold">
              IN STOCK
            </span>
          </div>

          {/* BODY */}
          <div className="card-body p-2">

            {/* PRODUCT NAME */}
            <h6
              className="card-title fw-bold text-dark mb-1"
              style={{ fontSize: "0.85rem", minHeight: "2.2rem" }}
            >
              {p.name}
            </h6>

            {/* CATEGORY & ADMIN */}
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="badge bg-light text-dark" style={{ fontSize: "0.7rem" }}>
                {p.category || "Category"}
              </span>

              <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                by <strong>{p.adminname || "Admin"}</strong>
              </span>
            </div>

            {/* PRICE + REVIEW ROW */}
            <div className="mb-2">

              {/* MOBILE VIEW */}
              <div className="d-flex justify-content-between align-items-center d-lg-none">
                <small className="text-muted text-decoration-line-through">
                  ₹{p.mainPrice}
                </small>

                <h6 className="fw-bold text-success mb-0" style={{ fontSize: "0.95rem" }}>
                  ₹{p.actualPrice}
                </h6>
              </div>

              {/* DESKTOP VIEW */}
              <div className="d-none d-lg-flex align-items-center">
                {/* LEFT: MAIN PRICE */}
                <small className="text-muted text-decoration-line-through">
                  ₹{p.mainPrice}
                </small>

                {/* CENTER: ACTUAL PRICE */}
                <h6
                  className="fw-bold text-success mb-0 mx-auto"
                  style={{ fontSize: "1rem" }}
                >
                  ₹{p.actualPrice}
                </h6>

                {/* RIGHT: REVIEW */}
                <div className="d-flex align-items-center text-warning" style={{ fontSize: "0.75rem" }}>
                  ⭐ {p.rating || "4.5"}
                </div>
              </div>

            </div>

            {/* ADD TO CART */}
            <button
              className="btn btn-success btn-sm w-100 fw-bold"
              onClick={() => handleAddCart(p)}
              style={{
                borderRadius: "22px",
                padding: "6px 10px",
                fontSize: "0.85rem",
              }}
            >
              Add to Cart
            </button>

          </div>
        </div>
      </div>
    ))}
  </div>
</>


              )}
            </div>
          </div>
        </div>
      </main>

      {/* DETAILED PRODUCT MODAL */}
      {selectedProduct && showProductModal && (
        <>
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
            <div className="modal-dialog modal-dialog-centered modal-xl" style={{ maxWidth: "900px" }}>
              <div className="modal-content border-0 rounded-3">
                <button
                  type="button"
                  className="btn-close position-absolute"
                  onClick={() => setShowProductModal(false)}
                  style={{ top: "20px", right: "20px", zIndex: "10", fontSize: "1.5rem" }}
                ></button>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    <div className="col-md-5">
                      {selectedProduct.images?.[0] && (
                        <div className="bg-light rounded-3 p-4 text-center mb-3" style={{height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                          <img
                            src={selectedProduct.images[0]}
                            className="img-fluid rounded-2 modal-product-image"
                            style={{ maxHeight: "400px", objectFit: "contain" }}
                            alt={selectedProduct.name}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-md-7">
                      <h2 className="fw-bold text-dark mb-3 modal-product-title" style={{ fontSize: "1.8rem", lineHeight: "1.3" }}>
                        {selectedProduct.name}
                      </h2>

                      <div className="d-flex align-items-center gap-2 mb-4">
                        <span className="text-warning fw-bold" style={{ fontSize: "1.2rem" }}>
                         ⭐ {selectedProduct.rating || "4.5"}
                        </span>
                        {/* <span className="text-primary fw-600" style={{ cursor: "pointer" }}>
                          (245 Reviews)
                        </span> */}
                      </div>

                      <div className="mb-4">
                        <p className="text-muted small text-uppercase mb-1">Price</p>
                        <h3 className="fw-bold text-success" style={{ fontSize: "2.2rem" }}>
                          ₹{selectedProduct.actualPrice}
                        </h3>
                      </div>

                      <div className="bg-light rounded-3 p-3 mb-4">
                        <h6 className="fw-bold text-dark mb-3 text-uppercase" style={{ fontSize: "0.9rem", color: "#1a9b8e" }}>
                          HIGHLIGHTS
                        </h6>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex align-items-start gap-2">
                            <span style={{ color: "#1a9b8e", fontWeight: "bold" }}>✓</span>
                            <span className="text-dark fw-500">Free Delivery</span>
                          </div>
                          <div className="d-flex align-items-start gap-2">
                            <span style={{ color: "#1a9b8e", fontWeight: "bold" }}>✓</span>
                            <span className="text-dark fw-500">In Stock - {selectedProduct.quantity} items available</span>
                          </div>
                          <div className="d-flex align-items-start gap-2">
                            <span style={{ color: "#1a9b8e", fontWeight: "bold" }}>✓</span>
                            <span className="text-dark fw-500">7 Days Returns</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3 text-uppercase" style={{ fontSize: "0.9rem" }}>
                          About This Product
                        </h6>
                        <p className="text-dark" style={{ lineHeight: "1.6", fontSize: "0.95rem" }}>
                          {selectedProduct.description || "No description available"}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-muted small">
                          <strong className="text-dark">Sold by:</strong> <span className="fw-600">{selectedProduct.adminname || "Admin"}</span>
                        </p>
                      </div>

                      <button
                        className="btn w-100 fw-bold rounded-3 py-3"
                        style={{
                          backgroundColor: "#1a9b8e",
                          color: "white",
                          fontSize: "1.1rem",
                          border: "none"
                        }}
                        onClick={() => {
                          handleAddCart(selectedProduct);
                          setShowProductModal(false);
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* ORDER TRACKING MODAL */}
        {trackedOrder && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-3">
                <div className="modal-header border-bottom bg-light">
                  <h5 className="modal-title fw-bold text-dark">📦 Order Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setTrackedOrder(null)}
                  ></button>
                </div>

                <div className="modal-body py-4">
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <p className="text-muted small fw-600 text-uppercase">Order ID</p>
                      <p className="fw-bold text-dark">{trackedOrder._id}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <p className="text-muted small fw-600 text-uppercase">Status</p>
                      <span
                        className={`badge ${
                          trackedOrder.status === "Delivered"
                            ? "bg-success"
                            : trackedOrder.status === "Pending"
                            ? "bg-warning"
                            : "bg-info"
                        }`}
                      >
                        {trackedOrder.status}
                      </span>
                    </div>
                    <div className="col-md-6 mb-3">
                      <p className="text-muted small fw-600 text-uppercase">Total</p>
                      <h5 className="fw-bold text-success">₹{trackedOrder.totalAmount}</h5>
                    </div>
                    <div className="col-md-6 mb-3">
                      <p className="text-muted small fw-600 text-uppercase">Date</p>
                      <p className="fw-600">{new Date(trackedOrder.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {trackedOrder.status !== "Delivered" && (
                    <div className="alert alert-info small mb-3">
                      🚚 <strong>Est. Delivery:</strong> {trackedOrder.deliveryEstimate}
                    </div>
                  )}

                  {trackedOrder.location && (
                    <div className="alert alert-light border mb-3">
                      📍 <strong>Address:</strong> {trackedOrder.location.address}
                    </div>
                  )}

                  <h6 className="fw-bold mb-3">Items</h6>
                  <ul className="list-group list-group-flush">
                    {trackedOrder.products.map((p, idx) => (
                      <li key={idx} className="list-group-item px-0 py-3">
                        <div className="d-flex gap-3">
                          {p.productId?.images?.[0] && (
                            <img
                              src={p.productId.images[0]}
                              alt={p.productId.name}
                              className="rounded-2"
                              style={{ width: "60px", height: "60px", objectFit: "cover" }}
                            />
                          )}
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{p.productId?.name || p.name}</h6>
                            <p className="text-muted small mb-0">Qty: {p.quantity}</p>
                          </div>
                          <span className="fw-bold text-success">₹{p.price}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-primary fw-bold"
                    onClick={() => setTrackedOrder(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )} 

      {/* LOCATION MODAL */}
      {showMap && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-3">
                <div className="modal-header border-bottom bg-light">
                  <h5 className="modal-title fw-bold text-dark">📍 Select Your Location</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowMap(false)}
                  ></button>
                </div>

                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your complete address"
                      className="form-control rounded-2"
                      value={userLocation.address}
                      onChange={(e) =>
                        setUserLocation({ ...userLocation, address: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Pin Code
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter PIN code"
                        value={userLocation.pin}
                        onChange={(e) =>
                          setUserLocation({ ...userLocation, pin: e.target.value })
                        }
                        className="form-control rounded-start-2"
                      />
                      <button
                        className="btn btn-outline-info fw-600"
                        onClick={getCurrentLocation}
                        type="button"
                      >
                        📡 Current
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600 small text-uppercase text-muted">
                      Click on map to select
                    </label>
                    <div className="rounded-2 overflow-hidden border">
                      <MapContainer
                        center={[userLocation.lat || 22.57, userLocation.lng || 88.36]}
                        zoom={13}
                        style={{ height: "300px", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {userLocation.lat && userLocation.lng && (
                          <Marker position={[userLocation.lat, userLocation.lng]} />
                        )}
                        <LocationPicker
                          onSelect={async (loc) => {
                            try {
                              const res = await axios.get(
                                `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`
                              );
                              const address = res.data.display_name || "";
                              const pin = res.data.address?.postcode || userLocation.pin || "";
                              setUserLocation({
                                ...userLocation,
                                lat: loc.lat,
                                lng: loc.lng,
                                pin,
                              });
                            } catch (err) {
                              console.error("Error getting address:", err);
                            }
                          }}
                        />
                        <MapUpdater position={userLocation} />
                      </MapContainer>
                    </div>
                  </div>

                  {userLocation.lat && userLocation.lng && (
                    <div className="alert alert-info small mb-0">
                      📌 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowMap(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary fw-bold"
                    onClick={() => {
                      setShowMap(false);
                      if (userLocation.lat && userLocation.lng) {
                        filterByLocation(userLocation);
                        if (loggedIn) saveUserLocation(userLocation);
                      }
                    }}
                  >
                    ✓ Save Location
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* FOOTER - Desktop rich footer (md and up) */}
      <footer className="d-none d-md-block">
        <div className="bg-dark text-white pt-5 pb-4">
          <div className="container">
            <div className="row">
              <div className="col-md-3 mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{ width: 36, height: 36, background: "#1a9b8e", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    🌾
                  </div>
                  <h5 className="mb-0">FarmZone</h5>
                </div>
                <p style={{ color: "rgba(255,255,255,0.8)" }}>
                  FarmZone connects farmers directly with customers, delivering fresh farm products right to your doorstep within 10km radius.
                </p>
                <div className="mt-3">
                  <strong>FOLLOW US</strong>
                  <div className="mt-2" style={{ fontSize: "1.2rem" }}>
                    <span style={{ marginRight: 10 }}>👍</span>
                    <span style={{ marginRight: 10 }}>🐦</span>
                    <span style={{ marginRight: 10 }}>📷</span>
                    <span>📺</span>
                  </div>
                </div>
              </div>

            <div className="col-md-2 mb-4">
                <h6 className="text-uppercase fw-bold mb-3">Quick Links</h6>
               <ul className="list-unstyled" style={{ color: "rgba(255,255,255,0.85)" }}>
                  <li className="mb-2">
                    <Link to="/" className="text-light text-decoration-none">➜ Home</Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/order" className="text-light text-decoration-none">➜ Track Orders</Link>
                  </li>
                  <li className="mb-2">
                    <a href="#shop" className="text-decoration-none text-light">➜ Products</a>
                  </li>
                  <li className="mb-2">
                    <Link to="/admin" className="text-light text-decoration-none">➜ Become a Seller</Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/contact" className="text-light text-decoration-none">➜ Contact Us</Link>
                  </li>
                   <li className="mb-2">
                    <Link to="/help" className="text-light text-decoration-none">➜ User Help</Link>
                  </li>
                   <li>
                    <Link to="/delivery" className="text-light text-decoration-none">➜ Delivery Boy</Link>
                  </li>
                </ul>
              </div>


              <div className="col-md-3 mb-4">
                <h6 className="text-uppercase fw-bold mb-3">Our Services</h6>
                <ul className="list-unstyled" style={{ color: "rgba(255,255,255,0.85)" }}>
                  <li className="mb-2">✓ Free Delivery (10km)</li>
                  <li className="mb-2">✓ Fresh Products Daily</li>
                  <li className="mb-2">✓ 7 Days Returns</li>
                  <li className="mb-2">✓ 24/7 Customer Support</li>
                  <li className="mb-2">✓ Secure Payments</li>
                  <li>✓ Organic & Fresh</li>
                </ul>
              </div>

              <div className="col-md-4 mb-4">
                <h6 className="text-uppercase fw-bold mb-3">Contact Information</h6>
                <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 8 }}><strong>Phone:</strong> +91-XXXX-XXXX-XX</p>
                <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 8 }}><strong>Email:</strong> support@farmzone.com</p>
                <p style={{ color: "rgba(255,255,255,0.85)" }}>
                  <strong>Address:</strong><br />
                  123 Farm Lane, Agricultural District<br />
                  Kolkata, West Bengal 700001
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black text-white py-3">
          <div className="container d-flex justify-content-between align-items-center">
            <div>© {new Date().getFullYear()} <strong>FarmZone</strong> • All Rights Reserved</div>
            <div className="d-flex gap-3" style={{ fontSize: "0.95rem" }}>
              <div>Privacy Policy</div>
              <div>|</div>
              <div>Terms & Conditions</div>
              <div>|</div>
              <div>Return Policy</div>
              <div>|</div>
              <div>FAQ</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Simple mobile footer (keeps previous small footer) */}
      <footer className="bg-dark text-white pt-4 pb-3 d-md-none" style={{ marginTop: "24px" }}>
        <div className="container-fluid px-3">
          <div className="row align-items-center">
            <div className="col-6">
              <p className="text-muted small mb-0">© {new Date().getFullYear()} FarmZone</p>
            </div>
            <div className="col-6 text-end">
              <small className="text-muted">Privacy • Terms</small>
            </div>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAV (mobile) */}
      <nav className="fixed-bottom bg-white border-top d-md-none">
        <div className="d-flex justify-content-around py-2">
          <button className="btn btn-link text-success d-flex flex-column align-items-center" onClick={() => navigate("/")}>
            <div style={{ fontSize: "1.2rem" }}>🏠</div>
            <small>Home</small>
          </button>
        <button
  className="btn btn-link text-dark d-flex flex-column align-items-center"
  onClick={() => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  <div style={{ fontSize: "1.2rem" }}>🛍️</div>
  <small>Shop</small>
</button>

          <button className="btn btn-link text-dark d-flex flex-column align-items-center" onClick={() => navigate("/order")}>
            <div style={{ fontSize: "1.2rem" }}>📋</div>
            <small>Orders</small>
          </button>
          <button className="btn btn-link text-dark d-flex flex-column align-items-center" onClick={() => navigate("/more")}>
            <div style={{ fontSize: "1.2rem" }}>⋯</div>
            <small>More</small>
          </button>
        </div>
      </nav>

      <style>{`
        /* Header button styles */
        .brand-badge {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #ffffff 0%, #e9f7f0 100%);
          color: #198754;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e9ecef;
        }

        .btn-location {
          background: linear-gradient(90deg, #198754 0%, #16a34a 100%);
          color: white;
          padding: 8px 12px;
          border-radius: 28px;
          border: none;
          box-shadow: 0 6px 18px rgba(25, 135, 84, 0.18);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .btn-location:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(25, 135, 84, 0.22);
        }
        .btn-location .location-label {
          max-width: 160px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.95rem;
        }

        .btn-cta-login, .btn-cta-logout {
          padding: 8px 12px;
          border-radius: 22px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(0,0,0,0.08);
        }
        .btn-cta-login {
          background: linear-gradient(90deg, #fff 0%, #f8f9fa 100%);
          color: #198754;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .btn-cta-login:hover {
          transform: translateY(-2px);
        }
        .btn-cta-logout {
          background: linear-gradient(90deg, #ff6b6b 0%, #ff4d4d 100%);
          color: white;
        }
        .btn-cta-logout:hover {
          transform: translateY(-2px);
        }

        .btn-cart {
          background: white;
          border-radius: 12px;
          padding: 8px 12px;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.06);
          cursor: pointer;
        }
        .btn-cart:hover {
          transform: translateY(-2px);
        }
        .cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #dc3545;
          color: white;
          font-size: 0.65rem;
          padding: 4px 6px;
          border-radius: 10px;
          font-weight: 700;
          box-shadow: 0 6px 12px rgba(220, 53, 69, 0.18);
        }

        /* Nav spacing and responsive sizing */
        .desktop-nav {
          gap: 0.6rem !important;
        }

        .desktop-nav .nav-link {
          font-size: 1.02rem;
          font-weight: 500;
          padding: 6px 8px;
          color: #1f2937 !important;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .desktop-nav .nav-link:hover {
          color: #198754 !important;
          background: rgba(25,135,84,0.05);
          text-decoration: none;
        }

        /* Product thumbnail — show full image on all devices */
        .product-thumb {
          width: 100%;
          height: 120px;
          object-fit: contain;
          background: #f8f9fa;
          display: block;
        }
        @media (min-width: 768px) {
          .product-thumb { height: 140px; }
        }
        @media (min-width: 992px) {
          .product-thumb { height: 160px; }
        }

        /* Slight adjustments for header spacing */
        .header-row {
          gap: 22px;
        }

        /* Reuse existing utilities */
        .rounded-2 {
          border-radius: 0.5rem !important;
        }

        /* Hide the horizontal scrollbar on smaller screens and reduce gap */
        @media (max-width: 992px) {
          .desktop-nav { gap: 0.45rem !important; }
          .desktop-nav .nav-link { font-size: 0.92rem; padding: 6px 6px; }
        }
        @media (max-width: 768px) {
          .desktop-nav { gap: 0.35rem !important; overflow-x: hidden !important; }
          .desktop-nav .nav-link { font-size: 0.88rem; padding: 5px 6px; }
          .desktop-nav::-webkit-scrollbar { display: none; height: 0; }
          .btn-location .location-label {
            max-width: 90px;
          }
        }

        /* Footer, dropdown and other existing styles kept below */
        .hover-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
        }

        .transition {
          transition: all 0.3s ease;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .form-check-input {
          cursor: pointer;
          width: 1.25em;
          height: 1.25em;
        }

        .form-check-input:checked {
          background-color: #198754;
          border-color: #198754;
        }

        .nav-link {
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #198754 !important;
        }

        .rounded-3 {
          border-radius: 1rem !important;
        }

        .rounded-pill {
          border-radius: 50px !important;
        }

        .shadow-sm {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }

        .fw-600 {
          font-weight: 600;
        }

        label {
          transition: all 0.3s ease;
        }

        label:hover {
          transform: translateX(4px);
        }

        .btn-brown {
          color: white;
        }

        .btn-brown:hover {
          filter: brightness(0.95);
        }

        .dropdown-menu-custom {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          margin-top: 0.5rem;
          max-height: 250px;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .dropdown-item-custom {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #dee2e6;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .dropdown-item-custom:hover {
          background-color: #f8f9fa;
        }

        .dropdown-item-custom:last-child {
          margin-bottom: 0;
        }

        .dropdown-track-mobile {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          margin-top: 0.5rem;
          padding: 0.75rem;
          min-width: 180px;
          z-index: 1050;
        }

        .footer-newsletter input.form-control {
          background: white;
        }

        @media (max-width: 768px) {
          .modal-xl {
            max-width: 100% !important;
          }

          .modal-body {
            padding: 1.25rem !important;
          }

          .modal-dialog.modal-xl,
          .modal-dialog.modal-lg {
            max-width: 95% !important;
            margin: 0.75rem;
          }

          .modal .modal-title {
            font-size: 1rem;
          }

          .modal .modal-body p,
          .modal .modal-body h6,
          .modal .modal-body h5 {
            font-size: 0.95rem;
          }

          .modal-product-image {
            max-height: 240px !important;
          }

          .modal-product-title {
            font-size: 1.15rem !important;
            line-height: 1.2 !important;
          }

          .dropdown-menu-custom {
            max-height: 200px;
          }
        }

        a.text-muted:hover {
          color: #1a9b8e !important;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}


