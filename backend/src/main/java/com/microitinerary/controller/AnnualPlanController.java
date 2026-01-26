package com.microitinerary.controller;

import com.microitinerary.domain.User;
import com.microitinerary.dto.AnnualPlanDtos.AnnualPlanDetailResponse;
import com.microitinerary.dto.AnnualPlanDtos.AnnualPlanSummaryResponse;
import com.microitinerary.dto.AnnualPlanDtos.CreateAnnualPlanRequest;
import com.microitinerary.dto.AnnualPlanDtos.UpdateAnnualPlanRequest;
import com.microitinerary.dto.AuthDtos.ApiResponse;
import com.microitinerary.dto.TripDtos.CalendarViewResponse;
import com.microitinerary.service.AnnualPlanService;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Annual Plan Controller Endpoints for managing yearly travel plans */
@RestController
@RequestMapping("/api/plans")
public class AnnualPlanController {

    private static final Logger log = LoggerFactory.getLogger(AnnualPlanController.class);

    private final AnnualPlanService annualPlanService;

    public AnnualPlanController(AnnualPlanService annualPlanService) {
        this.annualPlanService = annualPlanService;
    }

    /** Get all annual plans for the current user */
    @GetMapping
    public ResponseEntity<List<AnnualPlanSummaryResponse>> getPlans(
            @AuthenticationPrincipal User user) {
        List<AnnualPlanSummaryResponse> plans = annualPlanService.getUserPlans(user.getId());
        return ResponseEntity.ok(plans);
    }

    /** Get current year plan (or create if doesn't exist) */
    @GetMapping("/current")
    public ResponseEntity<AnnualPlanSummaryResponse> getCurrentYearPlan(
            @AuthenticationPrincipal User user) {
        AnnualPlanSummaryResponse plan = annualPlanService.getOrCreateCurrentYearPlan(user.getId());
        return ResponseEntity.ok(plan);
    }

    /** Get annual plan by ID */
    @GetMapping("/{planId}")
    public ResponseEntity<AnnualPlanDetailResponse> getPlan(
            @PathVariable UUID planId, @AuthenticationPrincipal User user) {
        return annualPlanService
                .getPlanById(planId, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Get calendar view (12 months) for an annual plan */
    @GetMapping("/{planId}/calendar")
    public ResponseEntity<CalendarViewResponse> getCalendarView(
            @PathVariable UUID planId, @AuthenticationPrincipal User user) {
        return annualPlanService
                .getCalendarView(planId, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Create a new annual plan */
    @PostMapping
    public ResponseEntity<AnnualPlanSummaryResponse> createPlan(
            @RequestBody CreateAnnualPlanRequest request, @AuthenticationPrincipal User user) {
        try {
            AnnualPlanSummaryResponse plan = annualPlanService.createPlan(user.getId(), request);
            return ResponseEntity.ok(plan);
        } catch (RuntimeException e) {
            log.error("Error creating annual plan", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /** Update an annual plan */
    @PutMapping("/{planId}")
    public ResponseEntity<AnnualPlanSummaryResponse> updatePlan(
            @PathVariable UUID planId,
            @RequestBody UpdateAnnualPlanRequest request,
            @AuthenticationPrincipal User user) {
        return annualPlanService
                .updatePlan(planId, user.getId(), request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Delete an annual plan */
    @DeleteMapping("/{planId}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(
            @PathVariable UUID planId, @AuthenticationPrincipal User user) {
        if (annualPlanService.deletePlan(planId, user.getId())) {
            return ResponseEntity.ok(ApiResponse.success("Plan deleted", null));
        }
        return ResponseEntity.notFound().build();
    }
}
