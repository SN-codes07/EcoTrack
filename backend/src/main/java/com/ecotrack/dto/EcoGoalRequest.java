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
public class EcoGoalRequest {

    @NotBlank(message = "Goal title is required")
    private String title;

    private String category; // OVERALL, TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER

    @NotNull(message = "Target reduction percentage is required")
    @Positive(message = "Target reduction must be positive")
    private Double targetReductionPct;

    private Double baselineCo2Kg;

    private LocalDate startDate;

    private LocalDate endDate;
}
