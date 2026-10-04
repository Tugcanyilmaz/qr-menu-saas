'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  DEFAULT_DEMO_MENU, DEMO_LIMITS, DemoMenu, DemoCategory, encodeDemoMenu,
} from '@/lib/demoMenu';
import {
  Store, Plus, Trash2, Smartphone, QrCode as QrIcon, Sparkles, ArrowRight, RotateCcw, ExternalLink, Utensils,
} from 'lucide-react';

const inputCls =
  'w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none transition-colors';

export default function DemoBuilderPage() {
  const [menu, setMenu] = useState<DemoMenu>(DEFAULT_DEMO_MENU);
  const [origin, setOrigin] = useState<string>('');
  const [qrError, setQrError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const encoded = useMemo(() => encodeDemoMenu(menu), [menu]);
  const previewPath = `/demo/onizleme#${encoded}`;
  const previewUrl = origin ? `${origin}${previewPath}` : '';

  // QR kodu menü her değiştiğinde yeniden çiz
  useEffect(() => {
    if (!canvasRef.current || !previewUrl) return;
    QRCode.toCanvas(
      canvasRef.current,
      previewUrl,
      { width: 220, margin: 1, errorCorrectionLevel: 'L', color: { dark: '#0f172a', light: '#ffffff' } },
      (err) => {
        setQrError(err ? 'Menü QR koda sığmayacak kadar uzun. Birkaç ürün veya açıklama kaldırın.' : '');
      }
    );
  }, [previewUrl]);

  // --- düzenleme yardımcıları ---
  const updateCategory = (ci: number, patch: Partial<DemoCategory>) =>
    setMenu(m => ({
      ...m,
      categories: m.categories.map((c, i) => (i === ci ? { ...c, ...patch } : c)),
    }));

  const addCategory = () =>
    setMenu(m => ({
      ...m,
      categories: [...m.categories, { name: 'Yeni Kategori', products: [{ name: 'Yeni Ürün', price: 100, description: '' }] }],
    }));

  const removeCategory = (ci: number) =>
    setMenu(m => ({ ...m, categories: m.categories.filter((_, i) => i !== ci) }));

  const addProduct = (ci: number) =>
    updateCategory(ci, {
      products: [...menu.categories[ci].products, { name: 'Yeni Ürün', price: 100, description: '' }],
    });

  const updateProduct = (ci: number, pi: number, field: 'name' | 'price' | 'description', value: string) =>
    updateCategory(ci, {
      products: menu.categories[ci].products.map((p, i) =>
        i === pi ? { ...p, [field]: field === 'price' ? Number(value) || 0 : value } : p
      ),
    });

  const removeProduct = (ci: number, pi: number) =>
    updateCategory(ci, { products: menu.categories[ci].products.filter((_, i) => i !== pi) });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Başlık */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kayıt olmadan deneyin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Menünüzü <span className="gradient-text">30 saniyede</span> oluşturun
          </h1>
          <p className="text-sm text-slate-400">
            Soldan işletme adınızı ve ürünlerinizi yazın, sağda anında görün. QR kodu telefonunuzla okutun,
            müşterilerinizin menüyü nasıl göreceğini deneyimleyin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SOL: Düzenleyici */}
          <div className="lg:col-span-7 space-y-6">

            <div className="glass-panel p-6 border-slate-800">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">1</span>
                <Store className="w-4 h-4 text-indigo-400" />
                <span>İşletme Bilgileri</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">İşletme Adı</label>
                  <input
                    className={inputCls}
                    value={menu.name}
                    maxLength={DEMO_LIMITS.nameLength}
                    onChange={e => setMenu(m => ({ ...m, name: e.target.value }))}
                    placeholder="Örn: Mavi Kafe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Kısa Açıklama</label>
                  <input
                    className={inputCls}
                    value={menu.description}
                    maxLength={DEMO_LIMITS.descriptionLength}
                    onChange={e => setMenu(m => ({ ...m, description: e.target.value }))}
                    placeholder="Örn: Nitelikli kahve ve tatlılar"
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">2</span>
                  <Utensils className="w-4 h-4 text-indigo-400" />
                  <span>Kategoriler & Ürünler</span>
                </h2>
                <button
                  onClick={() => setMenu(DEFAULT_DEMO_MENU)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                  title="Örnek menüye dön"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla</span>
                </button>
              </div>

              <div className="space-y-5">
                {menu.categories.map((cat, ci) => (
                  <div key={ci} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        className={`${inputCls} font-semibold`}
                        value={cat.name}
                        maxLength={DEMO_LIMITS.nameLength}
                        onChange={e => updateCategory(ci, { name: e.target.value })}
                        placeholder="Kategori adı"
                      />
                      <button
                        onClick={() => removeCategory(ci)}
                        className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
                        title="Kategoriyi sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-indigo-500/30">
                      {cat.products.map((p, pi) => (
                        <div key={pi} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            className={`${inputCls} col-span-7 sm:col-span-4`}
                            value={p.name}
                            maxLength={DEMO_LIMITS.nameLength}
                            onChange={e => updateProduct(ci, pi, 'name', e.target.value)}
                            placeholder="Ürün adı"
                          />
                          <div className="relative col-span-4 sm:col-span-2">
                            <input
                              type="number"
                              min={0}
                              className={`${inputCls} pr-6`}
                              value={p.price}
                              onChange={e => updateProduct(ci, pi, 'price', e.target.value)}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">₺</span>
                          </div>
                          <input
                            className={`${inputCls} col-span-11 sm:col-span-5 order-last sm:order-none`}
                            value={p.description}
                            maxLength={DEMO_LIMITS.descriptionLength}
                            onChange={e => updateProduct(ci, pi, 'description', e.target.value)}
                            placeholder="Açıklama (isteğe bağlı)"
                          />
                          <button
                            onClick={() => removeProduct(ci, pi)}
                            className="col-span-1 p-2 text-slate-500 hover:text-rose-400 justify-self-center"
                            title="Ürünü sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {cat.products.length < DEMO_LIMITS.productsPerCategory && (
                        <button
                          onClick={() => addProduct(ci)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 pt-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ürün Ekle</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {menu.categories.length < DEMO_LIMITS.categories && (
                  <button
                    onClick={addCategory}
                    className="w-full py-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-300 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kategori Ekle</span>
                  </button>
                )}

                <p className="text-[11px] text-slate-500">
                  Demo sürümünde en fazla {DEMO_LIMITS.categories} kategori ve kategori başına {DEMO_LIMITS.productsPerCategory} ürün eklenebilir.
                  Kayıt olduğunuzda sınırsız ürün, fotoğraf ve logo ekleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="glass-panel p-6 border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-white">Beğendiniz mi? Menünüzü kalıcı hale getirin.</p>
                <p className="text-xs text-slate-400 mt-0.5">Ücretsiz kaydolun, masanıza koyacağınız kalıcı QR kodunuzu alın.</p>
              </div>
              <Link
                href="/register"
                className="gradient-btn px-5 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 shrink-0 shadow-lg"
              >
                <span>Ücretsiz Kaydol</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* SAĞ: Telefon önizleme + QR */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                <span>Canlı Önizleme</span>
              </p>
              {/* Telefon çerçevesi */}
              <div className="relative w-[300px] h-[600px] rounded-[2.75rem] border-[10px] border-slate-800 bg-slate-950 shadow-2xl shadow-indigo-900/30 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-2xl z-10" />
                {origin && (
                  <iframe
                    src={previewPath}
                    title="Menü önizleme"
                    className="w-full h-full border-0 bg-slate-950"
                  />
                )}
              </div>
            </div>

            <div className="glass-panel p-5 border-slate-800 flex items-center gap-5">
              <div className="p-2 bg-white rounded-xl shrink-0">
                <canvas ref={canvasRef} className="block w-[130px] h-[130px]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white flex items-center space-x-1.5 mb-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">3</span>
                  <QrIcon className="w-4 h-4 text-indigo-400" />
                  <span>Telefonda Deneyin</span>
                </p>
                {qrError ? (
                  <p className="text-xs text-amber-300">{qrError}</p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Telefonunuzun kamerasıyla QR kodu okutun. Müşterileriniz menünüzü tam olarak böyle görecek.
                  </p>
                )}
                <a
                  href={previewPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Yeni sekmede aç</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
