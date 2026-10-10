package com.ecotrack.service;

import com.ecotrack.config.EmissionFactorsConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmissionCalculationEngineService {

    private final EmissionFactorsConfig factorsConfig;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TripCalculationResult {
        private double distanceKm;
        private String transportMode;
        private String fuelType;
        private int passengers;
        private double emissionFactorUsed;
        private double fuelEfficiencyUsed;
        private double fuelConsumed;
        private double fuelCost;
        private double co2Kg;
        private double pm25G;
        private double noxG;
        private double coG;
        private double treesRequired;
        private String severityLevel; // LOW, MEDIUM, HIGH
        private boolean sustainableMode;
        private int ecoPointsAwarded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityCalculationResult {
        private String category;
        private String activityType;
        private double quantity;
        private String unit;
        private double emissionFactorUsed;
        private double co2Kg;
        private double pm25G;
        private double noxG;
        private double coG;
        private double treesRequired;
        private boolean sustainableAction;
        private int ecoPointsAwarded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransportOptionComparison {
        private String transportMode;
        private String label;
        private double distanceKm;
        private int estimatedDurationMinutes;
        private double co2Kg;
        private double fuelCost;
        private double pm25G;
        private double noxG;
        private double co2SavedVsCurrentKg;
        private double percentageSaved;
        private String severityLevel;
        private String badge; // e.g., "Lowest Emission", "Lowest Cost", "Fastest"
    }

    public TripCalculationResult calculateTripImpact(
            String transportMode,
            String fuelType,
            double distanceKm,
            int passengers,
            Double customFuelEfficiency,
            Double customFuelCostPerUnit,
            Double customVehicleEmissionFactor) {

        String modeKey = transportMode != null ? transportMode.toUpperCase() : "CAR_PETROL";
        String fuelKey = fuelType != null ? fuelType.toUpperCase() : resolveDefaultFuelForMode(modeKey);
        int effectivePassengers = Math.max(1, passengers);

        Map<String, Double> transportFactors = factorsConfig.getTransportFactors();
        Map<String, Double> fuelFactors = factorsConfig.getFuelFactors();

        double baseFactorPerKm = customVehicleEmissionFactor != null && customVehicleEmissionFactor > 0
                ? customVehicleEmissionFactor
                : transportFactors.getOrDefault(modeKey, 0.0);

        double efficiency = (customFuelEfficiency != null && customFuelEfficiency > 0)
                ? customFuelEfficiency
                : resolveDefaultEfficiency(modeKey);

        double fuelConsumed = 0.0;
        double totalCo2Kg;

        if (isZeroFuelMode(modeKey)) {
            fuelConsumed = 0.0;
            totalCo2Kg = 0.0;
        } else if (customFuelEfficiency != null && customFuelEfficiency > 0 && fuelFactors.containsKey(fuelKey)) {
            fuelConsumed = distanceKm / efficiency;
            double fuelFactor = fuelFactors.getOrDefault(fuelKey, 0.0);
            totalCo2Kg = (fuelConsumed * fuelFactor) / effectivePassengers;
        } else {
            fuelConsumed = efficiency > 0 ? (distanceKm / efficiency) : 0.0;
            // Shared modes (BUS, TRAIN, METRO, FLIGHT) already have per-passenger-km factors in application.yml
            if (isPublicTransitMode(modeKey)) {
                totalCo2Kg = distanceKm * baseFactorPerKm;
            } else {
                totalCo2Kg = (distanceKm * baseFactorPerKm) / effectivePassengers;
            }
        }

        double unitCost = (customFuelCostPerUnit != null && customFuelCostPerUnit >= 0)
                ? customFuelCostPerUnit
                : resolveDefaultFuelCost(modeKey, fuelKey);

        double fuelCost = isPublicTransitMode(modeKey)
                ? round2(distanceKm * unitCost * effectivePassengers)
                : round2(fuelConsumed * unitCost);

        double pm25Factor = getPollutantFactor(factorsConfig.getPollutantFactors().getPm25GPerKm(), modeKey);
        double noxFactor = getPollutantFactor(factorsConfig.getPollutantFactors().getNoxGPerKm(), modeKey);
        double coFactor = getPollutantFactor(factorsConfig.getPollutantFactors().getCoGPerKm(), modeKey);

        double pm25G = round3((distanceKm * pm25Factor) / (isPublicTransitMode(modeKey) ? 1 : effectivePassengers));
        double noxG = round3((distanceKm * noxFactor) / (isPublicTransitMode(modeKey) ? 1 : effectivePassengers));
        double coG = round3((distanceKm * coFactor) / (isPublicTransitMode(modeKey) ? 1 : effectivePassengers));

        double co2PerKm = distanceKm > 0 ? (totalCo2Kg / distanceKm) : 0.0;
        String severity = determineSeverity(co2PerKm, totalCo2Kg);
        boolean isSustainable = isSustainableTransport(modeKey, effectivePassengers);
        int points = isSustainable ? calculateTransportEcoPoints(modeKey, distanceKm) : 0;

        return TripCalculationResult.builder()
                .distanceKm(round2(distanceKm))
                .transportMode(modeKey)
                .fuelType(fuelKey)
                .passengers(effectivePassengers)
                .emissionFactorUsed(round3(baseFactorPerKm))
                .fuelEfficiencyUsed(round2(efficiency))
                .fuelConsumed(round2(fuelConsumed))
                .fuelCost(round2(fuelCost))
                .co2Kg(round2(totalCo2Kg))
                .pm25G(pm25G)
                .noxG(noxG)
                .coG(coG)
                .treesRequired(calculateTreesRequired(totalCo2Kg))
                .severityLevel(severity)
                .sustainableMode(isSustainable)
                .ecoPointsAwarded(points)
                .build();
    }

    public ActivityCalculationResult calculateActivityImpact(
            String category,
            String activityType,
            double quantity,
            String unit) {

        String typeKey = activityType != null ? activityType.toUpperCase() : "GRID_ELECTRICITY_KWH";
        String catKey = category != null ? category.toUpperCase() : "ELECTRICITY";

        Map<String, Double> activityFactors = factorsConfig.getActivityFactors();
        double factor = activityFactors.getOrDefault(typeKey, 0.25);

        double co2Kg = round2(quantity * factor);
        // Estimate secondary air pollution from energy/waste/food activity
        double pm25G = round3(co2Kg * 0.045);
        double noxG = round3(co2Kg * 0.110);
        double coG = round3(co2Kg * 0.080);

        boolean sustainable = isSustainableActivityType(typeKey);
        int points = sustainable ? Math.max(10, (int) Math.round(quantity * 4)) : 0;

        return ActivityCalculationResult.builder()
                .category(catKey)
                .activityType(typeKey)
                .quantity(round2(quantity))
                .unit(unit != null ? unit : "units")
                .emissionFactorUsed(round3(factor))
                .co2Kg(co2Kg)
                .pm25G(pm25G)
                .noxG(noxG)
                .coG(coG)
                .treesRequired(calculateTreesRequired(co2Kg))
                .sustainableAction(sustainable)
                .ecoPointsAwarded(points)
                .build();
    }

    public List<TransportOptionComparison> compareTransportAlternatives(
            String selectedMode,
            double distanceKm,
            int passengers) {

        TripCalculationResult baseline = calculateTripImpact(
                selectedMode, null, distanceKm, passengers, null, null, null);

        List<String> modesToCompare = List.of(
                "WALKING", "CYCLING", "E_BIKE", "METRO", "TRAIN", "BUS",
                "CAR_EV", "TWO_WHEELER", "CAR_CNG", "CAR_DIESEL", "CAR_PETROL"
        );

        List<TransportOptionComparison> comparisons = new ArrayList<>();
        for (String mode : modesToCompare) {
            if (distanceKm > 15 && "WALKING".equals(mode)) {
                continue;
            }
            if (distanceKm > 40 && "CYCLING".equals(mode)) {
                continue;
            }
            TripCalculationResult res = calculateTripImpact(mode, null, distanceKm, passengers, null, null, null);
            double savedKg = round2(Math.max(0.0, baseline.getCo2Kg() - res.getCo2Kg()));
            double pctSaved = baseline.getCo2Kg() > 0
                    ? round2(((baseline.getCo2Kg() - res.getCo2Kg()) / baseline.getCo2Kg()) * 100.0)
                    : 0.0;

            comparisons.add(TransportOptionComparison.builder()
                    .transportMode(mode)
                    .label(formatModeLabel(mode))
                    .distanceKm(round2(distanceKm))
                    .estimatedDurationMinutes(estimateDurationMinutes(mode, distanceKm))
                    .co2Kg(res.getCo2Kg())
                    .fuelCost(res.getFuelCost())
                    .pm25G(res.getPm25G())
                    .noxG(res.getNoxG())
                    .co2SavedVsCurrentKg(savedKg)
                    .percentageSaved(pctSaved)
                    .severityLevel(res.getSeverityLevel())
                    .badge(null)
                    .build());
        }

        // Assign medals: Lowest Emission, Lowest Cost, Fastest
        comparisons.stream()
                .min(Comparator.comparingDouble(TransportOptionComparison::getCo2Kg)
                        .thenComparingInt(TransportOptionComparison::getEstimatedDurationMinutes))
                .ifPresent(opt -> opt.setBadge("🥇 Lowest Emission"));

        comparisons.stream()
                .filter(opt -> opt.getBadge() == null)
                .min(Comparator.comparingDouble(TransportOptionComparison::getFuelCost))
                .ifPresent(opt -> opt.setBadge("🥈 Lowest Cost"));

        comparisons.stream()
                .filter(opt -> opt.getBadge() == null)
                .min(Comparator.comparingInt(TransportOptionComparison::getEstimatedDurationMinutes))
                .ifPresent(opt -> opt.setBadge("🥉 Fastest"));

        comparisons.sort(Comparator.comparingDouble(TransportOptionComparison::getCo2Kg));
        return comparisons;
    }

    public double calculateTreesRequired(double co2Kg) {
        double absorption = factorsConfig.getConstants().getTreeAbsorptionKgPerYear();
        if (absorption <= 0) {
            absorption = 21.77;
        }
        return round2(co2Kg / absorption);
    }

    public int calculateCarbonScore(double avgDailyCo2Kg, int totalEcoPoints, int sustainableActionsCount) {
        double targetDaily = factorsConfig.getConstants().getDailyTargetCo2Kg();
        if (targetDaily <= 0) {
            targetDaily = 6.5;
        }
        // Score starts at 80 when at targetDaily; lower emissions boost up to 96, higher emissions reduce score
        double ratio = avgDailyCo2Kg / targetDaily;
        double rawScore = 100.0 - (ratio * 28.0) + Math.min(12.0, (totalEcoPoints / 80.0)) + Math.min(8.0, sustainableActionsCount * 0.8);
        int clamped = (int) Math.round(Math.max(15.0, Math.min(99.0, rawScore)));
        return clamped;
    }

    public String determineCarbonStatus(int carbonScore) {
        if (carbonScore >= 80) return "ECO_CHAMPION";
        if (carbonScore >= 60) return "IMPROVING";
        if (carbonScore >= 40) return "HIGH_IMPACT";
        return "CRITICAL_IMPACT";
    }

    public String determineEcoLevel(int totalEcoPoints) {
        if (totalEcoPoints >= 1000) return "Planet Protector";
        if (totalEcoPoints >= 600) return "Climate Guardian";
        if (totalEcoPoints >= 300) return "Green Innovator";
        if (totalEcoPoints >= 100) return "Eco Explorer";
        return "Eco Beginner";
    }

    private double getPollutantFactor(Map<String, Double> map, String mode) {
        if (map == null || map.isEmpty()) return 0.0;
        if ("WALKING".equals(mode) || "CYCLING".equals(mode)) return 0.0;
        return map.getOrDefault(mode, map.getOrDefault("DEFAULT", 0.0));
    }

    private boolean isZeroFuelMode(String mode) {
        return "WALKING".equals(mode) || "CYCLING".equals(mode);
    }

    private boolean isPublicTransitMode(String mode) {
        return "BUS".equals(mode) || "TRAIN".equals(mode) || "METRO".equals(mode) || "FLIGHT".equals(mode);
    }

    private boolean isSustainableTransport(String mode, int passengers) {
        return "WALKING".equals(mode)
                || "CYCLING".equals(mode)
                || "E_BIKE".equals(mode)
                || "METRO".equals(mode)
                || "TRAIN".equals(mode)
                || "BUS".equals(mode)
                || "CAR_EV".equals(mode)
                || passengers >= 3;
    }

    private int calculateTransportEcoPoints(String mode, double distanceKm) {
        if ("WALKING".equals(mode) || "CYCLING".equals(mode)) return 20;
        if ("METRO".equals(mode) || "TRAIN".equals(mode) || "BUS".equals(mode)) return 15;
        if ("E_BIKE".equals(mode) || "CAR_EV".equals(mode)) return 10;
        return 8;
    }

    private boolean isSustainableActivityType(String typeKey) {
        return "SOLAR_ENERGY_KWH".equals(typeKey)
                || "VEGAN_MEAL".equals(typeKey)
                || "VEGETARIAN_MEAL".equals(typeKey)
                || "RECYCLED_WASTE_KG".equals(typeKey)
                || "COMPOSTED_WASTE_KG".equals(typeKey)
                || "SECOND_HAND_ITEM".equals(typeKey)
                || "REUSABLE_BAG_USED".equals(typeKey);
    }

    private String determineSeverity(double co2PerKm, double totalCo2Kg) {
        if (co2PerKm <= 0.06 || totalCo2Kg <= 1.2) return "LOW";
        if (co2PerKm <= 0.14 || totalCo2Kg <= 3.5) return "MEDIUM";
        return "HIGH";
    }

    private String resolveDefaultFuelForMode(String mode) {
        return switch (mode) {
            case "WALKING", "CYCLING" -> "NONE";
            case "E_BIKE", "CAR_EV", "METRO", "TRAIN" -> "ELECTRIC";
            case "CAR_DIESEL", "BUS" -> "DIESEL";
            case "CAR_CNG" -> "CNG";
            case "CAR_HYBRID" -> "HYBRID";
            default -> "PETROL";
        };
    }

    private double resolveDefaultEfficiency(String mode) {
        return switch (mode) {
            case "WALKING", "CYCLING" -> 0.0;
            case "E_BIKE" -> 35.0; // km per kWh
            case "TWO_WHEELER" -> 42.0; // km per L
            case "CAR_EV" -> 6.8; // km per kWh
            case "CAR_HYBRID" -> 22.5;
            case "CAR_CNG" -> 21.0;
            case "CAR_DIESEL" -> 17.5;
            case "CAR_PETROL" -> 14.5;
            default -> 15.0;
        };
    }

    private double resolveDefaultFuelCost(String mode, String fuel) {
        if (isPublicTransitMode(mode)) {
            return switch (mode) {
                case "BUS" -> 2.2;   // INR per km ticket approx
                case "METRO" -> 2.8;
                case "TRAIN" -> 1.5;
                case "FLIGHT" -> 7.5;
                default -> 2.0;
            };
        }
        return switch (fuel) {
            case "PETROL" -> 104.5;
            case "DIESEL" -> 92.0;
            case "CNG" -> 86.0;
            case "ELECTRIC" -> 8.5;
            case "NONE" -> 0.0;
            default -> 100.0;
        };
    }

    public int estimateDurationMinutes(String mode, double distanceKm) {
        double speedKmh = switch (mode) {
            case "WALKING" -> 5.0;
            case "CYCLING" -> 15.0;
            case "E_BIKE" -> 22.0;
            case "BUS" -> 24.0;
            case "TWO_WHEELER" -> 30.0;
            case "CAR_PETROL", "CAR_DIESEL", "CAR_EV", "CAR_CNG", "CAR_HYBRID" -> 32.0;
            case "METRO" -> 38.0;
            case "TRAIN" -> 50.0;
            case "FLIGHT" -> 500.0;
            default -> 28.0;
        };
        return Math.max(3, (int) Math.round((distanceKm / speedKmh) * 60.0));
    }

    public String formatModeLabel(String mode) {
        return switch (mode) {
            case "WALKING" -> "Walking";
            case "CYCLING" -> "Bicycle";
            case "E_BIKE" -> "Electric Bike";
            case "TWO_WHEELER" -> "Two-Wheeler (Petrol)";
            case "CAR_PETROL" -> "Petrol Car";
            case "CAR_DIESEL" -> "Diesel Car";
            case "CAR_CNG" -> "CNG Car";
            case "CAR_HYBRID" -> "Hybrid Car";
            case "CAR_EV" -> "Electric Car (EV)";
            case "BUS" -> "Public Bus";
            case "METRO" -> "Metro Rail";
            case "TRAIN" -> "Suburban Train";
            case "FLIGHT" -> "Domestic Flight";
            default -> mode;
        };
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private double round3(double val) {
        return Math.round(val * 1000.0) / 1000.0;
    }
}
