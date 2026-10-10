package com.ecotrack.service;

import com.ecotrack.dto.ActivityRequest;
import com.ecotrack.entity.Activity;
import com.ecotrack.entity.EcoPoint;
import com.ecotrack.entity.Emission;
import com.ecotrack.entity.User;
import com.ecotrack.repository.*;
import com.ecotrack.service.EmissionCalculationEngineService.ActivityCalculationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final EmissionRepository emissionRepository;
    private final EcoPointRepository ecoPointRepository;
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationEngineService calculationEngine;

    @Transactional
    public Activity createActivity(Long userId, ActivityRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String resolvedUnit = request.getUnit() != null && !request.getUnit().isBlank()
                ? request.getUnit().trim()
                : resolveDefaultUnit(request.getCategory(), request.getActivityType());

        ActivityCalculationResult calc = calculationEngine.calculateActivityImpact(
                request.getCategory(),
                request.getActivityType(),
                request.getQuantity(),
                resolvedUnit
        );

        LocalDate activityDate = request.getActivityDate() != null ? request.getActivityDate() : LocalDate.now();
        String description = (request.getDescription() != null && !request.getDescription().isBlank())
                ? request.getDescription().trim()
                : formatActivityLabel(calc.getActivityType()) + " (" + calc.getQuantity() + " " + calc.getUnit() + ")";

        Activity activity = Activity.builder()
                .user(user)
                .category(calc.getCategory())
                .activityType(calc.getActivityType())
                .description(description)
                .quantity(calc.getQuantity())
                .unit(calc.getUnit())
                .emissionFactorUsed(calc.getEmissionFactorUsed())
                .co2Kg(calc.getCo2Kg())
                .pm25G(calc.getPm25G())
                .noxG(calc.getNoxG())
                .coG(calc.getCoG())
                .isSustainableAction(calc.isSustainableAction())
                .ecoPointsEarned(calc.getEcoPointsAwarded())
                .activityDate(activityDate)
                .build();

        Activity savedActivity = activityRepository.save(activity);

        // Save unified ledger entry in `emissions` table
        Emission emission = Emission.builder()
                .user(user)
                .sourceType("ACTIVITY")
                .sourceRefId(savedActivity.getId())
                .category(calc.getCategory())
                .co2Kg(calc.getCo2Kg())
                .pm25G(calc.getPm25G())
                .noxG(calc.getNoxG())
                .coG(calc.getCoG())
                .distanceKm(0.0)
                .fuelConsumed(0.0)
                .treesRequired(calc.getTreesRequired())
                .recordedDate(activityDate)
                .build();
        emissionRepository.save(emission);

        // Log Eco Points if sustainable action
        if (calc.isSustainableAction() && calc.getEcoPointsAwarded() > 0) {
            double estimatedSavedKg = Math.round(calc.getQuantity() * 0.45 * 100.0) / 100.0;
            EcoPoint ecoPoint = EcoPoint.builder()
                    .user(user)
                    .actionCode(calc.getActivityType())
                    .title(description)
                    .category(calc.getCategory())
                    .points(calc.getEcoPointsAwarded())
                    .co2SavedKg(estimatedSavedKg)
                    .earnedDate(activityDate)
                    .build();
            ecoPointRepository.save(ecoPoint);

            user.setTotalEcoPoints(user.getTotalEcoPoints() + calc.getEcoPointsAwarded());
            user.setEcoLevel(calculationEngine.determineEcoLevel(user.getTotalEcoPoints()));

            if ("WASTE".equals(calc.getCategory())) {
                incrementAchievementProgress(userId, "ZERO_WASTE_HERO", calc.getQuantity());
            }
            incrementAchievementProgress(userId, "TREE_SAVER", estimatedSavedKg);
        }

        user.setLastActivityDate(LocalDate.now());
        userRepository.save(user);

        return savedActivity;
    }

    @Transactional(readOnly = true)
    public List<Activity> getUserActivities(Long userId, String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return activityRepository.findByUserIdAndCategoryOrderByActivityDateDesc(userId, category.toUpperCase());
        }
        return activityRepository.findByUserIdOrderByActivityDateDescCreatedAtDesc(userId);
    }

    @Transactional
    public void deleteActivity(Long userId, Long activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        if (!activity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this activity");
        }
        emissionRepository.deleteBySourceTypeAndSourceRefId("ACTIVITY", activityId);
        activityRepository.delete(activity);
    }

    private String resolveDefaultUnit(String category, String activityType) {
        if (activityType == null) return "units";
        String upper = activityType.toUpperCase();
        if (upper.endsWith("_KWH")) return "kWh";
        if (upper.endsWith("_HOURS")) return "hours";
        if (upper.endsWith("_MEAL") || upper.endsWith("_SERVING")) return "meals";
        if (upper.endsWith("_KG")) return "kg";
        if (upper.endsWith("_LITERS")) return "liters";
        if (upper.endsWith("_MINUTES")) return "mins";
        return "items";
    }

    private String formatActivityLabel(String activityType) {
        return activityType.replace("_", " ");
    }

    private void incrementAchievementProgress(Long userId, String badgeCode, double delta) {
        achievementRepository.findByUserIdAndBadgeCode(userId, badgeCode).ifPresent(badge -> {
            double next = Math.min(badge.getProgressTarget(), badge.getProgressCurrent() + delta);
            badge.setProgressCurrent(Math.round(next * 100.0) / 100.0);
            if (!badge.getUnlocked() && badge.getProgressCurrent() >= badge.getProgressTarget()) {
                badge.setUnlocked(true);
                badge.setUnlockedAt(LocalDateTime.now());
            }
            achievementRepository.save(badge);
        });
    }
}
