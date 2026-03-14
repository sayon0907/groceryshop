import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaHeadset,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token, role, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || role !== "admin") {
      navigate("/admin/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("https://groceryshop-d27s.onrender.com/api/adminstat/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [token, role, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

if (!stats)
  return (
    <div className="formal-loading">
      <div className="loader-box">
        <h4>Loading Dashboard</h4>
        <p>Initializing admin data...</p>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>

      <style>{`
        .formal-loading {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f8fafc;
        }

        .loader-box {
          width: 380px;
          text-align: center;
          padding: 50px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .loader-box h4 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .loader-box p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 25px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          width: 40%;
          height: 100%;
          background: #243b55;
          border-radius: 10px;
          animation: loadingMove 1.8s infinite ease-in-out;
        }

        @keyframes loadingMove {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );


  const {
    totalNearbyUsers,
    totalOrders,
    totalProducts,
    totalDeliveredOrders,
    totalSales,
  } = stats;

  return (
    <>
      <style>{`
        body {
          background: linear-gradient(135deg, #f6f9fc, #e9eff5);
          font-family: 'Poppins', sans-serif;
        }

        .layout {
          display: flex;
        }

        /* ===== TOPBAR ===== */
        .topbar {
          background: linear-gradient(90deg, #141e30, #243b55);
          color: white;
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        .topbar h5 {
          margin: 0;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .logout-btn {
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          border: none;
          color: white;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 14px;
          transition: 0.3s;
        }

        .logout-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 250px;
          background: white;
          height: 100vh;
          border-right: 1px solid #e5e7eb;
          padding-top: 25px;
          position: fixed;
          top: 70px;
          left: 0;
          transition: 0.3s;
        }

        .sidebar ul {
          list-style: none;
          padding: 0;
        }

        .sidebar ul li {
          margin: 6px 12px;
        }

        .sidebar ul li a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          text-decoration: none;
          color: #374151;
          border-radius: 10px;
          font-weight: 500;
          transition: 0.3s;
        }

        .sidebar ul li a:hover {
          background: linear-gradient(135deg, #36d1dc, #5b86e5);
          color: white;
          transform: translateX(6px);
        }

        .main {
          margin-left: 250px;
          padding: 30px;
          width: 100%;
        }

        /* ===== CARDS ===== */
        .premium-card {
          border-radius: 18px;
          padding: 25px;
          color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: 0.3s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .premium-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.15);
        }

        .premium-card h6 {
          font-size: 14px;
          opacity: 0.9;
        }

        .premium-card h3 {
          font-weight: 700;
          margin-top: 8px;
        }

        .card-users {
          background: linear-gradient(135deg, #36d1dc, #5b86e5);
        }

        .card-orders {
          background: linear-gradient(135deg, #ff512f, #dd2476);
        }

        .card-products {
          background: linear-gradient(135deg, #11998e, #38ef7d);
        }

        .card-delivered {
          background: linear-gradient(135deg, #f7971e, #ffd200);
        }

        .card-icon {
          font-size: 32px;
          opacity: 0.9;
        }

        /* SALES BOX */
        .sales-box {
          background: white;
          padding: 35px;
          border-radius: 18px;
          margin-top: 30px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.05);
          transition: 0.3s;
        }

        .sales-box:hover {
          transform: translateY(-5px);
        }

        .sales-box h2 {
          font-weight: 700;
          color: #243b55;
        }

        /* MOBILE */
        @media(max-width:768px){
          .sidebar{
            left:-100%;
          }
          .sidebar.open{
            left:0;
            z-index:1100;
          }
          .main{
            margin-left:0;
          }
        }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm text-white d-md-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <FaBars />
          </button>
          <h5>FARMZONE Admin Panel</h5>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" />
          Logout
        </button>
      </div>

      <div className="layout">
        {/* SIDEBAR */}
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="/admin/dashboard">
                <FaTachometerAlt /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/productdashboard">
                <FaBox /> Products
              </Link>
            </li>
            <li>
              <Link to="/admin/shipping">
                <MdLocalShipping /> Shipping
              </Link>
            </li>
            <li>
              <Link to="/admin/deliveredorder">
                <FaShoppingCart /> Orders
              </Link>
            </li>
            <li>
              <Link to="/admin/usersupport">
                <FaHeadset /> Support
              </Link>
            </li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="main">
          <h4 className="mb-4 fw-bold">Dashboard Overview</h4>

          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="premium-card card-users">
                <div>
                  <h6>Total Users</h6>
                  <h3>{totalNearbyUsers}</h3>
                </div>
                <FaUsers className="card-icon" />
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="premium-card card-orders">
                <div>
                  <h6>Total Orders</h6>
                  <h3>{totalOrders}</h3>
                </div>
                <FaShoppingCart className="card-icon" />
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="premium-card card-products">
                <div>
                  <h6>Total Products</h6>
                  <h3>{totalProducts}</h3>
                </div>
                <FaBox className="card-icon" />
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="premium-card card-delivered">
                <div>
                  <h6>Delivered Orders</h6>
                  <h3>{totalDeliveredOrders}</h3>
                </div>
                <MdLocalShipping className="card-icon" />
              </div>
            </div>
          </div>

          <div className="sales-box">
            <h6>Total Sales</h6>
            <h2>₹{totalSales?.toLocaleString() || 0}</h2>
          </div>
        </div>
      </div>
    </>
  );
} 

// import React, { useState, useEffect } from "react";
// import {
//   FaBars,
//   FaTachometerAlt,
//   FaUser,
//   FaBox,
//   FaShoppingCart,
// } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./App.css";
// import { useAuth } from "../../context/AuthContext";
// export default function App() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const { token, role, logout } = useAuth();
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalOrders: 0,
//     totalProducts: 0,
//     totalDeliveredOrders: 0,
//     totalSales: 0,
//   });
//   const navigate = useNavigate();

//   // ✅ Redirect non-admin users
//   useEffect(() => {
//     if (!token || role !== "admin") {
//       alert("⚠️ Please log in as Admin to access this page.");
//       navigate("/admin/login");
//       return;
//     }

//     // ✅ Fetch stats from backend
//     const fetchStats = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/adminstat/stats", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setStats(data);
//       } catch (err) {
//         console.error("Error fetching admin stats:", err);
//       }
//     };
//     fetchStats();
//   }, [token, role, navigate]);

//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

//   const handleLogout = () => {
//     logout();
//     navigate("/admin/login");
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Sidebar */}
//       <div className={`sidebar bg-light ${isSidebarOpen ? "open" : ""}`}>
//         <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
//           <h5 className="m-0 fw-bold text-primary">FARMZONE</h5>
//           <button className="btn-close d-md-none" onClick={toggleSidebar}></button>
//         </div>
//         <ul className="list-unstyled mt-3">
//           <li>
//             <Link to="/admin/dashboard" className="text-decoration-none text-dark">
//               <FaTachometerAlt /> Dashboard
//             </Link>
//           </li>
//           <li>
//             <Link to="/admin/productdashboard" className="text-decoration-none text-dark">
//               <FaUser /> Add Product
//             </Link>
//           </li>
//           <li>
//             <Link to="/admin/shipping" className="text-decoration-none text-dark">
//               <FaBox /> Shipping
//             </Link>
//           </li>
//           <li>
//             <Link to="/admin/deliveredorder" className="text-decoration-none text-dark">
//               <FaShoppingCart /> Delivered Order
//             </Link>
//           </li>
//         </ul>
//       </div>

//       {/* Main content */}
//       <div className="main-content">
//         <nav className="navbar">
//           <button className="btn d-md-none" onClick={toggleSidebar}>
//             <FaBars size={20} />
//           </button>
//           <div className="ms-auto d-flex align-items-center">
//             {!token ? (
//               <button
//                 className="btn btn-outline-primary btn-sm"
//                 onClick={() => navigate("/admin/login")}
//               >
//                 Login
//               </button>
//             ) : (
//               <button
//                 className="btn btn-outline-danger btn-sm"
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             )}
//           </div>
//         </nav>

//         {/* Dashboard Content */}
//         <div className="container-fluid mt-4">
//           <h5 className="mb-3 fw-bold">Ecommerce Dashboard</h5>
//           <div className="row g-3">
//             <div className="col-md-3 col-sm-6">
//               <div className="card text-white bg-success p-3 shadow-sm">
//                 <h6>Total Users</h6>
//                 <h3>{stats.totalUsers}</h3>
//                 <small>+95% Last Month</small>
//               </div>
//             </div>
//             <div className="col-md-3 col-sm-6">
//               <div className="card text-white bg-danger p-3 shadow-sm">
//                 <h6>Total Orders</h6>
//                 <h3>{stats.totalOrders}</h3>
//                 <small>+30% Last Month</small>
//               </div>
//             </div>
//             <div className="col-md-3 col-sm-6">
//               <div className="card text-white bg-primary p-3 shadow-sm">
//                 <h6>Total Products</h6>
//                 <h3>{stats.totalProducts}</h3>
//                 <small>+25% Last Month</small>
//               </div>
//             </div>
//             <div className="col-md-3 col-sm-6">
//               <div className="card text-white bg-warning p-3 shadow-sm">
//                 <h6>Total Delivered Orders</h6>
//                 <h3>{stats.totalDeliveredOrders}</h3>
//                 <small>+45% Last Month</small>
//               </div>
//             </div>
//           </div>

//           {/* Total Sales Card */}
//           <div className="card mt-4 p-3 shadow-sm">
//             <h6>Total Sales</h6>
//             <h2 className="text-success">
//               ₹{stats.totalSales?.toLocaleString() || 0}
//             </h2>
//             <p className="text-success fw-semibold">40.63% ↑ since last month</p>
//           </div>

//           {/* Best Selling Products */}
//           <div className="card mt-4 p-3 shadow-sm">
//             <h6>Best Selling Products</h6>
//             <p className="text-muted">(Add a table or list here)</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }















