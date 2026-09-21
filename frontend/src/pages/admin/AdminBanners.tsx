import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Megaphone,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { Banner, Announcement } from '../../types';

export const AdminBanners: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'announcements'>('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // New Banner Form State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: '',
    imageUrl: '',
    ctaText: 'Shop Collection',
    ctaLink: '/shop',
    placement: 'HERO',
    displayOrder: 0
  });

  // New Announcement Form State
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState({
    text: '',
    link: '',
    displayOrder: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannerRes, announceRes] = await Promise.all([
        api.get('/banners'),
        api.get('/banners/announcements')
      ]);
      if (bannerRes.success) setBanners(bannerRes.banners || []);
      if (announceRes.success) setAnnouncements(announceRes.announcements || []);
    } catch (err) {
      console.error('Failed to fetch banners/announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.imageUrl) return;
    try {
      const res = await api.post('/banners', bannerForm);
      if (res.success) {
        setShowBannerModal(false);
        setBannerForm({
          title: '',
          subtitle: '',
          badge: '',
          imageUrl: '',
          ctaText: 'Shop Collection',
          ctaLink: '/shop',
          placement: 'HERO',
          displayOrder: 0
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create banner.');
    }
  };

  const handleToggleBanner = async (banner: Banner) => {
    try {
      await api.put(`/banners/${banner.id}`, { isActive: !banner.isActive });
      fetchData();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner permanently?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceForm.text) return;
    try {
      const res = await api.post('/banners/announcements', announceForm);
      if (res.success) {
        setShowAnnounceModal(false);
        setAnnounceForm({ text: '', link: '', displayOrder: 0 });
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create announcement.');
    }
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    try {
      await api.put(`/banners/announcements/${ann.id}`, { isActive: !ann.isActive });
      fetchData();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      await api.delete(`/banners/announcements/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
            <span>Banners & Announcements CMS</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control the editorial visual aesthetic and top marquee ticker broadcasts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {activeTab === 'banners' ? (
            <button
              onClick={() => setShowBannerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Slide</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === 'banners' ? 'text-vedic-navy' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hero Banners ({banners.length})</span>
          {activeTab === 'banners' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vedic-gold" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === 'announcements' ? 'text-vedic-navy' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Top Marquee Announcements ({announcements.length})</span>
          {activeTab === 'announcements' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vedic-gold" />
          )}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading promotional assets...</div>
      ) : activeTab === 'banners' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group"
            >
              <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-between">
                  {b.badge && (
                    <span className="self-start text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-vedic-gold text-slate-950">
                      {b.badge}
                    </span>
                  )}
                  <div>
                    <h4 className="font-serif text-white font-bold text-base leading-tight">
                      {b.title}
                    </h4>
                    {b.subtitle && (
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{b.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[10px] font-mono">Order: {b.displayOrder}</span>
                  <span className="text-[10px] font-mono">Placement: {b.placement}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleBanner(b)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                      b.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500">No hero banners created yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold bg-slate-50/50">
                <th className="p-4">Announcement Text</th>
                <th className="p-4">Destination Link</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <tr key={ann.id} className="hover:bg-slate-50/60">
                  <td className="p-4 font-medium text-slate-900 max-w-md">{ann.text}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{ann.link || '—'}</td>
                  <td className="p-4 text-slate-600 font-mono">{ann.displayOrder}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAnnouncement(ann)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ann.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ann.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No announcements configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Banner Creation Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-slate-900">Add Hero Slide Banner</h3>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sacred Maha Yantras of Pure Consciousness"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Editorial Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Hand-etched brass geometries energised by Kashi Vedic pandits."
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. AGAMIC PURITY"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={bannerForm.displayOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.ctaText}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={bannerForm.ctaLink}
                    onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-xl"
                >
                  Publish Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Creation Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-slate-900">Add Top Announcement</h3>
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 🌸 Ekadashi Special: Free Certified Tulsi Japa Mala with all orders above ₹2,999"
                  value={announceForm.text}
                  onChange={(e) => setAnnounceForm({ ...announceForm, text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Link (Optional)</label>
                <input
                  type="text"
                  placeholder="/offers or /shop"
                  value={announceForm.link}
                  onChange={(e) => setAnnounceForm({ ...announceForm, link: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Priority Order</label>
                <input
                  type="number"
                  value={announceForm.displayOrder}
                  onChange={(e) => setAnnounceForm({ ...announceForm, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-vedic-gold"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-xl"
                >
                  Save Ticker Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
