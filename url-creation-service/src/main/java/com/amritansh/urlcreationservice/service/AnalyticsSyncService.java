package com.amritansh.urlcreationservice.service;

import com.amritansh.urlcreationservice.entity.UrlAnalytics;
import com.amritansh.urlcreationservice.repository.UrlAnalyticsRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Set;

@Service
public class AnalyticsSyncService {

    private static final String DIRTY_KEY = "analytics:dirty";

    private final StringRedisTemplate redisTemplate;
    private final UrlAnalyticsRepository analyticsRepository;

    public AnalyticsSyncService(
            StringRedisTemplate redisTemplate,
            UrlAnalyticsRepository analyticsRepository) {
        this.redisTemplate = redisTemplate;
        this.analyticsRepository = analyticsRepository;
    }

    public int sync() {

        Set<String> dirtyKeys =
                redisTemplate.opsForSet().members(DIRTY_KEY);

        if (dirtyKeys == null || dirtyKeys.isEmpty()) {
            return 0;
        }

        int updated = 0;

        for (String key : dirtyKeys) {

            String[] parts = key.split(":");

            // analytics:urlId:date:hour:region
            if (parts.length != 5) {
                continue;
            }

            Long urlId = Long.parseLong(parts[1]);
            LocalDate date = LocalDate.parse(parts[2]);
            int hour = Integer.parseInt(parts[3]);
            String region = parts[4];

            String value = redisTemplate.opsForValue().get(key);

            if (value == null) {
                redisTemplate.opsForSet().remove(DIRTY_KEY, key);
                continue;
            }

            long redisCount = Long.parseLong(value);

            UrlAnalytics analytics =
                    analyticsRepository
                            .findByUrlIdAndAnalyticsDateAndHourAndRegion(
                                    urlId,
                                    date,
                                    hour,
                                    region
                            )
                            .orElseGet(() ->
                                    new UrlAnalytics(
                                            urlId,
                                            date,
                                            hour,
                                            region,
                                            0
                                    )
                            );

            if (analytics.getRedirectCount() != redisCount) {

                analytics.setRedirectCount(redisCount);

                analyticsRepository.save(analytics);

                updated++;
            }
        }

        return updated;
    }
}