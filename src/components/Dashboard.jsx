import React, { useEffect, useState } from "react";
import { getAllParticipants } from "../firebase/helpers/firestoreHelpers";
import { Link, useNavigate } from "react-router-dom";

const VENUE_LABELS = {
  BHOPAL: "Bhopal Venue",
  MUMBAI: "Mumbai Venue",
};

export default function Dashboard() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Prevent venue admins
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  const totalParticipants = participants.length;
  const totalAttending = participants.filter((p) => p.isUsed).length;
  const totalNonAttending = totalParticipants - totalAttending;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#800000] text-white flex flex-col md:h-screen">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-3">
          <Link to="/Dashboard" className="block px-3 py-2 rounded bg-[#a83232]">
            Dashboard
          </Link>
          <Link to="/AdminDashboard" className="block px-3 py-2 rounded hover:bg-[#a83232]">
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

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 bg-white shadow-md">
          <h1 className="text-2xl font-bold text-gray-700">Dashboard</h1>
        </header>

        {/* Summary */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow border-t-4 border-[#800000]">
            <p>Total Participants</p>
            <p className="text-3xl font-bold">{totalParticipants}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
            <p>Total Attending</p>
            <p className="text-3xl font-bold text-green-600">{totalAttending}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border-t-4 border-red-500">
            <p>Not Attending</p>
            <p className="text-3xl font-bold text-red-600">{totalNonAttending}</p>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto flex-1">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-[#800000] text-white">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Venue</th>
                  <th className="p-2 text-left">Pass</th>
                  <th className="p-2 text-left">People</th>
                  <th className="p-2 text-left">Payment</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 font-semibold text-blue-600">
                      {VENUE_LABELS[p.venueId] || p.venueId}
                    </td>
                    <td className="p-2">{p.passType}</td>
                    <td className="p-2">{p.numberOfPeople}</td>
                    <td className="p-2">{p.paymentId}</td>
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
