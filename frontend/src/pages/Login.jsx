import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Or click "Explore Demo" below!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Unable to launch demo session.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-surface-dark relative overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Link */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              EcoTrack
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mt-4">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your Personal Carbon Score & Pollution Profile
          </p>
        </div>

        <div className="glass-card p-7 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@ecotrack.io"
                  className="input-eco pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-eco pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary-eco w-full py-3 text-sm">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400">
              Or Presentation Mode
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={demoLoading}
            className="btn-secondary-eco w-full py-2.5 text-xs"
          >
            <Sparkles className={`w-4 h-4 text-emerald-500 ${demoLoading ? 'animate-spin' : ''}`} />
            <span>{demoLoading ? 'Seeding 30-Day Demo Account...' : 'One-Click Demo Login (Pre-Seeded)'}</span>
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Don’t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-500 hover:text-emerald-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
