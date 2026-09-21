import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const trendingSearches = [
    'Bagalamukhi Yantra',
    'Shree Yantra',
    'Karungali Mala 108',
    'Pukhraj Ring',
    'Diwali Puja Kit',
    'Kuber Chowki',
    'Ruby Ring',
    'Mahamrityunjaya'
  ];

  const popularCategories = [
    { name: 'Sacred Yantras', slug: 'all-yantra' },
    { name: 'Gemstone Rings', slug: 'gemstone-rings' },
    { name: 'Sacred Chowkis', slug: 'sacred-chowki' },
    { name: 'Karungali & Bracelets', slug: 'sacred-bracelets' },
    { name: 'Spiritual Kits', slug: 'spiritual-kits' }
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSuggestions([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search-suggestions?q=${encodeURIComponent(query.trim())}`);
        if (res.success) {
          setSuggestions(res.suggestions || []);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/products/${slug}`);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{ backgroundColor: 'rgba(8, 12, 22, 0.95)' }}
      className="fixed inset-0 z-[1000] overflow-y-auto bg-vedic-obsidian/95 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-16 pb-20">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Discover Authentic Consecrated Artefacts</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-medium"
            aria-label="Close search"
          >
            <span>ESC</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Search Input Box */}
        <form onSubmit={handleSubmit} className="relative mt-8">
          <div className="relative flex items-center">
            <Search className="w-7 h-7 text-amber-400 absolute left-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by deity, intention, name, or code (e.g. 0001)..."
              className="w-full bg-white/5 border-2 border-amber-500/40 focus:border-amber-400 text-white placeholder-slate-300 rounded-2xl pl-16 pr-24 py-4 sm:py-5 text-base sm:text-xl font-medium focus:outline-none focus:ring-4 focus:ring-amber-500/20 shadow-2xl transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-14 text-slate-300 hover:text-white text-xs px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-transform hover:scale-105 shadow-md"
              aria-label="Submit search"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Suggestions / Results */}
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-12 text-slate-300 text-sm flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <span>Scanning consecrated archives...</span>
            </div>
          ) : query.trim().length >= 2 ? (
            <div>
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-2 uppercase tracking-wider">
                    <span>Matching Sacred Creations ({suggestions.length})</span>
                    <button
                      onClick={() => handleSubmit()}
                      className="text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <span>View full catalog results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProduct(item.slug)}
                        className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/60 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-200"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1609743522653-52354461eb27?q=80&w=400';
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                              {item.name}
                            </h5>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-vedic-lightgold/80">Code: {item.code}</span>
                              <span>•</span>
                              <span className="text-slate-300">{item.category}</span>
                            </div>
                            <div className="text-sm font-bold text-amber-400 mt-1">
                              ₹{item.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          item.inStock ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                        }`}>
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 p-8 space-y-3">
                  <p className="text-base text-slate-300 font-serif">No consecrated item found matching &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try searching for universal terms such as &ldquo;Yantra&rdquo;, &ldquo;Mala&rdquo;, &ldquo;Ring&rdquo;, or browse our sacred categories below.
                  </p>
                  <button
                    onClick={() => {
                      setQuery('');
                      navigate('/shop');
                      onClose();
                    }}
                    className="mt-4 px-6 py-2.5 bg-vedic-gold text-slate-900 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
                  >
                    Browse All 71 Artefacts
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Default State: Trending & Popular Categories */
            <div className="space-y-8 pt-4">
              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-vedic-gold mb-3">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trending Devotional Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setQuery(item);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-vedic-gold hover:text-slate-900 border border-white/10 text-slate-200 text-xs font-medium transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Shop by Sacred Category
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {popularCategories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        onClose();
                        navigate(`/shop?category=${cat.slug}`);
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-vedic-gold/50 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-vedic-lightgold flex items-center justify-between group transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-vedic-gold" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
