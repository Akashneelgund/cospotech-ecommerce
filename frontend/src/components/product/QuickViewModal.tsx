import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Star, ShoppingBag, ArrowRight, ShieldCheck, Heart, Zap, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product) {
      const defaultVariant = product.variants?.[0] || null;
      setSelectedVariant(defaultVariant);
      const defaultImg =
        product.images?.find((i) => i.isPrimary)?.url ||
        product.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=800';
      setSelectedImage(defaultImg);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const currentPrice = selectedVariant?.specialPrice || selectedVariant?.price || product.basePrice;
  const originalPrice = selectedVariant?.price || product.basePrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;

  const handleAdd = async () => {
    if (!selectedVariant || isOutOfStock) return;
    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      onClose();
      setIsCartOpen(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleInstantBuy = async () => {
    if (!selectedVariant || isOutOfStock) return;
    try {
      await addToCart(selectedVariant.id, quantity);
      onClose();
      navigate('/checkout');
    } catch {
      // Handled in CartContext
    }
  };

  return createPortal(
    <div
      style={{ backgroundColor: 'rgba(8, 12, 22, 0.85)' }}
      className="fixed inset-0 z-[1000] overflow-y-auto bg-vedic-obsidian/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-vedic-border/70 animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left: Gallery Column */}
            <div className="md:col-span-6 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=800';
                  }}
                />
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-vedic-saffron text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    {discountPercent}% OFF
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                    isWishlisted(product.id)
                      ? 'bg-rose-50 text-rose-600 shadow-sm'
                      : 'bg-white/80 text-slate-400 hover:text-rose-500'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImage === img.url ? 'border-vedic-gold shadow-sm scale-95' : 'border-slate-200 hover:border-slate-300'
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
            </div>

            {/* Right: Info & Purchase Column */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-extrabold uppercase tracking-wider">
                    {product.category?.name}
                  </span>
                  <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                    Code: {product.productCode}
                  </span>
                </div>

                <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-slate-900 mt-1">
                  {product.name}
                </h3>

                {/* Ratings */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold ml-1 text-slate-800">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">({product.reviewCount} reviews)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Pran-Pratishtha Certified
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-500 line-through font-medium">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Stock Notice */}
                <div className="mt-1.5 text-xs">
                  {isOutOfStock ? (
                    <span className="text-rose-600 font-bold">Temporarily Out of Stock</span>
                  ) : selectedVariant?.stock <= 5 ? (
                    <span className="text-amber-600 font-bold">
                      Hurry! Only {selectedVariant.stock} consecrated units available
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium">
                      In Stock • Dispatches with Authenticity Certificate
                    </span>
                  )}
                </div>

                {/* Variant Selector */}
                {product.variants && product.variants.length > 1 && (
                  <div className="mt-5 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Select Consecrated Size:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            selectedVariant?.id === v.id
                              ? 'border-vedic-navy bg-vedic-navy text-vedic-lightgold shadow-sm'
                              : 'border-slate-200 bg-slate-50 hover:border-vedic-gold text-slate-700'
                          }`}
                        >
                          <span>{v.size}</span>
                          <span className="ml-1.5 font-normal text-[10px] opacity-80">
                            (₹{(v.specialPrice || v.price).toLocaleString('en-IN')})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-slate-500 hover:text-slate-900 px-1 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-2.5 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant?.stock || 1, quantity + 1))}
                      disabled={quantity >= (selectedVariant?.stock || 1)}
                      className="text-slate-500 hover:text-slate-900 px-1 font-bold text-sm disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    disabled={isOutOfStock || isAdding}
                    className="flex-1 py-3 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950 font-bold text-xs rounded-xl shadow-luxury flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4 text-vedic-gold hover:text-slate-950" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Add to Sacred Cart'}</span>
                  </button>
                </div>

                {/* Instant Buy Now Button */}
                <button
                  onClick={handleInstantBuy}
                  disabled={isOutOfStock}
                  className="w-full py-2.5 bg-gradient-to-r from-vedic-gold to-amber-500 hover:from-amber-400 hover:to-vedic-gold text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Instant Consecrated Buy Now</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate(`/products/${product.slug}`);
                  }}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-vedic-gold py-1 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View Full Ritual Guidelines & Agamic Mantra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
