"use client";

import { useState, useEffect } from "react";

export default function ChatPanel({ socket, roomId, role }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!socket.current) return;

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.current.on("receive_message", handleMessage);

    return () => {
      socket.current.off("receive_message", handleMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.current.emit("send_message", {
      roomId,
      message: message,
      role,
    });

    setMessage("");
  };

  return (
    <div className="h-1/2 bg-gray-200 p-3 flex flex-col">
      <h2 className="font-semibold mb-2 text-black">Chat</h2>

      <div className="flex-1 bg-white rounded p-2 overflow-y-auto text-black">
        {messages.map((msg, i) => (
          <p
            key={i}
            className={`p-1 my-1 ${
              msg.senderRole === "mentor" ? "text-left" : "text-right"
            }`}
          >
            {msg.text}
          </p>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 border p-2 rounded text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
