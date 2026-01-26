package com.microitinerary.controller;

import com.microitinerary.domain.User;

import com.microitinerary.dto.AuthDtos.ApiResponse;
import com.microitinerary.dto.TripDtos.*;
import com.microitinerary.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Trip Controller
 * Endpoints for managing trips and invitations
 */
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    /**
     * Get all trips for the current user
     */
    @GetMapping
    public ResponseEntity<List<TripSummaryResponse>> getTrips(@AuthenticationPrincipal User user) {
        List<TripSummaryResponse> trips = tripService.getUserTrips(user.getId());
        return ResponseEntity.ok(trips);
    }

    /**
     * Get trip by ID
     */
    @GetMapping("/{tripId}")
    public ResponseEntity<TripDetailResponse> getTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal User user) {
        return tripService.getTripById(tripId, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get trip members
     */
    @GetMapping("/{tripId}/members")
    public ResponseEntity<List<TripMemberResponse>> getTripMembers(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal User user) {
        List<TripMemberResponse> members = tripService.getTripMembers(tripId, user.getId());
        if (members.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(members);
    }

    /**
     * Create a new trip
     */
    @PostMapping
    public ResponseEntity<TripDetailResponse> createTrip(
            @RequestBody CreateTripRequest request,
            @AuthenticationPrincipal User user) {
        try {
            TripDetailResponse trip = tripService.createTrip(user.getId(), request);
            return ResponseEntity.ok(trip);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a trip
     */
    @PutMapping("/{tripId}")
    public ResponseEntity<TripDetailResponse> updateTrip(
            @PathVariable UUID tripId,
            @RequestBody UpdateTripRequest request,
            @AuthenticationPrincipal User user) {
        return tripService.updateTrip(tripId, user.getId(), request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a trip
     */
    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @PathVariable UUID tripId,
            @AuthenticationPrincipal User user) {
        if (tripService.deleteTrip(tripId, user.getId())) {
            return ResponseEntity.ok(ApiResponse.success("Trip deleted", null));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Invite a member to a trip
     */
    @PostMapping("/{tripId}/invite")
    public ResponseEntity<ApiResponse<String>> inviteMember(
            @PathVariable UUID tripId,
            @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return tripService.inviteMember(tripId, user.getId(), request.email())
                    .map(invitation -> ResponseEntity.ok(
                            ApiResponse.success("Invitation sent", invitation.getInviteCode())))
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Accept an invitation (public endpoint)
     */
    @PostMapping("/invitations/accept/{inviteCode}")
    public ResponseEntity<TripDetailResponse> acceptInvitation(
            @PathVariable String inviteCode,
            @AuthenticationPrincipal User user) {
        try {
            return tripService.acceptInvitation(inviteCode, user.getId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
