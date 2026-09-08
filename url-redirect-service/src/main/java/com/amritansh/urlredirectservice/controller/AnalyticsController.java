package com.amritansh.urlredirectservice.controller;

import com.amritansh.urlredirectservice.dto.AnalyticsTrackRequest;
import com.amritansh.urlredirectservice.service.AnalyticsRedisService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final StringRedisTemplate redisTemplate;
    private final AnalyticsRedisService analyticsRedisService;

    public AnalyticsController(
            StringRedisTemplate redisTemplate,
            AnalyticsRedisService analyticsRedisService) {

        this.redisTemplate = redisTemplate;
        this.analyticsRedisService = analyticsRedisService;
    }

    @PostMapping("/track")
    public ResponseEntity<Map<String, Object>> trackRedirect(
            @RequestBody AnalyticsTrackRequest request) {

        if (request.getShortCode() == null ||
                request.getShortCode().isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "Short code is required"
                    )
            );
        }

        String region = request.getRegion();

        if (region == null || region.isBlank()) {
            region = "UNKNOWN";
        }

        // Get URL information directly from Redis.
        String redisKey = "url:" + request.getShortCode();

        String cachedValue =
                redisTemplate.opsForValue().get(redisKey);

        if (cachedValue == null) {
            return ResponseEntity.notFound().build();
        }

        // Current Redis format:
        // active|urlId|originalUrl

        String[] parts = cachedValue.split("\\|", 3);

        if (parts.length != 3) {
            return ResponseEntity.notFound().build();
        }

        boolean active =
                Boolean.parseBoolean(parts[0]);

        Long urlId =
                Long.parseLong(parts[1]);

        // Don't count disabled URLs.
        if (!active) {
            return ResponseEntity.status(403).body(
                    Map.of(
                            "success", false,
                            "message", "Short URL is disabled"
                    )
            );
        }

        // Record analytics in Redis only.
        analyticsRedisService.recordRedirect(
                urlId,
                region
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true
                )
        );
    }
}