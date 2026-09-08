package com.amritansh.urlcreationservice.service;

import com.amritansh.urlcreationservice.entity.ShortUrl;
import com.amritansh.urlcreationservice.entity.User;
import com.amritansh.urlcreationservice.repository.UrlAnalyticsRepository;
import com.amritansh.urlcreationservice.repository.UrlRepository;
import com.amritansh.urlcreationservice.repository.UserRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class UrlService {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final UrlAnalyticsRepository analyticsRepository;
    private final RedisCounterService redisCounterService;
    private final ShortCodeService shortCodeService;
    private final StringRedisTemplate redisTemplate;
    private final UrlHashService urlHashService;

    public UrlService(
            UrlRepository urlRepository,
            UserRepository userRepository,
            UrlAnalyticsRepository analyticsRepository,
            RedisCounterService redisCounterService,
            ShortCodeService shortCodeService,
            StringRedisTemplate redisTemplate,
            UrlHashService urlHashService) {

        this.urlRepository = urlRepository;
        this.userRepository = userRepository;
        this.analyticsRepository = analyticsRepository;
        this.redisCounterService = redisCounterService;
        this.shortCodeService = shortCodeService;
        this.redisTemplate = redisTemplate;
        this.urlHashService = urlHashService;
    }

    // =========================================================
    // URL VALIDATION
    // =========================================================

    private void validateUrl(String originalUrl) {

        try {

            URI uri = URI.create(originalUrl);

            String scheme = uri.getScheme();

            if (scheme == null ||
                    (!scheme.equalsIgnoreCase("http")
                            && !scheme.equalsIgnoreCase("https"))) {

                throw new RuntimeException(
                        "Only HTTP and HTTPS URLs are allowed"
                );
            }

            if (uri.getHost() == null) {

                throw new RuntimeException(
                        "Invalid URL"
                );
            }

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid URL"
            );
        }
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Transactional
    public ShortUrl createShortUrl(
            String originalUrl,
            User user) {

        validateUrl(originalUrl);

        // Lock user's database row
        User lockedUser = userRepository
                .findById(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Create SHA-256 hash
        String originalUrlHash =
                urlHashService.hash(originalUrl);

        // Same user cannot shorten same URL twice
        if (urlRepository.existsByUserAndOriginalUrlHash(
                lockedUser,
                originalUrlHash)) {

            throw new RuntimeException(
                    "You already shortened this URL"
            );
        }

        // Maximum 4 URLs per user
        long count =
                urlRepository.countByUser(lockedUser);

        if (count >= 4) {

            throw new RuntimeException(
                    "Maximum 4 URLs allowed"
            );
        }

        // Generate globally unique ID
        long id =
                redisCounterService.getNextId();

        // Convert ID into 6-character short code
        String shortCode =
                shortCodeService.encode(id);

        // Default expiration = 1 year
        LocalDateTime expiresAt =
                LocalDateTime.now().plusYears(1);

        ShortUrl shortUrl =
                new ShortUrl();

        shortUrl.setOriginalUrl(originalUrl);
        shortUrl.setOriginalUrlHash(originalUrlHash);
        shortUrl.setShortCode(shortCode);
        shortUrl.setExpiresAt(expiresAt);
        shortUrl.setUser(lockedUser);

        return urlRepository.save(shortUrl);
    }

    // =========================================================
    // GET USER URLS
    // =========================================================

    public List<ShortUrl> getUserUrls(User user) {

        return urlRepository.findByUser(user);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public ShortUrl updateUrl(
            Long id,
            String originalUrl,
            User user) {

        validateUrl(originalUrl);

        ShortUrl shortUrl = urlRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "URL not found"
                        ));

        String originalUrlHash =
                urlHashService.hash(originalUrl);

        // Prevent duplicate URL belonging to another record
        if (urlRepository.existsByUserAndOriginalUrlHashAndIdNot(
                user,
                originalUrlHash,
                id)) {

            throw new RuntimeException(
                    "You already shortened this URL"
            );
        }

        shortUrl.setOriginalUrl(originalUrl);
        shortUrl.setOriginalUrlHash(originalUrlHash);

        ShortUrl updatedUrl =
                urlRepository.save(shortUrl);

        // Update Redis cache
        // Expiration date stays unchanged.
        long remainingSeconds =
                java.time.Duration.between(
                        LocalDateTime.now(),
                        shortUrl.getExpiresAt()
                ).getSeconds();

        if (remainingSeconds > 0) {

            String cachedValue =
                    shortUrl.isActive()
                            + "|" + originalUrl;

            redisTemplate.opsForValue().set(
                    "url:" + shortUrl.getShortCode(),
                    cachedValue,
                    remainingSeconds,
                    java.util.concurrent.TimeUnit.SECONDS
            );

        } else {

            redisTemplate.delete(
                    "url:" + shortUrl.getShortCode()
            );
        }

        return updatedUrl;
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Transactional
    public void deleteUrl(
            Long id,
            User user) {

        ShortUrl shortUrl = urlRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "URL not found"
                        ));

        String shortCode = shortUrl.getShortCode();

        // Remove URL cache
        redisTemplate.delete(
                "url:" + shortCode
        );

        // Remove analytics Redis keys
        Set<String> analyticsKeys =
                redisTemplate.keys(
                        "analytics:" + id + ":*"
                );

        if (analyticsKeys != null && !analyticsKeys.isEmpty()) {

            redisTemplate.delete(analyticsKeys);

            // Remove analytics keys from dirty set
            redisTemplate.opsForSet()
                    .remove(
                            "analytics:dirty",
                            analyticsKeys.toArray()
                    );
        }

        // Remove all analytics from MySQL
        analyticsRepository.deleteByUrlId(id);

        // Remove URL from MySQL
        urlRepository.delete(shortUrl);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public ShortUrl updateUrlStatus(
            Long id,
            boolean active,
            User user) {

        ShortUrl shortUrl = urlRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new RuntimeException("URL not found"));

        shortUrl.setActive(active);

        ShortUrl updatedUrl =
                urlRepository.save(shortUrl);

        /*
         * Remove cached URL so Redirect Service
         * fetches the latest state from MySQL.
         */
        redisTemplate.delete(
                "url:" + shortUrl.getShortCode()
        );

        return updatedUrl;
    }

}