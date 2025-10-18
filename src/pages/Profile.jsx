import { useState, useEffect } from "react";
import API from "../services/api";

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
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          My Profile
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <input
            name="name"
            type="text"
            value={user.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="border p-2 rounded-md"
          />
          <input
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded-md"
          />
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password (optional)"
            className="border p-2 rounded-md"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>

        {message && <p className="text-center mt-4 text-sm">{message}</p>}

        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="mt-4 w-full bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
