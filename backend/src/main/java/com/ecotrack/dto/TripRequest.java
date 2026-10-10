package com.ecotrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequest {

    private Long vehicleId;

    @NotBlank(message = "Transport mode is required")
    private String transportMode;

    private String fuelType;

    @NotBlank(message = "Origin name is required")
    private String originName;

    private Double originLat;

    private Double originLng;

    @NotBlank(message = "Destination name is required")
    private String destinationName;

    private Double destinationLat;

    private Double destinationLng;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be greater than zero")
    private Double distanceKm;

    private Integer durationMinutes;

    private Integer passengers;

    private Double customFuelEfficiency;

    private LocalDate tripDate;

    private String notes;
}
