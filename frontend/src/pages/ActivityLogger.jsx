import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Utensils,
  Trash2,
  Droplets,
  ShoppingBag,
  Car,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ACTIVITY_CATALOG } from '../utils/cn';

const CATEGORY_TABS = [
  { id: 'ELECTRICITY', label: '⚡ Electricity', icon: Zap, color: 'text-cyan-400' },
  { id: 'FOOD', label: '🍱 Food & Diet', icon: Utensils, color: 'text-amber-400' },
  { id: 'WASTE', label: '🗑 Waste & Recycling', icon: Trash2, color: 'text-violet-400' },
  { id: 'WATER', label: '💧 Water Usage', icon: Droplets, color: 'text-sky-400' },
  { id: 'LIFESTYLE', label: '🛍 Lifestyle', icon: ShoppingBag, color: 'text-pink-400' },
];

const ActivityLogger = () => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ELECTRICITY');
  const [activities, setActivities] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const currentCatalog = ACTIVITY_CATALOG[activeTab] || ACTIVITY_CATALOG.ELECTRICITY;

  const [form, setForm] = useState({
    activityType: currentCatalog[0].value,
    quantity: 3.0,
    description: '',
    activityDate: new Date().toISOString().split('T')[0],
  });

  const handleTabSwitch = (catId) => {
    setActiveTab(catId);
    const list = ACTIVITY_CATALOG[catId] || [];
    if (list.length > 0) {
      setForm((prev) => ({
        ...prev,
        activityType: list[0].value,
        quantity: catId === 'WATER' ? 120 : 2.0,
        description: '',
      }));
    }
  };

  const fetchActivities = useCallback(async () => {
    try {
      const res = await api.get('/activities');
      setActivities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const selectedMeta =
    currentCatalog.find((c) => c.value === form.activityType) || currentCatalog[0];
  const estimatedCo2 = +((Number(form.quantity) || 0) * selectedMeta.factor).toFixed(2);
  const estimatedPoints = selectedMeta.sustainable
    ? Math.max(10, Math.round((Number(form.quantity) || 1) * 4))
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/activities', {
        category: activeTab,
        activityType: form.activityType,
        quantity: Number(form.quantity),
        unit: selectedMeta.unit,
        description:
          form.description.trim() ||
          `${selectedMeta.label} (${form.quantity} ${selectedMeta.unit})`,
        activityDate: form.activityDate,
      });
      await fetchActivities();
      await refreshUser();
      setToast(
        selectedMeta.sustainable
          ? `Logged sustainable habit & awarded +${estimatedPoints} Eco Points!`
          : 'Activity logged & unified emissions ledger updated!'
      );
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      console.error('Error logging activity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const displayedActivities =
    filterCategory === 'ALL'
      ? activities
      : activities.filter((a) => a.category === filterCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar onDemoSeeded={fetchActivities} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              6-Pillar Environmental Tracker
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Daily Activity & Sustainable Habit Logger
            </h1>
          </div>
          <Link to="/trips" className="btn-secondary-eco text-xs">
            <Car className="w-4 h-4 text-emerald-500" />
            <span>🚗 Go to Smart Transport Tracker</span>
          </Link>
        </div>

        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSwitch(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'glass-card hover:border-emerald-500/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols: Activity Form */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base">
                Log {activeTab} Activity
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-500">
                  Est. {estimatedCo2} kg CO₂
                </span>
                {estimatedPoints > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    +{estimatedPoints} Eco Pts
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Activity Type
                </label>
                <select
                  value={form.activityType}
                  onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                  className="input-eco text-xs"
                >
                  {currentCatalog.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} ({item.factor} kg CO₂/{item.unit})
                      {item.sustainable ? ' 🌱 +Eco Points' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Quantity ({selectedMeta.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.activityDate}
                    onChange={(e) => setForm({ ...form, activityDate: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Notes / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`e.g., ${selectedMeta.label}`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-eco text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-slate-500">Formula: Quantity × Factor</span>
                <span className="font-mono font-semibold text-emerald-500">
                  {form.quantity} × {selectedMeta.factor} = {estimatedCo2} kg CO₂
                </span>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary-eco w-full py-3 text-xs">
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Saving Activity...' : 'Log Activity'}</span>
              </button>
            </form>
          </div>

          {/* Right 7 Cols: Logged Activities List */}
          <div className="lg:col-span-7 glass-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base">
                Recent Activity Logs ({displayedActivities.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'ELECTRICITY', 'FOOD', 'WASTE', 'WATER', 'LIFESTYLE'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      filterCategory === cat
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2">CO₂ (*Est.*)</th>
                    <th className="py-2 px-2">Eco Pts</th>
                    <th className="py-2 pl-2 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70">
                  {displayedActivities.slice(0, 25).map((act) => (
                    <tr key={act.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40">
                      <td className="py-2.5 pr-2 text-slate-500">{act.activityDate}</td>
                      <td className="py-2.5 px-2 font-bold text-[10px] text-teal-400">
                        {act.category}
                      </td>
                      <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-white">
                        {act.description}
                      </td>
                      <td className="py-2.5 px-2 text-slate-500">
                        {act.quantity} {act.unit}
                      </td>
                      <td className="py-2.5 px-2 font-bold text-emerald-500">
                        {act.co2Kg} kg
                      </td>
                      <td className="py-2.5 px-2">
                        {act.ecoPointsEarned > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                            +{act.ecoPointsEarned} pts
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <button
                          onClick={() => handleDelete(act.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogger;
