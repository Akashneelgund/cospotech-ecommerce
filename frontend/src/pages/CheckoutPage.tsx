import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Multi-step index: 1: Info, 2: Address, 3: Payment
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [addressLine1, setAddressLine1] = useState(user?.addresses?.[0]?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(user?.addresses?.[0]?.addressLine2 || '');
  const [landmark, setLandmark] = useState(user?.addresses?.[0]?.landmark || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Bengaluru');
  const [state, setState] = useState(user?.addresses?.[0]?.state || 'Karnataka');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '560038');

  // Delivery & Payment
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'RAZORPAY' | 'CARD' | 'COD'>('UPI');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const baseShipping = taxableBase >= 999 ? 0 : 99;
  const expressFee = deliveryMethod === 'express' ? 150 : 0;
  const totalShipping = baseShipping + expressFee;
  const taxAmount = Math.round(taxableBase * 0.03);
  const grandTotal = taxableBase + totalShipping;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', { code: couponCode.trim(), subtotal });
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponCode('');
      }
    } catch (err: any) {
      alert(err.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const payload = {
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: {
        fullName: name.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim()
      },
      paymentMethod,
      couponCode: appliedCoupon?.code,
      deliveryMethod,
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        quantity: it.quantity
      }))
    };

    try {
      const res = await api.post('/checkout/create-order', payload);
      if (res.success && res.order) {
        clearCart();
        navigate(`/order-success/${res.order.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please verify details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="font-serif text-3xl font-black text-slate-900">Sacred Multi-Step Checkout</h1>
        <p className="text-xs text-slate-500">
          Encrypted 256-Bit SSL Protection • Temple Consecrated Delivery
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs font-bold uppercase tracking-wider">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-vedic-navy' : 'text-slate-300'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-vedic-navy text-white' : 'bg-slate-200'}`}>1</span>
            <span>Contact & Address</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-vedic-navy' : 'text-slate-300'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-vedic-navy text-white' : 'bg-slate-200'}`}>2</span>
            <span>Sacred Payment</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Form: Steps */}
        <div className="lg:col-span-7 space-y-6">
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-vedic-border/70 shadow-card space-y-6 animate-in fade-in">
              <h3 className="font-serif font-bold text-lg text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span>1. Devotee Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="devotee@example.com"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (for delivery updates) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>
              </div>

              <h3 className="font-serif font-bold text-lg text-slate-900 pt-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span>2. Sacred Delivery Address (Pan-Bharat)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address Line 1 (Flat, House No, Building) *</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Flat 402, Shanti Niketan Residency"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address Line 2 (Street, Area)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Near ISKCON Temple, Rajajinagar"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Opposite Temple Gopuram"
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>
              </div>

              {/* Delivery Speed Selection */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block font-serif font-bold text-sm text-slate-900 mb-2.5">
                  Select Delivery Mode:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryMethod('standard')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'standard' ? 'border-vedic-gold bg-vedic-gold/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Standard Insured Delivery</span>
                      <span className="text-xs font-bold text-emerald-700">{baseShipping === 0 ? 'FREE' : '₹99'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">3 - 5 business days pan-India with consecration seal.</p>
                  </div>

                  <div
                    onClick={() => setDeliveryMethod('express')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'express' ? 'border-vedic-gold bg-vedic-gold/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">Priority Express Sanctum Delivery</span>
                      <span className="text-xs font-bold text-slate-900">+₹150</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Dispatched in 24 hours via Priority Air Cargo.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!name || !email || !phone || !addressLine1 || !city || !state || !pincode) {
                    alert('Please fill all required contact and address fields.');
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="w-full py-3.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs sm:text-sm rounded-xl shadow-luxury flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continue to Sacred Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-vedic-border/70 shadow-card space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Select Payment Method
                </h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-vedic-gold hover:underline font-semibold"
                >
                  ← Edit Address
                </button>
              </div>

              {/* Payment Methods Options */}
              <div className="space-y-3">
                {/* 1. UPI Payment */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI' ? 'border-vedic-gold bg-amber-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-5 h-5 text-vedic-gold" />
                      <span className="font-bold text-sm text-slate-900">Instant UPI Payment (0% Convenience Fee)</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">Recommended</span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-xl border border-slate-200">
                        {/* Interactive Simulated QR Code */}
                        <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-sm text-center">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=vedicveda@icici&pn=VedicVeda%20Heritage&am=${grandTotal}&cu=INR`}
                            alt="Sacred UPI QR Code"
                            className="w-32 h-32 mx-auto"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Scan with any UPI App</span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600">
                          <p className="font-bold text-slate-900">Select preferred UPI app:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setUpiApp('gpay')}
                              className={`p-2 rounded-lg border text-xs font-semibold ${upiApp === 'gpay' ? 'border-vedic-gold bg-vedic-gold/10' : 'border-slate-200'}`}
                            >
                              Google Pay
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiApp('phonepe')}
                              className={`p-2 rounded-lg border text-xs font-semibold ${upiApp === 'phonepe' ? 'border-vedic-gold bg-vedic-gold/10' : 'border-slate-200'}`}
                            >
                              PhonePe
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiApp('paytm')}
                              className={`p-2 rounded-lg border text-xs font-semibold ${upiApp === 'paytm' ? 'border-vedic-gold bg-vedic-gold/10' : 'border-slate-200'}`}
                            >
                              Paytm UPI
                            </button>
                            <button
                              type="button"
                              onClick={() => setUpiApp('bhim')}
                              className={`p-2 rounded-lg border text-xs font-semibold ${upiApp === 'bhim' ? 'border-vedic-gold bg-vedic-gold/10' : 'border-slate-200'}`}
                            >
                              BHIM UPI
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">VPA: <strong>vedicveda@icici</strong></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Mock Razorpay Modal / Gateway */}
                <div
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'RAZORPAY' ? 'border-vedic-gold bg-amber-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-vedic-gold" />
                      <span className="font-bold text-sm text-slate-900">Razorpay (All Cards / NetBanking / Wallets)</span>
                    </div>
                  </div>
                  {paymentMethod === 'RAZORPAY' && (
                    <p className="text-xs text-slate-500 mt-2">
                      Secure payment simulation via Razorpay test mode. No real bank deduction will occur.
                    </p>
                  )}
                </div>

                {/* 3. Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD' ? 'border-vedic-gold bg-amber-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-vedic-gold" />
                      <span className="font-bold text-sm text-slate-900">Cash on Sacred Delivery (COD)</span>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && (
                    <p className="text-xs text-slate-500 mt-2">
                      Pay with cash or UPI directly to our insured delivery courier upon parcel arrival.
                    </p>
                  )}
                </div>
              </div>

              {/* Order Placement Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-vedic-navy via-slate-900 to-vedic-dark hover:from-vedic-gold hover:to-amber-500 text-white hover:text-slate-950 font-black text-sm rounded-xl shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-vedic-gold" />
                <span>
                  {isProcessing
                    ? 'Sanctifying & Placing Sacred Order...'
                    : `Confirm & Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                </span>
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted & RBI Guideline Compliant</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-vedic-border/70 shadow-card space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Your Sacred Order ({items.reduce((s, it) => s + it.quantity, 0)} Items)
            </h3>

            {/* Line items thumbnail list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 space-y-2">
              {items.map((it) => (
                <div key={it.variantId} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={it.image} alt={it.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                    <div>
                      <div className="font-semibold text-slate-800 line-clamp-1">{it.name}</div>
                      <div className="text-[10px] text-slate-400">Size: {it.size} × {it.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">₹{it.total.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Blessing Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Insured Sacred Delivery</span>
                <span>{totalShipping === 0 ? 'FREE' : `₹${totalShipping}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (3% Consecrated Items)</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-slate-100 font-extrabold text-base text-slate-900">
                <span>Total Due</span>
                <span className="text-xl font-serif text-vedic-navy">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
