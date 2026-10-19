"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Globe,
  Lock,
  Unlock,
  Sparkles,
  Eye,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Post, PostFormData, PostStatus } from "@/types/blog";
import { generateSlug } from "@/lib/utils";
import { createPost, updatePost } from "@/lib/blog-service";
import ThumbnailUploader from "@/components/admin/ThumbnailUploader";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-2xl border border-stone-200 bg-white/70 animate-pulse flex items-center justify-center text-stone-400">
        <span>Memuat Rich Text Editor...</span>
      </div>
    ),
  }
);

interface PostFormProps {
  initialData?: Post;
  isEdit?: boolean;
}

const CATEGORIES = [
  "Tips",
  "Strategy",
  "Guide",
  "Ideas",
  "Grants",
  "Insights",
  "Case Study",
  "General",
];

export default function PostForm({ initialData, isEdit = false }: PostFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<PostFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    category: initialData?.category || "Tips",
    thumbnail_url: initialData?.thumbnail_url || "",
    content: initialData?.content || "<p>Mulai tulis konten artikel inspiratif Anda di sini...</p>",
    status: initialData?.status || "published",
    author_name: initialData?.author_name || "Admin Editor",
  });

  // State to track whether slug is locked to auto-sync with title
  const [isSlugSynced, setIsSlugSynced] = useState<boolean>(!isEdit);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-generate slug dynamically when title changes (if sync is active)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: isSlugSynced ? generateSlug(newTitle) : prev.slug,
    }));
  };

  // Toggle slug sync lock
  const toggleSlugSync = () => {
    if (!isSlugSynced) {
      // Re-sync with current title
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
    }
    setIsSlugSynced(!isSlugSynced);
  };

  const handleSubmit = async (e: React.FormEvent, overrideStatus?: PostStatus) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage("Judul artikel tidak boleh kosong.");
      return;
    }

    if (!formData.slug.trim()) {
      setErrorMessage("Slug URL artikel tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: PostFormData = {
      ...formData,
      status: overrideStatus || formData.status,
      slug: generateSlug(formData.slug),
    };

    try {
      if (isEdit && initialData?.id) {
        const { error } = await updatePost(initialData.id, payload);
        if (error) {
          setErrorMessage("Gagal memperbarui artikel: " + error);
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage("Artikel berhasil diperbarui!");
      } else {
        const { error } = await createPost(payload);
        if (error) {
          setErrorMessage("Gagal menyimpan artikel: " + error);
          setIsSubmitting(false);
          return;
        }
        setSuccessMessage("Artikel baru berhasil dibuat!");
      }

      setTimeout(() => {
        router.push("/admin/posts");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan saat memproses data artikel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="max-w-5xl mx-auto space-y-8">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300 transition shadow-2xs"
            title="Kembali ke Daftar Post"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-stone-900 tracking-tight">
              {isEdit ? "Edit Artikel Blog" : "Buat Artikel Baru"}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola konten, media, metadata, dan status publikasi tulisan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Save as Draft Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs md:text-sm flex items-center gap-2 transition disabled:opacity-50 shadow-2xs"
          >
            <Save className="w-4 h-4 text-stone-500" />
            <span>Simpan sebagai Draft</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-medium text-xs md:text-sm flex items-center gap-2 transition disabled:opacity-50 shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-300" />
            ) : (
              <Globe className="w-4 h-4 text-emerald-400" />
            )}
            <span>{isEdit ? "Perbarui & Terbitkan" : "Terbitkan Artikel"}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage} Mengalihkan ke halaman dashboard...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm animate-in fade-in">
          {errorMessage}
        </div>
      )}

      {/* Main Grid: Left Editor & Right Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Title, Slug, Excerpt, Rich Text Editor (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Title */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                Judul Artikel
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Contoh: Strategi Efektif Mengembangkan Komunitas..."
                className="w-full text-xl md:text-2xl font-heading font-bold text-stone-900 placeholder:text-stone-300 border-0 border-b border-stone-200 pb-3 focus:outline-none focus:border-stone-900 transition bg-transparent"
              />
            </div>

            {/* Auto Slug Generator Field */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  URL Slug (Auto Generated)
                </span>
                <button
                  type="button"
                  onClick={toggleSlugSync}
                  className="flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 transition underline underline-offset-2"
                >
                  {isSlugSynced ? (
                    <>
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Sinkron otomatis aktif (Klik untuk edit manual)</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-amber-600" />
                      <span>Mode manual (Klik untuk auto-sync kembali)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center rounded-xl bg-[#FAF8F5] border border-stone-200 px-3 py-2 text-xs font-mono text-stone-700">
                <span className="text-stone-400 select-none">/blogs/</span>
                <input
                  type="text"
                  value={formData.slug}
                  disabled={isSlugSynced}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  placeholder="slug-url-artikel"
                  className={`flex-1 bg-transparent border-none text-xs font-mono text-stone-800 focus:outline-none ${
                    isSlugSynced ? "cursor-default text-stone-600" : "font-semibold text-amber-900"
                  }`}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Ringkasan Singkat (Excerpt)
              </label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Tulis ringkasan singkat artikel yang menarik untuk ditampilkan di card dan hasil pencarian Google..."
                className="w-full text-xs md:text-sm text-stone-700 p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
              />
            </div>
          </div>

          {/* TipTap Rich Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Isi Konten Artikel (Rich Text Editor)
              </label>
              <span className="text-[11px] text-stone-400">
                Mendukung Gambar, Format Teks & Embed YouTube
              </span>
            </div>
            <RichTextEditor
              content={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            />
          </div>
        </div>

        {/* Right Column: Thumbnail, Category, Status & Author (1 Col) */}
        <div className="space-y-6">
          {/* Post Thumbnail Upload Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Thumbnail Utama
              </h3>
              <span className="text-[11px] text-stone-400">Rasio 16:9 / 4:3</span>
            </div>
            <ThumbnailUploader
              value={formData.thumbnail_url || ""}
              onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url }))}
            />
          </div>

          {/* Publication Settings Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-2">
              Pengaturan Publikasi
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Status Postingan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: "draft" }))}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    formData.status === "draft"
                      ? "bg-stone-800 text-white border-stone-800 shadow-2xs"
                      : "bg-[#FAF8F5] text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: "published" }))}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    formData.status === "published"
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                      : "bg-[#FAF8F5] text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300" />
                  <span>Published</span>
                </button>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Kategori Artikel
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full text-xs text-stone-800 p-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1.5">
                Nama Penulis / Redaksi
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author_name: e.target.value }))
                }
                placeholder="Contoh: Editorial Team"
                className="w-full text-xs text-stone-800 p-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
              />
            </div>
          </div>

          {/* Quick Preview Link */}
          {isEdit && initialData?.slug && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-700">
                <Eye className="w-4 h-4 text-stone-500" />
                <span>Lihat Tampilan Publik</span>
              </div>
              <Link
                href={`/blogs/${initialData.slug}`}
                target="_blank"
                className="font-medium text-amber-800 hover:text-amber-900 underline underline-offset-2"
              >
                Buka Artikel ↗
              </Link>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
