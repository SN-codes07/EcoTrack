package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "eco_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EcoPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "action_code", nullable = false, length = 60)
    private String actionCode;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "category", nullable = false, length = 40)
    private String category;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Builder.Default
    @Column(name = "co2_saved_kg", nullable = false)
    private Double co2SavedKg = 0.0;

    @Column(name = "earned_date", nullable = false)
    private LocalDate earnedDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
