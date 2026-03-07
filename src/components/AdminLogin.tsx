// ============================================================
// Admin login — credentials required for /admin
// ============================================================

import React, { useState } from "react";
import { P } from "./shared";
import { validateAdmin, setAdminSession } from "../auth/adminAuth";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      setLoading(false);
      return;
    }
    const ok = validateAdmin(username.trim(), password);
    setLoading(false);
    if (ok) {
      setAdminSession();
      onSuccess();
    } else {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4 font-game">
      <div className="bg-white rounded-3xl py-8 px-7 max-w-[360px] w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl">
            🔐
          </div>
          <h1 className="text-[22px] font-extrabold text-slate m-0">Admin Login</h1>
          <p className="text-slate-light mt-1.5 text-[13px]">Sign in to access the dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full py-3 px-3.5 rounded-xl border-2 border-gray-200 text-[15px] outline-none box-border font-game"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full py-3 px-3.5 rounded-xl border-2 border-gray-200 text-[15px] outline-none box-border font-game"
          />
          {error && (
            <div className="text-[13px] font-semibold text-red bg-red-light py-2 px-3 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 px-8 rounded-[20px] border-none text-white text-lg font-extrabold font-game cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 bg-gradient-to-br from-purple to-purple/80"
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
