import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ScanPass from "./components/ScanPass";

// Venue Admin
import VenueLogin from "./venueAdmin/VenueLogin";
import VenueDashboard from "./venueAdmin/VenueDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* MAIN COMPANY ADMIN */}
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/scan" element={<ScanPass />} />

        {/* VENUE ADMINS */}
        <Route path="/venue-login" element={<VenueLogin />} />
        <Route path="/venue-dashboard" element={<VenueDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
