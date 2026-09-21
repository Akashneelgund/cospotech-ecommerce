import React, { useEffect, useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Clock,
  Tag,
  CheckCircle,
  X,
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { FlashSale, Product } from '../../types';

export const AdminFlashSales: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    bannerImage: '',
    discountPercent: 20,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
    selectedProductIds: [] as string[]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes] = await Promise.all([
        api.get('/marketing/admin/flash-sales'),
        api.get('/products?limit=100')
      ]);
      if (salesRes.success) setFlashSales(salesRes.flashSales || []);
      if (prodRes.success) setProducts(prodRes.products || []);
    } catch (err) {
      console.error('Failed to load flash sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.endDate) return;

    try {
      const res = await api.post('/marketing/admin/flash-sales', {
        title: form.title,
        description: form.description,
        bannerImage: form.bannerImage,
        discountPercent: Number(form.discountPercent),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        productIds: form.selectedProductIds.length > 0
          ? form.selectedProductIds
          : products.slice(0, 6).map(p => p.id)
      });

      if (res.success) {
        setShowModal(false);
        setForm({
          title: '',
          description: '',
          bannerImage: '',
          discountPercent: 20,
          startDate: new Date().toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
          selectedProductIds: []
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create flash sale.');
    }
  };

  const handleToggle = async (sale: FlashSale) => {
    try {
      await api.put(`/marketing/admin/flash-sales/${sale.id}`, { isActive: !sale.isActive });
      fetchData();
    } catch (err) {
      console.error('Failed to toggle flash sale:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this flash sale event?')) return;
    try {
      await api.delete(`/marketing/admin/flash-sales/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete flash sale:', err);
    }
  };

  const toggleProductSelect = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(id)
        ? prev.selectedProductIds.filter(x => x !== id)
        : [...prev.selectedProductIds, id]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Flame className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span>Sacred Flash Sales & Timed Drops</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Orchestrate limited-window discounts, Muhurta festive sales, and live countdown timers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flash Sale</span>
          </button>
        </div>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading flash sales...</div>
      ) : flashSales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-slate-800">No Flash Sales Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Schedule a high-converting flash sale event with countdown timers and storewide or targeted percentage off.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 px-4 py-2 bg-vedic-navy text-white text-xs font-bold rounded-xl"
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.map((s) => {
            const isExpired = new Date(s.endDate) < new Date();
            let pIds: string[] = [];
            try {
              pIds = JSON.parse(s.productIds || '[]');
            } catch {
              pIds = s.products ? s.products.map(p => p.id) : [];
            }

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {s.discountPercent}% OFF
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isExpired
                          ? 'bg-slate-100 text-slate-500'
                          : s.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isExpired ? 'Expired' : s.isActive ? 'Active Live' : 'Paused'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Ends On:</span>
                      <span className="font-mono text-slate-700 font-semibold">
                        {new Date(s.endDate).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Participating Items:</span>
                      <span className="font-mono font-bold text-slate-900">{pIds.length} Products</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggle(s)}
                    disabled={isExpired}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      isExpired
                        ? 'opacity-40 cursor-not-allowed'
                        : s.isActive
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {s.isActive ? 'Pause Event' : 'Activate Live'}
                  </button>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Schedule Flash Sale Drop</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sale Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navratri Mahotsav Flash Sale"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Festive Banner Text</label>
                <input
                  type="text"
                  placeholder="e.g. Instant 25% divine grace off all consecrated brass vigrahas and malas."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Percentage (%) *</label>
                  <input
                    type="number"
                    min={5}
                    max={80}
                    required
                    value={form.discountPercent}
                    onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>

              {/* Select products */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Participating Sacred Products ({form.selectedProductIds.length} selected)
                </label>
                <p className="text-[11px] text-slate-400">
                  Select specific products or leave empty to automatically include top 6 bestselling items.
                </p>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100">
                  {products.slice(0, 30).map((p) => {
                    const isSelected = form.selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelect(p.id)}
                        className={`py-1.5 px-2 flex items-center justify-between cursor-pointer rounded-lg text-xs ${
                          isSelected ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate max-w-[320px]">{p.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">₹{p.variants[0]?.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-xl"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
