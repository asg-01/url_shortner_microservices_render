package com.amritansh.urlcreationservice.controller;

import com.amritansh.urlcreationservice.dto.CreateUrlRequest;
import com.amritansh.urlcreationservice.dto.ShortUrlResponse;
import com.amritansh.urlcreationservice.dto.UpdateUrlRequest;
import com.amritansh.urlcreationservice.entity.ShortUrl;
import com.amritansh.urlcreationservice.entity.User;
import com.amritansh.urlcreationservice.service.UrlService;
import com.amritansh.urlcreationservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/urls")
public class UrlController {

    private final UrlService urlService;
    private final UserService userService;

    public UrlController(
            UrlService urlService,
            UserService userService) {

        this.urlService = urlService;
        this.userService = userService;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ShortUrlResponse createUrl(
            @Valid @RequestBody CreateUrlRequest request,
            Authentication authentication) {

        User user =
                userService.getUserByEmail(authentication.getName());

        ShortUrl shortUrl =
                urlService.createShortUrl(
                        request.getOriginalUrl(),
                        user
                );

        return new ShortUrlResponse(
                shortUrl.getId(),
                shortUrl.getOriginalUrl(),
                shortUrl.getShortCode(),
                shortUrl.getExpiresAt(),
                shortUrl.isActive()
        );
    }

    // =========================================================
    // GET MY URLS
    // =========================================================

    @GetMapping
    public List<ShortUrlResponse> getMyUrls(
            Authentication authentication) {

        User user =
                userService.getUserByEmail(authentication.getName());

        return urlService.getUserUrls(user)
                .stream()
                .map(url -> new ShortUrlResponse(
                        url.getId(),
                        url.getOriginalUrl(),
                        url.getShortCode(),
                        url.getExpiresAt(),
                        url.isActive()
                ))
                .toList();
    }

    // =========================================================
    // UPDATE URL
    // =========================================================

    @PutMapping("/{id}")
    public ShortUrlResponse updateUrl(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUrlRequest request,
            Authentication authentication) {

        User user =
                userService.getUserByEmail(authentication.getName());

        ShortUrl shortUrl =
                urlService.updateUrl(
                        id,
                        request.getOriginalUrl(),
                        user
                );

        return new ShortUrlResponse(
                shortUrl.getId(),
                shortUrl.getOriginalUrl(),
                shortUrl.getShortCode(),
                shortUrl.getExpiresAt(),
                shortUrl.isActive()
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUrl(
            @PathVariable Long id,
            Authentication authentication) {

        User user =
                userService.getUserByEmail(authentication.getName());

        urlService.deleteUrl(id, user);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // ENABLE / DISABLE
    // =========================================================

    @PutMapping("/{id}/status")
    public ShortUrlResponse updateUrlStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            Authentication authentication) {

        User user =
                userService.getUserByEmail(authentication.getName());

        ShortUrl shortUrl =
                urlService.updateUrlStatus(
                        id,
                        active,
                        user
                );

        return new ShortUrlResponse(
                shortUrl.getId(),
                shortUrl.getOriginalUrl(),
                shortUrl.getShortCode(),
                shortUrl.getExpiresAt(),
                shortUrl.isActive()
        );
    }
}