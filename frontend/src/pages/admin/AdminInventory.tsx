import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  History,
  Plus,
  Minus,
  CheckCircle,
  X
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminInventory: React.FC = () => {
  const [variants, setVariants] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'levels' | 'logs'>('levels');
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [reason, setReason] = useState('RESTOCK');
  const [notes, setNotes] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [vRes, tRes] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/admin/inventory/transactions')
      ]);
      if (vRes.success) setVariants(vRes.variants || []);
      if (tRes.success) setTransactions(tRes.logs || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    try {
      const res = await api.post('/admin/inventory/adjust', {
        variantId: selectedVariant.id,
        adjustmentQty: adjustQty,
        reason,
        notes
      });
      if (res.success) {
        alert('Stock updated successfully.');
        setSelectedVariant(null);
        setNotes('');
        fetchInventory();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-black text-slate-900">
            Real-Time Inventory & Consecration Audit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic stock updates tied directly to customer checkouts and order cancellations
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border border-slate-200 rounded-xl bg-white p-1 text-xs font-semibold self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'levels' ? 'bg-vedic-navy text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Levels ({variants.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'logs' ? 'bg-vedic-navy text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit History ({transactions.length})
          </button>
        </div>
      </div>

      {activeTab === 'levels' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">SKU / Code</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Status Alert</th>
                  <th className="py-3.5 px-4 text-center">Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading inventory...</td>
                  </tr>
                ) : (
                  variants.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{v.sku}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{v.product?.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{v.product?.category?.name}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{v.size}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-slate-900">{v.stock}</td>
                      <td className="py-3.5 px-4">
                        {v.stock === 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : v.stock <= 10 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Low Stock Warning
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Optimal Supply
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedVariant(v);
                            setAdjustQty(20);
                            setReason('RESTOCK');
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-vedic-navy hover:text-white text-slate-700 font-semibold text-[11px] rounded-lg transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Item & Code</th>
                  <th className="py-3.5 px-4">Change Qty</th>
                  <th className="py-3.5 px-4">Previous → New</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4">Auditor / System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {t.variant?.product?.name} ({t.variant?.product?.productCode})
                    </td>
                    <td className="py-3 px-4 font-bold font-mono">
                      <span className={t.changeQty > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {t.changeQty > 0 ? `+${t.changeQty}` : t.changeQty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {t.previousQty} → {t.newQty}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                        {t.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{t.notes}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setSelectedVariant(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Stock Adjustment: {selectedVariant.product?.name}
                </h3>
                <button onClick={() => setSelectedVariant(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl flex justify-between">
                <span>Current Stock: <strong>{selectedVariant.stock} units</strong></span>
                <span>Size: <strong>{selectedVariant.size}</strong></span>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Adjustment Quantity (e.g. +20 to add, -5 to deduct)
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-medium"
                  >
                    <option value="RESTOCK">Replenished from Temple Artisan</option>
                    <option value="MANUAL_ADJUSTMENT">Physical Inventory Audit Correction</option>
                    <option value="DAMAGED">Damaged / Flawed Item Removed</option>
                    <option value="RETURN">Customer Return Restocked</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audit Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Provide details for the audit log..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-xl"
                  >
                    Commit Stock Update
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
