import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Download,
  Printer,
  Edit2,
  CheckCircle,
  X,
  Truck
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Status Edit Modal
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('Blue Dart');
  const [paymentStatus, setPaymentStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (selectedStatus !== 'ALL') q.set('status', selectedStatus);

      const res = await api.get(`/admin/orders?${q.toString()}`);
      if (res.success) setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, selectedStatus]);

  const openStatusModal = (ord: any) => {
    setEditingOrder(ord);
    setNewStatus(ord.orderStatus);
    setTrackingNumber(ord.trackingNumber || '');
    setCourierName(ord.courierName || 'Blue Dart');
    setPaymentStatus(ord.paymentStatus);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const res = await api.patch(`/admin/orders/${editingOrder.id}/status`, {
        orderStatus: newStatus,
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
        paymentStatus: paymentStatus || undefined
      });
      if (res.success) {
        alert('Order updated successfully.');
        setEditingOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/admin/orders/export', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-black text-slate-900">
            Order Fulfillment & Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor consecration status, update Blue Dart/DTDC tracking, and export order history
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders to Excel (.xlsx)</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by order #, devotee name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">Status Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing Consecration</option>
            <option value="PACKED">Packed with Akshat</option>
            <option value="SHIPPED">Shipped via Courier</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled / Restocked</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Devotee Customer</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">No orders found.</td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {ord.items?.map((it: any) => `${it.productName} (${it.size}) × ${it.quantity}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ord.paymentStatus} ({ord.paymentMethod})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openStatusModal(ord)}
                          className="p-1.5 text-slate-500 hover:text-vedic-navy hover:bg-slate-100 rounded-lg"
                          title="Update Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/invoice/${ord.id}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-vedic-gold hover:bg-slate-100 rounded-lg"
                          title="Tax Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setEditingOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Update Order #{editingOrder.orderNumber}
                </h3>
                <button onClick={() => setEditingOrder(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="CONFIRMED">CONFIRMED (Order Received)</option>
                    <option value="PROCESSING">PROCESSING (Temple Consecration)</option>
                    <option value="PACKED">PACKED (Sealed with Gangajal)</option>
                    <option value="SHIPPED">SHIPPED (With Courier)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED (Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Courier Service</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="Blue Dart / DTDC Express"
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Courier Tracking Airway Bill #</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-8921094"
                    className="w-full border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING (COD / Cheque)</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-xl"
                  >
                    Save Status & Notify
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
