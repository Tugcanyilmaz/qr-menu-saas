'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicMenuViewer from '@/components/PublicMenuViewer';
import { decodeDemoMenu, demoToViewerData, DEFAULT_DEMO_MENU, DemoMenu } from '@/lib/demoMenu';
import { Sparkles } from 'lucide-react';

/**
 * Demo menü önizleme sayfası.
 * Menü verisi URL'nin # kısmından okunur (sunucuya hiç gitmez, veritabanı gerekmez).
 * Hem /demo sayfasındaki telefon çerçevesinde (iframe) hem de QR okutulunca telefonda açılır.
 */
export default function DemoPreviewPage() {
  const [menu, setMenu] = useState<DemoMenu | null>(null);
  const [inIframe, setInIframe] = useState<boolean>(true);

  useEffect(() => {
    setInIframe(window.self !== window.top);

    const read = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setMenu((hash && decodeDemoMenu(hash)) || DEFAULT_DEMO_MENU);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  if (!menu) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  const { business, categories, products } = demoToViewerData(menu);

  return (
    <div className="min-h-screen bg-slate-950">
      {!inIframe && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Bu bir <strong>demo</strong> menüdür.</span>
          </span>
          <Link href="/register" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-semibold shrink-0">
            Ücretsiz Oluştur
          </Link>
        </div>
      )}
      <PublicMenuViewer business={business} categories={categories} products={products} />
    </div>
  );
}
