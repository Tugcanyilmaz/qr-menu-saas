'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerBusinessUser } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Store, Mail, KeyRound, Link as LinkIcon, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [customSlug, setCustomSlug] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleNameChange = (val: string) => {
    setBusinessName(val);
    // Auto generate clean slug
    const clean = val
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setCustomSlug(clean);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !email.trim() || !password) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerBusinessUser(businessName, email, password, customSlug);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        
        <div className="glass-panel p-8 shadow-2xl relative overflow-hidden border-slate-800">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">İşletmenizi Ücretsiz Kaydedin</h2>
            <p className="text-xs text-slate-400 mt-1">
              Dakikalar içinde dijital QR menünüzü oluşturun ve masalarınıza koyun.
            </p>
          </div>

          {/* PERMANENT SLUG RULE BANNER */}
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-start space-x-3 text-xs text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">Sonsuza Kadar Sabit QR Kod Garantisi</p>
              <p className="text-slate-300 leading-relaxed">
                Kayıt anında belirlenen <strong>Slug (URL Adresi)</strong> sabit kalır. İleride işletme adınızı veya ürünlerinizi değiştirseniz bile basılı QR kodunuz <strong>hiçbir zaman değişmeyecektir</strong>.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                İşletme Adı *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="Örn: Mavi Kafe & Bistro"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Kalıcı Menü Slug / URL Adresi</span>
                <span className="text-[10px] text-amber-400 lowercase font-normal">(Kayıt sonrası değiştirilemez)</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-indigo-300 font-mono text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="mavi-kafe"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Menü URL'niz: <span className="text-emerald-400 font-bold">domain.com/{customSlug || 'isletme-slug'}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                E-Posta Adresi *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="iletisim@mavikafe.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Şifre *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
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
              className="w-full gradient-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 mt-4 shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kayıt Yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Hesabımı Oluştur ve Menümü Hazırla</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
              Giriş Yapın
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
