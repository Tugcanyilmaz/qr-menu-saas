'use client';

import { useState, useEffect } from 'react';
import {
  getCurrentSessionProfile,
  fetchCategoriesDB,
  fetchProductsDB,
  addCategoryDB,
  updateCategoryDB,
  deleteCategoryDB,
  addProductDB,
  updateProductDB,
  deleteProductDB
} from '@/lib/supabaseClient';
import { SessionUser, Category, Product } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import { Plus, Edit2, Trash2, Eye, EyeOff, Utensils, Tag, X, Loader2 } from 'lucide-react';

export default function MenuManagementPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES'>('PRODUCTS');

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');

  // Product Modal State
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<string>('');
  const [productCategoryId, setProductCategoryId] = useState<string>('');
  const [productImageUrl, setProductImageUrl] = useState<string>('');
  const [productActive, setProductActive] = useState<boolean>(true);
  const [savingItem, setSavingItem] = useState<boolean>(false);

  // Filter Category State
  const [filterCategoryId, setFilterCategoryId] = useState<string>('ALL');

  useEffect(() => {
    async function init() {
      const s = await getCurrentSessionProfile();
      if (s) {
        setSession(s);
        await loadData(s.profile.id);
      }
      setLoading(false);
    }
    init();
  }, []);

  const loadData = async (businessId: string) => {
    const [cats, prods] = await Promise.all([
      fetchCategoriesDB(businessId),
      fetchProductsDB(businessId)
    ]);
    setCategories(cats);
    setProducts(prods);

    if (cats.length > 0 && !productCategoryId) {
      setProductCategoryId(cats[0].id);
    }
  };

  if (!session) return null;

  // --- Category Handlers ---
  const handleOpenCategoryModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSavingItem(true);
    try {
      if (editingCategory) {
        await updateCategoryDB(editingCategory.id, { name: categoryName });
      } else {
        await addCategoryDB(session.profile.id, categoryName);
      }

      await loadData(session.profile.id);
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Failed to save category:', err);
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    await updateCategoryDB(cat.id, { is_active: !cat.is_active });
    await loadData(session.profile.id);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Bu kategoriyi ve kategorideki tüm ürünleri silmek istediğinize emin misiniz?')) {
      await deleteCategoryDB(id);
      await loadData(session.profile.id);
    }
  };

  // --- Product Handlers ---
  const handleOpenProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProductName(prod.name);
      setProductDescription(prod.description || '');
      setProductPrice(prod.price.toString());
      setProductCategoryId(prod.category_id);
      setProductImageUrl(prod.image_url || '');
      setProductActive(prod.is_active);
    } else {
      setEditingProduct(null);
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductCategoryId(categories[0]?.id || '');
      setProductImageUrl('');
      setProductActive(true);
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productPrice || !productCategoryId) return;

    const priceNum = parseFloat(productPrice);
    setSavingItem(true);

    try {
      if (editingProduct) {
        await updateProductDB(editingProduct.id, {
          name: productName,
          description: productDescription,
          price: priceNum,
          category_id: productCategoryId,
          image_url: productImageUrl,
          is_active: productActive
        });
      } else {
        await addProductDB({
          business_id: session.profile.id,
          category_id: productCategoryId,
          name: productName,
          description: productDescription,
          price: priceNum,
          image_url: productImageUrl,
          sort_order: products.length + 1,
          is_active: productActive
        });
      }

      await loadData(session.profile.id);
      setShowProductModal(false);
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleProductActive = async (prod: Product) => {
    await updateProductDB(prod.id, { is_active: !prod.is_active });
    await loadData(session.profile.id);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      await deleteProductDB(id);
      await loadData(session.profile.id);
    }
  };

  const displayedProducts = products.filter(p => {
    if (filterCategoryId === 'ALL') return true;
    return p.category_id === filterCategoryId;
  });

  return (
    <div className="space-y-6">
      
      {/* Sub-Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Toggle View Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('PRODUCTS')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'PRODUCTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Ürünler ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'CATEGORIES'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Kategoriler ({categories.length})</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {activeTab === 'PRODUCTS' && (
            <button
              onClick={() => handleOpenProductModal()}
              disabled={categories.length === 0}
              className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Ürün Ekle</span>
            </button>
          )}

          <button
            onClick={() => handleOpenCategoryModal()}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Yeni Kategori Ekle</span>
          </button>
        </div>

      </div>

      {categories.length === 0 && !loading && (
        <div className="glass-panel p-8 text-center border-amber-500/30 bg-amber-500/5">
          <Tag className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white mb-1">Henüz Kategori Eklenmemiş</h3>
          <p className="text-xs text-slate-400 mb-4">Ürün ekleyebilmek için önce en az 1 kategori oluşturmanız gerekmektedir.</p>
          <button
            onClick={() => handleOpenCategoryModal()}
            className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold"
          >
            İlk Kategorinizi Oluşturun
          </button>
        </div>
      )}

      {/* ---------------- PRODUCTS TAB ---------------- */}
      {activeTab === 'PRODUCTS' && categories.length > 0 && (
        <div className="space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setFilterCategoryId('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCategoryId === 'ALL'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tümü ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCategoryId(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterCategoryId === c.id
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.name} ({products.filter(p => p.category_id === c.id).length})
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProducts.map((prod) => {
              const catName = categories.find(c => c.id === prod.category_id)?.name || 'Kategorisiz';
              return (
                <div
                  key={prod.id}
                  className={`glass-panel p-4 rounded-2xl flex flex-col justify-between border-slate-800 transition-all ${
                    !prod.is_active ? 'opacity-60 bg-slate-950/60' : 'hover:border-indigo-500/40'
                  }`}
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-40 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800">
                      {prod.image_url ? (
                        /* eslint-disable-next-html-element */
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Utensils className="w-10 h-10" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <span className="absolute top-2 left-2 text-[10px] font-medium bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-indigo-300 border border-slate-700">
                        {catName}
                      </span>

                      {/* Active / Passive Badge */}
                      <button
                        onClick={() => handleToggleProductActive(prod)}
                        className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-1 rounded-md flex items-center space-x-1 backdrop-blur-md transition-colors ${
                          prod.is_active ? 'badge-active' : 'badge-passive'
                        }`}
                        title="Aktif/Pasif Değiştir"
                      >
                        {prod.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{prod.is_active ? 'Aktif' : 'Pasif'}</span>
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-white text-base mb-1">{prod.name}</h3>
                    {prod.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{prod.description}</p>
                    )}
                  </div>

                  {/* Price & Action Toolbar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-2">
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {Number(prod.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenProductModal(prod)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                        title="Ürünü Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors"
                        title="Ürünü Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ---------------- CATEGORIES TAB ---------------- */}
      {activeTab === 'CATEGORIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catProds = products.filter(p => p.category_id === cat.id);
            return (
              <div key={cat.id} className="glass-panel p-5 rounded-2xl border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-base">{cat.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cat.is_active ? 'badge-active' : 'badge-passive'}`}>
                      {cat.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{catProds.length} Ürün</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleCategoryActive(cat)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    title="Aktif/Pasif Yap"
                  >
                    {cat.is_active ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
                  </button>
                  <button
                    onClick={() => handleOpenCategoryModal(cat)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- MODAL: CATEGORY EDIT/CREATE ---------------- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-md w-full border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                  placeholder="Örn: Sıcak Kahveler"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 disabled:opacity-60"
                >
                  {savingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Kaydet</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: PRODUCT EDIT/CREATE ---------------- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel p-6 max-w-lg w-full border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              <ImageUploader
                label="Ürün Görseli"
                currentUrl={productImageUrl}
                folder="products"
                onImageUploaded={(url) => setProductImageUrl(url)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kategori *
                </label>
                <select
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                  placeholder="Örn: Caffè Latte"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fiyat (TL) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-emerald-400 font-mono font-bold text-sm rounded-xl pl-3 pr-8 py-2.5 outline-none"
                    placeholder="180.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₺</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ürün Açıklaması / İçindekiler
                </label>
                <textarea
                  rows={2}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white text-sm rounded-xl px-3 py-2.5 outline-none"
                  placeholder="Örn: Espresso, kadifemsi süt ve taze süt köpüğü."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prodActive"
                  checked={productActive}
                  onChange={(e) => setProductActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="prodActive" className="text-xs font-medium text-slate-300 cursor-pointer">
                  Müşteri Menüsünde Aktif Gösterilsin
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="gradient-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 disabled:opacity-60"
                >
                  {savingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Ürünü Kaydet</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
