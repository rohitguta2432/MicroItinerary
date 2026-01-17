package com.microitinerary.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.microitinerary.domain.TravelType;

public class SyncDtos {

    public record SyncPushRequest(List<SyncOp> operations) {}

    public record SyncPullResponse(
        LocalDateTime lastSyncTimestamp,
        List<Object> changes // Polymorphic list of entities
    ) {}

    @JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "entityType"
    )
    @JsonSubTypes({
        @JsonSubTypes.Type(value = TripSyncOp.class, name = "TRIP"),
        @JsonSubTypes.Type(value = PackingItemSyncOp.class, name = "PACKING_ITEM"),
        @JsonSubTypes.Type(value = ActivitySyncOp.class, name = "ACTIVITY"),
        // Add others as needed
    })
    public static abstract class SyncOp {
        public UUID id;
        public String operation; // CREATE, UPDATE, DELETE
        public LocalDateTime clientUpdatedAt;
    }

    public static class TripSyncOp extends SyncOp {
        public String name;
        public String location;
        public String startDate;
        public String endDate;
        public TravelType travelType;
    }

    public static class ActivitySyncOp extends SyncOp {
        public UUID tripId;
        public UUID dayId;
        public String timeBlock;
        public Integer sortOrder;
        public String placeName;
        public String notes;
        public String status;
    }

    public static class PackingItemSyncOp extends SyncOp {
        public UUID tripId;
        public String name;
        public Boolean isChecked;
        public Boolean deleted;
    }
}
