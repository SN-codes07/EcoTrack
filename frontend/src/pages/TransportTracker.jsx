import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Fuel,
  Wind,
  Gauge,
  CheckCircle2,
  Settings,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { TRANSPORT_MODES } from '../utils/cn';

const PRESET_CORRIDORS = [
  { label: 'Shivajinagar → Hinjewadi IT Park (16.4 km)', originName: 'Shivajinagar', originLat: 18.5308, originLng: 73.8475, destinationName: 'Hinjewadi IT Park', destinationLat: 18.5913, destinationLng: 73.7389, distanceKm: 16.4 },
  { label: 'Kothrud Depot → Pune Junction (9.2 km)', originName: 'Kothrud Depot', originLat: 18.5074, originLng: 73.8077, destinationName: 'Pune Junction', destinationLat: 18.5284, destinationLng: 73.8739, distanceKm: 9.2 },
  { label: 'Baner High Street → Koregaon Park (12.8 km)', originName: 'Baner High Street', originLat: 18.5590, originLng: 73.7868, destinationName: 'Koregaon Park', destinationLat: 18.5362, destinationLng: 73.8940, distanceKm: 12.8 },
  { label: 'Magarpatta City → Viman Nagar (8.5 km)', originName: 'Magarpatta City', originLat: 18.5158, originLng: 73.9272, destinationName: 'Viman Nagar', destinationLat: 18.5679, destinationLng: 73.9143, distanceKm: 8.5 },
  { label: 'Deccan Gymkhana → FC Road Campus (2.8 km)', originName: 'Deccan Gymkhana', originLat: 18.5167, originLng: 73.8415, destinationName: 'FC Road Campus', destinationLat: 18.5236, destinationLng: 73.8412, distanceKm: 2.8 },
];

const SEVERITY_BADGE = {
  LOW: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  HIGH: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
};

