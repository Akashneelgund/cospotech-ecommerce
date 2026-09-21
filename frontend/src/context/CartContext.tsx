import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.success) {
        setItems(res.items || []);
        setTotalItems(res.totalItems || 0);
        setSubtotal(res.subtotal || 0);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (variantId: string, quantity: number = 1) => {
    try {
      const res = await api.post('/cart/add', { variantId, quantity });
      if (res.success) {
        await refreshCart();
        setIsCartOpen(true);
        showToast('🕉️ Sacred item added to cart.');
      }
    } catch (err: any) {
      showToast(`⚠️ ${err.message}`);
      throw err;
    }
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    try {
      await api.put('/cart/update', { variantId, quantity });
      await refreshCart();
    } catch (err: any) {
      showToast(`⚠️ ${err.message}`);
    }
  };

  const removeFromCart = async (variantId: string) => {
    try {
      await api.delete(`/cart/item/${variantId}`);
      await refreshCart();
      showToast('Item removed from cart.');
    } catch (err: any) {
      showToast(`⚠️ ${err.message}`);
    }
  };

  const clearCart = () => {
    setItems([]);
    setTotalItems(0);
    setSubtotal(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        toastMessage,
        clearToast: () => setToastMessage(null)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
