package com.microitinerary.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.microitinerary.domain.PackingItem;
import com.microitinerary.domain.Trip;
import com.microitinerary.dto.SyncDtos.PackingItemSyncOp;
import com.microitinerary.dto.SyncDtos.SyncPushRequest;
import com.microitinerary.dto.SyncDtos.TripSyncOp;
import com.microitinerary.repository.ActivityRepository;
import com.microitinerary.repository.PackingItemRepository;
import com.microitinerary.repository.TripRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SyncServiceTest {

    @Mock private TripRepository tripRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private PackingItemRepository packingItemRepository;

    private SyncService syncService;

    @BeforeEach
    void setUp() {
        syncService = new SyncService(tripRepository, activityRepository, packingItemRepository);
    }

    @Test
    void processPush_ShouldSaveTrip_WhenNew() {
        UUID tripId = UUID.randomUUID();
        TripSyncOp op =
                new TripSyncOp(
                        tripId,
                        "CREATE",
                        LocalDateTime.now(),
                        "Test Trip",
                        "Paris",
                        "2024-01-01",
                        "2024-01-10",
                        null);
        SyncPushRequest request = new SyncPushRequest(List.of(op));

        when(tripRepository.findById(tripId)).thenReturn(Optional.empty());

        syncService.processPush(request);

        verify(tripRepository).save(any(Trip.class));
    }

    @Test
    void processPush_ShouldIgnore_WhenServerHasNewerData() {
        UUID tripId = UUID.randomUUID();
        LocalDateTime serverTime = LocalDateTime.now();
        LocalDateTime clientTime = serverTime.minusHours(1);

        Trip existing = new Trip();
        existing.setId(tripId);
        existing.setUpdatedAt(serverTime);

        TripSyncOp op =
                new TripSyncOp(
                        tripId,
                        "UPDATE",
                        clientTime,
                        "Old Name",
                        "Paris",
                        "2024-01-01",
                        "2024-01-10",
                        null);
        SyncPushRequest request = new SyncPushRequest(List.of(op));

        when(tripRepository.findById(tripId)).thenReturn(Optional.of(existing));

        syncService.processPush(request);

        verify(tripRepository, never()).save(any());
    }

    @Test
    void processPush_ShouldDeletePackingItem() {
        UUID id = UUID.randomUUID();
        PackingItem existing = new PackingItem();
        existing.setId(id);
        existing.setUpdatedAt(LocalDateTime.now().minusHours(1));

        PackingItemSyncOp op =
                new PackingItemSyncOp(
                        id, "DELETE", LocalDateTime.now(), UUID.randomUUID(), "Item", false, true);
        SyncPushRequest request = new SyncPushRequest(List.of(op));

        when(packingItemRepository.findById(id)).thenReturn(Optional.of(existing));

        syncService.processPush(request);

        verify(packingItemRepository).save(argThat(item -> item.isDeleted()));
    }
}
