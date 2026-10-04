-- =====================================================================
-- QR MENÜ SAAS — SUPABASE DÜZELTME SCRIPTİ
-- Supabase Dashboard > SQL Editor > New query > bu dosyanın tamamını
-- yapıştırın > RUN. Birden fazla kez çalıştırmak güvenlidir.
-- =====================================================================

-- 1) TABLOLAR (yoksa oluşturulur, varsa dokunulmaz)
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
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_business ON public.categories(business_id);

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

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_business_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_business_id);

-- 2) YARDIMCI FONKSİYONLAR
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN');
$$;

-- Aynı slug varsa sonuna kısa bir ek koyarak benzersiz slug üretir
CREATE OR REPLACE FUNCTION public.unique_slug(base TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  clean TEXT := lower(coalesce(nullif(trim(base), ''), 'isletme'));
  candidate TEXT := clean;
BEGIN
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = candidate) LOOP
    candidate := clean || '-' || substring(md5(random()::text), 1, 4);
  END LOOP;
  RETURN candidate;
END;
$$;

-- 3) KAYIT OLUNCA OTOMATİK PROFİL OLUŞTURAN TRIGGER
--    Rol artık kullanıcının gönderdiği veriye göre DEĞİL, sadece e-postaya göre belirlenir.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, slug, role, description)
  VALUES (
    NEW.id,
    coalesce(nullif(NEW.raw_user_meta_data->>'name', ''), 'İşletme'),
    public.unique_slug(coalesce(NEW.raw_user_meta_data->>'slug', 'isletme-' || substring(NEW.id::text, 1, 8))),
    CASE WHEN lower(NEW.email) = 'tugcanyilmaz@hotmail.com' THEN 'ADMIN' ELSE 'BUSINESS' END,
    'Menümüze hoş geldiniz!'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4) ROL VE SLUG KORUMASI
--    İşletmeler kendi rollerini ADMIN yapamaz, slug hiç değişmez.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  NEW.slug := OLD.slug;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;
CREATE TRIGGER protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 5) RLS POLİTİKALARI (eskiler silinip güvenli halleri yazılır)
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profile view"            ON public.profiles;
DROP POLICY IF EXISTS "Public insert profile"          ON public.profiles;
DROP POLICY IF EXISTS "Business insert own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Business update own profile"    ON public.profiles;
DROP POLICY IF EXISTS "Admin manage all profiles"      ON public.profiles;
DROP POLICY IF EXISTS "Public categories view"         ON public.categories;
DROP POLICY IF EXISTS "Business manage own categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage all categories"    ON public.categories;
DROP POLICY IF EXISTS "Public products view"           ON public.products;
DROP POLICY IF EXISTS "Business manage own products"   ON public.products;
DROP POLICY IF EXISTS "Admin manage all products"      ON public.products;
DROP POLICY IF EXISTS "Admin manage audit logs"        ON public.audit_logs;

-- Profiller: herkes okuyabilir (QR menü için gerekli)
CREATE POLICY "Public profile view" ON public.profiles
  FOR SELECT USING (true);
-- Sadece kendi profilini, sadece BUSINESS rolüyle oluşturabilir
CREATE POLICY "Business insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND role = 'BUSINESS');
CREATE POLICY "Business update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public categories view" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Business manage own categories" ON public.categories
  FOR ALL USING (auth.uid() = business_id) WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Admin manage all categories" ON public.categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public products view" ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Business manage own products" ON public.products
  FOR ALL USING (auth.uid() = business_id) WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Admin manage all products" ON public.products
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage audit logs" ON public.audit_logs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6) STORAGE (logo ve ürün görselleri)
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-menu-assets', 'qr-menu-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read storage objects"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete objects" ON storage.objects;

CREATE POLICY "Public read storage objects" ON storage.objects
  FOR SELECT USING (bucket_id = 'qr-menu-assets');
CREATE POLICY "Authenticated users upload objects" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'qr-menu-assets');
CREATE POLICY "Authenticated users update objects" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'qr-menu-assets');
CREATE POLICY "Authenticated users delete objects" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'qr-menu-assets');

-- 7) PROFİLİ EKSİK KALMIŞ KULLANICILARI TAMAMLA
--    (Daha önce kayıt olup profiles tablosuna düşmeyen işletmeler burada oluşur)
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN
    SELECT au.* FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO public.profiles (id, name, slug, role, description)
    VALUES (
      u.id,
      coalesce(nullif(u.raw_user_meta_data->>'name', ''), split_part(u.email, '@', 1)),
      public.unique_slug(coalesce(u.raw_user_meta_data->>'slug', 'isletme-' || substring(u.id::text, 1, 8))),
      CASE WHEN lower(u.email) = 'tugcanyilmaz@hotmail.com' THEN 'ADMIN' ELSE 'BUSINESS' END,
      'Menümüze hoş geldiniz!'
    );
  END LOOP;
END $$;

-- 8) ADMIN HESABINI ADMIN ROLÜNE YÜKSELT (hesap zaten varsa)
UPDATE public.profiles
SET role = 'ADMIN'
WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = 'tugcanyilmaz@hotmail.com');

-- 9) KONTROL: tüm kullanıcılar ve profilleri
SELECT u.email, p.name, p.slug, p.role, u.email_confirmed_at IS NOT NULL AS email_onayli
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;
