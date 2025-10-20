import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Step 1: Register the user
      const res = await API.post("/auth/register", form);
      setMessage("✅ Account created successfully!");

      // Step 2: Automatically log the user in
      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if (loginRes.data.token) {
        localStorage.setItem("token", loginRes.data.token);
      }

      // Step 3: Redirect based on role
      setTimeout(() => {
        if (form.role === "teacher") {
          navigate("/dashboard"); // teacher dashboard handled automatically
        } else {
          navigate("/dashboard"); // student dashboard handled automatically
        }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              required
            />
          </div>

          <div className="relative">
            <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105"
            } text-white font-semibold p-3 rounded-xl shadow-lg transform transition duration-300`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-5 text-sm font-medium animate-fadeIn ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-500 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
