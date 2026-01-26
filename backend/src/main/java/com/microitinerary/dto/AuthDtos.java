package com.microitinerary.dto;

/** DTOs for Authentication operations */
public class AuthDtos {

    // Google OAuth token request
    public record GoogleAuthRequest(
            String code, // Authorization code from Google
            String idToken, // ID token from frontend Google Sign-In
            String redirectUri) {}

    // Authentication response with JWT
    public record AuthResponse(
            String accessToken, String tokenType, long expiresIn, UserInfo user) {}

    // User info included in auth response
    public record UserInfo(String id, String email, String name, String pictureUrl) {}

    // Token refresh request
    public record RefreshTokenRequest(String refreshToken) {}

    // Generic API response
    public record ApiResponse<T>(boolean success, String message, T data) {
        public static <T> ApiResponse<T> success(T data) {
            return new ApiResponse<>(true, "Success", data);
        }

        public static <T> ApiResponse<T> success(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }

        public static <T> ApiResponse<T> error(String message) {
            return new ApiResponse<>(false, message, null);
        }
    }

    // Development login request (for local testing only)
    public record DevLoginRequest(String email, String name) {}
}
