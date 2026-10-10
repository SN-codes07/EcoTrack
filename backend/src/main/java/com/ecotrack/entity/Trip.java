package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "transport_mode", nullable = false, length = 50)
    private String transportMode;

    @Builder.Default
    @Column(name = "fuel_type", nullable = false, length = 30)
    private String fuelType = "PETROL";

    @Column(name = "origin_name", nullable = false, length = 150)
    private String originName;

    @Column(name = "origin_lat")
    private Double originLat;

    @Column(name = "origin_lng")
    private Double originLng;

    @Column(name = "destination_name", nullable = false, length = 150)
    private String destinationName;

    @Column(name = "destination_lat")
    private Double destinationLat;

    @Column(name = "destination_lng")
    private Double destinationLng;

    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;

    @Builder.Default
    @Column(name = "duration_minutes")
    private Integer durationMinutes = 0;

    @Builder.Default
    @Column(name = "passengers", nullable = false)
    private Integer passengers = 1;

    @Column(name = "fuel_efficiency_used")
    private Double fuelEfficiencyUsed;

    @Builder.Default
    @Column(name = "fuel_consumed", nullable = false)
    private Double fuelConsumed = 0.0;

    @Builder.Default
    @Column(name = "fuel_cost", nullable = false)
    private Double fuelCost = 0.0;

    @Column(name = "co2_kg", nullable = false)
    private Double co2Kg;

    @Builder.Default
    @Column(name = "pm25_g", nullable = false)
    private Double pm25G = 0.0;

    @Builder.Default
    @Column(name = "nox_g", nullable = false)
    private Double noxG = 0.0;

    @Builder.Default
    @Column(name = "co_g", nullable = false)
    private Double coG = 0.0;

    @Builder.Default
    @Column(name = "severity_level", nullable = false, length = 20)
    private String severityLevel = "LOW"; // LOW, MEDIUM, HIGH

    @Column(name = "trip_date", nullable = false)
    private LocalDate tripDate;

    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
