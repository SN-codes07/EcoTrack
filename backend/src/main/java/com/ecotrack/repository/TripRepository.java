package com.ecotrack.repository;

import com.ecotrack.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByUserIdOrderByTripDateDescCreatedAtDesc(Long userId);

    List<Trip> findByUserIdAndTripDateBetweenOrderByTripDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    List<Trip> findByUserIdAndTripDate(Long userId, LocalDate tripDate);

    void deleteByUserId(Long userId);
}
