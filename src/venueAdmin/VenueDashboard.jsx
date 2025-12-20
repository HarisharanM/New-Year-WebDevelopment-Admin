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

    async function loadData() {
      const all = await getAllParticipants();
      const filtered = all.filter(
        (p) => p.venueId === admin.venueId
      );
      setParticipants(filtered);
    }

    loadData();
  }, []);

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {admin.venueId} Venue Dashboard
        <p className="text-sm text-gray-500">
            Logged in as Venue Admin
        </p>
        </h1>
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

      <table className="w-full bg-white border">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Mobile</th>
            <th className="p-2">Pass</th>
            <th className="p-2">People</th>
            <th className="p-2">Payment</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => (
            <tr key={i} className="border-t text-center">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.mobile}</td>
              <td className="p-2">{p.passType}</td>
              <td className="p-2">{p.numberOfPeople}</td>
              <td className="p-2">{p.paymentId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
