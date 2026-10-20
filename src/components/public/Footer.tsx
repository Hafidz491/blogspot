import React from "react";
import Link from "next/link";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/types/settings";
import { Mail, ExternalLink } from "lucide-react";

export default function Footer({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: Partial<SiteSettings>;
}) {
  const s = { ...DEFAULT_SITE_SETTINGS, ...settings };

  return (
    <footer className="bg-[#FAF8F5] border-t border-stone-200/80 pt-10 sm:pt-16 pb-8 sm:pb-12 mt-12 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 pb-8 sm:pb-12 border-b border-stone-200">
          {/* Brand Info */}
          <div className="col-span-1 sm:col-span-2 space-y-3 sm:space-y-4">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {s.footerAboutTitle}
            </h3>
            <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
              {s.footerAboutDescription}
            </p>

            {s.contactEmail && (
              <div className="pt-2">
                <a
                  href={`mailto:${s.contactEmail}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{s.contactEmail}</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/blogs" className="hover:text-stone-900 transition font-medium">
                  All Articles
                </Link>
              </li>
              <li>
                <a href="#newsletter" className="hover:text-stone-900 transition">
                  Newsletter
                </a>
              </li>
              <li>
                <a href="#newsletter" className="hover:text-stone-900 transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Social Media
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              {s.socialTwitter && (
                <li>
                  <a
                    href={s.socialTwitter}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-stone-900 transition flex items-center gap-1.5"
                  >
                    <span>Twitter / X</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </li>
              )}
              {s.socialLinkedIn && (
                <li>
                  <a
                    href={s.socialLinkedIn}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-stone-900 transition flex items-center gap-1.5"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </li>
              )}
              {s.socialInstagram && (
                <li>
                  <a
                    href={s.socialInstagram}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-stone-900 transition flex items-center gap-1.5"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </li>
              )}
              {!s.socialTwitter && !s.socialLinkedIn && !s.socialInstagram && (
                <li className="text-xs text-stone-400">No social links added yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3 text-center sm:text-left">
          <p>{s.copyrightText}</p>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span>Built with Next.js App Router, Tailwind CSS & Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

