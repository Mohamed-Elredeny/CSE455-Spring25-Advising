package com.university.registration.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.university.registration.model.RegistrationPeriod;

public interface RegistrationPeriodRepository extends JpaRepository<RegistrationPeriod, Long> {

    Optional<RegistrationPeriod> findFirstByIsActiveTrueOrderByStartDateDesc();
}
