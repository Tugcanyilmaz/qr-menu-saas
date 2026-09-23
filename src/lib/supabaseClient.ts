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
 * Upload image file to Supabase Storage bucket 'qr-menu-assets'
 */
export async function uploadImageToStorage(file: File, folder: 'logos' | 'products'): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) {
    console.warn('Supabase not configured, using data URL fallback');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('qr-menu-assets')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Storage upload error:', error);
      // Data URL fallback if storage bucket is not created yet
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
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
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getCurrentSession();
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return null;

    const sessionUser: SessionUser = {
      id: session.user.id,
      email: session.user.email || '',
      role: profile.role,
      profile: profile as Profile
    };

    return sessionUser;
  } catch {
    return null;
  }
}

export async function registerBusinessUser(name: string, email: string, pass: string, customSlug?: string): Promise<SessionUser> {
  // Generate clean slug
  let baseSlug = (customSlug || name)
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) baseSlug = 'isletme';

  if (!supabase || !isSupabaseConfigured) {
    const res = mockStore.registerBusiness(name, email, baseSlug);
    return res.sessionUser;
  }

  // 1. Supabase Auth Sign Up
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        name,
        slug: baseSlug,
        role: 'BUSINESS'
      }
    }
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Supabase kayıt hatası');
  }

  const userId = authData.user.id;

  // Ensure slug uniqueness in Supabase profiles
  let finalSlug = baseSlug;
  const { data: existingProfiles } = await supabase.from('profiles').select('slug');
  if (existingProfiles && existingProfiles.some(p => p.slug === finalSlug)) {
    finalSlug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
  }

  // 2. Insert/Upsert into Supabase `profiles` table
  const newProfile: Profile = {
    id: userId,
    role: 'BUSINESS',
    name,
    slug: finalSlug, // IMMUTABLE PERMANENT SLUG
    logo_url: null,
    phone: '',
    address: '',
    description: 'Menümüze hoş geldiniz!',
    is_active: true,
    created_at: new Date().toISOString()
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([newProfile]);

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  const sessionUser: SessionUser = {
    id: userId,
    email,
    role: 'BUSINESS',
    profile: newProfile
  };

  // Sync to local session state
  mockStore.setSession(sessionUser);

  return sessionUser;
}

export async function loginUser(email: string, pass: string): Promise<SessionUser> {
  if (!supabase || !isSupabaseConfigured) {
    // Local demo fallback
    const profiles = mockStore.getProfiles();
    const isAdmin = email.includes('admin');
    const profile = isAdmin
      ? profiles.find(p => p.role === 'ADMIN') || profiles[0]
      : profiles.find(p => p.role === 'BUSINESS') || profiles[0];

    const sessionUser: SessionUser = {
      id: profile.id,
      email,
      role: profile.role,
      profile
    };
    mockStore.setSession(sessionUser);
    return sessionUser;
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'E-posta veya şifre hatalı');
  }

  const userId = authData.user.id;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('İşletme profili bulunamadı');
  }

  const sessionUser: SessionUser = {
    id: userId,
    email: authData.user.email || email,
    role: profile.role,
    profile: profile as Profile
  };

  mockStore.setSession(sessionUser);
  return sessionUser;
}

export async function logoutUser(): Promise<void> {
  if (supabase && isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  mockStore.setSession(null);
}

export async function fetchProfileBySlug(slug: string): Promise<Profile | null> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getProfileBySlug(slug) || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getProfileById(id) || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfileDB(id: string, updates: Partial<Profile>, adminProfile?: Profile): Promise<Profile> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.updateProfile(id, updates, adminProfile);
  }

  // Prevent slug modification
  const { slug, ...allowedUpdates } = updates;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Update profile DB error:', error);
    throw new Error(error?.message || 'Profil güncellenemedi');
  }

  // Audit log if admin action
  if (adminProfile && adminProfile.role === 'ADMIN') {
    await addAuditLogDB(adminProfile, id, data.name, 'İŞLETME_BİLGİLERİ_GÜNCELLENDİ', updates);
  }

  return data as Profile;
}

// -------------------------------------------------------------------
// CATEGORIES & PRODUCTS
// -------------------------------------------------------------------

export async function fetchCategoriesDB(businessId: string): Promise<Category[]> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getCategories(businessId);
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}

export async function addCategoryDB(businessId: string, name: string): Promise<Category> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.addCategory(businessId, name);
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ business_id: businessId, name, sort_order: 1, is_active: true }])
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Kategori eklenemedi');
  return data as Category;
}

export async function updateCategoryDB(id: string, updates: Partial<Category>): Promise<Category> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.updateCategory(id, updates);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Kategori güncellenemedi');
  return data as Category;
}

export async function deleteCategoryDB(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    mockStore.deleteCategory(id);
    return;
  }

  await supabase.from('categories').delete().eq('id', id);
}

export async function fetchProductsDB(businessId: string): Promise<Product[]> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getProducts(businessId);
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data as Product[];
}

export async function addProductDB(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.addProduct(productData);
  }

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Ürün eklenemedi');
  return data as Product;
}

export async function updateProductDB(id: string, updates: Partial<Product>): Promise<Product> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.updateProduct(id, updates);
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || 'Ürün güncellenemedi');
  return data as Product;
}

export async function deleteProductDB(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    mockStore.deleteProduct(id);
    return;
  }

  await supabase.from('products').delete().eq('id', id);
}

// -------------------------------------------------------------------
// AUDIT LOGS & ADMIN
// -------------------------------------------------------------------

export async function fetchAllProfilesAdmin(): Promise<Profile[]> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getProfiles().filter(p => p.role === 'BUSINESS');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'BUSINESS')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Profile[];
}

export async function fetchAuditLogsDB(): Promise<AuditLog[]> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.getAuditLogs();
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as AuditLog[];
}

export async function addAuditLogDB(admin: Profile, targetId: string, targetName: string, action: string, details?: any): Promise<AuditLog> {
  if (!supabase || !isSupabaseConfigured) {
    return mockStore.addAuditLog(admin, targetId, targetName, action, details);
  }

  const newLog = {
    admin_id: admin.id,
    target_business_id: targetId,
    action,
    details
  };

  const { data, error } = await supabase
    .from('audit_logs')
    .insert([newLog])
    .select()
    .single();

  if (error || !data) return mockStore.addAuditLog(admin, targetId, targetName, action, details);
  return data as AuditLog;
}
