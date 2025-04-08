package com.university.registration.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class CatalogServiceConfig {

    @Bean
    public WebClient catalogServiceWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000") // Catalog Service URL
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
