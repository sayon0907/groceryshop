// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [deliveryBoy, setDeliveryBoy] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [role, setRole] = useState(localStorage.getItem("role"));
//   const [loading, setLoading] = useState(true);

//   // ✅ Setup Axios base URL (optional)
//   axios.defaults.baseURL = "http://localhost:5000/api";
//   axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";

//   // ✅ Automatically logout if any API returns 401
//   useEffect(() => {
//     const interceptor = axios.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         if (error.response?.status === 401 || error.response?.status === 403) {
//           console.warn("Token expired or unauthorized — logging out...");
//           logout();
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axios.interceptors.response.eject(interceptor);
//     };
//   }, [token]);

//   // ✅ Validate token on mount
//   useEffect(() => {
//     const validateToken = async () => {
//       if (!token || !role) {
//         setLoading(false);
//         return;
//       }

//       try {
//         let endpoint = "";
//         if (role === "user") endpoint = "/auth/me";
//         else if (role === "admin") endpoint = "/admin/me";
//         else if (role === "delivery") endpoint = "/delivery/me";
//         if (!endpoint) return;

//         const res = await axios.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (role === "user") setUser(res.data);
//         else if (role === "delivery") setDeliveryBoy(res.data);

//       } catch (err) {
//         console.error("Token validation failed:", err.message);
//         logout(); // ❌ invalid token → force logout
//       } finally {
//         setLoading(false);
//       }
//     };

//     validateToken();
//   }, [token, role]);

//   // ✅ Login (for user/admin/delivery)
//   const login = (tokenValue, userRole) => {
//     setToken(tokenValue);
//     setRole(userRole);
//     localStorage.setItem("token", tokenValue);
//     localStorage.setItem("role", userRole);
//     axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
//   };

//   // ✅ Logout (clears all data)
//   const logout = () => {
//     setUser(null);
//     setDeliveryBoy(null);
//     setToken(null);
//     setRole(null);
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     delete axios.defaults.headers.common["Authorization"];
//   };

//   // ✅ Sync logout across browser tabs
//   useEffect(() => {
//     const syncLogout = (e) => {
//       if (e.key === "token" && !e.newValue) logout();
//     };
//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         deliveryBoy,
//         token,
//         role,
//         loading,
//         login,
//         logout,
//         setUser,
//         setDeliveryBoy,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

































// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [deliveryBoy, setDeliveryBoy] = useState(null);
//   const [superAdmin, setSuperAdmin] = useState(null);

//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [role, setRole] = useState(localStorage.getItem("role"));
//   const [loading, setLoading] = useState(true);

//   axios.defaults.baseURL = "http://localhost:5000/api";
//   axios.defaults.headers.common["Authorization"] =
//     token ? `Bearer ${token}` : "";

//   // 🔐 Auto logout on 401/403
//   useEffect(() => {
//     const interceptor = axios.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         if (error.response?.status === 401 || error.response?.status === 403) {
//           console.warn("Unauthorized — logging out...");
//           logout();
//         }
//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       axios.interceptors.response.eject(interceptor);
//     };
//   }, [token]);

//   // ✅ Validate token on app load
//   useEffect(() => {
//     const validateToken = async () => {
//       if (!token || !role) {
//         setLoading(false);
//         return;
//       }

//       try {
//         let endpoint = "";

//         if (role === "user") endpoint = "/auth/me";
//         else if (role === "admin") endpoint = "/admin/me";
//         else if (role === "delivery") endpoint = "/delivery/me";
//         else if (role === "superadmin") endpoint = "/superadmin/me";

//         if (!endpoint) {
//           setLoading(false);
//           return;
//         }

//         const res = await axios.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (role === "user") setUser(res.data);
//         else if (role === "delivery") setDeliveryBoy(res.data);
//         else if (role === "superadmin") setSuperAdmin(res.data);

//       } catch (err) {
//         console.error("Token validation failed:", err.message);
//         logout();
//       } finally {
//         setLoading(false);
//       }
//     };

//     validateToken();
//   }, [token, role]);

//   // ✅ Login (supports superadmin)
//   const login = (tokenValue, userRole) => {
//     setToken(tokenValue);
//     setRole(userRole);

//     localStorage.setItem("token", tokenValue);
//     localStorage.setItem("role", userRole);

//     axios.defaults.headers.common["Authorization"] =
//       `Bearer ${tokenValue}`;
//   };

//   // ✅ Logout
//   const logout = () => {
//     setUser(null);
//     setDeliveryBoy(null);
//     setSuperAdmin(null);

//     setToken(null);
//     setRole(null);

//     localStorage.removeItem("token");
//     localStorage.removeItem("role");

//     delete axios.defaults.headers.common["Authorization"];
//   };

