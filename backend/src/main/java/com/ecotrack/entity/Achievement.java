package com.ecotrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "achievements",
    uniqueConstraints = @UniqueConstraint(name = "uk_user_badge", columnNames = {"user_id", "badge_code"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "badge_code", nullable = false, length = 60)
    private String badgeCode;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "icon_name", nullable = false, length = 50)
    private String iconName;

    @Column(name = "category", nullable = false, length = 40)
    private String category;

    @Builder.Default
    @Column(name = "points_reward", nullable = false)
    private Integer pointsReward = 50;

    @Builder.Default
    @Column(name = "progress_current", nullable = false)
    private Double progressCurrent = 0.0;

    @Builder.Default
    @Column(name = "progress_target", nullable = false)
    private Double progressTarget = 1.0;

    @Builder.Default
    @Column(name = "unlocked", nullable = false)
    private Boolean unlocked = false;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
