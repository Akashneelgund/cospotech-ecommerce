import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  PackageCheck,
  User as UserIcon,
  Lock,
  Printer,
  XCircle,
  Truck,
  CheckCircle2,
  AlertCircle,
  Gift,
  Share2,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Coins,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order, RewardHistory, ReferralInfo } from '../types';
import { api } from '../services/api';

export const AccountPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as any) || 'orders';
  const [activeTab, setActiveTab] = useState<'orders' | 'rewards' | 'referral' | 'support' | 'profile' | 'password'>(initialTab);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Rewards & Referrals
  const [rewardsBalance, setRewardsBalance] = useState<number>(350);
  const [rewardsHistory, setRewardsHistory] = useState<RewardHistory[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Support Form
  const [selectedOrderForSupport, setSelectedOrderForSupport] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAccountData = async () => {
      try {
        const [ordersRes, rewardsRes, refRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/marketing/rewards'),
          api.get('/marketing/referral')
        ]);

        if (ordersRes.success) setOrders(ordersRes.orders || []);
        if (rewardsRes.success) {
          setRewardsBalance(rewardsRes.balance ?? 350);
          setRewardsHistory(rewardsRes.history || []);
        }
        if (refRes.success) setReferralInfo(refRes);
      } catch (err) {
        console.error('Failed to load account details:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchAccountData();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateProfile({ name, phone });
      setProfileMsg('🕉️ Devotee profile updated successfully.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      if (res.success) {
        setPasswordMsg('✨ Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setPasswordMsg(err.message || 'Failed to change password');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this sacred order? Consecrated stock will be restored to sanctum.')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation from account portal' });
      if (res.success) {
        alert('Order cancelled and inventory restored.');
        const updated = await api.get('/orders/my-orders');
        if (updated.success) setOrders(updated.orders);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const copyReferralCode = () => {
    const code = referralInfo?.code || 'VEDIC-DEVOTEE';
    const link = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const getOrderStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'CONFIRMED': return 2;
      case 'PROCESSING':
      case 'PACKED': return 3;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-vedic-navy text-vedic-gold flex items-center justify-center font-serif text-2xl font-bold border-2 border-vedic-gold/40 shadow-luxury shrink-0">
            {user.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-900">{user.name}</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-vedic-lightgold/50 text-vedic-navy border border-vedic-gold/40">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email} • Devotee Member</p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-4 text-center">
          <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
            <div className="font-serif text-lg font-black text-slate-900">{orders.length}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Orders</div>
          </div>
          <div className="bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200">
            <div className="font-serif text-lg font-black text-amber-900 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 text-vedic-gold" />
              <span>{rewardsBalance}</span>
            </div>
            <div className="text-[10px] text-amber-800 font-semibold uppercase">Vedic Coins</div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="px-4 py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Tabs */}
        <div className="lg:col-span-3 bg-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl border border-vedic-border/70 shadow-sm flex lg:flex-col overflow-x-auto scrollbar-none gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap shrink-0 text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all ${
              activeTab === 'orders'
                ? 'bg-vedic-navy text-vedic-lightgold shadow-luxury'
                : 'text-slate-700 hover:bg-slate-50 hover:text-vedic-gold'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-vedic-gold shrink-0" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`whitespace-nowrap shrink-0 text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all ${
              activeTab === 'rewards'
                ? 'bg-vedic-navy text-vedic-lightgold shadow-luxury'
                : 'text-slate-700 hover:bg-slate-50 hover:text-vedic-gold'
            }`}
          >
            <Coins className="w-4 h-4 text-vedic-gold shrink-0" />
            <span>Vedic Coins</span>
          </button>

          <button
            onClick={() => setActiveTab('referral')}
            className={`whitespace-nowrap shrink-0 text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all ${
              activeTab === 'referral'
                ? 'bg-vedic-navy text-vedic-lightgold shadow-luxury'
                : 'text-slate-700 hover:bg-slate-50 hover:text-vedic-gold'
            }`}
          >
            <Share2 className="w-4 h-4 text-vedic-gold shrink-0" />
            <span>Refer & Earn</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`whitespace-nowrap shrink-0 text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all ${
              activeTab === 'support'
                ? 'bg-vedic-navy text-vedic-lightgold shadow-luxury'
                : 'text-slate-700 hover:bg-slate-50 hover:text-vedic-gold'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-vedic-gold shrink-0" />
            <span>Devotee Help</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`whitespace-nowrap shrink-0 text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all ${
              activeTab === 'profile'
                ? 'bg-vedic-navy text-vedic-lightgold shadow-luxury'
                : 'text-slate-700 hover:bg-slate-50 hover:text-vedic-gold'
            }`}
          >
            <UserIcon className="w-4 h-4 text-vedic-gold shrink-0" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`whitespace-nowrap shrink-0 text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all ${
              activeTab === 'password'
                ? 'bg-vedic-navy text-vedic-lightgold shadow-luxury'
                : 'text-slate-700 hover:bg-slate-50 hover:text-vedic-gold'
            }`}
          >
            <Lock className="w-4 h-4 text-vedic-gold shrink-0" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: SACRED ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="font-serif font-extrabold text-2xl text-slate-900">
                Order History & Live Consecration Tracking
              </h3>

              {loadingOrders ? (
                <div className="text-xs text-slate-400 py-8 text-center">Loading orders archive...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                  <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-serif font-bold text-slate-800 text-lg">No past sacred orders</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Bring divine harmony and planetary blessings into your sanctuary.
                  </p>
                  <Link to="/shop" className="inline-block px-6 py-3 bg-vedic-navy text-white text-xs font-bold rounded-xl shadow-luxury">
                    Explore Consecrated Catalog
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const currentStep = getOrderStatusStep(order.orderStatus);
                  const isCancelled = order.orderStatus === 'CANCELLED';

                  return (
                    <div key={order.id} className="bg-white p-6 sm:p-7 rounded-3xl border border-vedic-border/70 shadow-sm space-y-5">
                      
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Order</span>
                            <span className="font-mono font-extrabold text-slate-900 text-base">#{order.orderNumber}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Payment: {order.paymentMethod} ({order.paymentStatus})
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            order.orderStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                            'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <span className="text-base font-black text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Animated Order Tracking Timeline */}
                      {!isCancelled && (
                        <div className="py-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Live Consecration & Logistics Progress
                          </div>
                          <div className="grid grid-cols-5 text-center relative">
                            {/* Connecting Line */}
                            <div className="absolute top-3.5 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0">
                              <div
                                className="bg-vedic-gold h-full transition-all duration-500"
                                style={{ width: `${Math.min(100, ((currentStep - 1) / 4) * 100)}%` }}
                              />
                            </div>

                            {[
                              { label: 'Placed', step: 1 },
                              { label: 'Confirmed', step: 2 },
                              { label: 'Consecrated', step: 3 },
                              { label: 'Shipped', step: 4 },
                              { label: 'Delivered', step: 5 }
                            ].map((st) => (
                              <div key={st.label} className="flex flex-col items-center relative z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  currentStep >= st.step
                                    ? 'bg-vedic-navy text-vedic-gold shadow-md'
                                    : 'bg-slate-200 text-slate-400'
                                }`}>
                                  {currentStep > st.step ? <Check className="w-3.5 h-3.5 text-vedic-gold" /> : st.step}
                                </div>
                                <span className={`text-[10px] font-semibold mt-1.5 ${
                                  currentStep >= st.step ? 'text-slate-900 font-bold' : 'text-slate-400'
                                }`}>
                                  {st.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items Breakdown */}
                      <div className="divide-y divide-slate-50 pt-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{item.productName}</span>
                              <span className="text-slate-400 ml-2 font-medium">({item.size}) × {item.quantity}</span>
                            </div>
                            <div className="font-extrabold text-slate-900">₹{item.total.toLocaleString('en-IN')}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tracking: {order.trackingNumber || 'VEDA-TRK-78401'} • Blue Dart</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/invoice/${order.id}`}
                            target="_blank"
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>GST Tax Invoice</span>
                          </Link>

                          {!isCancelled && order.orderStatus !== 'DELIVERED' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: VEDIC COINS & REWARDS */}
          {activeTab === 'rewards' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-vedic-gold">
                    Loyalty & Sanctum Points
                  </div>
                  <h3 className="font-serif font-extrabold text-2xl text-slate-900">
                    Vedic Coins Balance
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-black text-amber-900 flex items-center gap-1.5 justify-end">
                    <Coins className="w-6 h-6 text-vedic-gold" />
                    <span>{rewardsBalance}</span>
                  </div>
                  <div className="text-xs text-slate-400">Worth ₹{rewardsBalance} on checkout</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="font-bold text-xs text-amber-950">Earn on Purchases</div>
                  <p className="text-[11px] text-amber-900">Earn 5% of order value back in sacred Vedic Coins on every completed order.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="font-bold text-xs text-amber-950">Earn on Reviews</div>
                  <p className="text-[11px] text-amber-900">Receive 100 Vedic Coins for every verified consecration testimonial submitted.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="font-bold text-xs text-amber-950">Refer Devotees</div>
                  <p className="text-[11px] text-amber-900">Earn 150 Coins when a referred friend places their first sacred order.</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="font-serif font-bold text-base text-slate-900">Points History</h4>
                {rewardsHistory.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {rewardsHistory.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">{item.notes}</div>
                          <div className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                        </div>
                        <span className="font-bold text-emerald-700">+{item.points} Coins</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Welcome bonus credited. Complete your next order to earn more coins!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REFER & EARN */}
          {activeTab === 'referral' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-sm space-y-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-vedic-gold">
                  Devotee Circle
                </div>
                <h3 className="font-serif font-extrabold text-2xl text-slate-900">
                  Refer a Friend & Earn ₹150 Off
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Share the divine blessings of authentic Agamic consecration. Your friend receives 15% off, and you earn 150 Vedic Coins.
                </p>
              </div>

              {/* Referral Code Box */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Your Unique Referral Link</div>
                  <div className="font-mono font-black text-slate-900 text-base mt-1">
                    {window.location.origin}/?ref={referralInfo?.code || 'VEDIC-DEVOTEE'}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={copyReferralCode}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      copiedReferral ? 'bg-emerald-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedReferral ? 'Copied!' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Namaste! I recommend VedicVeda for authentic consecrated Yantras and Gemstones. Use my link to claim 15% off: ${window.location.origin}/?ref=${referralInfo?.code || 'VEDIC-DEVOTEE'}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp Share</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT / DEVOTEE CONCIERGE */}
          {activeTab === 'support' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-sm space-y-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-vedic-gold">
                  Direct Sanctum Assistance
                </div>
                <h3 className="font-serif font-extrabold text-2xl text-slate-900">
                  Devotee Concierge & Ritual Support
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Have questions about placement direction, deity mantras, or express dispatch?
                </p>
              </div>

              {supportSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Your support ticket has been received. Our team will contact you within 4 hours.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSupportSent(true);
                  }}
                  className="space-y-4 max-w-lg text-xs"
                >
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Related Sacred Order (Optional)</label>
                    <select
                      value={selectedOrderForSupport}
                      onChange={(e) => setSelectedOrderForSupport(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    >
                      <option value="">-- General Question / Consecration Guidance --</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.orderNumber}>Order #{o.orderNumber} (₹{o.totalAmount})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">How can our temple team assist you?</label>
                    <textarea
                      rows={4}
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Please describe your query regarding installation, delivery, or custom rituals..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="py-3 px-6 bg-vedic-navy hover:bg-vedic-gold text-white hover:text-slate-950 font-bold text-xs rounded-xl shadow-luxury transition-all"
                    >
                      Submit Ticket
                    </button>

                    <a
                      href="https://wa.me/919876543210?text=Namaste,%20I%20need%20support%20with%20my%20VedicVeda%20order."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Instant WhatsApp Chat</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-sm space-y-6">
              <h3 className="font-serif font-extrabold text-2xl text-slate-900">Personal Devotee Profile</h3>
              {profileMsg && <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl border border-amber-200">{profileMsg}</div>}
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vedic-gold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl transition-colors shadow-luxury"
                >
                  Save Profile Updates
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vedic-border/70 shadow-sm space-y-6">
              <h3 className="font-serif font-extrabold text-2xl text-slate-900">Security & Password</h3>
              {passwordMsg && <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-xl border border-amber-200">{passwordMsg}</div>}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password (Min 6 Characters)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vedic-gold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl transition-colors shadow-luxury"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
