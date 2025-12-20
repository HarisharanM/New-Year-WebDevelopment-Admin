import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Main Admin components
import AdminDashboard from "./components/AdminDashboard";
import ScanPass from "./components/ScanPass";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

// Venue Admin components
import VenueLogin from "./venueAdmin/VenueLogin";
import VenueDashboard from "./venueAdmin/VenueDashboard";

// CSS
import "./index.css";

// Main Admin Protected Route
const ProtectedRoute = ({ element }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

// Venue Admin Protected Route
const VenueProtectedRoute = ({ element }) => {
  const venueAdmin = sessionStorage.getItem("venueAdmin");
  return venueAdmin ? element : <Navigate to="/venue-login" replace />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* ================= MAIN ADMIN ================= */}
        <Route path="/" element={<Login />} />
        <Route
          path="/Dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/AdminDashboard"
          element={<ProtectedRoute element={<AdminDashboard />} />}
        />
        <Route
          path="/ScanPass"
          element={<ProtectedRoute element={<ScanPass />} />}
        />

        {/* ================= VENUE ADMIN ================= */}
        <Route path="/venue-login" element={<VenueLogin />} />
        <Route
          path="/venue-dashboard"
          element={<VenueProtectedRoute element={<VenueDashboard />} />}
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
