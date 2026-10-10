// Client-side fallback store & calculation mirror when Spring Boot backend is offline
import { TRANSPORT_MODES, ACTIVITY_CATALOG } from '../utils/cn';

const STORAGE_KEY = 'ecotrack_fallback_state_v1';

function createInitialDemoState() {
  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];

  const user = {
    id: 1,
    fullName: 'Siddharth Nipane',
    email: 'demo@ecotrack.io',
    role: 'ROLE_USER',
    city: 'Pune',
    country: 'India',
    monthlyCarbonBudgetKg: 240.0,
    carbonScore: 82,
    carbonStatus: 'ECO_CHAMPION',
    totalEcoPoints: 485,
    ecoLevel: 'Green Innovator',
    currentStreakDays: 12,
    lastActivityDate: formatDate(today),
    darkMode: true,
    anonymousLeaderboard: false,
  };

  const vehicles = [
    {
      id: 101,
      nickname: 'Daily City Hatchback',
      make: 'Hyundai',
      model: 'i20 1.2L',
      vehicleType: 'CAR_PETROL',
      fuelType: 'PETROL',
      fuelEfficiency: 15.8,
      fuelCostPerUnit: 104.5,
      emissionFactorKgPerKm: 0.185,
      isPrimary: true,
    },
    {
      id: 102,
      nickname: 'Green Commuter EV',
      make: 'Ather',
      model: '450X Gen 3',
      vehicleType: 'E_BIKE',
      fuelType: 'ELECTRIC',
      fuelEfficiency: 34.0,
      fuelCostPerUnit: 8.5,
      emissionFactorKgPerKm: 0.015,
      isPrimary: false,
    },
    {
      id: 103,
      nickname: 'Weekend Hybrid Cycle',
      make: 'Firefox',
      model: 'Rapide 21S',
      vehicleType: 'BICYCLE',
      fuelType: 'NONE',
      fuelEfficiency: 0.0,
      fuelCostPerUnit: 0.0,
      emissionFactorKgPerKm: 0.0,
      isPrimary: false,
    },
  ];

  const sampleRoutes = [
    { originName: 'Shivajinagar', originLat: 18.5308, originLng: 73.8475, destinationName: 'Hinjewadi IT Park', destinationLat: 18.5913, destinationLng: 73.7389, distanceKm: 16.4 },
    { originName: 'Kothrud Depot', originLat: 18.5074, originLng: 73.8077, destinationName: 'Pune Junction', destinationLat: 18.5284, destinationLng: 73.8739, distanceKm: 9.2 },
    { originName: 'Baner High Street', originLat: 18.5590, originLng: 73.7868, destinationName: 'Koregaon Park', destinationLat: 18.5362, destinationLng: 73.8940, distanceKm: 12.8 },
    { originName: 'Magarpatta City', originLat: 18.5158, originLng: 73.9272, destinationName: 'Viman Nagar', destinationLat: 18.5679, destinationLng: 73.9143, distanceKm: 8.5 },
    { originName: 'Deccan Gymkhana', originLat: 18.5167, originLng: 73.8415, destinationName: 'FC Road Campus', destinationLat: 18.5236, destinationLng: 73.8412, distanceKm: 2.8 },
  ];

  const trips = [];
  const activities = [];
  const ecoPoints = [];

  for (let d = 13; d >= 0; d--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    const dateStr = formatDate(dt);
    const route = sampleRoutes[d % sampleRoutes.length];

    const modes = ['METRO', 'CAR_PETROL', 'E_BIKE', 'BUS', 'CYCLING', 'CAR_DIESEL'];
    const mode = modes[d % modes.length];
    const modeMeta = TRANSPORT_MODES.find((m) => m.value === mode) || TRANSPORT_MODES[0];
    const co2Kg = +(route.distanceKm * modeMeta.factor).toFixed(2);
    const severity = co2Kg <= 1.0 ? 'LOW' : co2Kg <= 2.4 ? 'MEDIUM' : 'HIGH';

    trips.push({
      id: 200 + d,
      transportMode: mode,
      fuelType: modeMeta.fuel,
      originName: route.originName,
      originLat: route.originLat,
      originLng: route.originLng,
      destinationName: route.destinationName,
      destinationLat: route.destinationLat,
      destinationLng: route.destinationLng,
      distanceKm: route.distanceKm,
      durationMinutes: Math.max(8, Math.round((route.distanceKm / modeMeta.speedKmh) * 60)),
      passengers: 1,
      fuelConsumed: mode === 'WALKING' || mode === 'CYCLING' ? 0 : +(route.distanceKm / 18).toFixed(2),
      fuelCost: mode === 'WALKING' || mode === 'CYCLING' ? 0 : +(route.distanceKm * 4.2).toFixed(2),
      co2Kg,
      pm25G: +(route.distanceKm * (severity === 'HIGH' ? 0.025 : 0.005)).toFixed(3),
      noxG: +(route.distanceKm * (severity === 'HIGH' ? 0.18 : 0.02)).toFixed(3),
      coG: +(route.distanceKm * (severity === 'HIGH' ? 0.75 : 0.04)).toFixed(3),
      severityLevel: severity,
      tripDate: dateStr,
      notes: `Commute via ${modeMeta.label}`,
    });

    activities.push({
      id: 300 + d * 2,
      category: 'ELECTRICITY',
      activityType: d % 2 === 0 ? 'SOLAR_ENERGY_KWH' : 'AC_USAGE_HOURS',
      description: d % 2 === 0 ? 'Rooftop Solar Power Usage (5.2 kWh)' : 'Inverter AC Usage at 24°C (2.5 hrs)',
      quantity: d % 2 === 0 ? 5.2 : 2.5,
      unit: d % 2 === 0 ? 'kWh' : 'hours',
      emissionFactorUsed: d % 2 === 0 ? 0.04 : 1.15,
      co2Kg: d % 2 === 0 ? 0.21 : 2.88,
      pm25G: 0.08,
      noxG: 0.19,
      coG: 0.14,
      isSustainableAction: d % 2 === 0,
      ecoPointsEarned: d % 2 === 0 ? 20 : 0,
      activityDate: dateStr,
    });

    activities.push({
      id: 301 + d * 2,
      category: 'FOOD',
      activityType: d % 3 === 0 ? 'VEGAN_MEAL' : 'VEGETARIAN_MEAL',
      description: d % 3 === 0 ? 'Plant-Based Thali & Bowl (2 meals)' : 'Home-Cooked Vegetarian Meals (2 meals)',
      quantity: 2,
      unit: 'meals',
      emissionFactorUsed: d % 3 === 0 ? 0.42 : 0.65,
      co2Kg: d % 3 === 0 ? 0.84 : 1.3,
      pm25G: 0.04,
      noxG: 0.09,
      coG: 0.06,
      isSustainableAction: true,
      ecoPointsEarned: 15,
      activityDate: dateStr,
    });

    if (d < 8) {
      ecoPoints.push({
        id: 400 + d,
        actionCode: `GREEN_${mode}`,
        title: `Used ${modeMeta.label} (${route.originName} → ${route.destinationName})`,
        category: 'TRANSPORT',
        points: 15,
        co2SavedKg: +(route.distanceKm * 0.15).toFixed(2),
        earnedDate: dateStr,
      });
    }
  }

  const goals = [
    {
      id: 501,
      title: 'Reduce Monthly Carbon Footprint by 20%',
      category: 'OVERALL',
      targetReductionPct: 20.0,
      baselineCo2Kg: 240.0,
      targetMaxCo2Kg: 192.0,
      currentCo2Kg: 118.4,
      startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      status: 'ON_TRACK',
    },
    {
      id: 502,
      title: 'Keep Transport Emissions Under 75 kg CO₂/mo',
      category: 'TRANSPORTATION',
      targetReductionPct: 30.0,
      baselineCo2Kg: 110.0,
      targetMaxCo2Kg: 75.0,
      currentCo2Kg: 46.2,
      startDate: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      status: 'ON_TRACK',
    },
  ];

  const achievements = [
    {
      id: 601,
      badgeCode: 'SEVEN_DAY_STREAK',
      title: '7-Day Eco Streak',
      description: 'Log low-carbon activities for 7 consecutive days.',
      iconName: 'Flame',
      category: 'STREAK',
      pointsReward: 100,
      progressCurrent: 7,
      progressTarget: 7,
      unlocked: true,
    },
    {
      id: 602,
      badgeCode: 'LOW_CARBON_COMMUTER',
      title: 'Low-Carbon Commuter',
      description: 'Complete 10 sustainable transit, cycling, or walking trips.',
      iconName: 'Train',
      category: 'TRANSPORT',
      pointsReward: 150,
      progressCurrent: 10,
      progressTarget: 10,
      unlocked: true,
    },
    {
      id: 603,
      badgeCode: 'ZERO_WASTE_HERO',
      title: 'Zero-Waste Champion',
      description: 'Recycle or compost 15 kg of household waste.',
      iconName: 'Recycle',
      category: 'LIFESTYLE',
      pointsReward: 120,
      progressCurrent: 15,
      progressTarget: 15,
      unlocked: true,
    },
    {
      id: 604,
      badgeCode: 'TREE_SAVER',
      title: 'Forest Guardian',
      description: 'Save 50 kg of CO₂ through green transport and energy habits.',
      iconName: 'TreePine',
      category: 'IMPACT',
      pointsReward: 200,
      progressCurrent: 42.5,
      progressTarget: 50,
      unlocked: false,
    },
    {
      id: 605,
      badgeCode: 'PLANET_PROTECTOR',
      title: 'Planet Protector',
      description: 'Reach a Personal Carbon Score of 85+ and 500 Eco Points.',
      iconName: 'ShieldCheck',
      category: 'MILESTONE',
      pointsReward: 300,
      progressCurrent: 485,
      progressTarget: 500,
      unlocked: false,
    },
  ];

  return { user, vehicles, trips, activities, ecoPoints, goals, achievements, challengeCompletedToday: false };
}

