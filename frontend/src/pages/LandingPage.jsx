import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Sparkles,
  ArrowRight,
  Gauge,
  Car,
  Sliders,
  MapPin,
  Award,
  ShieldCheck,
  TreePine,
  Wind,
  Zap,
  Sun,
  Moon,
  CheckCircle2,
  BarChart3,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Gauge,
    title: 'Personal Carbon Score (0–100)',
    description:
      'Real-time circular health gauge evaluating your Transport, Electricity, Diet, Waste, and Sustainable Habits with actionable sub-score breakdowns.',
    badge: 'Unique Feature',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Car,
    title: 'Smart Transport & Route Planner',
    description:
      'Compare Petrol, Diesel, EV, Metro, Bus, and Cycling emissions side-by-side. Automatically highlights 🥇 Lowest Emission, 🥈 Lowest Cost, and 🥉 Fastest options.',
    badge: 'Multi-Modal Engine',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Wind,
    title: 'Personal Pollution Profile',
    description:
      'Go beyond CO₂: estimate your personal PM2.5, NOx, and CO tailpipe/lifecycle contributions alongside mature tree offset equivalents.',
    badge: 'Air Quality Science',
    color: 'from-cyan-500 to-sky-500',
  },
  {
    icon: Sliders,
    title: '“If I Change My Habit” Simulator',
    description:
      'Interactive sliders to test switching commute modes, reducing AC hours, or adopting solar & plant-based meals — see instant monthly & yearly savings.',
    badge: 'What-If Sandbox',
    color: 'from-emerald-500 to-green-600',
  },
  {
    icon: MapPin,
    title: 'Color-Coded Leaflet Eco Map & City AQI',
    description:
      'Visualize your travel corridors color-coded by emission severity (🟢 Low, 🟡 Medium, 🔴 High) while keeping regional city AQI clearly separated.',
    badge: 'Geospatial Insights',
    color: 'from-sky-500 to-indigo-500',
  },
  {
    icon: Award,
    title: 'Eco Journal, Streaks & PDF Reports',
    description:
      'Earn Eco Points for sustainable actions, complete Daily Eco Challenges, unlock badges from Eco Beginner to Planet Protector, and export monthly reports.',
    badge: 'Gamified Impact',
    color: 'from-amber-500 to-emerald-500',
  },
];

