package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Builder.Default
    @Column(name = "role", nullable = false, length = 30)
    private String role = "ROLE_USER";

    @Builder.Default
    @Column(name = "city", length = 100)
    private String city = "Pune";

    @Builder.Default
    @Column(name = "country", length = 100)
    private String country = "India";

    @Builder.Default
    @Column(name = "monthly_carbon_budget_kg", nullable = false)
    private Double monthlyCarbonBudgetKg = 250.0;

    @Builder.Default
    @Column(name = "carbon_score", nullable = false)
    private Integer carbonScore = 75;

    @Builder.Default
    @Column(name = "carbon_status", nullable = false, length = 50)
    private String carbonStatus = "IMPROVING";

    @Builder.Default
    @Column(name = "total_eco_points", nullable = false)
    private Integer totalEcoPoints = 0;

    @Builder.Default
    @Column(name = "eco_level", nullable = false, length = 50)
    private String ecoLevel = "Eco Beginner";

    @Builder.Default
    @Column(name = "current_streak_days", nullable = false)
    private Integer currentStreakDays = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Builder.Default
    @Column(name = "dark_mode", nullable = false)
    private Boolean darkMode = true;

    @Builder.Default
    @Column(name = "anonymous_leaderboard", nullable = false)
    private Boolean anonymousLeaderboard = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
