import React, { useEffect, useState } from 'react';
import {
  CloudFog,
  Route,
  Fuel,
  Wind,
  TreePine,
  Info,
  Sprout,
} from 'lucide-react';

// Custom smooth animated counter hook
function useAnimatedNumber(targetValue, decimals = 2, duration = 800) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(targetValue) || 0;
    let frameId;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(+(target * eased).toFixed(decimals));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, decimals, duration]);

  return displayValue;
}

const MetricCard = ({ icon: Icon, label, value, decimals = 2, unit, subtext, accentClass }) => {
  const animated = useAnimatedNumber(value, decimals);
  return (
    <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800/90 hover:border-emerald-500/35 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          *Estimated*
        </span>
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
          {animated}
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{unit}</span>
      </div>
      {subtext && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">{subtext}</p>
      )}
    </div>
  );
};

const PollutionProfile = ({ todayProfile, monthlyProfile, treeEquivalent }) => {
  const [scope, setScope] = useState('TODAY'); // TODAY or MONTH
  const activeProfile = scope === 'TODAY' ? todayProfile : monthlyProfile;

  const co2 = activeProfile?.co2Kg ?? 3.45;
  const dist = activeProfile?.distanceKm ?? 16.4;
  const fuel = activeProfile?.fuelConsumedLiters ?? 0.85;
  const pm25 = activeProfile?.pm25G ?? 0.142;
  const nox = activeProfile?.noxG ?? 0.425;
  const co = activeProfile?.coG ?? 0.88;
  const trees = activeProfile?.treesRequired ?? 1.9;

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      {/* Header & Scope Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-500">
            Personal Pollution Profile
          </span>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            My Environmental & Air Pollutant Footprint
          </h2>
        </div>

        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setScope('TODAY')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              scope === 'TODAY'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Today’s Profile
          </button>
          <button
            type="button"
            onClick={() => setScope('MONTH')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              scope === 'MONTH'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* 6 Animated Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <MetricCard
          icon={CloudFog}
          label="CO₂ Emissions"
          value={co2}
          decimals={2}
          unit="kg CO₂"
          subtext="Direct + lifecycle carbon"
          accentClass="bg-emerald-500/15 text-emerald-500"
        />
        <MetricCard
          icon={Route}
          label="Distance Travelled"
          value={dist}
          decimals={1}
          unit="km"
          subtext="Logged transit & road km"
          accentClass="bg-teal-500/15 text-teal-400"
        />
        <MetricCard
          icon={Fuel}
          label="Fuel Consumed"
          value={fuel}
          decimals={2}
          unit="L / kWh eq."
          subtext="Estimated energy draw"
          accentClass="bg-cyan-500/15 text-cyan-400"
        />
        <MetricCard
          icon={Wind}
          label="PM2.5 Contribution"
          value={pm25}
          decimals={3}
          unit="grams"
          subtext="Fine particulate matter"
          accentClass="bg-amber-500/15 text-amber-400"
        />
        <MetricCard
          icon={Wind}
          label="NOx & CO Load"
          value={+(nox + co).toFixed(3)}
          decimals={3}
          unit="grams"
          subtext={`NOx: ${nox}g • CO: ${co}g`}
          accentClass="bg-orange-500/15 text-orange-400"
        />
        <MetricCard
          icon={TreePine}
          label="Trees to Offset"
          value={trees}
          decimals={1}
          unit="trees / yr"
          subtext={`~${treeEquivalent?.seedlingsGrown10Years ?? 2.4} seedlings (10y)`}
          accentClass="bg-emerald-500/20 text-emerald-400"
        />
      </div>

      {/* Tree Equivalent Visual & Educational Disclaimer */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            <strong>Tree Equivalent:</strong> 1 mature tree absorbs ~21.77 kg CO₂/year.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] italic">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{activeProfile?.disclaimer || 'All values are estimated from IPCC/EEA emission factors.'}</span>
        </div>
      </div>
    </div>
  );
};

export default PollutionProfile;
