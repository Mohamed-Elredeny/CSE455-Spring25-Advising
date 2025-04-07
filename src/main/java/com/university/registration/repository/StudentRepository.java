package com.university.registration.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.university.registration.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Student findByEmail(String email);
}
