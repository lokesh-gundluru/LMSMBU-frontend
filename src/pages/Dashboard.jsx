import { useEffect, useState } from "react";
import API from "../services/api";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

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
        const res = await API.get("/auth/me", { headers: { Authorization: `Bearer ${token}` }});
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

  if (!user) return <div className="flex items-center justify-center min-h-screen text-lg bg-gradient-to-br from-purple-50 via-blue-50 to-white">{message || "Loading user data..."}</div>;

  return user.role === "student" ? <StudentDashboard user={user} handleLogout={handleLogout} /> : <TeacherDashboard user={user} handleLogout={handleLogout} />;
}
