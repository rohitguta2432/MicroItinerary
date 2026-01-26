package com.microitinerary.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTOs for AI-related operations
 */
public class AIDtos {

    // Request for destination suggestions
    public record DestinationSuggestionRequest(
            Integer month,
            String season, // SUMMER, WINTER, MONSOON, SPRING
            BigDecimal budgetMin,
            BigDecimal budgetMax,
            String groupType, // SOLO, FRIENDS, FAMILY
            List<String> preferredAmenities,
            String travelType, // LEISURE, ADVENTURE, RELIGIOUS, BUSINESS
            Integer durationDays,
            String preferredRegion // Optional: NORTH_INDIA, SOUTH_INDIA, INTERNATIONAL, etc.
    ) {
    }

    // Destination suggestion response
    public record DestinationSuggestionResponse(
            List<DestinationSuggestion> suggestions,
            String reasoning,
            boolean fromCache) {
    }

    // Single destination suggestion
    public record DestinationSuggestion(
            String country,
            String state,
            String city,
            String description,
            String bestTimeToVisit,
            BigDecimal estimatedDailyCost,
            List<String> highlights,
            List<String> availableAmenities,
            double matchScore // 0-100 how well it matches the request
    ) {
    }

    // Request for cost estimation
    public record CostEstimationRequest(
            String destinationCountry,
            String destinationState,
            String destinationCity,
            Integer durationDays,
            Integer groupSize,
            String groupType, // SOLO, FRIENDS, FAMILY
            String budgetLevel, // BUDGET, MID_RANGE, LUXURY
            List<String> amenities) {
    }

    // Cost estimation response
    public record CostEstimationResponse(
            BigDecimal hotelCost,
            BigDecimal foodCost,
            BigDecimal transportCost,
            BigDecimal activityCost,
            BigDecimal miscCost,
            BigDecimal totalCost,
            BigDecimal perPersonCost,
            String currency,
            CostBreakdown breakdown,
            String notes,
            boolean fromCache) {
    }

    // Detailed cost breakdown
    public record CostBreakdown(
            String hotelDetails,
            String foodDetails,
            String transportDetails,
            String activityDetails) {
    }

    // Seasonal recommendation request
    public record SeasonalRecommendationRequest(
            String destination,
            Integer month) {
    }

    // Seasonal recommendation response
    public record SeasonalRecommendationResponse(
            String destination,
            Integer month,
            String weather,
            String temperature,
            List<String> recommendedActivities,
            List<String> packingTips,
            List<String> festivals,
            String crowdLevel, // LOW, MEDIUM, HIGH
            String priceLevel, // BUDGET, MODERATE, PEAK
            String overallRecommendation,
            boolean fromCache) {
    }
}
