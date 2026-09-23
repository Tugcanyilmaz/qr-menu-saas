'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/supabaseClient';
import Link from 'next/link';
import { LogIn, Sparkles, Store, ShieldAlert, KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionUser = await loginUser(email, password);
      
      if (sessionUser.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Giriş yapılamadı. Şifre veya e-posta hatalı olabilir.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="glass-panel p-8 shadow-2xl relative overflow-hidden border-slate-800">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-3 shadow-lg">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Hesabınıza Giriş Yapın</h2>
            <p className="text-xs text-slate-400 mt-1">İşletme veya Admin panelinize erişin</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="ornek@isletme.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 mt-2 shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Form Fill helper */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Örnek Doldurma Yardımcısı
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('mavi@kafe.com', '123456')}
                className="w-full p-2.5 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-xl text-left flex items-center justify-between text-xs text-indigo-200 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium">Mavi Kafe Giriş Bilgileri</span>
                </span>
                <span className="text-[10px] font-mono bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-300">Doldur</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('admin@qrmenu.com', 'admin123')}
                className="w-full p-2.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl text-left flex items-center justify-between text-xs text-purple-200 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Admin Giriş Bilgileri</span>
                </span>
                <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">Doldur</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Hemen Ücretsiz Kaydolun
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
