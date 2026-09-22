import { Profile, Category, Product, AuditLog, SessionUser } from './types';

// Pre-seeded initial data for Instant MVP Demo
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'bus-001',
    role: 'BUSINESS',
    name: 'Mavi Kafe & Bistro',
    slug: 'mavi-kafe', // PERMANENT SLUG
    logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
    phone: '+90 532 111 2233',
    address: 'Moda Cad. No: 42, Kadıköy / İstanbul',
    description: 'Nitelikli kahveler, taze kruvasanlar ve ev yapımı tatlılar.',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'bus-002',
    role: 'BUSINESS',
    name: 'Gusto Pizza & Pasta',
    slug: 'gusto-pizza', // PERMANENT SLUG
    logo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    phone: '+90 212 999 8877',
    address: 'Nişantaşı Mah. Abdi İpekçi Cad. No: 12, Şişli / İstanbul',
    description: 'Odun ateşinde İtalyan pizzaları ve taze makarna çeşitleri.',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'admin-001',
    role: 'ADMIN',
    name: 'Sistem Yöneticisi (Admin)',
    slug: 'admin-system',
    logo_url: null,
    phone: null,
    address: null,
    description: 'Sistem Yöneticisi',
    is_active: true,
    created_at: new Date().toISOString(),
  }
];

