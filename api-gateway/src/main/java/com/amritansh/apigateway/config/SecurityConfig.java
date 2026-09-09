package com.amritansh.apigateway.config;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    // =========================================================
    // JWT DECODER
    // =========================================================

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {

        SecretKeySpec key = new SecretKeySpec(
                jwtSecret.getBytes(),
                "HmacSHA256"
        );

        return NimbusReactiveJwtDecoder
                .withSecretKey(key)
                .build();
    }

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(frontendUrl)
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================================================
    // SECURITY
    // =========================================================

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        return http

                .csrf(csrf -> csrf.disable())

                // Enable CORS through Spring Security
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .authorizeExchange(exchange -> exchange

                        // -------------------------------------------------
                        // CORS PREFLIGHT
                        // -------------------------------------------------

                        .pathMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // PUBLIC HEALTH CHECK
                        // -------------------------------------------------

                        .pathMatchers(
                                "/actuator/health"
                        ).permitAll()

                        // -------------------------------------------------
                        // PUBLIC AUTHENTICATION
                        // -------------------------------------------------

                        .pathMatchers(
                                "/api/users/signup",
                                "/api/users/login"
                        ).permitAll()

                        // -------------------------------------------------
                        // PUBLIC ANALYTICS TRACKING
                        // -------------------------------------------------

                        .pathMatchers(
                                HttpMethod.POST,
                                "/api/analytics/track"
                        ).permitAll()

                        // -------------------------------------------------
                        // PUBLIC REDIRECT STATUS
                        // -------------------------------------------------

                        .pathMatchers(
                                HttpMethod.GET,
                                "/api/redirect/**"
                        ).permitAll()

                        // -------------------------------------------------
                        // PUBLIC SHORT URL REDIRECT
                        // -------------------------------------------------

                        .pathMatchers(
                                HttpMethod.GET,
                                "/{shortCode}"
                        ).permitAll()

                        // -------------------------------------------------
                        // EVERYTHING ELSE REQUIRES JWT
                        // -------------------------------------------------

                        .anyExchange().authenticated()
                )

                // ---------------------------------------------------------
                // JWT RESOURCE SERVER
                // ---------------------------------------------------------

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> {})
                )

                .build();
    }
}