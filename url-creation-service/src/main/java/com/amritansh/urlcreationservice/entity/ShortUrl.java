package com.amritansh.urlcreationservice.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "short_urls",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_original_url",
                        columnNames = {"user_id", "original_url_hash"}
                )
        }
)
public class ShortUrl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, length = 2048)
    private String originalUrl;

    @Column(nullable = false, unique = true, length = 6)
    private String shortCode;

    @Column(nullable = false, length = 64)
    private String originalUrlHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    public String getOriginalUrlHash() {
        return originalUrlHash;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public User getUser() {
        return user;
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

    public void setOriginalUrlHash(String originalUrlHash) {
        this.originalUrlHash = originalUrlHash;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}