import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Post } from "@/types/blog";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group bg-white rounded-2xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden p-3.5">
      {/* Thumbnail Image */}
      <Link
        href={`/blogs/${post.slug}`}
        className="block relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-100"
      >
        {post.thumbnail_url ? (
          <Image
            src={post.thumbnail_url}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-xs">
            No Image
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="pt-4 px-1.5 pb-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
            {post.category || "Tips"}
          </span>

          {/* Post Title */}
          <h2 className="font-bold text-stone-900 text-base md:text-lg leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors">
            <Link href={`/blogs/${post.slug}`}>
              {post.title}
            </Link>
          </h2>

          {/* Excerpt */}
          <p className="mt-2.5 text-stone-500 text-xs md:text-sm line-clamp-3 leading-relaxed">
            {post.excerpt || "Read full article to explore more insights and strategies..."}
          </p>
        </div>

        {/* Card Footer: Read More & Time */}
        <div className="mt-6 pt-3 border-t border-stone-100/90 flex items-center justify-between text-xs">
          <Link
            href={`/blogs/${post.slug}`}
            className="inline-flex items-center gap-1 font-semibold text-[#8B4513] hover:text-[#5C2E0B] transition-colors"
          >
            <span>Read More</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>

          <span className="text-stone-400 text-[11px] font-medium">
            {post.reading_time || formatDate(post.published_at)}
          </span>
        </div>
      </div>
    </article>
  );
}
