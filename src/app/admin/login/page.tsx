"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, UserPlus } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);

  useEffect(() => {
    async function checkAdminExists() {
      try {
        const res = await fetch("/api/admin/setup");
        const data = await res.json();
        if (data.hasAdmin === false) {
          setShowSetupPrompt(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    checkAdminExists();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid username or password.");
        setLoading(false);
        return;
      }

      // Success -> navigate to admin dashboard
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to connect to server. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12">
      {/* Decorative Background Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-amber-200/25 rounded-full blur-3xl -top-24" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md border border-stone-200/90 mb-4 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Blog's Logo"
              fill
              className="object-contain p-2.5"
              priority
            />
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-stone-900 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-xs md:text-sm text-stone-500 mt-1.5">
            Sign in to manage articles, publications, and site content
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200/90 shadow-sm">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* First Time Setup Helper (Only shown when 0 admin exists) */}
          {showSetupPrompt && (
            <div className="mt-5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-center text-xs">
              <p className="text-amber-900 font-medium">No admin account found in the database yet?</p>
              <Link
                href="/admin/setup"
                className="inline-flex items-center gap-1 font-bold text-amber-950 underline underline-offset-2 mt-1 hover:text-amber-800 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Set Up Your First Admin Account Here</span>
              </Link>
            </div>
          )}
        </div>

        {/* Back to Public Home */}
        <div className="text-center mt-6">
          <Link
            href="/blogs"
            className="text-xs font-medium text-stone-500 hover:text-stone-900 transition underline underline-offset-4"
          >
            ← Back to Blog Home
          </Link>
        </div>
      </div>
    </div>
  );
}
