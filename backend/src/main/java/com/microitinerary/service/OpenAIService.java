package com.microitinerary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microitinerary.domain.AICache;
import com.microitinerary.dto.AIDtos.CostBreakdown;
import com.microitinerary.dto.AIDtos.CostEstimationRequest;
import com.microitinerary.dto.AIDtos.CostEstimationResponse;
import com.microitinerary.dto.AIDtos.DestinationSuggestion;
import com.microitinerary.dto.AIDtos.DestinationSuggestionRequest;
import com.microitinerary.dto.AIDtos.DestinationSuggestionResponse;
import com.microitinerary.dto.AIDtos.SeasonalRecommendationRequest;
import com.microitinerary.dto.AIDtos.SeasonalRecommendationResponse;
import com.microitinerary.repository.AICacheRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Service for OpenAI API integration Handles destination suggestions, cost estimation, and seasonal
 * recommendations
 */
@Service
public class OpenAIService {

    private static final Logger log = LoggerFactory.getLogger(OpenAIService.class);

    private final WebClient openAIWebClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final AICacheRepository aiCacheRepository;
    private final ObjectMapper objectMapper;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.max-tokens}")
    private int maxTokens;

    @Value("${openai.temperature}")
    private double temperature;

    @Value("${ai-cache.destination-ttl}")
    private int destinationTtlHours;

    @Value("${ai-cache.cost-estimation-ttl}")
    private int costEstimationTtlHours;

    @Value("${ai-cache.seasonal-ttl}")
    private int seasonalTtlHours;

    public OpenAIService(
            @Qualifier("openAIWebClient") WebClient openAIWebClient,
            RedisTemplate<String, String> redisTemplate,
            AICacheRepository aiCacheRepository) {
        this.openAIWebClient = openAIWebClient;
        this.redisTemplate = redisTemplate;
        this.aiCacheRepository = aiCacheRepository;
        this.objectMapper = new ObjectMapper();
    }

    /** Get destination suggestions based on user preferences */
    public DestinationSuggestionResponse suggestDestinations(DestinationSuggestionRequest request) {
        String cacheKey = buildCacheKey("dest", request);

        // Check cache first
        String cachedResponse = getFromCache(cacheKey);
        if (cachedResponse != null) {
            try {
                DestinationSuggestionResponse cached =
                        objectMapper.readValue(cachedResponse, DestinationSuggestionResponse.class);
                return new DestinationSuggestionResponse(
                        cached.suggestions(), cached.reasoning(), true);
            } catch (Exception e) {
                log.warn("Failed to parse cached response", e);
            }
        }

        // Build prompt
        String prompt = buildDestinationPrompt(request);

        // Call OpenAI
        String aiResponse = callOpenAI(prompt);

        // Parse response
        DestinationSuggestionResponse response = parseDestinationResponse(aiResponse);

        // Cache the response
        saveToCache(cacheKey, response, destinationTtlHours);

        return response;
    }

    /** Get cost estimation for a trip */
    public CostEstimationResponse estimateCost(CostEstimationRequest request) {
        String cacheKey = buildCacheKey("cost", request);

        // Check cache
        String cachedResponse = getFromCache(cacheKey);
        if (cachedResponse != null) {
            try {
                CostEstimationResponse cached =
                        objectMapper.readValue(cachedResponse, CostEstimationResponse.class);
                return new CostEstimationResponse(
                        cached.hotelCost(),
                        cached.foodCost(),
                        cached.transportCost(),
                        cached.activityCost(),
                        cached.miscCost(),
                        cached.totalCost(),
                        cached.perPersonCost(),
                        cached.currency(),
                        cached.breakdown(),
                        cached.notes(),
                        true);
            } catch (Exception e) {
                log.warn("Failed to parse cached response", e);
            }
        }

        // Build prompt
        String prompt = buildCostPrompt(request);

        // Call OpenAI
        String aiResponse = callOpenAI(prompt);

        // Parse response
        CostEstimationResponse response = parseCostResponse(aiResponse, request.groupSize());

        // Cache
        saveToCache(cacheKey, response, costEstimationTtlHours);

        return response;
    }

    /** Get seasonal recommendations for a destination */
    public SeasonalRecommendationResponse getSeasonalRecommendation(
            SeasonalRecommendationRequest request) {
        String cacheKey = buildCacheKey("seasonal", request);

        // Check cache
        String cachedResponse = getFromCache(cacheKey);
        if (cachedResponse != null) {
            try {
                SeasonalRecommendationResponse cached =
                        objectMapper.readValue(
                                cachedResponse, SeasonalRecommendationResponse.class);
                return new SeasonalRecommendationResponse(
                        cached.destination(),
                        cached.month(),
                        cached.weather(),
                        cached.temperature(),
                        cached.recommendedActivities(),
                        cached.packingTips(),
                        cached.festivals(),
                        cached.crowdLevel(),
                        cached.priceLevel(),
                        cached.overallRecommendation(),
                        true);
            } catch (Exception e) {
                log.warn("Failed to parse cached response", e);
            }
        }

        // Build prompt
        String prompt = buildSeasonalPrompt(request);

        // Call OpenAI
        String aiResponse = callOpenAI(prompt);

        // Parse response
        SeasonalRecommendationResponse response = parseSeasonalResponse(aiResponse, request);

        // Cache
        saveToCache(cacheKey, response, seasonalTtlHours);

        return response;
    }

    // ==================== Helper Methods ====================

    private String callOpenAI(String prompt) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(
                    Map.of(
                            "role",
                            "system",
                            "content",
                            "You are a helpful travel planning assistant. Always respond with valid"
                                + " JSON. All monetary values should be in Indian Rupees (INR). Be"
                                + " specific and practical with your suggestions."));
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);

            String response =
                    openAIWebClient
                            .post()
                            .uri("/chat/completions")
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

            // Extract content from response
            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            log.error("OpenAI API call failed", e);
            throw new RuntimeException("Failed to get AI response: " + e.getMessage(), e);
        }
    }

    private String buildDestinationPrompt(DestinationSuggestionRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Suggest 5 travel destinations based on these preferences:\n");

        if (request.month() != null) {
            prompt.append("- Travel month: ").append(getMonthName(request.month())).append("\n");
        }
        if (request.season() != null) {
            prompt.append("- Season: ").append(request.season()).append("\n");
        }
        if (request.budgetMin() != null && request.budgetMax() != null) {
            prompt.append("- Budget: ₹")
                    .append(request.budgetMin())
                    .append(" - ₹")
                    .append(request.budgetMax())
                    .append(" INR\n");
        }
        if (request.groupType() != null) {
            prompt.append("- Group type: ").append(request.groupType()).append("\n");
        }
        if (request.travelType() != null) {
            prompt.append("- Travel type: ").append(request.travelType()).append("\n");
        }
        if (request.durationDays() != null) {
            prompt.append("- Duration: ").append(request.durationDays()).append(" days\n");
        }
        if (request.preferredAmenities() != null && !request.preferredAmenities().isEmpty()) {
            prompt.append("- Preferred amenities: ")
                    .append(String.join(", ", request.preferredAmenities()))
                    .append("\n");
        }
        if (request.preferredRegion() != null) {
            prompt.append("- Preferred region: ").append(request.preferredRegion()).append("\n");
        }

        prompt.append("\nRespond with JSON in this format:\n");
        prompt.append("{\n");
        prompt.append("  \"suggestions\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"country\": \"India\",\n");
        prompt.append("      \"state\": \"Goa\",\n");
        prompt.append("      \"city\": \"Panaji\",\n");
        prompt.append("      \"description\": \"Brief description\",\n");
        prompt.append("      \"bestTimeToVisit\": \"November to February\",\n");
        prompt.append("      \"estimatedDailyCost\": 5000,\n");
        prompt.append("      \"highlights\": [\"highlight1\", \"highlight2\"],\n");
        prompt.append("      \"availableAmenities\": [\"WiFi\", \"Parking\"],\n");
        prompt.append("      \"matchScore\": 95\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"reasoning\": \"Why these destinations match the preferences\"\n");
        prompt.append("}");

        return prompt.toString();
    }

    private String buildCostPrompt(CostEstimationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Estimate travel costs in Indian Rupees (INR) for:\n");
        prompt.append("- Destination: ")
                .append(request.destinationCity())
                .append(", ")
                .append(request.destinationState())
                .append(", ")
                .append(request.destinationCountry())
                .append("\n");
        prompt.append("- Duration: ").append(request.durationDays()).append(" days\n");
        prompt.append("- Group size: ").append(request.groupSize()).append(" people\n");
        prompt.append("- Group type: ").append(request.groupType()).append("\n");
        prompt.append("- Budget level: ").append(request.budgetLevel()).append("\n");
        if (request.amenities() != null && !request.amenities().isEmpty()) {
            prompt.append("- Required amenities: ")
                    .append(String.join(", ", request.amenities()))
                    .append("\n");
        }

        prompt.append("\nProvide costs for the ENTIRE group for ALL days. Respond with JSON:\n");
        prompt.append("{\n");
        prompt.append("  \"hotelCost\": 25000,\n");
        prompt.append("  \"foodCost\": 15000,\n");
        prompt.append("  \"transportCost\": 8000,\n");
        prompt.append("  \"activityCost\": 10000,\n");
        prompt.append("  \"miscCost\": 5000,\n");
        prompt.append("  \"breakdown\": {\n");
        prompt.append("    \"hotelDetails\": \"Mid-range hotel, ₹5000/night for ")
                .append(request.durationDays())
                .append(" nights\",\n");
        prompt.append("    \"foodDetails\": \"3 meals/day at restaurants\",\n");
        prompt.append("    \"transportDetails\": \"Local transport + airport transfers\",\n");
        prompt.append("    \"activityDetails\": \"Entry fees, tours, activities\"\n");
        prompt.append("  },\n");
        prompt.append("  \"notes\": \"Any important notes about the estimate\"\n");
        prompt.append("}");

        return prompt.toString();
    }

    private String buildSeasonalPrompt(SeasonalRecommendationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Provide seasonal travel information for:\n");
        prompt.append("- Destination: ").append(request.destination()).append("\n");
        prompt.append("- Month: ").append(getMonthName(request.month())).append("\n");

        prompt.append("\nRespond with JSON:\n");
        prompt.append("{\n");
        prompt.append("  \"weather\": \"Sunny with occasional showers\",\n");
        prompt.append("  \"temperature\": \"25-32°C\",\n");
        prompt.append("  \"recommendedActivities\": [\"activity1\", \"activity2\"],\n");
        prompt.append("  \"packingTips\": [\"Light cotton clothes\", \"Sunscreen\"],\n");
        prompt.append("  \"festivals\": [\"Any festivals happening\"],\n");
        prompt.append("  \"crowdLevel\": \"MEDIUM\",\n");
        prompt.append("  \"priceLevel\": \"MODERATE\",\n");
        prompt.append("  \"overallRecommendation\": \"Good/Bad time to visit and why\"\n");
        prompt.append("}");

        return prompt.toString();
    }

    private DestinationSuggestionResponse parseDestinationResponse(String aiResponse) {
        try {
            // Clean the response (remove markdown code blocks if present)
            String cleanJson = cleanJsonResponse(aiResponse);
            JsonNode json = objectMapper.readTree(cleanJson);

            List<DestinationSuggestion> suggestions = new ArrayList<>();
            JsonNode suggestionsNode = json.get("suggestions");
            if (suggestionsNode != null && suggestionsNode.isArray()) {
                for (JsonNode s : suggestionsNode) {
                    suggestions.add(
                            new DestinationSuggestion(
                                    getTextOrDefault(s, "country", ""),
                                    getTextOrDefault(s, "state", ""),
                                    getTextOrDefault(s, "city", ""),
                                    getTextOrDefault(s, "description", ""),
                                    getTextOrDefault(s, "bestTimeToVisit", ""),
                                    new BigDecimal(
                                            s.has("estimatedDailyCost")
                                                    ? s.get("estimatedDailyCost").asText()
                                                    : "0"),
                                    toStringList(s.get("highlights")),
                                    toStringList(s.get("availableAmenities")),
                                    s.has("matchScore") ? s.get("matchScore").asDouble() : 0));
                }
            }

            String reasoning = json.has("reasoning") ? json.get("reasoning").asText() : "";
            return new DestinationSuggestionResponse(suggestions, reasoning, false);
        } catch (Exception e) {
            log.error("Failed to parse destination response: {}", aiResponse, e);
            return new DestinationSuggestionResponse(
                    Collections.emptyList(), "Failed to parse AI response", false);
        }
    }

    private CostEstimationResponse parseCostResponse(String aiResponse, int groupSize) {
        try {
            String cleanJson = cleanJsonResponse(aiResponse);
            JsonNode json = objectMapper.readTree(cleanJson);

            BigDecimal hotelCost =
                    new BigDecimal(json.has("hotelCost") ? json.get("hotelCost").asText() : "0");
            BigDecimal foodCost =
                    new BigDecimal(json.has("foodCost") ? json.get("foodCost").asText() : "0");
            BigDecimal transportCost =
                    new BigDecimal(
                            json.has("transportCost") ? json.get("transportCost").asText() : "0");
            BigDecimal activityCost =
                    new BigDecimal(
                            json.has("activityCost") ? json.get("activityCost").asText() : "0");
            BigDecimal miscCost =
                    new BigDecimal(json.has("miscCost") ? json.get("miscCost").asText() : "0");

            BigDecimal totalCost =
                    hotelCost.add(foodCost).add(transportCost).add(activityCost).add(miscCost);
            BigDecimal perPersonCost =
                    groupSize > 0
                            ? totalCost.divide(
                                    new BigDecimal(groupSize), 2, java.math.RoundingMode.HALF_UP)
                            : totalCost;

            CostBreakdown breakdown = null;
            if (json.has("breakdown")) {
                JsonNode b = json.get("breakdown");
                breakdown =
                        new CostBreakdown(
                                getTextOrDefault(b, "hotelDetails", ""),
                                getTextOrDefault(b, "foodDetails", ""),
                                getTextOrDefault(b, "transportDetails", ""),
                                getTextOrDefault(b, "activityDetails", ""));
            }

            String notes = json.has("notes") ? json.get("notes").asText() : "";

            return new CostEstimationResponse(
                    hotelCost,
                    foodCost,
                    transportCost,
                    activityCost,
                    miscCost,
                    totalCost,
                    perPersonCost,
                    "INR",
                    breakdown,
                    notes,
                    false);
        } catch (Exception e) {
            log.error("Failed to parse cost response: {}", aiResponse, e);
            return new CostEstimationResponse(
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    "INR",
                    null,
                    "Failed to parse AI response",
                    false);
        }
    }

    private SeasonalRecommendationResponse parseSeasonalResponse(
            String aiResponse, SeasonalRecommendationRequest request) {
        try {
            String cleanJson = cleanJsonResponse(aiResponse);
            JsonNode json = objectMapper.readTree(cleanJson);

            return new SeasonalRecommendationResponse(
                    request.destination(),
                    request.month(),
                    getTextOrDefault(json, "weather", ""),
                    getTextOrDefault(json, "temperature", ""),
                    toStringList(json.get("recommendedActivities")),
                    toStringList(json.get("packingTips")),
                    toStringList(json.get("festivals")),
                    getTextOrDefault(json, "crowdLevel", "MEDIUM"),
                    getTextOrDefault(json, "priceLevel", "MODERATE"),
                    getTextOrDefault(json, "overallRecommendation", ""),
                    false);
        } catch (Exception e) {
            log.error("Failed to parse seasonal response: {}", aiResponse, e);
            return new SeasonalRecommendationResponse(
                    request.destination(),
                    request.month(),
                    "",
                    "",
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "MEDIUM",
                    "MODERATE",
                    "Failed to parse AI response",
                    false);
        }
    }

    // ==================== Cache Methods ====================

    private String getFromCache(String key) {
        try {
            // Try Redis first
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                return cached;
            }
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to database cache");
        }

        // Fallback to database
        try {
            return aiCacheRepository
                    .findValidByCacheKey(key, LocalDateTime.now())
                    .map(AICache::getResponse)
                    .orElse(null);
        } catch (Exception e) {
            log.warn("Database cache lookup failed", e);
            return null;
        }
    }

    private void saveToCache(String key, Object response, int ttlHours) {
        try {
            String json = objectMapper.writeValueAsString(response);

            // Save to Redis
            try {
                redisTemplate.opsForValue().set(key, json, Duration.ofHours(ttlHours));
            } catch (Exception e) {
                log.warn("Failed to save to Redis");
            }

            // Save to database as fallback
            try {
                AICache cache = new AICache(key, json, ttlHours);
                aiCacheRepository
                        .findByCacheKey(key)
                        .ifPresent(
                                existing -> {
                                    cache.setId(existing.getId());
                                });
                aiCacheRepository.save(cache);
            } catch (Exception e) {
                log.warn("Failed to save to database cache", e);
            }
        } catch (Exception e) {
            log.error("Failed to serialize response for caching", e);
        }
    }

    private String buildCacheKey(String prefix, Object request) {
        try {
            String requestJson = objectMapper.writeValueAsString(request);
            int hash = requestJson.hashCode();
            return prefix + ":" + hash;
        } catch (Exception e) {
            return prefix + ":" + request.hashCode();
        }
    }

    // ==================== Utility Methods ====================

    private String cleanJsonResponse(String response) {
        // Remove markdown code blocks if present
        String clean = response.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    private String getTextOrDefault(JsonNode node, String field, String defaultValue) {
        return node != null && node.has(field) ? node.get(field).asText() : defaultValue;
    }

    private List<String> toStringList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                list.add(item.asText());
            }
        }
        return list;
    }

    private String getMonthName(int month) {
        String[] months = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        };
        return month >= 1 && month <= 12 ? months[month - 1] : "Unknown";
    }
}
