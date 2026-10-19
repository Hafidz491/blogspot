-- ==========================================================
-- SUPABASE DATABASE & STORAGE SCHEMA FOR MODERN BLOG
-- Project: Blog Modern with Admin Dashboard & Public Pages
-- ==========================================================

-- 1. Enable UUID Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Posts Table
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

-- 3. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- 4. Trigger Auto Update for `updated_at`
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

-- 5. Enable Row Level Security (RLS) on posts
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
-- 6. SUPABASE STORAGE BUCKET CONFIGURATION
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
-- 7. TABEL ADMIN USERS & KEAMANAN AUTENTIKASI
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Izinkan pengecekan login admin
DROP POLICY IF EXISTS "Allow select for login authentication" ON public.admin_users;
CREATE POLICY "Allow select for login authentication"
ON public.admin_users FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Kebijakan: Izinkan pembuatan akun admin pertama melalui setup
DROP POLICY IF EXISTS "Allow insert for admin setup" ON public.admin_users;
CREATE POLICY "Allow insert for admin setup"
ON public.admin_users FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- Catatan Keamanan:
-- Username dan Password TIDAK ditulis di file ini demi menjaga kerahasiaan Anda.
-- Buat akun admin Anda yang aman melalui:
-- 1. Web Wizard: Buka http://localhost:3000/admin/setup di browser Anda
-- 2. Atau Jalankan CLI di Terminal: npm run create-admin


-- ==========================================================
-- 8. TABEL SITE SETTINGS (PENGATURAN KONTEN WEB DINAMIS)
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'general',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Publik dapat membaca konfigurasi konten web
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
ON public.site_settings FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Kebijakan: Admin/Server dapat mengupdate konfigurasi konten web
DROP POLICY IF EXISTS "Allow manage site settings" ON public.site_settings;
CREATE POLICY "Allow manage site settings"
ON public.site_settings FOR ALL
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

