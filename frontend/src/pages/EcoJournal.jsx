import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Flame,
  Trophy,
  Target,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldCheck,
  FileText,
  EyeOff,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const QUICK_HABITS = [
  { code: 'PUBLIC_TRANSPORT', title: '🚆 Used Public Transport Instead of Car', category: 'TRANSPORT', points: 15, co2SavedKg: 2.8 },
  { code: 'CYCLING_COMMUTE', title: '🚲 Cycled / Walked for Short Errand', category: 'TRANSPORT', points: 20, co2SavedKg: 1.9 },
  { code: 'SOLAR_USAGE', title: '☀️ Used Solar / Natural Daylight Workday', category: 'ELECTRICITY', points: 15, co2SavedKg: 2.1 },
  { code: 'COMPOST_WASTE', title: '🌱 Composted Wet Kitchen Waste', category: 'WASTE', points: 15, co2SavedKg: 1.4 },
];

const EcoJournal = () => {
  const { user, refreshUser, updatePreferences } = useAuth();
  const [ecoPoints, setEcoPoints] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toast, setToast] = useState('');

  const [goalForm, setGoalForm] = useState({
    title: 'Reduce Transport Carbon by 25%',
    category: 'TRANSPORTATION',
    targetReductionPct: 25,
    baselineCo2Kg: 120,
  });

  const fetchAllGamification = useCallback(async () => {
    try {
      const [ptsRes, achRes, goalsRes, lbRes] = await Promise.all([
        api.get('/eco-points'),
        api.get('/achievements'),
        api.get('/goals'),
        api.get('/leaderboard'),
      ]);
      setEcoPoints(ptsRes.data || []);
      setAchievements(achRes.data || []);
      setGoals(goalsRes.data || []);
      setLeaderboard(lbRes.data || []);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllGamification();
  }, [fetchAllGamification]);

  const handleQuickHabit = async (habit) => {
    try {
      await api.post('/eco-points', {
        actionCode: habit.code,
        title: habit.title,
        category: habit.category,
        points: habit.points,
        co2SavedKg: habit.co2SavedKg,
      });
      await fetchAllGamification();
      await refreshUser();
      setToast(`Awarded +${habit.points} Eco Points for "${habit.title}"!`);
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      console.error('Failed to log habit:', err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        ...goalForm,
        targetReductionPct: Number(goalForm.targetReductionPct),
        baselineCo2Kg: Number(goalForm.baselineCo2Kg),
      });
      await fetchAllGamification();
      setToast('New Eco Goal created!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Goal creation error:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error('Delete goal failed:', err);
    }
  };

  const handleToggleAnonymous = async () => {
    try {
      await updatePreferences({ anonymousLeaderboard: !user?.anonymousLeaderboard });
      await fetchAllGamification();
    } catch (err) {
      console.error('Toggle anonymous failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar onDemoSeeded={fetchAllGamification} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Level Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Gamification, Goals & Community Hub
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Eco Journal, Achievements & Targets
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Level: {user?.ecoLevel || 'Green Innovator'}</span>
              <span>•</span>
              <span>{user?.totalEcoPoints || 0} Eco Pts</span>
            </div>
            <Link to="/report" className="btn-primary-eco text-xs">
              <FileText className="w-4 h-4" />
              <span>Monthly Environmental Report (PDF)</span>
            </Link>
          </div>
        </div>

        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Row 1: Eco Journal Quick Log + Points History (6 cols) & Achievements (6 cols) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Eco Journal */}
          <div className="lg:col-span-6 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>Eco Journal — Log Sustainable Actions</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {QUICK_HABITS.map((h) => (
                <button
                  key={h.code}
                  onClick={() => handleQuickHabit(h)}
                  className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 text-left transition-all flex items-center justify-between gap-2"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {h.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 shrink-0">
                    +{h.points} pts
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 space-y-2 max-h-64 overflow-y-auto">
              {ecoPoints.slice(0, 12).map((ep) => (
                <div
                  key={ep.id}
                  className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{ep.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {ep.earnedDate} • {ep.category} • Saved ~{ep.co2SavedKg} kg CO₂
                    </p>
                  </div>
                  <span className="font-bold text-emerald-500 shrink-0">+{ep.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Badges */}
          <div className="lg:col-span-6 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Environmental Achievements & Milestones</span>
              </h2>
              <span className="text-xs font-bold text-emerald-500">
                {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => {
                const pct = Math.min(
                  100,
                  Math.round(((ach.progressCurrent || 0) / Math.max(1, ach.progressTarget || 1)) * 100)
                );
                return (
                  <div
                    key={ach.id || ach.badgeCode}
                    className={`p-4 rounded-2xl border transition-all ${
                      ach.unlocked
                        ? 'bg-emerald-500/10 border-emerald-500/35'
                        : 'bg-slate-100/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 opacity-85'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                            {ach.title}
                          </h3>
                          {ach.unlocked ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                              Unlocked
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {ach.description}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-400 shrink-0">
                        +{ach.pointsReward} pts
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Custom Eco Goals (6 cols) + Anonymized Community Leaderboard (6 cols) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Custom Eco Goals */}
          <div className="lg:col-span-6 glass-card p-6 space-y-4">
            <h2 className="font-display font-bold text-base flex items-center gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <Target className="w-5 h-5 text-teal-400" />
              <span>Custom Carbon Reduction Goals</span>
            </h2>

            <form onSubmit={handleCreateGoal} className="grid sm:grid-cols-12 gap-2.5 text-xs">
              <input
                type="text"
                placeholder="Goal title (e.g., Cut Electricity CO₂ by 20%)"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className="sm:col-span-6 input-eco text-xs"
                required
              />
              <input
                type="number"
                min="5"
                max="80"
                placeholder="% Reduction"
                value={goalForm.targetReductionPct}
                onChange={(e) => setGoalForm({ ...goalForm, targetReductionPct: e.target.value })}
                className="sm:col-span-3 input-eco text-xs"
                required
              />
              <button type="submit" className="sm:col-span-3 btn-primary-eco text-xs py-2">
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </form>

            <div className="space-y-3 pt-2">
              {goals.map((g) => {
                const usedRatio = Math.min(
                  100,
                  Math.round(((g.currentCo2Kg || 0) / Math.max(1, g.targetMaxCo2Kg || 100)) * 100)
                );
                return (
                  <div
                    key={g.id}
                    className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {g.title}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Target Max: <strong>{g.targetMaxCo2Kg} kg CO₂</strong> (-{g.targetReductionPct}% vs{' '}
                          {g.baselineCo2Kg} kg baseline)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                          {g.status}
                        </span>
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{ width: `${usedRatio}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Current: {g.currentCo2Kg} kg CO₂</span>
                      <span>{usedRatio}% of cap</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Community Leaderboard */}
          <div className="lg:col-span-6 glass-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Eco Community Leaderboard</span>
              </h2>
              <button
                onClick={handleToggleAnonymous}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                <EyeOff className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {user?.anonymousLeaderboard ? 'Anonymous Mode: ON' : 'Anonymize My Name'}
                </span>
              </button>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((row) => (
                <div
                  key={row.rank}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    row.isCurrentUser
                      ? 'bg-emerald-500/15 border-emerald-500/40 font-semibold'
                      : 'bg-slate-100/70 dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-display font-extrabold flex items-center justify-center">
                      #{row.rank}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {row.displayName} {row.isCurrentUser && '(You)'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {row.city} • {row.ecoLevel} • 🔥 {row.streakDays}d streak
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-extrabold text-sm text-emerald-500">
                      {row.totalEcoPoints} pts
                    </p>
                    <p className="text-[10px] text-slate-400">Score: {row.carbonScore}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EcoJournal;
