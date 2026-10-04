import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Her istekte gerçekten çalışsın, önbelleğe alınmasın
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Supabase Free planı 7 gün işlem görmeyen projeleri askıya alır.
 * Vercel Cron bu adresi her gün çağırır ve veritabanına küçük bir sorgu atar,
 * böylece proje hep "aktif" görünür.
 */
export async function GET(request: Request) {
  // Vercel, CRON_SECRET tanımlıysa isteğe "Authorization: Bearer <CRON_SECRET>" ekler.
  // Böylece bu adresi dışarıdan başkası tetikleyemez.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Yetkisiz' }, { status: 401 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase yapılandırılmamış' }, { status: 500 });
  }

  // Gerçek bir veritabanı sorgusu (sadece 1 satırın id'si okunur)
  const { error } = await supabase.from('profiles').select('id').limit(1);

  if (error) {
    console.error('Keep-alive hatası:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
}
