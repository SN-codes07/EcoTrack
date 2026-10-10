package com.ecotrack.controller;

import com.ecotrack.dto.AuthResponse;
import com.ecotrack.security.UserPrincipal;
import com.ecotrack.service.DemoDataSeederService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DemoController {

    private final DemoDataSeederService demoDataSeederService;

    /**
     * Seeds realistic 30-day sample data for the currently authenticated user.
     * Powers the "Load Demo Data" button inside the dashboard.
     */
    @PostMapping("/demo/seed")
    public ResponseEntity<Map<String, Object>> seedDemoDataForCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(demoDataSeederService.seedDemoDataForUser(currentUser.getId()));
    }

    /**
     * Public one-click Demo Login + Seeder endpoint for the Landing Page "Explore Demo" button.
     */
    @PostMapping("/auth/demo-login")
    public ResponseEntity<AuthResponse> demoLoginAndSeed() {
        return ResponseEntity.ok(demoDataSeederService.loginAndSeedDemoAccount());
    }
}
