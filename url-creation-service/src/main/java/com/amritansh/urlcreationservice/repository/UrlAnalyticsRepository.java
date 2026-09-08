package com.amritansh.urlcreationservice.repository;

import com.amritansh.urlcreationservice.entity.UrlAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UrlAnalyticsRepository
        extends JpaRepository<UrlAnalytics, Long> {

    Optional<UrlAnalytics> findByUrlIdAndAnalyticsDateAndHourAndRegion(
            Long urlId,
            LocalDate analyticsDate,
            int hour,
            String region
    );

    List<UrlAnalytics> findByUrlId(Long urlId);

    List<UrlAnalytics> findByUrlIdAndAnalyticsDateBetween(
            Long urlId,
            LocalDate startDate,
            LocalDate endDate
    );

    void deleteByUrlId(Long urlId);
}