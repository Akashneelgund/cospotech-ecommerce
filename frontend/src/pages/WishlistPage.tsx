import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export const WishlistPage: React.FC = () => {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-400">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-900">Your Sacred Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save your favorite consecrated yantras, gemstone rings, and temple artefacts here for auspicious future moments.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-vedic-navy hover:bg-vedic-gold text-white text-xs font-bold rounded-xl shadow-luxury transition-colors"
        >
          <span>Explore 71 Sacred Creations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-extrabold text-slate-900">My Sacred Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">
          {items.length} consecrated item{items.length > 1 ? 's' : ''} saved for sacred acquisition
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {items.map((item) => {
          const defaultVariant = item.variants?.[0];
          const price = item.specialPrice || item.basePrice;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-vedic-border/70 hover:border-vedic-gold/60 shadow-card p-4 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(item.productId)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-500 shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] uppercase font-bold text-vedic-gold">
                  Code: {item.code}
                </div>
                <Link to={`/products/${item.slug}`}>
                  <h4 className="font-serif font-bold text-sm text-slate-900 line-clamp-1 hover:text-vedic-gold mt-0.5">
                    {item.name}
                  </h4>
                </Link>
                <div className="text-base font-extrabold text-slate-900 mt-2">
                  ₹{price.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={async () => {
                    if (defaultVariant) {
                      await addToCart(defaultVariant.id, 1);
                      await toggleWishlist(item.productId);
                    }
                  }}
                  disabled={!item.inStock}
                  className="w-full py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{item.inStock ? 'Move to Sacred Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
