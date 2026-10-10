package com.ecotrack.repository;

import com.ecotrack.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByUserIdOrderByUnlockedDescPointsRewardDesc(Long userId);

    Optional<Achievement> findByUserIdAndBadgeCode(Long userId, String badgeCode);

    void deleteByUserId(Long userId);
}
