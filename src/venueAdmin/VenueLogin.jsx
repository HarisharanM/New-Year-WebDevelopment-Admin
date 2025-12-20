import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { venueLogin } from "./venueAuth";

export default function VenueLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    const venue = venueLogin(username, password);

    if (!venue) {
      setError("Invalid credentials");
      return;
    }

    navigate("/venue-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Venue Admin Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          name="username"
          placeholder="Username"
          className="w-full border p-2 mb-4"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-6"
          required
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
