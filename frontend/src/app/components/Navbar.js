"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur-md text-white border-b border-gray-700 shadow-md">
      {/* LOGO / TITLE */}
      <h2
        className="text-xl font-bold text-blue-500"
      >
        Mentor Platform
      </h2>

      {/* RIGHT SIDE */}
      <div className="flex gap-3 items-center">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-green-600 hover:bg-green-700 "
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 "
            >
              Register
            </button>
          </>
        ) : (
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
