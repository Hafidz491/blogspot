import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import NewsletterCard from "@/components/public/NewsletterCard";
import ShareButtons from "@/components/public/ShareButtons";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog-service";
import { getSiteSettings } from "@/lib/settings-service";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found — The Kindsight Blog",
    };
  }

  return {
    title: `${post.title} — The Kindsight Blog`,
    description: post.excerpt || "Read full article on The Kindsight Blog",
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.thumbnail_url ? [post.thumbnail_url] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    notFound();
  }

  // Fetch a couple of other articles for "Read Next"
  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <Navbar brandName={settings.brandName} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-10 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-full bg-stone-200/80 font-semibold text-stone-800 uppercase tracking-wider text-[11px]">
              {post.category || "Tips"}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.published_at)}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.reading_time || "5 min read"}
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 leading-tight tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-sans max-w-3xl">
              {post.excerpt}
            </p>
          )}

          {/* Author Details & Share Controls */}
          <div className="pt-4 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-heading font-bold text-sm">
                {(post.author_name || "E").charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-900">
                  {post.author_name || "Editorial Team"}
                </p>
                <p className="text-[11px] text-stone-400">Contributor & Advisor</p>
              </div>
            </div>

            <ShareButtons title={post.title} />
          </div>
        </header>

        {/* Featured Image Thumbnail */}
        {post.thumbnail_url && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-sm mb-12">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              unoptimized
            />
          </div>
        )}

        {/* Article Body Content (Rich Text Rendered) */}
        <article
          className="prose-editorial bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/80 shadow-xs"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Newsletter Section */}
        <div className="mt-14">
          <NewsletterCard settings={settings} />
        </div>

        {/* Read Next Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200/90">
            <h3 className="font-heading text-2xl font-bold text-stone-900 mb-6">
              Read Next
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  href={`/blogs/${rPost.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-stone-200 hover:border-stone-400 transition shadow-2xs block"
                >
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    {rPost.category}
                  </span>
                  <h4 className="font-bold text-stone-900 group-hover:text-stone-600 transition text-sm sm:text-base mt-1 line-clamp-2">
                    {rPost.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                    {rPost.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
