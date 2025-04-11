package com.university.registration.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.university.registration.model.Course;
import com.university.registration.model.Student;
import com.university.registration.model.WaitlistEntry;

@Repository
public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {

    List<WaitlistEntry> findByCourseOrderByTimestampAsc(Course course);

    List<WaitlistEntry> findByStudent(Student student);

    boolean existsByStudentAndCourse(Student student, Course course);
}