const LandingPage = () => {
  const { isAuthenticated, demoLogin, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleExploreDemo = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/12 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-teal-500/15 dark:bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-slate-200/70 dark:border-emerald-500/15 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                EcoTrack
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 -mt-1">
                Personal Carbon Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#features"
              className="hidden md:inline-block text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 px-3 py-2"
            >
              Features
            </a>
            <a
              href="#privacy"
              className="hidden md:inline-block text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 px-3 py-2"
            >
              Privacy & Science
            </a>
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary-eco text-xs">
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-emerald-500"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary-eco text-xs">
                  <span>Start Tracking</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Environmental Health & Carbon Footprint SaaS</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
              Track Your Impact.{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                Reduce Your Footprint.
              </span>{' '}
              Protect Our Planet.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              EcoTrack transforms your daily transportation, electricity, food, water, and lifestyle activities into real-time{' '}
              <strong className="text-slate-900 dark:text-white font-semibold">CO₂, PM2.5, NOx, and CO</strong> analytics — powered by a centralized Spring Boot emission engine and personalized reduction intelligence.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register" className="btn-primary-eco px-7 py-3.5 text-sm">
                <span>Start Tracking</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleExploreDemo}
                disabled={demoLoading}
                className="btn-secondary-eco px-6 py-3.5 text-sm"
              >
                <Sparkles className={`w-4 h-4 text-emerald-500 ${demoLoading ? 'animate-spin' : ''}`} />
                <span>{demoLoading ? 'Preparing 30-Day Demo...' : 'Explore Demo (Instant Seed)'}</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg">
              <div>
                <p className="font-display font-bold text-2xl text-emerald-600 dark:text-emerald-400">6 Pillars</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Daily Activity Categories</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-teal-600 dark:text-teal-400">4 Pollutants</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">CO₂, PM2.5, NOx & CO</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-cyan-600 dark:text-cyan-400">IPCC / EEA</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configurable Factors</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Glassmorphic Dashboard Preview */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 space-y-5 relative border-emerald-500/25 shadow-glow-emerald">
              <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500">
                    Live Preview • Personal Environmental Health
                  </span>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    🌱 Carbon Score: 82 / 100
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  🟢 Eco Champion
                </span>
              </div>

              {/* Circular Gauge & Sub-scores Preview */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-emerald-500"
                        strokeWidth="10"
                        strokeDasharray="264"
                        strokeDashoffset="47"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display font-extrabold text-2xl text-emerald-500">82</span>
                      <span className="text-[10px] text-slate-400">out of 100</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-7 space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Transport Efficiency</span>
                      <span className="font-semibold text-emerald-500">86%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '86%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Clean Energy & Solar</span>
                      <span className="font-semibold text-teal-400">81%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: '81%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Low-Carbon Diet</span>
                      <span className="font-semibold text-cyan-400">88%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Estimated Pollution Mini Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Today’s CO₂ (Est.)</p>
                  <p className="font-display font-bold text-base text-slate-900 dark:text-white">3.42 kg</p>
                  <p className="text-[10px] text-emerald-500 font-medium">↓ 34% below avg</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">PM2.5 / NOx</p>
                  <p className="font-display font-bold text-base text-slate-900 dark:text-white">0.14g / 0.42g</p>
                  <p className="text-[10px] text-teal-400 font-medium">Low tailpipe load</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Tree Offset</p>
                  <p className="font-display font-bold text-base text-emerald-500">1.9 Trees</p>
                  <p className="text-[10px] text-slate-400">Annualized equiv.</p>
                </div>
              </div>

              {/* Smart Insight Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/30 flex items-start gap-3">
                <TreePine className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Smart Insight: Switch 2 Car Trips → Metro Rail
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    Saves <strong>21.5 kg CO₂/month</strong> and awards <strong>+45 Eco Points</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Walkthrough Section */}
      <section id="features" className="relative z-10 py-16 border-t border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
              Complete Environmental Intelligence Suite
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl mt-2">
              Designed Like a Real-World Climate Tech Platform
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3">
              Every module is wired to our centralized calculation engine (`CO₂ = Quantity × Emission Factor`) with clear separation between your personal footprint and ambient city air quality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-card-hover p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy & Scientific Transparency Section */}
      <section id="privacy" className="relative z-10 py-14 border-t border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-500">
                <Lock className="w-4 h-4" />
                <span>Privacy Policy & Scientific Methodology</span>
              </div>
              <h3 className="font-display font-bold text-2xl">
                Transparent Calculations & Privacy-First Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                All CO₂, PM2.5, NOx, and CO metrics are labeled as <strong>estimated educational values</strong> computed from standardized IPCC/EEA emission factors configured in our Spring Boot backend. Your route coordinates and activity logs are used strictly to generate your personal environmental insights, and community leaderboards support full one-click anonymization.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> BCrypt + Stateless JWT Security
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Anonymized Community Leaderboard Option
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Distinct Personal vs. Ambient AQI Data
                </span>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button onClick={handleExploreDemo} disabled={demoLoading} className="btn-primary-eco w-full py-3 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{demoLoading ? 'Loading Demo...' : 'Launch Live Presentation Demo'}</span>
              </button>
              <Link to="/register" className="btn-secondary-eco w-full py-3 text-sm text-center">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/70 dark:border-slate-800/80 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              EcoTrack — Personal Carbon Footprint Tracker
            </span>
          </div>
          <p>Built with React, Tailwind CSS, Recharts, Leaflet, Java Spring Boot & MySQL.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
