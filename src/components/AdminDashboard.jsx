import React, { useEffect, useState } from "react";
import { getAllParticipants } from "../firebase/helpers/firestoreHelpers";
import { Link, useNavigate } from "react-router-dom";

// Venue labels for clarity
const VENUE_LABELS = {
  BHOPAL: "Bhopal Venue",
  MUMBAI: "Mumbai Venue",
};

export default function AdminDashboard() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Prevent venue admins from accessing main admin
  useEffect(() => {
    const venueAdmin = sessionStorage.getItem("venueAdmin");
    if (venueAdmin) {
      window.location.href = "/venue-dashboard";
    }
  }, []);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }
    fetchParticipants();
  }, [navigate]);

  const fetchParticipants = async () => {
    try {
      const data = await getAllParticipants();
      setParticipants(data);
    } catch (err) {
      console.error("Error fetching participants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#800000] text-white flex flex-col md:h-screen">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-3">
          <Link to="/Dashboard" className="block px-3 py-2 rounded hover:bg-[#a83232]">
            Dashboard
          </Link>
          <Link to="/AdminDashboard" className="block px-3 py-2 rounded bg-[#a83232]">
            Bookings
          </Link>
          <Link to="/ScanPass" className="block px-3 py-2 rounded hover:bg-[#a83232]">
            Scan Pass
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded hover:bg-[#a83232]"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
          <h1 className="text-2xl font-bold text-gray-700">
            Booking Submissions
          </h1>
        </header>

        <div className="p-6 overflow-x-auto flex-1">
          {loading ? (
            <p>Loading participants...</p>
          ) : participants.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-[#800000] text-white">
                <tr>
                  <th className="py-2 px-3 text-left">S.No</th>
                  <th className="py-2 px-3 text-left">Participant ID</th>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-left">Venue</th>
                  <th className="py-2 px-3 text-left">Pass Type</th>
                  <th className="py-2 px-3 text-left">Mobile</th>
                  <th className="py-2 px-3 text-left">People</th>
                  <th className="py-2 px-3 text-left">Entered</th>
                  <th className="py-2 px-3 text-left">Payment ID</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => (
                  <tr key={p.participantId} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{index + 1}</td>
                    <td className="py-2 px-3">{p.participantId}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3 font-semibold text-blue-600">
                      {VENUE_LABELS[p.venueId] || p.venueId || "N/A"}
                    </td>
                    <td className="py-2 px-3">{p.passType}</td>
                    <td className="py-2 px-3">{p.mobile}</td>
                    <td className="py-2 px-3">{p.numberOfPeople}</td>
                    <td className="py-2 px-3">{p.isUsed ? "Yes" : "No"}</td>
                    <td className="py-2 px-3">{p.paymentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
