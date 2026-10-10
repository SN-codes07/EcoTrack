package com.ecotrack.service;

import com.ecotrack.dto.TripRequest;
import com.ecotrack.entity.*;
import com.ecotrack.repository.*;
import com.ecotrack.service.EmissionCalculationEngineService.TransportOptionComparison;
import com.ecotrack.service.EmissionCalculationEngineService.TripCalculationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final EmissionRepository emissionRepository;
    private final EcoPointRepository ecoPointRepository;
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;
    private final EmissionCalculationEngineService calculationEngine;

    @Transactional
    public Trip createTrip(Long userId, TripRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Vehicle vehicle = null;
        Double customEfficiency = request.getCustomFuelEfficiency();
        Double customFuelCost = null;
        Double customVehicleFactor = null;
        String fuelType = request.getFuelType();

        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndUserId(request.getVehicleId(), userId).orElse(null);
            if (vehicle != null) {
                if (customEfficiency == null) {
                    customEfficiency = vehicle.getFuelEfficiency();
                }
                customFuelCost = vehicle.getFuelCostPerUnit();
                customVehicleFactor = vehicle.getEmissionFactorKgPerKm();
                if (fuelType == null || fuelType.isBlank()) {
                    fuelType = vehicle.getFuelType();
                }
            }
        }

        int passengers = request.getPassengers() != null && request.getPassengers() > 0 ? request.getPassengers() : 1;

        TripCalculationResult calc = calculationEngine.calculateTripImpact(
                request.getTransportMode(),
                fuelType,
                request.getDistanceKm(),
                passengers,
                customEfficiency,
                customFuelCost,
                customVehicleFactor
        );

        LocalDate tripDate = request.getTripDate() != null ? request.getTripDate() : LocalDate.now();
        int durationMins = request.getDurationMinutes() != null && request.getDurationMinutes() > 0
                ? request.getDurationMinutes()
                : calculationEngine.estimateDurationMinutes(calc.getTransportMode(), request.getDistanceKm());

        // Resolve default Pune/Indian city coordinates if not provided so Eco Map always renders routes
        Double origLat = request.getOriginLat() != null ? request.getOriginLat() : 18.5204;
        Double origLng = request.getOriginLng() != null ? request.getOriginLng() : 73.8567;
        Double destLat = request.getDestinationLat() != null ? request.getDestinationLat() : 18.5642;
        Double destLng = request.getDestinationLng() != null ? request.getDestinationLng() : 73.7769;

        Trip trip = Trip.builder()
                .user(user)
                .vehicle(vehicle)
                .transportMode(calc.getTransportMode())
                .fuelType(calc.getFuelType())
                .originName(request.getOriginName().trim())
                .originLat(origLat)
                .originLng(origLng)
                .destinationName(request.getDestinationName().trim())
                .destinationLat(destLat)
                .destinationLng(destLng)
                .distanceKm(calc.getDistanceKm())
                .durationMinutes(durationMins)
                .passengers(calc.getPassengers())
                .fuelEfficiencyUsed(calc.getFuelEfficiencyUsed())
                .fuelConsumed(calc.getFuelConsumed())
                .fuelCost(calc.getFuelCost())
                .co2Kg(calc.getCo2Kg())
                .pm25G(calc.getPm25G())
                .noxG(calc.getNoxG())
                .coG(calc.getCoG())
                .severityLevel(calc.getSeverityLevel())
                .tripDate(tripDate)
                .notes(request.getNotes())
                .build();

        Trip savedTrip = tripRepository.save(trip);

        // Save unified ledger entry in `emissions` table
        Emission emission = Emission.builder()
                .user(user)
                .sourceType("TRIP")
                .sourceRefId(savedTrip.getId())
                .category("TRANSPORTATION")
                .co2Kg(calc.getCo2Kg())
                .pm25G(calc.getPm25G())
                .noxG(calc.getNoxG())
                .coG(calc.getCoG())
                .distanceKm(calc.getDistanceKm())
                .fuelConsumed(calc.getFuelConsumed())
                .treesRequired(calc.getTreesRequired())
                .recordedDate(tripDate)
                .build();
        emissionRepository.save(emission);

        // Award Eco Points for sustainable transit / zero-emission travel
        if (calc.isSustainableMode() && calc.getEcoPointsAwarded() > 0) {
            double carEquivalentCo2 = request.getDistanceKm() * 0.192;
            double savedCo2 = Math.max(0.0, Math.round((carEquivalentCo2 - calc.getCo2Kg()) * 100.0) / 100.0);

            EcoPoint pointEntry = EcoPoint.builder()
                    .user(user)
                    .actionCode("GREEN_TRANSIT_" + calc.getTransportMode())
                    .title("Used " + calculationEngine.formatModeLabel(calc.getTransportMode())
                            + " (" + request.getOriginName() + " → " + request.getDestinationName() + ")")
                    .category("TRANSPORT")
                    .points(calc.getEcoPointsAwarded())
                    .co2SavedKg(savedCo2)
                    .earnedDate(tripDate)
                    .build();
            ecoPointRepository.save(pointEntry);

            user.setTotalEcoPoints(user.getTotalEcoPoints() + calc.getEcoPointsAwarded());
            user.setEcoLevel(calculationEngine.determineEcoLevel(user.getTotalEcoPoints()));
            incrementAchievementProgress(userId, "LOW_CARBON_COMMUTER", 1.0);
            incrementAchievementProgress(userId, "TREE_SAVER", savedCo2);
        }

        user.setLastActivityDate(LocalDate.now());
        userRepository.save(user);

        return savedTrip;
    }

    @Transactional(readOnly = true)
    public List<Trip> getUserTrips(Long userId) {
        return tripRepository.findByUserIdOrderByTripDateDescCreatedAtDesc(userId);
    }

    @Transactional
    public void deleteTrip(Long userId, Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        if (!trip.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this trip");
        }
        emissionRepository.deleteBySourceTypeAndSourceRefId("TRIP", tripId);
        tripRepository.delete(trip);
    }

    public List<TransportOptionComparison> compareAlternatives(
            String selectedMode,
            double distanceKm,
            int passengers) {
        return calculationEngine.compareTransportAlternatives(selectedMode, distanceKm, passengers);
    }

    public Map<String, Object> calculateSmartRouteEstimate(
            String origin,
            String destination,
            Double originLat,
            Double originLng,
            Double destLat,
            Double destLng,
            Double manualDistanceKm,
            int passengers) {

        double distanceKm;
        if (manualDistanceKm != null && manualDistanceKm > 0) {
            distanceKm = manualDistanceKm;
        } else if (originLat != null && originLng != null && destLat != null && destLng != null) {
            // Haversine formula with 1.28 road winding factor
            distanceKm = calculateHaversineRoadDistanceKm(originLat, originLng, destLat, destLng);
        } else {
            distanceKm = 14.5;
        }

        List<TransportOptionComparison> options = calculationEngine.compareTransportAlternatives(
                "CAR_PETROL", distanceKm, passengers);

        TransportOptionComparison lowestCarbonOption = options.isEmpty() ? null : options.get(0);

        Map<String, Object> result = new HashMap<>();
        result.put("origin", origin);
        result.put("destination", destination);
        result.put("distanceKm", Math.round(distanceKm * 100.0) / 100.0);
        result.put("passengers", passengers);
        result.put("lowestCarbonOption", lowestCarbonOption);
        result.put("transportOptions", options);
        return result;
    }

    private double calculateHaversineRoadDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double straightLineKm = EARTH_RADIUS_KM * c;
        return Math.max(1.0, Math.round(straightLineKm * 1.28 * 100.0) / 100.0);
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
