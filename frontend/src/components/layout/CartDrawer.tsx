import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Sparkles,
  Check,
  Flame
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Product } from '../../types';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, subtotal, updateQuantity, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();

  const [crossSellProducts, setCrossSellProducts] = useState<Product[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Fetch quick recommendations for cart cross-sell
  useEffect(() => {
    if (isCartOpen) {
      const fetchCrossSells = async () => {
        try {
          const res = await api.get('/products?limit=4');
          if (res.success && res.products) {
            // Pick items not already in cart
            const filtered = res.products.filter(
              (p: Product) => !items.some((it) => it.productId === p.id)
            );
            setCrossSellProducts(filtered.slice(0, 3));
          }
        } catch {
          // ignore
        }
      };
      fetchCrossSells();
    }
  }, [isCartOpen, items]);

  const handleApplyCoupon = async (codeToApply: string) => {
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.post('/coupons/validate', {
        code: codeToApply.trim().toUpperCase(),
        subtotal
      });
      if (res.success && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          discount: res.coupon.discount
        });
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-vedic-obsidian/70 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2 text-vedic-navy font-serif font-bold text-lg">
              <ShoppingBag className="w-5 h-5 text-vedic-gold" />
              <span>Sacred Cart ({items.reduce((sum, it) => sum + it.quantity, 0)})</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-amber-50/80 border-b border-amber-100 px-5 py-3">
            <div className="text-xs text-amber-950 font-semibold flex items-center justify-between">
              {remainingForFreeShipping === 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-vedic-gold" />
                  <span>Congratulations! You unlocked FREE Insured Delivery!</span>
                </span>
              ) : (
                <span>
                  Add <strong className="text-vedic-gold font-bold">₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for FREE Pan-India Shipping
                </span>
              )}
              <span className="text-[10px] text-amber-700">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-amber-200/50 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-vedic-gold to-amber-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-10 h-10 text-vedic-gold/60" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-slate-700 font-bold text-lg">Your Sacred Cart is Empty</p>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                    Begin your spiritual journey with consecrated yantras, energized gemstone rings, and temple artefacts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="mt-2 px-6 py-3 bg-vedic-navy text-vedic-lightgold text-xs font-bold rounded-xl hover:bg-vedic-gold hover:text-slate-900 transition-colors shadow-luxury"
                >
                  Explore 71 Sacred Creations
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="pt-3 flex gap-3.5 group">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-2xl border border-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';
                        }}
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                            {item.name}
                          </h5>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {item.size}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-bold">
                              Code: {item.code}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm font-extrabold text-slate-900">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-slate-200 rounded-full px-2 py-0.5 bg-slate-50 shadow-2xs">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cross-Sell Recommendations: Complete Your Altar */}
                {crossSellProducts.length > 0 && (
                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Frequently Consecrated Together</span>
                    </div>

                    <div className="space-y-2.5">
                      {crossSellProducts.map((p) => {
                        const variant = p.variants?.[0];
                        const img = p.images?.[0]?.url;
                        if (!variant) return null;

                        return (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                          >
                            <img
                              src={img}
                              alt={p.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=400';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                              <p className="text-xs font-semibold text-amber-600">
                                ₹{variant.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                await addToCart(variant.id, 1);
                              }}
                              className="px-3 py-1.5 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950 font-bold text-[11px] rounded-lg transition-all shrink-0 shadow-2xs"
                            >
                              + Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Available Coupons Quick-Select Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-vedic-gold" />
                    <span>Sacred Blessing Coupons</span>
                  </span>
                  {appliedCoupon && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Saved ₹{appliedCoupon.discount}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplyCoupon('VEDA10')}
                    className={`flex-1 py-1 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      appliedCoupon?.code === 'VEDA10'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-vedic-gold'
                    }`}
                  >
                    <span>VEDA10 (10% Off)</span>
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('DIVINE500')}
                    className={`flex-1 py-1 px-2.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      appliedCoupon?.code === 'DIVINE500'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-vedic-gold'
                    }`}
                  >
                    <span>DIVINE500 (₹500 Off)</span>
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-rose-600 font-semibold">{couponError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Blessing Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 font-bold text-sm pt-1 border-t border-slate-200/60">
                  <span>Estimated Total</span>
                  <span className="font-serif text-base text-slate-900">
                    ₹{Math.max(0, subtotal - (appliedCoupon?.discount || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-vedic-navy via-slate-900 to-vedic-dark hover:from-slate-800 hover:to-vedic-navy text-vedic-lightgold hover:text-white font-extrabold text-sm rounded-xl shadow-luxury flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Proceed to Sacred Checkout</span>
                  <ArrowRight className="w-4 h-4 text-vedic-gold" />
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                >
                  View Full Cart & Summary
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit Encrypted Checkout • Gangajal Consecrated</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
