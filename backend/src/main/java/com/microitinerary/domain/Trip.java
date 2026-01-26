package com.microitinerary.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    private UUID id;

    @Column(name = "annual_plan_id", nullable = false)
    private UUID annualPlanId;

    @Column(nullable = false)
    private String name;

    @Column(name = "destination_country")
    private String destinationCountry;

    @Column(name = "destination_state")
    private String destinationState;

    @Column(name = "destination_city")
    private String destinationCity;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_type")
    private TravelType travelType;

    @Enumerated(EnumType.STRING)
    @Column(name = "group_type", nullable = false)
    private GroupType groupType = GroupType.SOLO;

    @Column(name = "amenities", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] amenities;

    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @Column(name = "ai_suggestion_cache", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String aiSuggestionCache;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tripId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "tripId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Expense> expenses = new ArrayList<>();

    public Trip() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAnnualPlanId() {
        return annualPlanId;
    }

    public void setAnnualPlanId(UUID annualPlanId) {
        this.annualPlanId = annualPlanId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDestinationCountry() {
        return destinationCountry;
    }

    public void setDestinationCountry(String destinationCountry) {
        this.destinationCountry = destinationCountry;
    }

    public String getDestinationState() {
        return destinationState;
    }

    public void setDestinationState(String destinationState) {
        this.destinationState = destinationState;
    }

    public String getDestinationCity() {
        return destinationCity;
    }

    public void setDestinationCity(String destinationCity) {
        this.destinationCity = destinationCity;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public TravelType getTravelType() {
        return travelType;
    }

    public void setTravelType(TravelType travelType) {
        this.travelType = travelType;
    }

    public GroupType getGroupType() {
        return groupType;
    }

    public void setGroupType(GroupType groupType) {
        this.groupType = groupType;
    }

    public String[] getAmenities() {
        return amenities;
    }

    public void setAmenities(String[] amenities) {
        this.amenities = amenities;
    }

    public BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getAiSuggestionCache() {
        return aiSuggestionCache;
    }

    public void setAiSuggestionCache(String aiSuggestionCache) {
        this.aiSuggestionCache = aiSuggestionCache;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TripMember> getMembers() {
        return members;
    }

    public void setMembers(List<TripMember> members) {
        this.members = members;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }

    // Helper method to get full destination string
    public String getFullDestination() {
        StringBuilder sb = new StringBuilder();
        if (destinationCity != null)
            sb.append(destinationCity);
        if (destinationState != null) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(destinationState);
        }
        if (destinationCountry != null) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(destinationCountry);
        }
        return sb.toString();
    }

    // Helper method to calculate trip duration in days
    public long getDurationDays() {
        if (startDate != null && endDate != null) {
            return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        }
        return 0;
    }
}
