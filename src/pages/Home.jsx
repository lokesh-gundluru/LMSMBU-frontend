import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 bg-white shadow-md">
        <h1 className="text-2xl font-extrabold text-blue-700">MBU LMS</h1>
        <div className="space-x-6">
          <Link to="/login" className="text-gray-700 hover:text-blue-700 font-medium">Login</Link>
          <Link to="/signup" className="text-gray-700 hover:text-blue-700 font-medium">Signup</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center px-6 py-12 animate-fadeIn">
        <h2 className="text-5xl font-extrabold text-blue-700 mb-4">
          <Learn>Learn</Learn> Smarter with MBU LMS 🎓
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          A modern Learning Management System designed for MBU students and faculty.  
          Manage courses, submit assignments, track progress, and collaborate efficiently — all in one place.
        </p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            to="/signup"
            className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-900 transition"
          >
            Create Account
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="px-8 py-12 bg-blue-50">
        <h3 className="text-3xl font-bold text-center text-blue-800 mb-10">
          Why Choose MBU LMS?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h4 className="text-xl font-semibold text-blue-700 mb-2">📘 Easy Course Management</h4>
            <p className="text-gray-600">Create, organize, and access courses effortlessly with an intuitive interface for both students and instructors.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h4 className="text-xl font-semibold text-blue-700 mb-2">💬 Real-time Communication</h4>
            <p className="text-gray-600">Chat, discuss, and share resources with classmates and faculty using the built-in communication tools.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <h4 className="text-xl font-semibold text-blue-700 mb-2">📊 Progress Tracking</h4>
            <p className="text-gray-600">Stay updated with analytics and performance dashboards for assignments, quizzes, and attendance.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-white border-t mt-10">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} MBU LMS. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
