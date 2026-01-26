package com.microitinerary.service;

import com.microitinerary.domain.*;
import com.microitinerary.dto.AnnualPlanDtos.*;
import com.microitinerary.dto.TripDtos.*;
import com.microitinerary.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Service for managing Annual Plans
 */
@Service
public class AnnualPlanService {

    private final AnnualPlanRepository annualPlanRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;

    public AnnualPlanService(
            AnnualPlanRepository annualPlanRepository,
            TripRepository tripRepository,
            ExpenseRepository expenseRepository) {
        this.annualPlanRepository = annualPlanRepository;
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Get all annual plans for a user
     */
    public List<AnnualPlanSummaryResponse> getUserPlans(UUID userId) {
        return annualPlanRepository.findByUserIdOrderByYearDesc(userId).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get annual plan by ID
     */
    public Optional<AnnualPlanDetailResponse> getPlanById(UUID planId, UUID userId) {
        return annualPlanRepository.findById(planId)
                .filter(plan -> plan.getUserId().equals(userId))
                .map(this::toDetailResponse);
    }

    /**
     * Create a new annual plan
     */
    @Transactional
    public AnnualPlanSummaryResponse createPlan(UUID userId, CreateAnnualPlanRequest request) {
        // Check if plan already exists for this year
        if (annualPlanRepository.existsByUserIdAndYear(userId, request.year())) {
            throw new RuntimeException("Annual plan for year " + request.year() + " already exists");
        }

        AnnualPlan plan = new AnnualPlan(
                userId,
                request.year(),
                request.name(),
                request.totalBudget() != null ? request.totalBudget() : BigDecimal.ZERO);

        plan = annualPlanRepository.save(plan);
        return toSummaryResponse(plan);
    }

    /**
     * Update an annual plan
     */
    @Transactional
    public Optional<AnnualPlanSummaryResponse> updatePlan(UUID planId, UUID userId, UpdateAnnualPlanRequest request) {
        return annualPlanRepository.findById(planId)
                .filter(plan -> plan.getUserId().equals(userId))
                .map(plan -> {
                    if (request.name() != null) {
                        plan.setName(request.name());
                    }
                    if (request.totalBudget() != null) {
                        plan.setTotalBudget(request.totalBudget());
                    }
                    return toSummaryResponse(annualPlanRepository.save(plan));
                });
    }

    /**
     * Delete an annual plan
     */
    @Transactional
    public boolean deletePlan(UUID planId, UUID userId) {
        return annualPlanRepository.findById(planId)
                .filter(plan -> plan.getUserId().equals(userId))
                .map(plan -> {
                    annualPlanRepository.delete(plan);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Get calendar view for an annual plan (12 months)
     */
    public Optional<CalendarViewResponse> getCalendarView(UUID planId, UUID userId) {
        return annualPlanRepository.findById(planId)
                .filter(plan -> plan.getUserId().equals(userId))
                .map(plan -> {
                    List<Trip> trips = tripRepository.findByAnnualPlanIdOrderByStartDate(planId);

                    // Group trips by month
                    Map<Integer, List<Trip>> tripsByMonth = trips.stream()
                            .collect(Collectors.groupingBy(t -> t.getStartDate().getMonthValue()));

                    // Build month data for all 12 months
                    List<MonthData> months = IntStream.rangeClosed(1, 12)
                            .mapToObj(month -> {
                                List<TripSummaryResponse> monthTrips = tripsByMonth
                                        .getOrDefault(month, Collections.emptyList())
                                        .stream()
                                        .map(this::toTripSummary)
                                        .collect(Collectors.toList());

                                String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                                return new MonthData(month, monthName, monthTrips);
                            })
                            .collect(Collectors.toList());

                    // Calculate totals
                    BigDecimal plannedCost = trips.stream()
                            .map(Trip::getEstimatedCost)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new CalendarViewResponse(
                            plan.getYear(),
                            plan.getTotalBudget(),
                            plannedCost,
                            months);
                });
    }

    /**
     * Get or create annual plan for current year
     */
    @Transactional
    public AnnualPlanSummaryResponse getOrCreateCurrentYearPlan(UUID userId) {
        int currentYear = java.time.Year.now().getValue();

        return annualPlanRepository.findByUserIdAndYear(userId, currentYear)
                .map(this::toSummaryResponse)
                .orElseGet(() -> {
                    CreateAnnualPlanRequest request = new CreateAnnualPlanRequest(
                            currentYear,
                            "My " + currentYear + " Travel Plan",
                            BigDecimal.ZERO);
                    return createPlan(userId, request);
                });
    }

    // ==================== Helper Methods ====================

    private AnnualPlanSummaryResponse toSummaryResponse(AnnualPlan plan) {
        List<Trip> trips = tripRepository.findByAnnualPlanId(plan.getId());

        BigDecimal plannedCost = trips.stream()
                .map(Trip::getEstimatedCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal actualCost = trips.stream()
                .map(trip -> expenseRepository.sumByTripId(trip.getId()))
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new AnnualPlanSummaryResponse(
                plan.getId(),
                plan.getYear(),
                plan.getName(),
                plan.getTotalBudget(),
                plannedCost,
                actualCost,
                trips.size());
    }

    private AnnualPlanDetailResponse toDetailResponse(AnnualPlan plan) {
        List<Trip> trips = tripRepository.findByAnnualPlanIdOrderByStartDate(plan.getId());

        BigDecimal plannedCost = trips.stream()
                .map(Trip::getEstimatedCost)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal actualCost = trips.stream()
                .map(trip -> expenseRepository.sumByTripId(trip.getId()))
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<TripSummaryResponse> tripResponses = trips.stream()
                .map(this::toTripSummary)
                .collect(Collectors.toList());

        return new AnnualPlanDetailResponse(
                plan.getId(),
                plan.getYear(),
                plan.getName(),
                plan.getTotalBudget(),
                plannedCost,
                actualCost,
                tripResponses);
    }

    private TripSummaryResponse toTripSummary(Trip trip) {
        BigDecimal actualCost = expenseRepository.sumByTripId(trip.getId());

        return new TripSummaryResponse(
                trip.getId(),
                trip.getName(),
                trip.getFullDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getTravelType() != null ? trip.getTravelType().name() : null,
                trip.getGroupType() != null ? trip.getGroupType().name() : null,
                0, // Member count - would need to query TripMemberRepository
                trip.getEstimatedCost(),
                actualCost);
    }
}
