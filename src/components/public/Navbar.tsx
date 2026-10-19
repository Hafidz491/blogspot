"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/blogs" className="flex items-center gap-2 group">
          <span className="font-heading text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition">
            Kindsight
          </span>
        </Link>

        {/* Center / Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link
            href="/blogs"
            className="text-stone-900 font-semibold hover:text-amber-800 transition"
          >
            Blog
          </Link>
          <a
            href="#newsletter"
            className="hover:text-stone-900 transition"
          >
            Resources
          </a>
          <a
            href="#newsletter"
            className="hover:text-stone-900 transition"
          >
            About Us
          </a>
        </nav>

        {/* Right CTA / Search link or aesthetic button (NO admin button for public) */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#newsletter"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-stone-50 text-xs font-semibold hover:bg-stone-800 transition shadow-xs"
          >
            <span>Subscribe</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-200/60 transition"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-6 py-6 space-y-4 animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-3 text-sm font-medium text-stone-700">
            <Link
              href="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-stone-900 font-semibold"
            >
              Blog
            </Link>
            <a
              href="#newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-900"
            >
              Resources
            </a>
            <a
              href="#newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-stone-900"
            >
              About Us
            </a>
          </div>
          <div className="pt-2 border-t border-stone-100">
            <a
              href="#newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold"
            >
              <span>Subscribe to Newsletter</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
