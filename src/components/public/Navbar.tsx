"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar({ brandName = "Blog's" }: { brandName?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-40 border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/blogs" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt={brandName}
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition">
            {brandName}
          </span>
        </Link>

        {/* Center / Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-stone-600">
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

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
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
          {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-b border-stone-200 px-5 sm:px-6 py-5 space-y-4 animate-in slide-in-from-top-3 shadow-md">
          <div className="flex flex-col gap-2.5 text-sm font-medium text-stone-700">
            <Link
              href="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-stone-900 font-bold"
            >
              Blog
            </Link>
            <a
              href="#newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-stone-900"
            >
              Resources
            </a>
            <a
              href="#newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-stone-900"
            >
              About Us
            </a>
          </div>
          <div className="pt-2 border-t border-stone-100">
            <a
              href="#newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black transition"
            >
              <span>Subscribe to Newsletter</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
