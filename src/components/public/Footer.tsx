import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FAF8F5] border-t border-stone-200/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-200">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-heading text-2xl font-bold text-stone-900 tracking-tight">
              The Kindsight Blog
            </h3>
            <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
              Curated perspectives on nonprofit growth, donor relationships, modern fundraising
              strategies, and philanthropic innovations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/blogs" className="hover:text-stone-900 transition font-medium">
                  Semua Artikel
                </Link>
              </li>
              <li>
                <a href="#newsletter" className="hover:text-stone-900 transition">
                  Berlangganan Newsletter
                </a>
              </li>
              <li>
                <a href="#newsletter" className="hover:text-stone-900 transition">
                  Tentang Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Topik Populer
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/blogs?category=Tips" className="hover:text-stone-900 transition">
                  Fundraising Tips
                </Link>
              </li>
              <li>
                <Link href="/blogs?category=Strategy" className="hover:text-stone-900 transition">
                  Donor Strategies
                </Link>
              </li>
              <li>
                <Link href="/blogs?category=Guide" className="hover:text-stone-900 transition">
                  Nonprofit Guides
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 The Kindsight Blog. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with Next.js App Router, Tailwind CSS & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
