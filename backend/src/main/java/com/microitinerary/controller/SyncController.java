package com.microitinerary.controller;

import com.microitinerary.dto.SyncDtos.*;
import com.microitinerary.service.SyncService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.*;

public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/push")
    public void push(@RequestBody @Valid SyncPushRequest request) {
        syncService.processPush(request);
    }

    @GetMapping("/pull")
    public SyncPullResponse pull(@RequestParam(required = false) LocalDateTime since) {
        if (since == null) {
            since = LocalDateTime.of(2000, 1, 1, 0, 0);
        }
        return syncService.getPull(since);
    }
}
