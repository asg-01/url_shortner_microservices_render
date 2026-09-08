package com.amritansh.urlcreationservice.service;

import com.amritansh.urlcreationservice.entity.ShortUrl;
import com.amritansh.urlcreationservice.entity.UrlAnalytics;
import com.amritansh.urlcreationservice.entity.User;
import com.amritansh.urlcreationservice.repository.UrlAnalyticsRepository;
import com.amritansh.urlcreationservice.repository.UrlRepository;
import com.amritansh.urlcreationservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnalyticsDashboardService {

    private final UrlRepository urlRepository;
    private final UrlAnalyticsRepository analyticsRepository;
    private final UserRepository userRepository;

    public AnalyticsDashboardService(
            UrlRepository urlRepository,
            UrlAnalyticsRepository analyticsRepository,
            UserRepository userRepository) {

        this.urlRepository = urlRepository;
        this.analyticsRepository = analyticsRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<ShortUrl> urls =
                urlRepository.findByUser(user);

        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.minusDays(29);
        LocalDate yearStart = today.minusDays(364);

        long total = 0;
        long last24Hours = 0;
        long last30Days = 0;
        long last1Year = 0;

        List<Map<String, Object>> urlData =
                new ArrayList<>();

        Map<String, Long> regionTotals =
                new HashMap<>();

        // New: hourly data for charts
        List<Map<String, Object>> hourlyData =
                new ArrayList<>();

        for (ShortUrl url : urls) {

            List<UrlAnalytics> analytics =
                    analyticsRepository.findByUrlId(url.getId());

            long urlTotal = 0;
            long url24h = 0;
            long url30d = 0;
            long url1y = 0;

            String topRegion = "UNKNOWN";
            long topRegionCount = 0;

            for (UrlAnalytics item : analytics) {

                long count = item.getRedirectCount();
                String region = item.getRegion();

                if ("GLOBAL".equalsIgnoreCase(region)) {

                    urlTotal += count;

                    // Today's hourly buckets = current day's analytics
                    if (item.getAnalyticsDate().equals(today)) {
                        url24h += count;

                        Map<String, Object> hourData =
                                new LinkedHashMap<>();

                        hourData.put(
                                "date",
                                item.getAnalyticsDate().toString()
                        );

                        hourData.put(
                                "hour",
                                item.getHour()
                        );

                        hourData.put(
                                "redirects",
                                count
                        );

                        hourData.put(
                                "urlId",
                                url.getId()
                        );

                        hourlyData.add(hourData);
                    }

                    if (!item.getAnalyticsDate().isBefore(monthStart)) {
                        url30d += count;
                    }

                    if (!item.getAnalyticsDate().isBefore(yearStart)) {
                        url1y += count;
                    }

                } else {

                    regionTotals.merge(
                            region,
                            count,
                            Long::sum
                    );

                    if (count > topRegionCount) {
                        topRegionCount = count;
                        topRegion = region;
                    }
                }
            }

            total += urlTotal;
            last24Hours += url24h;
            last30Days += url30d;
            last1Year += url1y;

            Map<String, Object> urlResult =
                    new LinkedHashMap<>();

            urlResult.put("urlId", url.getId());
            urlResult.put("shortCode", url.getShortCode());
            urlResult.put("originalUrl", url.getOriginalUrl());
            urlResult.put("active", url.isActive());
            urlResult.put("totalRedirects", urlTotal);
            urlResult.put("redirectsLast24Hours", url24h);
            urlResult.put("redirectsLast30Days", url30d);
            urlResult.put("redirectsLast1Year", url1y);
            urlResult.put("topRegion", topRegion);

            urlData.add(urlResult);
        }

        List<Map<String, Object>> regions =
                new ArrayList<>();

        for (Map.Entry<String, Long> entry
                : regionTotals.entrySet()) {

            double percentage =
                    total == 0
                            ? 0
                            : (entry.getValue() * 100.0) / total;

            Map<String, Object> region =
                    new LinkedHashMap<>();

            region.put("region", entry.getKey());
            region.put("code", entry.getKey());
            region.put("redirects", entry.getValue());
            region.put(
                    "percentage",
                    Math.round(percentage * 10.0) / 10.0
            );

            regions.add(region);
        }

        regions.sort((a, b) ->
                Long.compare(
                        (Long) b.get("redirects"),
                        (Long) a.get("redirects")
                )
        );

        // Sort hourly data by date + hour
        hourlyData.sort((a, b) -> {
            String dateA = (String) a.get("date");
            String dateB = (String) b.get("date");

            int dateCompare = dateA.compareTo(dateB);

            if (dateCompare != 0) {
                return dateCompare;
            }

            return Integer.compare(
                    (Integer) a.get("hour"),
                    (Integer) b.get("hour")
            );
        });

        Map<String, Object> summary =
                new LinkedHashMap<>();

        summary.put("totalRedirects", total);
        summary.put("redirectsLast24Hours", last24Hours);
        summary.put("redirectsLast30Days", last30Days);
        summary.put("redirectsLast1Year", last1Year);

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("summary", summary);
        response.put("regions", regions);
        response.put("urls", urlData);
        response.put("hourlyData", hourlyData);
        response.put("lastSyncedAt", LocalDateTime.now());

        return response;
    }
}