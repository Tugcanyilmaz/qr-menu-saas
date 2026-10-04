import { createClient } from '@supabase/supabase-js';
import { mockStore } from './mockStore';
import { Profile, Category, Product, AuditLog, SessionUser } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://xxxx.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * ÖNEMLİ: Supabase yapılandırılmışsa artık hiçbir yerde sessizce
 * tarayıcı hafızasına (mockStore / localStorage) düşülmez.
 * mockStore yalnızca env değişkenleri hiç tanımlı değilse (yerel geliştirme) kullanılır.
 * Eski sürümde bu "sessiz düşüş" yüzünden kayıtlar Supabase'e gitmiyor,
 * QR linkleri de 404 veriyordu.
 */

// Uygulama route'larıyla çakışmaması için işletmelere verilemeyecek slug'lar
export const RESERVED_SLUGS = [
  'admin', 'dashboard', 'login', 'register', 'demo', 'api', 'auth', 'logout', 'm', 'menu'
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function translateAuthError(message?: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
  if (m.includes('email not confirmed')) return 'E-posta adresiniz henüz onaylanmamış. Gelen kutunuzdaki onay bağlantısına tıklayın.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin.';
  if (m.includes('password should be at least')) return 'Şifre en az 6 karakter olmalıdır.';
  if (m.includes('rate limit')) return 'Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.';
  if (m.includes('database error')) return 'Veritabanı hatası: Supabase tarafında tablo/trigger kurulumu eksik olabilir.';
  return message || 'Beklenmeyen bir hata oluştu.';
}

/**
 * Upload image file to Supabase Storage bucket 'qr-menu-assets'
 */
export async function uploadImageToStorage(file: File, folder: 'logos' | 'products'): Promise<string | null> {
  const readAsDataUrl = () =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  if (!supabase) return readAsDataUrl();

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('qr-menu-assets')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error || !data) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('qr-menu-assets')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Upload exception:', err);
    return null;
  }
}

// -------------------------------------------------------------------
// AUTHENTICATION & PROFILES
// -------------------------------------------------------------------

export async function getCurrentSessionProfile(): Promise<SessionUser | null> {
  if (!supabase) {
    return mockStore.getCurrentSession();
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const user = session.user;

    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    let profile = existingProfile;

    if (error) {
      console.error('Profil okunamadı:', error);
    }

    // Normalde profil, kayıt anında Supabase trigger'ı ile oluşur.
    // Trigger çalışmadıysa (kurulum eksikse) burada BUSINESS olarak oluşturmayı dener.
    if (!profile) {
      const metaSlug = slugify(user.user_metadata?.slug || '') || 'isletme';
      const fallback = {
        id: user.id,
        role: 'BUSINESS' as const,
        name: user.user_metadata?.name || 'İşletme',
        slug: `${metaSlug}-${user.id.substring(0, 4)}`,
        description: 'Menümüze hoş geldiniz!',
        is_active: true,
      };
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert([fallback])
        .select()
        .single();

      if (insertError || !inserted) {
        console.error('Profil oluşturulamadı:', insertError);
        return null;
      }
      profile = inserted;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role,
      profile: profile as Profile,
    };
  } catch (err) {
    console.error('getCurrentSessionProfile error:', err);
    return null;
  }
}

export interface RegisterResult {
  sessionUser: SessionUser | null;
  needsEmailConfirmation: boolean;
}

export async function registerBusinessUser(
  name: string,
  email: string,
  pass: string,
  customSlug?: string
): Promise<RegisterResult> {
  let baseSlug = slugify(customSlug || name);
  if (!baseSlug) baseSlug = 'isletme';

  if (RESERVED_SLUGS.includes(baseSlug)) {
    throw new Error(`"${baseSlug}" adresi sistem tarafından kullanılıyor. Lütfen farklı bir URL adresi seçin.`);
  }

  if (!supabase) {
    const res = mockStore.registerBusiness(name, email, baseSlug);
    return { sessionUser: res.sessionUser, needsEmailConfirmation: false };
  }

  // Slug daha önce alınmış mı?
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', baseSlug)
    .maybeSingle();

  if (existing) {
    throw new Error(`"/${baseSlug}" adresi başka bir işletme tarafından kullanılıyor. Lütfen farklı bir URL adresi yazın.`);
  }

  // Profil satırını Supabase trigger'ı (handle_new_user) oluşturur.
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: pass,
    options: {
      data: { name: name.trim(), slug: baseSlug },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
    },
  });

  if (error) throw new Error(translateAuthError(error.message));

  // E-posta zaten kayıtlıysa Supabase hata yerine boş identities döndürür
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error('Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin.');
  }

  // "Confirm email" açıksa oturum oluşmaz, kullanıcı e-postayı onaylamalı
  if (!data.session) {
    return { sessionUser: null, needsEmailConfirmation: true };
  }

  const sessionUser = await getCurrentSessionProfile();
  return { sessionUser, needsEmailConfirmation: false };
}

export async function loginUser(email: string, pass: string): Promise<SessionUser> {
  if (!supabase) {
    const profiles = mockStore.getProfiles();
    const profile = profiles.find(p => p.role === 'BUSINESS') || profiles[0];
    const sessionUser: SessionUser = { id: profile.id, email, role: profile.role, profile };
    mockStore.setSession(sessionUser);
    return sessionUser;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: pass,
  });

  if (error) throw new Error(translateAuthError(error.message));

  const sessionUser = await getCurrentSessionProfile();
  if (!sessionUser) {
    throw new Error('Giriş yapıldı ancak işletme profili bulunamadı. Supabase kurulumunu (supabase-fix.sql) kontrol edin.');
  }
  return sessionUser;
}

