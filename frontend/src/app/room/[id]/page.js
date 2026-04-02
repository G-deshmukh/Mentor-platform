"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";

import EditorPanel from "@/components/EditorPanel";
import ChatPanel from "@/components/ChatPanel";
import VideoPanel from "@/components/VideoPanel";
  
export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.id;
  const role = searchParams.get("role") || "student";

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

    socket.on("connect", () => {
      socket.emit("join_room", { roomId, role });
      setIsConnected(true);

      socket.on("cursor-update", ({ x, y, userId }) => {
        setCursors((prev) => ({ ...prev, [userId]: { x, y } }));
      });

      socket.on("cursor-remove", (id) => {
        setCursors((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      });
    });

    socketRef.current = socket;

    let timeout;
    const handleMouseMove = (e) => {
      if (timeout) return;
      timeout = setTimeout(() => {
        socket.emit("cursor-move", {
          roomId,
          x: e.clientX,
          y: e.clientY,
        });
        timeout = null;
      }, 50);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socket.disconnect();
    };
  }, [loading, roomId, role]);

  if (loading) return <p className="p-5">Checking auth...</p>;
  if (!isConnected) return <p className="p-5">Connecting...</p>;

  return (
    <>
      <div className="h-screen flex p-1">
        <EditorPanel roomId={roomId} />
        <div className="w-1/2 flex flex-col">
          <ChatPanel socket={socketRef} roomId={roomId} role={role} />
          <VideoPanel socket={socketRef} roomId={roomId} role={role} />
        </div>
      </div>

      {Object.entries(cursors).map(([id, cursor]) => (
        <div
          key={id}
          className="fixed z-50 pointer-events-none flex items-start"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <div className="flex flex-col items-center">
            <span className="text-xl">|</span>
          </div>
        </div>
      ))}
    </>
  );
}
