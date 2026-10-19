export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Stored as HTML from TipTap
  excerpt: string;
  category: string;
  thumbnail_url: string | null;
  status: PostStatus;
  reading_time?: string;
  author_name?: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  thumbnail_url: string;
  status: PostStatus;
  reading_time?: string;
  author_name?: string;
}
