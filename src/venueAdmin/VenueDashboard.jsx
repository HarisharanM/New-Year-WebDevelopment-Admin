import { useEffect, useState } from "react";
import { getVenueAdmin, venueLogout } from "./venueAuth";
import { getAllParticipants } from "../firebase/helpers/firestoreHelpers";
import { useNavigate } from "react-router-dom";

export default function VenueDashboard() {
  const navigate = useNavigate();
  const admin = getVenueAdmin();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!admin) {
      navigate("/venue-login");
      return;
    }

    async function load() {
      const all = await getAllParticipants();
      setParticipants(all.filter(p => p.venueId === admin.venueId));
    }

    load();
  }, []);

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {admin.venueId} Venue Dashboard
          <p className="text-sm text-gray-500">Venue Admin</p>
        </h1>

        <div className="space-x-2">
          <button
            onClick={() => navigate("/venue-scan")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Scan Pass
          </button>

          <button
            onClick={() => {
              venueLogout();
              navigate("/venue-login");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <table className="w-full bg-white border">
        <thead className="bg-black text-white">
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Pass</th>
            <th>People</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => (
            <tr key={i} className="border-t text-center">
              <td>{p.name}</td>
              <td>{p.mobile}</td>
              <td>{p.passType}</td>
              <td>{p.numberOfPeople}</td>
              <td>{p.isUsed ? "Entered" : "Pending"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
