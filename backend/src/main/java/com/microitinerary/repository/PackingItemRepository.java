package com.microitinerary.repository;

import com.microitinerary.domain.PackingItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PackingItemRepository extends JpaRepository<PackingItem, UUID> {
    List<PackingItem> findByTripId(UUID tripId);

    List<PackingItem> findByTripIdAndDeletedFalse(UUID tripId);

    List<PackingItem> findAllByUpdatedAtAfter(java.time.LocalDateTime since);
}
