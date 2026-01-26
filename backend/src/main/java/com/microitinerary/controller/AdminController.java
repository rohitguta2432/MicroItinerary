package com.microitinerary.controller;

import com.microitinerary.domain.User;
import com.microitinerary.repository.AuditLogRepository;
import com.microitinerary.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminController(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        if (!isAdmin())
            return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/activity")
    public ResponseEntity<?> getRecentActivity() {
        if (!isAdmin())
            return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(auditLogRepository.findTop50ByOrderByTimestampDesc());
    }

    @GetMapping("/issues")
    public ResponseEntity<?> getRecentIssues() {
        if (!isAdmin())
            return ResponseEntity.status(403).body("Access Denied");
        return ResponseEntity.ok(auditLogRepository.findTop50ByActionOrderByTimestampDesc("ERROR"));
    }

    private boolean isAdmin() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return false;

        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return "ADMIN".equals(((User) principal).getRole());
        }
        return false;
    }
}
