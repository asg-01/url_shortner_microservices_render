package com.amritansh.urlcreationservice.controller;

import com.amritansh.urlcreationservice.service.AnalyticsDashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsDashboardController {

    private final AnalyticsDashboardService analyticsDashboardService;

    public AnalyticsDashboardController(
            AnalyticsDashboardService analyticsDashboardService) {
        this.analyticsDashboardService = analyticsDashboardService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication authentication) {

        return analyticsDashboardService.getDashboard(
                authentication.getName()
        );
    }
}