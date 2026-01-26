package com.microitinerary.controller;

import com.microitinerary.dto.AuthDtos.*;
import com.microitinerary.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles Google OAuth login and token management
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticate with Google ID token (from frontend Google Sign-In)
     * This is the primary authentication method for the PWA
     */
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(@RequestBody GoogleAuthRequest request) {
        try {
            logger.info("Received Google auth request. Has ID Token: {}, Has Code: {}",
                    request.idToken() != null && !request.idToken().isEmpty(),
                    request.code() != null && !request.code().isEmpty());

            AuthResponse response;

            if (request.idToken() != null && !request.idToken().isEmpty()) {
                // Frontend sent an ID token (Google Sign-In for Websites)
                response = authService.authenticateWithIdToken(request.idToken());
            } else if (request.code() != null && !request.code().isEmpty()) {
                // Frontend sent an authorization code (OAuth code flow)
                String redirectUri = request.redirectUri() != null
                        ? request.redirectUri()
                        : "postmessage"; // Default for popup flow
                logger.info("Authenticating with code. Redirect URI: {}", redirectUri);
                response = authService.authenticateWithCode(request.code(), redirectUri);
            } else {
                logger.warn("Request missing both ID token and code");
                return ResponseEntity.badRequest().build();
            }

            logger.info("Authentication successful for email: {}", response.user().email());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Authentication failed", e);
            return ResponseEntity.status(401).body(null);
        }
    }

    /**
     * OAuth callback endpoint (for server-side flow)
     */
    @GetMapping("/google/callback")
    public ResponseEntity<AuthResponse> googleCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state) {
        try {
            // In a real app, you'd validate the state parameter
            AuthResponse response = authService.authenticateWithCode(
                    code,
                    "http://localhost:8080/api/auth/google/callback");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfo> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            return authService.getCurrentUser(token)
                    .map(user -> ResponseEntity.ok(new UserInfo(
                            user.getId().toString(),
                            user.getEmail(),
                            user.getName(),
                            user.getPictureUrl())))
                    .orElse(ResponseEntity.status(401).build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Logout (client should discard the token)
     * This endpoint is mainly for auditing purposes
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // With JWT, logout is handled client-side by discarding the token
        // Server can optionally blacklist the token or log the event
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Auth service is healthy", null));
    }

    /**
     * Development-only login endpoint for local testing without Google OAuth.
     * WARNING: This should be disabled in production!
     */
    @PostMapping("/dev-login")
    public ResponseEntity<AuthResponse> devLogin(@RequestBody DevLoginRequest request) {
        try {
            AuthResponse response = authService.devLogin(request.email(), request.name());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
}
