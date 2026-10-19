-- ==========================================================
-- SUPABASE DATABASE & STORAGE SCHEMA FOR MODERN BLOG
-- Project: Blog Modern with Admin Dashboard & Public Pages
-- ==========================================================

-- 1. Enable UUID Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing table if need a clean reset (opsional)
-- DROP TABLE IF EXISTS posts CASCADE;

-- 3. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL, -- Rich text content (HTML output dari TipTap)
    excerpt TEXT,
    category TEXT DEFAULT 'Tips',
    thumbnail_url TEXT,
    reading_time TEXT DEFAULT '5 min read',
    author_name TEXT DEFAULT 'Editorial Team',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- 5. Trigger Auto Update for `updated_at`
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_posts_updated_at ON public.posts;
CREATE TRIGGER trigger_set_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Siapapun (publik) boleh membaca postingan yang berstatus 'published'
DROP POLICY IF EXISTS "Public can view published posts" ON public.posts;
CREATE POLICY "Public can view published posts"
ON public.posts
FOR SELECT
USING (status = 'published');

-- Policy 2: Akses penuh untuk manajemen artikel (Admin)
DROP POLICY IF EXISTS "Allow full post management for admin/anon" ON public.posts;
CREATE POLICY "Allow full post management for admin/anon"
ON public.posts
FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);


-- ==========================================================
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION
-- ==========================================================

-- Buat storage bucket 'blog-media' jika belum ada (Public Bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-media',
    'blog-media',
    true,
    10485760, -- 10MB file limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 10485760;

-- Kebijakan Akses Storage (RLS):
DROP POLICY IF EXISTS "Allow public read access to blog media" ON storage.objects;
CREATE POLICY "Allow public read access to blog media"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-media');

DROP POLICY IF EXISTS "Allow media uploads to blog-media" ON storage.objects;
CREATE POLICY "Allow media uploads to blog-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'blog-media');

DROP POLICY IF EXISTS "Allow media update in blog-media" ON storage.objects;
CREATE POLICY "Allow media update in blog-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-media');

DROP POLICY IF EXISTS "Allow media delete in blog-media" ON storage.objects;
CREATE POLICY "Allow media delete in blog-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-media');


-- ==========================================================
-- 8. TABEL ADMIN USERS & AUTENTIKASI
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for login authentication" ON public.admin_users;
CREATE POLICY "Allow select for login authentication"
ON public.admin_users FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Insert Akun Admin Default:
-- Username: adminblog
-- Password: blogadmin
INSERT INTO public.admin_users (username, password_hash, role)
VALUES ('adminblog', 'blogadmin', 'admin')
ON CONFLICT (username) DO UPDATE
SET password_hash = 'blogadmin', role = 'admin';
