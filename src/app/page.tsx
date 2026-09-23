'use client';

import Link from 'next/link';
import { QrCode, Sparkles, ShieldCheck, Zap, Smartphone, Utensils, ArrowRight, Store, Lock, LogIn } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800/80">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium mb-6 shadow-glow">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>%100 Ücretsiz Dijital QR Menü SaaS Platformu</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Masadaki QR Kodunuz <br className="hidden sm:inline" />
            <span className="gradient-text">Hiçbir Zaman Değişmesin</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Fiyatlarınızı, görsellerinizi, ürünlerinizi veya işletme adınızı dilediğiniz kadar değiştirin. Masaya koyduğunuz baskılı QR kod <strong>sonsuza kadar aynı kalsın</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="gradient-btn w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/30"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Hemen Ücretsiz Kaydolun</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-indigo-500/30 flex items-center justify-center space-x-2 transition-all shadow-lg"
            >
              <LogIn className="w-5 h-5 text-indigo-400" />
              <span>Giriş Yap</span>
            </Link>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="glass-panel p-6 max-w-2xl mx-auto rounded-2xl border-indigo-500/30 text-left text-xs text-slate-300 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Tek Tıkla Hazır Demo Hesapları:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <p className="text-white font-bold mb-1 font-sans flex items-center justify-between">
                  <span>Mavi Kafe & Bistro</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">/mavi-kafe</span>
                </p>
                <p className="text-[11px] text-slate-400">Giriş: mavi@kafe.com / 123456</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <p className="text-white font-bold mb-1 font-sans flex items-center justify-between">
                  <span>Admin Hesabı</span>
                  <span className="text-[10px] text-purple-400 font-mono font-normal">/admin</span>
                </p>
                <p className="text-[11px] text-slate-400">Giriş: admin@qrmenu.com / admin123</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CORE RULE SHOWCASE SECTION */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Neden Sabit Slug ve Kalıcı QR Kod?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Geleneksel QR kodlarında adres değiştiğinde tüm masalardaki pleksileri ve stikerları yenilemek zorunda kalırsınız. Sistemimizde QR Kod <strong>tamamen sabittir</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="glass-panel p-8 rounded-3xl border-slate-800 relative group hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/20">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Sabit URL Slug</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                İşletmeniz kayıt olduğunda benzersiz bir slug atanır (örneğin <code>/mavi-kafe</code>). İşletme adınız "Mavi Cafe & Restaurant" olsa bile URL'niz değişmez.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-slate-800 relative group hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/20">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Tek Sefer Baskı</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                QR kodunuzu bir defa indirin, masalarınıza koyun. Fiyat artışlarında veya yeni ürün eklendiğinde yeniden QR basmanıza gerek kalmaz.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-slate-800 relative group hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Anında Güncellenen Menü</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Müşteri QR kodu okuttuğu anda en güncel ürünleri, fiyatları ve stok durumunu doğrudan mobil web arayüzünde görüntüler. PDF yükleme derdi yok!
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>Dijital QR Menü SaaS — Next.js, TypeScript & Supabase ile güçlendirilmiştir.</p>
      </footer>

    </div>
  );
}
