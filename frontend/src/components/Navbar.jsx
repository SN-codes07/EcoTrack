import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Leaf,
  LayoutDashboard,
  Car,
  Activity,
  Sliders,
  MapPin,
  Award,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  Menu,
  X,
  Flame,
  FileText,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'Transport', icon: Car },
  { to: '/activities', label: 'Activities', icon: Activity },
  { to: '/simulator', label: 'Simulator', icon: Sliders },
  { to: '/eco-map', label: 'Eco Map', icon: MapPin },
  { to: '/vehicles', label: 'Vehicles', icon: Settings },
  { to: '/journal', label: 'Journal & Goals', icon: Award },
  { to: '/report', label: 'Report', icon: FileText },
];

const Navbar = ({ onDemoSeeded }) => {
  const { user, darkMode, toggleDarkMode, seedDemoData, logout } = useAuth();
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [seedToast, setSeedToast] = useState(null);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      setSeedToast('30-Day Demo Data Loaded!');
      if (onDemoSeeded) onDemoSeeded();
      window.dispatchEvent(new CustomEvent('ecotrack:data-updated'));
      setTimeout(() => setSeedToast(null), 3500);
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 no-print bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                EcoTrack
              </span>
              <span className="hidden sm:block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 -mt-1">
                Carbon Intelligence
              </span>
            </div>
          </NavLink>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-slate-100/70 dark:hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Load Demo Data Button */}
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            title="Populate 30 days of realistic presentation data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/35 hover:border-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${seeding ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{seeding ? 'Seeding...' : 'Load Demo Data'}</span>
          </button>

          {/* Streak Pill */}
          {user && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{user.currentStreakDays || 1}d</span>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className="text-emerald-600 dark:text-emerald-400">{user.totalEcoPoints || 0} pts</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User & Logout */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                {user?.fullName || 'Eco User'}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {user?.ecoLevel || 'Eco Beginner'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Toast Notification for Demo Seeding */}
      {seedToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl shadow-emerald-600/30 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{seedToast}</span>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'text-slate-600 dark:text-slate-400'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
