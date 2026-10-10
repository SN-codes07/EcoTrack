package com.ecotrack.repository;

import com.ecotrack.entity.EcoPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EcoPointRepository extends JpaRepository<EcoPoint, Long> {

    List<EcoPoint> findByUserIdOrderByEarnedDateDescCreatedAtDesc(Long userId);

    List<EcoPoint> findByUserIdAndEarnedDate(Long userId, LocalDate earnedDate);

    boolean existsByUserIdAndActionCodeAndEarnedDate(Long userId, String actionCode, LocalDate earnedDate);

    @Query("SELECT COALESCE(SUM(ep.points), 0) FROM EcoPoint ep WHERE ep.user.id = :userId")
    Integer sumTotalPointsByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(ep.co2SavedKg), 0.0) FROM EcoPoint ep WHERE ep.user.id = :userId")
    Double sumTotalCo2SavedByUserId(@Param("userId") Long userId);

    void deleteByUserId(Long userId);
}