export function getFallbackState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  const initial = createInitialDemoState();
  saveFallbackState(initial);
  return initial;
}

export function saveFallbackState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

export function resetFallbackDemoState() {
  const fresh = createInitialDemoState();
  saveFallbackState(fresh);
  return fresh;
}

export function buildFallbackDashboardSummary() {
  const state = getFallbackState();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayTrips = state.trips.filter((t) => t.tripDate === todayStr);
  const todayActs = state.activities.filter((a) => a.activityDate === todayStr);

  const todayCo2 = +(
    todayTrips.reduce((s, t) => s + t.co2Kg, 0) +
    todayActs.reduce((s, a) => s + a.co2Kg, 0)
  ).toFixed(2);
  const todayDist = +todayTrips.reduce((s, t) => s + t.distanceKm, 0).toFixed(2);
  const todayFuel = +todayTrips.reduce((s, t) => s + (t.fuelConsumed || 0), 0).toFixed(2);
  const todayPm25 = +(
    todayTrips.reduce((s, t) => s + (t.pm25G || 0), 0) +
    todayActs.reduce((s, a) => s + (a.pm25G || 0), 0)
  ).toFixed(3);
  const todayNox = +(
    todayTrips.reduce((s, t) => s + (t.noxG || 0), 0) +
    todayActs.reduce((s, a) => s + (a.noxG || 0), 0)
  ).toFixed(3);
  const todayCo = +(
    todayTrips.reduce((s, t) => s + (t.coG || 0), 0) +
    todayActs.reduce((s, a) => s + (a.coG || 0), 0)
  ).toFixed(3);

  const totalTransCo2 = +state.trips.reduce((s, t) => s + t.co2Kg, 0).toFixed(2);
  const totalElecCo2 = +state.activities.filter((a) => a.category === 'ELECTRICITY').reduce((s, a) => s + a.co2Kg, 0).toFixed(2);
  const totalFoodCo2 = +state.activities.filter((a) => a.category === 'FOOD').reduce((s, a) => s + a.co2Kg, 0).toFixed(2);
  const totalWasteCo2 = +(state.activities.filter((a) => a.category === 'WASTE').reduce((s, a) => s + a.co2Kg, 0) || 4.8).toFixed(2);
  const totalWaterCo2 = +(state.activities.filter((a) => a.category === 'WATER').reduce((s, a) => s + a.co2Kg, 0) || 3.2).toFixed(2);
  const totalLifeCo2 = +(state.activities.filter((a) => a.category === 'LIFESTYLE').reduce((s, a) => s + a.co2Kg, 0) || 6.4).toFixed(2);

  const usedCo2Kg = +(totalTransCo2 + totalElecCo2 + totalFoodCo2 + totalWasteCo2 + totalWaterCo2 + totalLifeCo2).toFixed(2);
  const budget = state.user.monthlyCarbonBudgetKg || 240.0;
  const usedPct = +((usedCo2Kg / budget) * 100).toFixed(1);

  const dailyTrend = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const dStr = dt.toISOString().split('T')[0];
    const label = dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const tCo2 = +state.trips.filter((t) => t.tripDate === dStr).reduce((s, t) => s + t.co2Kg, 0).toFixed(2);
    const eCo2 = +state.activities.filter((a) => a.activityDate === dStr && a.category === 'ELECTRICITY').reduce((s, a) => s + a.co2Kg, 0).toFixed(2);
    const fCo2 = +state.activities.filter((a) => a.activityDate === dStr && a.category === 'FOOD').reduce((s, a) => s + a.co2Kg, 0).toFixed(2);
    const oCo2 = +state.activities.filter((a) => a.activityDate === dStr && !['ELECTRICITY', 'FOOD'].includes(a.category)).reduce((s, a) => s + a.co2Kg, 0).toFixed(2);
    dailyTrend.push({
      label,
      date: dStr,
      totalCo2Kg: +(tCo2 + eCo2 + fCo2 + oCo2).toFixed(2),
      transportCo2Kg: tCo2,
      electricityCo2Kg: eCo2,
      foodCo2Kg: fCo2,
      otherCo2Kg: oCo2,
    });
  }

  const weeklyTrend = [
    { label: 'W1', totalCo2Kg: 42.5, transportCo2Kg: 21.0, electricityCo2Kg: 11.5, foodCo2Kg: 7.0, otherCo2Kg: 3.0 },
    { label: 'W2', totalCo2Kg: 38.2, transportCo2Kg: 18.4, electricityCo2Kg: 10.2, foodCo2Kg: 6.8, otherCo2Kg: 2.8 },
    { label: 'W3', totalCo2Kg: 34.8, transportCo2Kg: 15.6, electricityCo2Kg: 9.8, foodCo2Kg: 6.4, otherCo2Kg: 3.0 },
    { label: 'W4 (Now)', totalCo2Kg: 29.4, transportCo2Kg: 12.2, electricityCo2Kg: 8.6, foodCo2Kg: 6.1, otherCo2Kg: 2.5 },
  ];

  const monthlyTrend = [
    { label: 'May', totalCo2Kg: 218.0, transportCo2Kg: 105.0, electricityCo2Kg: 58.0, foodCo2Kg: 36.0, otherCo2Kg: 19.0 },
    { label: 'Jun', totalCo2Kg: 196.4, transportCo2Kg: 92.0, electricityCo2Kg: 52.4, foodCo2Kg: 34.0, otherCo2Kg: 18.0 },
    { label: 'Jul', totalCo2Kg: 182.0, transportCo2Kg: 84.0, electricityCo2Kg: 48.0, foodCo2Kg: 33.0, otherCo2Kg: 17.0 },
    { label: 'Aug', totalCo2Kg: 168.5, transportCo2Kg: 76.5, electricityCo2Kg: 44.0, foodCo2Kg: 31.5, otherCo2Kg: 16.5 },
    { label: 'Sep', totalCo2Kg: 154.2, transportCo2Kg: 68.2, electricityCo2Kg: 41.0, foodCo2Kg: 29.5, otherCo2Kg: 15.5 },
    { label: 'Oct', totalCo2Kg: usedCo2Kg, transportCo2Kg: totalTransCo2, electricityCo2Kg: totalElecCo2, foodCo2Kg: totalFoodCo2, otherCo2Kg: +(totalWasteCo2 + totalWaterCo2 + totalLifeCo2).toFixed(2) },
  ];

  const categoryBreakdown = [
    { category: 'TRANSPORTATION', co2Kg: totalTransCo2, percentage: +((totalTransCo2 / Math.max(1, usedCo2Kg)) * 100).toFixed(1), color: '#10b981', topContributor: 'Commute & Urban Travel' },
    { category: 'ELECTRICITY', co2Kg: totalElecCo2, percentage: +((totalElecCo2 / Math.max(1, usedCo2Kg)) * 100).toFixed(1), color: '#06b6d4', topContributor: 'AC & Grid Power Usage' },
    { category: 'FOOD', co2Kg: totalFoodCo2, percentage: +((totalFoodCo2 / Math.max(1, usedCo2Kg)) * 100).toFixed(1), color: '#f59e0b', topContributor: 'Diet & Protein Choices' },
    { category: 'LIFESTYLE', co2Kg: totalLifeCo2, percentage: +((totalLifeCo2 / Math.max(1, usedCo2Kg)) * 100).toFixed(1), color: '#ec4899', topContributor: 'Consumer Goods & Apparel' },
    { category: 'WASTE', co2Kg: totalWasteCo2, percentage: +((totalWasteCo2 / Math.max(1, usedCo2Kg)) * 100).toFixed(1), color: '#8b5cf6', topContributor: 'Household Waste & Plastic' },
    { category: 'WATER', co2Kg: totalWaterCo2, percentage: +((totalWaterCo2 / Math.max(1, usedCo2Kg)) * 100).toFixed(1), color: '#3b82f6', topContributor: 'Hot Water & Daily Supply' },
  ].sort((a, b) => b.co2Kg - a.co2Kg);

  return {
    carbonScore: {
      score: state.user.carbonScore,
      status: state.user.carbonStatus,
      statusLabel: state.user.carbonScore >= 80 ? '🟢 Eco Champion' : state.user.carbonScore >= 60 ? '🟡 Improving' : '🟠 High Impact',
      summaryText: `Your rolling daily average is ${(usedCo2Kg / 14).toFixed(2)} kg CO₂/day with ${state.user.totalEcoPoints} Eco Points earned across ${state.ecoPoints.length} green actions.`,
      subScores: {
        'Transport Efficiency': 84,
        'Clean Energy': 81,
        'Low-Carbon Diet': 88,
        'Waste & Water': 86,
        'Sustainable Habits': 79,
      },
    },
    todayProfile: {
      co2Kg: todayCo2 || 3.45,
      distanceKm: todayDist || 16.4,
      fuelConsumedLiters: todayFuel || 0.85,
      pm25G: todayPm25 || 0.142,
      noxG: todayNox || 0.425,
      coG: todayCo || 0.88,
      treesRequired: +(((todayCo2 || 3.45) * 12) / 21.77).toFixed(2),
      disclaimer: 'Estimated values calculated from activity quantities & IPCC/EEA emission factors.',
    },
    monthlyProfile: {
      co2Kg: usedCo2Kg,
      distanceKm: +state.trips.reduce((s, t) => s + t.distanceKm, 0).toFixed(1),
      fuelConsumedLiters: +state.trips.reduce((s, t) => s + (t.fuelConsumed || 0), 0).toFixed(1),
      pm25G: 2.84,
      noxG: 8.65,
      coG: 19.4,
      treesRequired: +((usedCo2Kg * 12) / 21.77).toFixed(1),
      disclaimer: 'Estimated values calculated from activity quantities & IPCC/EEA emission factors.',
    },
    budgetStatus: {
      monthlyBudgetKg: budget,
      usedCo2Kg,
      remainingCo2Kg: +(Math.max(0, budget - usedCo2Kg)).toFixed(2),
      usedPercentage: usedPct,
      projectedEndOfMonthKg: +(usedCo2Kg * 1.45).toFixed(1),
      alertLevel: usedPct >= 90 ? 'CRITICAL' : usedPct >= 75 ? 'WARNING' : 'SAFE',
      alertMessage:
        usedPct >= 75
          ? `Heads up: You have used ${usedPct}% of your ${budget} kg monthly carbon budget.`
          : `You are at ${usedPct}% of your ${budget} kg monthly budget — well on track for your 20% reduction target!`,
    },
    dailyTrend,
    weeklyTrend,
    monthlyTrend,
    categoryBreakdown,
    recommendations: [
      {
        id: 'REC_TRANSIT_SWITCH',
        title: 'Switch 2 Weekly Private Car Trips to Metro Rail',
        description: 'Switching two of your 16.4 km Hinjewadi private car trips to Pune Metro + Feeder cuts commute CO₂ by 85%.',
        category: 'TRANSPORT',
        potentialSavingText: 'Saves ~21.5 kg CO₂/mo',
        potentialMonthlyCo2SavingKg: 21.5,
        ecoPointsReward: 45,
      },
      {
        id: 'REC_AC_THERMOSTAT',
        title: 'Optimize AC Thermostat to 24°C & Cut 1.5 Hrs/Day',
        description: 'Raising air conditioning temperature from 20°C to 24°C and using a sleep timer reduces compressor energy load by 24%.',
        category: 'ENERGY',
        potentialSavingText: 'Saves ~32.0 kg CO₂/mo',
        potentialMonthlyCo2SavingKg: 32.0,
        ecoPointsReward: 35,
      },
      {
        id: 'REC_PLANT_BASED_DAYS',
        title: 'Adopt 3 Plant-Forward Meals Per Week',
        description: 'Swapping three high-carbon meat meals a week for lentil or plant-based meals lowers food lifecycle emissions.',
        category: 'FOOD',
        potentialSavingText: 'Saves ~28.5 kg CO₂/mo',
        potentialMonthlyCo2SavingKg: 28.5,
        ecoPointsReward: 30,
      },
      {
        id: 'REC_ZERO_WASTE',
        title: 'Compost Wet Kitchen Waste & Segregate Recyclables',
        description: 'Diverting organic waste from landfills prevents methane generation and earns daily Eco Points.',
        category: 'EASY',
        potentialSavingText: 'Saves ~11.2 kg CO₂/mo',
        potentialMonthlyCo2SavingKg: 11.2,
        ecoPointsReward: 25,
      },
    ],
    dailyChallenge: {
      code: 'CHALLENGE_CAR_FREE_COMMUTE',
      title: 'Green Commute Day: Take Public Transit, Cycle, or Walk',
      description: 'Avoid single-occupancy fossil-fuel trips today and complete at least one sustainable transit or active commute.',
      category: 'TRANSPORT',
      pointsReward: 30,
      estimatedCo2SavedKg: 3.2,
      completedToday: !!state.challengeCompletedToday,
    },
    ambientEnvironment: {
      city: state.user.city || 'Pune',
      aqi: 72,
      aqiCategory: 'Moderate',
      ambientPm25UgM3: 22.8,
      ambientPm10UgM3: 49.5,
      temperatureCelsius: 28.4,
      humidityPercent: 56,
      weatherCondition: 'Partly Cloudy & Breezy',
      travelAdvisory: 'Great outdoor conditions for walking, cycling, or Metro transit today.',
      distinctionNote: `Ambient city data reflects regional air quality in ${state.user.city || 'Pune'} and is tracked separately from your personal calculated emissions.`,
    },
    treeEquivalent: {
      monthlyCo2Kg: usedCo2Kg,
      treesNeededYearlyToOffset: +((usedCo2Kg * 12) / 21.77).toFixed(1),
      matureTreesEquivalent: Math.max(1, Math.ceil((usedCo2Kg * 12) / 21.77)),
      seedlingsGrown10Years: +((usedCo2Kg * 12) / 60).toFixed(1),
      educationalNote: '1 mature tree absorbs ~21.77 kg of CO₂ per year (EPA/IPCC educational metric).',
    },
    alerts: [
      {
        type: 'SUCCESS',
        title: `${state.user.currentStreakDays}-Day Eco Streak Active`,
        message: `You are at '${state.user.ecoLevel}' level with ${state.user.totalEcoPoints} Eco Points.`,
      },
      {
        type: 'INFO',
        title: 'Monthly Carbon Budget On Track',
        message: `You have ${+(Math.max(0, budget - usedCo2Kg)).toFixed(1)} kg CO₂ remaining in this month's budget.`,
      },
    ],
  };
}
