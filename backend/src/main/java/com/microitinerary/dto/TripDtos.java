package com.microitinerary.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for Trip-related operations
 */
public class TripDtos {

    // Request to create a new trip
    public record CreateTripRequest(
            UUID annualPlanId,
            String name,
            String destinationCountry,
            String destinationState,
            String destinationCity,
            LocalDate startDate,
            LocalDate endDate,
            String travelType,
            String groupType,
            List<String> amenities,
            BigDecimal estimatedCost) {
    }

    // Request to update a trip
    public record UpdateTripRequest(
            String name,
            String destinationCountry,
            String destinationState,
            String destinationCity,
            LocalDate startDate,
            LocalDate endDate,
            String travelType,
            String groupType,
            List<String> amenities,
            BigDecimal estimatedCost) {
    }

    // Trip summary response
    public record TripSummaryResponse(
            UUID id,
            String name,
            String destination,
            LocalDate startDate,
            LocalDate endDate,
            String travelType,
            String groupType,
            int memberCount,
            BigDecimal estimatedCost,
            BigDecimal actualCost) {
    }

    // Trip detail response with members and expenses
    public record TripDetailResponse(
            UUID id,
            UUID annualPlanId,
            String name,
            String destinationCountry,
            String destinationState,
            String destinationCity,
            LocalDate startDate,
            LocalDate endDate,
            String travelType,
            String groupType,
            List<String> amenities,
            BigDecimal estimatedCost,
            BigDecimal actualCost,
            List<TripMemberResponse> members,
            String aiSuggestion) {
    }

    // Trip member info
    public record TripMemberResponse(
            UUID userId,
            String name,
            String email,
            String pictureUrl,
            String role) {
    }

    // Request to invite a member
    public record InviteMemberRequest(
            String email) {
    }

    // Response for calendar view (12 months)
    public record CalendarViewResponse(
            int year,
            BigDecimal totalBudget,
            BigDecimal plannedCost,
            List<MonthData> months) {
    }

    public record MonthData(
            int month,
            String monthName,
            List<TripSummaryResponse> trips) {
    }
}
