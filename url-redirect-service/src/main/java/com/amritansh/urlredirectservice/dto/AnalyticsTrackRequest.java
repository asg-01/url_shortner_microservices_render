package com.amritansh.urlredirectservice.dto;

public class AnalyticsTrackRequest {

    private String shortCode;
    private String region;

    public AnalyticsTrackRequest() {
    }

    public String getShortCode() {
        return shortCode;
    }

    public void setShortCode(String shortCode) {
        this.shortCode = shortCode;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}