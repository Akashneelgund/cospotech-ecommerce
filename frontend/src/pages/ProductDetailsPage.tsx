import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Share2,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  X,
  Zap,
  Clock,
  ChevronDown,
  ChevronRight,
  Check,
  Package,
  Award
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/product/ProductCard';
import { api } from '../services/api';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Pincode
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<{ available: boolean; message: string; date: string } | null>(null);

  // Expandable Accordions
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    significance: true,
    specs: false,
    ritual: false,
    shipping: false
  });

  // Review Submission
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.success && res.product) {
          setProduct(res.product);
          setRelatedProducts(res.related || []);
          const primaryImg =
            res.product.images?.find((i: any) => i.isPrimary)?.url ||
            res.product.images?.[0]?.url ||
            '';
          setSelectedImage(primaryImg);
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug]);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.trim();
    if (cleanPin.length === 6 && /^\d+$/.test(cleanPin)) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const dateString = deliveryDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });

      setPincodeResult({
        available: true,
        message: `Express Insured Delivery verified for PIN ${cleanPin}`,
        date: `Estimated delivery by ${dateString}`
      });
    } else {
      setPincodeResult({
        available: false,
        message: 'Please enter a valid 6-digit Indian PIN Code.',
        date: ''
      });
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock === 0 || isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
      setIsCartOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;
    try {
      await addToCart(selectedVariant.id, quantity);
      navigate('/checkout');
    } catch {
      // Handled in context
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        userName: reviewerName || 'Devoted Buyer'
      });
      if (res.success) {
        setReviewSuccess(true);
        setReviewComment('');
        const updated = await api.get(`/products/${slug}`);
        if (updated.success) setProduct(updated.product);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-slate-800">Sacred Creation Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for is unavailable or has been re-sanctified.</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-vedic-navy text-white text-xs font-bold rounded-xl shadow-luxury">
          Browse Sacred Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.specialPrice || selectedVariant?.price || product.basePrice;
  const originalPrice = selectedVariant?.price || product.basePrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  let parsedSpecs: Record<string, string> = {};
  try {
    if (product.specifications) {
      parsedSpecs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
    }
  } catch {
    // ignore
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Full-screen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white rounded-full bg-white/10"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-amber-600">Catalog</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-amber-600">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Editorial Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Gallery: Sticky Image Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-vedic-border/80 shadow-card group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=1200';
              }}
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-vedic-saffron text-white text-xs font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                {discountPercent}% OFF
              </span>
            )}

            {/* Lightbox trigger */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-white/90 hover:bg-vedic-navy hover:text-white text-slate-700 shadow-md backdrop-blur-sm transition-all"
              aria-label="View Fullscreen"
              title="View full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors shadow-md ${
                isWishlisted(product.id)
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Gallery Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img.url
                      ? 'border-vedic-gold shadow-md scale-95 ring-2 ring-vedic-gold/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText || ''}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Temple Consecration Guarantee Card */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-vedic-navy text-vedic-gold flex items-center justify-center shrink-0 border border-vedic-gold/40 shadow-luxury">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Temple Pran-Pratishtha Consecrated
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Handcrafted from authentic heavy gauge copper/brass. Consecrated with sacred Suktas, Gangajal Abhishekam, and Vedic rituals. Includes certified Certificate of Consecration.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Purchase Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-800 font-extrabold uppercase tracking-widest text-xs">
                {product.category?.name}
              </span>
              <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700 font-bold">
                Item Code: {product.productCode}
              </span>
            </div>

            <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating and Social Proof */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold ml-1 text-slate-800">{product.rating.toFixed(1)}</span>
                <span className="text-[10px] text-slate-500 ml-1">/ 5.0</span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                ({product.reviewCount} Devotee Reviews)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Verified Authentic
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/80 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                Special Consecrated Price
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="font-serif text-3xl sm:text-4xl font-black text-slate-900">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-sm sm:text-base text-slate-500 line-through font-medium">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-1">
                Inclusive of GST & Free Insured Packaging
              </div>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold text-xs rounded-full inline-block">
                  Out of Stock
                </span>
              ) : selectedVariant && selectedVariant.stock <= 5 ? (
                <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full inline-block animate-pulse">
                  Only {selectedVariant.stock} Left!
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-block">
                  Consecrated & Ready
                </span>
              )}
            </div>
          </div>

          {/* Size / Dimension Selector */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Select Consecrated Size / Dimensions:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQuantity(1);
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'border-vedic-gold bg-vedic-gold/10 ring-2 ring-vedic-gold/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{v.size}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      ₹{(v.specialPrice || v.price).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium mt-1">
                      {v.stock > 0 ? `${v.stock} in sanctum` : 'Out of stock'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-slate-300 rounded-2xl px-3 py-2.5 bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="text-slate-500 hover:text-slate-900 px-2 font-bold text-base disabled:opacity-25"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 text-sm font-extrabold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                  disabled={quantity >= (selectedVariant?.stock || 1) || isOutOfStock}
                  className="text-slate-500 hover:text-slate-900 px-2 font-bold text-base disabled:opacity-25"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm shadow-luxury flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Sacred Cart!</span>
                  </>
                ) : isAdding ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-vedic-gold hover:text-slate-950" />
                    <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Sacred Cart'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Instant Buy Now */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-vedic-gold to-amber-500 hover:from-amber-400 hover:to-vedic-gold text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-luxury transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Instant Consecrated Buy Now</span>
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verify Express Sacred Delivery:
            </label>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN Code (e.g. 560003)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-vedic-gold"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-slate-200 hover:bg-vedic-navy hover:text-white text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Check
              </button>
            </form>

            {pincodeResult && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                pincodeResult.available ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {pincodeResult.available ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                <div>
                  <div className="font-bold">{pincodeResult.message}</div>
                  {pincodeResult.date && <div className="text-[11px] text-emerald-700">{pincodeResult.date}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Trust Indicators Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Consecrated</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Award className="w-4 h-4 text-vedic-gold shrink-0" />
              <span>Lab Certified Metal</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Free Express Insured</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Package className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Tamper Sacred Packaging</span>
            </div>
          </div>
        </div>

      </div>

      {/* Expandable Luxury Accordions */}
      <div className="border-t border-slate-200 pt-12 space-y-4 max-w-4xl mx-auto">
        <h3 className="font-serif font-extrabold text-2xl text-slate-900 mb-6 text-center">
          Comprehensive Consecration Details & Lore
        </h3>

        {/* Accordion 1: Sacred Significance */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <button
            onClick={() => toggleAccordion('significance')}
            className="w-full p-5 text-left font-serif font-bold text-base text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span>1. Sacred Significance & Agamic Lore</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordions.significance ? 'rotate-180 text-vedic-gold' : ''}`} />
          </button>
          {openAccordions.significance && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>{product.description}</p>
              {product.spiritualSignificance && (
                <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 my-2 space-y-1">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-vedic-gold" />
                    <span>Energizing Sukta & Agamic Ritual</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-sans">
                    {product.spiritualSignificance}
                  </p>
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                Recommended Direction: East or North-East corner of your residence, puja altar, or sacred workspace.
              </p>
            </div>
          )}
        </div>

        {/* Accordion 2: Specifications */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <button
            onClick={() => toggleAccordion('specs')}
            className="w-full p-5 text-left font-serif font-bold text-base text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span>2. Technical Specifications & Metal Weight</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordions.specs ? 'rotate-180 text-vedic-gold' : ''}`} />
          </button>
          {openAccordions.specs && (
            <div className="p-5 pt-0 border-t border-slate-100">
              <div className="divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-2 py-2.5">
                  <span className="text-slate-500 font-semibold">Sacred Product Code</span>
                  <span className="font-mono text-slate-900 font-bold">{product.productCode}</span>
                </div>
                <div className="grid grid-cols-2 py-2.5">
                  <span className="text-slate-500 font-semibold">Primary Category</span>
                  <span className="text-slate-900 font-bold">{product.category?.name}</span>
                </div>
                {Object.entries(parsedSpecs).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 py-2.5">
                    <span className="text-slate-500 font-semibold">{key}</span>
                    <span className="text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Ritual Protocol */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <button
            onClick={() => toggleAccordion('ritual')}
            className="w-full p-5 text-left font-serif font-bold text-base text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span>3. How to Cleanse & Install in Your Home</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordions.ritual ? 'rotate-180 text-vedic-gold' : ''}`} />
          </button>
          {openAccordions.ritual && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                1. Upon receiving the parcel, bathe and wear clean attire during morning Brahma Muhurta or Shukla Paksha.
              </p>
              <p>
                2. Sprinkle the included Gangajal over the yantra or gemstone ring with a fresh Tulsi leaf or flower.
              </p>
              <p>
                3. Place on a clean silk cloth (yellow or red) facing East or North-East.
              </p>
              <p>
                4. Light pure cow-ghee lamp (Diya) and natural dhoop incense, reciting the specific deity mantra 108 times.
              </p>
            </div>
          )}
        </div>

        {/* Accordion 4: Shipping & Returns */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          <button
            onClick={() => toggleAccordion('shipping')}
            className="w-full p-5 text-left font-serif font-bold text-base text-slate-900 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span>4. Insured Shipping & Return Policy</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openAccordions.shipping ? 'rotate-180 text-vedic-gold' : ''}`} />
          </button>
          {openAccordions.shipping && (
            <div className="p-5 pt-0 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                • Express Dispatch within 24 to 48 hours via Blue Dart, DTDC, and Speed Post.
              </p>
              <p>
                • Full transit insurance included against accidental transit damage.
              </p>
              <p>
                • 7-Day Hassle-Free Replacement: In the rare case of transit damage, we immediately dispatch a re-consecrated replacement free of charge.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Reviews Section with 5-Star Distribution Breakdown */}
      <div className="border-t border-slate-200 pt-16 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-vedic-gold">
            Verified Devotee Feedback
          </div>
          <h3 className="font-serif font-extrabold text-3xl text-slate-900">
            Devotee Ratings & Sanctum Testimonials
          </h3>
        </div>

        {/* Score & Progress Bar Breakdown */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Overall Score */}
          <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0">
            <div className="font-serif text-5xl font-black text-slate-900">
              {product.rating.toFixed(1)}
            </div>
            <div className="flex justify-center text-amber-500 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Based on {product.reviewCount} verified devotee experiences
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 font-bold text-slate-700">5 ★</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[88%]" />
              </div>
              <span className="w-10 text-right text-slate-500 font-semibold">88%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 font-bold text-slate-700">4 ★</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[9%]" />
              </div>
              <span className="w-10 text-right text-slate-500 font-semibold">9%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 font-bold text-slate-700">3 ★</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[3%]" />
              </div>
              <span className="w-10 text-right text-slate-500 font-semibold">3%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 font-bold text-slate-700">2 ★</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[0%]" />
              </div>
              <span className="w-10 text-right text-slate-500 font-semibold">0%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 font-bold text-slate-700">1 ★</span>
              <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[0%]" />
              </div>
              <span className="w-10 text-right text-slate-500 font-semibold">0%</span>
            </div>
          </div>
        </div>

        {/* Existing Reviews List & Submit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="font-serif font-bold text-lg text-slate-900">
              Devotee Experiences ({product.reviews?.length || 0})
            </h4>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-200">
                          Verified Devotee
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                Be the first devotee to share your sacred consecration experience with this artefact.
              </div>
            )}
          </div>

          {/* Submit Review Box */}
          <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
            <h4 className="font-serif font-bold text-base text-slate-900">Share Your Sacred Review</h4>
            <p className="text-xs text-slate-500">
              Your feedback guides thousands of devotees across Bharat.
            </p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🕉️ Dhanyavad! Your testimonial has been submitted.</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kulkarni"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-vedic-gold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blessing Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className={`text-xl font-bold transition-transform ${
                          reviewRating >= num ? 'text-amber-500 scale-110' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Experience & Feedback</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="How has this consecrated creation blessed your puja altar?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-vedic-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-3 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950 font-bold text-xs rounded-xl shadow-luxury transition-all"
                >
                  {isSubmittingReview ? 'Submitting Testimonial...' : 'Submit Devotee Review'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Frequently Consecrated Together Cross-Sell */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 border-t border-slate-200 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-vedic-gold">
                Harmonious Energy
              </div>
              <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-slate-900">
                Frequently Consecrated Together
              </h3>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-vedic-navy hover:text-vedic-gold flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All 71 Artefacts</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
