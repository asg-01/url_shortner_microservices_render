package com.amritansh.urlcreationservice.controller;

import com.amritansh.urlcreationservice.service.AnalyticsSyncService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsSyncService analyticsSyncService;

    public AnalyticsController(AnalyticsSyncService analyticsSyncService) {
        this.analyticsSyncService = analyticsSyncService;
    }

    @PostMapping("/sync")
    public Map<String, Object> syncAnalytics() {
        int updated = analyticsSyncService.sync();

        return Map.of(
                "success", true,
                "updatedBuckets", updated
        );
    }
}