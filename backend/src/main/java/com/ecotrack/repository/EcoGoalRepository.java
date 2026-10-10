package com.ecotrack.repository;

import com.ecotrack.entity.EcoGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EcoGoalRepository extends JpaRepository<EcoGoal, Long> {

    List<EcoGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}
