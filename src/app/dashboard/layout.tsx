'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockStore } from '@/lib/mockStore';
import { SessionUser } from '@/lib/types';
import { QrCode, Utensils, Settings, ExternalLink, ShieldCheck, Store, Lock } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    const active = mockStore.getCurrentSession();
    if (!active) {
      router.push('/login');
    } else {
      setSession(active);
    }
  }, [router, pathname]);

  if (!session) return null;

  const navItems = [
    { href: '/dashboard', label: 'QR Kod & Genel Bakış', icon: QrCode },
    { href: '/dashboard/menu', label: 'Kategori & Ürün Yönetimi', icon: Utensils },
  ];

  return (
    <div className="min-h-[88vh] bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header Card */}
        <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-slate-800">
          <div className="flex items-center space-x-4">
            {session.profile.logo_url ? (
              /* eslint-disable-next-html-element */
              <img
                src={session.profile.logo_url}
                alt={session.profile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-2xl border border-indigo-500/30">
                <Store className="w-8 h-8" />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{session.profile.name}</h1>
                <span className="badge-active text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {session.profile.is_active ? 'Aktif Hesab' : 'Pasif Hesab'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-mono">
                <span className="flex items-center space-x-1 text-slate-300">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Kalıcı Slug:</span>
                  <strong className="text-indigo-400 font-bold">/{session.profile.slug}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href={`/${session.profile.slug}`}
              target="_blank"
              className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Canlı Menüyü Gör</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div>{children}</div>

      </div>
    </div>
  );
}
