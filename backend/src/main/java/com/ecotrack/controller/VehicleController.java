package com.ecotrack.controller;

import com.ecotrack.dto.VehicleRequest;
import com.ecotrack.entity.Vehicle;
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
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final GamificationService gamificationService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getUserVehicles(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(gamificationService.getUserVehicles(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody VehicleRequest request) {
        Vehicle created = gamificationService.createVehicle(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteVehicle(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        gamificationService.deleteVehicle(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"));
    }
}
