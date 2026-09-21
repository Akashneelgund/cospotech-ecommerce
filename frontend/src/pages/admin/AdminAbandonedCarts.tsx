import React, { useEffect, useState } from 'react';
import {
  Clock,
  Mail,
  Phone,
  RefreshCw,
  CheckCircle,
  ShoppingBag,
  ExternalLink,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { AbandonedCartRecord } from '../../types';

export const AdminAbandonedCarts: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCartRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketing/admin/abandoned-carts');
      if (res.success) {
        setCarts(res.abandonedCarts || []);
        setTotalRevenue(res.totalPotentialRevenue || 0);
      }
    } catch (err) {
      console.error('Failed to load abandoned carts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkRecovered = async (id: string) => {
    try {
      await api.put(`/marketing/admin/abandoned-carts/${id}/recover`, {});
      fetchData();
    } catch (err) {
      console.error('Failed to mark cart recovered:', err);
    }
  };

  const recoveredCount = carts.filter(c => c.isRecovered).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Clock className="w-7 h-7 text-amber-500" />
            <span>Abandoned Cart Recovery</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture high-intent dropoffs, track incomplete checkouts, and trigger WhatsApp/Email re-engagement
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Abandoned Carts
          </span>
          <div className="font-serif text-2xl font-black text-slate-900">{carts.length}</div>
          <p className="text-[11px] text-slate-500">Unfinalized checkout sessions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Potential Revenue at Risk
          </span>
          <div className="font-serif text-2xl font-black text-amber-600">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500">Total value in abandoned baskets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Recovered Carts
          </span>
          <div className="font-serif text-2xl font-black text-emerald-600">
            {recoveredCount} / {carts.length}
          </div>
          <p className="text-[11px] text-slate-500">
            {carts.length > 0 ? Math.round((recoveredCount / carts.length) * 100) : 0}% recovery rate
          </p>
        </div>
      </div>

      {/* Carts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading abandoned carts...</div>
        ) : carts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No abandoned carts currently recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold bg-slate-50/50">
                  <th className="p-4">Devotee Contact</th>
                  <th className="p-4">Basket Items Snapshot</th>
                  <th className="p-4">Cart Total</th>
                  <th className="p-4">Abandoned At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {carts.map((c) => {
                  let items: any[] = [];
                  try {
                    items = JSON.parse(c.itemsSnapshot);
                  } catch {
                    items = [];
                  }

                  const whatsappMsg = encodeURIComponent(
                    `Namaste! We noticed you left sacred items in your VedicVeda cart (Total: ₹${c.subtotal}). Would you like assistance completing your sanctified order? We can offer free express consecration today.`
                  );

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="p-4 space-y-1">
                        {c.customerEmail && (
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.customerEmail}</span>
                          </div>
                        )}
                        {c.customerPhone && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.customerPhone}</span>
                          </div>
                        )}
                        {!c.customerEmail && !c.customerPhone && (
                          <span className="text-slate-400 italic">Guest Session</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1 max-w-sm">
                          {items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700 truncate">
                              • {item.name || item.title || 'Sacred Item'} × {item.quantity || 1}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{items.length - 3} more items
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-serif font-bold text-slate-900">
                        ₹{c.subtotal.toLocaleString('en-IN')}
                      </td>

                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isRecovered
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.isRecovered ? 'Recovered' : 'Open Abandoned'}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {c.customerPhone && !c.isRecovered && (
                          <a
                            href={`https://wa.me/${c.customerPhone.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                          >
                            WhatsApp Reachout
                          </a>
                        )}

                        {!c.isRecovered ? (
                          <button
                            onClick={() => handleMarkRecovered(c.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Mark Recovered
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
