"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
    } else {
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    }
  }, []);

  const createRoom = () => {
    if (user?.role !== "mentor") {
      alert("Only mentor can create room");
      return;
    }

    const roomId = prompt("Create Room ID (any...)");
    if(!roomId) {
      alert("Room id required....");
      return;
    }
    router.push(`/room/${roomId}?role=mentor`);
  };

  const joinRoom = () => {
    if (user?.role !== "student") {
      alert("Only student can join room");
      return;
    }

    const roomId = prompt("Enter Room ID:");

    if (!roomId) {
      alert("Room ID is required");
      return;
    }

    router.push(`/room/${roomId}?role=student`);
  };

  if (loading) return <div>Checking auth...</div>;

  return (
    <>
      <Navbar />
      <div className="h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center text-white">
        <div className="bg-gray-900/80 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-100 text-center border border-gray-700">
          {/* Title */}
          <h1 className="text-3xl font-bold mb-3">Mentor Platform</h1>

          <p className="text-gray-400 mb-8">
            Real-time coding + video + chat collaboration
          </p>
          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={createRoom}
              className="bg-blue-600 hover:bg-blue-700 p-3 border rounded-lg"
            >
              Create Room (Mentor)
            </button>

            <button
              onClick={joinRoom}
              className="bg-green-600 hover:bg-green-700 border rounded-lg p-3"
            >
              Join Room (Student)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
