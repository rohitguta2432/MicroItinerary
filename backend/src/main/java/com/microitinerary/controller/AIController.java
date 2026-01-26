package com.microitinerary.controller;

import com.microitinerary.dto.AIDtos.CostEstimationRequest;
import com.microitinerary.dto.AIDtos.CostEstimationResponse;
import com.microitinerary.dto.AIDtos.DestinationSuggestionRequest;
import com.microitinerary.dto.AIDtos.DestinationSuggestionResponse;
import com.microitinerary.dto.AIDtos.SeasonalRecommendationRequest;
import com.microitinerary.dto.AIDtos.SeasonalRecommendationResponse;
import com.microitinerary.service.OpenAIService;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** AI Controller Endpoints for AI-powered travel suggestions and cost estimation */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);
    private static final BigDecimal MIN_BUDGET_FACTOR = new BigDecimal("0.7");
    private static final BigDecimal MAX_BUDGET_FACTOR = new BigDecimal("1.3");

    private final OpenAIService openAIService;

    public AIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    /** Get AI-powered destination suggestions based on preferences */
    @PostMapping("/suggest-destinations")
    public ResponseEntity<DestinationSuggestionResponse> suggestDestinations(
            @RequestBody DestinationSuggestionRequest request) {
        try {
            DestinationSuggestionResponse response = openAIService.suggestDestinations(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error suggesting destinations", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Get AI-powered cost estimation for a trip */
    @PostMapping("/estimate-cost")
    public ResponseEntity<CostEstimationResponse> estimateCost(
            @RequestBody CostEstimationRequest request) {
        try {
            CostEstimationResponse response = openAIService.estimateCost(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error estimating cost", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Get seasonal recommendations for a destination */
    @PostMapping("/seasonal-recommendation")
    public ResponseEntity<SeasonalRecommendationResponse> getSeasonalRecommendation(
            @RequestBody SeasonalRecommendationRequest request) {
        try {
            SeasonalRecommendationResponse response =
                    openAIService.getSeasonalRecommendation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting seasonal recommendation", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /** Quick destination suggestions for a specific month */
    @GetMapping("/suggest/{month}")
    public ResponseEntity<DestinationSuggestionResponse> quickSuggest(
            @PathVariable int month,
            @RequestParam(required = false) String groupType,
            @RequestParam(required = false) String travelType,
            @RequestParam(required = false) Integer budget) {
        try {
            DestinationSuggestionRequest request =
                    new DestinationSuggestionRequest(
                            month,
                            null,
                            budget != null
                                    ? new BigDecimal(budget).multiply(MIN_BUDGET_FACTOR)
                                    : null,
                            budget != null
                                    ? new BigDecimal(budget).multiply(MAX_BUDGET_FACTOR)
                                    : null,
                            groupType,
                            null,
                            travelType,
                            null,
                            null);
            DestinationSuggestionResponse response = openAIService.suggestDestinations(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in quick suggest", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
