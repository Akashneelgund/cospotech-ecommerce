import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CheckCircle2,
  Star,
  Flame,
  ChevronRight,
  ChevronLeft,
  Clock,
  Zap,
  Gem,
  Compass,
  Check
} from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { Product, Category, Banner } from '../types';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [limitedDrops, setLimitedDrops] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Countdown timer state for limited drop
  const [timeLeft, setTimeLeft] = useState({
    hours: 18,
    minutes: 42,
    seconds: 15
  });

  const trendingScrollRef = useRef<HTMLDivElement>(null);

  // Countdown ticker
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

  // Fetch Homepage Data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [bannersRes, featRes, bestRes, catRes, allProdRes] = await Promise.all([
          api.get('/banners?placement=HERO'),
          api.get('/products/featured'),
          api.get('/products/bestsellers'),
          api.get('/products/categories'),
          api.get('/products?limit=20')
        ]);

        if (bannersRes.success && bannersRes.banners?.length > 0) {
          setHeroBanners(bannersRes.banners);
        } else {
          // Fallback slides
          setHeroBanners([
            {
              id: '1',
              title: 'Awaken Cosmic Harmony & Divine Abundance',
              subtitle: 'Authentic Pran-Pratishtha sanctified Yantras and Chowkis handcrafted from heavy gauge copper and brass.',
              badge: 'Sacred Agamic Heritage',
              imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1600',
              ctaText: 'Explore 71 Sacred Creations',
              ctaLink: '/shop',
              placement: 'HERO',
              displayOrder: 1,
              isActive: true
            },
            {
              id: '2',
              title: 'Certified Natural Astrological Gemstones',
              subtitle: 'Consecrated 925 Sterling Silver rings in 5.25 to 7.25 Ratti with accredited lab certifications.',
              badge: 'Planetary Energization',
              imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1600',
              ctaText: 'View Gemstone Rings',
              ctaLink: '/shop?category=gemstone-rings',
              placement: 'HERO',
              displayOrder: 2,
              isActive: true
            }
          ]);
        }

        if (featRes.success) setFeaturedProducts(featRes.products || []);
        if (bestRes.success) setBestsellers(bestRes.products || []);
        if (catRes.success) setCategories(catRes.categories || []);

        if (allProdRes.success && allProdRes.products) {
          const drops = allProdRes.products.filter((p: Product) => p.isLimitedDrop);
          setLimitedDrops(drops.length > 0 ? drops : allProdRes.products.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      }
    };
    loadHomeData();
  }, []);

  // Auto slide hero every 6 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [heroBanners]);

  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      trendingScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    }
  };

  const moodCollections = [
    {
      title: 'Wealth & Prosperity',
      subtitle: 'Attract Mahalakshmi & Kuber blessings with geometric copper yantras.',
      image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=600',
      tag: 'Kuber • Lakshmi • Dhanakarshana',
      link: '/shop?search=Lakshmi'
    },
    {
      title: 'Divine Protection (Kavach)',
      subtitle: 'Shield your aura against negativity with Bagalamukhi & Durga yantras.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600',
      tag: 'Bagalamukhi • Durga Bisa • Hanuman',
      link: '/shop?search=Bagalamukhi'
    },
    {
      title: 'Deep Peace & Meditation',
      subtitle: 'Transcend mental clutter with authentic 108 Karungali & Spatik malas.',
      image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=600',
      tag: 'Karungali • Rudraksha • Sandalwood',
      link: '/shop?category=sacred-bracelets'
    },
    {
      title: 'Planetary Shanti',
      subtitle: 'Harmonize planetary transits with lab-certified astrological gemstone rings.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600',
      tag: 'Pukhraj • Panna • Neelam • Manik',
      link: '/shop?category=gemstone-rings'
    }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-x-hidden">
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />

      {/* 1. CINEMATIC HERO SLIDER */}
      <section
        style={{ backgroundColor: '#080C16' }}
        className="relative overflow-hidden bg-[#080C16] text-white min-h-[580px] sm:min-h-[640px] flex items-center border-b border-amber-500/30"
      >
        {/* Sacred Mandala Ambient Geometry */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[800px] rounded-full border border-vedic-gold/50 animate-spin" style={{ animationDuration: '90s' }} />
          <div className="absolute w-[550px] h-[550px] rounded-full border border-dashed border-vedic-gold/40" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-vedic-gold/30" />
        </div>

        {/* Hero Slides Container */}
        {heroBanners.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark Vignette */}
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover object-center filter brightness-[0.38] scale-105 transition-transform duration-[7000ms] ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-vedic-obsidian via-vedic-obsidian/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-vedic-obsidian via-transparent to-transparent" />

            {/* Slide Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20">
              <div className="max-w-2xl space-y-6 pt-8 sm:pt-0">
                {slide.badge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vedic-gold/15 border border-vedic-gold/40 text-vedic-lightgold text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-vedic-gold animate-pulse" />
                    <span>{slide.badge}</span>
                  </div>
                )}

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                  {slide.title.split(' ')[0]}{' '}
                  <span className="gold-gradient-text">
                    {slide.title.split(' ').slice(1, 4).join(' ')}
                  </span>{' '}
                  {slide.title.split(' ').slice(4).join(' ')}
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to={slide.ctaLink}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-vedic-gold to-amber-500 hover:from-amber-400 hover:to-vedic-gold text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-luxury flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/shop?category=all-yantra"
                    className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Consecrated Yantras</span>
                  </Link>
                </div>

                {/* Trust Mini-Pillars */}
                <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 max-w-lg">
                  <div>
                    <div className="font-serif text-lg font-bold text-vedic-gold">100%</div>
                    <div className="text-[11px] text-slate-400">Agamic Pran-Pratishtha</div>
                  </div>
                  <div>
                    <div className="font-serif text-lg font-bold text-vedic-gold">71</div>
                    <div className="text-[11px] text-slate-400">Authentic Creations</div>
                  </div>
                  <div>
                    <div className="font-serif text-lg font-bold text-vedic-gold">Express</div>
                    <div className="text-[11px] text-slate-400">Insured Pan-India Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Slide Switcher Controls */}
        {heroBanners.length > 1 && (
          <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-2">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-8 bg-vedic-gold shadow-glow' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. RICH CATEGORY DISCOVERY TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-vedic-gold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanctified Archives</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900">
              Discover By Sacred Category
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-3 md:mt-0 text-xs font-bold text-vedic-navy hover:text-vedic-gold flex items-center gap-1 transition-colors uppercase tracking-wider"
          >
            <span>View All Collections (71)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-vedic-border/70 hover:border-vedic-gold/70 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3.5 bg-slate-100 relative">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>

              <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-vedic-gold transition-colors line-clamp-1">
                {cat.name}
              </h4>
              <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium mt-0.5">
                {cat._count?.products || 12} Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. TRENDING NOW — HORIZONTAL SCROLLING RAIL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-vedic-saffron mb-1 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-vedic-saffron" />
              <span>Trending Across Devotees</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900">
              Devotee Favorites This Auspicious Muhurta
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTrending('left')}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 hover:border-vedic-gold text-slate-700 transition-colors shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTrending('right')}
              className="p-2 sm:p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 hover:border-vedic-gold text-slate-700 transition-colors shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={trendingScrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {featuredProducts.map((p) => (
            <div key={p.id} className="min-w-[220px] xs:min-w-[250px] sm:min-w-[300px] max-w-[300px] snap-start shrink-0">
              <ProductCard product={p} onQuickView={(prod) => setQuickViewProduct(prod)} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIMITED DROP URGENCY SHOWCASE WITH LIVE COUNTDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          style={{ backgroundColor: '#0A0F1D' }}
          className="relative rounded-3xl overflow-hidden bg-[#0A0F1D] text-white p-6 sm:p-12 border-2 border-amber-500/50 shadow-2xl"
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 bg-[radial-gradient(#D4AF37_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Countdown Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/80 border border-rose-500/50 text-rose-200 text-[10px] font-extrabold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Limited Consecration Drop</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#FCFAF5] leading-tight drop-shadow-md">
                Shodasha Mahavidya & Heavy Brass Altars
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                Strict Agamic ritual batch. Hand-poured brass and pure copper sanctified with 108 Gayatri recitations. Only restricted units prepared for this auspicious window.
              </p>

              {/* Real-time Countdown Clocks */}
              <div className="pt-2">
                <div className="text-[11px] text-amber-300 uppercase font-black tracking-widest mb-2">
                  Muhurta Window Closes In:
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div style={{ backgroundColor: '#070A14' }} className="border border-amber-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-3 min-w-[54px] sm:min-w-[64px] text-center shadow-md">
                    <div className="font-serif text-xl sm:text-2xl font-black text-amber-400">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-0.5">Hours</div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-amber-400">:</span>
                  <div style={{ backgroundColor: '#070A14' }} className="border border-amber-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-3 min-w-[54px] sm:min-w-[64px] text-center shadow-md">
                    <div className="font-serif text-xl sm:text-2xl font-black text-amber-400">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-0.5">Mins</div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-amber-400">:</span>
                  <div style={{ backgroundColor: '#070A14' }} className="border border-amber-500/40 rounded-xl sm:rounded-2xl p-2 sm:p-3 min-w-[54px] sm:min-w-[64px] text-center shadow-md">
                    <div className="font-serif text-xl sm:text-2xl font-black text-amber-400">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-0.5">Secs</div>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-luxury hover:scale-105 transition-all"
                >
                  <span>Reserve Consecrated Unit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Limited Drop Products Carousel / Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {limitedDrops.slice(0, 2).map((prod) => (
                <div
                  key={prod.id}
                  style={{ backgroundColor: '#131C31' }}
                  className="rounded-2xl p-4 border border-slate-700/80 text-white flex flex-col justify-between shadow-lg"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-3 border border-slate-700/50">
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=400'}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=400';
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-rose-900 text-rose-100 text-[9px] font-black px-2 py-0.5 rounded-full border border-rose-500/50 shadow-sm uppercase tracking-wider">
                      Rare Consecration
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider">{prod.category?.name}</div>
                    <h5 className="font-serif font-bold text-sm text-white line-clamp-1">{prod.name}</h5>
                    <div className="text-base font-black text-amber-400">
                      ₹{prod.basePrice.toLocaleString('en-IN')}
                    </div>

                    {/* Stock Meter */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-slate-200 mb-1 font-medium">
                        <span>Remaining Consecrated Units:</span>
                        <strong className="text-amber-300 font-bold">3 left</strong>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                        <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full w-[25%] rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setQuickViewProduct(prod)}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <span>Quick Order</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. SHOP BY SPIRITUAL INTENTION / MOOD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-vedic-gold">
            Sacred Alignment
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900">
            Shop By Spiritual Intention
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Choose sacred geometric conduits prepared for your specific life purpose and cosmic alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {moodCollections.map((col) => (
            <Link
              key={col.title}
              to={col.link}
              className="group relative rounded-3xl overflow-hidden bg-white border border-vedic-border/70 hover:border-vedic-gold/70 shadow-card hover:shadow-luxury transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-[9px] uppercase tracking-wider text-vedic-lightgold font-extrabold">
                    {col.tag}
                  </div>
                  <h4 className="font-serif font-bold text-lg text-white group-hover:text-vedic-gold transition-colors">
                    {col.title}
                  </h4>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {col.subtitle}
                </p>
                <div className="text-xs font-bold text-vedic-navy group-hover:text-vedic-gold flex items-center gap-1 transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. EDITORIAL STORYTELLING SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-vedic-sand/70 border border-vedic-border/70 p-8 sm:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vedic-navy text-vedic-lightgold text-[10px] font-bold uppercase tracking-widest">
                <Award className="w-3.5 h-3.5 text-vedic-gold" />
                <span>Conscious Vedic Craftsmanship</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                Crafted in Pure Copper, Brass & Consecrated by Temple Pandits
              </h3>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                In Vedic sacred geometry, the purity of metal is non-negotiable. Modern mass-produced yantras are often stamped on paper-thin tin sheets with distorted sacred ratios.
              </p>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Every creation at <strong>VedicVeda</strong> is strictly carved in heavy-gauge copper, sanctified with pure Gangajal, and energized through traditional Prana-Pratishtha rituals by verified temple scholars.
              </p>

              <div className="pt-2 grid grid-cols-2 gap-4 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Heavy Gauge Metals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Accurate Agamic Ratios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lab-Certified Gemstones</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Insured Tamper Packaging</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-900 font-extrabold text-xs rounded-xl shadow-luxury transition-all"
                >
                  <span>Explore The 71 Creations</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Right Collage */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-vedic-gold/40 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800"
                  alt="Sacred Agamic Consecration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/75 backdrop-blur-md border border-vedic-gold/40 text-white">
                  <p className="font-serif font-bold text-sm">Authenticity Certificate Attached</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Includes consecrated Gangajal, sacred bhasma, and Vedic installation muhurta guide.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. BESTSELLERS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-vedic-gold mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Temple Recommended</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900">
              Devotee Bestsellers
            </h2>
          </div>
          <Link
            to="/shop?sort=bestseller"
            className="mt-3 md:mt-0 text-xs font-bold text-vedic-navy hover:text-vedic-gold flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestsellers.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 8. VERIFIED DEVOTEE REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-vedic-gold">
            Verified Devotee Experiences
          </div>
          <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900">
            Trusted by Thousands Across Bharat
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Read authentic reviews from devotees who have placed our consecrated artefacts in their homes and puja altars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-vedic-border/70 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;The Bagalamukhi Yantra 3/3 Big is impeccably engraved. The copper weight and precision of the geometric lines are unmatched. Placing it in our puja room has brought immense clarity and auspicious peace.&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Pooja Nambiar</div>
                <div className="text-[10px] text-slate-500 font-medium">Bengaluru • Verified Devotee</div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Order
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-vedic-border/70 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;The Karungali Mala arrived with Gangajal and sacred bhasma. You can immediately feel the grounding natural ebony energy. Excellent packaging and prompt delivery within 48 hours to Mumbai.&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Rajeshwar Deshmukh</div>
                <div className="text-[10px] text-slate-500 font-medium">Mumbai • Verified Devotee</div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Order
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-vedic-border/70 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;The Ashta Lakshmi Chowki is pure temple art! The brass polish and detailed idol carvings are breathtaking. It was the centerpiece of our Gruha Pravesh puja ceremony.&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">Dr. Sunita Kulkarni</div>
                <div className="text-[10px] text-slate-500 font-medium">Pune • Verified Devotee</div>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Order
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PANCHANG & AUSPICIOUS MUHURTA NEWSLETTER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          style={{ backgroundColor: '#0B1120' }}
          className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white border-2 border-amber-500/40 shadow-2xl space-y-4 relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-vedic-card border border-vedic-gold/40 flex items-center justify-center text-vedic-gold mx-auto shadow-luxury">
            <Sparkles className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold">
            Receive Sacred Panchang & Auspicious Muhurta Notifications
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Subscribe to our weekly Vedic newsletter. Receive planetary transit alerts, sacred installation dates, and an instant 15% discount on your first order.
          </p>

          {newsletterSuccess ? (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs sm:text-sm max-w-md mx-auto flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>🕉️ Enrolled! Use blessing coupon <strong>FIRSTBUY</strong> for 15% off at checkout.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="email"
                placeholder="Enter your sacred email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-vedic-gold"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-vedic-gold hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-luxury shrink-0"
              >
                Claim 15% Off
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
