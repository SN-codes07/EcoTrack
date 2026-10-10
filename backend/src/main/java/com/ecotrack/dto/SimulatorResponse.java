package com.ecotrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulatorResponse {

    private Double beforeMonthlyCo2Kg;
    private Double afterMonthlyCo2Kg;
    private Double monthlyCo2SavedKg;
    private Double yearlyCo2SavedKg;
    private Double reductionPercentage;
    private Double monthlyCostSavedInr;
    private Double equivalentTreesSavedPerYear;
    private Integer projectedNewCarbonScore;
    private List<CategoryImpactDiff> breakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryImpactDiff {
        private String category;
        private Double beforeKg;
        private Double afterKg;
        private Double savedKg;
        private String insight;
    }
}
