package com.microitinerary.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "activities")
public class Activity extends BaseEntity {
    @Column(nullable = false)
    private UUID tripId;

    @ManyToOne
    @JoinColumn(name = "day_id", nullable = false)
    private TripDay day;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeBlock timeBlock;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private String placeName;

    private String notes;
    private Integer durationMinutes;
    private Double estimatedCost;

    @Enumerated(EnumType.STRING)
    private ActivityStatus status = ActivityStatus.PLANNED;

    private LocalTime startTime;

    public UUID getTripId() {
        return tripId;
    }

    public void setTripId(UUID tripId) {
        this.tripId = tripId;
    }

    public TripDay getDay() {
        return day;
    }

    public void setDay(TripDay day) {
        this.day = day;
    }

    public TimeBlock getTimeBlock() {
        return timeBlock;
    }

    public void setTimeBlock(TimeBlock timeBlock) {
        this.timeBlock = timeBlock;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getPlaceName() {
        return placeName;
    }

    public void setPlaceName(String placeName) {
        this.placeName = placeName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public ActivityStatus getStatus() {
        return status;
    }

    public void setStatus(ActivityStatus status) {
        this.status = status;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
}
