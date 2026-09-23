'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentSessionProfile } from '@/lib/supabaseClient';
import { SessionUser } from '@/lib/types';
import { ShieldAlert, Building2, History, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      const active = await getCurrentSessionProfile();
      if (!active || active.role !== 'ADMIN') {
        router.push('/login');
      } else {
        setSession(active);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center space-x-2 text-purple-400 font-medium text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Admin yetkisi doğrulanıyor...</span>
      </div>
    );
  }

  if (!session || session.role !== 'ADMIN') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 max-w-md w-full border-rose-500/30">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Erişim Engellendi</h2>
          <p className="text-xs text-slate-400 mb-4">Bu alana yalnızca sistem yöneticileri (ADMIN) erişebilir.</p>
          <Link href="/login" className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'İşletmeler Yönetimi', icon: Building2 },
    { href: '/admin/audit-logs', label: 'Admin Audit Logları', icon: History },
  ];

  return (
    <div className="min-h-[88vh] bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header */}
        <div className="glass-panel p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Sistem Yönetim Paneli (ADMIN)</h1>
                <span className="badge-admin text-[10px] px-2 py-0.5 rounded-full font-semibold">Yönetici</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tüm işletmeleri, dijital menüleri ve admin audit loglarını yönetin</p>
            </div>
          </div>
        </div>

        {/* Sub-nav */}
        <div className="flex space-x-2 border-b border-slate-800 mb-8 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div>{children}</div>

      </div>
    </div>
  );
}
