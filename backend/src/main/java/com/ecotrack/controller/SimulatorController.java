package com.ecotrack.controller;

import com.ecotrack.dto.SimulatorRequest;
import com.ecotrack.dto.SimulatorResponse;
import com.ecotrack.service.SimulatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final SimulatorService simulatorService;

    @PostMapping("/calculate")
    public ResponseEntity<SimulatorResponse> calculateSimulation(@RequestBody SimulatorRequest request) {
        return ResponseEntity.ok(simulatorService.simulateHabitChanges(request));
    }
}
