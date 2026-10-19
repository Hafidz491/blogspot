"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import PostCard from "@/components/public/PostCard";
import NewsletterCard from "@/components/public/NewsletterCard";
import { Post } from "@/types/blog";
import { getPublishedPosts } from "@/lib/blog-service";
import { Search, ChevronDown, Loader2, BookOpen } from "lucide-react";
import { INITIAL_POSTS } from "@/lib/mock-data";

const CATEGORIES = [
  "All",
  "Tips",
  "Strategy",
  "Guide",
  "Ideas",
  "Grants",
  "Insights",
  "Case Study",
];

export default function BlogsPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getPublishedPosts({
          category: selectedCategory,
          search: searchQuery,
        });
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Modern & Lively Grand Title */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wider uppercase mb-3">
            Editorial & Insights
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tight">
            The Kindsight Blog
          </h1>
          <p className="mt-3.5 text-stone-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Practical strategies, thoughtful perspectives, and tools for modern philanthropy.
          </p>
        </div>

        {/* Filter and Search Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 pb-4 border-b border-stone-200/60">
          <div className="text-xs font-semibold text-stone-500">
            {posts.length > 0 ? (
              <span>Menampilkan <strong className="text-stone-900">{posts.length}</strong> artikel</span>
            ) : (
              <span>Koleksi Artikel</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full bg-white rounded-xl border border-stone-200/90 px-3.5 py-2 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 shadow-2xs font-sans"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 bg-white rounded-xl border border-stone-200/90 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
              >
                <span>
                  {selectedCategory === "All" ? "Filter Kategori" : selectedCategory}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-stone-200 shadow-lg py-1.5 z-30 animate-in fade-in duration-100">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs transition ${
                        selectedCategory === cat
                          ? "bg-stone-100 font-bold text-stone-900"
                          : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3-Column Card Grid or Empty State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-stone-500 mb-3" />
            <p className="text-sm font-medium">Memuat artikel...</p>
          </div>
        ) : posts.length === 0 ? (
          /* Clean Empty State */
          <div className="space-y-12">
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4 border border-amber-200/60">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-stone-900">
                Belum Ada Artikel yang Diterbitkan
              </h3>
              <p className="text-xs md:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                Tulisan inspiratif dan wawasan baru akan segera hadir. Anda dapat mendaftarkan email di bawah ini untuk mendapatkan kabar saat artikel pertama kami rilis.
              </p>
              {selectedCategory !== "All" && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black transition"
                >
                  Tampilkan Semua Kategori
                </button>
              )}
            </div>

            {/* Newsletter Subscription Box */}
            <div className="max-w-xl mx-auto">
              <NewsletterCard />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {posts.map((post, index) => {
              if (index === 5) {
                return (
                  <React.Fragment key="newsletter-slot">
                    <NewsletterCard />
                    <PostCard post={post} />
                  </React.Fragment>
                );
              }
              return <PostCard key={post.id} post={post} />;
            })}

            {posts.length < 5 && <NewsletterCard />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
