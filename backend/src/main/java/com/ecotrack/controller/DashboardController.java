package com.ecotrack.controller;

import com.ecotrack.dto.DashboardSummaryResponse;
import com.ecotrack.dto.DashboardSummaryResponse.AmbientEnvironmentData;
import com.ecotrack.security.UserPrincipal;
import com.ecotrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(currentUser.getId()));
    }

    @GetMapping("/ambient")
    public ResponseEntity<AmbientEnvironmentData> getAmbientEnvironment(
            @RequestParam(defaultValue = "Pune") String city) {
        return ResponseEntity.ok(dashboardService.fetchAmbientEnvironmentForCity(city));
    }
}
