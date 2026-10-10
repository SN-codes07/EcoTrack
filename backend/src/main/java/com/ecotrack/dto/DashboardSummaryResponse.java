package com.ecotrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private CarbonScoreDetail carbonScore;
    private PollutionProfile todayProfile;
    private PollutionProfile monthlyProfile;
    private CarbonBudgetStatus budgetStatus;
    private List<TimeSeriesPoint> dailyTrend;       // Last 14/30 days
    private List<TimeSeriesPoint> weeklyTrend;      // Last 8 weeks
    private List<TimeSeriesPoint> monthlyTrend;     // Last 6 months
    private List<CategoryBreakdown> categoryBreakdown;
    private List<SmartRecommendation> recommendations;
    private DailyChallengeCard dailyChallenge;
    private AmbientEnvironmentData ambientEnvironment;
    private TreeEquivalentMetric treeEquivalent;
    private List<NotificationAlert> alerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonScoreDetail {
        private int score;
        private String status;       // ECO_CHAMPION, IMPROVING, HIGH_IMPACT, CRITICAL_IMPACT
        private String statusLabel;  // e.g. "🟢 Eco Champion"
        private String summaryText;
        private Map<String, Integer> subScores; // Transport, Energy, Food, Waste, SustainableActions
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PollutionProfile {
        private double co2Kg;
        private double distanceKm;
        private double fuelConsumedLiters;
        private double pm25G;
        private double noxG;
        private double coG;
        private double treesRequired;
        private String disclaimer;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CarbonBudgetStatus {
        private double monthlyBudgetKg;
        private double usedCo2Kg;
        private double remainingCo2Kg;
        private double usedPercentage;
        private double projectedEndOfMonthKg;
        private String alertLevel; // SAFE, WARNING, CRITICAL
        private String alertMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String label;
        private String date;
        private double totalCo2Kg;
        private double transportCo2Kg;
        private double electricityCo2Kg;
        private double foodCo2Kg;
        private double otherCo2Kg;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String category;
        private double co2Kg;
        private double percentage;
        private String color;
        private String topContributor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmartRecommendation {
        private String id;
        private String title;
        private String description;
        private String category; // EASY, TRANSPORT, ENERGY, FOOD, LIFESTYLE
        private String potentialSavingText;
        private double potentialMonthlyCo2SavingKg;
        private int ecoPointsReward;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyChallengeCard {
        private String code;
        private String title;
        private String description;
        private String category;
        private int pointsReward;
        private double estimatedCo2SavedKg;
        private boolean completedToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmbientEnvironmentData {
        private String city;
        private int aqi;
        private String aqiCategory;
        private double ambientPm25UgM3;
        private double ambientPm10UgM3;
        private double temperatureCelsius;
        private int humidityPercent;
        private String weatherCondition;
        private String travelAdvisory;
        private String distinctionNote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreeEquivalentMetric {
        private double monthlyCo2Kg;
        private double treesNeededYearlyToOffset;
        private int matureTreesEquivalent;
        private double seedlingsGrown10Years;
        private String educationalNote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationAlert {
        private String type; // WARNING, INFO, SUCCESS, SPIKE
        private String title;
        private String message;
    }
}
