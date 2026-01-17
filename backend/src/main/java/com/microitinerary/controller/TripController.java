package com.microitinerary.controller;

import com.microitinerary.domain.Trip;
import com.microitinerary.repository.TripRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private final TripRepository tripRepository;

    public TripController(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @GetMapping
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    @GetMapping("/{id}")
    public Trip getTrip(@PathVariable UUID id) {
        return tripRepository.findById(id).orElseThrow();
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripRepository.save(trip);
    }

    @DeleteMapping("/{id}")
    public void deleteTrip(@PathVariable UUID id) {
        tripRepository.deleteById(id);
    }
}
