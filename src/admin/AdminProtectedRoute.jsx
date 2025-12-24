import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const venueAdmin = sessionStorage.getItem("venueAdmin");

  // ❌ Venue admin must not access main admin
  if (venueAdmin) {
    return <Navigate to="/venue-dashboard" replace />;
  }

  // ❌ Not logged in
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return children;
}