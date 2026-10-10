package com.ecotrack.repository;

import com.ecotrack.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByUserIdOrderByIsPrimaryDescCreatedAtDesc(Long userId);

    Optional<Vehicle> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);
}
