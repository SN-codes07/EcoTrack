package com.ecotrack.service;

import com.ecotrack.dto.DashboardSummaryResponse;
import com.ecotrack.dto.DashboardSummaryResponse.*;
import com.ecotrack.entity.*;
import com.ecotrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final EmissionRepository emissionRepository;
    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final EcoPointRepository ecoPointRepository;
    private final EcoGoalRepository ecoGoalRepository;
    private final EmissionCalculationEngineService calculationEngine;

    private static final DateTimeFormatter SHORT_DATE_FMT = DateTimeFormatter.ofPattern("dd MMM");
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM yyyy");

    @Transactional
    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate thirtyDaysAgo = today.minusDays(29);

        List<Emission> todayEmissions = emissionRepository.findByUserIdAndRecordedDate(userId, today);
        List<Emission> monthEmissions = emissionRepository.findByUserIdAndRecordedDateBetweenOrderByRecordedDateAsc(
                userId, startOfMonth, today);
        List<Emission> last30DaysEmissions = emissionRepository.findByUserIdAndRecordedDateBetweenOrderByRecordedDateAsc(
                userId, thirtyDaysAgo, today);

        // If today has no entries yet, fall back to the latest recorded day in last 7 days for "Today's Profile" display
        if (todayEmissions.isEmpty() && !last30DaysEmissions.isEmpty()) {
            LocalDate latestDate = last30DaysEmissions.get(last30DaysEmissions.size() - 1).getRecordedDate();
            if (!latestDate.isBefore(today.minusDays(2))) {
                todayEmissions = last30DaysEmissions.stream()
                        .filter(e -> latestDate.equals(e.getRecordedDate()))
                        .toList();
            }
        }

        PollutionProfile todayProfile = buildPollutionProfile(todayEmissions);
        PollutionProfile monthlyProfile = buildPollutionProfile(monthEmissions);

        // Category breakdown (last 30 days)
        List<CategoryBreakdown> categoryBreakdown = buildCategoryBreakdown(last30DaysEmissions);

        // Compute dynamic Carbon Score
        List<EcoPoint> ecoPoints = ecoPointRepository.findByUserIdOrderByEarnedDateDescCreatedAtDesc(userId);
        CarbonScoreDetail carbonScoreDetail = computeCarbonScoreDetail(user, last30DaysEmissions, ecoPoints);

        // Sync user's carbon score & status
        user.setCarbonScore(carbonScoreDetail.getScore());
        user.setCarbonStatus(carbonScoreDetail.getStatus());
        userRepository.save(user);

        // Carbon Budget Status
        CarbonBudgetStatus budgetStatus = buildCarbonBudgetStatus(user, monthlyProfile.getCo2Kg(), today);
        updateUserGoalsProgress(userId, monthlyProfile.getCo2Kg());

        // Time-series trends
        List<TimeSeriesPoint> dailyTrend = buildDailyTrend(last30DaysEmissions, today, 14);
        List<TimeSeriesPoint> weeklyTrend = buildWeeklyTrend(userId, today);
        List<TimeSeriesPoint> monthlyTrend = buildMonthlyTrend(userId, today);

        // Smart Recommendations
        List<Trip> recentTrips = tripRepository.findByUserIdAndTripDateBetweenOrderByTripDateDesc(userId, thirtyDaysAgo, today);
        List<Activity> recentActivities = activityRepository.findByUserIdAndActivityDateBetweenOrderByActivityDateDesc(userId, thirtyDaysAgo, today);
        List<SmartRecommendation> recommendations = generateSmartRecommendations(recentTrips, recentActivities, categoryBreakdown);

        // Daily Challenge
        DailyChallengeCard dailyChallenge = buildDailyChallenge(userId, today);

        // Ambient Environment Data (distinct from personal emissions)
        AmbientEnvironmentData ambientData = fetchAmbientEnvironmentForCity(user.getCity());

        // Tree Equivalent Metric
        double rolling30Co2 = last30DaysEmissions.stream().mapToDouble(Emission::getCo2Kg).sum();
        TreeEquivalentMetric treeMetric = buildTreeEquivalent(rolling30Co2);

        // Alerts & Notifications
        List<NotificationAlert> alerts = buildAlerts(todayProfile, budgetStatus, user);

        return DashboardSummaryResponse.builder()
                .carbonScore(carbonScoreDetail)
                .todayProfile(todayProfile)
                .monthlyProfile(monthlyProfile)
                .budgetStatus(budgetStatus)
                .dailyTrend(dailyTrend)
                .weeklyTrend(weeklyTrend)
                .monthlyTrend(monthlyTrend)
                .categoryBreakdown(categoryBreakdown)
                .recommendations(recommendations)
                .dailyChallenge(dailyChallenge)
                .ambientEnvironment(ambientData)
                .treeEquivalent(treeMetric)
                .alerts(alerts)
                .build();
    }

    private PollutionProfile buildPollutionProfile(List<Emission> emissions) {
        double co2 = 0.0, dist = 0.0, fuel = 0.0, pm25 = 0.0, nox = 0.0, co = 0.0;
        for (Emission e : emissions) {
            co2 += e.getCo2Kg() != null ? e.getCo2Kg() : 0.0;
            dist += e.getDistanceKm() != null ? e.getDistanceKm() : 0.0;
            fuel += e.getFuelConsumed() != null ? e.getFuelConsumed() : 0.0;
            pm25 += e.getPm25G() != null ? e.getPm25G() : 0.0;
            nox += e.getNoxG() != null ? e.getNoxG() : 0.0;
            co += e.getCoG() != null ? e.getCoG() : 0.0;
        }
        return PollutionProfile.builder()
                .co2Kg(round2(co2))
                .distanceKm(round2(dist))
                .fuelConsumedLiters(round2(fuel))
                .pm25G(round3(pm25))
                .noxG(round3(nox))
                .coG(round3(co))
                .treesRequired(calculationEngine.calculateTreesRequired(co2 * 12.0)) // annualized offset trees
                .disclaimer("Estimated values calculated from activity quantities & IPCC/EEA emission factors.")
                .build();
    }

    private CarbonScoreDetail computeCarbonScoreDetail(User user, List<Emission> last30Days, List<EcoPoint> ecoPoints) {
        double total30Co2 = last30Days.stream().mapToDouble(Emission::getCo2Kg).sum();
        long activeDays = Math.max(1, last30Days.stream().map(Emission::getRecordedDate).distinct().count());
        double avgDailyCo2 = last30Days.isEmpty() ? 4.8 : (total30Co2 / Math.max(7, activeDays));

        int score = calculationEngine.calculateCarbonScore(avgDailyCo2, user.getTotalEcoPoints(), ecoPoints.size());
        String status = calculationEngine.determineCarbonStatus(score);

        String statusLabel = switch (status) {
            case "ECO_CHAMPION" -> "🟢 Eco Champion";
            case "IMPROVING" -> "🟡 Improving";
            case "HIGH_IMPACT" -> "🟠 High Impact";
            default -> "🔴 Critical Impact";
        };

        Map<String, Double> catTotals = last30Days.stream()
                .collect(Collectors.groupingBy(
                        Emission::getCategory,
                        Collectors.summingDouble(Emission::getCo2Kg)
                ));

        int transportSub = clampScore(92 - (int) Math.round(catTotals.getOrDefault("TRANSPORTATION", 25.0) * 0.25));
        int energySub = clampScore(90 - (int) Math.round(catTotals.getOrDefault("ELECTRICITY", 18.0) * 0.30));
        int foodSub = clampScore(92 - (int) Math.round(catTotals.getOrDefault("FOOD", 12.0) * 0.35));
        int wasteSub = clampScore(94 - (int) Math.round(catTotals.getOrDefault("WASTE", 6.0) * 0.45));
        int habitSub = clampScore(65 + Math.min(33, ecoPoints.size() * 4));

        Map<String, Integer> subScores = new LinkedHashMap<>();
        subScores.put("Transport Efficiency", transportSub);
        subScores.put("Clean Energy", energySub);
        subScores.put("Low-Carbon Diet", foodSub);
        subScores.put("Waste & Water", wasteSub);
        subScores.put("Sustainable Habits", habitSub);

        String summary = String.format(
                "Your rolling daily average is %.2f kg CO₂/day with %d Eco Points earned across %d green actions.",
                avgDailyCo2, user.getTotalEcoPoints(), ecoPoints.size());

        return CarbonScoreDetail.builder()
                .score(score)
                .status(status)
                .statusLabel(statusLabel)
                .summaryText(summary)
                .subScores(subScores)
                .build();
    }

    private CarbonBudgetStatus buildCarbonBudgetStatus(User user, double usedMonthCo2, LocalDate today) {
        double budget = user.getMonthlyCarbonBudgetKg() != null && user.getMonthlyCarbonBudgetKg() > 0
                ? user.getMonthlyCarbonBudgetKg()
                : 250.0;
        double usedPct = round2((usedMonthCo2 / budget) * 100.0);
        double remaining = round2(Math.max(0.0, budget - usedMonthCo2));

        int dayOfMonth = Math.max(1, today.getDayOfMonth());
        int daysInMonth = today.lengthOfMonth();
        double projected = round2((usedMonthCo2 / dayOfMonth) * daysInMonth);

        String alertLevel = "SAFE";
        String alertMsg = "You are comfortably within your monthly carbon budget. Keep up the sustainable habits!";
        if (usedPct >= 95.0) {
            alertLevel = "CRITICAL";
            alertMsg = "Critical Alert: You have reached " + usedPct + "% of your monthly CO₂ budget!";
        } else if (usedPct >= 75.0 || projected > budget * 1.05) {
            alertLevel = "WARNING";
            alertMsg = "Heads up: At your current pace (" + projected + " kg projected), you may exceed your " + budget + " kg monthly budget.";
        }

        return CarbonBudgetStatus.builder()
                .monthlyBudgetKg(round2(budget))
                .usedCo2Kg(round2(usedMonthCo2))
                .remainingCo2Kg(remaining)
                .usedPercentage(usedPct)
                .projectedEndOfMonthKg(projected)
                .alertLevel(alertLevel)
                .alertMessage(alertMsg)
                .build();
    }

    private void updateUserGoalsProgress(Long userId, double currentMonthCo2) {
        List<EcoGoal> goals = ecoGoalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (EcoGoal goal : goals) {
            goal.setCurrentCo2Kg(round2(currentMonthCo2));
            if (currentMonthCo2 > goal.getTargetMaxCo2Kg()) {
                goal.setStatus("EXCEEDED");
            } else if (currentMonthCo2 > goal.getTargetMaxCo2Kg() * 0.85) {
                goal.setStatus("AT_RISK");
            } else {
                goal.setStatus("ON_TRACK");
            }
        }
        if (!goals.isEmpty()) {
            ecoGoalRepository.saveAll(goals);
        }
    }

    private List<CategoryBreakdown> buildCategoryBreakdown(List<Emission> emissions) {
        Map<String, Double> totals = new LinkedHashMap<>();
        List<String> categories = List.of("TRANSPORTATION", "ELECTRICITY", "FOOD", "WASTE", "WATER", "LIFESTYLE");
        for (String cat : categories) {
            totals.put(cat, 0.0);
        }
        for (Emission e : emissions) {
            String cat = e.getCategory() != null ? e.getCategory().toUpperCase() : "LIFESTYLE";
            totals.put(cat, totals.getOrDefault(cat, 0.0) + e.getCo2Kg());
        }

        double grandTotal = totals.values().stream().mapToDouble(Double::doubleValue).sum();
        Map<String, String> colors = Map.of(
                "TRANSPORTATION", "#10b981",
                "ELECTRICITY", "#06b6d4",
                "FOOD", "#f59e0b",
                "WASTE", "#8b5cf6",
                "WATER", "#3b82f6",
                "LIFESTYLE", "#ec4899"
        );
        Map<String, String> topContributors = Map.of(
                "TRANSPORTATION", "Commute & Urban Travel",
                "ELECTRICITY", "AC & Grid Power Usage",
                "FOOD", "Diet & Protein Choices",
                "WASTE", "Household Waste & Plastic",
                "WATER", "Hot Water & Daily Supply",
                "LIFESTYLE", "Consumer Goods & Apparel"
        );

        List<CategoryBreakdown> result = new ArrayList<>();
        for (String cat : categories) {
            double val = round2(totals.getOrDefault(cat, 0.0));
            double pct = grandTotal > 0 ? round2((val / grandTotal) * 100.0) : 0.0;
            result.add(CategoryBreakdown.builder()
                    .category(cat)
                    .co2Kg(val)
                    .percentage(pct)
                    .color(colors.getOrDefault(cat, "#10b981"))
                    .topContributor(topContributors.getOrDefault(cat, "General Activity"))
                    .build());
        }
        result.sort(Comparator.comparingDouble(CategoryBreakdown::getCo2Kg).reversed());
        return result;
    }

    private List<TimeSeriesPoint> buildDailyTrend(List<Emission> last30Days, LocalDate today, int daysCount) {
        Map<LocalDate, List<Emission>> byDate = last30Days.stream()
                .collect(Collectors.groupingBy(Emission::getRecordedDate));

        List<TimeSeriesPoint> points = new ArrayList<>();
        LocalDate start = today.minusDays(daysCount - 1);
        for (int i = 0; i < daysCount; i++) {
            LocalDate d = start.plusDays(i);
            List<Emission> dayList = byDate.getOrDefault(d, Collections.emptyList());
            points.add(aggregateTimeSeriesPoint(d.format(SHORT_DATE_FMT), d.toString(), dayList));
        }
        return points;
    }

    private List<TimeSeriesPoint> buildWeeklyTrend(Long userId, LocalDate today) {
        LocalDate start = today.minusWeeks(7).minusDays(6);
        List<Emission> emissions = emissionRepository.findByUserIdAndRecordedDateBetweenOrderByRecordedDateAsc(
                userId, start, today);

        List<TimeSeriesPoint> points = new ArrayList<>();
        for (int w = 7; w >= 0; w--) {
            LocalDate weekEnd = today.minusWeeks(w);
            LocalDate weekStart = weekEnd.minusDays(6);
            List<Emission> weekSlice = emissions.stream()
                    .filter(e -> !e.getRecordedDate().isBefore(weekStart) && !e.getRecordedDate().isAfter(weekEnd))
                    .toList();
            String label = "W" + (8 - w) + " (" + weekStart.format(SHORT_DATE_FMT) + ")";
            points.add(aggregateTimeSeriesPoint(label, weekStart.toString(), weekSlice));
        }
        return points;
    }

    private List<TimeSeriesPoint> buildMonthlyTrend(Long userId, LocalDate today) {
        LocalDate start = today.minusMonths(5).withDayOfMonth(1);
        List<Emission> emissions = emissionRepository.findByUserIdAndRecordedDateBetweenOrderByRecordedDateAsc(
                userId, start, today);

        List<TimeSeriesPoint> points = new ArrayList<>();
        for (int m = 5; m >= 0; m--) {
            LocalDate monthDate = today.minusMonths(m);
            int year = monthDate.getYear();
            int month = monthDate.getMonthValue();
            List<Emission> monthSlice = emissions.stream()
                    .filter(e -> e.getRecordedDate().getYear() == year && e.getRecordedDate().getMonthValue() == month)
                    .toList();
            points.add(aggregateTimeSeriesPoint(monthDate.format(MONTH_FMT), monthDate.withDayOfMonth(1).toString(), monthSlice));
        }
        return points;
    }

    private TimeSeriesPoint aggregateTimeSeriesPoint(String label, String dateStr, List<Emission> list) {
        double total = 0.0, trans = 0.0, elec = 0.0, food = 0.0, other = 0.0;
        for (Emission e : list) {
            double c = e.getCo2Kg();
            total += c;
            String cat = e.getCategory() != null ? e.getCategory().toUpperCase() : "";
            switch (cat) {
                case "TRANSPORTATION" -> trans += c;
                case "ELECTRICITY" -> elec += c;
                case "FOOD" -> food += c;
                default -> other += c;
            }
        }
        return TimeSeriesPoint.builder()
                .label(label)
                .date(dateStr)
                .totalCo2Kg(round2(total))
                .transportCo2Kg(round2(trans))
                .electricityCo2Kg(round2(elec))
                .foodCo2Kg(round2(food))
                .otherCo2Kg(round2(other))
                .build();
    }

    private List<SmartRecommendation> generateSmartRecommendations(
            List<Trip> recentTrips,
            List<Activity> recentActivities,
            List<CategoryBreakdown> breakdown) {

        List<SmartRecommendation> recs = new ArrayList<>();

        List<Trip> carTrips = recentTrips.stream()
                .filter(t -> t.getTransportMode() != null && t.getTransportMode().startsWith("CAR_"))
                .toList();

        if (!carTrips.isEmpty()) {
            double avgCarDist = round2(carTrips.stream().mapToDouble(Trip::getDistanceKm).average().orElse(18.0));
            double monthlySaving = round2(avgCarDist * 8 * (0.192 - 0.028));
            recs.add(SmartRecommendation.builder()
                    .id("REC_TRANSIT_SWITCH")
                    .title("Switch 2 Weekly Private Car Trips to Metro/Train")
                    .description(String.format(
                            "You logged %d private car trips recently (avg %.1f km). Switching just two weekly commutes to Metro Rail cuts transport emissions by 85%%.",
                            carTrips.size(), avgCarDist))
                    .category("TRANSPORT")
                    .potentialSavingText("Saves ~" + monthlySaving + " kg CO₂/mo")
                    .potentialMonthlyCo2SavingKg(monthlySaving)
                    .ecoPointsReward(45)
                    .build());
        } else {
            recs.add(SmartRecommendation.builder()
                    .id("REC_ACTIVE_MOBILITY")
                    .title("Use Cycling or Walking for Short (<4 km) Errands")
                    .description("Replacing short motorized trips under 4 km with cycling or walking eliminates cold-engine tailpipe emissions completely.")
                    .category("TRANSPORT")
                    .potentialSavingText("Saves ~14.5 kg CO₂/mo")
                    .potentialMonthlyCo2SavingKg(14.5)
                    .ecoPointsReward(40)
                    .build());
        }

        recs.add(SmartRecommendation.builder()
                .id("REC_AC_THERMOSTAT")
                .title("Optimize AC Thermostat to 24°C & Cut 1.5 Hrs/Day")
                .description("Raising air conditioning temperature from 20°C to 24°C and using a timer reduces compressor energy load by up to 24%.")
                .category("ENERGY")
                .potentialSavingText("Saves ~32.0 kg CO₂/mo")
                .potentialMonthlyCo2SavingKg(32.0)
                .ecoPointsReward(35)
                .build());

        recs.add(SmartRecommendation.builder()
                .id("REC_PLANT_BASED_DAYS")
                .title("Adopt 3 Plant-Forward Meals Per Week")
                .description("Swapping three high-carbon meat meals a week for plant-based or lentil-rich meals significantly lowers food lifecycle emissions.")
                .category("FOOD")
                .potentialSavingText("Saves ~28.5 kg CO₂/mo")
                .potentialMonthlyCo2SavingKg(28.5)
                .ecoPointsReward(30)
                .build());

        recs.add(SmartRecommendation.builder()
                .id("REC_ZERO_WASTE_SEGREGATION")
                .title("Compost Wet Waste & Segregate Recyclables")
                .description("Diverting organic kitchen waste from landfills prevents methane generation and earns daily Eco Points.")
                .category("EASY")
                .potentialSavingText("Saves ~11.2 kg CO₂/mo")
                .potentialMonthlyCo2SavingKg(11.2)
                .ecoPointsReward(25)
                .build());

        return recs;
    }

    private DailyChallengeCard buildDailyChallenge(Long userId, LocalDate today) {
        int dayIndex = today.getDayOfYear() % 4;
        String code;
        String title;
        String desc;
        String category;
        int reward;
        double savedKg;

        switch (dayIndex) {
            case 0 -> {
                code = "CHALLENGE_CAR_FREE_COMMUTE";
                title = "Green Commute Day: Take Public Transit, Cycle, or Walk";
                desc = "Avoid single-occupancy fossil-fuel trips today and log at least one sustainable transit or active commute.";
                category = "TRANSPORT";
                reward = 30;
                savedKg = 3.2;
            }
            case 1 -> {
                code = "CHALLENGE_UNPLUG_STANDBY";
                title = "Phantom Load Buster: Cut 2 Hours of AC & Unplug Idle Devices";
                desc = "Turn off air conditioning 2 hours early and unplug standby chargers/appliances today.";
                category = "ELECTRICITY";
                reward = 25;
                savedKg = 2.3;
            }
            case 2 -> {
                code = "CHALLENGE_PLANT_POWERED";
                title = "Plant-Powered Plate: Enjoy 100% Vegetarian/Vegan Meals Today";
                desc = "Choose locally sourced plant-based meals for breakfast, lunch, and dinner today.";
                category = "FOOD";
                reward = 25;
                savedKg = 2.6;
            }
            default -> {
                code = "CHALLENGE_ZERO_SINGLE_USE";
                title = "Zero Single-Use Plastic & Waste Segregation";
                desc = "Carry a reusable bottle/bag and segregate 100% of recyclable and compostable waste today.";
                category = "WASTE";
                reward = 20;
                savedKg = 1.8;
            }
        }

        boolean completed = ecoPointRepository.existsByUserIdAndActionCodeAndEarnedDate(userId, code, today);

        return DailyChallengeCard.builder()
                .code(code)
                .title(title)
                .description(desc)
                .category(category)
                .pointsReward(reward)
                .estimatedCo2SavedKg(savedKg)
                .completedToday(completed)
                .build();
    }

    public AmbientEnvironmentData fetchAmbientEnvironmentForCity(String city) {
        String resolvedCity = (city != null && !city.isBlank()) ? city.trim() : "Pune";
        String lower = resolvedCity.toLowerCase();

        int aqi = 74;
        String category = "Moderate";
        double pm25 = 23.4;
        double pm10 = 51.0;
        double temp = 28.5;
        int humidity = 54;
        String condition = "Partly Cloudy & Breezy";

        if (lower.contains("delhi") || lower.contains("noida")) {
            aqi = 168;
            category = "Unhealthy for Sensitive Groups";
            pm25 = 82.5;
            pm10 = 154.0;
            temp = 31.0;
            humidity = 42;
            condition = "Hazy Sunshine";
        } else if (lower.contains("mumbai")) {
            aqi = 86;
            category = "Moderate";
            pm25 = 28.2;
            pm10 = 64.0;
            temp = 30.2;
            humidity = 72;
            condition = "Coastal Breeze";
        } else if (lower.contains("bengaluru") || lower.contains("bangalore")) {
            aqi = 58;
            category = "Satisfactory";
            pm25 = 16.8;
            pm10 = 39.5;
            temp = 25.4;
            humidity = 60;
            condition = "Pleasant & Clear";
        }

        String advisory = aqi <= 100
                ? "Great outdoor conditions for walking, cycling, or Metro transit today."
                : "Elevated ambient particulate levels — prefer Metro/enclosed public transit over open-road cycling.";

        return AmbientEnvironmentData.builder()
                .city(resolvedCity)
                .aqi(aqi)
                .aqiCategory(category)
                .ambientPm25UgM3(pm25)
                .ambientPm10UgM3(pm10)
                .temperatureCelsius(temp)
                .humidityPercent(humidity)
                .weatherCondition(condition)
                .travelAdvisory(advisory)
                .distinctionNote("Ambient city data reflects regional air quality in " + resolvedCity
                        + " and is tracked separately from your personal calculated emissions.")
                .build();
    }

    private TreeEquivalentMetric buildTreeEquivalent(double monthlyCo2Kg) {
        double annualizedCo2 = monthlyCo2Kg * 12.0;
        double treesPerYear = calculationEngine.calculateTreesRequired(annualizedCo2);
        int matureTrees = Math.max(1, (int) Math.ceil(treesPerYear));
        double seedlings = round2(annualizedCo2 / 60.0);

        return TreeEquivalentMetric.builder()
                .monthlyCo2Kg(round2(monthlyCo2Kg))
                .treesNeededYearlyToOffset(treesPerYear)
                .matureTreesEquivalent(matureTrees)
                .seedlingsGrown10Years(seedlings)
                .educationalNote("1 mature tree absorbs ~21.77 kg of CO₂ per year (EPA/IPCC educational metric).")
                .build();
    }

    private List<NotificationAlert> buildAlerts(
            PollutionProfile todayProfile,
            CarbonBudgetStatus budget,
            User user) {

        List<NotificationAlert> alerts = new ArrayList<>();

        if ("CRITICAL".equals(budget.getAlertLevel()) || "WARNING".equals(budget.getAlertLevel())) {
            alerts.add(NotificationAlert.builder()
                    .type("WARNING")
                    .title("Carbon Budget Alert (" + budget.getUsedPercentage() + "% Used)")
                    .message(budget.getAlertMessage())
                    .build());
        }

        if (todayProfile.getCo2Kg() > 8.5) {
            alerts.add(NotificationAlert.builder()
                    .type("SPIKE")
                    .title("Daily Emission Spike Detected")
                    .message("Today's emissions (" + todayProfile.getCo2Kg()
                            + " kg CO₂) exceed the 6.5 kg daily target. Try completing Today's Eco Challenge to offset!")
                    .build());
        }

        alerts.add(NotificationAlert.builder()
                .type("SUCCESS")
                .title(user.getCurrentStreakDays() + "-Day Eco Streak Active")
                .message("You are currently at '" + user.getEcoLevel() + "' level with " + user.getTotalEcoPoints() + " Eco Points.")
                .build());

        return alerts;
    }

    private int clampScore(int val) {
        return Math.max(25, Math.min(98, val));
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private double round3(double val) {
        return Math.round(val * 1000.0) / 1000.0;
    }
}
