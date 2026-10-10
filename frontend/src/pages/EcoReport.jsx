import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Printer,
  ArrowLeft,
  CheckCircle2,
  TreePine,
  Wind,
  Gauge,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const EcoReport = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/summary').then((res) => setSummary(res.data)).catch(() => {});
  }, []);

  const handlePrintPdf = () => {
    window.print();
  };

  const monthLabel = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Action Bar (hidden when printing) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link to="/journal" className="btn-secondary-eco text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal & Goals</span>
          </Link>

          <button onClick={handlePrintPdf} className="btn-primary-eco text-xs">
            <Printer className="w-4 h-4" />
            <span>Download My Eco Report (PDF / Print)</span>
          </button>
        </div>

        {/* Printable Report Sheet */}
        <div className="glass-card p-8 sm:p-10 space-y-8 print:shadow-none print:border print:border-slate-300 print:bg-white print:text-slate-900">
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">
                  Official Monthly Environmental Impact Statement
                </span>
                <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white print:text-slate-900">
                  My Environmental Report — {monthLabel}
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <p className="font-bold text-sm text-slate-900 dark:text-white print:text-slate-900">
                {user?.fullName || 'Siddharth Nipane'}
              </p>
              <p className="text-slate-500">
                {user?.city || 'Pune'}, {user?.country || 'India'} • {user?.ecoLevel || 'Green Innovator'}
              </p>
            </div>
          </div>

          {/* Executive KPI Summary */}
          {summary && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Personal Carbon Score</p>
                  <p className="font-display font-extrabold text-2xl text-emerald-500 mt-1">
                    {summary.carbonScore?.score}/100
                  </p>
                  <p className="text-[11px] font-semibold mt-0.5">
                    {summary.carbonScore?.statusLabel}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Monthly CO₂ (*Est.*)</p>
                  <p className="font-display font-extrabold text-2xl text-slate-900 dark:text-white print:text-slate-900 mt-1">
                    {summary.monthlyProfile?.co2Kg} kg
                  </p>
                  <p className="text-[11px] text-teal-500">
                    Budget: {summary.budgetStatus?.usedPercentage}% of {summary.budgetStatus?.monthlyBudgetKg} kg
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Pollutants (PM2.5 / NOx)</p>
                  <p className="font-display font-extrabold text-xl text-slate-900 dark:text-white print:text-slate-900 mt-1">
                    {summary.monthlyProfile?.pm25G}g / {summary.monthlyProfile?.noxG}g
                  </p>
                  <p className="text-[11px] text-slate-400">CO: {summary.monthlyProfile?.coG}g</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500">Tree Offset Required</p>
                  <p className="font-display font-extrabold text-2xl text-emerald-500 mt-1">
                    {summary.treeEquivalent?.treesNeededYearlyToOffset} Trees
                  </p>
                  <p className="text-[11px] text-slate-400">Annualized absorption</p>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div>
                <h2 className="font-display font-bold text-base mb-3">
                  1. Emissions Breakdown by Category (*Estimated Values*)
                </h2>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2">Category</th>
                      <th className="py-2">Primary Contributor</th>
                      <th className="py-2">Monthly CO₂ (kg)</th>
                      <th className="py-2 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                    {(summary.categoryBreakdown || []).map((cat) => (
                      <tr key={cat.category}>
                        <td className="py-2.5 font-bold">{cat.category}</td>
                        <td className="py-2.5 text-slate-500">{cat.topContributor}</td>
                        <td className="py-2.5 font-semibold">{cat.co2Kg} kg CO₂</td>
                        <td className="py-2.5 text-right font-bold text-emerald-500">
                          {cat.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Plan & Recommendations */}
              <div>
                <h2 className="font-display font-bold text-base mb-3">
                  2. Personalized Carbon Reduction Roadmap
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {(summary.recommendations || []).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
                    >
                      <p className="font-bold text-emerald-500">{rec.title}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{rec.description}</p>
                      <p className="text-[11px] font-bold text-teal-500 mt-1.5">
                        {rec.potentialSavingText} (+{rec.ecoPointsReward} Eco Points)
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  Generated by <strong>EcoTrack Centralized Calculation Engine</strong> (IPCC/EEA Factors).
                </span>
                <span>1 Mature Tree Offset Constant = 21.77 kg CO₂/year.</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EcoReport;
