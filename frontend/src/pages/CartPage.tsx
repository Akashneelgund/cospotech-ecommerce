import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export const CartPage: React.FC = () => {
  const { items, subtotal, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const freeShippingThreshold = 999;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const shippingFee = taxableBase >= freeShippingThreshold || subtotal === 0 ? 0 : 99;
  const taxAmount = Math.round(taxableBase * 0.03);
  const finalTotal = taxableBase + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        subtotal
      });
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponCode('');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-900">Your Sacred Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You have not added any consecrated creations yet. Explore our handcrafted yantras and gemstone rings.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-vedic-navy hover:bg-vedic-gold text-white text-xs font-bold rounded-xl shadow-luxury transition-colors"
        >
          <span>Explore 71 Sacred Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-slate-900">Sacred Shopping Cart</h1>
        <p className="text-xs text-slate-500 mt-1">Review your consecrated items before sacred checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-vedic-border/70 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Product Details</span>
              <button
                onClick={clearCart}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold normal-case"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Cart</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 p-4 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="pt-4 first:pt-0 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl border border-slate-100 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';
                      }}
                    />
                    <div>
                      <div className="text-[10px] uppercase font-extrabold text-amber-800">
                        Code: {item.code}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-slate-900">{item.name}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Size: <span className="font-semibold text-slate-700">{item.size}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        ₹{item.price.toLocaleString('en-IN')} each
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex items-center border border-slate-200 rounded-full px-2.5 py-1 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-1 text-slate-500 hover:text-slate-800 font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 text-slate-500 hover:text-slate-800 font-bold text-xs disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-extrabold text-slate-900">
                        ₹{item.total.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-vedic-border/70 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Application Form */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-vedic-gold" />
                <span>Blessing Coupon Code</span>
              </label>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VEDA10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-vedic-navy hover:bg-vedic-gold text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
              {appliedCoupon && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                  <span>Coupon <strong>{appliedCoupon.code}</strong> Applied (-₹{appliedCoupon.discount})</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-emerald-900 font-bold ml-2">✕</button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-600 mt-1.5">{couponError}</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal ({totalItems})</span>
                <span className="font-medium text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Blessing Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Insured Express Shipping</span>
                <span className={shippingFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900'}>
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (Inclusive 3%)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 text-base font-black text-slate-900">
                <span>Final Sacred Total</span>
                <span className="text-xl font-serif text-vedic-navy">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs sm:text-sm rounded-xl shadow-luxury flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Sacred Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Consecrated Temple Sanctification Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
