import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = '+919876543210';
  const message = encodeURIComponent('Namaste VedicVeda Team, I need assistance with consecration rituals / product inquiry.');
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 sm:bottom-8 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group flex items-center gap-2 border border-emerald-400/40"
      aria-label="Contact Vedic Concierge on WhatsApp"
      title="Contact Vedic Concierge on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-xs font-bold tracking-wide">
        WhatsApp Devotee Concierge
      </span>
    </a>
  );
};
