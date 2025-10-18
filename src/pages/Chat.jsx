import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {jwtDecode} from "jwt-decode";

const socket = io("http://localhost:5000");

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
    <div className="flex flex-col items-center h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl w-96 mt-10 p-4 flex flex-col">
        <h2 className="text-xl font-semibold text-center mb-2">LMS Global Chat</h2>
        <div className="flex-1 border p-3 rounded-md overflow-y-auto mb-3 h-80">
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <span className="font-bold text-blue-600">{msg.user}: </span>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-1 border p-2 rounded-l-md"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
