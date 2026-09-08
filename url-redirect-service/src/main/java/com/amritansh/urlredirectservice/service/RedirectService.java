package com.amritansh.urlredirectservice.service;

import com.amritansh.urlredirectservice.entity.ShortUrl;
import com.amritansh.urlredirectservice.repository.UrlRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class RedirectService {

    private final UrlRepository urlRepository;
    private final StringRedisTemplate redisTemplate;

    public RedirectService(
            UrlRepository urlRepository,
            StringRedisTemplate redisTemplate) {

        this.urlRepository = urlRepository;
        this.redisTemplate = redisTemplate;
    }

    public String getOriginalUrl(String shortCode) {

        String redisKey = "url:" + shortCode;

        // =====================================================
        // 1. CHECK REDIS
        // =====================================================

        String cachedValue =
                redisTemplate
                        .opsForValue()
                        .get(redisKey);

        if (cachedValue != null) {

            // Format:
            // active|urlId|originalUrl

            String[] parts =
                    cachedValue.split("\\|", 3);

            if (parts.length == 3) {

                boolean active =
                        Boolean.parseBoolean(parts[0]);

                String originalUrl =
                        parts[2];

                if (!active) {
                    throw new RuntimeException(
                            "Short URL is temporarily disabled"
                    );
                }

                return originalUrl;
            }

            // Old Redis format detected.
            redisTemplate.delete(redisKey);
        }

        // =====================================================
        // 2. REDIS MISS → MYSQL
        // =====================================================

        ShortUrl shortUrl =
                urlRepository
                        .findByShortCode(shortCode)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Short URL not found"
                                )
                        );

        // =====================================================
        // 3. CHECK ACTIVE STATUS
        // =====================================================

        if (!shortUrl.isActive()) {

            redisTemplate.delete(redisKey);

            throw new RuntimeException(
                    "Short URL is temporarily disabled"
            );
        }

        // =====================================================
        // 4. CHECK EXPIRATION
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        if (!shortUrl.getExpiresAt().isAfter(now)) {

            redisTemplate.delete(redisKey);

            throw new RuntimeException(
                    "Short URL has expired"
            );
        }

        // =====================================================
        // 5. CALCULATE REMAINING TTL
        // =====================================================

        long remainingSeconds =
                Duration.between(
                        now,
                        shortUrl.getExpiresAt()
                ).getSeconds();

        // =====================================================
        // 6. CACHE URL + ACTIVE STATUS + URL ID
        // =====================================================

        String cachedValueToStore =
                shortUrl.isActive()
                        + "|"
                        + shortUrl.getId()
                        + "|"
                        + shortUrl.getOriginalUrl();

        redisTemplate.opsForValue().set(
                redisKey,
                cachedValueToStore,
                remainingSeconds,
                TimeUnit.SECONDS
        );

        return shortUrl.getOriginalUrl();
    }

    // =====================================================
    // STATUS CHECK
    // Does NOT perform a 302 redirect.
    // =====================================================

    public void checkStatus(String shortCode) {

        String redisKey = "url:" + shortCode;

        // =====================================================
        // 1. CHECK REDIS
        // =====================================================

        String cachedValue =
                redisTemplate
                        .opsForValue()
                        .get(redisKey);

        if (cachedValue != null) {

            String[] parts =
                    cachedValue.split("\\|", 3);

            if (parts.length == 3) {

                boolean active =
                        Boolean.parseBoolean(parts[0]);

                if (!active) {
                    throw new RuntimeException(
                            "Short URL is temporarily disabled"
                    );
                }

                return;
            }

            // Old Redis format detected.
            redisTemplate.delete(redisKey);
        }

        // =====================================================
        // 2. REDIS MISS → MYSQL
        // =====================================================

        ShortUrl shortUrl =
                urlRepository
                        .findByShortCode(shortCode)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Short URL not found"
                                )
                        );

        // =====================================================
        // 3. CHECK ACTIVE STATUS
        // =====================================================

        if (!shortUrl.isActive()) {

            redisTemplate.delete(redisKey);

            throw new RuntimeException(
                    "Short URL is temporarily disabled"
            );
        }

        // =====================================================
        // 4. CHECK EXPIRATION
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        if (!shortUrl.getExpiresAt().isAfter(now)) {

            redisTemplate.delete(redisKey);

            throw new RuntimeException(
                    "Short URL has expired"
            );
        }

        // =====================================================
        // 5. CALCULATE REMAINING TTL
        // =====================================================

        long remainingSeconds =
                Duration.between(
                        now,
                        shortUrl.getExpiresAt()
                ).getSeconds();

        // =====================================================
        // 6. CACHE VALID URL
        // =====================================================

        String newCachedValue =
                shortUrl.isActive()
                        + "|"
                        + shortUrl.getId()
                        + "|"
                        + shortUrl.getOriginalUrl();

        redisTemplate.opsForValue().set(
                redisKey,
                newCachedValue,
                remainingSeconds,
                TimeUnit.SECONDS
        );
    }
}