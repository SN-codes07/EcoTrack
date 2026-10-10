import React from 'react';
import { Target, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

const CarbonBudgetBar = ({ budgetStatus }) => {
  const budget = budgetStatus?.monthlyBudgetKg ?? 240;
  const used = budgetStatus?.usedCo2Kg ?? 118.4;
  const remaining = budgetStatus?.remainingCo2Kg ?? 121.6;
  const usedPct = budgetStatus?.usedPercentage ?? 49.3;
  const projected = budgetStatus?.projectedEndOfMonthKg ?? 172.0;
  const alertLevel = budgetStatus?.alertLevel || 'SAFE';
  const alertMessage =
    budgetStatus?.alertMessage ||
    'You are comfortably within your monthly carbon budget. Keep up the sustainable habits!';

  const barColor =
    alertLevel === 'CRITICAL'
      ? 'from-rose-500 via-red-500 to-orange-500'
      : alertLevel === 'WARNING'
      ? 'from-amber-500 via-orange-500 to-yellow-500'
      : 'from-emerald-500 via-teal-400 to-cyan-500';

  const statusPillStyle =
    alertLevel === 'CRITICAL'
      ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
      : alertLevel === 'WARNING'
      ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';

  return (
    <div className="glass-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Personal Monthly Carbon Budget
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target Limit: <strong>{budget} kg CO₂</strong> • Projected Month-End:{' '}
              <strong>{projected} kg CO₂</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
              Used: {usedPct}%
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {used} kg used • {remaining} kg remaining
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusPillStyle}`}>
            {alertLevel === 'CRITICAL'
              ? '🔴 Budget Exceeded'
              : alertLevel === 'WARNING'
              ? '🟡 Approaching Limit'
              : '🟢 Within Budget'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${Math.min(100, Math.max(3, usedPct))}%` }}
        />
      </div>

      {/* Threshold Markers & Message */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          {alertLevel === 'SAFE' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span>{alertMessage}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>0%</span>
          <span>Safe (&lt;75%)</span>
          <span>Warning (75%)</span>
          <span>100% ({budget} kg)</span>
        </div>
      </div>
    </div>
  );
};

export default CarbonBudgetBar;
