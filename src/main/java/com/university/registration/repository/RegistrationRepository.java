package com.university.registration.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.university.registration.model.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    List<Registration> findByStudentStudentId(Long studentId);
}
