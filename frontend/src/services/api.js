import axios from 'axios';
import {
  getFallbackState,
  saveFallbackState,
  resetFallbackDemoState,
  buildFallbackDashboardSummary,
} from './demoFallback';
import { TRANSPORT_MODES, ACTIVITY_CATALOG } from '../utils/cn';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

// Request interceptor: Attach JWT Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecotrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized & graceful offline fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        localStorage.removeItem('ecotrack_token');
        localStorage.removeItem('ecotrack_user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // If Spring Boot backend is unreachable (network error), serve from stateful fallback
    if (!error.response && error.config) {
      return handleOfflineFallback(error.config);
    }

    return Promise.reject(error);
  }
);

function handleOfflineFallback(config) {
  const url = (config.url || '').replace(/^https?:\/\/[^/]+\/api/, '');
  const method = (config.method || 'get').toLowerCase();
  const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
  const params = config.params || {};
  const state = getFallbackState();

  const ok = (data) => Promise.resolve({ data, status: 200, config });

  if (url.includes('/auth/demo-login') || url.includes('/auth/login')) {
    const fresh = url.includes('demo-login') ? resetFallbackDemoState() : state;
    if (body.email) fresh.user.email = body.email;
    saveFallbackState(fresh);
    return ok({ token: 'demo-jwt-token-ecotrack-2026', tokenType: 'Bearer', user: fresh.user });
  }

  if (url.includes('/auth/register')) {
    state.user = {
      ...state.user,
      fullName: body.fullName || 'EcoTrack User',
      email: body.email || 'user@ecotrack.io',
      city: body.city || 'Pune',
      monthlyCarbonBudgetKg: Number(body.monthlyCarbonBudgetKg || 240),
    };
    saveFallbackState(state);
    return ok({ token: 'demo-jwt-token-ecotrack-2026', tokenType: 'Bearer', user: state.user });
  }

  if (url.includes('/auth/me')) {
    return ok(state.user);
  }

  if (url.includes('/auth/preferences') && method === 'put') {
    state.user = { ...state.user, ...body };
    saveFallbackState(state);
    return ok(state.user);
  }

  if (url.includes('/demo/seed') && method === 'post') {
    resetFallbackDemoState();
    return ok({
      status: 'SUCCESS',
      message: 'Demo data seeded successfully with 30 days of realistic environmental history!',
    });
  }

  if (url.includes('/dashboard/summary')) {
    return ok(buildFallbackDashboardSummary());
  }

  if (url.includes('/trips/compare')) {
    const dist = Number(params.distanceKm || 15);
    const pax = Math.max(1, Number(params.passengers || 1));
    const sel = params.selectedMode || 'CAR_PETROL';
    const selMeta = TRANSPORT_MODES.find((m) => m.value === sel) || TRANSPORT_MODES[11];
    const baseCo2 = (dist * selMeta.factor) / pax;

    const list = TRANSPORT_MODES.filter((m) => m.value !== 'FLIGHT').map((m) => {
      const isPublic = ['BUS', 'METRO', 'TRAIN'].includes(m.value);
      const co2 = +(isPublic ? dist * m.factor : (dist * m.factor) / pax).toFixed(2);
      const saved = +Math.max(0, baseCo2 - co2).toFixed(2);
      const pct = baseCo2 > 0 ? +(((baseCo2 - co2) / baseCo2) * 100).toFixed(1) : 0;
      const mins = Math.max(4, Math.round((dist / m.speedKmh) * 60));
      const cost = m.factor === 0 ? 0 : +(dist * (isPublic ? 2.2 : 6.2)).toFixed(1);
      return {
        transportMode: m.value,
        label: m.label,
        distanceKm: dist,
        estimatedDurationMinutes: mins,
        co2Kg: co2,
        fuelCost: cost,
        pm25G: +(dist * (m.factor > 0.1 ? 0.022 : 0.004)).toFixed(3),
        noxG: +(dist * (m.factor > 0.1 ? 0.14 : 0.01)).toFixed(3),
        co2SavedVsCurrentKg: saved,
        percentageSaved: pct,
        severityLevel: co2 <= 0.8 ? 'LOW' : co2 <= 2.2 ? 'MEDIUM' : 'HIGH',
        badge: m.value === 'WALKING' || m.value === 'CYCLING' ? '🥇 Lowest Emission' : m.value === 'METRO' ? '🥈 Best Transit' : null,
      };
    });
    list.sort((a, b) => a.co2Kg - b.co2Kg);
    return ok(list);
  }

  if (url.includes('/trips/route-estimate')) {
    const dist = Number(params.distanceKm || 14.2);
    const pax = Math.max(1, Number(params.passengers || 1));
    return handleOfflineFallback({
      url: '/trips/compare',
      method: 'get',
      params: { selectedMode: 'CAR_PETROL', distanceKm: dist, passengers: pax },
    }).then((res) =>
      ok({
        origin: params.origin || 'Shivajinagar',
        destination: params.destination || 'Hinjewadi Phase 1',
        distanceKm: dist,
        passengers: pax,
        lowestCarbonOption: res.data[0],
        transportOptions: res.data,
      })
    );
  }

  if (url.startsWith('/trips')) {
    if (method === 'get') return ok(state.trips);
    if (method === 'post') {
      const modeMeta = TRANSPORT_MODES.find((m) => m.value === body.transportMode) || TRANSPORT_MODES[0];
      const dist = Number(body.distanceKm || 10);
      const pax = Math.max(1, Number(body.passengers || 1));
      const co2Kg = +((dist * modeMeta.factor) / pax).toFixed(2);
      const newTrip = {
        id: Date.now(),
        transportMode: modeMeta.value,
        fuelType: body.fuelType || modeMeta.fuel,
        originName: body.originName || 'Origin',
        originLat: Number(body.originLat || 18.5204),
        originLng: Number(body.originLng || 73.8567),
        destinationName: body.destinationName || 'Destination',
        destinationLat: Number(body.destinationLat || 18.5642),
        destinationLng: Number(body.destinationLng || 73.7769),
        distanceKm: dist,
        durationMinutes: Math.max(5, Math.round((dist / modeMeta.speedKmh) * 60)),
        passengers: pax,
        fuelConsumed: modeMeta.factor === 0 ? 0 : +(dist / 16).toFixed(2),
        fuelCost: modeMeta.factor === 0 ? 0 : +(dist * 5.4).toFixed(2),
        co2Kg,
        pm25G: +(dist * 0.012).toFixed(3),
        noxG: +(dist * 0.085).toFixed(3),
        coG: +(dist * 0.35).toFixed(3),
        severityLevel: co2Kg <= 1.0 ? 'LOW' : co2Kg <= 2.5 ? 'MEDIUM' : 'HIGH',
        tripDate: body.tripDate || new Date().toISOString().split('T')[0],
        notes: body.notes || '',
      };
      state.trips.unshift(newTrip);
      if (co2Kg <= 1.0) {
        state.user.totalEcoPoints += 15;
        state.ecoPoints.unshift({
          id: Date.now() + 1,
          actionCode: `GREEN_${modeMeta.value}`,
          title: `Used ${modeMeta.label} (${newTrip.originName} → ${newTrip.destinationName})`,
          category: 'TRANSPORT',
          points: 15,
          co2SavedKg: +(dist * 0.14).toFixed(2),
          earnedDate: newTrip.tripDate,
        });
      }
      saveFallbackState(state);
      return ok(newTrip);
    }
    if (method === 'delete') {
      const id = Number(url.split('/').pop());
      state.trips = state.trips.filter((t) => t.id !== id);
      saveFallbackState(state);
      return ok({ message: 'Deleted' });
    }
  }

  if (url.startsWith('/activities')) {
    if (method === 'get') return ok(state.activities);
    if (method === 'post') {
      const catList = ACTIVITY_CATALOG[body.category] || [];
      const meta = catList.find((x) => x.value === body.activityType) || { factor: 0.5, unit: 'units', sustainable: false, label: body.activityType };
      const qty = Number(body.quantity || 1);
      const co2Kg = +(qty * meta.factor).toFixed(2);
      const pts = meta.sustainable ? 15 : 0;
      const newAct = {
        id: Date.now(),
        category: body.category,
        activityType: body.activityType,
        description: body.description || `${meta.label} (${qty} ${body.unit || meta.unit})`,
        quantity: qty,
        unit: body.unit || meta.unit,
        emissionFactorUsed: meta.factor,
        co2Kg,
        pm25G: +(co2Kg * 0.04).toFixed(3),
        noxG: +(co2Kg * 0.1).toFixed(3),
        coG: +(co2Kg * 0.08).toFixed(3),
        isSustainableAction: meta.sustainable,
        ecoPointsEarned: pts,
        activityDate: body.activityDate || new Date().toISOString().split('T')[0],
      };
      state.activities.unshift(newAct);
      if (pts > 0) {
        state.user.totalEcoPoints += pts;
        state.ecoPoints.unshift({
          id: Date.now() + 2,
          actionCode: body.activityType,
          title: newAct.description,
          category: body.category,
          points: pts,
          co2SavedKg: +(qty * 0.4).toFixed(2),
          earnedDate: newAct.activityDate,
        });
      }
      saveFallbackState(state);
      return ok(newAct);
    }
    if (method === 'delete') {
      const id = Number(url.split('/').pop());
      state.activities = state.activities.filter((a) => a.id !== id);
      saveFallbackState(state);
      return ok({ message: 'Deleted' });
    }
  }

  if (url.includes('/simulator/calculate')) {
    const weeklyKm = Number(body.weeklyCommuteKm ?? 150);
    const monthlyKm = weeklyKm * 4.33;
    const switchRatio = Number(body.transportSwitchPercentage ?? 60) / 100;
    const curMode = TRANSPORT_MODES.find((m) => m.value === (body.currentTransportMode || 'CAR_PETROL')) || TRANSPORT_MODES[11];
    const tgtMode = TRANSPORT_MODES.find((m) => m.value === (body.targetTransportMode || 'METRO')) || TRANSPORT_MODES[3];

    const transBefore = +(monthlyKm * curMode.factor).toFixed(2);
    const transAfter = +((monthlyKm * (1 - switchRatio) * curMode.factor) + (monthlyKm * switchRatio * tgtMode.factor)).toFixed(2);

    const curAc = Number(body.currentDailyAcHours ?? 6) * 30 * 1.15;
    const tgtAc = Number(body.targetDailyAcHours ?? 3) * 30 * 1.15;
    const gridKwh = Number(body.monthlyGridElectricityKwh ?? 220);
    const solarRatio = Number(body.solarEnergyPercentage ?? 20) / 100;
    const energyBefore = +(curAc + gridKwh * 0.71).toFixed(2);
    const energyAfter = +(tgtAc + gridKwh * (1 - solarRatio) * 0.71 + gridKwh * solarRatio * 0.04).toFixed(2);

    const meatReplaced = Number(body.meatMealsReplacedPerWeek ?? 3) * 4.33;
    const foodBefore = +(16 * 3.3).toFixed(2);
    const foodAfter = +((16 - meatReplaced) * 3.3 + meatReplaced * 0.42).toFixed(2);

    const beforeMonthlyCo2Kg = +(transBefore + energyBefore + foodBefore).toFixed(2);
    const afterMonthlyCo2Kg = +(transAfter + energyAfter + foodAfter).toFixed(2);
    const monthlyCo2SavedKg = +Math.max(0, beforeMonthlyCo2Kg - afterMonthlyCo2Kg).toFixed(2);
    const yearlyCo2SavedKg = +(monthlyCo2SavedKg * 12).toFixed(2);
    const reductionPercentage = beforeMonthlyCo2Kg > 0 ? +((monthlyCo2SavedKg / beforeMonthlyCo2Kg) * 100).toFixed(1) : 0;

    return ok({
      beforeMonthlyCo2Kg,
      afterMonthlyCo2Kg,
      monthlyCo2SavedKg,
      yearlyCo2SavedKg,
      reductionPercentage,
      monthlyCostSavedInr: +(monthlyCo2SavedKg * 24.5).toFixed(0),
      equivalentTreesSavedPerYear: +(yearlyCo2SavedKg / 21.77).toFixed(1),
      projectedNewCarbonScore: Math.min(98, Math.round(78 + reductionPercentage * 0.35)),
      breakdown: [
        { category: 'TRANSPORTATION', beforeKg: transBefore, afterKg: transAfter, savedKg: +(transBefore - transAfter).toFixed(2), insight: `Switching ${Math.round(switchRatio * 100)}% commute from ${curMode.label} to ${tgtMode.label}` },
        { category: 'ELECTRICITY', beforeKg: energyBefore, afterKg: energyAfter, savedKg: +(energyBefore - energyAfter).toFixed(2), insight: `Cutting AC hours & shifting ${Math.round(solarRatio * 100)}% power to Solar` },
        { category: 'FOOD', beforeKg: foodBefore, afterKg: foodAfter, savedKg: +(foodBefore - foodAfter).toFixed(2), insight: `Replacing ${body.meatMealsReplacedPerWeek ?? 3} meat meals/week with plant-based meals` },
      ],
    });
  }

  if (url.startsWith('/vehicles')) {
    if (method === 'get') return ok(state.vehicles);
    if (method === 'post') {
      const nv = { id: Date.now(), ...body, emissionFactorKgPerKm: body.emissionFactorKgPerKm || 0.15 };
      state.vehicles.unshift(nv);
      saveFallbackState(state);
      return ok(nv);
    }
    if (method === 'delete') {
      const id = Number(url.split('/').pop());
      state.vehicles = state.vehicles.filter((v) => v.id !== id);
      saveFallbackState(state);
      return ok({ message: 'Deleted' });
    }
  }

  if (url.startsWith('/goals')) {
    if (method === 'get') return ok(state.goals);
    if (method === 'post') {
      const base = Number(body.baselineCo2Kg || 240);
      const red = Number(body.targetReductionPct || 20);
      const ng = {
        id: Date.now(),
        title: body.title,
        category: body.category || 'OVERALL',
        targetReductionPct: red,
        baselineCo2Kg: base,
        targetMaxCo2Kg: +(base * (1 - red / 100)).toFixed(1),
        currentCo2Kg: 94.5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
        status: 'ON_TRACK',
      };
      state.goals.unshift(ng);
      saveFallbackState(state);
      return ok(ng);
    }
    if (method === 'delete') {
      const id = Number(url.split('/').pop());
      state.goals = state.goals.filter((g) => g.id !== id);
      saveFallbackState(state);
      return ok({ message: 'Deleted' });
    }
  }

  if (url.startsWith('/eco-points')) {
    if (method === 'get') return ok(state.ecoPoints);
    if (method === 'post') {
      const np = {
        id: Date.now(),
        actionCode: body.actionCode || 'CUSTOM_ACTION',
        title: body.title || 'Completed Eco Action',
        category: body.category || 'LIFESTYLE',
        points: Number(body.points || 25),
        co2SavedKg: Number(body.co2SavedKg || 2.5),
        earnedDate: new Date().toISOString().split('T')[0],
      };
      state.ecoPoints.unshift(np);
      state.user.totalEcoPoints += np.points;
      state.user.carbonScore = Math.min(99, state.user.carbonScore + 2);
      if (String(body.actionCode).startsWith('CHALLENGE_')) {
        state.challengeCompletedToday = true;
      }
      saveFallbackState(state);
      return ok(np);
    }
  }

  if (url.startsWith('/achievements')) {
    return ok(state.achievements);
  }

  if (url.startsWith('/leaderboard')) {
    return ok([
      { rank: 1, displayName: 'Aarav Kulkarni', city: 'Pune', carbonScore: 91, totalEcoPoints: 920, ecoLevel: 'Climate Guardian', streakDays: 19, isCurrentUser: false },
      { rank: 2, displayName: 'Meera Nair', city: 'Bengaluru', carbonScore: 87, totalEcoPoints: 740, ecoLevel: 'Climate Guardian', streakDays: 14, isCurrentUser: false },
      { rank: 3, displayName: 'Eco Warrior #142', city: 'Mumbai', carbonScore: 83, totalEcoPoints: 580, ecoLevel: 'Green Innovator', streakDays: 11, isCurrentUser: false },
      { rank: 4, displayName: state.user.fullName, city: state.user.city, carbonScore: state.user.carbonScore, totalEcoPoints: state.user.totalEcoPoints, ecoLevel: state.user.ecoLevel, streakDays: state.user.currentStreakDays, isCurrentUser: true },
      { rank: 5, displayName: 'Rohan Deshmukh', city: 'Pune', carbonScore: 76, totalEcoPoints: 410, ecoLevel: 'Green Innovator', streakDays: 7, isCurrentUser: false },
    ]);
  }

  return ok({});
}

export default api;
