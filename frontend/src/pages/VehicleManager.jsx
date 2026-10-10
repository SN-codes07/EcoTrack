import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Trash2, Fuel, Gauge, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nickname: '',
    make: '',
    model: '',
    vehicleType: 'CAR_PETROL',
    fuelType: 'PETROL',
    fuelEfficiency: 16.5,
    fuelCostPerUnit: 104.5,
    emissionFactorKgPerKm: 0.175,
    isPrimary: false,
  });

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vehicles', {
        ...form,
        fuelEfficiency: Number(form.fuelEfficiency),
        fuelCostPerUnit: Number(form.fuelCostPerUnit),
        emissionFactorKgPerKm: Number(form.emissionFactorKgPerKm),
      });
      setForm({
        nickname: '',
        make: '',
        model: '',
        vehicleType: 'CAR_PETROL',
        fuelType: 'PETROL',
        fuelEfficiency: 16.5,
        fuelCostPerUnit: 104.5,
        emissionFactorKgPerKm: 0.175,
        isPrimary: false,
      });
      await fetchVehicles();
    } catch (err) {
      console.error('Create vehicle failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error('Delete vehicle failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar onDemoSeeded={fetchVehicles} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Fleet & Fuel Efficiency Profile
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Personal Vehicle Manager
            </h1>
          </div>
          <Link to="/trips" className="btn-secondary-eco text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Transport Tracker</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Add Vehicle Form */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <h2 className="font-display font-bold text-base border-b border-slate-200/70 dark:border-slate-800 pb-3">
              Add Personal Vehicle
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Vehicle Nickname</label>
                <input
                  type="text"
                  placeholder="e.g., Daily City Hatchback"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  className="input-eco text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Make</label>
                  <input
                    type="text"
                    placeholder="Hyundai / Tata / Ather"
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    placeholder="i20 / Nexon EV"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={form.vehicleType}
                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    className="input-eco text-xs"
                  >
                    <option value="CAR_PETROL">Petrol Car</option>
                    <option value="CAR_DIESEL">Diesel Car</option>
                    <option value="CAR_EV">Electric Car (EV)</option>
                    <option value="CAR_HYBRID">Hybrid Car</option>
                    <option value="TWO_WHEELER">Two-Wheeler (Petrol)</option>
                    <option value="E_BIKE">Electric Scooter / E-Bike</option>
                    <option value="BICYCLE">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fuel Type</label>
                  <select
                    value={form.fuelType}
                    onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                    className="input-eco text-xs"
                  >
                    <option value="PETROL">Petrol</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="CNG">CNG</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="NONE">Zero Fuel (Pedal)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Mileage (km/u)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fuelEfficiency}
                    onChange={(e) => setForm({ ...form, fuelEfficiency: e.target.value })}
                    className="input-eco text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fuel Cost (₹/u)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.fuelCostPerUnit}
                    onChange={(e) => setForm({ ...form, fuelCostPerUnit: e.target.value })}
                    className="input-eco text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">kg CO₂ / km</label>
                  <input
                    type="number"
                    step="0.005"
                    value={form.emissionFactorKgPerKm}
                    onChange={(e) => setForm({ ...form, emissionFactorKgPerKm: e.target.value })}
                    className="input-eco text-xs"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                <span>Set as Primary Commute Vehicle</span>
              </label>

              <button type="submit" disabled={submitting} className="btn-primary-eco w-full py-3 text-xs">
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : 'Save Vehicle to Garage'}</span>
              </button>
            </form>
          </div>

          {/* Saved Vehicles Garage */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {vehicles.map((v) => {
              const costPerKm =
                v.fuelEfficiency > 0 ? (v.fuelCostPerUnit / v.fuelEfficiency).toFixed(2) : '0.00';
              return (
                <div key={v.id} className="glass-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                        <Car className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {v.isPrimary && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Primary
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {v.nickname}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {v.make} {v.model} • {v.fuelType}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">Efficiency</p>
                      <p className="font-bold">{v.fuelEfficiency} km/u</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Cost / km</p>
                      <p className="font-bold text-teal-400">₹{costPerKm}/km</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Emissions</p>
                      <p className="font-bold text-emerald-500">{v.emissionFactorKgPerKm} kg/km</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleManager;
