package com.university.registration.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.university.registration.model.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
}
