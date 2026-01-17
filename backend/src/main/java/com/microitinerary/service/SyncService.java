package com.microitinerary.service;

import com.microitinerary.domain.*;
import com.microitinerary.dto.SyncDtos.*;
import com.microitinerary.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SyncService {

    private final TripRepository tripRepository;
    private final ActivityRepository activityRepository;
    private final PackingItemRepository packingItemRepository;

    public SyncService(TripRepository tripRepository, ActivityRepository activityRepository, PackingItemRepository packingItemRepository) {
        this.tripRepository = tripRepository;
        this.activityRepository = activityRepository;
        this.packingItemRepository = packingItemRepository;
    }

    @Transactional
    public void processPush(SyncPushRequest request) {
        for (SyncOp op : request.operations()) {
            if ("TRIP".equals(op.getClass().getAnnotation(com.fasterxml.jackson.annotation.JsonTypeName.class))) {
                handleTripOp((TripSyncOp) op);
            } else if (op instanceof ActivitySyncOp) {
                handleActivityOp((ActivitySyncOp) op);
            } else if (op instanceof PackingItemSyncOp) {
                handlePackingItemOp((PackingItemSyncOp) op);
            }
        }
    }

    private void handleTripOp(TripSyncOp op) {
        Trip existing = tripRepository.findById(op.id).orElse(null);
        
        if (existing != null && existing.getUpdatedAt().isAfter(op.clientUpdatedAt)) {
            return; // Server wins
        }

        if ("DELETE".equals(op.operation)) {
            if (existing != null) tripRepository.delete(existing);
            return;
        }

        Trip trip = existing != null ? existing : new Trip();
        trip.setId(op.id);
        trip.setName(op.name);
        trip.setLocation(op.location);
        trip.setStartDate(LocalDate.parse(op.startDate)); // ISO format expected
        trip.setEndDate(LocalDate.parse(op.endDate));
        trip.setTravelType(op.travelType);
        trip.setUpdatedAt(LocalDateTime.now()); // Set new server time or keep client time? Usually keep client time if we trust it, or set to now. 
        // Sync Strategy: "Last Write Wins". We accept the client's state. 
        // Ideally we keep the client's updatedAt to acknowledge when it changed.
        trip.setUpdatedAt(op.clientUpdatedAt); 
        
        tripRepository.save(trip);
    }

    private void handleActivityOp(ActivitySyncOp op) {
        // Similar logic for Activity
    }

    private void handlePackingItemOp(PackingItemSyncOp op) {
        PackingItem existing = packingItemRepository.findById(op.id).orElse(null);

        if (existing != null && existing.getUpdatedAt().isAfter(op.clientUpdatedAt)) {
            return; // Server wins
        }

        if ("DELETE".equals(op.operation)) {
            // Soft delete preference? Or Hard delete?
            // If the client sent DELETE operation, usually we hard delete or soft delete.
            // The PackingItem entity has a deleted flag.
            if (existing != null) {
                existing.setDeleted(true);
                existing.setUpdatedAt(op.clientUpdatedAt);
                packingItemRepository.save(existing);
            }
            return;
        }

        PackingItem item = existing != null ? existing : new PackingItem();
        item.setId(op.id);
        item.setTripId(op.tripId);
        item.setName(op.name);
        item.setChecked(op.isChecked != null && op.isChecked);
        item.setDeleted(op.deleted != null && op.deleted);
        item.setUpdatedAt(op.clientUpdatedAt);

        packingItemRepository.save(item);
    }

    public SyncPullResponse getPull(LocalDateTime since) {
        List<Object> changes = new ArrayList<>();
        changes.addAll(tripRepository.findAllByUpdatedAtAfter(since));
        changes.addAll(activityRepository.findAllByUpdatedAtAfter(since));
        changes.addAll(packingItemRepository.findAllByUpdatedAtAfter(since));
        
        return new SyncPullResponse(LocalDateTime.now(), changes);
    }
}
