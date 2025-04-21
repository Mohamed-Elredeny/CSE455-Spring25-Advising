package com.university.registration.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class CatalogServiceConfig {

    @Bean
    public WebClient catalogServiceWebClient() {
        String catalogServiceUrl = System.getenv().getOrDefault("CATALOG_SERVICE_URL", "http://localhost:8000");
        return WebClient.builder()
                .baseUrl(catalogServiceUrl) // Catalog Service URL
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
