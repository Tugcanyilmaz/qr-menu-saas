'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentSessionProfile, logoutUser } from '@/lib/supabaseClient';
import { SessionUser } from '@/lib/types';
import { QrCode, Store, ShieldAlert, LogOut, Sparkles, LayoutDashboard, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    async function loadSession() {
      const active = await getCurrentSessionProfile();
      setSession(active);
    }
    loadSession();
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    setSession(null);
    router.push('/');
  };

  // Hide main navbar on public customer menu route
  const isPublicMenu = pathname !== '/' &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/register');

  if (isPublicMenu) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text tracking-tight">QR Menü SaaS</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Ücretsiz MVP
              </span>
            </div>
          </Link>

          {/* Nav Links & Session Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {session ? (
              <>
                {/* Admin Link if Admin */}
                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                    <span>Admin Paneli</span>
                  </Link>
                )}

                {/* Business Dashboard Link */}
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/dashboard')
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">İşletme Paneli</span>
                  <span className="sm:hidden">Panel</span>
                </Link>

                {/* Live Menu Link */}
                <Link
                  href={`/${session.profile.slug}`}
                  target="_blank"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Canlı Menü</span>
                </Link>

                {/* User Info & Logout */}
                <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-semibold text-slate-200">{session.profile.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{session.role}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Çıkış Yap"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center space-x-1 text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Çıkış Yap</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <span>Giriş Yap</span>
                </Link>

                <Link
                  href="/register"
                  className="gradient-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ücretsiz Kaydol</span>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
