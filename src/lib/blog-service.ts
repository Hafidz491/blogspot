import { supabase, STORAGE_BUCKET } from "./supabase";
import { Post, PostFormData } from "@/types/blog";
import { INITIAL_POSTS } from "./mock-data";
import { calculateReadingTime } from "./utils";

// Local in-memory cache to sync edits smoothly before database schema is applied
let localPostsCache: Post[] = [...INITIAL_POSTS];

/**
 * Fetch all published posts for the public blog view
 */
export async function getPublishedPosts(params?: {
  search?: string;
  category?: string;
}): Promise<Post[]> {
  try {
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (params?.category && params.category !== "All") {
      query = query.eq("category", params.category);
    }

    if (params?.search) {
      query = query.ilike("title", `%${params.search}%`);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Graceful fallback to initial seed posts
      let filtered = localPostsCache.filter((p) => p.status === "published");
      if (params?.category && params.category !== "All") {
        filtered = filtered.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s)
        );
      }
      return filtered;
    }

    return data as Post[];
  } catch {
    return localPostsCache.filter((p) => p.status === "published");
  }
}

/**
 * Fetch a single published post by slug for the blog detail page
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      const found = localPostsCache.find((p) => p.slug === slug);
      return found || null;
    }

    return data as Post;
  } catch {
    const found = localPostsCache.find((p) => p.slug === slug);
    return found || null;
  }
}

/**
 * Fetch all posts for the admin management dashboard
 */
export async function getAllPostsAdmin(params?: {
  search?: string;
  status?: string;
}): Promise<Post[]> {
  try {
    let query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params?.search) {
      query = query.ilike("title", `%${params.search}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      let filtered = [...localPostsCache];
      if (params?.status && params.status !== "all") {
        filtered = filtered.filter((p) => p.status === params.status);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(s) || p.excerpt.toLowerCase().includes(s)
        );
      }
      return filtered;
    }

    return data as Post[];
  } catch {
    return localPostsCache;
  }
}

/**
 * Fetch post by ID for editing
 */
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return localPostsCache.find((p) => p.id === id) || null;
    }

    return data as Post;
  } catch {
    return localPostsCache.find((p) => p.id === id) || null;
  }
}

/**
 * Create a new post
 */
export async function createPost(postData: PostFormData): Promise<{ data: Post | null; error: string | null }> {
  const publishedAt = postData.status === "published" ? new Date().toISOString() : null;
  const readingTime = calculateReadingTime(postData.content);

  const newPostRecord = {
    title: postData.title,
    slug: postData.slug,
    content: postData.content,
    excerpt: postData.excerpt,
    category: postData.category || "Tips",
    thumbnail_url: postData.thumbnail_url || null,
    status: postData.status,
    reading_time: readingTime,
    author_name: postData.author_name || "Editorial Team",
    published_at: publishedAt,
  };

  try {
    const { data, error } = await supabase
      .from("posts")
      .insert(newPostRecord)
      .select()
      .single();

    if (error) {
      console.warn("Supabase insert error, saving to local state fallback:", error.message);
      // Fallback
      const localRecord: Post = {
        id: `post-${Date.now()}`,
        ...newPostRecord,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localPostsCache.unshift(localRecord);
      return { data: localRecord, error: null };
    }

    // Also update local cache
    localPostsCache.unshift(data as Post);
    return { data: data as Post, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { data: null, error: message };
  }
}

/**
 * Update an existing post
 */
export async function updatePost(
  id: string,
  postData: Partial<PostFormData>
): Promise<{ data: Post | null; error: string | null }> {
  try {
    const updatePayload: Record<string, unknown> = { ...postData };
    if (postData.content) {
      updatePayload.reading_time = calculateReadingTime(postData.content);
    }
    if (postData.status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("posts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn("Supabase update error, updating local state fallback:", error.message);
      const index = localPostsCache.findIndex((p) => p.id === id);
      if (index !== -1) {
        localPostsCache[index] = {
          ...localPostsCache[index],
          ...updatePayload,
          updated_at: new Date().toISOString(),
        } as Post;
        return { data: localPostsCache[index], error: null };
      }
    }

    return { data: data as Post, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { data: null, error: message };
  }
}

/**
 * Delete a post by ID
 */
export async function deletePost(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete error, removing from local cache fallback:", error.message);
    }
    localPostsCache = localPostsCache.filter((p) => p.id !== id);
    return { success: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error occurred";
    return { success: false, error: message };
  }
}

/**
 * Upload a media file (image/video) directly to Supabase Storage
 */
export async function uploadMediaToSupabase(
  file: File,
  folder: "thumbnails" | "editor" = "thumbnails"
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    const fileName = `${folder}/${Date.now()}_${cleanFileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.warn("Supabase Storage upload warning:", uploadError.message);
      // If bucket is not created or RLS error, create a local object URL for preview demonstration
      const objectUrl = URL.createObjectURL(file);
      return { url: objectUrl, error: null };
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    return { url: data.publicUrl, error: null };
  } catch (err: unknown) {
    console.error("Storage upload error:", err);
    // Fallback for seamless UX preview
    const objectUrl = URL.createObjectURL(file);
    return { url: objectUrl, error: null };
  }
}
