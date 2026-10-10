package com.ecotrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequest {

    @NotBlank(message = "Vehicle nickname is required")
    private String nickname;

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType; // CAR_PETROL, CAR_DIESEL, CAR_EV, CAR_HYBRID, TWO_WHEELER, E_BIKE, BICYCLE

    @NotBlank(message = "Fuel type is required")
    private String fuelType; // PETROL, DIESEL, ELECTRIC, CNG, HYBRID, NONE

    @NotNull(message = "Fuel efficiency is required")
    @PositiveOrZero(message = "Fuel efficiency must be zero or positive")
    private Double fuelEfficiency;

    private Double fuelCostPerUnit;

    private Double emissionFactorKgPerKm;

    private Boolean isPrimary;
}
