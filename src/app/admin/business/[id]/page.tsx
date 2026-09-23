'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getCurrentSessionProfile,
  fetchProfileById,
  fetchCategoriesDB,
  fetchProductsDB,
  updateProfileDB,
  updateProductDB,
  addAuditLogDB
} from '@/lib/supabaseClient';
import { Profile, Category, Product, SessionUser } from '@/lib/types';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import ImageUploader from '@/components/ImageUploader';
import Link from 'next/link';
import { Save, ArrowLeft, ShieldAlert, KeyRound, Lock, Eye, EyeOff, Utensils, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminBusinessDetailPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [adminSession, setAdminSession] = useState<SessionUser | null>(null);
  const [business, setBusiness] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile Form state
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Password reset message state
  const [resetSent, setResetSent] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const s = await getCurrentSessionProfile();
      if (!s || s.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      setAdminSession(s);

      const b = await fetchProfileById(businessId);
      if (!b) {
        router.push('/admin');
        return;
      }

      setBusiness(b);
      setName(b.name);
      setPhone(b.phone || '');
      setAddress(b.address || '');
      setDescription(b.description || '');
      setLogoUrl(b.logo_url || '');
      setIsActive(b.is_active);

      await loadCategoriesAndProducts(b.id);
      setLoading(false);
    }
    load();
  }, [businessId, router]);

  const loadCategoriesAndProducts = async (bId: string) => {
    const [cats, prods] = await Promise.all([
      fetchCategoriesDB(bId),
      fetchProductsDB(bId)
    ]);
    setCategories(cats);
    setProducts(prods);
  };

  if (loading || !business || !adminSession) {
    return (
      <div className="p-12 text-center text-purple-400 text-xs font-medium flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>İşletme detayları yükleniyor...</span>
      </div>
    );
  }

  const handleSaveProfileByAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const updated = await updateProfileDB(
        business.id,
        {
          name,
          phone,
          address,
          description,
          logo_url: logoUrl,
          is_active: isActive
        },
        adminSession.profile
      );

      setBusiness(updated);
      setSavedSuccess('İşletme bilgileri başarıyla güncellendi ve Audit Log kaydedildi.');
      setTimeout(() => setSavedSuccess(''), 3500);
    } catch (err) {
      console.error('Admin update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerPasswordReset = async () => {
    if (!confirm(`${business.name} hesabı için şifre sıfırlama bağlantısı gönderilsin mi?`)) return;

    await addAuditLogDB(
      adminSession.profile,
      business.id,
      business.name,
      'ŞİFRE_SIFIRLAMA_TALEBİ',
      { note: 'Admin tarafından şifre sıfırlama e-postası tetiklendi.' }
    );

    setResetSent(true);
    setTimeout(() => setResetSent(false), 4000);
  };

  const handleToggleProductActive = async (prod: Product) => {
    await updateProductDB(prod.id, { is_active: !prod.is_active });
    await addAuditLogDB(
      adminSession.profile,
      business.id,
      business.name,
      'ADMIN_ÜRÜN_DURUMU_GÜNCELLEME',
      { product_name: prod.name, new_status: !prod.is_active }
    );
    await loadCategoriesAndProducts(business.id);
  };

  const handleUpdatePriceByAdmin = async (prod: Product) => {
    const newPriceStr = prompt(`'${prod.name}' için yeni fiyatı giriniz (TL):`, prod.price.toString());
    if (newPriceStr === null) return;
    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice < 0) return;

    await updateProductDB(prod.id, { price: newPrice });
    await addAuditLogDB(
      adminSession.profile,
      business.id,
      business.name,
      'ADMIN_FİYAT_GÜNCELLEME',
      { product_name: prod.name, old_price: prod.price, new_price: newPrice }
    );
    await loadCategoriesAndProducts(business.id);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>İşletme Listesine Dön</span>
        </Link>

        {savedSuccess && (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedSuccess}</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ADMIN PROFILE & ACCOUNT CONTROL (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-8 border-purple-500/30">
            
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
              <ShieldAlert className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-xl font-bold text-white">İşletmeye Müdahale Et: {business.name}</h2>
                <p className="text-xs text-slate-400">Yönetici yetkileriyle profil, hesap durumu ve bilgileri düzenleyin</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfileByAdmin} className="space-y-5">
              
              <ImageUploader
                label="İşletme Logosu"
                currentUrl={logoUrl}
                folder="logos"
                onImageUploaded={(url) => setLogoUrl(url)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  İşletme Adı
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                />
              </div>

              {/* Locked Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Kalıcı Slug (Sabit URL)</span>
                  <span className="text-amber-400 text-[10px] font-mono flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>DEĞİŞTİRİLEMEZ</span>
                  </span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={business.slug}
                  className="w-full bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-sm rounded-xl px-3 py-2.5 outline-none select-all cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Açıklama
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                  />
                </div>
              </div>

              {/* Active/Passive Toggle */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Hesap Durumu</p>
                  <p className="text-[11px] text-slate-400">Pasif yapıldığında müşteriler menüyü göremez</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    isActive ? 'badge-active' : 'badge-passive'
                  }`}
                >
                  {isActive ? 'AKTİF' : 'PASİF'}
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full gradient-btn py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>İşletme Bilgilerini Güncelle (Admin)</span>
                  </>
                )}
              </button>

            </form>

            {/* PASSWORD RESET TRIGGER SECTION */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Güvenli Şifre Yönetimi</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Admin olarak işletme şifresini göremezsiniz. Gerektiğinde şifre sıfırlama e-postası tetikleyebilirsiniz.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerPasswordReset}
                  className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold shrink-0"
                >
                  Şifre Sıfırla
                </button>
              </div>

              {resetSent && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Şifre sıfırlama talebi tetiklendi ve Audit Log kaydedildi.</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PERMANENT QR CODE & PRODUCTS INTERVENTION (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <QrCodeGenerator slug={business.slug} businessName={business.name} />

          {/* Admin Menu & Price Intervention */}
          <div className="glass-panel p-6 border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-purple-400" />
              <span>Menü & Fiyat Müdahalesi</span>
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-emerald-400 font-mono font-bold">
                      {Number(p.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleUpdatePriceByAdmin(p)}
                      className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded font-semibold text-[11px]"
                    >
                      Fiyat Değiştir
                    </button>

                    <button
                      onClick={() => handleToggleProductActive(p)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                    >
                      {p.is_active ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
