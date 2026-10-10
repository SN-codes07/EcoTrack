package com.ecotrack.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "ecotrack")
public class EmissionFactorsConfig {

    private Constants constants = new Constants();
    private Map<String, Double> transportFactors = new HashMap<>();
    private Map<String, Double> fuelFactors = new HashMap<>();
    private PollutantFactors pollutantFactors = new PollutantFactors();
    private Map<String, Double> activityFactors = new HashMap<>();

    @Data
    public static class Constants {
        private double treeAbsorptionKgPerYear;
        private double dailyTargetCo2Kg;
        private double monthlyDefaultBudgetKg;
    }

    @Data
    public static class PollutantFactors {
        private Map<String, Double> pm25GPerKm = new HashMap<>();
        private Map<String, Double> noxGPerKm = new HashMap<>();
        private Map<String, Double> coGPerKm = new HashMap<>();
    }
}
