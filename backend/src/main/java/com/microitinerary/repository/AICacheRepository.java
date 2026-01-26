package com.microitinerary.repository;

import com.microitinerary.domain.AICache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AICacheRepository extends JpaRepository<AICache, UUID> {

    Optional<AICache> findByCacheKey(String cacheKey);

    // Find valid (non-expired) cache entry
    @Query("SELECT ac FROM AICache ac WHERE ac.cacheKey = :key AND ac.expiresAt > :now")
    Optional<AICache> findValidByCacheKey(@Param("key") String key, @Param("now") LocalDateTime now);

    // Delete expired entries
    @Modifying
    @Query("DELETE FROM AICache ac WHERE ac.expiresAt < :now")
    int deleteExpired(@Param("now") LocalDateTime now);

    // Check if valid cache exists
    @Query("SELECT COUNT(ac) > 0 FROM AICache ac WHERE ac.cacheKey = :key AND ac.expiresAt > :now")
    boolean existsValidByCacheKey(@Param("key") String key, @Param("now") LocalDateTime now);
}
