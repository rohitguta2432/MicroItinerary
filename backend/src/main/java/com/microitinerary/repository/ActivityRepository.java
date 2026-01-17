package com.microitinerary.repository;

import com.microitinerary.domain.Activity;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByTripId(UUID tripId);

    List<Activity> findAllByUpdatedAtAfter(LocalDateTime since);
}
