package com.microitinerary.controller;

import com.microitinerary.dto.AIDtos.*;
import com.microitinerary.service.OpenAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AI Controller
 * Endpoints for AI-powered travel suggestions and cost estimation
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final OpenAIService openAIService;

    public AIController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    /**
     * Get AI-powered destination suggestions based on preferences
     */
    @PostMapping("/suggest-destinations")
    public ResponseEntity<DestinationSuggestionResponse> suggestDestinations(
            @RequestBody DestinationSuggestionRequest request) {
        try {
            DestinationSuggestionResponse response = openAIService.suggestDestinations(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI-powered cost estimation for a trip
     */
    @PostMapping("/estimate-cost")
    public ResponseEntity<CostEstimationResponse> estimateCost(
            @RequestBody CostEstimationRequest request) {
        try {
            CostEstimationResponse response = openAIService.estimateCost(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get seasonal recommendations for a destination
     */
    @PostMapping("/seasonal-recommendation")
    public ResponseEntity<SeasonalRecommendationResponse> getSeasonalRecommendation(
            @RequestBody SeasonalRecommendationRequest request) {
        try {
            SeasonalRecommendationResponse response = openAIService.getSeasonalRecommendation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Quick destination suggestions for a specific month
     */
    @GetMapping("/suggest/{month}")
    public ResponseEntity<DestinationSuggestionResponse> quickSuggest(
            @PathVariable int month,
            @RequestParam(required = false) String groupType,
            @RequestParam(required = false) String travelType,
            @RequestParam(required = false) Integer budget) {
        try {
            DestinationSuggestionRequest request = new DestinationSuggestionRequest(
                    month,
                    null,
                    budget != null ? new java.math.BigDecimal(budget * 0.7) : null,
                    budget != null ? new java.math.BigDecimal(budget * 1.3) : null,
                    groupType,
                    null,
                    travelType,
                    null,
                    null);
            DestinationSuggestionResponse response = openAIService.suggestDestinations(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
