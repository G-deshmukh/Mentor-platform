"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );

      const data = await res.json();

      console.log("RESPONSE:", res.status, data);

      if (res.status === 201) {
        alert("User Registered");
        router.push("/login");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-87.5 border border-gray-700 flex flex-col gap-4"
        >
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
          <p className="text-gray-400 text-center text-sm mb-2">
            Join the platform
          </p>

          <input
            placeholder="Name"
            className="p-3 rounded-lg bg-gray-800 border border-gray-600"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Email"
            className="p-3 rounded-lg bg-gray-800 border border-gray-600"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="p-3 rounded-lg bg-gray-800 border border-gray-600 w-full"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <span
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
            >
              {showPass ? "🙈" : "👁️"}
            </span>
          </div>

          {/* ROLE */}
          <select
            className="p-3 rounded-lg bg-gray-800 border border-gray-600"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>

          <button className="bg-green-600 hover:bg-green-700 border rounded-lg p-3">
            Register
          </button>

          <p className="text-gray-400 text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-green-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
