package com.university.registration.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.university.registration.model.Course;
import com.university.registration.model.Registration; // Add this import
import com.university.registration.model.RegistrationStatus;
import com.university.registration.model.Student;
import com.university.registration.repository.CourseRepository;
import com.university.registration.repository.RegistrationRepository;
import com.university.registration.repository.StudentRepository;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private WaitlistService waitlistService;

    private static final int FULL_LOAD_CREDITS = 18;
    private static final int HALF_LOAD_CREDITS = 9;

    // ✅ Student Registration with GPA and Schedule Validation
    public Registration registerStudent(Long studentId, Long courseId, String semester) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // ✅ Determine max credits based on GPA
        int maxCredits = (student.getGpa() >= 2.0) ? FULL_LOAD_CREDITS : HALF_LOAD_CREDITS;

        // ✅ Check if student has exceeded their credit limit
        int totalCredits = registrationRepository.findByStudentStudentId(studentId).stream()
                .mapToInt(r -> r.getCourse().getCredits()).sum();

        if (totalCredits + course.getCredits() > maxCredits) {
            throw new RuntimeException("Credit limit exceeded! Your GPA allows a max of " + maxCredits + " credits.");
        }

        // ✅ Check for schedule conflicts (if course is not an open course)
        if (!course.isOpenCourse()) {
            List<Registration> existingRegistrations = registrationRepository.findByStudentStudentId(studentId);
            for (Registration r : existingRegistrations) {
                if (r.getCourse().getSchedule().equals(course.getSchedule())) {
                    throw new RuntimeException("Schedule conflict detected! Another course overlaps.");
                }
            }
        }

        // ✅ Register the student (pending approval by admin)
        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setCourse(course);
        registration.setSemester(semester);
        registration.setStatus(RegistrationStatus.PENDING);

        return registrationRepository.save(registration);
    }

    // ✅ Admin: Approve or Reject Registration
    public Registration updateRegistrationStatus(Long registrationId, RegistrationStatus status) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        registration.setStatus(status);
        Registration updated = registrationRepository.save(registration);

        // If a registration was rejected or canceled, check waitlist
        if (status == RegistrationStatus.REJECTED) {
            checkWaitlistForPromotion(updated.getCourse());
        }

        return updated;
    }

    private void checkWaitlistForPromotion(Course course) {
        // Only promote if course has available seats
        if (course.getAvailableSeats() > 0) {
            waitlistService.getNextEligibleForPromotion(course).ifPresent(entry -> {
                try {
                    // Attempt to register the waitlisted student
                    Registration registration = registerStudent(
                            entry.getStudent().getStudentId(),
                            entry.getCourse().getCourseId(),
                            "current-semester" // TODO: Get actual semester
                    );

                    // If successful, remove from waitlist and notify
                    waitlistService.removeFromWaitlist(entry);
                    waitlistService.notifyPromotion(entry);

                    // Update course available seats
                    course.setAvailableSeats(course.getAvailableSeats() - 1);
                    courseRepository.save(course);
                } catch (Exception e) {
                    // Log failure but continue
                    System.err.println("Failed to promote waitlisted student: " + e.getMessage());
                }
            });
        }
    }

    // ✅ Generate Student Timetable (Only Approved Courses)
    public List<Registration> generateTimetable(Long studentId) {
        return registrationRepository.findByStudentStudentId(studentId).stream()
                .filter(reg -> reg.getStatus() == RegistrationStatus.APPROVED)
                .collect(Collectors.toList()); // Corrected method to collect the stream
    }
}