//   // 🔄 Sync logout across tabs
//   useEffect(() => {
//     const syncLogout = (e) => {
//       if (e.key === "token" && !e.newValue) logout();
//     };
//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         deliveryBoy,
//         superAdmin,
//         token,
//         role,
//         loading,
//         login,
//         logout,
//         setUser,
//         setDeliveryBoy,
//         setSuperAdmin,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

















// import { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";
// import {jwtDecode} from "jwt-decode";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [deliveryBoy, setDeliveryBoy] = useState(null);
//   const [superAdmin, setSuperAdmin] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [role, setRole] = useState(localStorage.getItem("role"));
//   const [loading, setLoading] = useState(true);

//   axios.defaults.baseURL = "http://localhost:5000/api";

//   // ✅ Validate token on app load
//   useEffect(() => {
//     const validateToken = async () => {
//       if (!token || !role) {
//         setLoading(false);
//         return;
//       }

//       try {
//         // Decode JWT to check expiry
//         const decoded = jwtDecode(token);
//         const now = Date.now() / 1000;

//         if (decoded.exp && decoded.exp < now) {
//           console.warn("Token expired, logging out...");
//           logout();
//           setLoading(false);
//           return;
//         }

//         let endpoint = "";
//         if (role === "user") endpoint = "/auth/me";
//         else if (role === "admin") endpoint = "/admin/me";
//         else if (role === "delivery") endpoint = "/delivery/me";
//         else if (role === "superadmin") endpoint = "/superadmin/me";

//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         const res = await axios.get(endpoint);

//         if (role === "user") setUser(res.data);
//         else if (role === "delivery") setDeliveryBoy(res.data);
//         else if (role === "superadmin") setSuperAdmin(res.data);

//       } catch (err) {
//         console.error("Token validation failed:", err.response?.data || err.message);
//         // Only logout if 401 / 403 (invalid session)
//         if (err.response?.status === 401 || err.response?.status === 403) {
//           logout();
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     validateToken();
//   }, [token, role]);

//   // ✅ Login
//   const login = (tokenValue, userRole) => {
//     localStorage.setItem("token", tokenValue);
//     localStorage.setItem("role", userRole);
//     setToken(tokenValue);
//     setRole(userRole);
//     axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
//   };

//   // ✅ Logout
//   const logout = () => {
//     setUser(null);
//     setDeliveryBoy(null);
//     setSuperAdmin(null);
//     setToken(null);
//     setRole(null);

//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     delete axios.defaults.headers.common["Authorization"];
//   };

//   // ✅ Sync logout across tabs
//   useEffect(() => {
//     const syncLogout = (e) => {
//       if (e.key === "token" && !e.newValue) logout();
//     };
//     window.addEventListener("storage", syncLogout);
//     return () => window.removeEventListener("storage", syncLogout);
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         deliveryBoy,
//         superAdmin,
//         token,
//         role,
//         loading,
//         login,
//         logout,
//         setUser,
//         setDeliveryBoy,
//         setSuperAdmin,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(null); // ✅ SuperAdmin state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [loading, setLoading] = useState(true);

  // ✅ Setup Axios base URL
  axios.defaults.baseURL = "https://groceryshop-d27s.onrender.com/api";
  axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";

  // ✅ Automatically logout if any API returns 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn("Token expired or unauthorized — logging out...");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  // ✅ Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !role) {
        setLoading(false);
        return;
      }

      try {
        let endpoint = "";
        if (role === "user") endpoint = "/auth/me";
        else if (role === "admin") endpoint = "/admin/me";
        else if (role === "delivery") endpoint = "/delivery/me";
        else if (role === "superadmin") endpoint = "/superadmin/me"; // ✅ SuperAdmin endpoint

        if (!endpoint) return;

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (role === "user") setUser(res.data.user);
        else if (role === "admin") setAdmin(res.data.admin);
        else if (role === "delivery") setDeliveryBoy(res.data);
        else if (role === "superadmin") setSuperAdmin(res.data); // ✅ set superadmin data

      } catch (err) {
        console.error("Token validation failed:", err.message);
        logout(); // ❌ invalid token → force logout
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, role]);

  // ✅ Login (for user/admin/delivery/superadmin)
  const login = (tokenValue, userRole) => {
    setToken(tokenValue);
    setRole(userRole);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("role", userRole);
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
  };

  // ✅ Logout (clears all data)
  const logout = () => {
    setUser(null);
    setAdmin(null);
    setDeliveryBoy(null);
    setSuperAdmin(null); // ✅ clear superadmin
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    delete axios.defaults.headers.common["Authorization"];
  };

  // ✅ Sync logout across browser tabs
  useEffect(() => {
    const syncLogout = (e) => {
      if (e.key === "token" && !e.newValue) logout();
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        deliveryBoy,
        superAdmin, // ✅ provide superadmin
        token,
        role,
        loading,
        login,
        logout,
        setUser,
        setAdmin,
        setDeliveryBoy,
        setSuperAdmin, // ✅ allow manual update
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