const INITIAL_CATEGORIES: Category[] = [
  // Mavi Kafe Categories
  { id: 'cat-101', business_id: 'bus-001', name: 'Sıcak Kahveler', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-102', business_id: 'bus-001', name: 'Soğuk Kahveler', sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-103', business_id: 'bus-001', name: 'Tatlılar & Fırın', sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-104', business_id: 'bus-001', name: 'Bitki Çayları', sort_order: 4, is_active: true, created_at: new Date().toISOString() },

  // Gusto Pizza Categories
  { id: 'cat-201', business_id: 'bus-002', name: 'Odun Ateşi Pizzalar', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-202', business_id: 'bus-002', name: 'El Yapımı Makarnalar', sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-203', business_id: 'bus-002', name: 'İçecekler & İtalyan Soda', sort_order: 3, is_active: true, created_at: new Date().toISOString() }
];

const INITIAL_PRODUCTS: Product[] = [
  // Mavi Kafe Products
  {
    id: 'prod-1001',
    business_id: 'bus-001',
    category_id: 'cat-101',
    name: 'Caffè Latte',
    description: 'Çift shot espresso, buğulanmış kadifemsi süt ve taze süt köpüğü ile.',
    price: 160.00,
    image_url: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&q=80',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-1002',
    business_id: 'bus-001',
    category_id: 'cat-101',
    name: 'Americano',
    description: 'Özel harman filtre çekirdeklerden taze demlenmiş espresso ve sıcak su.',
    price: 130.00,
    image_url: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=600&q=80',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-1003',
    business_id: 'bus-001',
    category_id: 'cat-102',
    name: 'Iced Caramel Macchiato',
    description: 'Buzlu süt, vanilya şurubu, espresso shot ve üzerinde ev yapımı karamel sos.',
    price: 180.00,
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-1004',
    business_id: 'bus-001',
    category_id: 'cat-103',
    name: 'San Sebastian Cheesecake',
    description: 'Karamelize dış doku, kremsi kıvam ve Belçika çikolatası sosu ile servis edilir.',
    price: 220.00,
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-1005',
    business_id: 'bus-001',
    category_id: 'cat-103',
    name: 'Tereyağlı Fransız Kruvasan',
    description: 'Günlük taze pişen, bol tereyağlı kat kat çıtır Fransız kruvasanı.',
    price: 110.00,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Gusto Pizza Products
  {
    id: 'prod-2001',
    business_id: 'bus-002',
    category_id: 'cat-201',
    name: 'Pizza Margherita Speziale',
    description: 'San Marzano domates sosu, taze buffalo mozzarella, fesleğen ve sızma zeytinyağı.',
    price: 340.00,
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2002',
    business_id: 'bus-002',
    category_id: 'cat-202',
    name: 'Truffle & Mushroom Fettuccine',
    description: 'Taze el yapımı fettuccine, trüf mantarı kreması ve parmesan rendesi.',
    price: 390.00,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281273?w=600&q=80',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    admin_id: 'admin-001',
    admin_name: 'Sistem Yöneticisi',
    target_business_id: 'bus-001',
    target_business_name: 'Mavi Kafe & Bistro',
    action: 'İŞLETME_ONAYLANDI',
    details: { reason: 'Yeni kayıt olan işletme hesabı aktifleştirildi.' },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

class MockStore {
  private STORAGE_KEY_PROFILES = 'qrmenu_profiles_v1';
  private STORAGE_KEY_CATEGORIES = 'qrmenu_categories_v1';
  private STORAGE_KEY_PRODUCTS = 'qrmenu_products_v1';
  private STORAGE_KEY_AUDIT = 'qrmenu_audit_v1';
  private STORAGE_KEY_SESSION = 'qrmenu_session_v1';

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Helper to load or seed data
  private getItem<T>(key: string, defaultData: T): T {
    if (!this.isClient()) return defaultData;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    } catch {
      return defaultData;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- Session Management ---
  getCurrentSession(): SessionUser | null {
    const defaultUser: SessionUser = {
      id: 'bus-001',
      email: 'mavi@kafe.com',
      role: 'BUSINESS',
      profile: INITIAL_PROFILES[0]
    };
    return this.getItem<SessionUser | null>(this.STORAGE_KEY_SESSION, defaultUser);
  }

  setSession(user: SessionUser | null): void {
    this.setItem(this.STORAGE_KEY_SESSION, user);
  }

  // --- Profiles ---
  getProfiles(): Profile[] {
    return this.getItem<Profile[]>(this.STORAGE_KEY_PROFILES, INITIAL_PROFILES);
  }

  getProfileBySlug(slug: string): Profile | undefined {
    const profiles = this.getProfiles();
    return profiles.find(p => p.slug.toLowerCase() === slug.toLowerCase());
  }

  getProfileById(id: string): Profile | undefined {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id);
  }

  updateProfile(id: string, updates: Partial<Profile>, adminActionUser?: Profile): Profile {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error('İşletme bulunamadı');

    // IMPORTANT RULE: Slug CANNOT be changed if already set!
    const existing = profiles[index];
    const updated: Profile = {
      ...existing,
      ...updates,
      slug: existing.slug, // LOCK SLUG PERMANENTLY!
      updated_at: new Date().toISOString()
    };

    profiles[index] = updated;
    this.setItem(this.STORAGE_KEY_PROFILES, profiles);

    // If updated current session profile, refresh session
    const session = this.getCurrentSession();
    if (session && session.profile.id === id) {
      this.setSession({ ...session, profile: updated });
    }

    if (adminActionUser && adminActionUser.role === 'ADMIN') {
      this.addAuditLog(adminActionUser, updated.id, updated.name, 'İŞLETME_BİLGİLERİ_GÜNCELLENDİ', updates);
    }

    return updated;
  }

  registerBusiness(name: string, email: string, customSlug?: string): { profile: Profile; sessionUser: SessionUser } {
    const profiles = this.getProfiles();
    
    // Generate clean immutable slug
    let baseSlug = (customSlug || name)
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (!baseSlug) baseSlug = 'isletme';

    let finalSlug = baseSlug;
    let counter = 1;
    while (profiles.some(p => p.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProfile: Profile = {
      id: `bus-${Date.now()}`,
      role: 'BUSINESS',
      name,
      slug: finalSlug, // LOCKED FOREVER!
      logo_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
      phone: '',
      address: '',
      description: 'Menümüze hoş geldiniz!',
      is_active: true,
      created_at: new Date().toISOString()
    };

    profiles.push(newProfile);
    this.setItem(this.STORAGE_KEY_PROFILES, profiles);

    const sessionUser: SessionUser = {
      id: newProfile.id,
      email,
      role: 'BUSINESS',
      profile: newProfile
    };

    this.setSession(sessionUser);
    return { profile: newProfile, sessionUser };
  }

  // --- Categories ---
  getCategories(businessId: string): Category[] {
    const cats = this.getItem<Category[]>(this.STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
    return cats
      .filter(c => c.business_id === businessId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  addCategory(businessId: string, name: string): Category {
    const cats = this.getItem<Category[]>(this.STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
    const businessCats = cats.filter(c => c.business_id === businessId);
    
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      business_id: businessId,
      name,
      sort_order: businessCats.length + 1,
      is_active: true,
      created_at: new Date().toISOString()
    };

    cats.push(newCat);
    this.setItem(this.STORAGE_KEY_CATEGORIES, cats);
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category {
    const cats = this.getItem<Category[]>(this.STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
    const index = cats.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Kategori bulunamadı');

    const updated = { ...cats[index], ...updates };
    cats[index] = updated;
    this.setItem(this.STORAGE_KEY_CATEGORIES, cats);
    return updated;
  }

  deleteCategory(id: string): void {
    let cats = this.getItem<Category[]>(this.STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
    cats = cats.filter(c => c.id !== id);
    this.setItem(this.STORAGE_KEY_CATEGORIES, cats);

    // Also delete associated products
    let prods = this.getItem<Product[]>(this.STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    prods = prods.filter(p => p.category_id !== id);
    this.setItem(this.STORAGE_KEY_PRODUCTS, prods);
  }

  // --- Products ---
  getProducts(businessId: string): Product[] {
    const prods = this.getItem<Product[]>(this.STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    return prods
      .filter(p => p.business_id === businessId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  addProduct(productData: Omit<Product, 'id' | 'created_at'>): Product {
    const prods = this.getItem<Product[]>(this.STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    prods.push(newProduct);
    this.setItem(this.STORAGE_KEY_PRODUCTS, prods);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product {
    const prods = this.getItem<Product[]>(this.STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    const index = prods.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Ürün bulunamadı');

    const updated = { ...prods[index], ...updates };
    prods[index] = updated;
    this.setItem(this.STORAGE_KEY_PRODUCTS, prods);
    return updated;
  }

  deleteProduct(id: string): void {
    let prods = this.getItem<Product[]>(this.STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    prods = prods.filter(p => p.id !== id);
    this.setItem(this.STORAGE_KEY_PRODUCTS, prods);
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(this.STORAGE_KEY_AUDIT, INITIAL_AUDIT_LOGS);
  }

  addAuditLog(admin: Profile, targetBusinessId: string, targetBusinessName: string, action: string, details?: any): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      admin_id: admin.id,
      admin_name: admin.name,
      target_business_id: targetBusinessId,
      target_business_name: targetBusinessName,
      action,
      details,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog); // Newest first
    this.setItem(this.STORAGE_KEY_AUDIT, logs);
    return newLog;
  }
}

export const mockStore = new MockStore();
