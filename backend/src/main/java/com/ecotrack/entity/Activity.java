package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "category", nullable = false, length = 40)
    private String category; // TRANSPORTATION, ELECTRICITY, FOOD, WASTE, WATER, LIFESTYLE

    @Column(name = "activity_type", nullable = false, length = 80)
    private String activityType;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Column(name = "emission_factor_used", nullable = false)
    private Double emissionFactorUsed;

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
    @Column(name = "is_sustainable_action", nullable = false)
    private Boolean isSustainableAction = false;

    @Builder.Default
    @Column(name = "eco_points_earned", nullable = false)
    private Integer ecoPointsEarned = 0;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
