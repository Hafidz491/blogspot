-- ==========================================================
-- SEED DATA UNTUK BLOG (HANYA AKUN ADMIN DEFAULT)
-- Seluruh dummy blog post telah dikosongkan agar web bersih
-- dan siap digunakan untuk posting artikel asli oleh admin.
-- ==========================================================

-- Pastikan tabel admin_users telah dibuat via schema.sql
INSERT INTO public.admin_users (
    username,
    password_hash,
    role
) VALUES (
    'adminblog',
    'blogadmin',
    'admin'
)
ON CONFLICT (username) DO UPDATE
SET password_hash = 'blogadmin', role = 'admin';
