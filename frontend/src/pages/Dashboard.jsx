import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Activity,
  Sliders,
  MapPin,
  FileText,
  RefreshCw,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CarbonScoreGauge from '../components/dashboard/CarbonScoreGauge';
import PollutionProfile from '../components/dashboard/PollutionProfile';
import CarbonBudgetBar from '../components/dashboard/CarbonBudgetBar';
import EmissionCharts from '../components/dashboard/EmissionCharts';
import SmartInsights from '../components/dashboard/SmartInsights';
import EcoChallengeCard from '../components/dashboard/EcoChallengeCard';
import AmbientEnvironment from '../components/dashboard/AmbientEnvironment';

const Dashboard = () => {
  const { user, seedDemoData } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchSummary = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      setError('Unable to load dashboard analytics. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const handleDataUpdated = () => fetchSummary();
    window.addEventListener('ecotrack:data-updated', handleDataUpdated);
    return () => window.removeEventListener('ecotrack:data-updated', handleDataUpdated);
  }, [fetchSummary]);

  const handleLoadDemo = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      await fetchSummary();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar onDemoSeeded={fetchSummary} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Welcome Header & Quick Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Environmental Health Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome back, <strong className="text-slate-800 dark:text-slate-200">{user?.fullName || 'Eco Champion'}</strong> • Real-time personal footprint & air pollutant intelligence
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/trips" className="btn-primary-eco text-xs py-2 px-4">
              <Car className="w-4 h-4" />
              <span>Log Trip / Route</span>
            </Link>
            <Link to="/activities" className="btn-secondary-eco text-xs py-2 px-4">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Log Daily Activity</span>
            </Link>
            <Link to="/simulator" className="btn-secondary-eco text-xs py-2 px-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Habit Simulator</span>
            </Link>
            <Link to="/eco-map" className="btn-secondary-eco text-xs py-2 px-4">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Eco Map</span>
            </Link>
            <Link to="/journal" className="btn-secondary-eco text-xs py-2 px-4">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Report & Goals</span>
            </Link>
            <button
              onClick={fetchSummary}
              title="Refresh Dashboard"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-500 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notifications & Alerts Strip */}
        {summary?.alerts && summary.alerts.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {summary.alerts.slice(0, 2).map((alert, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                  alert.type === 'WARNING' || alert.type === 'SPIKE'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {alert.type === 'WARNING' || alert.type === 'SPIKE' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                )}
                <div>
                  <span className="font-bold">{alert.title}: </span>
                  <span className="text-slate-700 dark:text-slate-300">{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !summary ? (
          <div className="grid lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-5 h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80" />
            <div className="lg:col-span-7 h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80" />
            <div className="lg:col-span-12 h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80" />
            <div className="lg:col-span-12 h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-900/80" />
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center space-y-4">
            <p className="text-sm text-rose-500 font-semibold">{error}</p>
            <div className="flex justify-center gap-3">
              <button onClick={fetchSummary} className="btn-primary-eco text-xs">
                Retry Fetch
              </button>
              <button onClick={handleLoadDemo} disabled={seeding} className="btn-secondary-eco text-xs">
                <Sparkles className="w-4 h-4" />
                <span>{seeding ? 'Seeding Demo...' : 'Load Demo Data'}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Row 1: Personal Carbon Score Gauge (5 cols) + Personal Pollution Profile (7 cols) */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5">
                <CarbonScoreGauge carbonScore={summary?.carbonScore} />
              </div>
              <div className="lg:col-span-7">
                <PollutionProfile
                  todayProfile={summary?.todayProfile}
                  monthlyProfile={summary?.monthlyProfile}
                  treeEquivalent={summary?.treeEquivalent}
                />
              </div>
            </div>

            {/* Row 2: Personal Monthly Carbon Budget Progress Bar */}
            <CarbonBudgetBar budgetStatus={summary?.budgetStatus} />

            {/* Row 3: Interactive Recharts Time-Series AreaChart + Category Donut Breakdown */}
            <EmissionCharts
              dailyTrend={summary?.dailyTrend}
              weeklyTrend={summary?.weeklyTrend}
              monthlyTrend={summary?.monthlyTrend}
              categoryBreakdown={summary?.categoryBreakdown}
            />

            {/* Row 4: Today's Eco Challenge (5 cols) + Ambient City Environment AQI (7 cols) */}
            <div className="grid lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5">
                <EcoChallengeCard
                  dailyChallenge={summary?.dailyChallenge}
                  onChallengeCompleted={fetchSummary}
                />
              </div>
              <div className="lg:col-span-7">
                <AmbientEnvironment ambientEnvironment={summary?.ambientEnvironment} />
              </div>
            </div>

            {/* Row 5: AI-Driven Reduction Recommendations & Smart Insights */}
            <SmartInsights recommendations={summary?.recommendations} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
