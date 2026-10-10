import React, { useEffect, useState } from 'react';
import { Sparkles, Info, TrendingUp } from 'lucide-react';

const STATUS_STYLES = {
  ECO_CHAMPION: {
    stroke: '#10b981',
    badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
    glow: 'shadow-glow-emerald',
  },
  IMPROVING: {
    stroke: '#eab308',
    badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    glow: '',
  },
  HIGH_IMPACT: {
    stroke: '#f97316',
    badgeBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/30',
    glow: '',
  },
  CRITICAL_IMPACT: {
    stroke: '#ef4444',
    badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30',
    glow: '',
  },
};

const CarbonScoreGauge = ({ carbonScore }) => {
  const score = carbonScore?.score ?? 82;
  const status = carbonScore?.status || 'ECO_CHAMPION';
  const statusLabel = carbonScore?.statusLabel || '🟢 Eco Champion';
  const summaryText =
    carbonScore?.summaryText ||
    'Calculated from your rolling 30-day transport, energy, diet, waste, and sustainable habits.';
  const subScores = carbonScore?.subScores || {
    'Transport Efficiency': 84,
    'Clean Energy': 81,
    'Low-Carbon Diet': 88,
    'Waste & Water': 86,
    'Sustainable Habits': 79,
  };

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 900;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedScore / 100) * circumference;
  const styleMeta = STATUS_STYLES[status] || STATUS_STYLES.ECO_CHAMPION;

  return (
    <div className={`glass-card p-6 flex flex-col justify-between h-full ${styleMeta.glow}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personal Carbon Score</span>
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-0.5">
            🌱 Environmental Health Index
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styleMeta.badgeBg}`}>
          {statusLabel}
        </span>
      </div>

      {/* Circular SVG Progress Gauge */}
      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70"
              cy="70"
              r={radius}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={styleMeta.stroke}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.25s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
              {animatedScore}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">out of 100</span>
          </div>
        </div>

        {/* Sub-score Breakdown */}
        <div className="w-full space-y-2.5">
          {Object.entries(subScores).map(([label, val]) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{val}/100</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(10, val))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Explanation */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{summaryText}</p>
      </div>
    </div>
  );
};

export default CarbonScoreGauge;
