package com.microitinerary.backend.controller;

import com.microitinerary.backend.dto.SyncRequest;
import com.microitinerary.backend.dto.SyncResponse;
import com.microitinerary.backend.entity.ItineraryItem;
import com.microitinerary.backend.entity.PackingItem;
import com.microitinerary.backend.entity.Trip;
import com.microitinerary.backend.repository.ItineraryItemRepository;
import com.microitinerary.backend.repository.PackingItemRepository;
import com.microitinerary.backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@Slf4j
public class SyncController {

    private final TripRepository tripRepository;
    private final ItineraryItemRepository itineraryItemRepository;
    private final PackingItemRepository packingItemRepository;

    @PostMapping
    @Transactional
    public SyncResponse sync(@RequestBody SyncRequest request) {
        log.info("Sync started. Last sync: {}", request.getLastSyncTimestamp());
        LocalDateTime now = LocalDateTime.now();

        // 1. Process client changes
        processTrips(request.getTrips());
        processItineraryItems(request.getItineraryItems());
        processPackingItems(request.getPackingItems());

        // 2. Fetch changes since last sync
        List<Trip> updatedTrips = fetchUpdatedTrips(request.getLastSyncTimestamp());
        List<ItineraryItem> updatedItineraryItems = fetchUpdatedItineraryItems(request.getLastSyncTimestamp());
        List<PackingItem> updatedPackingItems = fetchUpdatedPackingItems(request.getLastSyncTimestamp());

        return SyncResponse.builder()
                .syncTimestamp(now)
                .trips(updatedTrips)
                .itineraryItems(updatedItineraryItems)
                .packingItems(updatedPackingItems)
                .build();
    }

    private void processTrips(List<Trip> trips) {
        if (trips == null) return;
        for (Trip clientTrip : trips) {
            if (clientTrip.getId() == null) {
                tripRepository.save(clientTrip);
            } else {
                tripRepository.findById(clientTrip.getId()).ifPresentOrElse(
                        existing -> {
                            // Last-Write-Wins: if client update is newer (or we just accept client is right for now)
                            // Ideally check clientTrip.updatedAt > existing.updatedAt
                            if (clientTrip.getUpdatedAt().isAfter(existing.getUpdatedAt())) {
                                tripRepository.save(clientTrip);
                            }
                        },
                        () -> tripRepository.save(clientTrip)
                );
            }
        }
    }

    private void processItineraryItems(List<ItineraryItem> items) {
        if (items == null) return;
        for (ItineraryItem item : items) {
            if (item.getId() == null) {
                itineraryItemRepository.save(item);
            } else {
                itineraryItemRepository.findById(item.getId()).ifPresentOrElse(
                        existing -> {
                            if (item.getUpdatedAt().isAfter(existing.getUpdatedAt())) {
                                itineraryItemRepository.save(item);
                            }
                        },
                        () -> itineraryItemRepository.save(item)
                );
            }
        }
    }
    
    private void processPackingItems(List<PackingItem> items) {
        if (items == null) return;
        for (PackingItem item : items) {
            if (item.getId() == null) {
                packingItemRepository.save(item);
            } else {
                packingItemRepository.findById(item.getId()).ifPresentOrElse(
                        existing -> {
                            if (item.getUpdatedAt().isAfter(existing.getUpdatedAt())) {
                                packingItemRepository.save(item);
                            }
                        },
                        () -> packingItemRepository.save(item)
                );
            }
        }
    }

    private List<Trip> fetchUpdatedTrips(LocalDateTime lastSync) {
        if (lastSync == null) {
            return tripRepository.findAll();
        }
        return tripRepository.findByUpdatedAtAfter(lastSync);
    }

    private List<ItineraryItem> fetchUpdatedItineraryItems(LocalDateTime lastSync) {
         if (lastSync == null) {
            return itineraryItemRepository.findAll();
        }
        return itineraryItemRepository.findByUpdatedAtAfter(lastSync);
    }
    
    private List<PackingItem> fetchUpdatedPackingItems(LocalDateTime lastSync) {
         if (lastSync == null) {
            return packingItemRepository.findAll();
        }
        return packingItemRepository.findByUpdatedAtAfter(lastSync);
    }
}
