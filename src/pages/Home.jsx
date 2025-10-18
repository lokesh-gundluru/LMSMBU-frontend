import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Welcome to MBU LMS 📚</h1>
      <div className="flex space-x-4">
        <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Login</Link>
        <Link to="/signup" className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800">Signup</Link>
      </div>
    </div>
  );
}
