package com.amritansh.urlcreationservice;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@EnableScheduling
@SpringBootApplication
public class UrlCreationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UrlCreationServiceApplication.class, args);
    }
}