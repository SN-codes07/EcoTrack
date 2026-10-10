package com.ecotrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EcoTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcoTrackApplication.class, args);
    }
}
