package com.microitinerary.repository;

import com.microitinerary.domain.PackingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PackingItemRepository extends JpaRepository<PackingItem, UUID> {
    List<PackingItem> findByTripId(UUID tripId);
    List<PackingItem> findAllByUpdatedAtAfter(LocalDateTime since);
}
