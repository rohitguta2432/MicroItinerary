package com.microitinerary.backend.dto;

import com.microitinerary.backend.entity.ItineraryItem;
import com.microitinerary.backend.entity.PackingItem;
import com.microitinerary.backend.entity.Trip;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SyncResponse {
    private LocalDateTime syncTimestamp;
    private List<Trip> trips;
    private List<ItineraryItem> itineraryItems;
    private List<PackingItem> packingItems;
}
