package com.amritansh.urlredirectservice.controller;

import com.amritansh.urlredirectservice.service.RedirectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class RedirectController {

    private final RedirectService redirectService;

    public RedirectController(RedirectService redirectService) {
        this.redirectService = redirectService;
    }

    // =====================================================
    // STATUS CHECK
    // Used by React before performing the real redirect.
    // =====================================================

    @GetMapping("/api/redirect/{shortCode}/status")
    public ResponseEntity<Map<String, Object>> checkStatus(
            @PathVariable String shortCode) {

        try {

            redirectService.checkStatus(shortCode);

            return ResponseEntity.ok(
                    Map.of("active", true)
            );

        } catch (RuntimeException e) {

            if ("Short URL is temporarily disabled"
                    .equals(e.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "active", false,
                                "message", e.getMessage()
                        ));
            }

            if ("Short URL has expired"
                    .equals(e.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.GONE)
                        .body(Map.of(
                                "active", false,
                                "message", e.getMessage()
                        ));
            }

            if ("Short URL not found"
                    .equals(e.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "active", false,
                                "message", e.getMessage()
                        ));
            }

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "active", false,
                            "message", "Internal server error"
                    ));
        }
    }

    // =====================================================
    // ACTUAL REDIRECT
    // =====================================================

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode) {

        try {

            String originalUrl =
                    redirectService.getOriginalUrl(shortCode);

            return ResponseEntity
                    .status(HttpStatus.FOUND)
                    .header("Location", originalUrl)
                    .build();

        } catch (RuntimeException e) {

            if ("Short URL is temporarily disabled"
                    .equals(e.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .build();
            }

            if ("Short URL has expired"
                    .equals(e.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.GONE)
                        .build();
            }

            if ("Short URL not found"
                    .equals(e.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .build();
            }

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }
}