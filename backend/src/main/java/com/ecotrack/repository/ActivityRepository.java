package com.ecotrack.repository;

import com.ecotrack.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUserIdOrderByActivityDateDescCreatedAtDesc(Long userId);

    List<Activity> findByUserIdAndActivityDateBetweenOrderByActivityDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    List<Activity> findByUserIdAndCategoryOrderByActivityDateDesc(Long userId, String category);

    List<Activity> findByUserIdAndActivityDate(Long userId, LocalDate activityDate);

    void deleteByUserId(Long userId);
}
