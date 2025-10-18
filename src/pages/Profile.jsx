import { useState, useEffect } from "react";
import API from "../services/api";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        setMessage("Failed to load profile data");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        "/auth/update",
        { ...user, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully!");
      setPassword("");
      console.log(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          My Profile
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="name"
              type="text"
              value={user.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              value={user.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password (optional)"
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold p-3 rounded-xl shadow-lg hover:scale-105 transform transition duration-300"
          >
            Save Changes
          </button>
        </form>

        {message && (
          <p className="text-center mt-5 text-sm text-indigo-600 font-medium animate-fadeIn">
            {message}
          </p>
        )}

        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="mt-6 w-full bg-gray-200 text-gray-800 p-3 rounded-xl hover:bg-gray-300 transition font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
