package com.amritansh.apigateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

    @Bean
    public KeyResolver userKeyResolver() {

        return exchange -> {

            String ip = "unknown";

            if (exchange.getRequest().getRemoteAddress() != null
                    && exchange.getRequest()
                    .getRemoteAddress()
                    .getAddress() != null) {

                ip = exchange.getRequest()
                        .getRemoteAddress()
                        .getAddress()
                        .getHostAddress();
            }

            return Mono.just(ip);
        };
    }
}