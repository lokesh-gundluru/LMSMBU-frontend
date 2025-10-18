import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to fetch user data");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        {message || "Loading user data..."}
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 text-center">
        <h2 className="text-2xl font-semibold mb-3">
          Welcome, {user.name || "User"} 👋
        </h2>
        <p className="text-gray-600 mb-6">{user.email}</p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => (window.location.href = "/profile")}
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
          >
            Profile
          </button>
          <button
            onClick={() => (window.location.href = "/chat")}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            Chat
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
