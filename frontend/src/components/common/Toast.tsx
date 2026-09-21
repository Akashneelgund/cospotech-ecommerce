import React from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-vedic-navy text-white px-4 py-3 rounded-xl shadow-2xl border border-vedic-gold/40 flex items-center gap-3 text-sm font-medium">
        <CheckCircle className="w-5 h-5 text-vedic-gold shrink-0" />
        <span>{toastMessage}</span>
        <button
          onClick={clearToast}
          className="ml-2 text-slate-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
