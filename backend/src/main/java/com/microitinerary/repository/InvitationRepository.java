package com.microitinerary.repository;

import com.microitinerary.domain.Invitation;
import com.microitinerary.domain.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    List<Invitation> findByTripId(UUID tripId);

    List<Invitation> findByEmail(String email);

    List<Invitation> findByEmailAndStatus(String email, InvitationStatus status);

    Optional<Invitation> findByInviteCode(String inviteCode);

    Optional<Invitation> findByTripIdAndEmail(UUID tripId, String email);

    // Find pending invitations for an email
    List<Invitation> findByEmailAndStatusOrderByCreatedAtDesc(String email, InvitationStatus status);

    // Check if invitation exists and is valid
    @Query("SELECT i FROM Invitation i WHERE i.inviteCode = :code " +
            "AND i.status = 'PENDING' AND i.expiresAt > :now")
    Optional<Invitation> findValidInvitation(@Param("code") String code, @Param("now") LocalDateTime now);

    // Expire old invitations
    @Modifying
    @Query("UPDATE Invitation i SET i.status = 'EXPIRED' " +
            "WHERE i.status = 'PENDING' AND i.expiresAt < :now")
    int expireOldInvitations(@Param("now") LocalDateTime now);
}
