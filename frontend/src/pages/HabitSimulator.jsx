import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Sliders,
  TrendingDown,
  TreePine,
  Sparkles,
  Wallet,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { TRANSPORT_MODES } from '../utils/cn';

const DEFAULT_PARAMS = {
  currentTransportMode: 'CAR_PETROL',
  targetTransportMode: 'METRO',
  weeklyCommuteKm: 150,
  transportSwitchPercentage: 65,
  currentDailyAcHours: 6,
  targetDailyAcHours: 3,
  meatMealsReplacedPerWeek: 3,
  solarEnergyPercentage: 25,
  monthlyGridElectricityKwh: 220,
};

const HabitSimulator = () => {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [result, setResult] = useState(null);

  const runSimulation = useCallback(async (currentParams) => {
    try {
      const res = await api.post('/simulator/calculate', currentParams);
      setResult(res.data);
    } catch (err) {
      console.error('Simulation calculation failed:', err);
    }
  }, []);

  useEffect(() => {
    runSimulation(params);
  }, [params, runSimulation]);

  const updateField = (field, val) => {
    setParams((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Interactive What-If Sandbox (Stateless Engine)
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              “If I Change My Habit” Carbon Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Adjust sliders to test commute switches, AC optimization, solar adoption & plant-forward meals without modifying your saved logs.
            </p>
          </div>
          <button
            onClick={() => setParams(DEFAULT_PARAMS)}
            className="btn-secondary-eco text-xs shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* Top Summary KPI Cards */}
        {result && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 border-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Monthly CO₂ Saved</span>
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-500">
                -{result.monthlyCo2SavedKg} kg
              </p>
              <p className="text-xs text-slate-500 mt-1">
                <strong>{result.reductionPercentage}% reduction</strong> ({result.beforeMonthlyCo2Kg} →{' '}
                {result.afterMonthlyCo2Kg} kg)
              </p>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Annualized Impact</span>
                <Sparkles className="w-4 h-4 text-teal-400" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-teal-400">
                {result.yearlyCo2SavedKg} kg/yr
              </p>
              <p className="text-xs text-slate-500 mt-1">Cumulative 12-month carbon avoided</p>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Tree Offset Equivalent</span>
                <TreePine className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {result.equivalentTreesSavedPerYear} Trees
              </p>
              <p className="text-xs text-slate-500 mt-1">Mature trees absorbing CO₂ for 1 year</p>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Projected Carbon Score</span>
                <Gauge className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="font-display font-extrabold text-2xl sm:text-3xl text-cyan-400">
                {result.projectedNewCarbonScore} / 100
              </p>
              <p className="text-xs text-emerald-500 font-semibold mt-1">
                Est. Savings: ~₹{result.monthlyCostSavedInr}/month
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left 6 Cols: Interactive Sliders */}
          <div className="lg:col-span-6 glass-card p-6 space-y-5 text-xs">
            <h2 className="font-display font-bold text-base flex items-center gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <span>Configure Habit Changes</span>
            </h2>

            {/* 1. Transport Mode Switch */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
              <p className="font-bold text-sm text-emerald-500">1. Commute & Transport Shift</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Current Primary Mode</label>
                  <select
                    value={params.currentTransportMode}
                    onChange={(e) => updateField('currentTransportMode', e.target.value)}
                    className="input-eco text-xs"
                  >
                    {TRANSPORT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Switch To Green Mode</label>
                  <select
                    value={params.targetTransportMode}
                    onChange={(e) => updateField('targetTransportMode', e.target.value)}
                    className="input-eco text-xs"
                  >
                    {TRANSPORT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Weekly Commute Distance</span>
                  <span className="text-emerald-500">{params.weeklyCommuteKm} km / week</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={params.weeklyCommuteKm}
                  onChange={(e) => updateField('weeklyCommuteKm', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>% of Weekly Trips Switched</span>
                  <span className="text-emerald-500">{params.transportSwitchPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={params.transportSwitchPercentage}
                  onChange={(e) => updateField('transportSwitchPercentage', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* 2. Cooling & Clean Electricity */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
              <p className="font-bold text-sm text-cyan-400">2. AC Usage & Clean Energy</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Current AC (hrs/day)</span>
                    <span>{params.currentDailyAcHours}h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value={params.currentDailyAcHours}
                    onChange={(e) => updateField('currentDailyAcHours', Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Target AC (hrs/day)</span>
                    <span className="text-emerald-500">{params.targetDailyAcHours}h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value={params.targetDailyAcHours}
                    onChange={(e) => updateField('targetDailyAcHours', Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Solar / Renewable Grid Share</span>
                  <span className="text-cyan-400">{params.solarEnergyPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={params.solarEnergyPercentage}
                  onChange={(e) => updateField('solarEnergyPercentage', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* 3. Diet Shift */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
              <p className="font-bold text-sm text-amber-400">3. Low-Carbon Diet Transition</p>
              <div className="flex justify-between font-semibold mb-1">
                <span>High-Carbon Meat Meals Replaced / Week</span>
                <span className="text-amber-400">{params.meatMealsReplacedPerWeek} meals/wk</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={params.meatMealsReplacedPerWeek}
                onChange={(e) => updateField('meatMealsReplacedPerWeek', Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          {/* Right 6 Cols: Before vs After Recharts BarChart & Breakdown */}
          <div className="lg:col-span-6 glass-card p-6 space-y-5">
            <h2 className="font-display font-bold text-base border-b border-slate-200/70 dark:border-slate-800 pb-3">
              Before vs. After Monthly CO₂ Comparison
            </h2>

            {result && (
              <>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.breakdown}
                      margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="kg" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: 'rgba(16,185,129,0.3)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#f8fafc',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar
                        dataKey="beforeKg"
                        name="Before Change (kg CO₂)"
                        fill="#f43f5e"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="afterKg"
                        name="After Change (kg CO₂)"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5">
                  {result.breakdown.map((b) => (
                    <div
                      key={b.category}
                      className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{b.category}</p>
                        <p className="text-slate-500 dark:text-slate-400">{b.insight}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-500">-{b.savedKg} kg/mo</span>
                        <p className="text-[10px] text-slate-400">
                          {b.beforeKg} → {b.afterKg} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabitSimulator;
