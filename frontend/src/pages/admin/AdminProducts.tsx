import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [specialPrice, setSpecialPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [size, setSize] = useState('Regular');
  const [description, setDescription] = useState('');
  const [spiritualSignificance, setSpiritualSignificance] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (selectedCategory !== 'all') q.set('category', selectedCategory);

      const [pRes, cRes] = await Promise.all([
        api.get(`/admin/products?${q.toString()}`),
        api.get('/products/categories')
      ]);

      if (pRes.success) setProducts(pRes.products || []);
      if (cRes.success) {
        setCategories(cRes.categories || []);
        if (cRes.categories.length > 0 && !categoryId) {
          setCategoryId(cRes.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const openAddModal = () => {
    setEditingProduct(null);
    setCode(String(products.length + 1).padStart(4, '0'));
    setName('');
    setBasePrice('');
    setSpecialPrice('');
    setStock('25');
    setSize('Regular');
    setDescription('');
    setSpiritualSignificance('');
    setImageUrl('https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=800');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: any) => {
    setEditingProduct(prod);
    setCode(prod.productCode);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setBasePrice(String(prod.basePrice));
    setSpecialPrice(prod.specialPrice ? String(prod.specialPrice) : '');
    const firstVariant = prod.variants?.[0];
    setStock(firstVariant ? String(firstVariant.stock) : '0');
    setSize(firstVariant ? firstVariant.size : 'Regular');
    setDescription(prod.description || '');
    setSpiritualSignificance(prod.spiritualSignificance || '');
    setImageUrl(prod.images?.[0]?.url || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update
        const res = await api.put(`/admin/products/${editingProduct.id}`, {
          name,
          categoryId,
          basePrice,
          specialPrice: specialPrice || null,
          description,
          spiritualSignificance,
          imageUrl: imageUrl || undefined
        });
        if (res.success) {
          alert('Product updated successfully.');
          setIsModalOpen(false);
          fetchProducts();
        }
      } else {
        // Create
        const res = await api.post('/admin/products', {
          productCode: code,
          name,
          categoryId,
          basePrice,
          specialPrice: specialPrice || null,
          description,
          spiritualSignificance,
          imageUrl: imageUrl || undefined,
          variants: [{ size, price: basePrice, specialPrice: specialPrice || null, stock }]
        });
        if (res.success) {
          alert('Product created successfully.');
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-black text-slate-900">Product Inventory Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage the 71 products imported from Excel portfolio</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-luxury flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sacred Product</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by code (0001) or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Variants / Size</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading sacred products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No products matched your criteria.</td>
                </tr>
              ) : (
                products.map((prod) => {
                  const totalStock = prod.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
                  const primaryImg = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{prod.productCode}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 hover:text-amber-700">{prod.name}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-xs">{prod.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{prod.category?.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {prod.variants?.map((v: any) => (
                          <span key={v.id} className="inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[10px] mr-1 font-semibold">
                            {v.size}
                          </span>
                        ))}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          totalStock === 0 ? 'bg-red-100 text-red-700' :
                          totalStock <= 10 ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {totalStock === 0 ? 'Out of Stock' : `${totalStock} units`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ₹{(prod.specialPrice || prod.basePrice).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-500 hover:text-vedic-navy hover:bg-slate-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  {editingProduct ? `Edit Product #${code}` : 'Add New Sacred Creation'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Product Code *</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingProduct}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. 0072"
                      className="w-full border border-slate-200 rounded-xl p-2.5 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Consecrated Surya Yantra"
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Base Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="1500"
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Special / Discount Price (₹)</label>
                    <input
                      type="number"
                      value={specialPrice}
                      onChange={(e) => setSpecialPrice(e.target.value)}
                      placeholder="1200 (Optional)"
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  {!editingProduct && (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Size Variant</label>
                        <input
                          type="text"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          placeholder="3/3 Big or Regular"
                          className="w-full border border-slate-200 rounded-xl p-2.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Initial Stock Qty</label>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          placeholder="25"
                          className="w-full border border-slate-200 rounded-xl p-2.5"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Image URL (Unsplash or uploaded)</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Description & Lore</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Spiritual Significance & Mantras</label>
                    <textarea
                      rows={2}
                      value={spiritualSignificance}
                      onChange={(e) => setSpiritualSignificance(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-xl shadow-sm"
                  >
                    {editingProduct ? 'Save Updates' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
