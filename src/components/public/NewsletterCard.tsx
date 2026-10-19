"use client";

import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/types/settings";

export default function NewsletterCard({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: Partial<SiteSettings>;
}) {
  const s = { ...DEFAULT_SITE_SETTINGS, ...settings };
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 3000);
    }
  };

  return (
    <div
      id="newsletter"
      className="bg-[#EBE5DC] rounded-2xl p-7 flex flex-col justify-between border border-[#DFD8CE] shadow-2xs"
    >
      <div>
        <div className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-amber-900 bg-amber-100/60 px-2.5 py-0.5 rounded-full mb-3">
          <Sparkles className="w-3 h-3 text-amber-700" />
          <span>{s.newsletterBadge}</span>
        </div>

        <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
          {s.newsletterTitle}
        </h3>

        <p className="mt-4 text-xs md:text-[13px] text-stone-700 leading-relaxed font-sans">
          {s.newsletterDescription}
        </p>
      </div>

      <div className="mt-6">
        {subscribed ? (
          <div className="bg-white/80 p-4 rounded-xl text-center border border-stone-300 animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-1.5">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-stone-900">
              Terima Kasih Telah Berlangganan!
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Cek inbox email Anda untuk konfirmasi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="newsletter-email"
                className="block text-[11px] font-bold text-stone-700 mb-1"
              >
                Business Email *
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.org"
                className="w-full bg-white rounded-lg px-3.5 py-2.5 text-xs text-stone-800 border border-stone-300/80 focus:outline-none focus:ring-2 focus:ring-stone-600 shadow-2xs font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-full bg-stone-900 text-white text-xs font-bold hover:bg-black transition duration-200 shadow-xs"
            >
              {s.newsletterButtonText}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
