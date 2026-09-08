package com.amritansh.urlcreationservice.service;

import com.amritansh.urlcreationservice.entity.ShortUrl;
import com.amritansh.urlcreationservice.repository.UrlRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisCounterService {

    private static final String COUNTER_KEY = "url_counter";

    private final StringRedisTemplate redisTemplate;
    private final UrlRepository urlRepository;
    private final ShortCodeService shortCodeService;

    public RedisCounterService(
            StringRedisTemplate redisTemplate,
            UrlRepository urlRepository,
            ShortCodeService shortCodeService) {

        this.redisTemplate = redisTemplate;
        this.urlRepository = urlRepository;
        this.shortCodeService = shortCodeService;
    }

    public long getNextId() {

        String currentValue =
                redisTemplate.opsForValue().get(COUNTER_KEY);

        // Redis counter exists
        if (currentValue != null) {
            return redisTemplate
                    .opsForValue()
                    .increment(COUNTER_KEY);
        }

        // Redis counter was deleted/flushed.
        // Recover it from MySQL.
        initializeCounterFromDatabase();

        return redisTemplate
                .opsForValue()
                .increment(COUNTER_KEY);
    }

    private void initializeCounterFromDatabase() {

        long maxCounter = 0;

        for (ShortUrl shortUrl : urlRepository.findAll()) {

            long counter =
                    shortCodeService.decode(
                            shortUrl.getShortCode()
                    );

            if (counter > maxCounter) {
                maxCounter = counter;
            }
        }

        // Only initialize if another thread/instance
        // hasn't already initialized the counter.
        redisTemplate.opsForValue().setIfAbsent(
                COUNTER_KEY,
                String.valueOf(maxCounter)
        );
    }
}