package com.amritansh.urlcreationservice.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "url_analytics",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_url_date_hour_region",
                        columnNames = {"url_id", "analytics_date", "hour", "region"}
                )
        }
)
public class UrlAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url_id", nullable = false)
    private Long urlId;

    @Column(name = "analytics_date", nullable = false)
    private LocalDate analyticsDate;

    @Column(nullable = false)
    private int hour;

    @Column(nullable = false, length = 100)
    private String region;

    @Column(nullable = false)
    private long redirectCount = 0;

    public UrlAnalytics() {
    }

    public UrlAnalytics(
            Long urlId,
            LocalDate analyticsDate,
            int hour,
            String region,
            long redirectCount) {

        this.urlId = urlId;
        this.analyticsDate = analyticsDate;
        this.hour = hour;
        this.region = region;
        this.redirectCount = redirectCount;
    }

    public Long getId() {
        return id;
    }

    public Long getUrlId() {
        return urlId;
    }

    public void setUrlId(Long urlId) {
        this.urlId = urlId;
    }

    public LocalDate getAnalyticsDate() {
        return analyticsDate;
    }

    public void setAnalyticsDate(LocalDate analyticsDate) {
        this.analyticsDate = analyticsDate;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public long getRedirectCount() {
        return redirectCount;
    }

    public void setRedirectCount(long redirectCount) {
        this.redirectCount = redirectCount;
    }
}