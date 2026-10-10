package com.ecotrack.controller;

import com.ecotrack.dto.ActivityRequest;
import com.ecotrack.entity.Activity;
import com.ecotrack.security.UserPrincipal;
import com.ecotrack.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<Activity>> getUserActivities(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(activityService.getUserActivities(currentUser.getId(), category));
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ActivityRequest request) {
        Activity created = activityService.createActivity(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        activityService.deleteActivity(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Activity deleted successfully"));
    }
}
