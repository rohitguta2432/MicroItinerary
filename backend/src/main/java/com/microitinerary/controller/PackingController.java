package com.microitinerary.controller;

import com.microitinerary.domain.PackingItem;
import com.microitinerary.repository.PackingItemRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/packing")
@CrossOrigin(origins = "*")
public class PackingController {

    private final PackingItemRepository packingItemRepository;

    public PackingController(PackingItemRepository packingItemRepository) {
        this.packingItemRepository = packingItemRepository;
    }

    @GetMapping("/trip/{tripId}")
    public List<PackingItem> getPackingItems(@PathVariable UUID tripId) {
        // Return only non-deleted items for the UI
        return packingItemRepository.findByTripIdAndDeletedFalse(tripId);
    }

    @PostMapping("/sync")
    public List<PackingItem> syncPackingItems(@RequestBody List<PackingItem> items) {
        // Simple sync: just save everything coming in (Last Write Wins)
        return packingItemRepository.saveAll(items);
    }

    @DeleteMapping("/{id}")
    public void deletePackingItem(@PathVariable UUID id) {
        packingItemRepository
                .findById(id)
                .ifPresent(
                        item -> {
                            item.setDeleted(true);
                            packingItemRepository.save(item);
                        });
    }
}
