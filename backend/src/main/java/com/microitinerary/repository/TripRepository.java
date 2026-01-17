package com.microitinerary.repository;

import com.microitinerary.domain.Trip;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findAllByUpdatedAtAfter(LocalDateTime since);
}
