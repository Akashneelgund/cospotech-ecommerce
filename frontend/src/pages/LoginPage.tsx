import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      if (demoEmail.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-vedic-border/70 shadow-luxury space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-vedic-navy text-vedic-gold flex items-center justify-center mx-auto border border-vedic-gold/40">
            <span className="font-serif text-xl font-bold">ॐ</span>
          </div>
          <h2 className="font-serif text-2xl font-black text-slate-900">Sign In to Sacred Altar</h2>
          <p className="text-xs text-slate-500">Access your order blessings, tracking, and sacred wishlist</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="devotee@example.com"
                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-3 text-xs"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-3 text-xs"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-vedic-navy hover:bg-vedic-gold text-white font-bold text-xs rounded-xl shadow-luxury transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@vedicveda.com', 'Admin@12345')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-vedic-gold text-[11px] font-semibold text-slate-700 transition-colors"
            >
              👑 Demo Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('customer@vedicveda.com', 'Customer@12345')}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-vedic-gold text-[11px] font-semibold text-slate-700 transition-colors"
            >
              🪔 Demo Devotee
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-vedic-gold font-bold hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
};
