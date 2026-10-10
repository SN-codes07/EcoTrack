package com.ecotrack.service;

import com.ecotrack.dto.AuthResponse;
import com.ecotrack.dto.LoginRequest;
import com.ecotrack.dto.RegisterRequest;
import com.ecotrack.dto.UserDto;
import com.ecotrack.entity.Achievement;
import com.ecotrack.entity.EcoGoal;
import com.ecotrack.entity.User;
import com.ecotrack.repository.AchievementRepository;
import com.ecotrack.repository.EcoGoalRepository;
import com.ecotrack.repository.UserRepository;
import com.ecotrack.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final EcoGoalRepository ecoGoalRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .city(request.getCity() != null && !request.getCity().isBlank() ? request.getCity().trim() : "Pune")
                .country(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry().trim() : "India")
                .monthlyCarbonBudgetKg(request.getMonthlyCarbonBudgetKg() != null ? request.getMonthlyCarbonBudgetKg() : 250.0)
                .carbonScore(78)
                .carbonStatus("IMPROVING")
                .totalEcoPoints(25)
                .ecoLevel("Eco Beginner")
                .currentStreakDays(1)
                .lastActivityDate(LocalDate.now())
                .darkMode(true)
                .anonymousLeaderboard(false)
                .build();

        User savedUser = userRepository.save(user);
        initializeDefaultGamificationForUser(savedUser);

        String jwt = tokenProvider.generateTokenFromUserIdAndEmail(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updatePreferences(Long userId, Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (updates.containsKey("city") && updates.get("city") != null) {
            user.setCity(String.valueOf(updates.get("city")).trim());
        }
        if (updates.containsKey("country") && updates.get("country") != null) {
            user.setCountry(String.valueOf(updates.get("country")).trim());
        }
        if (updates.containsKey("monthlyCarbonBudgetKg") && updates.get("monthlyCarbonBudgetKg") != null) {
            user.setMonthlyCarbonBudgetKg(Double.parseDouble(String.valueOf(updates.get("monthlyCarbonBudgetKg"))));
        }
        if (updates.containsKey("darkMode") && updates.get("darkMode") != null) {
            user.setDarkMode(Boolean.parseBoolean(String.valueOf(updates.get("darkMode"))));
        }
        if (updates.containsKey("anonymousLeaderboard") && updates.get("anonymousLeaderboard") != null) {
            user.setAnonymousLeaderboard(Boolean.parseBoolean(String.valueOf(updates.get("anonymousLeaderboard"))));
        }

        return UserDto.fromEntity(userRepository.save(user));
    }

    public void initializeDefaultGamificationForUser(User user) {
        if (!achievementRepository.findByUserIdOrderByUnlockedDescPointsRewardDesc(user.getId()).isEmpty()) {
            return;
        }

        List<Achievement> defaultBadges = List.of(
                Achievement.builder()
                        .user(user)
                        .badgeCode("SEVEN_DAY_STREAK")
                        .title("7-Day Eco Streak")
                        .description("Log low-carbon activities for 7 consecutive days.")
                        .iconName("Flame")
                        .category("STREAK")
                        .pointsReward(100)
                        .progressCurrent(1.0)
                        .progressTarget(7.0)
                        .unlocked(false)
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("LOW_CARBON_COMMUTER")
                        .title("Low-Carbon Commuter")
                        .description("Complete 10 sustainable transit, cycling, or walking trips.")
                        .iconName("Train")
                        .category("TRANSPORT")
                        .pointsReward(150)
                        .progressCurrent(0.0)
                        .progressTarget(10.0)
                        .unlocked(false)
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("TREE_SAVER")
                        .title("Forest Guardian")
                        .description("Save 50 kg of CO₂ through green transport and energy habits.")
                        .iconName("TreePine")
                        .category("IMPACT")
                        .pointsReward(200)
                        .progressCurrent(0.0)
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
                        .progressCurrent(0.0)
                        .progressTarget(15.0)
                        .unlocked(false)
                        .build(),
                Achievement.builder()
                        .user(user)
                        .badgeCode("PLANET_PROTECTOR")
                        .title("Planet Protector")
                        .description("Reach a Personal Carbon Score of 85+ and 500 Eco Points.")
                        .iconName("ShieldCheck")
                        .category("MILESTONE")
                        .pointsReward(300)
                        .progressCurrent(25.0)
                        .progressTarget(500.0)
                        .unlocked(false)
                        .build()
        );
        achievementRepository.saveAll(defaultBadges);

        EcoGoal defaultGoal = EcoGoal.builder()
                .user(user)
                .title("Reduce Monthly Carbon Footprint by 20%")
                .category("OVERALL")
                .targetReductionPct(20.0)
                .baselineCo2Kg(user.getMonthlyCarbonBudgetKg())
                .targetMaxCo2Kg(user.getMonthlyCarbonBudgetKg() * 0.8)
                .currentCo2Kg(0.0)
                .startDate(LocalDate.now().withDayOfMonth(1))
                .endDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()))
                .status("ON_TRACK")
                .build();
        ecoGoalRepository.save(defaultGoal);
    }
}
