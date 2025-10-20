import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({ name: "Guest" });

  useEffect(() => {
    // Load user info from JWT
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ name: decoded.name || decoded.email || "User" });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }

    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        user: user.name,
        message,
      };
      socket.emit("chatMessage", msgData);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white p-4">
      <div className="bg-white shadow-xl rounded-3xl w-full max-w-md mt-10 p-6 flex flex-col animate-fadeIn">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          LMS Global Chat
        </h2>

        {/* Chat Messages */}
        <div className="flex-1 border rounded-2xl bg-gray-50 p-4 overflow-y-auto mb-4 h-80 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl max-w-xs break-words ${
                msg.user === user.name
                  ? "bg-indigo-500 text-white self-end"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              <span className="font-semibold">{msg.user}:</span> {msg.message}
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 p-3 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 rounded-2xl shadow-lg font-semibold transition transform hover:scale-105"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
