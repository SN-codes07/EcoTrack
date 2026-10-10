import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import {
  MapPin,
  Navigation,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const PUNE_LOCATIONS = {
  Shivajinagar: [18.5308, 73.8475],
  'Hinjewadi IT Park': [18.5913, 73.7389],
  'Kothrud Depot': [18.5074, 73.8077],
  'Pune Junction': [18.5284, 73.8739],
  'Baner High Street': [18.5590, 73.7868],
  'Koregaon Park': [18.5362, 73.8940],
  'Magarpatta City': [18.5158, 73.9272],
  'Viman Nagar': [18.5679, 73.9143],
  'Deccan Gymkhana': [18.5167, 73.8415],
  'FC Road Campus': [18.5236, 73.8412],
};

const SEVERITY_COLORS = {
  LOW: '#10b981',    // Green
  MEDIUM: '#f59e0b', // Yellow/Amber
  HIGH: '#ef4444',   // Red
};

const EcoMap = () => {
  const [trips, setTrips] = useState([]);
  const [origin, setOrigin] = useState('Shivajinagar');
  const [destination, setDestination] = useState('Hinjewadi IT Park');
  const [passengers, setPassengers] = useState(1);
  const [routeEstimate, setRouteEstimate] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loggedBanner, setLoggedBanner] = useState('');

  const fetchTrips = useCallback(async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data || []);
    } catch (err) {
      console.error('Error fetching map trips:', err);
    }
  }, []);

  const calculateSmartRoute = useCallback(async (origName, destName, pax) => {
    const origCoords = PUNE_LOCATIONS[origName] || [18.5308, 73.8475];
    const destCoords = PUNE_LOCATIONS[destName] || [18.5913, 73.7389];
    try {
      const res = await api.get('/trips/route-estimate', {
        params: {
          origin: origName,
          destination: destName,
          originLat: origCoords[0],
          originLng: origCoords[1],
          destLat: destCoords[0],
          destLng: destCoords[1],
          passengers: pax,
        },
      });
      setRouteEstimate({
        ...res.data,
        originCoords: origCoords,
        destCoords: destCoords,
      });
    } catch (err) {
      console.error('Route estimate error:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    calculateSmartRoute(origin, destination, passengers);
  }, [fetchTrips, calculateSmartRoute, origin, destination, passengers]);

  const handleLogGreenOption = async (opt) => {
    const origCoords = PUNE_LOCATIONS[origin] || [18.5308, 73.8475];
    const destCoords = PUNE_LOCATIONS[destination] || [18.5913, 73.7389];
    try {
      await api.post('/trips', {
        transportMode: opt.transportMode,
        originName: origin,
        originLat: origCoords[0],
        originLng: origCoords[1],
        destinationName: destination,
        destinationLat: destCoords[0],
        destinationLng: destCoords[1],
        distanceKm: opt.distanceKm,
        passengers,
        tripDate: new Date().toISOString().split('T')[0],
      });
      await fetchTrips();
      setLoggedBanner(`Logged ${opt.label} trip (${origin} → ${destination})!`);
      setTimeout(() => setLoggedBanner(''), 3500);
    } catch (err) {
      console.error('Failed to log route trip:', err);
    }
  };

  const visibleTrips = trips.filter((t) => {
    if (!t.originLat || !t.destinationLat) return false;
    if (severityFilter === 'ALL') return true;
    return t.severityLevel === severityFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-slate-100">
      <Navbar onDemoSeeded={fetchTrips} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Geospatial Emission Intelligence
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Interactive Eco Map & Smart Route Planner
            </h1>
          </div>

          {/* Severity Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Routes' },
              { id: 'LOW', label: '🟢 Low Impact' },
              { id: 'MEDIUM', label: '🟡 Medium Impact' },
              { id: 'HIGH', label: '🔴 High Impact' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setSeverityFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  severityFilter === pill.id
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {loggedBanner && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{loggedBanner}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Leaflet Map */}
          <div className="lg:col-span-7 glass-card p-3 overflow-hidden">
            <div className="h-[460px] w-full rounded-xl overflow-hidden relative z-10">
              <MapContainer
                center={[18.545, 73.845]}
                zoom={12}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Logged User Trips Color-Coded by Severity */}
                {visibleTrips.slice(0, 15).map((trip) => {
                  const color = SEVERITY_COLORS[trip.severityLevel] || SEVERITY_COLORS.LOW;
                  const positions = [
                    [trip.originLat, trip.originLng],
                    [trip.destinationLat, trip.destinationLng],
                  ];
                  return (
                    <React.Fragment key={trip.id}>
                      <Polyline
                        positions={positions}
                        pathOptions={{ color, weight: 5, opacity: 0.8 }}
                      >
                        <Popup>
                          <div className="text-xs space-y-1">
                            <p className="font-bold">
                              {trip.originName} → {trip.destinationName}
                            </p>
                            <p>
                              Mode: <strong>{trip.transportMode}</strong> ({trip.distanceKm} km)
                            </p>
                            <p>
                              CO₂: <strong>{trip.co2Kg} kg</strong> ({trip.severityLevel})
                            </p>
                          </div>
                        </Popup>
                      </Polyline>
                      <CircleMarker
                        center={[trip.originLat, trip.originLng]}
                        radius={5}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
                      />
                      <CircleMarker
                        center={[trip.destinationLat, trip.destinationLng]}
                        radius={6}
                        pathOptions={{ color, fillColor: color, fillOpacity: 1 }}
                      />
                    </React.Fragment>
                  );
                })}

                {/* Active Smart Route Planner Preview Dashed Line */}
                {routeEstimate?.originCoords && routeEstimate?.destCoords && (
                  <Polyline
                    positions={[routeEstimate.originCoords, routeEstimate.destCoords]}
                    pathOptions={{ color: '#06b6d4', weight: 4, dashArray: '8, 8' }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Right 5 Cols: Smart Route & Distance Feature */}
          <div className="lg:col-span-5 glass-card p-6 space-y-4">
            <div className="border-b border-slate-200/70 dark:border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                <Navigation className="w-3.5 h-3.5" />
                <span>Smart Route & Distance Estimator</span>
              </div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white mt-0.5">
                Compare Route Carbon Footprint (A → B)
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  From (Origin)
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="input-eco text-xs"
                >
                  {Object.keys(PUNE_LOCATIONS).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  To (Destination)
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input-eco text-xs"
                >
                  {Object.keys(PUNE_LOCATIONS).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {routeEstimate && (
              <>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-emerald-500">
                      🌟 Highlighted Lowest-Carbon Option
                    </p>
                    <p className="font-display font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                      {routeEstimate.lowestCarbonOption?.label} •{' '}
                      {routeEstimate.lowestCarbonOption?.co2Kg} kg CO₂
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Approx. Distance: <strong>{routeEstimate.distanceKm} km</strong> • Est. Time:{' '}
                      <strong>~{routeEstimate.lowestCarbonOption?.estimatedDurationMinutes} mins</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => handleLogGreenOption(routeEstimate.lowestCarbonOption)}
                    className="btn-primary-eco text-xs py-2 px-3 shrink-0"
                  >
                    Log Green Trip
                  </button>
                </div>

                {/* All Transport Options for Route */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(routeEstimate.transportOptions || []).map((opt) => (
                    <div
                      key={opt.transportMode}
                      className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          ~{opt.estimatedDurationMinutes} mins • ₹{opt.fuelCost}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-500">{opt.co2Kg} kg CO₂</span>
                        <button
                          onClick={() => handleLogGreenOption(opt)}
                          className="text-[11px] font-semibold text-teal-500 hover:underline"
                        >
                          Log
                        </button>
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

export default EcoMap;
