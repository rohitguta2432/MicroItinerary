package com.microitinerary.repository;

import com.microitinerary.domain.MemberRole;
import com.microitinerary.domain.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripMemberRepository extends JpaRepository<TripMember, UUID> {

    List<TripMember> findByTripId(UUID tripId);

    List<TripMember> findByUserId(UUID userId);

    Optional<TripMember> findByTripIdAndUserId(UUID tripId, UUID userId);

    boolean existsByTripIdAndUserId(UUID tripId, UUID userId);

    // Find owner of a trip
    Optional<TripMember> findByTripIdAndRole(UUID tripId, MemberRole role);

    // Count members in a trip
    long countByTripId(UUID tripId);

    // Find members with user details
    @Query("SELECT tm, u FROM TripMember tm JOIN User u ON tm.userId = u.id " +
            "WHERE tm.tripId = :tripId")
    List<Object[]> findMembersWithUserDetails(@Param("tripId") UUID tripId);
}
