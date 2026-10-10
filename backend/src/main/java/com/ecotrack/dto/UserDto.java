package com.ecotrack.dto;

import com.ecotrack.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String city;
    private String country;
    private Double monthlyCarbonBudgetKg;
    private Integer carbonScore;
    private String carbonStatus;
    private Integer totalEcoPoints;
    private String ecoLevel;
    private Integer currentStreakDays;
    private LocalDate lastActivityDate;
    private Boolean darkMode;
    private Boolean anonymousLeaderboard;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .city(user.getCity())
                .country(user.getCountry())
                .monthlyCarbonBudgetKg(user.getMonthlyCarbonBudgetKg())
                .carbonScore(user.getCarbonScore())
                .carbonStatus(user.getCarbonStatus())
                .totalEcoPoints(user.getTotalEcoPoints())
                .ecoLevel(user.getEcoLevel())
                .currentStreakDays(user.getCurrentStreakDays())
                .lastActivityDate(user.getLastActivityDate())
                .darkMode(user.getDarkMode())
                .anonymousLeaderboard(user.getAnonymousLeaderboard())
                .build();
    }
}
