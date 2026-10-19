"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Sparkles,
  Mail,
  Share2,
  Layers,
  Type,
  ExternalLink,
} from "lucide-react";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/types/settings";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"branding" | "hero" | "newsletter" | "footer">("hero");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal menyimpan pengaturan.");
      } else {
        setSuccessMessage("Pengaturan konten web berhasil disimpan dan diterapkan ke halaman publik!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal terhubung ke server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-stone-700 mb-3" />
        <p className="text-sm font-medium">Memuat pengaturan konten web...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full mb-2">
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>Kustomisasi Konten</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-stone-900 tracking-tight">
            Pengaturan Konten Web
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Ubah teks pada Hero Section, Footer, Newsletter, dan Branding yang tampil di web publik secara live.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blogs"
            target="_blank"
            className="cursor-pointer px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <span>Pratinjau Web Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
            ) : (
              <Save className="w-4 h-4 text-emerald-400" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs md:text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        {[
          { id: "hero", label: "Hero Section (/blogs)", icon: Sparkles },
          { id: "branding", label: "Branding & Navbar", icon: Type },
          { id: "newsletter", label: "Newsletter Card", icon: Mail },
          { id: "footer", label: "Footer & Kontak", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Hero Section */}
        {activeTab === "hero" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-heading font-bold text-stone-900">
                Hero Section (Tampilan Utama Blog)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Atur judul besar dan teks pembuka di bagian paling atas halaman utama `/blogs`.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Badge Tagline Hero
                </label>
                <input
                  type="text"
                  name="heroBadge"
                  value={settings.heroBadge}
                  onChange={handleChange}
                  placeholder="Contoh: Editorial & Insights"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Judul Utama Blog (Heading Besar)
                </label>
                <input
                  type="text"
                  name="heroTitle"
                  value={settings.heroTitle}
                  onChange={handleChange}
                  placeholder="Contoh: The Kindsight Blog"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-lg font-heading font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Deskripsi / Subjudul Hero
                </label>
                <textarea
                  rows={3}
                  name="heroDescription"
                  value={settings.heroDescription}
                  onChange={handleChange}
                  placeholder="Tuliskan deskripsi singkat tujuan blog Anda..."
                  className="w-full p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branding */}
        {activeTab === "branding" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-heading font-bold text-stone-900">
                Branding & Navigasi
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Atur nama logo dan identitas merek yang muncul di pojok kiri atas Navbar.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Nama Brand Logo (Navbar)
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={settings.brandName}
                  onChange={handleChange}
                  placeholder="Contoh: Kindsight"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-base font-heading font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Slogan / Tagline Brand
                </label>
                <input
                  type="text"
                  name="brandTagline"
                  value={settings.brandTagline}
                  onChange={handleChange}
                  placeholder="Contoh: Modern Insights & Resources"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Newsletter */}
        {activeTab === "newsletter" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-heading font-bold text-stone-900">
                VIP Newsletter Card
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Kustomisasi kartu penawaran newsletter berlatar warna tan yang tersemat di grid artikel.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Badge Newsletter
                </label>
                <input
                  type="text"
                  name="newsletterBadge"
                  value={settings.newsletterBadge}
                  onChange={handleChange}
                  placeholder="Contoh: VIP Newsletter"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Judul Penawaran Newsletter
                </label>
                <input
                  type="text"
                  name="newsletterTitle"
                  value={settings.newsletterTitle}
                  onChange={handleChange}
                  placeholder="Contoh: Be the first to read our resources."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-base font-heading font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Deskripsi / Nilai Manfaat Newsletter
                </label>
                <textarea
                  rows={3}
                  name="newsletterDescription"
                  value={settings.newsletterDescription}
                  onChange={handleChange}
                  placeholder="Jelaskan keuntungan mendaftar newsletter..."
                  className="w-full p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Teks Tombol Berlangganan
                </label>
                <input
                  type="text"
                  name="newsletterButtonText"
                  value={settings.newsletterButtonText}
                  onChange={handleChange}
                  placeholder="Contoh: Subscribe Now"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Footer */}
        {activeTab === "footer" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="text-lg font-heading font-bold text-stone-900">
                Footer, Kontak & Sosial Media
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Atur informasi tentang situs, kontak redaksi, hak cipta, dan link akun sosial media di footer.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Judul Kolom Tentang di Footer
                </label>
                <input
                  type="text"
                  name="footerAboutTitle"
                  value={settings.footerAboutTitle}
                  onChange={handleChange}
                  placeholder="Contoh: The Kindsight Blog"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Deskripsi Singkat di Footer
                </label>
                <textarea
                  rows={2}
                  name="footerAboutDescription"
                  value={settings.footerAboutDescription}
                  onChange={handleChange}
                  placeholder="Deskripsi singkat yang tampil di bagian bawah halaman..."
                  className="w-full p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Teks Hak Cipta (Copyright)
                </label>
                <input
                  type="text"
                  name="copyrightText"
                  value={settings.copyrightText}
                  onChange={handleChange}
                  placeholder="Contoh: © 2026 The Kindsight Blog. All rights reserved."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Email Kontak Redaksi
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    placeholder="editorial@domain.org"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Link X (Twitter)
                  </label>
                  <input
                    type="url"
                    name="socialTwitter"
                    value={settings.socialTwitter || ""}
                    onChange={handleChange}
                    placeholder="https://x.com/username"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Link LinkedIn
                  </label>
                  <input
                    type="url"
                    name="socialLinkedIn"
                    value={settings.socialLinkedIn || ""}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/username"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Link Instagram
                  </label>
                  <input
                    type="url"
                    name="socialInstagram"
                    value={settings.socialInstagram || ""}
                    onChange={handleChange}
                    placeholder="https://instagram.com/username"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer px-6 py-3 rounded-xl bg-stone-900 hover:bg-black text-white text-sm font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
            ) : (
              <Save className="w-4 h-4 text-emerald-400" />
            )}
            <span>Simpan Semua Pengaturan Konten</span>
          </button>
        </div>
      </form>
    </div>
  );
}
