package com.amritansh.urlcreationservice.config;

import com.amritansh.urlcreationservice.service.AnalyticsSyncService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AnalyticsSyncScheduler {

    private final AnalyticsSyncService analyticsSyncService;

    public AnalyticsSyncScheduler(
            AnalyticsSyncService analyticsSyncService) {
        this.analyticsSyncService = analyticsSyncService;
    }

    // Automatically sync analytics every 24 hours
    @Scheduled(fixedRate = 86400000)
    public void syncAnalytics() {
        analyticsSyncService.sync();
    }
}