export async function logoutUser(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  mockStore.setSession(null);
}

export async function fetchProfileBySlug(slug: string): Promise<Profile | null> {
  if (!supabase) {
    return mockStore.getProfileBySlug(slug) || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .maybeSingle();

  if (error) console.error('fetchProfileBySlug error:', error);
  return (data as Profile) || null;
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  if (!supabase) {
    return mockStore.getProfileById(id) || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) console.error('fetchProfileById error:', error);
  return (data as Profile) || null;
}

export async function updateProfileDB(id: string, updates: Partial<Profile>, adminProfile?: Profile): Promise<Profile> {
  if (!supabase) {
    return mockStore.updateProfile(id, updates, adminProfile);
  }

  // slug ve role istemciden asla güncellenmez
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slug, role, id: _id, created_at, ...allowedUpdates } = updates;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('updateProfileDB error:', error);
    throw new Error(error?.message || 'Profil güncellenemedi (yetki hatası olabilir).');
  }

  if (adminProfile && adminProfile.role === 'ADMIN' && adminProfile.id !== id) {
    await addAuditLogDB(adminProfile, id, data.name, 'İŞLETME_BİLGİLERİ_GÜNCELLENDİ', updates);
  }

  return data as Profile;
}

// -------------------------------------------------------------------
// CATEGORIES & PRODUCTS
// -------------------------------------------------------------------

export async function fetchCategoriesDB(businessId: string): Promise<Category[]> {
  if (!supabase) {
    return mockStore.getCategories(businessId);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) console.error('fetchCategoriesDB error:', error);
  return (data as Category[]) || [];
}

export async function addCategoryDB(businessId: string, name: string): Promise<Category> {
  if (!supabase) {
    return mockStore.addCategory(businessId, name);
  }

  const { count } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId);

  const { data, error } = await supabase
    .from('categories')
    .insert([{ business_id: businessId, name, sort_order: (count || 0) + 1, is_active: true }])
    .select()
    .single();

  if (error || !data) {
    console.error('addCategoryDB error:', error);
    throw new Error(error?.message || 'Kategori eklenemedi.');
  }
  return data as Category;
}

export async function updateCategoryDB(id: string, updates: Partial<Category>): Promise<Category> {
  if (!supabase) {
    return mockStore.updateCategory(id, updates);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('updateCategoryDB error:', error);
    throw new Error(error?.message || 'Kategori güncellenemedi.');
  }
  return data as Category;
}

export async function deleteCategoryDB(id: string): Promise<void> {
  if (!supabase) {
    mockStore.deleteCategory(id);
    return;
  }
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    console.error('deleteCategoryDB error:', error);
    throw new Error(error.message);
  }
}

export async function fetchProductsDB(businessId: string): Promise<Product[]> {
  if (!supabase) {
    return mockStore.getProducts(businessId);
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) console.error('fetchProductsDB error:', error);
  return (data as Product[]) || [];
}

export async function addProductDB(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  if (!supabase) {
    return mockStore.addProduct(productData);
  }

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error || !data) {
    console.error('addProductDB error:', error);
    throw new Error(error?.message || 'Ürün eklenemedi.');
  }
  return data as Product;
}

export async function updateProductDB(id: string, updates: Partial<Product>): Promise<Product> {
  if (!supabase) {
    return mockStore.updateProduct(id, updates);
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('updateProductDB error:', error);
    throw new Error(error?.message || 'Ürün güncellenemedi.');
  }
  return data as Product;
}

export async function deleteProductDB(id: string): Promise<void> {
  if (!supabase) {
    mockStore.deleteProduct(id);
    return;
  }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('deleteProductDB error:', error);
    throw new Error(error.message);
  }
}

// -------------------------------------------------------------------
// AUDIT LOGS & ADMIN
// -------------------------------------------------------------------

export async function fetchAllProfilesAdmin(): Promise<Profile[]> {
  if (!supabase) {
    return mockStore.getProfiles().filter(p => p.role === 'BUSINESS');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'BUSINESS')
    .order('created_at', { ascending: false });

  if (error) console.error('fetchAllProfilesAdmin error:', error);
  return (data as Profile[]) || [];
}

export async function fetchAuditLogsDB(): Promise<AuditLog[]> {
  if (!supabase) {
    return mockStore.getAuditLogs();
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('fetchAuditLogsDB error:', error);
  return ((data as AuditLog[]) || []).map(log => ({
    ...log,
    admin_name: log.admin_name || log.details?.admin_name || null,
    target_business_name: log.target_business_name || log.details?.target_business_name || null,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addAuditLogDB(admin: Profile, targetId: string, targetName: string, action: string, details?: any): Promise<AuditLog> {
  if (!supabase) {
    return mockStore.addAuditLog(admin, targetId, targetName, action, details);
  }

  const newLog = {
    admin_id: admin.id,
    target_business_id: targetId,
    action,
    details: { ...(details || {}), admin_name: admin.name, target_business_name: targetName },
  };

  const { data, error } = await supabase
    .from('audit_logs')
    .insert([newLog])
    .select()
    .single();

  if (error || !data) {
    console.error('addAuditLogDB error:', error);
    return {
      id: `local-${Date.now()}`,
      admin_id: admin.id,
      admin_name: admin.name,
      target_business_id: targetId,
      target_business_name: targetName,
      action,
      details,
      created_at: new Date().toISOString(),
    };
  }
  return data as AuditLog;
}
