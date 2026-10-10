package com.ecotrack.controller;

import com.ecotrack.dto.TripRequest;
import com.ecotrack.entity.Trip;
import com.ecotrack.security.UserPrincipal;
import com.ecotrack.service.EmissionCalculationEngineService.TransportOptionComparison;
import com.ecotrack.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<List<Trip>> getUserTrips(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(tripService.getUserTrips(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TripRequest request) {
        Trip created = tripService.createTrip(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTrip(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {
        tripService.deleteTrip(currentUser.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Trip deleted successfully"));
    }

    @GetMapping("/compare")
    public ResponseEntity<List<TransportOptionComparison>> compareAlternatives(
            @RequestParam(defaultValue = "CAR_PETROL") String selectedMode,
            @RequestParam(defaultValue = "15.0") double distanceKm,
            @RequestParam(defaultValue = "1") int passengers) {
        return ResponseEntity.ok(tripService.compareAlternatives(selectedMode, distanceKm, passengers));
    }

    @GetMapping("/route-estimate")
    public ResponseEntity<Map<String, Object>> estimateSmartRoute(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) Double originLat,
            @RequestParam(required = false) Double originLng,
            @RequestParam(required = false) Double destLat,
            @RequestParam(required = false) Double destLng,
            @RequestParam(required = false) Double distanceKm,
            @RequestParam(defaultValue = "1") int passengers) {
        return ResponseEntity.ok(tripService.calculateSmartRouteEstimate(
                origin, destination, originLat, originLng, destLat, destLng, distanceKm, passengers));
    }
}
