package com.ecotrack.service;

import com.ecotrack.dto.ActivityRequest;
import com.ecotrack.dto.AuthResponse;
import com.ecotrack.dto.TripRequest;
import com.ecotrack.dto.UserDto;
import com.ecotrack.entity.*;
import com.ecotrack.repository.*;
import com.ecotrack.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DemoDataSeederService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final EmissionRepository emissionRepository;
    private final EcoGoalRepository ecoGoalRepository;
    private final EcoPointRepository ecoPointRepository;
    private final AchievementRepository achievementRepository;
    private final TripService tripService;
    private final ActivityService activityService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * One-click Demo Login + Seeder for Landing Page "Explore Demo" button.
     */
    @Transactional
    public AuthResponse loginAndSeedDemoAccount() {
        String demoEmail = "demo@ecotrack.io";
        User demoUser = userRepository.findByEmail(demoEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .fullName("Siddharth Nipane (Demo)")
                    .email(demoEmail)
                    .passwordHash(passwordEncoder.encode("demo123"))
                    .role("ROLE_USER")
                    .city("Pune")
                    .country("India")
                    .monthlyCarbonBudgetKg(240.0)
                    .carbonScore(82)
                    .carbonStatus("ECO_CHAMPION")
                    .totalEcoPoints(0)
                    .ecoLevel("Green Innovator")
                    .currentStreakDays(12)
                    .lastActivityDate(LocalDate.now())
                    .darkMode(true)
                    .anonymousLeaderboard(false)
                    .build();
            return userRepository.save(newUser);
        });

        seedDemoDataForUser(demoUser.getId());
        User refreshed = userRepository.findById(demoUser.getId()).orElseThrow();
        String token = jwtTokenProvider.generateTokenFromUserIdAndEmail(refreshed.getId(), refreshed.getEmail());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(refreshed))
                .build();
    }

    /**
     * Populates a user's account with 30 days of realistic vehicles, geo-coded trips,
     * multi-category activities, unified emissions ledger, eco goals, eco points, and achievements.
     */
    @Transactional
    public Map<String, Object> seedDemoDataForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Clear existing records for idempotent re-seeding during live presentations
        emissionRepository.deleteByUserId(userId);
        tripRepository.deleteByUserId(userId);
        activityRepository.deleteByUserId(userId);
        ecoPointRepository.deleteByUserId(userId);
        ecoGoalRepository.deleteByUserId(userId);
        achievementRepository.deleteByUserId(userId);
        vehicleRepository.deleteByUserId(userId);

        user.setTotalEcoPoints(120);
        user.setCurrentStreakDays(12);
        user.setMonthlyCarbonBudgetKg(240.0);
        userRepository.save(user);

        // 1. Seed 3 Vehicles
        Vehicle petrolCar = vehicleRepository.save(Vehicle.builder()
                .user(user)
                .nickname("Daily City Hatchback")
                .make("Hyundai")
                .model("i20 1.2L")
                .vehicleType("CAR_PETROL")
                .fuelType("PETROL")
                .fuelEfficiency(15.8)
                .fuelCostPerUnit(104.5)
                .emissionFactorKgPerKm(0.185)
                .isPrimary(true)
                .build());

        Vehicle evScooter = vehicleRepository.save(Vehicle.builder()
                .user(user)
                .nickname("Green Commuter EV")
                .make("Ather")
                .model("450X Gen 3")
                .vehicleType("E_BIKE")
                .fuelType("ELECTRIC")
                .fuelEfficiency(34.0)
                .fuelCostPerUnit(8.5)
                .emissionFactorKgPerKm(0.015)
                .isPrimary(false)
                .build());

        Vehicle roadCycle = vehicleRepository.save(Vehicle.builder()
                .user(user)
                .nickname("Weekend Hybrid Cycle")
                .make("Firefox")
                .model("Rapide 21S")
                .vehicleType("BICYCLE")
                .fuelType("NONE")
                .fuelEfficiency(0.0)
                .fuelCostPerUnit(0.0)
                .emissionFactorKgPerKm(0.0)
                .isPrimary(false)
                .build());

        // 2. Seed Achievements (some unlocked, some in progress)
        List<Achievement> achievements = List.of(
                Achievement.builder()
                        .user(user)
                        .badgeCode("SEVEN_DAY_STREAK")
                        .title("7-Day Eco Streak")
                        .description("Log low-carbon activities for 7 consecutive days.")
                        .iconName("Flame")
                        .category("STREAK")
                        .pointsReward(100)
                        .progressCurrent(7.0)
                        .progressTarget(7.0)
                        .unlocked(true)
                        .unlockedAt(LocalDateTime.now().minusDays(4))
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("LOW_CARBON_COMMUTER")
                        .title("Low-Carbon Commuter")
                        .description("Complete 10 sustainable transit, cycling, or walking trips.")
                        .iconName("Train")
                        .category("TRANSPORT")
                        .pointsReward(150)
                        .progressCurrent(10.0)
                        .progressTarget(10.0)
                        .unlocked(true)
                        .unlockedAt(LocalDateTime.now().minusDays(2))
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("TREE_SAVER")
                        .title("Forest Guardian")
                        .description("Save 50 kg of CO₂ through green transport and energy habits.")
                        .iconName("TreePine")
                        .category("IMPACT")
                        .pointsReward(200)
                        .progressCurrent(42.5)
                        .progressTarget(50.0)
                        .unlocked(false)
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("ZERO_WASTE_HERO")
                        .title("Zero-Waste Champion")
                        .description("Recycle or compost 15 kg of household waste.")
                        .iconName("Recycle")
                        .category("LIFESTYLE")
                        .pointsReward(120)
                        .progressCurrent(15.0)
                        .progressTarget(15.0)
                        .unlocked(true)
                        .unlockedAt(LocalDateTime.now().minusDays(6))
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("PLANET_PROTECTOR")
                        .title("Planet Protector")
                        .description("Reach a Personal Carbon Score of 85+ and 500 Eco Points.")
                        .iconName("ShieldCheck")
                        .category("MILESTONE")
                        .pointsReward(300)
                        .progressCurrent(380.0)
                        .progressTarget(500.0)
                        .unlocked(false)
                        .build()
        );
        achievementRepository.saveAll(achievements);

        // 3. Seed 30 days of Trips & Multi-Category Activities
        LocalDate today = LocalDate.now();
        int tripsCreated = 0;
        int activitiesCreated = 0;

        double[][] routes = new double[][]{
                // {originLat, originLng, destLat, destLng, distKm}
                {18.5204, 73.8567, 18.5913, 73.7389, 16.4}, // Shivajinagar -> Hinjewadi IT Park (HIGH/MEDIUM)
                {18.5074, 73.8077, 18.5284, 73.8739, 9.2},  // Kothrud -> Pune Station (Metro - LOW)
                {18.5590, 73.7868, 18.5362, 73.8940, 12.8}, // Baner -> Koregaon Park (EV/Bus - LOW/MEDIUM)
                {18.4966, 73.9417, 18.5679, 73.9143, 8.5},  // Hadapsar -> Viman Nagar
                {18.5314, 73.8446, 18.5196, 73.8553, 2.8}   // Deccan -> FC Road (Cycling/Walking - LOW)
        };
        String[][] routeNames = new String[][]{
                {"Shivajinagar", "Hinjewadi Phase 1"},
                {"Kothrud Depot", "Pune Junction"},
                {"Baner High Street", "Koregaon Park"},
                {"Magarpatta City", "Viman Nagar"},
                {"Deccan Gymkhana", "FC Road Campus"}
        };

        for (int d = 29; d >= 0; d--) {
            LocalDate date = today.minusDays(d);
            int idx = d % routes.length;

            // Choose mode showing clear progression toward greener transport in recent days
            String mode;
            Long vehicleId = null;
            int passengers = 1;

            if (d % 5 == 0) {
                mode = "CAR_PETROL";
                vehicleId = petrolCar.getId();
                passengers = (d % 10 == 0) ? 1 : 2;
            } else if (d % 5 == 1) {
                mode = "METRO";
            } else if (d % 5 == 2) {
                mode = "E_BIKE";
                vehicleId = evScooter.getId();
            } else if (d % 5 == 3) {
                mode = "BUS";
            } else {
                mode = "CYCLING";
                vehicleId = roadCycle.getId();
            }

            tripService.createTrip(userId, TripRequest.builder()
                    .vehicleId(vehicleId)
                    .transportMode(mode)
                    .originName(routeNames[idx][0])
                    .originLat(routes[idx][0])
                    .originLng(routes[idx][1])
                    .destinationName(routeNames[idx][1])
                    .destinationLat(routes[idx][2])
                    .destinationLng(routes[idx][3])
                    .distanceKm(routes[idx][4])
                    .passengers(passengers)
                    .tripDate(date)
                    .notes("Logged commute via " + mode)
                    .build());
            tripsCreated++;

            // Log Daily Electricity Activity
            if (d % 2 == 0) {
                activityService.createActivity(userId, ActivityRequest.builder()
                        .category("ELECTRICITY")
                        .activityType(d < 10 ? "SOLAR_ENERGY_KWH" : "GRID_ELECTRICITY_KWH")
                        .description(d < 10 ? "Rooftop Solar Power Usage" : "Household Grid Electricity")
                        .quantity(d < 10 ? 5.5 : 4.2)
                        .unit("kWh")
                        .activityDate(date)
                        .build());
                activitiesCreated++;
            } else {
                activityService.createActivity(userId, ActivityRequest.builder()
                        .category("ELECTRICITY")
                        .activityType("AC_USAGE_HOURS")
                        .description("Bedroom Inverter AC (24°C Eco Mode)")
                        .quantity(2.5)
                        .unit("hours")
                        .activityDate(date)
                        .build());
                activitiesCreated++;
            }

            // Log Daily Food Activity
            String mealType = (d % 6 == 0) ? "POULTRY_MEAL" : ((d % 2 == 0) ? "VEGETARIAN_MEAL" : "VEGAN_MEAL");
            activityService.createActivity(userId, ActivityRequest.builder()
                    .category("FOOD")
                    .activityType(mealType)
                    .description("Daily Meals (" + mealType.replace("_", " ").toLowerCase() + ")")
                    .quantity(2.0)
                    .unit("meals")
                    .activityDate(date)
                    .build());
            activitiesCreated++;

            // Log Waste / Water / Lifestyle periodically
            if (d % 3 == 0) {
                activityService.createActivity(userId, ActivityRequest.builder()
                        .category("WASTE")
                        .activityType(d % 6 == 0 ? "RECYCLED_WASTE_KG" : "COMPOSTED_WASTE_KG")
                        .description(d % 6 == 0 ? "Segregated Dry Recyclables" : "Home Kitchen Composting")
                        .quantity(1.8)
                        .unit("kg")
                        .activityDate(date)
                        .build());
                activitiesCreated++;
            }
            if (d % 4 == 0) {
                activityService.createActivity(userId, ActivityRequest.builder()
                        .category("WATER")
                        .activityType("WATER_LITERS")
                        .description("Low-Flow Aerator Household Water")
                        .quantity(135.0)
                        .unit("liters")
                        .activityDate(date)
                        .build());
                activitiesCreated++;
            }
            if (d % 7 == 0) {
                activityService.createActivity(userId, ActivityRequest.builder()
                        .category("LIFESTYLE")
                        .activityType("SECOND_HAND_ITEM")
                        .description("Pre-loved Book & Upcycled Accessories")
                        .quantity(1.0)
                        .unit("items")
                        .activityDate(date)
                        .build());
                activitiesCreated++;
            }
        }

        // 4. Seed Eco Goals
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());
        Double currentMonthCo2 = emissionRepository.sumCo2ByUserIdAndDateRange(userId, startOfMonth, today);

        List<EcoGoal> goals = List.of(
                EcoGoal.builder()
                        .user(user)
                        .title("Reduce Monthly Carbon Footprint by 20%")
                        .category("OVERALL")
                        .targetReductionPct(20.0)
                        .baselineCo2Kg(240.0)
                        .targetMaxCo2Kg(192.0)
                        .currentCo2Kg(Math.round((currentMonthCo2 != null ? currentMonthCo2 : 95.0) * 100.0) / 100.0)
                        .startDate(startOfMonth)
                        .endDate(endOfMonth)
                        .status("ON_TRACK")
                        .build(),
                EcoGoal.builder()
                        .user(user)
                        .title("Keep Transport Emissions Under 75 kg CO₂/mo")
                        .category("TRANSPORTATION")
                        .targetReductionPct(30.0)
                        .baselineCo2Kg(110.0)
                        .targetMaxCo2Kg(75.0)
                        .currentCo2Kg(42.8)
                        .startDate(startOfMonth)
                        .endDate(endOfMonth)
                        .status("ON_TRACK")
                        .build()
        );
        ecoGoalRepository.saveAll(goals);

        return Map.of(
                "status", "SUCCESS",
                "message", "Demo data seeded successfully with 30 days of realistic environmental history!",
                "vehiclesCreated", 3,
                "tripsCreated", tripsCreated,
                "activitiesCreated", activitiesCreated,
                "goalsCreated", goals.size(),
                "achievementsCreated", achievements.size()
        );
    }
}
