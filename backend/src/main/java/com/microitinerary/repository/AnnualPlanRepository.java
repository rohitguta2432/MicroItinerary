package com.microitinerary.repository;

import com.microitinerary.domain.AnnualPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnnualPlanRepository extends JpaRepository<AnnualPlan, UUID> {

    List<AnnualPlan> findByUserId(UUID userId);

    List<AnnualPlan> findByUserIdOrderByYearDesc(UUID userId);

    Optional<AnnualPlan> findByUserIdAndYear(UUID userId, Integer year);

    boolean existsByUserIdAndYear(UUID userId, Integer year);
}
