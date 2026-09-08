package com.amritansh.urlredirectservice.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "short_urls")
public class ShortUrl {

    @Id
    private Long id;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false, length = 2048)
    private String originalUrl;

    @Column(nullable = false, unique = true, length = 6)
    private String shortCode;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    public ShortUrl() {
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public void setShortCode(String shortCode) {
        this.shortCode = shortCode;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isActive() {
        return active;
    }
}