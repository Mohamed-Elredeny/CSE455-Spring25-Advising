package com.university.registration.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.registration.model.Course;
import com.university.registration.model.Student;
import com.university.registration.model.WaitlistEntry;
import com.university.registration.repository.WaitlistRepository;

@Service
public class WaitlistService {

    @Autowired
    private WaitlistRepository waitlistRepository;

    // Add student to waitlist
    public WaitlistEntry addToWaitlist(Student student, Course course) {
        if (waitlistRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("Student already in waitlist for this course.");
        }

        WaitlistEntry entry = new WaitlistEntry();
        entry.setStudent(student);
        entry.setCourse(course);
        entry.setTimestamp(LocalDateTime.now());

        return waitlistRepository.save(entry);
    }

    // Get waitlist by course
    public List<WaitlistEntry> getWaitlistForCourse(Course course) {
        return waitlistRepository.findByCourseOrderByTimestampAsc(course);
    }

    // Get all waitlisted courses for a student
    public List<WaitlistEntry> getWaitlistForStudent(Student student) {
        return waitlistRepository.findByStudent(student);
    }

    // Remove a student from waitlist
    public void removeFromWaitlist(WaitlistEntry entry) {
        waitlistRepository.delete(entry);
        updateWaitlistPositions(entry.getCourse());
    }

    // Update positions when entries are added/removed
    private void updateWaitlistPositions(Course course) {
        List<WaitlistEntry> entries = waitlistRepository.findByCourseOrderByTimestampAsc(course);
        for (int i = 0; i < entries.size(); i++) {
            WaitlistEntry entry = entries.get(i);
            entry.setPosition(i + 1);
            waitlistRepository.save(entry);
        }
    }

    // Get next student eligible for promotion
    public Optional<WaitlistEntry> getNextEligibleForPromotion(Course course) {
        return waitlistRepository.findByCourseOrderByTimestampAsc(course)
                .stream()
                .findFirst();
    }

    // Notify student of waitlist promotion
    public void notifyPromotion(WaitlistEntry entry) {
        entry.setNotified(true);
        entry.setNotificationSentAt(LocalDateTime.now());
        waitlistRepository.save(entry);
        // TODO: Implement actual notification logic
    }

    // Get waitlist entry by ID
    public Optional<WaitlistEntry> getWaitlistEntryById(Long entryId) {
        return waitlistRepository.findById(entryId);
    }
}
