import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-vedic-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-5 items-center text-center">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 text-[10px] font-semibold transition-colors ${
            isActive('/') ? 'text-vedic-navy font-bold' : 'text-slate-500 hover:text-vedic-gold'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${isActive('/') ? 'text-vedic-gold stroke-[2.5]' : ''}`} />
          <span>Home</span>
        </Link>

        {/* Shop / Catalog */}
        <Link
          to="/shop"
          className={`flex flex-col items-center py-1 text-[10px] font-semibold transition-colors ${
            isActive('/shop') ? 'text-vedic-navy font-bold' : 'text-slate-500 hover:text-vedic-gold'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 mb-0.5 ${isActive('/shop') ? 'text-vedic-gold stroke-[2.5]' : ''}`} />
          <span>Catalog</span>
        </Link>

        {/* Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center py-1 text-[10px] font-semibold text-slate-500 hover:text-vedic-gold transition-colors"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </button>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className={`relative flex flex-col items-center py-1 text-[10px] font-semibold transition-colors ${
            isActive('/wishlist') ? 'text-vedic-navy font-bold' : 'text-slate-500 hover:text-vedic-gold'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 mb-0.5 ${isActive('/wishlist') ? 'text-rose-500 fill-rose-500' : ''}`} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-vedic-saffron text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span>Saved</span>
        </Link>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center py-1 text-[10px] font-semibold text-slate-500 hover:text-vedic-gold transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-vedic-navy" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-vedic-navy text-vedic-gold text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-vedic-gold">
                {totalItems}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>
      </div>
    </nav>
  );
};
