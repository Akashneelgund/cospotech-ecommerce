import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Grid,
  List,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { Product, Category } from '../types';
import { api } from '../services/api';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filter States
  const currentCategory = searchParams.get('category') || 'all';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSize = searchParams.get('size') || 'all';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Load Categories on mount
  useEffect(() => {
    api.get('/products/categories')
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(console.error);
  }, []);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Fetch Products whenever query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentCategory && currentCategory !== 'all') query.set('category', currentCategory);
        if (currentSearch) query.set('search', currentSearch);
        if (currentSort) query.set('sort', currentSort);
        if (currentMinPrice) query.set('minPrice', currentMinPrice);
        if (currentMaxPrice) query.set('maxPrice', currentMaxPrice);
        if (currentSize && currentSize !== 'all') query.set('size', currentSize);
        if (currentInStock) query.set('inStock', 'true');
        query.set('page', currentPage.toString());
        query.set('limit', '24');

        const res = await api.get(`/products?${query.toString()}`);
        if (res.success) {
          setProducts(res.products || []);
          setTotalProducts(res.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const availableSizes = ['3/3 Big', '2/2 Small', 'Regular', 'Big', 'Small'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Header Breadcrumbs & Title */}
      <div className="mb-8">
        <div className="text-xs text-slate-400 mb-2">
          <span>Home</span> <span className="mx-1.5">/</span> <span className="text-slate-700 font-medium">Sacred Catalog</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-slate-900">
              {currentCategory !== 'all'
                ? categories.find((c) => c.slug === currentCategory)?.name || 'Sacred Collection'
                : 'All Consecrated Artefacts'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {products.length} of {totalProducts} sanctified creations
            </p>
          </div>

          {/* Controls Bar: Sort & View Mode */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Sort By:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="Sort products by"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-vedic-gold shadow-sm"
              >
                <option value="featured">Featured / Consecrated</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="bestseller">Best Selling</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode Grid/List */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-slate-100 text-vedic-navy' : 'text-slate-400'}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-slate-100 text-vedic-navy' : 'text-slate-400'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-vedic-border/70 shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-vedic-gold" />
              <span>Filters</span>
            </h3>
            {(currentCategory !== 'all' || currentSearch || currentMinPrice || currentMaxPrice || currentSize !== 'all' || currentInStock) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Search within catalog */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Search Sacred Catalog
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name, code..."
                value={currentSearch}
                onChange={(e) => updateParam('search', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs text-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Sacred Categories
            </label>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => updateParam('category', 'all')}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                  currentCategory === 'all'
                    ? 'bg-vedic-gold/10 font-bold text-vedic-navy'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Collections</span>
                <span className="text-slate-400 text-[10px]">71</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    currentCategory === cat.slug
                      ? 'bg-vedic-gold/10 font-bold text-vedic-navy'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-slate-400 text-[10px]">{cat._count?.products || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size / Variant Filter */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Size / Dimensions
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateParam('size', 'all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  currentSize === 'all'
                    ? 'bg-vedic-navy text-white border-vedic-navy'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                All
              </button>
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateParam('size', sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    currentSize === sz
                      ? 'bg-vedic-navy text-white border-vedic-navy'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* In-Stock Filter */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded text-vedic-gold focus:ring-vedic-gold"
              />
              <span className="text-xs font-semibold text-slate-700">In-Stock Only</span>
            </label>
          </div>

          {/* Price Range Inputs */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                placeholder="Min"
                value={currentMinPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                value={currentMaxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse p-4 space-y-4 border border-slate-100">
                  <div className="bg-slate-200 h-48 rounded-xl" />
                  <div className="bg-slate-200 h-4 rounded w-3/4" />
                  <div className="bg-slate-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800">No Sacred Artefacts Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn&apos;t find any matching products for your selected filters. Try broadening your search or resetting filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white text-xs font-bold rounded-full transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {products.map((product) => {
                const defaultVariant = product.variants?.[0];
                const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
                const price = defaultVariant?.specialPrice || defaultVariant?.price || product.basePrice;

                return (
                  <div
                    key={product.id}
                    className="bg-white p-4 rounded-2xl border border-vedic-border/70 hover:border-vedic-gold/60 shadow-card flex flex-col sm:flex-row gap-4 items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';
                        }}
                      />
                      <div>
                        <div className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider">
                          {product.category?.name} • Code: {product.productCode}
                        </div>
                        <h4 className="font-serif font-bold text-base text-slate-900 mt-0.5">
                          {product.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-md mt-1">
                          {product.description}
                        </p>
                        <div className="text-xs font-medium text-slate-600 mt-1">
                          Size: <span className="font-bold">{defaultVariant?.size || 'Regular'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="text-base font-extrabold text-slate-900">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="px-4 py-2 bg-vedic-navy hover:bg-vedic-gold text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer Modal mounted via Portal */}
      {isMobileFilterOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-[999] flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div className="relative ml-auto w-[85vw] max-w-sm bg-white h-screen h-[100dvh] shadow-2xl flex flex-col z-[1000] animate-in slide-in-from-right duration-300 overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <span>Filter Sacred Artefacts</span>
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="p-4 space-y-5 flex-1">
                {/* Reset if active */}
                {(currentCategory !== 'all' || currentSearch || currentMinPrice || currentMaxPrice || currentSize !== 'all' || currentInStock) && (
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full py-2 text-xs text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                )}

                {/* Search Within Catalog */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Search Within Catalog
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Product name, code..."
                      value={currentSearch}
                      onChange={(e) => updateParam('search', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-800"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sacred Categories
                  </label>
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        updateParam('category', 'all');
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-xl flex items-center justify-between transition-colors ${
                        currentCategory === 'all'
                          ? 'bg-amber-100 font-bold text-amber-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>All Collections</span>
                      <span className="text-slate-400 text-[10px]">71</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          updateParam('category', cat.slug);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-xl flex items-center justify-between transition-colors ${
                          currentCategory === cat.slug
                            ? 'bg-amber-100 font-bold text-amber-900'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-slate-400 text-[10px]">{cat._count?.products || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Size / Dimensions
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => updateParam('size', 'all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        currentSize === 'all'
                          ? 'bg-vedic-navy text-white border-vedic-navy'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      All
                    </button>
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => updateParam('size', sz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          currentSize === sz
                            ? 'bg-vedic-navy text-white border-vedic-navy'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In-Stock */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentInStock}
                      onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-700">In-Stock Only</span>
                  </label>
                </div>

                {/* Price Range */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Price Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={currentMinPrice}
                      onChange={(e) => updateParam('minPrice', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={currentMaxPrice}
                      onChange={(e) => updateParam('maxPrice', e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Apply & View ({totalProducts}) Artefacts
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
