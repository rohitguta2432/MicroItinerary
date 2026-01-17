package com.microitinerary.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.microitinerary.domain.TravelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class SyncDtos {

    public record SyncPushRequest(List<SyncOp> operations) {}

    public record SyncPullResponse(
            LocalDateTime lastSyncTimestamp, List<Object> changes // Polymorphic list of entities
            ) {}

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.PROPERTY,
            property = "entityType")
    @JsonSubTypes({
        @JsonSubTypes.Type(value = TripSyncOp.class, name = "TRIP"),
        @JsonSubTypes.Type(value = PackingItemSyncOp.class, name = "PACKING_ITEM"),
        @JsonSubTypes.Type(value = ActivitySyncOp.class, name = "ACTIVITY"),
    })
    public sealed interface SyncOp permits TripSyncOp, ActivitySyncOp, PackingItemSyncOp {
        UUID id();

        String operation(); // CREATE, UPDATE, DELETE

        LocalDateTime clientUpdatedAt();
    }

    public record TripSyncOp(
            UUID id,
            String operation,
            LocalDateTime clientUpdatedAt,
            @NotBlank String name,
            String location,
            @NotBlank String startDate,
            @NotBlank String endDate,
            TravelType travelType)
            implements SyncOp {}

    public record ActivitySyncOp(
            UUID id,
            String operation,
            LocalDateTime clientUpdatedAt,
            @NotNull UUID tripId,
            UUID dayId,
            String timeBlock,
            Integer sortOrder,
            String placeName,
            String notes,
            String status)
            implements SyncOp {}

    public record PackingItemSyncOp(
            UUID id,
            String operation,
            LocalDateTime clientUpdatedAt,
            @NotNull UUID tripId,
            @NotBlank String name,
            Boolean isChecked,
            Boolean deleted)
            implements SyncOp {}
}
