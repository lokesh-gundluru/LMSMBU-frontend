import { useEffect, useState } from "react";
import API from "../services/api";
import { 
  FaSignOutAlt, FaChalkboardTeacher, FaUsers, FaClipboardList, 
  FaComments, FaPlus 
} from "react-icons/fa";

export default function TeacherDashboard({ user, handleLogout }) {
  const [activeTab, setActiveTab] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });

  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", dueDate: "" });

  const [showSubmissions, setShowSubmissions] = useState(false);

  const [gradingStudent, setGradingStudent] = useState(null);
  const [gradeValue, setGradeValue] = useState("");

  // Fetch teacher courses with student count
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/courses?teacher=${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
        const coursesWithCount = await Promise.all(res.data.map(async course => {
          const studentsRes = await API.get(`/courses/${course._id}/students`, { headers: { Authorization: `Bearer ${token}` } });
          return { ...course, studentsCount: studentsRes.data.length };
        }));
        setCourses(coursesWithCount);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [user._id]);

  // View students for a course
  const handleViewStudents = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/courses/${courseId}/students`, { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data);
      setSelectedCourse(courses.find(c => c._id === courseId));
    } catch (err) {
      console.error(err);
    }
  };

  // View assignments for a course (with correct submissions count)
  const handleViewAssignments = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/assignments/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });

      const assignmentsWithCount = await Promise.all(
        res.data.map(async a => {
          const subsRes = await API.get(`/submissions/${a._id}`, { headers: { Authorization: `Bearer ${token}` } });
          return { ...a, submissionsCount: subsRes.data.length, submissions: subsRes.data };
        })
      );

      setAssignments(assignmentsWithCount);
      setSelectedCourse(courses.find(c => c._id === courseId));
    } catch (err) {
      console.error(err);
    }
  };

  // View submissions for an assignment
  const handleViewSubmissions = async (assignmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/submissions/${assignmentId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSubmissions(res.data);
      setSelectedAssignment(assignments.find(a => a._id === assignmentId));
      setShowSubmissions(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Grade a submission
  const handleGrade = async (submissionId) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`submissions/grade/${submissionId}`, { grade: gradeValue }, { headers: { Authorization: `Bearer ${token}` } });

      // Refresh submissions and assignments count
      await handleViewAssignments(selectedCourse._id);
      await handleViewSubmissions(selectedAssignment._id);

      setGradingStudent(null);
      setGradeValue("");
    } catch (err) {
      console.error(err);
      alert("Failed to grade submission");
    }
  };

  // Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(`/courses`, newCourse, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(prev => [...prev, res.data]);
      setNewCourse({ title: "", description: "" });
      setShowAddCourse(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Add new assignment
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(`/assignments/${selectedCourse._id}`, newAssignment, { headers: { Authorization: `Bearer ${token}` } });
      setAssignments(prev => [...prev, res.data]);
      setNewAssignment({ title: "", description: "", dueDate: "" });
      setShowAddAssignment(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 animate-fadeIn">
      {/* Profile Card */}
      <div className="flex items-center gap-4 bg-white shadow-lg rounded-full p-4">
        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-800">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="ml-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow transition">
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div onClick={() => setActiveTab("courses")} className="cursor-pointer bg-gradient-to-tr from-purple-100 via-pink-100 to-white p-4 rounded-2xl shadow text-center">
          <FaChalkboardTeacher className="text-3xl text-purple-500 mx-auto mb-1"/>
          <h3 className="font-semibold text-gray-700">My Courses</h3>
          <p className="text-gray-500 text-sm">{courses.length} active</p>
        </div>
        <div onClick={() => setActiveTab("assignments")} className="cursor-pointer bg-gradient-to-tr from-blue-100 via-cyan-100 to-white p-4 rounded-2xl shadow text-center">
          <FaClipboardList className="text-3xl text-blue-500 mx-auto mb-1"/>
          <h3 className="font-semibold text-gray-700">Assignments</h3>
          <p className="text-gray-500 text-sm">{assignments.length}</p>
        </div>
        <div className="bg-gradient-to-tr from-green-100 via-lime-100 to-white p-4 rounded-2xl shadow text-center">
          <FaUsers className="text-3xl text-green-500 mx-auto mb-1"/>
          <h3 className="font-semibold text-gray-700">Total Students</h3>
          <p className="text-gray-500 text-sm">{courses.reduce((total, course) => total + (course.studentsCount || 0), 0)} enrolled</p>
        </div>
        <div className="bg-gradient-to-tr from-yellow-100 via-orange-100 to-white p-4 rounded-2xl shadow text-center">
          <FaComments className="text-3xl text-yellow-500 mx-auto mb-1"/>
          <h3 className="font-semibold text-gray-700">Messages</h3>
          <p className="text-gray-500 text-sm">New</p>
        </div>
      </div>

      {/* Courses List */}
      {activeTab === "courses" && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-4">Courses</h2>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white">
              <thead className="bg-indigo-500 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Students</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{course.title}</td>
                    <td className="py-2 px-4 line-clamp-2">{course.description}</td>
                    <td className="py-2 px-4">{course.studentsCount || 0}</td>
                    <td className="py-2 px-4 text-center">
                      <button onClick={() => handleViewStudents(course._id)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">View Students</button>
                      <button onClick={() => handleViewAssignments(course._id)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm ml-2">View Assignments</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Assignments List */}
      {activeTab === "assignments" && selectedCourse && (
        <>
          <div className="flex justify-between items-center mt-6">
            <h2 className="text-xl font-bold">{selectedCourse.title} - Assignments</h2>
            <button onClick={() => setShowAddAssignment(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full">
              <FaPlus /> 
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg shadow mt-4">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Due Date</th>
                  <th className="py-2 px-4 text-left">Submissions</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{a.title}</td>
                    <td className="py-2 px-4 line-clamp-2">{a.description}</td>
                    <td className="py-2 px-4">{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{a.submissionsCount || 0}</td>
                    <td className="py-2 px-4 text-center">
                      <button onClick={() => handleViewSubmissions(a._id)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">View Submissions</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Submissions Modal */}
      {showSubmissions && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 shadow-2xl relative animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">{selectedAssignment.title} - Submissions</h2>
            <ul className="max-h-64 overflow-y-auto space-y-2">
              {submissions.length === 0 && <li className="text-gray-500">No submissions yet.</li>}
              {submissions.map(sub => (
                <li key={sub._id} className="py-2 px-4 border rounded-lg hover:bg-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{sub.student.name}</p>
                    <p className="text-gray-500 text-sm">{sub.student.email}</p>
                    <p className="text-sm text-gray-600">Grade: {sub.grade || "Not graded"}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => { setGradingStudent(sub); setGradeValue(sub.grade || ""); }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm ml-2 flex items-center"
                    >
                      Grade
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowSubmissions(false)} className="absolute top-3 right-3 text-red-500 font-bold hover:text-red-700">X</button>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingStudent && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-80">
            <h3 className="text-lg font-bold mb-3">Grade {gradingStudent.student.name}</h3>
            <input
              type="text"
              value={gradeValue}
              onChange={e => setGradeValue(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setGradingStudent(null)} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={() => handleGrade(gradingStudent._id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course and Add Assignment Modals */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 shadow-2xl relative animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Add New Course</h2>
            <form onSubmit={handleAddCourse} className="flex flex-col gap-4">
              <input type="text" placeholder="Course Title" value={newCourse.title} 
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} 
                className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required
              />
              <textarea placeholder="Course Description" value={newCourse.description} 
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} 
                className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" rows={4} required
              />
              <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-indigo-700 transition">
                Add Course
              </button>
            </form>
            <button onClick={() => setShowAddCourse(false)} className="absolute top-3 right-3 text-red-500 font-bold hover:text-red-700">X</button>
          </div>
        </div>
      )}

      {showAddAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 max-w-lg p-6 shadow-2xl relative animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Add New Assignment</h2>
            <form onSubmit={handleAddAssignment} className="flex flex-col gap-4">
              <input type="text" placeholder="Assignment Title" value={newAssignment.title} 
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} 
                className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required
              />
              <textarea placeholder="Assignment Description" value={newAssignment.description} 
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} 
                className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" rows={4} required
              />
              <input type="date" value={newAssignment.dueDate} 
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })} 
                className="border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required
              />
              <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-green-700 transition">
                Add Assignment
              </button>
            </form>
            <button onClick={() => setShowAddAssignment(false)} className="absolute top-3 right-3 text-red-500 font-bold hover:text-red-700">X</button>
          </div>
        </div>
      )}
    </div>
  );
}
