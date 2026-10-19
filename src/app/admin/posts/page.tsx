"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  FileText,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Post } from "@/types/blog";
import { getAllPostsAdmin, deletePost } from "@/lib/blog-service";
import { formatDate } from "@/lib/utils";
import { INITIAL_POSTS } from "@/lib/mock-data";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load posts
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getAllPostsAdmin({
        search: searchQuery,
        status: statusFilter,
      });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { success } = await deletePost(deleteTarget.id);
      if (success) {
        setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus postingan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner: Title & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Dashboard Admin</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-stone-900 tracking-tight">
            Manajemen Artikel Blog
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Kelola seluruh artikel, pantau status publikasi, dan tinjau konten secara terpusat.
          </p>
        </div>

        <Link
          href="/admin/posts/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs md:text-sm font-bold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-stone-200" />
          <span>Tulis Artikel Baru</span>
        </Link>
      </div>

      {/* Metrics / Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Total Artikel
          </span>
          <div className="text-3xl font-heading font-extrabold text-stone-900 mt-2">
            {totalCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Terbit (Published)
          </span>
          <div className="text-3xl font-heading font-extrabold text-emerald-900 mt-2">
            {publishedCount}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Konsep (Draft)
          </span>
          <div className="text-3xl font-heading font-extrabold text-amber-900 mt-2">
            {draftCount}
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul atau isi..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-stone-200 w-full md:w-auto overflow-x-auto">
          {[
            { id: "all", label: "Semua Status" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Draft" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? "bg-white text-stone-900 shadow-2xs font-bold"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-stone-500 mb-3" />
            <p className="text-sm">Memuat data artikel...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-heading font-bold text-stone-800">
              Belum Ada Artikel yang Tersedia
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Data dummy telah dikosongkan. Mulai buat artikel baru Anda untuk ditampilkan di halaman publik blog.
            </p>
            <Link
              href="/admin/posts/create"
              className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Pertama</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-[#FAF8F5] border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3.5 px-5">
                    Artikel & Thumbnail
                  </th>
                  <th scope="col" className="py-3.5 px-4 hidden md:table-cell">
                    Kategori
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Status
                  </th>
                  <th scope="col" className="py-3.5 px-4 hidden lg:table-cell">
                    Tanggal Terbit
                  </th>
                  <th scope="col" className="py-3.5 px-5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-stone-50/70 transition-colors group"
                  >
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          {post.thumbnail_url ? (
                            <Image
                              src={post.thumbnail_url}
                              alt={post.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-md">
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="font-bold text-stone-900 hover:text-amber-800 transition line-clamp-1 text-sm"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400 font-mono">
                            <span>/blogs/{post.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 text-[11px] font-semibold">
                        {post.category || "Tips"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      {post.status === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Published Date */}
                    <td className="py-4 px-4 hidden lg:table-cell text-stone-500">
                      {post.published_at ? formatDate(post.published_at) : "Belum diterbitkan"}
                    </td>

                    {/* Actions: Edit, Delete, View */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Public Page Link (if published) */}
                        {post.status === "published" && (
                          <Link
                            href={`/blogs/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-stone-200/70 text-stone-500 hover:text-stone-800 transition"
                            title="Tinjau di Halaman Publik"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Edit Button */}
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-stone-200/70 text-stone-600 hover:text-stone-900 transition"
                          title="Edit Artikel"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition"
                          title="Hapus Artikel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-heading font-bold text-stone-900">
                Hapus Artikel Ini?
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus artikel{" "}
                <strong className="text-stone-800">&quot;{deleteTarget.title}&quot;</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
