package com.university.registration.controller;

import com.university.registration.model.Course;
import com.university.registration.model.Student;
import com.university.registration.model.WaitlistEntry;
import com.university.registration.service.WaitlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    @Autowired
    private WaitlistService waitlistService;

    // Add student to waitlist
    @PostMapping("/add")
    public WaitlistEntry addToWaitlist(@RequestBody WaitlistEntry waitlistEntry) {
        return waitlistService.addToWaitlist(waitlistEntry.getStudent(), waitlistEntry.getCourse());
    }

    // Get waitlist for a course
    @GetMapping("/course/{courseId}")
    public List<WaitlistEntry> getWaitlistForCourse(@PathVariable Long courseId) {
        Course course = new Course();
        course.setCourseId(courseId); // Set the course ID for the lookup
        return waitlistService.getWaitlistForCourse(course);
    }

    // Get waitlist for a student
    @GetMapping("/student/{studentId}")
    public List<WaitlistEntry> getWaitlistForStudent(@PathVariable Long studentId) {
        Student student = new Student();
        student.setStudentId(studentId); // Set the student ID for the lookup
        return waitlistService.getWaitlistForStudent(student);
    }

    // Remove student from waitlist
    @DeleteMapping("/remove/{entryId}")
    public void removeFromWaitlist(@PathVariable Long entryId) {
        WaitlistEntry entry = waitlistService.getWaitlistEntryById(entryId)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));
        waitlistService.removeFromWaitlist(entry);
    }

    // Get next eligible student for promotion
    @GetMapping("/next/{courseId}")
    public WaitlistEntry getNextEligible(@PathVariable Long courseId) {
        Course course = new Course();
        course.setCourseId(courseId);
        return waitlistService.getNextEligibleForPromotion(course)
                .orElseThrow(() -> new RuntimeException("No eligible students in waitlist"));
    }
}
