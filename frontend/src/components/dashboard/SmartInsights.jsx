import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, ArrowUpRight, Sparkles, TrendingDown } from 'lucide-react';

const CATEGORY_BADGES = {
  TRANSPORT: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  ENERGY: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  FOOD: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  EASY: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

const SmartInsights = ({ recommendations = [] }) => {
  const [filter, setFilter] = useState('ALL');

  const filtered =
    filter === 'ALL'
      ? recommendations
      : recommendations.filter((r) => r.category === filter);

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                AI-Driven Reduction Recommendations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized insights generated from your recent trip & activity patterns
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1">
            {['ALL', 'TRANSPORT', 'ENERGY', 'FOOD', 'EASY'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filter === cat
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {filtered.map((rec) => (
            <div
              key={rec.id || rec.title}
              className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      CATEGORY_BADGES[rec.category] || CATEGORY_BADGES.EASY
                    }`}
                  >
                    {rec.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                    <Sparkles className="w-3 h-3" />+{rec.ecoPointsReward} Eco Pts
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {rec.potentialSavingText}
                </span>
                <Link
                  to="/simulator"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 hover:text-emerald-400"
                >
                  <span>Simulate</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;
