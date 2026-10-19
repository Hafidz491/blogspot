"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, Mail, Eye, EyeOff, Loader2, ArrowRight, AlertCircle, Database } from "lucide-react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/admin/setup");
        const data = await res.json();
        if (data.hasAdmin) {
          // If admin already exists, lock setup and redirect to login
          router.replace("/admin/login");
        } else {
          setHasAdmin(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    }
    checkSetup();
  }, [router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password minimal 6 karakter demi keamanan akun.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal membuat akun admin.");
        setSubmitting(false);
        return;
      }

      // Success -> navigate to admin dashboard
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal terhubung ke server.");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-800 text-white shadow-md mb-4">
            <ShieldCheck className="w-7 h-7 text-amber-200" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-stone-900 tracking-tight">
            Setup Admin Pertama
          </h1>
          <p className="text-xs md:text-sm text-stone-600 mt-1.5 leading-relaxed">
            Buat akun administrator utama Anda. Data akan dienkripsi dan disimpan langsung ke database Supabase Anda.
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Username Admin *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau nama Anda"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Email Input (Optional) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email (Opsional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Ulangi Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                  <span>Menyimpan ke Supabase...</span>
                </>
              ) : (
                <>
                  <span>Simpan Akun & Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Database Setup Notice */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-[11px] text-stone-500 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-stone-700">
              <Database className="w-3.5 h-3.5 text-amber-700" />
              <span>Koneksi Database Supabase</span>
            </div>
            <p className="leading-relaxed">
              Pastikan tabel telah dibuat dengan menjalankan file <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-800">supabase/schema.sql</code> di SQL Editor Supabase Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
