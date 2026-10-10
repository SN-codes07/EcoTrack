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
public class ActivityRequest {

    @NotBlank(message = "Category is required")
    private String category; // TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER, LIFESTYLE

    @NotBlank(message = "Activity type is required")
    private String activityType;

    private String description;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Double quantity;

    private String unit;

    private LocalDate activityDate;
}
