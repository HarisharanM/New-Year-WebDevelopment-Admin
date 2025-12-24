// Simple venue-based auth (demo-level)

export const VENUE_ADMINS = {
  BHOPAL: {
    username: "bhopal_admin",
    password: "bhopal@123",
    venueId: "bhopal",
  },
  MUMBAI: {
    username: "mumbai_admin",
    password: "mumbai@123",
    venueId: "mumbai",
  },
};

export function venueLogin(username, password) {
  const venue = Object.values(VENUE_ADMINS).find(
    (v) => v.username === username && v.password === password
  );

  if (!venue) return null;

  sessionStorage.setItem("venueAdmin", JSON.stringify(venue));
  return venue;
}

export function getVenueAdmin() {
  const data = sessionStorage.getItem("venueAdmin");
  return data ? JSON.parse(data) : null;
}

export function venueLogout() {
  sessionStorage.removeItem("venueAdmin");
}
