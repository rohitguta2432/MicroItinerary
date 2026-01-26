package com.microitinerary.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * AI Cache entity for storing OpenAI API responses. Used as a fallback when Redis is unavailable.
 */
@Entity
@Table(name = "ai_cache")
public class AICache {

    @Id private UUID id;

    @Column(name = "cache_key", nullable = false, unique = true, length = 500)
    private String cacheKey;

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String response;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AICache() {
        this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
        // Default expiration: 24 hours
        this.expiresAt = LocalDateTime.now().plusHours(24);
    }

    public AICache(String cacheKey, String response) {
        this();
        this.cacheKey = cacheKey;
        this.response = response;
    }

    public AICache(String cacheKey, String response, int expirationHours) {
        this();
        this.cacheKey = cacheKey;
        this.response = response;
        this.expiresAt = LocalDateTime.now().plusHours(expirationHours);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCacheKey() {
        return cacheKey;
    }

    public void setCacheKey(String cacheKey) {
        this.cacheKey = cacheKey;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
