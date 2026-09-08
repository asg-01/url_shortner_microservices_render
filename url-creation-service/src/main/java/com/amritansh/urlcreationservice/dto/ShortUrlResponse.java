package com.amritansh.urlcreationservice.dto;

import java.time.LocalDateTime;

public class ShortUrlResponse {

    private Long id;
    private String originalUrl;
    private String shortCode;
    private LocalDateTime expiresAt;
    private boolean active;

    public ShortUrlResponse(
            Long id,
            String originalUrl,
            String shortCode,
            LocalDateTime expiresAt,
            boolean active) {

        this.id = id;
        this.originalUrl = originalUrl;
        this.shortCode = shortCode;
        this.expiresAt = expiresAt;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public String getShortCode() {
        return shortCode;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isActive() {
        return active;
    }
}