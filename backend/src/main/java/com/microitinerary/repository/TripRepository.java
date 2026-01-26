package com.microitinerary.repository;

import com.microitinerary.domain.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    List<Trip> findByAnnualPlanId(UUID annualPlanId);

    List<Trip> findByAnnualPlanIdOrderByStartDate(UUID annualPlanId);

    // Find trips for a specific month
    @Query("SELECT t FROM Trip t WHERE t.annualPlanId = :planId " +
            "AND (MONTH(t.startDate) = :month OR MONTH(t.endDate) = :month)")
    List<Trip> findByAnnualPlanIdAndMonth(@Param("planId") UUID planId, @Param("month") int month);

    // Find trips within a date range
    @Query("SELECT t FROM Trip t WHERE t.annualPlanId = :planId " +
            "AND t.startDate >= :startDate AND t.endDate <= :endDate")
    List<Trip> findByAnnualPlanIdAndDateRange(
            @Param("planId") UUID planId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find all trips where user is a member
    @Query("SELECT t FROM Trip t JOIN TripMember tm ON t.id = tm.tripId " +
            "WHERE tm.userId = :userId ORDER BY t.startDate")
    List<Trip> findTripsWhereUserIsMember(@Param("userId") UUID userId);

    // Count trips in a plan
    long countByAnnualPlanId(UUID annualPlanId);
}
