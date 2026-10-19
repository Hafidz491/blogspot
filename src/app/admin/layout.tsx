"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, PlusCircle, ExternalLink, LogOut, Loader2, User } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login or setup page, render clean layout without admin topbar
  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Admin Badge */}
          <div className="flex items-center gap-4">
            <Link href="/admin/posts" className="flex items-center gap-2.5 group">
              <span className="font-heading text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-amber-800 transition">
                The Kindsight
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-stone-900 text-stone-100 rounded-md">
                Admin
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden sm:flex items-center gap-1 ml-6 border-l border-stone-200 pl-6 text-xs font-semibold text-stone-600">
              <Link
                href="/admin/posts"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === "/admin/posts"
                    ? "bg-stone-100 text-stone-900"
                    : "hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>Semua Artikel</span>
              </Link>
              <Link
                href="/admin/posts/create"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === "/admin/posts/create"
                    ? "bg-amber-50 text-amber-900 font-bold"
                    : "hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Tulis Artikel Baru</span>
              </Link>
            </nav>
          </div>

          {/* Right Controls: User info, Public preview & Logout */}
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-mono">
              <User className="w-3 h-3 text-stone-500" />
              <span>Administrator</span>
            </div>

            <Link
              href="/blogs"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
            >
              <span>Lihat Web Publik</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition border border-red-200/60"
              title="Keluar dari Admin Dashboard"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        The Kindsight Blog Admin Dashboard • Secured with Admin Auth
      </footer>
    </div>
  );
}
