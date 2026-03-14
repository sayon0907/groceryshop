import React, { useEffect, useState, useCallback } from "react";
import {
  FaBars,
  FaUsers,
  FaUserShield,
  FaTruck,
  FaBox,
  FaShoppingCart,
  FaHeadset,
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../../context/AuthContext";

export default function SuperAdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleUnauthorized = useCallback(() => {
    logout();
    navigate("/superadmin/login");
  }, [logout, navigate]);
/* 🔥 CLOSE MODAL WHEN PAGE UNMOUNT / ROUTE CHANGE */
useEffect(() => {
  return () => {
    const modal = document.getElementById("productModal");

    if (modal) {
      modal.classList.remove("show");
      modal.style.display = "none";
    }

    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";

    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((b) => b.remove());
  };
}, []);
  useEffect(() => {
    if (!token) {
      handleUnauthorized();
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(
          "https://groceryshop-d27s.onrender.com/api/superadmin/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        handleUnauthorized();
      }
    };

    fetchData();
  }, [token, handleUnauthorized]);

if (!data)
  return (
    <div className="enterprise-loading">
      <div className="loading-content">
        <div className="loading-title">
          Super Admin System
        </div>

        <div className="loading-subtitle">
          Loading dashboard data...
        </div>

        <div className="progress-line">
          <div className="progress-indicator"></div>
        </div>
      </div>

      <style>{`
        .enterprise-loading {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f1f5f9;
        }

        .loading-content {
          width: 420px;
          padding: 50px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 35px rgba(0,0,0,0.08);
          text-align: center;
        }

        .loading-title {
          font-size: 18px;
          font-weight: 600;
          color: #141e30;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .loading-subtitle {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 30px;
        }

        .progress-line {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-indicator {
          width: 35%;
          height: 100%;
          background: #243b55;
          animation: slide 1.6s infinite ease-in-out;
        }

        @keyframes slide {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(250%); }
          100% { transform: translateX(-120%); }
        }
      `}</style>
    </div>
  );

  const stats = [
    { title: "Total Users", value: data.users, class: "card1", icon: <FaUsers /> },
    { title: "Total Admins", value: data.admins, class: "card2", icon: <FaUserShield /> },
    { title: "Delivery Boys", value: data.deliveryBoys, class: "card3", icon: <FaTruck /> },
    { title: "Total Products", value: data.products, class: "card4", icon: <FaBox /> },
    { title: "Total Orders", value: data.orders, class: "card5", icon: <FaShoppingCart /> },
    { title: "Delivered Orders", value: data.deliveredOrders, class: "card6", icon: <FaCheckCircle /> },
    { title: "Cancelled Orders", value: data.cancelledOrders, class: "card7", icon: <FaTimesCircle /> },
    { title: "Order Help", value: data.orderHelp, class: "card8", icon: <FaHeadset /> },
    { title: "Contact Messages", value: data.contacts, class: "card9", icon: <FaEnvelope /> },
  ];

  return (
    <>
      <style>{`
        body {
          background: #eef2f7;
          font-family: 'Poppins', sans-serif;
          margin: 0;
        }

        .layout {
          display: flex;
        }

        /* ===== TOPBAR ===== */
        .topbar {
          background: linear-gradient(90deg, #141e30, #243b55);
          color: white;
          padding: 15px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .topbar h5 {
          margin: 0;
          font-weight: 600;
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
          width: 250px;
          background: #ffffff;
          height: 100vh;
          border-right: 1px solid #e5e7eb;
          padding-top: 25px;
          position: fixed;
          top: 65px;
          left: 0;
          transition: 0.3s;
        }

        .sidebar ul {
          list-style: none;
          padding: 0;
        }

        .sidebar ul li {
          padding: 12px 22px;
          border-radius: 8px;
          margin: 6px 12px;
          transition: 0.3s;
        }

        .sidebar ul li a {
          text-decoration: none;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .sidebar ul li:hover {
          background: #e3ebff;
          transform: translateX(5px);
        }

        .main {
          margin-left: 250px;
          padding: 25px;
          width: 100%;
     
        }

        /* ===== CARDS ===== */
        .premium-card {
          border-radius: 16px;
          padding: 22px;
          color: white;
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
          transition: 0.3s;
        }

        .premium-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .premium-card h6 {
          font-size: 14px;
          opacity: 0.9;
        }

        .premium-card h3 {
          font-weight: 700;
          margin-top: 10px;
        }

        .icon {
          font-size: 28px;
          opacity: 0.9;
        }

        /* Gradient Cards */
        .card1 { background: linear-gradient(135deg, #36d1dc, #5b86e5); }
        .card2 { background: linear-gradient(135deg, #667eea, #764ba2); }
        .card3 { background: linear-gradient(135deg, #ff9966, #ff5e62); }
        .card4 { background: linear-gradient(135deg, #11998e, #38ef7d); }
        .card5 { background: linear-gradient(135deg, #fc466b, #3f5efb); }
        .card6 { background: linear-gradient(135deg, #00b09b, #96c93d); }
        .card7 { background: linear-gradient(135deg, #ff512f, #dd2476); }
        .card8 { background: linear-gradient(135deg, #00c6ff, #0072ff); }
        .card9 { background: linear-gradient(135deg, #f7971e, #ffd200); }

        /* Revenue */
        .revenue-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.05);
        }

        .revenue-card h2 {
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
          <button className="btn btn-sm text-white d-md-none" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <h5>Super Admin Panel</h5>
        </div>
        <button className="btn btn-light btn-sm" onClick={handleUnauthorized}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="layout">
        {/* SIDEBAR */}
        <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <ul>
            <li><Link to="/superadmin"><FaChartLine /> Dashboard</Link></li>
            <li><Link to="/superadmin/users">Users</Link></li>
            <li><Link to="/superadmin/admins">Admins</Link></li>
            <li><Link to="/superadmin/deliveryboy">Delivery Boys</Link></li>
            <li><Link to="/superadmin/products">Products</Link></li>
            <li><Link to="/superadmin/orders">Orders</Link></li>
            <li><Link to="/superadmin/delivered">Delivered Orders</Link></li>
            <li><Link to="/superadmin/cancelled">Cancelled Orders</Link></li>
            <li><Link to="/superadmin/order-help">Order Help</Link></li>
            <li><Link to="/superadmin/contact">Contact</Link></li>
            <li><Link to="/superadmin/revenue/total">Revenue Per Admin</Link></li>
          </ul>
        </div>

        {/* MAIN */}
        <div className="main">
          <h4 className="fw-bold mb-4">Dashboard Overview</h4>

          <div className="row g-4">
            {stats.map((item, index) => (
              <div className="col-md-4 col-sm-6" key={index}>
                <div className={`premium-card ${item.class}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>{item.title}</h6>
                      <h3>{item.value}</h3>
                    </div>
                    <div className="icon">{item.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-4 g-4">
            <div className="col-md-6">
              <div className="revenue-card">
                <h6>Total Revenue</h6>
                <h2>₹{(data.totalRevenue || 0).toLocaleString()}</h2>
              </div>
            </div>

            <div className="col-md-6">
              <div className="revenue-card">
                <h6>Pending Revenue</h6>
                <h2>₹{(data.pendingRevenue || 0).toLocaleString()}</h2>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}