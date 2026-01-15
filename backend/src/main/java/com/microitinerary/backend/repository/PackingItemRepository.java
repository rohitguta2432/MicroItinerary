package com.microitinerary.backend.repository;

import com.microitinerary.backend.entity.PackingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PackingItemRepository extends JpaRepository<PackingItem, UUID> {
    List<PackingItem> findByUpdatedAtAfter(LocalDateTime lastSyncTimestamp);
}
