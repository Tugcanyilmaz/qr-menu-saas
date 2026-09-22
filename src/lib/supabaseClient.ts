import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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
