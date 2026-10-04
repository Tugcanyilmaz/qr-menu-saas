import type { Profile, Category, Product } from './types';

/**
 * Demo menü verisi. Veritabanına kaydedilmez; tamamı URL'nin # kısmına
 * sıkıştırılarak QR koda gömülür. Böylece ziyaretçi QR'ı telefonla okuttuğunda
 * hiçbir kayıt yapmadan kendi oluşturduğu menüyü görür.
 */
export interface DemoProduct {
  name: string;
  price: number;
  description: string;
}

export interface DemoCategory {
  name: string;
  products: DemoProduct[];
}

export interface DemoMenu {
  name: string;
  description: string;
  categories: DemoCategory[];
}

export const DEMO_LIMITS = {
  categories: 4,
  productsPerCategory: 5,
  nameLength: 40,
  descriptionLength: 60,
};

export const DEFAULT_DEMO_MENU: DemoMenu = {
  name: 'Demo Kafe',
  description: 'Taze kahveler ve ev yapımı tatlılar',
  categories: [
    {
      name: 'Sıcak İçecekler',
      products: [
        { name: 'Türk Kahvesi', price: 90, description: 'Közde pişmiş, lokum eşliğinde' },
        { name: 'Caffè Latte', price: 140, description: 'Espresso ve buğulanmış süt' },
        { name: 'Çay', price: 30, description: 'İnce belli bardakta' },
      ],
    },
    {
      name: 'Tatlılar',
      products: [
        { name: 'San Sebastian', price: 180, description: 'Akışkan kıvamlı cheesecake' },
        { name: 'Brownie', price: 120, description: 'Sıcak servis, dondurma ile' },
      ],
    },
  ],
};

// Kompakt dizi formatı: [ad, açıklama, [[kategoriAdı, [[ürünAdı, fiyat, açıklama], ...]], ...]]
type Packed = [string, string, [string, [string, number, string][]][]];

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeDemoMenu(menu: DemoMenu): string {
  const packed: Packed = [
    menu.name.trim().slice(0, DEMO_LIMITS.nameLength),
    menu.description.trim().slice(0, DEMO_LIMITS.descriptionLength),
    menu.categories
      .filter(c => c.name.trim())
      .slice(0, DEMO_LIMITS.categories)
      .map(c => [
        c.name.trim().slice(0, DEMO_LIMITS.nameLength),
        c.products
          .filter(p => p.name.trim())
          .slice(0, DEMO_LIMITS.productsPerCategory)
          .map(p => [
            p.name.trim().slice(0, DEMO_LIMITS.nameLength),
            Number(p.price) || 0,
            p.description.trim().slice(0, DEMO_LIMITS.descriptionLength),
          ] as [string, number, string]),
      ] as [string, [string, number, string][]]),
  ];
  return toBase64Url(JSON.stringify(packed));
}

export function decodeDemoMenu(encoded: string): DemoMenu | null {
  try {
    const packed = JSON.parse(fromBase64Url(encoded)) as Packed;
    if (!Array.isArray(packed) || packed.length < 3) return null;
    return {
      name: String(packed[0] || 'Demo İşletme'),
      description: String(packed[1] || ''),
      categories: (packed[2] || []).map(([cName, prods]) => ({
        name: String(cName),
        products: (prods || []).map(([pName, price, desc]) => ({
          name: String(pName),
          price: Number(price) || 0,
          description: String(desc || ''),
        })),
      })),
    };
  } catch {
    return null;
  }
}

/** Demo veriyi mevcut PublicMenuViewer bileşeninin beklediği tiplere çevirir */
export function demoToViewerData(menu: DemoMenu): {
  business: Profile;
  categories: Category[];
  products: Product[];
} {
  const now = new Date().toISOString();
  const business: Profile = {
    id: 'demo',
    role: 'BUSINESS',
    name: menu.name || 'Demo İşletme',
    slug: 'demo',
    logo_url: null,
    phone: null,
    address: null,
    description: menu.description || null,
    is_active: true,
    created_at: now,
  };

  const categories: Category[] = [];
  const products: Product[] = [];

  menu.categories.forEach((c, ci) => {
    const catId = `demo-cat-${ci}`;
    categories.push({
      id: catId,
      business_id: 'demo',
      name: c.name,
      sort_order: ci,
      is_active: true,
      created_at: now,
    });
    c.products.forEach((p, pi) => {
      products.push({
        id: `demo-prod-${ci}-${pi}`,
        business_id: 'demo',
        category_id: catId,
        name: p.name,
        description: p.description || null,
        price: p.price,
        image_url: null,
        sort_order: pi,
        is_active: true,
        created_at: now,
      });
    });
  });

  return { business, categories, products };
}
