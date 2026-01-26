package com.microitinerary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microitinerary.config.JwtUtils;
import com.microitinerary.domain.User;
import com.microitinerary.dto.AuthDtos.AuthResponse;
import com.microitinerary.dto.AuthDtos.UserInfo;
import com.microitinerary.repository.UserRepository;
import java.util.Base64;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

/** Service for handling Google OAuth authentication */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    public AuthService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.objectMapper = new ObjectMapper();
    }

    /** Authenticate user with Google ID token (from frontend Google Sign-In) */
    public AuthResponse authenticateWithIdToken(String idToken) {
        try {
            // Decode the ID token (it's a JWT)
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new RuntimeException("Invalid ID token format");
            }

            // Decode payload (middle part)
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JsonNode claims = objectMapper.readTree(payload);

            // Verify the token is for our app
            String aud = claims.has("aud") ? claims.get("aud").asText() : "";
            if (!aud.equals(googleClientId)) {
                throw new RuntimeException("Invalid token audience");
            }

            // Extract user info from token
            String googleId = claims.get("sub").asText();
            String email = claims.get("email").asText();
            String name = claims.has("name") ? claims.get("name").asText() : email;
            String picture = claims.has("picture") ? claims.get("picture").asText() : null;

            // Find or create user
            User user =
                    userRepository
                            .findByGoogleId(googleId)
                            .orElseGet(
                                    () -> {
                                        // Check if user exists by email (might have been invited)
                                        return userRepository
                                                .findByEmail(email)
                                                .map(
                                                        existingUser -> {
                                                            // Link Google account to existing user
                                                            existingUser.setGoogleId(googleId);
                                                            existingUser.setName(name);
                                                            existingUser.setPictureUrl(picture);
                                                            return userRepository.save(
                                                                    existingUser);
                                                        })
                                                .orElseGet(
                                                        () -> {
                                                            // Create new user
                                                            User newUser =
                                                                    new User(
                                                                            email, name, picture,
                                                                            googleId);
                                                            return userRepository.save(newUser);
                                                        });
                                    });

            // Update user info if changed
            boolean updated = false;
            if (!name.equals(user.getName())) {
                user.setName(name);
                updated = true;
            }
            if (picture != null && !picture.equals(user.getPictureUrl())) {
                user.setPictureUrl(picture);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }

            // Generate JWT
            String accessToken = jwtUtils.generateToken(user.getId(), user.getEmail());

            return new AuthResponse(
                    accessToken,
                    "Bearer",
                    jwtUtils.getExpirationSeconds(),
                    new UserInfo(
                            user.getId().toString(),
                            user.getEmail(),
                            user.getName(),
                            user.getPictureUrl()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to authenticate with Google: " + e.getMessage(), e);
        }
    }

    /** Exchange authorization code for tokens (server-side flow) */
    public AuthResponse authenticateWithCode(String code, String redirectUri) {
        try {
            // Exchange code for tokens
            WebClient webClient =
                    WebClient.builder().baseUrl("https://oauth2.googleapis.com").build();

            String tokenResponse =
                    webClient
                            .post()
                            .uri("/token")
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                            .body(
                                    BodyInserters.fromFormData("code", code)
                                            .with("client_id", googleClientId)
                                            .with("client_secret", googleClientSecret)
                                            .with("redirect_uri", redirectUri)
                                            .with("grant_type", "authorization_code"))
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

            JsonNode tokenJson = objectMapper.readTree(tokenResponse);
            String idToken = tokenJson.get("id_token").asText();

            // Use the ID token to authenticate
            return authenticateWithIdToken(idToken);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to exchange authorization code: " + e.getMessage(), e);
        }
    }

    /** Get user by ID */
    public Optional<User> getUserById(String userId) {
        try {
            return userRepository.findById(java.util.UUID.fromString(userId));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /** Get current authenticated user from token */
    public Optional<User> getCurrentUser(String token) {
        if (token == null || !jwtUtils.validateToken(token)) {
            return Optional.empty();
        }
        return userRepository.findById(jwtUtils.getUserIdFromToken(token));
    }

    /**
     * Development-only login: creates or finds a user by email and generates a JWT. WARNING: This
     * should only be used for local development!
     */
    public AuthResponse devLogin(String email, String name) {
        // Find or create user by email
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseGet(
                                () -> {
                                    User newUser =
                                            new User(
                                                    email, name != null ? name : email, null, null);
                                    return userRepository.save(newUser);
                                });

        // Generate JWT
        String accessToken = jwtUtils.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(
                accessToken,
                "Bearer",
                jwtUtils.getExpirationSeconds(),
                new UserInfo(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getName(),
                        user.getPictureUrl()));
    }
}
