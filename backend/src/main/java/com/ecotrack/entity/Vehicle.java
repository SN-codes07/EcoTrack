package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "nickname", nullable = false, length = 100)
    private String nickname;

    @Column(name = "make", nullable = false, length = 80)
    private String make;

    @Column(name = "model", nullable = false, length = 80)
    private String model;

    @Column(name = "vehicle_type", nullable = false, length = 50)
    private String vehicleType; // CAR_PETROL, CAR_DIESEL, CAR_EV, CAR_HYBRID, TWO_WHEELER, E_BIKE, BICYCLE

    @Column(name = "fuel_type", nullable = false, length = 30)
    private String fuelType; // PETROL, DIESEL, ELECTRIC, CNG, HYBRID, NONE

    @Column(name = "fuel_efficiency", nullable = false)
    private Double fuelEfficiency; // km per liter or km per kWh

    @Builder.Default
    @Column(name = "fuel_cost_per_unit", nullable = false)
    private Double fuelCostPerUnit = 104.0;

    @Column(name = "emission_factor_kg_per_km", nullable = false)
    private Double emissionFactorKgPerKm;

    @Builder.Default
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
