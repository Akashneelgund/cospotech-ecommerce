import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle,
  Package,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.success && res.metrics) {
          setData(res.metrics);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-400">Loading admin metrics & charts...</div>;
  }

  if (!data) {
    return <div className="p-8 text-xs text-red-500">Failed to load dashboard data.</div>;
  }

  const COLORS = ['#D4AF37', '#0F172A', '#E65100', '#10B981', '#6366F1', '#EC4899'];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900">
            Sacred Altar Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics, inventory replenishment, and order management
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/import"
            className="px-4 py-2 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            + Import Excel
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Store Sales</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-vedic-gold flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-slate-900">
            ₹{data.totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% this month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-slate-900">{data.totalOrders}</div>
          <div className="text-[10px] text-slate-500">
            {data.pendingOrders} pending fulfillment
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Order</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-slate-900">
            ₹{(data.averageOrderValue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            Premium altar basket
          </div>
        </div>

        {/* Devotee Customers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Devotee Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-slate-900">{data.totalCustomers}</div>
          <div className="text-[10px] text-slate-500">Registered patrons</div>
        </div>

        {/* Abandoned Carts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Abandoned Carts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-slate-900">
            {data.abandonedCartsCount || 0}
          </div>
          <Link to="/admin/abandoned-carts" className="text-[10px] text-vedic-gold font-bold hover:underline block">
            View & Recover →
          </Link>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Stock Alert</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif text-xl sm:text-2xl font-black text-rose-600">
            {data.lowStockCount + data.outOfStockCount}
          </div>
          <div className="text-[10px] text-slate-500">
            {data.outOfStockCount} critical, {data.lowStockCount} low
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Weekly Revenue & Growth Trajectory
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Last 7 Days
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution Donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900">
              Inventory by Category
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Product distribution across sacred archetypes</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryShare}
                  dataKey="productsCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {data.categoryShare.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {data.categoryShare.slice(0, 4).map((c: any, i: number) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 truncate max-w-[140px]">{c.name}</span>
                </div>
                <span className="font-bold text-slate-900">{c.productsCount} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devotee Conversion Funnel Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-vedic-gold" />
              <span>Devotee Acquisition & Sacred Checkout Funnel</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live funnel conversion metrics from discovery to final consecrated order
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
            Overall Conversion: {data.conversionFunnel?.[data.conversionFunnel.length - 1]?.rate || '3.2%'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {(data.conversionFunnel || []).map((step: any, idx: number) => {
            const rawRate = parseFloat(step.rate) || 100;
            const barWidth = Math.max(12, Math.min(100, (step.count / (data.conversionFunnel[0]?.count || 1)) * 100));
            return (
              <div
                key={step.step}
                className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors relative group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-vedic-gold/15 text-vedic-navy">
                      {step.rate}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{step.step}</div>
                  <div className="font-serif text-lg font-black text-slate-900">
                    {Number(step.count).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Micro Bar */}
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-vedic-gold to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tables Row: Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Low Stock Replenishment Warnings</span>
            </h3>
            <Link to="/admin/inventory" className="text-xs text-vedic-navy hover:text-vedic-gold font-bold">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {data.lowStockItems.length === 0 ? (
              <p className="text-slate-400 py-4 text-center">All product stocks are healthy.</p>
            ) : (
              data.lowStockItems.slice(0, 5).map((it: any) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{it.name}</div>
                    <div className="text-[10px] text-slate-400">Code: {it.code} • {it.category}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    it.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {it.stock === 0 ? 'Out of Stock' : `${it.stock} Left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Recent Devotee Orders
            </h3>
            <Link to="/admin/orders" className="text-xs text-vedic-navy hover:text-vedic-gold font-bold">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="pb-2">Order</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-slate-900">#{ord.orderNumber}</td>
                    <td className="py-3 font-medium text-slate-800">{ord.customerName}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        ord.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-slate-900">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
