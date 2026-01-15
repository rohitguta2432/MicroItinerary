package com.microitinerary.backend.repository;

import com.microitinerary.backend.entity.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, UUID> {
    List<ItineraryItem> findByUpdatedAtAfter(LocalDateTime lastSyncTimestamp);
}
