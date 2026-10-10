package com.ecotrack.repository;

import com.ecotrack.entity.Emission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EmissionRepository extends JpaRepository<Emission, Long> {

    List<Emission> findByUserIdOrderByRecordedDateDesc(Long userId);

    List<Emission> findByUserIdAndRecordedDateBetweenOrderByRecordedDateAsc(
            Long userId, LocalDate startDate, LocalDate endDate);

    List<Emission> findByUserIdAndRecordedDate(Long userId, LocalDate recordedDate);

    @Query("SELECT COALESCE(SUM(e.co2Kg), 0.0) FROM Emission e WHERE e.user.id = :userId AND e.recordedDate BETWEEN :startDate AND :endDate")
    Double sumCo2ByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category, COALESCE(SUM(e.co2Kg), 0.0) FROM Emission e WHERE e.user.id = :userId AND e.recordedDate BETWEEN :startDate AND :endDate GROUP BY e.category")
    List<Object[]> sumCo2GroupedByCategory(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    void deleteByUserId(Long userId);

    void deleteBySourceTypeAndSourceRefId(String sourceType, Long sourceRefId);
}
