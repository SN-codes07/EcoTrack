package com.ecotrack.controller;

import com.ecotrack.dto.EcoGoalRequest;
import com.ecotrack.entity.Achievement;
import com.ecotrack.entity.EcoGoal;
import com.ecotrack.entity.EcoPoint;
import com.ecotrack.security.UserPrincipal;
import com.ecotrack.service.GamificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    // ------------------------------------------------------------------------
    // ECO GOALS
    // ------------------------------------------------------------------------
    @GetMapping("/goals")
    public ResponseEntity<List<EcoGoal>> getUserGoals(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(gamificationService.getUserGoals(currentUser.getId()));
    }

    @PostMapping("/goals")
    public ResponseEntity<EcoGoal> createGoal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody EcoGoalRequest request) {
        EcoGoal created = gamificationService.createGoal(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Map<String, String>> deleteGoal(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        gamificationService.deleteGoal(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Goal deleted successfully"));
    }

    // ------------------------------------------------------------------------
    // ECO POINTS (ECO JOURNAL & DAILY CHALLENGE)
    // ------------------------------------------------------------------------
    @GetMapping("/eco-points")
    public ResponseEntity<List<EcoPoint>> getEcoJournal(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(gamificationService.getEcoJournal(currentUser.getId()));
    }

    @PostMapping("/eco-points")
    public ResponseEntity<EcoPoint> logEcoAction(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> payload) {
        String actionCode = payload.get("actionCode") != null ? String.valueOf(payload.get("actionCode")) : "CUSTOM_ACTION";
        String title = payload.get("title") != null ? String.valueOf(payload.get("title")) : "Sustainable Habit Logged";
        String category = payload.get("category") != null ? String.valueOf(payload.get("category")) : "LIFESTYLE";
        int points = payload.get("points") != null ? Integer.parseInt(String.valueOf(payload.get("points"))) : 15;
        double co2SavedKg = payload.get("co2SavedKg") != null ? Double.parseDouble(String.valueOf(payload.get("co2SavedKg"))) : 1.5;

        EcoPoint saved = gamificationService.logCustomEcoAction(
                currentUser.getId(), actionCode, title, category, points, co2SavedKg);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ------------------------------------------------------------------------
    // ACHIEVEMENTS & LEADERBOARD
    // ------------------------------------------------------------------------
    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getUserAchievements(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(gamificationService.getUserAchievements(currentUser.getId()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(gamificationService.getCommunityLeaderboard(currentUser.getId()));
    }
}
