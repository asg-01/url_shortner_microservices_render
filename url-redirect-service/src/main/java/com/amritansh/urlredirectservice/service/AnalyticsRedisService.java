package com.amritansh.urlredirectservice.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class AnalyticsRedisService {

    private static final String DIRTY_KEY = "analytics:dirty";

    private final StringRedisTemplate redisTemplate;

    public AnalyticsRedisService(
            StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void recordRedirect(
            Long urlId,
            String region) {

        if (region == null || region.isBlank()) {
            region = "UNKNOWN";
        }

        String date = LocalDate.now().toString();
        int hour = LocalDateTime.now().getHour();

        // =====================================================
        // GLOBAL COUNTER
        // =====================================================

        String totalKey =
                "analytics:"
                        + urlId
                        + ":"
                        + date
                        + ":"
                        + hour
                        + ":GLOBAL";

        // =====================================================
        // REGION COUNTER
        // =====================================================

        String regionKey =
                "analytics:"
                        + urlId
                        + ":"
                        + date
                        + ":"
                        + hour
                        + ":"
                        + region;

        // =====================================================
        // INCREMENT REDIS COUNTERS
        // =====================================================

        redisTemplate
                .opsForValue()
                .increment(totalKey);

        redisTemplate
                .opsForValue()
                .increment(regionKey);

        // =====================================================
        // REDIS TTL
        // =====================================================

        redisTemplate.expire(
                totalKey,
                400,
                TimeUnit.DAYS
        );

        redisTemplate.expire(
                regionKey,
                400,
                TimeUnit.DAYS
        );

        // =====================================================
        // MARK KEYS AS DIRTY
        // Creation Service sync reads this SET.
        // =====================================================

        redisTemplate
                .opsForSet()
                .add(
                        DIRTY_KEY,
                        totalKey
                );

        redisTemplate
                .opsForSet()
                .add(
                        DIRTY_KEY,
                        regionKey
                );
    }
}