const TransportTracker = () => {
  const { refreshUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const [form, setForm] = useState({
    transportMode: 'CAR_PETROL',
    vehicleId: '',
    originName: 'Shivajinagar',
    originLat: 18.5308,
    originLng: 73.8475,
    destinationName: 'Hinjewadi IT Park',
    destinationLat: 18.5913,
    destinationLng: 73.7389,
    distanceKm: 16.4,
    passengers: 1,
    customFuelEfficiency: '',
    tripDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchTripsAndVehicles = useCallback(async () => {
    try {
      const [tripsRes, vehRes] = await Promise.all([
        api.get('/trips'),
        api.get('/vehicles'),
      ]);
      setTrips(tripsRes.data || []);
      setVehicles(vehRes.data || []);
    } catch (err) {
      console.error('Failed to load trips/vehicles:', err);
    }
  }, []);

  const fetchComparison = useCallback(async (mode, dist, pax) => {
    try {
      const res = await api.get('/trips/compare', {
        params: {
          selectedMode: mode || 'CAR_PETROL',
          distanceKm: Number(dist) || 15,
          passengers: Number(pax) || 1,
        },
      });
      setComparisons(res.data || []);
    } catch (err) {
      console.error('Comparison error:', err);
    }
  }, []);

  useEffect(() => {
    fetchTripsAndVehicles();
  }, [fetchTripsAndVehicles]);

  useEffect(() => {
    fetchComparison(form.transportMode, form.distanceKm, form.passengers);
  }, [form.transportMode, form.distanceKm, form.passengers, fetchComparison]);

  const handlePresetChange = (e) => {
    const idx = Number(e.target.value);
    if (isNaN(idx) || !PRESET_CORRIDORS[idx]) return;
    const p = PRESET_CORRIDORS[idx];
    setForm((prev) => ({
      ...prev,
      originName: p.originName,
      originLat: p.originLat,
      originLng: p.originLng,
      destinationName: p.destinationName,
      destinationLat: p.destinationLat,
      destinationLng: p.destinationLng,
      distanceKm: p.distanceKm,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        distanceKm: Number(form.distanceKm),
        passengers: Number(form.passengers) || 1,
        customFuelEfficiency: form.customFuelEfficiency ? Number(form.customFuelEfficiency) : null,
      };
      await api.post('/trips', payload);
      await fetchTripsAndVehicles();
      await refreshUser();
      setToast('Trip logged & unified emissions ledger updated!');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      console.error('Failed to log trip:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id) => {
    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Live preview estimate for current form
  const currentModeMeta =
    TRANSPORT_MODES.find((m) => m.value === form.transportMode) || TRANSPORT_MODES[11];
  const previewCo2 = +(
    (Number(form.distanceKm || 0) * currentModeMeta.factor) /
    Math.max(1, Number(form.passengers || 1))
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar onDemoSeeded={fetchTripsAndVehicles} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Smart Mobility & Emissions Engine
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Transportation Tracker & Mode Comparison
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/vehicles" className="btn-secondary-eco text-xs">
              <Settings className="w-4 h-4 text-emerald-500" />
              <span>Manage My Vehicles ({vehicles.length})</span>
            </Link>
            <Link to="/eco-map" className="btn-primary-eco text-xs">
              <MapPin className="w-4 h-4" />
              <span>Open Leaflet Eco Map</span>
            </Link>
          </div>
        </div>

        {toast && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Grid: Log Trip Form (5 cols) + Interactive Mode Comparison (7 cols) */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Trip Logging Form */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <h2 className="font-display font-bold text-base flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-500" />
                <span>Log Daily Commute / Trip</span>
              </h2>
              <span className="text-xs font-bold text-emerald-500">
                Est. {previewCo2} kg CO₂
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Quick Route Corridor Preset (Optional)
                </label>
                <select onChange={handlePresetChange} className="input-eco text-xs" defaultValue="0">
                  {PRESET_CORRIDORS.map((c, idx) => (
                    <option key={idx} value={idx}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={form.originName}
                    onChange={(e) => setForm({ ...form, originName: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={form.destinationName}
                    onChange={(e) => setForm({ ...form, destinationName: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Transport Mode
                  </label>
                  <select
                    value={form.transportMode}
                    onChange={(e) => setForm({ ...form, transportMode: e.target.value })}
                    className="input-eco text-xs"
                  >
                    {TRANSPORT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} ({m.factor} kg/km)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Personal Vehicle (Optional)
                  </label>
                  <select
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    className="input-eco text-xs"
                  >
                    <option value="">Default Mode Factor</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nickname} ({v.make} {v.model} • {v.fuelEfficiency} km/unit)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={form.distanceKm}
                    onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.passengers}
                    onChange={(e) => setForm({ ...form, passengers: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Trip Date
                  </label>
                  <input
                    type="date"
                    value={form.tripDate}
                    onChange={(e) => setForm({ ...form, tripDate: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Custom Fuel Efficiency Override (km/L or km/kWh — Optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Leave blank to use vehicle or standard mode efficiency"
                  value={form.customFuelEfficiency}
                  onChange={(e) => setForm({ ...form, customFuelEfficiency: e.target.value })}
                  className="input-eco text-xs"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary-eco w-full py-3 text-xs">
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Calculating & Saving...' : 'Calculate & Log Trip'}</span>
              </button>
            </form>
          </div>

          {/* Interactive Comparison Panel ("What if I change my transport?") */}
          <div className="lg:col-span-7 glass-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Interactive Comparison Engine
                </span>
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  “What If I Change My Transport Mode?” ({form.distanceKm} km)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Greenest Option Recommended
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 pr-3">Transport Mode</th>
                    <th className="py-2.5 px-2">Time</th>
                    <th className="py-2.5 px-2">Est. Cost</th>
                    <th className="py-2.5 px-2">CO₂ Impact</th>
                    <th className="py-2.5 px-2">Savings vs Selected</th>
                    <th className="py-2.5 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70">
                  {comparisons.map((opt) => {
                    const isCurrent = opt.transportMode === form.transportMode;
                    return (
                      <tr
                        key={opt.transportMode}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-emerald-500/10 font-semibold'
                            : 'hover:bg-slate-100/60 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-semibold">
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {opt.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 dark:text-slate-400">
                          ~{opt.estimatedDurationMinutes} min
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">
                          ₹{opt.fuelCost}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              SEVERITY_BADGE[opt.severityLevel] || SEVERITY_BADGE.LOW
                            }`}
                          >
                            {opt.co2Kg} kg CO₂
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          {opt.co2SavedVsCurrentKg > 0 ? (
                            <span className="text-emerald-500 font-bold">
                              -{opt.co2SavedVsCurrentKg} kg ({opt.percentageSaved}%)
                            </span>
                          ) : (
                            <span className="text-slate-400">Baseline</span>
                          )}
                        </td>
                        <td className="py-2.5 pl-2 text-right">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, transportMode: opt.transportMode })}
                            className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400"
                          >
                            {isCurrent ? 'Selected' : 'Use Mode'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Logged Trip History Table */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Logged Trip History ({trips.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distance → Fuel → CO₂ → Air Pollutants (PM2.5, NOx, CO)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 pr-3">Date</th>
                  <th className="py-2.5 px-2">Route (Origin → Destination)</th>
                  <th className="py-2.5 px-2">Mode</th>
                  <th className="py-2.5 px-2">Distance</th>
                  <th className="py-2.5 px-2">Fuel / Cost</th>
                  <th className="py-2.5 px-2">CO₂ (*Est.*)</th>
                  <th className="py-2.5 px-2">PM2.5 / NOx / CO</th>
                  <th className="py-2.5 px-2">Severity</th>
                  <th className="py-2.5 pl-2 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/70">
                {trips.slice(0, 20).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40">
                    <td className="py-2.5 pr-3 text-slate-500 dark:text-slate-400">{t.tripDate}</td>
                    <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white">
                      {t.originName} <ArrowRight className="inline w-3 h-3 mx-1 text-emerald-500" />{' '}
                      {t.destinationName}
                    </td>
                    <td className="py-2.5 px-2">{t.transportMode}</td>
                    <td className="py-2.5 px-2 font-medium">{t.distanceKm} km</td>
                    <td className="py-2.5 px-2 text-slate-500">
                      {t.fuelConsumed} u • ₹{t.fuelCost}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-emerald-500">{t.co2Kg} kg</td>
                    <td className="py-2.5 px-2 text-slate-500">
                      {t.pm25G}g / {t.noxG}g / {t.coG}g
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          SEVERITY_BADGE[t.severityLevel] || SEVERITY_BADGE.LOW
                        }`}
                      >
                        {t.severityLevel}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <button
                        onClick={() => handleDeleteTrip(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
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
      </main>
    </div>
  );
};

export default TransportTracker;
