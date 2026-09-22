export type UserRole = 'ADMIN' | 'BUSINESS';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  slug: string; // Permanent and immutable!
  logo_url?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string | null;
  admin_name?: string | null;
  target_business_id?: string | null;
  target_business_name?: string | null;
  action: string;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile;
}
