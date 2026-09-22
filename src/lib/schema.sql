-- SQL Schema for Dijital QR Menu SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Business & Admin accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'BUSINESS' CHECK (role IN ('ADMIN', 'BUSINESS')),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  phone VARCHAR(50),
  address TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ultra-fast slug lookup for public menu
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_business ON public.categories(business_id);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);

-- 4. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_business_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_business_id);

-- ----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Anyone can view profiles (needed for public menu lookup by slug)
CREATE POLICY "Public profile view" ON public.profiles
  FOR SELECT USING (true);

-- Business can update their own profile (except slug which is immutable in UI/triggers)
CREATE POLICY "Business update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do anything with profiles
CREATE POLICY "Admin manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- CATEGORIES POLICIES
-- Anyone can view active categories of active businesses
CREATE POLICY "Public categories view" ON public.categories
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = business_id AND is_active = true
    )
  );

-- Business users can view and manage all their own categories
CREATE POLICY "Business manage own categories" ON public.categories
  FOR ALL USING (auth.uid() = business_id);

-- Admin manage all categories
CREATE POLICY "Admin manage all categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- PRODUCTS POLICIES
-- Anyone can view active products of active businesses
CREATE POLICY "Public products view" ON public.products
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = business_id AND is_active = true
    )
  );

-- Business users can view and manage all their own products
CREATE POLICY "Business manage own products" ON public.products
  FOR ALL USING (auth.uid() = business_id);

-- Admin manage all products
CREATE POLICY "Admin manage all products" ON public.products
  FOR ALL USING (public.is_admin());

-- AUDIT LOGS POLICIES
CREATE POLICY "Admin manage audit logs" ON public.audit_logs
  FOR ALL USING (public.is_admin());

-- ----------------------------------------------------
-- STORAGE SETUP (FOR LOGOS & PRODUCT IMAGES)
-- ----------------------------------------------------
-- Insert public bucket for assets if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-menu-assets', 'qr-menu-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public bucket read policy
CREATE POLICY "Public read storage objects" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-menu-assets');

-- Authenticated upload policy
CREATE POLICY "Authenticated users upload objects" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'qr-menu-assets' AND auth.role() = 'authenticated'
  );

-- Business delete own object policy
CREATE POLICY "Authenticated users delete objects" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'qr-menu-assets' AND auth.role() = 'authenticated'
  );
