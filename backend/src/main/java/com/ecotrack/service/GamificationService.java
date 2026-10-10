package com.ecotrack.service;

import com.ecotrack.config.EmissionFactorsConfig;
import com.ecotrack.dto.EcoGoalRequest;
import com.ecotrack.dto.VehicleRequest;
import com.ecotrack.entity.*;
import com.ecotrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final EcoGoalRepository ecoGoalRepository;
    private final EcoPointRepository ecoPointRepository;
    private final AchievementRepository achievementRepository;
    private final EmissionRepository emissionRepository;
    private final EmissionFactorsConfig factorsConfig;
    private final EmissionCalculationEngineService calculationEngine;

    // ------------------------------------------------------------------------
    // VEHICLES CRUD
    // ------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<Vehicle> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserIdOrderByIsPrimaryDescCreatedAtDesc(userId);
    }

    @Transactional
    public Vehicle createVehicle(Long userId, VehicleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String vType = request.getVehicleType().toUpperCase();
        String fType = request.getFuelType().toUpperCase();
        double factor = request.getEmissionFactorKgPerKm() != null && request.getEmissionFactorKgPerKm() >= 0
                ? request.getEmissionFactorKgPerKm()
                : factorsConfig.getTransportFactors().getOrDefault(vType, 0.171);

        double costPerUnit = request.getFuelCostPerUnit() != null && request.getFuelCostPerUnit() >= 0
                ? request.getFuelCostPerUnit()
                : ("ELECTRIC".equals(fType) ? 8.5 : ("DIESEL".equals(fType) ? 92.0 : 104.5));

        boolean isPrimary = Boolean.TRUE.equals(request.getIsPrimary());
        if (isPrimary) {
            List<Vehicle> existing = vehicleRepository.findByUserIdOrderByIsPrimaryDescCreatedAtDesc(userId);
            for (Vehicle v : existing) {
                v.setIsPrimary(false);
            }
            vehicleRepository.saveAll(existing);
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .nickname(request.getNickname().trim())
                .make(request.getMake().trim())
                .model(request.getModel().trim())
                .vehicleType(vType)
                .fuelType(fType)
                .fuelEfficiency(request.getFuelEfficiency())
                .fuelCostPerUnit(costPerUnit)
                .emissionFactorKgPerKm(factor)
                .isPrimary(isPrimary)
                .build();

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long userId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    // ------------------------------------------------------------------------
    // ECO GOALS CRUD
    // ------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<EcoGoal> getUserGoals(Long userId) {
        return ecoGoalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public EcoGoal createGoal(Long userId, EcoGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        double baseline = request.getBaselineCo2Kg() != null && request.getBaselineCo2Kg() > 0
                ? request.getBaselineCo2Kg()
                : user.getMonthlyCarbonBudgetKg();

        double reductionPct = request.getTargetReductionPct();
        double targetMax = Math.round(baseline * (1.0 - (reductionPct / 100.0)) * 100.0) / 100.0;

        LocalDate today = LocalDate.now();
        LocalDate start = request.getStartDate() != null ? request.getStartDate() : today.withDayOfMonth(1);
        LocalDate end = request.getEndDate() != null ? request.getEndDate() : today.withDayOfMonth(today.lengthOfMonth());

        Double monthCo2 = emissionRepository.sumCo2ByUserIdAndDateRange(userId, start, today);

        EcoGoal goal = EcoGoal.builder()
                .user(user)
                .title(request.getTitle().trim())
                .category(request.getCategory() != null ? request.getCategory().toUpperCase() : "OVERALL")
                .targetReductionPct(reductionPct)
                .baselineCo2Kg(baseline)
                .targetMaxCo2Kg(targetMax)
                .currentCo2Kg(monthCo2 != null ? Math.round(monthCo2 * 100.0) / 100.0 : 0.0)
                .startDate(start)
                .endDate(end)
                .status("ON_TRACK")
                .build();

        return ecoGoalRepository.save(goal);
    }

    @Transactional
    public void deleteGoal(Long userId, Long goalId) {
        EcoGoal goal = ecoGoalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("EcoGoal not found"));
        if (!goal.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this goal");
        }
        ecoGoalRepository.delete(goal);
    }

    // ------------------------------------------------------------------------
    // ECO POINTS, JOURNAL & DAILY CHALLENGE
    // ------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<EcoPoint> getEcoJournal(Long userId) {
        return ecoPointRepository.findByUserIdOrderByEarnedDateDescCreatedAtDesc(userId);
    }

    @Transactional
    public EcoPoint logCustomEcoAction(Long userId, String actionCode, String title, String category, int points, double co2SavedKg) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDate today = LocalDate.now();
        if (actionCode != null && actionCode.startsWith("CHALLENGE_")
                && ecoPointRepository.existsByUserIdAndActionCodeAndEarnedDate(userId, actionCode, today)) {
            throw new IllegalArgumentException("Today's Eco Challenge has already been completed!");
        }

        EcoPoint point = EcoPoint.builder()
                .user(user)
                .actionCode(actionCode != null ? actionCode : "CUSTOM_ECO_HABIT")
                .title(title != null ? title : "Completed Sustainable Action")
                .category(category != null ? category.toUpperCase() : "LIFESTYLE")
                .points(points > 0 ? points : 15)
                .co2SavedKg(co2SavedKg >= 0 ? co2SavedKg : 1.5)
                .earnedDate(today)
                .build();

        EcoPoint saved = ecoPointRepository.save(point);

        user.setTotalEcoPoints(user.getTotalEcoPoints() + saved.getPoints());
        user.setEcoLevel(calculationEngine.determineEcoLevel(user.getTotalEcoPoints()));
        user.setCarbonScore(Math.min(99, user.getCarbonScore() + 2));
        user.setCarbonStatus(calculationEngine.determineCarbonStatus(user.getCarbonScore()));
        userRepository.save(user);

        // Update Planet Protector achievement progress
        achievementRepository.findByUserIdAndBadgeCode(userId, "PLANET_PROTECTOR").ifPresent(badge -> {
            badge.setProgressCurrent((double) user.getTotalEcoPoints());
            if (!badge.getUnlocked() && badge.getProgressCurrent() >= badge.getProgressTarget()) {
                badge.setUnlocked(true);
                badge.setUnlockedAt(LocalDateTime.now());
            }
            achievementRepository.save(badge);
        });

        return saved;
    }

    // ------------------------------------------------------------------------
    // ACHIEVEMENTS & LEADERBOARD
    // ------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<Achievement> getUserAchievements(Long userId) {
        return achievementRepository.findByUserIdOrderByUnlockedDescPointsRewardDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCommunityLeaderboard(Long currentUserId) {
        List<User> topUsers = userRepository.findTop10ByOrderByTotalEcoPointsDesc();
        List<Map<String, Object>> leaderboard = new ArrayList<>();

        int rank = 1;
        for (User u : topUsers) {
            boolean isSelf = u.getId().equals(currentUserId);
            String displayName = (Boolean.TRUE.equals(u.getAnonymousLeaderboard()) && !isSelf)
                    ? "Eco Warrior #" + (100 + u.getId())
                    : u.getFullName();

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("rank", rank++);
            row.put("displayName", displayName);
            row.put("city", u.getCity());
            row.put("carbonScore", u.getCarbonScore());
            row.put("totalEcoPoints", u.getTotalEcoPoints());
            row.put("ecoLevel", u.getEcoLevel());
            row.put("streakDays", u.getCurrentStreakDays());
            row.put("isCurrentUser", isSelf);
            leaderboard.add(row);
        }

        // Add synthetic community peers if fewer than 5 users exist in DB so leaderboard always looks lively
        if (leaderboard.size() < 5) {
            List<Map<String, Object>> samplePeers = List.of(
                    Map.of("displayName", "Aarav Kulkarni", "city", "Pune", "carbonScore", 91, "totalEcoPoints", 920, "ecoLevel", "Climate Guardian", "streakDays", 19, "isCurrentUser", false),
                    Map.of("displayName", "Meera Nair", "city", "Bengaluru", "carbonScore", 87, "totalEcoPoints", 740, "ecoLevel", "Climate Guardian", "streakDays", 14, "isCurrentUser", false),
                    Map.of("displayName", "Eco Warrior #142", "city", "Mumbai", "carbonScore", 83, "totalEcoPoints", 580, "ecoLevel", "Green Innovator", "streakDays", 11, "isCurrentUser", false),
                    Map.of("displayName", "Rohan Deshmukh", "city", "Pune", "carbonScore", 76, "totalEcoPoints", 410, "ecoLevel", "Green Innovator", "streakDays", 7, "isCurrentUser", false)
            );
            for (Map<String, Object> peer : samplePeers) {
                Map<String, Object> copy = new LinkedHashMap<>(peer);
                copy.put("rank", 0);
                leaderboard.add(copy);
            }
            leaderboard.sort((a, b) -> Integer.compare((int) b.get("totalEcoPoints"), (int) a.get("totalEcoPoints")));
            for (int i = 0; i < leaderboard.size(); i++) {
                leaderboard.get(i).put("rank", i + 1);
            }
        }

        return leaderboard;
    }
}
