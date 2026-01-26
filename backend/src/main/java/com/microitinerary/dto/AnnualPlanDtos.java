package com.microitinerary.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** DTOs for Annual Plan operations */
public class AnnualPlanDtos {

    // Request to create an annual plan
    public record CreateAnnualPlanRequest(Integer year, String name, BigDecimal totalBudget) {}

    // Request to update an annual plan
    public record UpdateAnnualPlanRequest(String name, BigDecimal totalBudget) {}

    // Annual plan summary response
    public record AnnualPlanSummaryResponse(
            UUID id,
            Integer year,
            String name,
            BigDecimal totalBudget,
            BigDecimal plannedCost,
            BigDecimal actualCost,
            int tripCount) {}

    // Annual plan detail response
    public record AnnualPlanDetailResponse(
            UUID id,
            Integer year,
            String name,
            BigDecimal totalBudget,
            BigDecimal plannedCost,
            BigDecimal actualCost,
            List<TripDtos.TripSummaryResponse> trips) {}
}
