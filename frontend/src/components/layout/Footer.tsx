import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{ backgroundColor: '#0A0F1D' }}
      className="bg-[#0A0F1D] text-slate-200 pt-16 pb-8 border-t-2 border-amber-500/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions / Trust Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 border border-amber-500/40 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Vedic Consecration</h4>
              <p className="text-xs text-slate-300 font-normal mt-0.5">Authentic Pran-Pratishtha rituals by learned temple priests.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 border border-amber-500/40 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Insured Delivery</h4>
              <p className="text-xs text-slate-300 font-normal mt-0.5">Free pan-India shipping with insured sacred tamper-evident packing.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 border border-amber-500/40 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Authenticity Certificate</h4>
              <p className="text-xs text-slate-300 font-normal mt-0.5">Every sacred yantra and gemstone comes with verifiable test certificate.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 border border-amber-500/40 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-white text-sm">Vedic Guidance</h4>
              <p className="text-xs text-slate-300 font-normal mt-0.5">Consultation on yantra placement, mantra sadhana, and Muhurta.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block py-1">
              <img
                src="/images/cospotech-logo-darkmode.png"
                alt="Cospotech"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-300 font-normal leading-relaxed max-w-sm">
              VedicVeda is a consecrated spiritual heritage sanctuary dedicated to bringing authentic, energized Vedic Yantras, natural lab-certified astrological gemstones, sacred temple Chowkis, and energized 108 japa malas to devotees worldwide.
            </p>
            <div className="pt-2 text-xs text-slate-300 font-normal space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Indiranagar, Bengaluru, Karnataka - 560038</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>support@vedicveda.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <span>+91 80 4920 7800 (Mon - Sat, 9am - 7pm IST)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">
              Sacred Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300 font-normal">
              <li><Link to="/shop?category=all-yantra" className="hover:text-amber-300">Consecrated Yantras</Link></li>
              <li><Link to="/shop?category=gemstone-rings" className="hover:text-amber-300">Astrological Rings</Link></li>
              <li><Link to="/shop?category=sacred-chowki" className="hover:text-amber-300">Temple Chowkis</Link></li>
              <li><Link to="/shop?category=sacred-bracelets" className="hover:text-amber-300">Karungali Bracelets</Link></li>
              <li><Link to="/shop?category=spiritual-kits" className="hover:text-amber-300">Puja Sadhana Kits</Link></li>
              <li><Link to="/shop?category=consecrated-malas-artefacts" className="hover:text-amber-300">Japa Malas & Idols</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">
              Devotee Support
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300 font-normal">
              <li><Link to="/account" className="hover:text-amber-300">Track Order Status</Link></li>
              <li><Link to="/cart" className="hover:text-amber-300">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-amber-300">Sacred Wishlist</Link></li>
              <li><span className="cursor-pointer hover:text-amber-300" onClick={() => alert('Consecration Guide: Each yantra is shipped with energization instructions, deity mantra, and Auspicious Ishanya (Northeast) placement guidelines.')}>Consecration Guide</span></li>
              <li><span className="cursor-pointer hover:text-amber-300" onClick={() => alert('GST Compliance: All products comply with Indian standard GST rules. Invoices are automatically generated.')}>Tax Invoices & GST</span></li>
            </ul>
          </div>

          {/* Policies & Newsletter */}
          <div>
            <h5 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider mb-4">
              Sacred Trust & Security
            </h5>
            <p className="text-xs text-slate-300 font-normal mb-3">
              Insured courier delivery via Blue Dart, DTDC, and India Post Speed Post.
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="font-semibold text-white">Accepted Payments</div>
              <div className="text-slate-300 mt-1 flex flex-wrap gap-1.5 text-[11px]">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-200">UPI</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-200">Razorpay</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-200">Cards</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-200">NetBanking</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-200">COD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 VedicVeda Heritage Pvt. Ltd. All rights reserved. Registered under Indian Companies Act.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Shipping Policy</span>
            <span className="hover:text-white cursor-pointer">Return Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
