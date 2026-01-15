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

    public SyncService(TripRepository tripRepository, ActivityRepository activityRepository) {
        this.tripRepository = tripRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public void processPush(SyncPushRequest request) {
        for (SyncOp op : request.operations()) {
            if ("TRIP".equals(op.getClass().getAnnotation(com.fasterxml.jackson.annotation.JsonTypeName.class))) {
                handleTripOp((TripSyncOp) op);
            } else if (op instanceof ActivitySyncOp) {
                handleActivityOp((ActivitySyncOp) op);
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

    public SyncPullResponse getPull(LocalDateTime since) {
        List<Object> changes = new ArrayList<>();
        changes.addAll(tripRepository.findAllByUpdatedAtAfter(since));
        changes.addAll(activityRepository.findAllByUpdatedAtAfter(since));
        
        return new SyncPullResponse(LocalDateTime.now(), changes);
    }
}
