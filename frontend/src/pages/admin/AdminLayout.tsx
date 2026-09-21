import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
  UploadCloud,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Flame,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Security check: Only Admin, Super Admin, Staff
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-red-200 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <X className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            You must possess Admin or Staff privileges to access the VedicVeda Control Center.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2.5 bg-vedic-navy text-white text-xs font-bold rounded-xl"
          >
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard & Analytics', path: '/admin', icon: LayoutDashboard },
    { label: 'Product Inventory (71)', path: '/admin/products', icon: Package },
    { label: 'Stock & Audit Logs', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders & Tracking', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Devotee Customers', path: '/admin/customers', icon: Users },
    { label: 'Banners & Marquee', path: '/admin/banners', icon: ImageIcon },
    { label: 'Flash Sales Drops', path: '/admin/flash-sales', icon: Flame },
    { label: 'Abandoned Carts', path: '/admin/abandoned-carts', icon: Clock },
    { label: 'Bulk Excel Import', path: '/admin/import', icon: UploadCloud }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-vedic-navy text-white flex flex-col justify-between p-4 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/images/cospotech-logo-darkmode.png"
                alt="Cospotech"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User badge */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-vedic-gold text-slate-900 font-bold flex items-center justify-center text-xs">
              {user.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-vedic-lightgold font-semibold uppercase">{user.role}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-vedic-gold text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900 truncate">
              VedicVeda Admin Control Center
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Live SQLite/PostgreSQL Engine
            </span>
            <Link
              to="/"
              className="px-3.5 py-1.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              Storefront ↗
            </Link>
          </div>
        </header>

        {/* Page View Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
