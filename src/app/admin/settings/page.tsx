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
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { SiteSettings, DEFAULT_SITE_SETTINGS } from "@/types/settings";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"branding" | "hero" | "newsletter" | "footer" | "security">("hero");

  // Change Password state
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "security") {
        setActiveTab("security");
      }
    }

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
        setErrorMessage(data.error || "Failed to save settings.");
      } else {
        setSuccessMessage("Website content settings saved and applied to public pages!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdError(null);

    if (pwdNew !== pwdConfirm) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    if (pwdNew.length < 6) {
      setPwdError("New password must be at least 6 characters long.");
      return;
    }

    setPwdUpdating(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdCurrent,
          newPassword: pwdNew,
          confirmPassword: pwdConfirm,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwdError(data.error || "Failed to update password.");
      } else {
        setPwdSuccess(data.message || "Password updated successfully!");
        setPwdCurrent("");
        setPwdNew("");
        setPwdConfirm("");
      }
    } catch (err) {
      console.error(err);
      setPwdError("Failed to connect to server. Please try again.");
    } finally {
      setPwdUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-stone-700 mb-3" />
        <p className="text-sm font-medium">Loading website content settings...</p>
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
            <span>Content & Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-stone-900 tracking-tight">
            Settings & Security
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Customize website layout, hero banner, newsletter, brand identity, and manage administrator password.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/blogs"
            target="_blank"
            className="flex-1 sm:flex-initial cursor-pointer px-3.5 sm:px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
          >
            <span>View Public</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          {activeTab !== "security" && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-initial cursor-pointer px-4 sm:px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
              ) : (
                <Save className="w-4 h-4 text-emerald-400" />
              )}
              <span>Save Changes</span>
            </button>
          )}
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
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: "hero", label: "Hero Section", icon: Sparkles },
          { id: "branding", label: "Branding", icon: Type },
          { id: "newsletter", label: "Newsletter Card", icon: Mail },
          { id: "footer", label: "Footer & Social", icon: Layers },
          { id: "security", label: "Security & Password", icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`cursor-pointer px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition shrink-0 ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                Hero Section (Main Blog Display)
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Customize the grand heading and introductory subtitle at the top of the `/blogs` page.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Hero Tagline Badge
                </label>
                <input
                  type="text"
                  name="heroBadge"
                  value={settings.heroBadge}
                  onChange={handleChange}
                  placeholder="e.g. Editorial & Insights"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Main Blog Heading (Grand Title)
                </label>
                <input
                  type="text"
                  name="heroTitle"
                  value={settings.heroTitle}
                  onChange={handleChange}
                  placeholder="e.g. Blog's"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-lg font-heading font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  name="heroDescription"
                  value={settings.heroDescription}
                  onChange={handleChange}
                  placeholder="Write a brief overview of your blog's purpose..."
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
                Branding & Navigation
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Configure brand logo name and tagline displayed in the navigation header.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Brand Logo Name (Navbar)
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={settings.brandName}
                  onChange={handleChange}
                  placeholder="e.g. Blog's"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-base font-heading font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Brand Slogan / Tagline
                </label>
                <input
                  type="text"
                  name="brandTagline"
                  value={settings.brandTagline}
                  onChange={handleChange}
                  placeholder="e.g. Modern Insights & Resources"
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
                Customize the newsletter call-to-action card embedded inside the article grid.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Newsletter Badge
                </label>
                <input
                  type="text"
                  name="newsletterBadge"
                  value={settings.newsletterBadge}
                  onChange={handleChange}
                  placeholder="e.g. VIP Newsletter"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Newsletter Card Heading
                </label>
                <input
                  type="text"
                  name="newsletterTitle"
                  value={settings.newsletterTitle}
                  onChange={handleChange}
                  placeholder="e.g. Be the first to read our resources."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-base font-heading font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Newsletter Value Proposition / Description
                </label>
                <textarea
                  rows={3}
                  name="newsletterDescription"
                  value={settings.newsletterDescription}
                  onChange={handleChange}
                  placeholder="Explain the advantages of subscribing..."
                  className="w-full p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Subscribe Button Text
                </label>
                <input
                  type="text"
                  name="newsletterButtonText"
                  value={settings.newsletterButtonText}
                  onChange={handleChange}
                  placeholder="e.g. Subscribe Now"
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
                Footer, Contact & Social Media
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Configure about information, editorial contact, copyright notice, and social media handles.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Footer About Column Title
                </label>
                <input
                  type="text"
                  name="footerAboutTitle"
                  value={settings.footerAboutTitle}
                  onChange={handleChange}
                  placeholder="e.g. Blog's"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Footer Summary Description
                </label>
                <textarea
                  rows={2}
                  name="footerAboutDescription"
                  value={settings.footerAboutDescription}
                  onChange={handleChange}
                  placeholder="Short description displayed at the bottom of pages..."
                  className="w-full p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  name="copyrightText"
                  value={settings.copyrightText}
                  onChange={handleChange}
                  placeholder="e.g. © 2026 Blog's. All rights reserved."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Editorial Contact Email
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
                    X (Twitter) URL
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
                    LinkedIn URL
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
                    Instagram URL
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

        {/* Tab 5: Security & Change Password */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Informational Security Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-stone-900 text-base">
                  Database-Level Salted Encryption
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Your administrator password is cryptographically protected with salted PBKDF2 (10,000 iterations, SHA-512) and stored directly in your Supabase database.
                </p>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="text-lg font-heading font-bold text-stone-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-stone-700" />
                  <span>Change Administrator Password</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Choose a strong, unique password to prevent unauthorized access and clear Google Chrome compromised password warnings.
                </p>
              </div>

              {pwdSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs md:text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              {pwdError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs md:text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}

              <div className="space-y-5 max-w-xl">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPwd ? "text" : "password"}
                      required
                      value={pwdCurrent}
                      onChange={(e) => setPwdCurrent(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                      aria-label="Toggle Current Password Visibility"
                    >
                      {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPwd ? "text" : "password"}
                      required
                      value={pwdNew}
                      onChange={(e) => setPwdNew(e.target.value)}
                      placeholder="Enter a new strong password"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                      aria-label="Toggle New Password Visibility"
                    >
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
                    Must be at least 6 characters. Recommended: mix of uppercase, lowercase, numbers, and symbols (e.g. <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">Blog#Admin2026!Secure</code>).
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      required
                      value={pwdConfirm}
                      onChange={(e) => setPwdConfirm(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                      aria-label="Toggle Confirm Password Visibility"
                    >
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={pwdUpdating}
                    className="cursor-pointer px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
                  >
                    {pwdUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
                    ) : (
                      <Lock className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button (Only for content settings tabs) */}
        {activeTab !== "security" && (
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
              <span>Save All Content Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
