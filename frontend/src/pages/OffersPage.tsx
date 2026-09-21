import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Tag,
  Copy,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { Product, FlashSale } from '../types';
import { api } from '../services/api';

export const OffersPage: React.FC = () => {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const [flashRes, prodsRes] = await Promise.all([
          api.get('/marketing/flash-sale'),
          api.get('/products?limit=30')
        ]);

        if (flashRes.success && flashRes.flashSale) {
          setFlashSale(flashRes.flashSale);
        }

        if (prodsRes.success && prodsRes.products) {
          // Filter items with special discount
          const specials = prodsRes.products.filter((p: Product) => {
            const hasSpecial = p.variants?.some((v) => v.specialPrice && v.specialPrice < v.price);
            return hasSpecial || (p.specialPrice && p.specialPrice < p.basePrice);
          });
          setDiscountedProducts(specials.length > 0 ? specials : prodsRes.products.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load offers:', err);
      }
    };
    fetchOffers();
  }, []);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const availableCoupons = [
    {
      code: 'VEDA10',
      discount: '10% OFF',
      minOrder: '₹999',
      description: 'Divine blessing discount valid on consecrated Yantras, Rings, and Chowkis.',
      badge: 'Most Popular'
    },
    {
      code: 'DIVINE500',
      discount: 'FLAT ₹500 OFF',
      minOrder: '₹2,999',
      description: 'Exclusive festival concession on pure brass altars and gemstone collections.',
      badge: 'High Value'
    },
    {
      code: 'FIRSTBUY',
      discount: '15% OFF',
      minOrder: '₹1,499',
      description: 'Special auspicious welcome gift for newly enrolled devotees across Bharat.',
      badge: 'New Devotees'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-vedic-saffron/10 text-vedic-saffron border border-vedic-saffron/30 text-xs font-bold uppercase tracking-widest">
          <Flame className="w-3.5 h-3.5 fill-vedic-saffron" />
          <span>Auspicious Consecration Deals</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Sacred Offers & Flash Blessings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Claim limited-time divine concessions, coupon codes, and festival consecration bundles.
        </p>
      </div>

      {/* 1. Flash Sale Banner with Live Timer */}
      <div
        style={{ backgroundColor: '#0A0F1D' }}
        className="relative rounded-3xl overflow-hidden bg-[#0A0F1D] text-white p-6 sm:p-12 border-2 border-amber-500/50 shadow-2xl"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/80 border border-red-500/50 text-red-200 text-[10px] font-extrabold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Active Flash Sale Window</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#FCFAF5] leading-tight drop-shadow-md">
              {flashSale?.title || 'Navaratri & Diwali Mahamuhurta Consecration Concession'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
              {flashSale?.description || 'Receive 20% instant concession on heavy gauge brass Chowkis and certified 925 sterling silver Gemstone Rings.'}
            </p>

            {/* Countdown Clocks */}
            <div className="pt-2 flex items-center gap-3">
              <div style={{ backgroundColor: '#070A14' }} className="border border-amber-500/40 rounded-2xl p-3 min-w-[64px] text-center shadow-md">
                <div className="font-serif text-2xl font-black text-amber-400">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-0.5">Hours</div>
              </div>
              <span className="text-xl font-bold text-amber-400">:</span>
              <div style={{ backgroundColor: '#070A14' }} className="border border-amber-500/40 rounded-2xl p-3 min-w-[64px] text-center shadow-md">
                <div className="font-serif text-2xl font-black text-amber-400">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-0.5">Mins</div>
              </div>
              <span className="text-xl font-bold text-amber-400">:</span>
              <div style={{ backgroundColor: '#070A14' }} className="border border-amber-500/40 rounded-2xl p-3 min-w-[64px] text-center shadow-md">
                <div className="font-serif text-2xl font-black text-amber-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-0.5">Secs</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 text-center lg:text-right">
            <div style={{ backgroundColor: '#131C31' }} className="inline-block border border-amber-500/40 p-6 rounded-3xl text-center space-y-3 shadow-xl">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Flat Concession</div>
              <div className="font-serif text-5xl font-black text-amber-400">
                {flashSale?.discountPercent || 20}% OFF
              </div>
              <Link
                to="/shop"
                className="w-full inline-block py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-luxury transition-all"
              >
                Shop Flash Sale Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Coupons with 1-Click Copy */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-extrabold text-2xl text-slate-900">
              Active Blessing Coupons
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &ldquo;Copy Code&rdquo; to copy and paste directly in your cart or checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableCoupons.map((c) => (
            <div
              key={c.code}
              className="bg-white rounded-3xl border-2 border-dashed border-vedic-border/90 hover:border-vedic-gold p-6 shadow-sm hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-vedic-gold/15 text-vedic-navy text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border border-vedic-gold/30">
                    {c.badge}
                  </span>
                  <span className="text-[11px] text-slate-400">Min: {c.minOrder}</span>
                </div>

                <div className="font-serif font-black text-2xl text-slate-900">
                  {c.discount}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {c.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold text-vedic-navy bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {c.code}
                </span>

                <button
                  onClick={() => copyCoupon(c.code)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                    copiedCode === c.code
                      ? 'bg-emerald-600 text-white'
                      : 'bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950'
                  }`}
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Discounted Consecrated Artefacts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-extrabold text-2xl text-slate-900">
              Special Consecrated Prices
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sanctified creations currently available with auspicious discounts.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-vedic-navy hover:text-vedic-gold uppercase tracking-wider"
          >
            Explore Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {discountedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickView={(prod) => setQuickViewProduct(prod)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
