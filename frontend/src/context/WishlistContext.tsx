import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  items: any[];
  toggleWishlist: (productId: string) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const { user } = useAuth();

  const refreshWishlist = async () => {
    if (!user) {
      setItems([]);
      setWishlistIds([]);
      return;
    }

    try {
      const res = await api.get('/wishlist');
      if (res.success && res.items) {
        setItems(res.items);
        setWishlistIds(res.items.map((it: any) => it.productId));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      alert('Please sign in to save items to your sacred wishlist.');
      return false;
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId });
      if (res.success) {
        await refreshWishlist();
        return res.isWishlisted;
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update wishlist');
    }
    return false;
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, items, toggleWishlist, isWishlisted, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
