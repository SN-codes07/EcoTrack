import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Layers } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-emerald-500/30 text-slate-100 shadow-xl text-xs space-y-1">
      <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}:
          </span>
          <span className="font-semibold text-white">{entry.value} kg CO₂</span>
        </div>
      ))}
    </div>
  );
};

const EmissionCharts = ({ dailyTrend = [], weeklyTrend = [], monthlyTrend = [], categoryBreakdown = [] }) => {
  const [timeframe, setTimeframe] = useState('DAILY'); // DAILY, WEEKLY, MONTHLY
  const [selectedCategory, setSelectedCategory] = useState(null);

  const chartData =
    timeframe === 'DAILY'
      ? dailyTrend
      : timeframe === 'WEEKLY'
      ? weeklyTrend
      : monthlyTrend;

  const activeCategory =
    selectedCategory || (categoryBreakdown.length > 0 ? categoryBreakdown[0] : null);

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Left 7 Cols: Time-Series AreaChart */}
      <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Carbon Emission History & Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track daily, weekly & monthly CO₂ trajectory by source
              </p>
            </div>
          </div>

          {/* Timeframe Toggle */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {[
              { id: 'DAILY', label: 'Daily (14d)' },
              { id: 'WEEKLY', label: 'Weekly' },
              { id: 'MONTHLY', label: 'Monthly' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeframe(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tab.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorElectricity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                unit="kg"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area
                type="monotone"
                dataKey="totalCo2Kg"
                name="Total CO₂"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="transportCo2Kg"
                name="Transport"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTransport)"
              />
              <Area
                type="monotone"
                dataKey="electricityCo2Kg"
                name="Electricity"
                stroke="#f59e0b"
                strokeWidth={1.8}
                fillOpacity={1}
                fill="url(#colorElectricity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right 5 Cols: Category Donut Chart & Drill-Down */}
      <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Pollution Source Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any slice or category to drill down
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-12 gap-4 items-center my-auto">
          <div className="sm:col-span-6 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="co2Kg"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={3}
                  onClick={(entry) => setSelectedCategory(entry)}
                  className="cursor-pointer focus:outline-none"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || '#10b981'}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} kg CO₂`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(16,185,129,0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Category List */}
          <div className="sm:col-span-6 space-y-2">
            {categoryBreakdown.map((item) => {
              const isSelected = activeCategory?.category === item.category;
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => setSelectedCategory(item)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white'
                      : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.category}
                  </span>
                  <span className="font-bold">
                    {item.percentage}%{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({item.co2Kg}kg)
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill-Down Detail Footer */}
        {activeCategory && (
          <div className="mt-4 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeCategory.category} Drill-Down:
                </span>{' '}
                <span className="text-slate-500 dark:text-slate-400">
                  {activeCategory.topContributor}
                </span>
              </div>
            </div>
            <span className="font-bold text-emerald-500 shrink-0">
              {activeCategory.co2Kg} kg ({activeCategory.percentage}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmissionCharts;
