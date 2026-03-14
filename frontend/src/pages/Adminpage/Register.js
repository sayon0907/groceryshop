import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import logo from "../../assets/FRAMZONE Logo Design.png";

/* Fix Leaflet marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/* Smooth map update */
function MapUpdater({ location }) {
  const map = useMap();
  useEffect(() => {
    map.setView(location, map.getZoom(), { animate: true });
  }, [location, map]);
  return null;
}

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");
  const [location, setLocation] = useState({
    lat: 28.6139,
    lng: 77.209,
  });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userTypedPIN, setUserTypedPIN] = useState(false);

  const navigate = useNavigate();
  const pinRef = useRef("");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!userTypedPIN || pincode.length < 3) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json`
        );
        if (res.data?.length) {
          setLocation({
            lat: parseFloat(res.data[0].lat),
            lng: parseFloat(res.data[0].lon),
          });
        }
      } catch (err) {
        console.error("PIN lookup failed");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [pincode, userTypedPIN]);

  const updatePincodeFromLocation = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (res.data?.address?.postcode) {
        pinRef.current = res.data.address.postcode;
        setPincode(res.data.address.postcode);
        setUserTypedPIN(false);
      }
    } catch {}
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        await updatePincodeFromLocation(latitude, longitude);
        setLoadingLocation(false);
      },
      () => setLoadingLocation(false),
      { enableHighAccuracy: true }
    );
  };

  /* ✅ UPDATED REGISTER FUNCTION */
  const handleRegister = async () => {
    if (!name || !phone || !password) {
      setError("Name, phone, and password are required.");
      return;
    }

    try {
      const res = await axios.post(
        "https://groceryshop-d27s.onrender.com/api/admin/register/send-otp",
        { name, phone, password, location },
        { withCredentials: true }
      );

      if (res.data.success) {
        localStorage.setItem("name", name);
        localStorage.setItem("phone", phone);
        localStorage.setItem("password", password);
        localStorage.setItem("lat", location.lat);
        localStorage.setItem("lng", location.lng);
        localStorage.setItem("pincode", pincode);

        /* ✅ SUCCESS ALERT */
        alert(
          "The confirmation code has been sent to the website owner's account, and a one-time password (OTP) has been sent to your mobile number."
        );

        navigate("/admin/verify-register");
      } else {
        setError(res.data.message || "OTP failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error");
    }
  };

  if (loadingLocation) {
    return <p style={{ textAlign: "center" }}>Detecting location...</p>;
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={logo} alt="logo" style={{ width: 160 }} />
        </div>

        <h3 style={{ textAlign: "center", marginBottom: 20 }}>
          Register
        </h3>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <div className="register-layout">
          <div className="form-section">
            <input
              placeholder="Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="PIN Code"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                setUserTypedPIN(true);
              }}
              style={inputStyle}
            />

            <button onClick={handleRegister} style={buttonStyle}>
              SEND OTP
            </button>

            <button
              onClick={getCurrentLocation}
              style={locationBtn}
            >
              📍 Use Current Location
            </button>

            <p style={{ fontSize: 13, marginTop: 10 }}>
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)} | PIN:{" "}
              {pincode || "Detecting"}
            </p>
          </div>

          <div className="map-section">
            <MapContainer
              center={location}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <MapUpdater location={location} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={location}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const pos = e.target.getLatLng();
                    setLocation({ lat: pos.lat, lng: pos.lng });
                    updatePincodeFromLocation(pos.lat, pos.lng);
                  },
                }}
              >
                <Popup>Drag to change location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      <style>
        {`
          .register-layout {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          @media (min-width: 1024px) {
            .register-layout {
              flex-direction: row;
            }
            .form-section {
              width: 45%;
            }
            .map-section {
              width: 55%;
              height: 420px;
            }
          }

          .map-section {
            height: 300px;
          }
        `}
      </style>
    </div>
  );
}

/* ---------- styles ---------- */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #b8c6db, #f5c6ec)",
};

const cardStyle = {
  width: "95%",
  maxWidth: "900px",
  background: "#fff",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 5px",
  marginBottom: "15px",
  border: "none",
  borderBottom: "1px solid #ccc",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#243c8f",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold",
  cursor: "pointer",
};

const locationBtn = {
  width: "100%",
  marginTop: "10px",
  padding: "8px",
  border: "1px solid #ccc",
  background: "#f9f9f9",
  cursor: "pointer",
};