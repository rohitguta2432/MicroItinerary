package com.microitinerary.repository;

import com.microitinerary.domain.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PlaceRepository extends JpaRepository<Place, UUID> {
    List<Place> findByTripId(UUID tripId);
    List<Place> findAllByUpdatedAtAfter(LocalDateTime since);
}
