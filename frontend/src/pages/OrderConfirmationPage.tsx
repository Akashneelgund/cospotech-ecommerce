import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Printer,
  FileText,
  Truck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { api } from '../services/api';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#B8860B', '#FF6F00', '#0F172A', '#10B981']
    });

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        if (res.success) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
        <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="font-serif text-xl font-bold">Order Received</h2>
        <p className="text-xs text-slate-500">Your order has been recorded. Check your email for confirmation.</p>
        <Link to="/" className="inline-block px-5 py-2 bg-vedic-navy text-white text-xs font-bold rounded-lg">
          Return to Home
        </Link>
      </div>
    );
  }

  let shippingObj: any = {};
  try {
    shippingObj = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
  } catch {
    // ignore
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
      {/* Celebration Header */}
      <div className="bg-gradient-to-b from-amber-50/80 to-white rounded-3xl p-8 sm:p-10 border border-vedic-gold/40 text-center space-y-4 shadow-luxury">
        <div className="w-16 h-16 rounded-full bg-vedic-navy text-vedic-gold flex items-center justify-center mx-auto border-2 border-vedic-gold shadow-glow">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vedic-gold/20 text-vedic-navy text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-vedic-gold" />
          <span>Pran-Pratishtha Consecration Initiated</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900">
          Pranam, {order.customerName}!
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Your sacred order <strong>#{order.orderNumber}</strong> has been received by our temple consecration desk. A confirmation blessing has been dispatched to <strong>{order.customerEmail}</strong>.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/invoice/${order.id}`}
            target="_blank"
            className="px-5 py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download Tax Invoice (PDF)</span>
          </Link>
          <Link
            to="/shop"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
          >
            Continue Sacred Shopping
          </Link>
        </div>
      </div>

      {/* Order Status & Tracking Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-vedic-border/70 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-400">Order Reference</div>
            <div className="font-serif font-black text-lg text-slate-900">{order.orderNumber}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Insured Tracking Number</div>
            <div className="font-mono font-bold text-sm text-vedic-navy">
              {order.trackingNumber || 'VEDA-LOG-PENDING'} ({order.courierName || 'Blue Dart'})
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Payment Status</div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {order.paymentStatus} via {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="font-serif font-bold text-sm text-slate-800 mb-4">Temple Fulfillment Timeline</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-vedic-gold" />
                <span>1. Consecration</span>
              </div>
              <div className="text-[11px] text-amber-800">Undergoing Pran-Pratishtha rituals by temple priests.</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>2. Sacred Packing</span>
              </div>
              <div className="text-[11px] text-slate-500">Sealed with Gangajal, Akshat, and Authenticity Certificate.</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>3. Insured Transit</span>
              </div>
              <div className="text-[11px] text-slate-500">Handed to Blue Dart / DTDC Express Air Logistics.</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>4. Home Altar</span>
              </div>
              <div className="text-[11px] text-slate-500">Arrives at your residence ready for auspicious placement.</div>
            </div>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-serif font-bold text-sm text-slate-800 mb-3">Itemized Sacred Receipt</h4>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    Code: {item.productCode} • Size: {item.size} • Qty: {item.quantity}
                  </div>
                </div>
                <div className="font-bold text-slate-900">₹{item.total.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Blessing Discount:</span>
                <span>-₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total Paid:</span>
              <span className="font-serif text-vedic-navy">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Box */}
        <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl text-xs text-slate-600">
          <div className="font-bold text-slate-900 mb-1">Delivering To:</div>
          <div>{shippingObj.fullName} • {shippingObj.phone}</div>
          <div>{shippingObj.addressLine1} {shippingObj.addressLine2 || ''}</div>
          <div>{shippingObj.city}, {shippingObj.state} - {shippingObj.pincode}</div>
        </div>
      </div>
    </div>
  );
};
