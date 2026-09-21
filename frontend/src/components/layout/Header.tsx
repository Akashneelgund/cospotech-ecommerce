import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Gift,
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { SearchOverlay } from '../search/SearchOverlay';
import { api } from '../../services/api';
import { Announcement } from '../../types';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/banners/announcements');
        if (res.success && res.announcements?.length > 0) {
          setAnnouncements(res.announcements);
        }
      } catch {
        // Fallback default
        setAnnouncements([
          { id: '1', text: '✨ FREE EXPRESS INSURED SHIPPING ON ORDERS ABOVE ₹999 ACROSS BHARAT', displayOrder: 1, isActive: true },
          { id: '2', text: '🕉️ EVERY ARTEFACT CONSECRATED WITH VEDIC SUKTAS & TEMPLE GANGAPOOJA', displayOrder: 2, isActive: true },
          { id: '3', text: '🎁 USE CODE "VEDA10" FOR 10% BLESSING DISCOUNT AT CHECKOUT', displayOrder: 3, isActive: true }
        ]);
      }
    };
    fetchAnnouncements();
  }, []);

  // Rotate announcement bar every 5 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [announcements]);

  // Click outside listener for menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Keyboard shortcut (⌘K / Ctrl+K) & custom open-search event
  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOverlayOpen(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOverlayOpen(true);
      }
    };
    window.addEventListener('open-search', handleOpenSearch);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('open-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const megaMenuCategories = [
    {
      title: 'Sacred Yantras',
      slug: 'all-yantra',
      items: ['Bagalamukhi Yantra', 'Shree Yantra', 'Kuber Yantra', 'Mahamrityunjaya', 'Durga Bisa Yantra', 'Surya & Navgraha']
    },
    {
      title: 'Gemstone Rings',
      slug: 'gemstone-rings',
      items: ['Pukhraj (Yellow Sapphire)', 'Panna (Emerald)', 'Manik (Ruby)', 'Neelam (Blue Sapphire)', 'Moonga (Red Coral)', 'Moti (Natural Pearl)']
    },
    {
      title: 'Sacred Chowkis',
      slug: 'sacred-chowki',
      items: ['Shree Yantra Chowki', 'Kuber Dhan Chowki', 'Durga Bisa Chowki', 'Mahalakshmi Brass Altar', 'Navgraha Chowki']
    },
    {
      title: 'Malas & Karungali',
      slug: 'sacred-bracelets',
      items: ['Original Black Karungali 108', 'Karungali Vel & Bracelets', '5 Mukhi Rudraksha Mala', 'Lotus Seed Kamal Gatta', 'Sandalwood Chandan Mala']
    }
  ];

  return (
    <>
      <SearchOverlay isOpen={isSearchOverlayOpen} onClose={() => setIsSearchOverlayOpen(false)} />

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-vedic-border/60 transition-all shadow-sm">
        {/* Dynamic Announcement Bar */}
        <div
          style={{ backgroundColor: '#080C16', color: '#FDE68A' }}
          className="bg-[#080C16] text-[#FDE68A] text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 border-b border-amber-500/30 overflow-hidden relative shadow-sm"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 transition-all duration-500 transform animate-in fade-in slide-in-from-top-1 truncate max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-sans text-[10px] sm:text-xs font-bold tracking-wider drop-shadow-sm text-amber-200 truncate">
              {announcements[currentAnnouncementIndex]?.text || 'FREE EXPRESS INSURED SHIPPING ACROSS BHARAT'}
            </span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Left: Mobile Menu Trigger */}
            <div className="flex items-center lg:hidden shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-1 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-slate-100 focus:outline-none transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center group shrink-0 whitespace-nowrap py-1">
              <img
                src="/images/cospotech-logo-horizontal.png"
                alt="Cospotech"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-xs font-bold uppercase tracking-wider text-slate-800 shrink-0 whitespace-nowrap">
              
              {/* Mega Menu Dropdown Trigger */}
              <div
                ref={megaMenuRef}
                className="relative shrink-0 whitespace-nowrap"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
              >
                <button
                  onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                  className="flex items-center gap-1.5 py-6 hover:text-amber-600 transition-colors whitespace-nowrap shrink-0"
                >
                  <span className="whitespace-nowrap">Sacred Collections</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${isMegaMenuOpen ? 'rotate-180 text-amber-600' : ''}`} />
                </button>

                {/* Mega Menu Flyout */}
                {isMegaMenuOpen && (
                  <div
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                    className="absolute top-full left-1/2 -translate-x-1/3 w-[900px] bg-white rounded-3xl shadow-2xl border border-vedic-border/70 p-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="grid grid-cols-12 gap-8">
                      
                      {/* Left: Category Columns */}
                      <div className="col-span-8 grid grid-cols-2 gap-6 border-r border-slate-100 pr-6">
                        {megaMenuCategories.map((col) => (
                          <div key={col.title} className="space-y-3">
                            <Link
                              to={`/shop?category=${col.slug}`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="font-serif font-bold text-sm text-vedic-navy hover:text-amber-600 block pb-1 border-b border-slate-100"
                            >
                              {col.title} →
                            </Link>
                            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                              {col.items.map((item) => (
                                <li key={item}>
                                  <Link
                                    to={`/shop?search=${encodeURIComponent(item.split(' ')[0])}`}
                                    onClick={() => setIsMegaMenuOpen(false)}
                                    className="hover:text-slate-900 transition-colors block py-0.5"
                                  >
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Right: Featured Spotlight Showcase */}
                      <div className="col-span-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                            Temple Spotlight
                          </div>
                          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                            <img
                              src="https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=600"
                              alt="Shree Yantra Heavy Brass"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=600';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <p className="font-serif font-bold text-xs">Consecrated Shree Yantra</p>
                              <p className="text-[10px] text-amber-200">Pran-Pratishtha Certified</p>
                            </div>
                          </div>
                        </div>

                        <Link
                          to="/shop"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="mt-4 w-full py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-900 font-bold text-xs rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Explore All 71 Artefacts</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              <Link to="/shop" className="hover:text-amber-600 transition-colors whitespace-nowrap shrink-0">
                All Artefacts
              </Link>
              
              <Link to="/shop?sort=bestseller" className="hover:text-amber-600 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0">
                <span>Bestsellers</span>
              </Link>

              <Link
                to="/offers"
                className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span className="whitespace-nowrap">Offers & Deals</span>
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shrink-0">
                  Hot
                </span>
              </Link>
            </nav>

            {/* Right Action Icons & Search Trigger */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 whitespace-nowrap">
              
              {/* Desktop Search Pill Trigger */}
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                className="hidden md:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-500/60 text-slate-600 hover:text-slate-800 px-3 py-2 rounded-full transition-all text-xs font-semibold shadow-2xs whitespace-nowrap shrink-0"
                aria-label="Open search dialog"
              >
                <Search className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Search consecrated yantras, code...</span>
                <span className="hidden md:inline xl:hidden whitespace-nowrap">Search...</span>
                <span className="hidden md:inline-block bg-white text-[10px] font-mono text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                  ⌘K
                </span>
              </button>

              {/* Mobile Compact Search Icon Trigger */}
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                className="md:hidden p-2 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-full transition-colors shrink-0"
                aria-label="Search artefacts"
              >
                <Search className="w-5 h-5 shrink-0" />
              </button>

              {/* Wishlist Button (Hidden on small mobile, accessible via bottom nav) */}
              <Link
                to="/wishlist"
                className="hidden sm:flex relative p-2.5 text-slate-700 hover:text-rose-600 hover:bg-slate-50 rounded-full transition-colors shrink-0"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 shrink-0" />
                {wishlistIds.length > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 bg-vedic-saffron text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-900 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
                aria-label="Open shopping cart drawer"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-vedic-gold text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account Menu */}
              <div ref={userMenuRef} className="relative shrink-0">
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 pl-2 sm:pl-2.5 pr-2 rounded-full border border-slate-200 hover:border-vedic-gold bg-slate-50 text-xs font-semibold text-slate-800 transition-all whitespace-nowrap shrink-0"
                  >
                    <span className="hidden sm:inline line-clamp-1 max-w-[90px] whitespace-nowrap">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-vedic-gold text-slate-800 hover:text-slate-900 rounded-full transition-all whitespace-nowrap shrink-0"
                  >
                    <UserIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Sign In</span>
                  </Link>
                )}

                {/* Account Dropdown */}
                {isUserMenuOpen && user && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-xs animate-in fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-vedic-lightgold/50 text-vedic-navy uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-vedic-gold transition-colors font-medium"
                    >
                      <PackageCheck className="w-4 h-4 text-slate-400" />
                      <span>My Sacred Orders</span>
                    </Link>

                    <Link
                      to="/account?tab=rewards"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-vedic-gold transition-colors font-medium"
                    >
                      <Gift className="w-4 h-4 text-slate-400" />
                      <span>Vedic Rewards & Coins</span>
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-vedic-navy font-bold hover:bg-amber-50 hover:text-vedic-gold border-t border-slate-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-vedic-gold" />
                        <span>Admin Control Suite</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 border-t border-slate-100 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </header>

      {/* Mobile Slide-Over Drawer with Full Backdrop mounted via Portal */}
      {isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-[999] flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div className="relative w-[85vw] max-w-sm bg-white h-screen h-[100dvh] shadow-2xl flex flex-col z-[1000] animate-in slide-in-from-left duration-300 overflow-y-auto">
              
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                  <img
                    src="/images/cospotech-logo-horizontal.png"
                    alt="Cospotech"
                    className="h-7 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Devotee Account Section in Drawer */}
              {user ? (
                <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 space-y-2.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[190px]">{user.email}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-vedic-navy text-vedic-lightgold uppercase">
                      {user.role}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 text-center hover:bg-amber-50 shadow-2xs"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/account?tab=rewards"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 text-center hover:bg-amber-50 shadow-2xs"
                    >
                      Vedic Coins
                    </Link>
                  </div>
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block p-2 bg-vedic-navy text-vedic-lightgold rounded-xl text-center text-xs font-bold shadow-2xs"
                    >
                      Admin Control Suite →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-2 shrink-0">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 bg-vedic-navy text-white text-center rounded-xl text-xs font-bold shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 bg-white border border-slate-200 text-slate-800 text-center rounded-xl text-xs font-bold"
                  >
                    Create Account
                  </Link>
                </div>
              )}

              {/* Drawer Navigation Links */}
              <div className="p-4 flex-1 space-y-5">
                {/* Search Bar Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOverlayOpen(true);
                  }}
                  className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl text-slate-600 text-xs font-medium text-left"
                >
                  <Search className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Search 71 consecrated artefacts...</span>
                </button>

                <div className="space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-1">
                    Sacred Collections
                  </div>
                  <div className="space-y-1 text-sm font-semibold">
                    <Link
                      to="/shop"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <span>All Sacred Products (71)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      to="/shop?category=all-yantra"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <span>Sacred Yantras</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      to="/shop?category=gemstone-rings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <span>Gemstone Rings</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      to="/shop?category=sacred-chowki"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <span>Sacred Chowkis</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      to="/shop?category=sacred-bracelets"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <span>Karungali & Malas</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                    <Link
                      to="/offers"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-amber-700 bg-amber-50/80 font-bold transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>Offers & Flash Sale</span>
                      </div>
                      <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">HOT</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-center space-y-2.5 shrink-0">
                {user && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Pran-Pratishtha Consecrated</span>
                </div>
                <p className="text-[10px] text-slate-500">Pan-Bharat Insured Temple Logistics</p>
              </div>

            </div>
          </div>,
          document.body
        )}

      {/* Full-width Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
      />
    </>
  );
};
