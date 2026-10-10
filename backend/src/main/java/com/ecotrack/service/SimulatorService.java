package com.ecotrack.service;

import com.ecotrack.dto.SimulatorRequest;
import com.ecotrack.dto.SimulatorResponse;
import com.ecotrack.dto.SimulatorResponse.CategoryImpactDiff;
import com.ecotrack.service.EmissionCalculationEngineService.ActivityCalculationResult;
import com.ecotrack.service.EmissionCalculationEngineService.TripCalculationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SimulatorService {

    private final EmissionCalculationEngineService calculationEngine;

    /**
     * Pure calculation endpoint for the "If I Change My Habit" simulator.
     * Computes Before/After monthly and yearly impact without writing to the database.
     */
    public SimulatorResponse simulateHabitChanges(SimulatorRequest req) {
        double weeklyKm = req.getWeeklyCommuteKm() != null ? req.getWeeklyCommuteKm() : 150.0;
        double monthlyKm = weeklyKm * 4.33;
        double switchRatio = (req.getTransportSwitchPercentage() != null ? req.getTransportSwitchPercentage() : 60.0) / 100.0;

        String currentMode = req.getCurrentTransportMode() != null ? req.getCurrentTransportMode() : "CAR_PETROL";
        String targetMode = req.getTargetTransportMode() != null ? req.getTargetTransportMode() : "METRO";

        // 1. Transport Before vs After
        TripCalculationResult transBefore = calculationEngine.calculateTripImpact(
                currentMode, null, monthlyKm, 1, null, null, null);
        TripCalculationResult transRemaining = calculationEngine.calculateTripImpact(
                currentMode, null, monthlyKm * (1.0 - switchRatio), 1, null, null, null);
        TripCalculationResult transSwitched = calculationEngine.calculateTripImpact(
                targetMode, null, monthlyKm * switchRatio, 1, null, null, null);

        double transBeforeCo2 = transBefore.getCo2Kg();
        double transAfterCo2 = round2(transRemaining.getCo2Kg() + transSwitched.getCo2Kg());
        double transCostSaved = Math.max(0.0, transBefore.getFuelCost() - (transRemaining.getFuelCost() + transSwitched.getFuelCost()));

        // 2. AC & Electricity Before vs After
        double curAcHrsMonth = (req.getCurrentDailyAcHours() != null ? req.getCurrentDailyAcHours() : 6.0) * 30.0;
        double targetAcHrsMonth = (req.getTargetDailyAcHours() != null ? req.getTargetDailyAcHours() : 3.0) * 30.0;
        double gridKwh = req.getMonthlyGridElectricityKwh() != null ? req.getMonthlyGridElectricityKwh() : 220.0;
        double solarRatio = (req.getSolarEnergyPercentage() != null ? req.getSolarEnergyPercentage() : 20.0) / 100.0;

        ActivityCalculationResult acBefore = calculationEngine.calculateActivityImpact("ELECTRICITY", "AC_USAGE_HOURS", curAcHrsMonth, "hours");
        ActivityCalculationResult acAfter = calculationEngine.calculateActivityImpact("ELECTRICITY", "AC_USAGE_HOURS", targetAcHrsMonth, "hours");

        ActivityCalculationResult gridBefore = calculationEngine.calculateActivityImpact("ELECTRICITY", "GRID_ELECTRICITY_KWH", gridKwh, "kWh");
        ActivityCalculationResult gridAfterRemaining = calculationEngine.calculateActivityImpact("ELECTRICITY", "GRID_ELECTRICITY_KWH", gridKwh * (1.0 - solarRatio), "kWh");
        ActivityCalculationResult solarPortion = calculationEngine.calculateActivityImpact("ELECTRICITY", "SOLAR_ENERGY_KWH", gridKwh * solarRatio, "kWh");

        double energyBeforeCo2 = round2(acBefore.getCo2Kg() + gridBefore.getCo2Kg());
        double energyAfterCo2 = round2(acAfter.getCo2Kg() + gridAfterRemaining.getCo2Kg() + solarPortion.getCo2Kg());
        double energyCostSaved = Math.max(0.0, (curAcHrsMonth - targetAcHrsMonth) * 1.4 * 9.0 + (gridKwh * solarRatio * 8.0));

        // 3. Diet / Food Before vs After
        int meatMealsReplacedMonthly = (int) Math.round((req.getMeatMealsReplacedPerWeek() != null ? req.getMeatMealsReplacedPerWeek() : 3) * 4.33);
        int baseMeatMealsMonthly = Math.max(meatMealsReplacedMonthly, 16);

        ActivityCalculationResult foodBefore = calculationEngine.calculateActivityImpact("FOOD", "RED_MEAT_MEAL", baseMeatMealsMonthly, "meals");
        ActivityCalculationResult foodRemainingMeat = calculationEngine.calculateActivityImpact("FOOD", "RED_MEAT_MEAL", baseMeatMealsMonthly - meatMealsReplacedMonthly, "meals");
        ActivityCalculationResult foodReplacedVegan = calculationEngine.calculateActivityImpact("FOOD", "VEGAN_MEAL", meatMealsReplacedMonthly, "meals");

        double foodBeforeCo2 = foodBefore.getCo2Kg();
        double foodAfterCo2 = round2(foodRemainingMeat.getCo2Kg() + foodReplacedVegan.getCo2Kg());

        // Totals
        double beforeTotal = round2(transBeforeCo2 + energyBeforeCo2 + foodBeforeCo2);
        double afterTotal = round2(transAfterCo2 + energyAfterCo2 + foodAfterCo2);
        double monthlySaved = round2(Math.max(0.0, beforeTotal - afterTotal));
        double yearlySaved = round2(monthlySaved * 12.0);
        double pctReduced = beforeTotal > 0 ? round2((monthlySaved / beforeTotal) * 100.0) : 0.0;
        double totalMonthlyCostSaved = round2(transCostSaved + energyCostSaved);

        int projectedScore = calculationEngine.calculateCarbonScore(afterTotal / 30.0, 350, 12);

        List<CategoryImpactDiff> breakdown = new ArrayList<>();
        breakdown.add(CategoryImpactDiff.builder()
                .category("TRANSPORTATION")
                .beforeKg(transBeforeCo2)
                .afterKg(transAfterCo2)
                .savedKg(round2(transBeforeCo2 - transAfterCo2))
                .insight("Switching " + Math.round(switchRatio * 100) + "% of commute from "
                        + calculationEngine.formatModeLabel(currentMode) + " to "
                        + calculationEngine.formatModeLabel(targetMode))
                .build());
        breakdown.add(CategoryImpactDiff.builder()
                .category("ELECTRICITY")
                .beforeKg(energyBeforeCo2)
                .afterKg(energyAfterCo2)
                .savedKg(round2(energyBeforeCo2 - energyAfterCo2))
                .insight("Reducing AC usage & shifting " + Math.round(solarRatio * 100) + "% electricity to solar/renewable")
                .build());
        breakdown.add(CategoryImpactDiff.builder()
                .category("FOOD")
                .beforeKg(foodBeforeCo2)
                .afterKg(foodAfterCo2)
                .savedKg(round2(foodBeforeCo2 - foodAfterCo2))
                .insight("Replacing " + (req.getMeatMealsReplacedPerWeek() != null ? req.getMeatMealsReplacedPerWeek() : 3)
                        + " meat meals/week with plant-based meals")
                .build());

        return SimulatorResponse.builder()
                .beforeMonthlyCo2Kg(beforeTotal)
                .afterMonthlyCo2Kg(afterTotal)
                .monthlyCo2SavedKg(monthlySaved)
                .yearlyCo2SavedKg(yearlySaved)
                .reductionPercentage(pctReduced)
                .monthlyCostSavedInr(totalMonthlyCostSaved)
                .equivalentTreesSavedPerYear(calculationEngine.calculateTreesRequired(yearlySaved))
                .projectedNewCarbonScore(projectedScore)
                .breakdown(breakdown)
                .build();
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
