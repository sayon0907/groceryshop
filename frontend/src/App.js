import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// ---------------- USER PAGES ----------------
import UserFrontPage from "./pages/Userpage/UserFrontPage";
import UserLogin from "./pages/Userpage/Userlogin";
import UserRegister from "./pages/Userpage/UserRegister";
import UserVerifyRegister from "./pages/Userpage/UserVerifyRegister";
import UserForgotPassword from "./pages/Userpage/UserForgotPassword";
import UserVerifyForgot from "./pages/Userpage/UserVerifyForgot";
import OrdersPage from "./pages/Userpage/Orderpage";
import Contact from "./pages/Userpage/Contract";
import OrderHelp from "./pages/Userpage/Orderhelp";
import CartPage from "./pages/Userpage/CartPage";

// ---------------- ADMIN PAGES ----------------
import AdminLogin from "./pages/Adminpage/Login";
import AdminRegister from "./pages/Adminpage/Register";
import AdminVerifyRegister from "./pages/Adminpage/VerifyRegister";
import AdminForgotPassword from "./pages/Adminpage/ForgotPassword";
import AdminVerifyForgot from "./pages/Adminpage/VerifyForgot";
import ProductDashboard from "./pages/Adminpage/ProductDashboard";
import AdminOrdersPage from "./pages/Adminpage/Adminorderpage";
import Totalorder from "./pages/Adminpage/Totalorder";
import AdminSupportPage from "./pages/Adminpage/AdminSupportPage";
import AdminDashboard from "./pages/Adminpage/AdminDashboard";

// ---------------- DELIVERY PAGES ----------------
import DeliveryLogin from "./pages/Deliverboypage/DeliveryLogin";
import DeliveryRegister from "./pages/Deliverboypage/DeliveryRegister";
import DeliveryVerifyRegister from "./pages/Deliverboypage/DeliveryVerifyRegister";
import DeliveryForgotPassword from "./pages/Deliverboypage/DeliveryForgotPassword";
import DeliveryVerifyForgot from "./pages/Deliverboypage/DeliveryVerifyForgot";
import DeliveryBoyDashboard from "./pages/Deliverboypage/DeliveryBoyDashboard";
import DeliveryBoyDeliveredPage from "./pages/Deliverboypage/DeliveryBoyDeliveredPage";

// ---------------- SUPERADMIN PAGES ----------------
import SuperAdminLogin from "./pages/superadmin/SuperAdminLogin";
import Superadmindash from "./pages/superadmin/Superadmindash";
import UserInformation from "./pages/superadmin/UserInformation";
import AdminInformation from "./pages/superadmin/AdminInformation";
import DeliveryInformation from "./pages/superadmin/DeliveryInformation";
import ProductInformation from "./pages/superadmin/ProductInformation";
import OrderInformation from "./pages/superadmin/OrderInformation";
import DeliveredOrders from "./pages/superadmin/DeliveredOrders";
import CancelledOrders from "./pages/superadmin/CancelledOrders";
import OrderHelpInformation from "./pages/superadmin/OrderHelpInformation";
import ContactAdmin from "./pages/superadmin/ContactAdmin";
import TotalRevenuePerAdmin from "./pages/superadmin/TotalRevenuePerAdmin";

function App() {
  const { token, role, loading } = useAuth();

  const isUser = role === "user" && token;
  const isAdmin = role === "admin" && token;
  const isDelivery = role === "delivery" && token;
  const isSuperAdmin = role === "superadmin" && token;

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------------- USER ---------------- */}
        <Route path="/" element={<UserFrontPage />} />
        <Route path="/login" element={isUser ? <Navigate to="/" /> : <UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/verify-register" element={<UserVerifyRegister />} />
        <Route path="/forgot" element={<UserForgotPassword />} />
        <Route path="/verify-forgot" element={<UserVerifyForgot />} />
        <Route path="/order" element={isUser ? <OrdersPage /> : <Navigate to="/login" />} />
        <Route path="/help" element={isUser ? <OrderHelp /> : <Navigate to="/login" />} />
        <Route path="/contact" element={isUser ? <Contact /> : <Navigate to="/login" />} />
        <Route path="/cart" element={isUser ? <CartPage /> : <Navigate to="/login" />} />

        {/* ---------------- ADMIN ---------------- */}
        <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
        <Route path="/admin/register" element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminRegister />} />
        <Route path="/admin/verify-register" element={<AdminVerifyRegister />} />
        <Route path="/admin/forgot" element={<AdminForgotPassword />} />
        <Route path="/admin/verify-forgot" element={<AdminVerifyForgot />} />
        <Route path="/admin/productdashboard" element={isAdmin ? <ProductDashboard /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/shipping" element={isAdmin ? <AdminOrdersPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/deliveredorder" element={isAdmin ? <Totalorder /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/usersupport" element={isAdmin ? <AdminSupportPage /> : <Navigate to="/admin/login" />} />
        <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />} />

        {/* ---------------- DELIVERY ---------------- */}
        <Route path="/delivery" element={isDelivery ? <DeliveryBoyDashboard /> : <Navigate to="/delivery/login" /> } />
        <Route path="/delivery/login" element={isDelivery ? <Navigate to="/delivery/dashboard" /> : <DeliveryLogin />} />
        <Route path="/delivery/register" element={<DeliveryRegister />} />
        <Route path="/delivery/verify-register" element={<DeliveryVerifyRegister />} />
        <Route path="/delivery/forgot" element={<DeliveryForgotPassword />} />
        <Route path="/delivery/verify-forgot" element={<DeliveryVerifyForgot />} />
        <Route path="/delivery/dashboard" element={isDelivery ? <DeliveryBoyDashboard /> : <Navigate to="/delivery/login" />} />
        <Route path="/delivery/delivered" element={isDelivery ? <DeliveryBoyDeliveredPage /> : <Navigate to="/delivery/login" />} />

        {/* ---------------- SUPERADMIN ---------------- */}
        <Route path="/superadmin/login" element={isSuperAdmin ? <Navigate to="/superadmin" /> : <SuperAdminLogin />} />
        <Route path="/superadmin" element={isSuperAdmin ? <Superadmindash /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/users" element={isSuperAdmin ? <UserInformation /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/admins" element={isSuperAdmin ? <AdminInformation /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/deliveryboy" element={isSuperAdmin ? <DeliveryInformation /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/products" element={isSuperAdmin ? <ProductInformation /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/orders" element={isSuperAdmin ? <OrderInformation /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/delivered" element={isSuperAdmin ? <DeliveredOrders /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/cancelled" element={isSuperAdmin ? <CancelledOrders /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/order-help" element={isSuperAdmin ? <OrderHelpInformation /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/contact" element={isSuperAdmin ? <ContactAdmin /> : <Navigate to="/superadmin/login" />} />
        <Route path="/superadmin/revenue/total" element={isSuperAdmin ? <TotalRevenuePerAdmin /> : <Navigate to="/superadmin/login" />} />

        {/* ---------------- FALLBACK 404 ---------------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;