'use client';

import { useState, useEffect } from 'react';
import { mockStore } from '@/lib/mockStore';
import { SessionUser, Profile } from '@/lib/types';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import ImageUploader from '@/components/ImageUploader';
import { Save, Lock, Building, Phone, MapPin, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    const s = mockStore.getCurrentSession();
    if (s) {
      setSession(s);
      setName(s.profile.name);
      setPhone(s.profile.phone || '');
      setAddress(s.profile.address || '');
      setDescription(s.profile.description || '');
      setLogoUrl(s.profile.logo_url || '');
    }
  }, []);

  if (!session) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated = mockStore.updateProfile(session.profile.id, {
      name,
      phone,
      address,
      description,
      logo_url: logoUrl
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: QR CODE GENERATOR & PRINT CENTER (5 COLS) */}
      <div className="lg:col-span-5 space-y-6">
        <QrCodeGenerator
          slug={session.profile.slug}
          businessName={session.profile.name}
        />
      </div>

      {/* RIGHT COLUMN: BUSINESS PROFILE EDIT FORM (7 COLS) */}
      <div className="lg:col-span-7">
        <div className="glass-panel p-6 sm:p-8 border-slate-800">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">İşletme Bilgileri</h2>
              <p className="text-xs text-slate-400">Menünüzde gösterilecek işletme profilini yönetin</p>
            </div>
            {saved && (
              <span className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Kaydedildi!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            {/* Logo Uploader */}
            <ImageUploader
              label="İşletme Logosu"
              currentUrl={logoUrl}
              folder="logos"
              onImageUploaded={(url) => setLogoUrl(url)}
            />

            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                İşletme Adı *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="Mavi Kafe & Restaurant"
                />
              </div>
            </div>

            {/* IMMUTABLE SLUG FIELD (PERMANENT RULE DISPLAY) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Kalıcı Slug / URL Adresi</span>
                <span className="text-[10px] text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Kilitli & Değiştirilemez</span>
                </span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  disabled
                  value={session.profile.slug}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-400 font-mono text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none select-all cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                İşletme adınızı güncelleyebilirsiniz (Örn: "Mavi Kafe" yerine "Mavi Cafe & Restaurant" yapabilirsiniz), ancak URL adresiniz (<strong>/{session.profile.slug}</strong>) ve QR kodunuz sabit kalır.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kısa Açıklama / Slogan
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                  placeholder="İşletmeniz hakkında kısa bir bilgi veya slogan..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Telefon
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                    placeholder="+90 532 000 0000"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Adres
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none transition-colors"
                    placeholder="Kadıköy / İstanbul"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="gradient-btn py-3 px-6 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Profil Bilgilerini Kaydet</span>
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
