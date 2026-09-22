'use client';

import { useState, useMemo } from 'react';
import { Profile, Category, Product } from '@/lib/types';
import { Search, MapPin, Phone, Info, ChevronRight, X, Utensils, AlertCircle } from 'lucide-react';

interface PublicMenuViewerProps {
  business: Profile;
  categories: Category[];
  products: Product[];
}

export default function PublicMenuViewer({ business, categories, products }: PublicMenuViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter categories to only active ones
  const activeCategories = useMemo(() => {
    return categories.filter(c => c.is_active);
  }, [categories]);

  // Filter products to active ones & category & search query
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.is_active) return false;

      // Category check
      if (selectedCategory !== 'ALL' && p.category_id !== selectedCategory) {
        return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Group filtered products by Category
  const groupedProducts = useMemo(() => {
    const map = new Map<string, { category: Category; items: Product[] }>();

    activeCategories.forEach(cat => {
      const items = filteredProducts.filter(p => p.category_id === cat.id);
      if (items.length > 0) {
        map.set(cat.id, { category: cat, items });
      }
    });

    return Array.from(map.values());
  }, [activeCategories, filteredProducts]);

  // If business is inactive
  if (!business.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 text-center">
        <div className="glass-panel p-8 max-w-md w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">{business.name}</h2>
          <p className="text-sm text-slate-400">
            Bu işletmenin dijital menüsü şu anda geçici olarak hizmete kapalıdır.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-indigo-500 selection:text-white">
      
      {/* 1. TOP COVER / HEADER SECTION */}
      <div className="relative bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-950 pt-8 pb-6 px-4 border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-md mx-auto text-center flex flex-col items-center">
          
          {/* Logo */}
          <div className="relative mb-3 group">
            {business.logo_url ? (
              /* eslint-disable-next-html-element */
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl border-2 border-indigo-500/40 ring-4 ring-slate-900"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl border-2 border-indigo-400/40">
                {business.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Business Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            {business.name}
          </h1>

          {/* Description */}
          {business.description && (
            <p className="text-xs sm:text-sm text-slate-300 max-w-xs mb-3 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Address & Phone Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            {business.address && (
              <span className="flex items-center space-x-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                <MapPin className="w-3 h-3 text-indigo-400" />
                <span className="truncate max-w-[180px]">{business.address}</span>
              </span>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center space-x-1 bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-800 text-indigo-300 transition-colors"
              >
                <Phone className="w-3 h-3 text-indigo-400" />
                <span>{business.phone}</span>
              </a>
            )}
          </div>

        </div>
      </div>

      {/* 2. SEARCH & CATEGORY PILLS BAR (STICKY) */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-3 px-4 shadow-lg">
        <div className="max-w-md mx-auto space-y-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün veya içerik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-xs sm:text-sm rounded-xl pl-9 pr-8 py-2.5 transition-all placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Tüm Ürünler ({products.filter(p => p.is_active).length})
            </button>

            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 3. MENU CONTENT / PRODUCT LIST */}
      <main className="max-w-md mx-auto px-4 pt-6">
        {groupedProducts.length === 0 ? (
          <div className="glass-panel p-8 text-center my-8">
            <Utensils className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium text-sm">Ürün bulunamadı</p>
            <p className="text-slate-500 text-xs mt-1">Arama kriterlerinizi değiştirmeyi deneyin.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedProducts.map(({ category, items }) => (
              <section key={category.id} className="scroll-mt-36">
                
                {/* Category Header */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-5 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    {category.name}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">({items.length})</span>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 gap-3">
                  {items.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="glass-panel p-3.5 rounded-2xl flex items-center space-x-3.5 cursor-pointer hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all duration-200 group active:scale-[0.99]"
                    >
                      {/* Product Image */}
                      {product.image_url ? (
                        /* eslint-disable-next-html-element */
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover shrink-0 bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center text-slate-600">
                          <Utensils className="w-8 h-8" />
                        </div>
                      )}

                      {/* Product Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors truncate">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            {Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </span>
                          <span className="text-[11px] font-medium text-indigo-400 flex items-center group-hover:translate-x-0.5 transition-transform">
                            <span>Detay</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </section>
            ))}
          </div>
        )}
      </main>

      {/* 4. PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Image Header */}
            <div className="relative h-64 bg-slate-950 flex items-center justify-center">
              {selectedProduct.image_url ? (
                /* eslint-disable-next-html-element */
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Utensils className="w-16 h-16 text-slate-700" />
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md border border-slate-700/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Details */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
                <span className="text-lg font-bold text-emerald-400 font-mono shrink-0 ml-4">
                  {Number(selectedProduct.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </span>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                  {selectedProduct.description}
                </p>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-full gradient-btn py-3 rounded-xl text-sm font-semibold"
                >
                  Kapat
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-16 text-center text-[11px] text-slate-500 py-4 border-t border-slate-900">
        <p>Powered by <strong className="text-indigo-400">QR Menü SaaS</strong></p>
      </footer>

    </div>
  );
}
