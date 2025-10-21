import { useEffect, useState } from "react";
import API from "../services/api";
import { 
  FaSignOutAlt, FaBook, FaClipboardList, FaComments, FaBell, FaFileUpload ,FaUserCheck, FaUserTimes
} from "react-icons/fa";

export default function StudentDashboard({ user, handleLogout }) {
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("courses"); // courses / assignments / messages / notifications

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  // Fetch all data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Courses
      const allCoursesRes = await API.get("/courses", { headers: { Authorization: `Bearer ${token}` } });
      setAllCourses(allCoursesRes.data);

      // Enrollments
      const enrolledRes = await API.get("/enrollments/me", { headers: { Authorization: `Bearer ${token}` } });
      const enrolledIds = enrolledRes.data.map(e => e.course._id);
      setEnrolledCourseIds(enrolledIds);

      // Assignments for enrolled courses
      const assignmentsRes = await Promise.all(
        enrolledIds.map(id => API.get(`/assignments/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
      );
      const allAssignments = assignmentsRes.flatMap(r => r.data).map(a => ({
        ...a,
        submissions: a.submissions || []
      }));
      setAssignments(allAssignments);

      // Messages & Notifications
      const [messagesRes, notificationsRes] = await Promise.all([
        API.get(`/messages/${user._id}`, { headers: { Authorization: `Bearer ${token}` } }),
        API.get(`/notifications/${user._id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMessages(messagesRes.data);
      setNotifications(notificationsRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user._id]);

  // Helper: get submission by current student
  const getSubmission = (assignment) => {
    return assignment.submissions?.find(s => s.student?._id === user._id) || null;
  };

  // Enroll in a course
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/enrollments/${courseId}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEnrolledCourseIds(prev => [...prev, courseId]);
    } catch (err) {
      console.error(err);
    }
  };

  // Unenroll from a course
  const handleUnenroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/enrollments/${courseId}/unenroll`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEnrolledCourseIds(prev => prev.filter(id => id !== courseId));
    } catch (err) {
      console.error(err);
    }
  };

  // Pending assignments
  const pendingAssignments = assignments.filter(a => !getSubmission(a));

  // Upcoming deadlines (within 3 days)
  const upcomingAssignments = assignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const now = new Date();
    const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 3 && !getSubmission(a);
  });

  // Merge notifications + upcoming deadlines
  const dashboardNotifications = [
    ...notifications,
    ...upcomingAssignments.map(a => ({
      _id: a._id,
      title: "Upcoming Assignment",
      message: `Your assignment "${a.title}" is due on ${new Date(a.dueDate).toLocaleDateString()}`,
      type: "deadline"
    }))
  ];

  // Send email notifications for new alerts
  useEffect(() => {
    const sendEmails = async () => {
      if (!dashboardNotifications.length) return;
      try {
        const token = localStorage.getItem("token");
        await API.post("/notifications/send-email", {
          studentId: user._id,
          studentEmail: user.email
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error("Email send error:", err);
      }
    };
    sendEmails();
  }, [dashboardNotifications]);

  // Submit assignment
  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (text) formData.append("text", text);

      await API.post(`/submissions/${selectedAssignment._id}/submit`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      // Refresh assignments to update status & grades
      const assignmentsRes = await Promise.all(
        enrolledCourseIds.map(id => API.get(`/assignments/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
      );
      const allAssignments = assignmentsRes.flatMap(r => r.data).map(a => ({
        ...a,
        submissions: a.submissions || []
      }));
      setAssignments(allAssignments);

      // Clear modal state
      setFile(null);
      setText("");
      setSelectedAssignment(null);

    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 animate-fadeIn">
      {/* Profile Card */}
      <br />
      <div className="bg-white shadow-md rounded-3xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow transition">
          <FaSignOutAlt />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div onClick={() => setActiveTab("courses")} className="cursor-pointer bg-gradient-to-tr from-purple-100 via-pink-100 to-white p-4 rounded-2xl shadow text-center">
          <FaBook className="text-purple-500 text-2xl mb-1 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">My Courses</p>
          <p className="text-xs text-gray-500">{enrolledCourseIds.length} enrolled</p>
        </div>
        <div onClick={() => setActiveTab("assignments")} className="cursor-pointer bg-gradient-to-tr from-blue-100 via-cyan-100 to-white p-4 rounded-2xl shadow text-center">
          <FaClipboardList className="text-blue-500 text-2xl mb-1 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Assignments</p>
          <p className="text-xs text-gray-500">{pendingAssignments.length} pending</p>
        </div>
        <div onClick={() => setActiveTab("messages")} className="cursor-pointer bg-gradient-to-tr from-green-100 via-lime-100 to-white p-4 rounded-2xl shadow text-center">
          <FaComments className="text-green-500 text-2xl mb-1 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Messages</p>
          <p className="text-xs text-gray-500">{messages.length} new</p>
        </div>
        <div onClick={() => setActiveTab("notifications")} className="cursor-pointer bg-gradient-to-tr from-yellow-100 via-orange-100 to-white p-4 rounded-2xl shadow text-center">
          <FaBell className="text-yellow-500 text-2xl mb-1 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Notifications</p>
          <p className="text-xs text-gray-500">{dashboardNotifications.length} new</p>
        </div>
      </div>

      {/* Courses List */}
      {activeTab === "courses" && (
        <>
        <h2 className="text-xl font-bold mt-8 mb-4">Courses</h2>
        <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-indigo-500 text-white text-left">
            <tr>
              <th className="py-2 px-4">Course</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {allCourses.map(course => {
              const enrolled = enrolledCourseIds.includes(course._id);
              return (
                <tr key={course._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 font-medium">{course.title}</td>
                  <td className="py-2 px-4 text-gray-500">{course.description}</td>
                  <td className="py-2 px-4">
                    {enrolled ? <span className="text-green-600 font-semibold flex items-center gap-1"><FaUserCheck /> Enrolled</span>
                             : <span className="text-red-600 font-semibold flex items-center gap-1"><FaUserTimes /> Not Enrolled</span>}
                  </td>
                  <td className="py-2 px-4">
                    {enrolled 
                      ? <button onClick={() => handleUnenroll(course._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Unenroll</button>
                      : <button onClick={() => handleEnroll(course._id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition">Enroll</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
      )}

      {/* Assignments List */}
      {activeTab === "assignments" && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mt-8 mb-4">Assignments</h2>
          {enrolledCourseIds.map(courseId => {
            const course = allCourses.find(c => c._id === courseId);
            const courseAssignments = assignments.filter(a => a.course === courseId);

            if (!courseAssignments.length) return null;

            return (
              <div key={courseId} className="mb-4">
                <h3 className="font-semibold text-indigo-600 mb-2">{course?.title}</h3>
                <ul className="space-y-2">
                  {courseAssignments.map(a => {
                    const submission = getSubmission(a);
                    return (
                      <li
                        key={a._id}
                        className="border p-3 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => setSelectedAssignment(a)}
                      >
                        <div>
                          <p className="font-semibold">{a.title}</p>
                          <p className="text-gray-500 text-sm">{a.description}</p>
                          <p className="text-gray-400 text-xs">Due: {new Date(a.dueDate).toLocaleDateString()}</p>

                          {submission
                            ? <>
                                <p className="text-green-600 text-xs mt-1">Submitted</p>
                                <p className="text-gray-800 text-xs mt-1">
                                  Grade: {submission.grade ?? "Not graded"}
                                </p>
                              </>
                            : <p className="text-red-600 text-xs mt-1">Pending</p>
                          }
                        </div>
                        <FaFileUpload className="text-blue-500 text-xl" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Notifications List */}
      {activeTab === "messages" && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mt-8 mb-4">Messages</h2>
          <ul className="space-y-2">
            {dashboardNotifications.map(notif => (
              <li key={notif._id} className={`border p-3 rounded-lg ${notif.type === "deadline" ? "bg-red-50" : "bg-white"}`}>
                <p className="font-semibold">{notif.title}</p>
                <p className="text-gray-500 text-sm">{notif.message}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Notifications List */}
      {activeTab === "notifications" && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mt-8 mb-4">Notifications & Alerts</h2>
          <ul className="space-y-2">
            {dashboardNotifications.map(notif => (
              <li key={notif._id} className={`border p-3 rounded-lg ${notif.type === "deadline" ? "bg-red-50" : "bg-white"}`}>
                <p className="font-semibold">{notif.title}</p>
                <p className="text-gray-500 text-sm">{notif.message}</p>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 shadow-2xl relative">
            <h2 className="text-2xl font-bold mb-4">Submit Assignment: {selectedAssignment.title}</h2>
            <textarea
              placeholder="Write your text here..."
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full border p-3 rounded-xl resize-none mb-3"
              rows={4}
            />
            <input type="file" onChange={e => setFile(e.target.files[0])} className="mb-3"/>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitAssignment}
                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center"
              >
                <FaFileUpload className="inline mr-2"/> Submit
              </button>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
