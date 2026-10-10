import React, { useState } from 'react';
import { CloudSun, Wind, Droplets, Thermometer, ShieldAlert, MapPin } from 'lucide-react';
import api from '../../services/api';

const CITIES = ['Pune', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad'];

const AmbientEnvironment = ({ ambientEnvironment }) => {
  const [cityData, setCityData] = useState(ambientEnvironment);
  const [selectedCity, setSelectedCity] = useState(ambientEnvironment?.city || 'Pune');

  const data = cityData || ambientEnvironment || {
    city: 'Pune',
    aqi: 74,
    aqiCategory: 'Moderate',
    ambientPm25UgM3: 23.4,
    ambientPm10UgM3: 51.0,
    temperatureCelsius: 28.5,
    humidityPercent: 54,
    weatherCondition: 'Partly Cloudy & Breezy',
    travelAdvisory: 'Great outdoor conditions for walking, cycling, or Metro transit today.',
    distinctionNote:
      'Ambient city data reflects regional air quality and is tracked separately from your personal calculated emissions.',
  };

  const handleCityChange = async (e) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    try {
      const res = await api.get('/dashboard/ambient', { params: { city: newCity } });
      if (res.data && res.data.city) {
        setCityData(res.data);
      }
    } catch {
      // ignore
    }
  };

  const aqiColor =
    data.aqi <= 60
      ? 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30'
      : data.aqi <= 100
      ? 'text-amber-500 bg-amber-500/15 border-amber-500/30'
      : 'text-rose-500 bg-rose-500/15 border-rose-500/30';

  return (
    <div className="glass-card p-6 border-cyan-500/25 flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Real-Time Regional Environment
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Ambient City Air Quality & Weather
              </h3>
            </div>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Regional AQI</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                {data.aqi}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${aqiColor}`}>
                {data.aqiCategory}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Ambient PM2.5 / PM10</p>
            <p className="font-display font-bold text-base text-slate-900 dark:text-white mt-1">
              {data.ambientPm25UgM3} / {data.ambientPm10UgM3}{' '}
              <span className="text-[10px] font-normal text-slate-400">µg/m³</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-400" /> Temperature
            </p>
            <p className="font-display font-bold text-base text-slate-900 dark:text-white mt-1">
              {data.temperatureCelsius}°C • {data.weatherCondition}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" /> Humidity
            </p>
            <p className="font-display font-bold text-base text-slate-900 dark:text-white mt-1">
              {data.humidityPercent}% RH
            </p>
          </div>
        </div>
      </div>

      {/* Explicit Architectural Separation Disclaimer (PRD Requirement 17 & 37) */}
      <div className="mt-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-start gap-2.5 text-xs">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-cyan-700 dark:text-cyan-300">{data.travelAdvisory}</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
            <strong>Architectural Note:</strong> {data.distinctionNote}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmbientEnvironment;
