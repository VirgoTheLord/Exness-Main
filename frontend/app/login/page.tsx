"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useReducer, useState } from "react";

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await axios.post("http://localhost:5000/user/login", {
      email,
      password,
    });
    localStorage.setItem("token", response.data.token);
    router.push("/hero");
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1>Login</h1>
      <form action="submit" onSubmit={handleLogin}>
        <div className="flex flex-col">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
          />
          <button>Login</button>
        </div>
      </form>
    </div>
  );
};

export default page;
