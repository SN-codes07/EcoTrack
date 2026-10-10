package com.ecotrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulatorRequest {

    @Builder.Default
    private String currentTransportMode = "CAR_PETROL";

    @Builder.Default
    private String targetTransportMode = "METRO";

    @Builder.Default
    private Double weeklyCommuteKm = 150.0;

    @Builder.Default
    private Double transportSwitchPercentage = 60.0; // % of weekly km switched to target mode

    @Builder.Default
    private Double currentDailyAcHours = 6.0;

    @Builder.Default
    private Double targetDailyAcHours = 3.0;

    @Builder.Default
    private Integer meatMealsReplacedPerWeek = 3;

    @Builder.Default
    private Double solarEnergyPercentage = 20.0;

    @Builder.Default
    private Double monthlyGridElectricityKwh = 220.0;
}
