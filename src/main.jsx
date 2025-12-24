import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ================= MAIN ADMIN =================
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ScanPass from "./components/ScanPass";

// ================= VENUE ADMIN =================
import VenueLogin from "./venueAdmin/VenueLogin";
import VenueDashboard from "./venueAdmin/VenueDashboard";
import VenueScanPass from "./components/ScanPass";

// ================= CSS =================
import "./index.css";

// ================= PROTECTED ROUTES =================

// Main Admin
const ProtectedRoute = ({ element }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  return isLoggedIn ? element : <Navigate to="/" replace />;
};

// Venue Admin
const VenueProtectedRoute = ({ element }) => {
  const venueAdmin = sessionStorage.getItem("venueAdmin");
  return venueAdmin ? element : <Navigate to="/venue-login" replace />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* ================= MAIN ADMIN ROUTES ================= */}
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

        {/* ================= VENUE ADMIN ROUTES ================= */}
        <Route path="/venue-login" element={<VenueLogin />} />

        <Route
          path="/venue-dashboard"
          element={<VenueProtectedRoute element={<VenueDashboard />} />}
        />

        <Route
          path="/venue-scan"
          element={
            <VenueProtectedRoute element={<VenueScanPass mode="venue" />} />
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
