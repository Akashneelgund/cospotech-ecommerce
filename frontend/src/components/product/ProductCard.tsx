import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Sparkles, Check, Flame } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || ({} as ProductVariant)
  );
  const [isAdding, setIsAdding] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=800';

  const secondaryImage =
    product.images?.find((img) => !img.isPrimary)?.url ||
    product.images?.[1]?.url ||
    primaryImage;

  const currentPrice = selectedVariant?.specialPrice || selectedVariant?.price || product.basePrice;
  const originalPrice = selectedVariant?.price || product.basePrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const isOutOfStock = (selectedVariant?.stock ?? totalStock) === 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant?.id || isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(selectedVariant.id, 1);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    } catch {
      // Handled in CartContext
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-3xl border border-vedic-border/70 hover:border-vedic-gold/70 shadow-card hover:shadow-luxury transition-all duration-500 flex flex-col overflow-hidden"
    >
      {/* Badges Overlay */}
      <div className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 z-20 flex flex-col gap-1 sm:gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-vedic-saffron text-white text-[8px] sm:text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestseller && (
          <span className="bg-vedic-navy/95 backdrop-blur-md text-vedic-lightgold text-[8px] sm:text-[9px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full border border-vedic-gold/40 shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-vedic-gold" />
            <span className="hidden xs:inline">Devotee Choice</span>
            <span className="xs:hidden">Top</span>
          </span>
        )}
        {product.isLimitedDrop && (
          <span className="bg-rose-900/90 backdrop-blur-md text-rose-200 text-[8px] sm:text-[9px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full border border-rose-600/40 shadow-sm flex items-center gap-1">
            <Flame className="w-2.5 h-2.5 text-rose-400" />
            <span>Limited</span>
          </span>
        )}
      </div>

      {/* Floating Wishlist Heart */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2 sm:top-3.5 right-2 sm:right-3.5 z-20 p-1.5 sm:p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
          isWishlisted(product.id)
            ? 'bg-rose-50 text-rose-600 shadow-md scale-110'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-2xs'
        }`}
        aria-label="Toggle Wishlist"
      >
        <Heart
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
            isWishlisted(product.id) ? 'fill-rose-500 text-rose-500 animate-heartBeat' : ''
          }`}
        />
      </button>

      {/* Image Gallery Container */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-50 cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            isHovered && secondaryImage !== primaryImage
              ? 'opacity-0 scale-105'
              : 'opacity-100 group-hover:scale-105'
          }`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=800';
          }}
        />

        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate consecrated angle`}
            className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=800';
            }}
          />
        )}

        {/* Quick View Button on Image */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-vedic-navy hover:text-white text-slate-800 text-[11px] font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-3.5 h-3.5 text-vedic-gold" />
            <span>Quick View</span>
          </button>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Category & Product Code */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="text-amber-800 font-extrabold uppercase tracking-widest truncate max-w-[100px] sm:max-w-[130px]">
              {product.category?.name || 'Vedic Sacred'}
            </span>
            <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded font-bold text-[8px] sm:text-[10px]">
              #{product.productCode}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.slug}`} className="block">
            <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-base group-hover:text-amber-700 transition-colors line-clamp-1 sm:line-clamp-2 leading-tight">
              {product.name}
            </h4>
          </Link>

          {/* Mood / Intention Pill if present */}
          {product.mood && (
            <div className="text-[9px] sm:text-[10px] text-amber-800 bg-amber-50/80 px-1.5 sm:px-2 py-0.5 rounded-full inline-block font-semibold">
              ✨ {product.mood}
            </div>
          )}

          {/* Size / Variant Picker (if multiple sizes exist) */}
          {product.variants && product.variants.length > 1 && (
            <div className="flex flex-wrap gap-1 pt-0.5 sm:pt-1">
              {product.variants.slice(0, 3).map((v) => (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md border font-semibold transition-all ${
                    selectedVariant?.id === v.id
                      ? 'bg-vedic-navy text-vedic-lightgold border-vedic-navy shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-vedic-gold'
                  }`}
                >
                  {v.size}
                </button>
              ))}
              {product.variants.length > 3 && (
                <span className="text-[9px] text-slate-400 self-center">+{product.variants.length - 3}</span>
              )}
            </div>
          )}

          {/* Ratings & Devotee Reviews */}
          <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-[11px] sm:text-xs font-bold ml-1 text-slate-800">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Quick Add Row */}
        <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1 sm:gap-2">
          <div>
            <div className="flex items-baseline gap-1 sm:gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm sm:text-lg">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Live Scarcity & Consecration Indicator */}
            <div className="text-[9px] sm:text-[10px] leading-tight mt-0.5">
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Out of Stock</span>
              ) : selectedVariant?.stock <= 5 ? (
                <span className="text-amber-600 font-bold">
                  {selectedVariant.stock} left in sanctum!
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <span className="hidden xs:inline">Pran-Pratishtha Consecrated</span>
                  <span className="xs:hidden">Consecrated</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
            className={`p-2 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-1.5 shrink-0 shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950 active:scale-95'
            }`}
            aria-label="Add to cart"
            title={isOutOfStock ? 'Out of Stock' : 'Add to Sacred Cart'}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : isAdding ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-vedic-gold" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
