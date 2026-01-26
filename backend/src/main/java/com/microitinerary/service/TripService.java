package com.microitinerary.service;

import com.microitinerary.domain.*;
import com.microitinerary.dto.TripDtos.*;
import com.microitinerary.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing Trips
 */
@Service
public class TripService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;

    public TripService(
            TripRepository tripRepository,
            TripMemberRepository tripMemberRepository,
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            InvitationRepository invitationRepository) {
        this.tripRepository = tripRepository;
        this.tripMemberRepository = tripMemberRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
    }

    /**
     * Get trip by ID
     */
    public Optional<TripDetailResponse> getTripById(UUID tripId, UUID userId) {
        return tripRepository.findById(tripId)
                .filter(trip -> isMember(tripId, userId))
                .map(this::toDetailResponse);
    }

    /**
     * Get all trips for a user (where they are a member)
     */
    public List<TripSummaryResponse> getUserTrips(UUID userId) {
        return tripRepository.findTripsWhereUserIsMember(userId).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new trip
     */
    @Transactional
    public TripDetailResponse createTrip(UUID userId, CreateTripRequest request) {
        Trip trip = new Trip();
        trip.setAnnualPlanId(request.annualPlanId());
        trip.setName(request.name());
        trip.setDestinationCountry(request.destinationCountry());
        trip.setDestinationState(request.destinationState());
        trip.setDestinationCity(request.destinationCity());
        trip.setStartDate(request.startDate());
        trip.setEndDate(request.endDate());

        if (request.travelType() != null) {
            trip.setTravelType(TravelType.valueOf(request.travelType()));
        }
        if (request.groupType() != null) {
            trip.setGroupType(GroupType.valueOf(request.groupType()));
        }
        if (request.amenities() != null) {
            trip.setAmenities(request.amenities().toArray(new String[0]));
        }
        if (request.estimatedCost() != null) {
            trip.setEstimatedCost(request.estimatedCost());
        }

        trip = tripRepository.save(trip);

        // Add creator as owner
        TripMember owner = new TripMember(trip.getId(), userId, MemberRole.OWNER);
        tripMemberRepository.save(owner);

        return toDetailResponse(trip);
    }

    /**
     * Update a trip
     */
    @Transactional
    public Optional<TripDetailResponse> updateTrip(UUID tripId, UUID userId, UpdateTripRequest request) {
        return tripRepository.findById(tripId)
                .filter(trip -> isOwner(tripId, userId))
                .map(trip -> {
                    if (request.name() != null)
                        trip.setName(request.name());
                    if (request.destinationCountry() != null)
                        trip.setDestinationCountry(request.destinationCountry());
                    if (request.destinationState() != null)
                        trip.setDestinationState(request.destinationState());
                    if (request.destinationCity() != null)
                        trip.setDestinationCity(request.destinationCity());
                    if (request.startDate() != null)
                        trip.setStartDate(request.startDate());
                    if (request.endDate() != null)
                        trip.setEndDate(request.endDate());
                    if (request.travelType() != null)
                        trip.setTravelType(TravelType.valueOf(request.travelType()));
                    if (request.groupType() != null)
                        trip.setGroupType(GroupType.valueOf(request.groupType()));
                    if (request.amenities() != null)
                        trip.setAmenities(request.amenities().toArray(new String[0]));
                    if (request.estimatedCost() != null)
                        trip.setEstimatedCost(request.estimatedCost());

                    return toDetailResponse(tripRepository.save(trip));
                });
    }

    /**
     * Delete a trip
     */
    @Transactional
    public boolean deleteTrip(UUID tripId, UUID userId) {
        return tripRepository.findById(tripId)
                .filter(trip -> isOwner(tripId, userId))
                .map(trip -> {
                    tripRepository.delete(trip);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Invite a member to a trip
     */
    @Transactional
    public Optional<Invitation> inviteMember(UUID tripId, UUID invitedByUserId, String email) {
        return tripRepository.findById(tripId)
                .filter(trip -> isOwner(tripId, invitedByUserId))
                .map(trip -> {
                    // Check if already a member
                    Optional<User> existingUser = userRepository.findByEmail(email);
                    if (existingUser.isPresent() && isMember(tripId, existingUser.get().getId())) {
                        throw new RuntimeException("User is already a member of this trip");
                    }

                    // Check if invitation already exists
                    Optional<Invitation> existingInvite = invitationRepository.findByTripIdAndEmail(tripId, email);
                    if (existingInvite.isPresent() && existingInvite.get().getStatus() == InvitationStatus.PENDING) {
                        return existingInvite.get();
                    }

                    // Create new invitation
                    Invitation invitation = new Invitation(tripId, invitedByUserId, email);
                    return invitationRepository.save(invitation);
                });
    }

    /**
     * Accept an invitation
     */
    @Transactional
    public Optional<TripDetailResponse> acceptInvitation(String inviteCode, UUID userId) {
        return invitationRepository.findByInviteCode(inviteCode)
                .filter(inv -> inv.getStatus() == InvitationStatus.PENDING && !inv.isExpired())
                .map(invitation -> {
                    // Verify user email matches invitation
                    User user = userRepository.findById(userId).orElseThrow();
                    if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
                        throw new RuntimeException("Invitation is for a different email address");
                    }

                    // Add user as member
                    TripMember member = new TripMember(invitation.getTripId(), userId, MemberRole.MEMBER);
                    tripMemberRepository.save(member);

                    // Mark invitation as accepted
                    invitation.accept();
                    invitationRepository.save(invitation);

                    return toDetailResponse(tripRepository.findById(invitation.getTripId()).orElseThrow());
                });
    }

    /**
     * Get trip members
     */
    public List<TripMemberResponse> getTripMembers(UUID tripId, UUID userId) {
        if (!isMember(tripId, userId)) {
            return Collections.emptyList();
        }

        return tripMemberRepository.findByTripId(tripId).stream()
                .map(member -> {
                    User user = userRepository.findById(member.getUserId()).orElse(null);
                    if (user == null)
                        return null;
                    return new TripMemberResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getPictureUrl(),
                            member.getRole().name());
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private boolean isMember(UUID tripId, UUID userId) {
        return tripMemberRepository.existsByTripIdAndUserId(tripId, userId);
    }

    private boolean isOwner(UUID tripId, UUID userId) {
        return tripMemberRepository.findByTripIdAndUserId(tripId, userId)
                .map(member -> member.getRole() == MemberRole.OWNER)
                .orElse(false);
    }

    private TripSummaryResponse toSummaryResponse(Trip trip) {
        BigDecimal actualCost = expenseRepository.sumByTripId(trip.getId());
        int memberCount = (int) tripMemberRepository.countByTripId(trip.getId());

        return new TripSummaryResponse(
                trip.getId(),
                trip.getName(),
                trip.getFullDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getTravelType() != null ? trip.getTravelType().name() : null,
                trip.getGroupType() != null ? trip.getGroupType().name() : null,
                memberCount,
                trip.getEstimatedCost(),
                actualCost);
    }

    private TripDetailResponse toDetailResponse(Trip trip) {
        BigDecimal actualCost = expenseRepository.sumByTripId(trip.getId());

        List<TripMemberResponse> members = tripMemberRepository.findByTripId(trip.getId()).stream()
                .map(member -> {
                    User user = userRepository.findById(member.getUserId()).orElse(null);
                    if (user == null)
                        return null;
                    return new TripMemberResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getPictureUrl(),
                            member.getRole().name());
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new TripDetailResponse(
                trip.getId(),
                trip.getAnnualPlanId(),
                trip.getName(),
                trip.getDestinationCountry(),
                trip.getDestinationState(),
                trip.getDestinationCity(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getTravelType() != null ? trip.getTravelType().name() : null,
                trip.getGroupType() != null ? trip.getGroupType().name() : null,
                trip.getAmenities() != null ? Arrays.asList(trip.getAmenities()) : Collections.emptyList(),
                trip.getEstimatedCost(),
                actualCost,
                members,
                trip.getAiSuggestionCache());
    }
}
