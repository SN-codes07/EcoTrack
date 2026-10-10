package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "emissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Emission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "source_type", nullable = false, length = 30)
    private String sourceType; // TRIP, ACTIVITY

    @Column(name = "source_ref_id", nullable = false)
    private Long sourceRefId;

    @Column(name = "category", nullable = false, length = 40)
    private String category; // TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER, LIFESTYLE

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
    @Column(name = "distance_km", nullable = false)
    private Double distanceKm = 0.0;

    @Builder.Default
    @Column(name = "fuel_consumed", nullable = false)
    private Double fuelConsumed = 0.0;

    @Builder.Default
    @Column(name = "trees_required", nullable = false)
    private Double treesRequired = 0.0;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
