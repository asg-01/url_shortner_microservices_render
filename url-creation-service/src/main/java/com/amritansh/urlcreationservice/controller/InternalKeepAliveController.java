package com.amritansh.urlcreationservice.controller;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class InternalKeepAliveController {

    private final DataSource dataSource;
    private final StringRedisTemplate redisTemplate;

    public InternalKeepAliveController(
            DataSource dataSource,
            StringRedisTemplate redisTemplate) {
        this.dataSource = dataSource;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/internal/keepalive")
    public ResponseEntity<Map<String, String>> keepAlive() {

        Map<String, String> response = new LinkedHashMap<>();

        // MySQL activity
        try (
                Connection connection = dataSource.getConnection();
                PreparedStatement statement = connection.prepareStatement("SELECT 1");
                ResultSet resultSet = statement.executeQuery()
        ) {
            if (resultSet.next() && resultSet.getInt(1) == 1) {
                response.put("mysql", "UP");
            } else {
                response.put("mysql", "DOWN");
            }
        } catch (Exception e) {
            response.put("mysql", "DOWN");
        }

        // Redis / Valkey activity
        try {
            String result = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();

            response.put(
                    "redis",
                    "PONG".equalsIgnoreCase(result) ? "UP" : "DOWN"
            );
        } catch (Exception e) {
            response.put("redis", "DOWN");
        }

        boolean healthy =
                "UP".equals(response.get("mysql")) &&
                        "UP".equals(response.get("redis"));

        response.put("status", healthy ? "UP" : "DEGRADED");

        return healthy
                ? ResponseEntity.ok(response)
                : ResponseEntity.internalServerError().body(response);
    }
}