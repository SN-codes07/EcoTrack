package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "eco_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EcoGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Builder.Default
    @Column(name = "category", nullable = false, length = 40)
    private String category = "OVERALL";

    @Builder.Default
    @Column(name = "target_reduction_pct", nullable = false)
    private Double targetReductionPct = 20.0;

    @Column(name = "baseline_co2_kg", nullable = false)
    private Double baselineCo2Kg;

    @Column(name = "target_max_co2_kg", nullable = false)
    private Double targetMaxCo2Kg;

    @Builder.Default
    @Column(name = "current_co2_kg", nullable = false)
    private Double currentCo2Kg = 0.0;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30)
    private String status = "ON_TRACK"; // ON_TRACK, AT_RISK, COMPLETED, EXCEEDED

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
