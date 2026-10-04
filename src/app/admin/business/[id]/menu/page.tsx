'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProfileById, getCurrentSessionProfile } from '@/lib/supabaseClient';
import { Profile } from '@/lib/types';
import MenuEditor from '@/components/MenuEditor';
import { ArrowLeft, ExternalLink, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminBusinessMenuPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  const [business, setBusiness] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      const s = await getCurrentSessionProfile();
      if (!s || s.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      const b = await fetchProfileById(businessId);
      if (!b) {
        router.push('/admin');
        return;
      }
      setBusiness(b);
      setLoading(false);
    }
    load();
  }, [businessId, router]);

  if (loading || !business) {
    return (
      <div className="p-12 text-center text-purple-400 text-xs font-medium flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Menü yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/admin/business/${business.id}`}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>İşletme Detayına Dön</span>
        </Link>

        <Link
          href={`/${business.slug}`}
          target="_blank"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Canlı Menüyü Gör</span>
        </Link>
      </div>

      <div className="glass-panel p-4 border-purple-500/30 flex items-center space-x-3">
        <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0" />
        <p className="text-xs text-slate-300">
          Admin olarak <strong className="text-white">{business.name}</strong> (/{business.slug}) işletmesinin menüsünü düzenliyorsunuz.
          Yaptığınız değişiklikler anında canlı menüye yansır.
        </p>
      </div>

      <MenuEditor businessId={business.id} />
    </div>
  );
}
