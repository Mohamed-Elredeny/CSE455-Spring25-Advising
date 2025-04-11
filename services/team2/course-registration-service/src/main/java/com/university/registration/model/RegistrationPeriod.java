package com.university.registration.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "registration_periods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String semester;
    private String periodType; // EARLY, REGULAR, LATE
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer priorityLevel; // 1=highest priority
    private boolean isActive;

    // Getters and setters provided by Lombok
}
