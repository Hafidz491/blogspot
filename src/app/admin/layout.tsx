"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  PlusCircle,
  Sliders,
  ExternalLink,
  LogOut,
  Loader2,
  User,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import AdminInactivityTracker from "@/components/admin/AdminInactivityTracker";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login or setup page, render clean layout without admin topbar
  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_last_activity_timestamp");
      }
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
      {/* AFK / Inactivity Timeout Tracker (2 Hours) */}
      <AdminInactivityTracker />

      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Admin Badge */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin/posts" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Blog's Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-amber-800 transition">
                Blog&apos;s
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-stone-900 text-stone-100 rounded-md">
                Admin
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden sm:flex items-center gap-1 ml-4 md:ml-6 border-l border-stone-200 pl-4 md:pl-6 text-xs font-semibold text-stone-600">
              <Link
                href="/admin/posts"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === "/admin/posts"
                    ? "bg-stone-100 text-stone-900"
                    : "hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>All Posts</span>
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
                <span>New Post</span>
              </Link>
              <Link
                href="/admin/settings"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  pathname === "/admin/settings"
                    ? "bg-stone-100 text-stone-900 font-bold"
                    : "hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                <span>Site Settings</span>
              </Link>
              <Link
                href="/admin/settings?tab=security"
                className="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 hover:bg-stone-100 hover:text-stone-900"
                title="Change Administrator Password"
              >
                <KeyRound className="w-3.5 h-3.5 text-stone-500" />
                <span>Password</span>
              </Link>
            </nav>
          </div>

          {/* Right Controls: Desktop */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* User Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-mono">
              <User className="w-3 h-3 text-stone-500" />
              <span>Administrator</span>
            </div>

            <Link
              href="/blogs"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </Link>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition border border-red-200/60"
              title="Log out of Admin Dashboard"
            >
              {loggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Log Out</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition border border-stone-200/60"
            aria-label="Toggle Admin Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-2 animate-in slide-in-from-top-3 shadow-lg">
            <Link
              href="/admin/posts"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/admin/posts"
                  ? "bg-stone-900 text-white font-bold"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All Posts</span>
            </Link>
            <Link
              href="/admin/posts/create"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/admin/posts/create"
                  ? "bg-amber-100 text-amber-900 font-bold"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-700" />
              <span>Create New Post</span>
            </Link>
            <Link
              href="/admin/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === "/admin/settings"
                  ? "bg-stone-900 text-white font-bold"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Site Settings</span>
            </Link>
            <Link
              href="/admin/settings?tab=security"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              <KeyRound className="w-4 h-4 text-stone-600" />
              <span>Change Password</span>
            </Link>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <Link
                href="/blogs"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 py-2.5 px-3 rounded-xl transition"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 py-2.5 px-3.5 rounded-xl border border-red-200/80 transition"
              >
                {loggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        Blog&apos;s Admin Dashboard • Secured with Admin Auth
      </footer>
    </div>
  );
}
