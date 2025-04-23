package com.university.registration.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.university.registration.model.Course;
import com.university.registration.model.Registration;
import com.university.registration.model.RegistrationPeriod;
import com.university.registration.model.RegistrationStatus; // Add this import
import com.university.registration.model.Student;
import com.university.registration.repository.CourseRepository;
import com.university.registration.repository.RegistrationPeriodRepository;
import com.university.registration.repository.RegistrationRepository;
import com.university.registration.repository.StudentRepository;
import com.university.registration.events.RegistrationEvent;
import com.university.registration.exception.StudentNotFoundException;
import com.university.registration.exception.CourseNotFoundException;
import com.university.registration.exception.CreditLimitExceededException;
import com.university.registration.exception.ScheduleConflictException;
import com.university.registration.exception.RegistrationPeriodException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(RegistrationService.class);

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private WaitlistService waitlistService;

    @Autowired
    private RegistrationPeriodRepository registrationPeriodRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    private static final int FULL_LOAD_CREDITS = 18;
    private static final int HALF_LOAD_CREDITS = 9;

    // ✅ Student Registration with GPA and Schedule Validation
    public Registration registerStudent(Long studentId, Long courseId, String semester) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));

        // Check if current time is within active registration period
        if (!isWithinRegistrationPeriod()) {
            throw new RegistrationPeriodException("Registration is not allowed outside the active registration period.");
        }

        // Determine max credits based on GPA
        int maxCredits = (student.getGpa() >= 2.0) ? FULL_LOAD_CREDITS : HALF_LOAD_CREDITS;

        // Check if student has exceeded their credit limit
        int totalCredits = registrationRepository.findByStudentStudentId(studentId).stream()
                .mapToInt(r -> r.getCourse().getCredits()).sum();

        if (totalCredits + course.getCredits() > maxCredits) {
            throw new CreditLimitExceededException("Credit limit exceeded! Your GPA allows a max of " + maxCredits + " credits.");
        }

        // Check for schedule conflicts (if course is not an open course)
        if (!course.isOpenCourse()) {
            List<Registration> existingRegistrations = registrationRepository.findByStudentStudentId(studentId);
            if (hasScheduleConflict(existingRegistrations, course)) {
                throw new ScheduleConflictException("Schedule conflict detected! Another course overlaps.");
            }
        }

        // Register the student (pending approval by admin)
        Registration registration = new Registration();
        registration.setStudent(student);
        registration.setCourse(course);
        registration.setSemester(semester);
        registration.setStatus(RegistrationStatus.PENDING);

        Registration saved = registrationRepository.save(registration);

        // Publish registration event
        eventPublisher.publishEvent(new RegistrationEvent(this, saved, "REGISTERED"));
        logger.info("Student {} registered for course {} in semester {}", saved.getStudent().getStudentId(), saved.getCourse().getCourseId(), saved.getSemester());

        return saved;
    }

    // Enhanced method to check if current time is within active registration period and enforce period rules
    private boolean isWithinRegistrationPeriod() {
        return registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()
                .map(period -> {
                    LocalDateTime now = LocalDateTime.now();
                    boolean withinPeriod = !now.isBefore(period.getStartDate()) && !now.isAfter(period.getEndDate());
                    if (!withinPeriod) {
                        return false;
                    }
                    // Additional rules based on periodType and priorityLevel
                    String periodType = period.getPeriodType();
                    int priority = period.getPriorityLevel();

                    // Example: EARLY period only allows students with GPA >= 3.0
                    if ("EARLY".equalsIgnoreCase(periodType)) {
                        // This check requires student context, so we may need to pass student info here or refactor
                        // For now, allow all
                        return true;
                    }

                    // Other period types can have different rules
                    return true;
                })
                .orElse(false);
    }

    // New method to get current registration period type
    public String getCurrentRegistrationPeriodType() {
        return registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()
                .map(period -> period.getPeriodType())
                .orElse("NONE");
    }

    // Enhanced method to check for schedule conflicts with detailed time overlap check
    private boolean hasScheduleConflict(List<Registration> existingRegistrations, Course newCourse) {
        for (Registration reg : existingRegistrations) {
            Course existingCourse = reg.getCourse();
            if (existingCourse == null || newCourse == null) {
                continue;
            }
            // Compare schedules by day and time
            String existingSchedule = existingCourse.getSchedule();
            String newSchedule = newCourse.getSchedule();
            if (existingSchedule == null || newSchedule == null) {
                continue;
            }
            // Example schedule format: "Mon 9-11"
            if (isScheduleOverlap(existingSchedule, newSchedule)) {
                return true;
            }
        }
        return false;
    }

    // Helper method to check if two schedules overlap
    private boolean isScheduleOverlap(String schedule1, String schedule2) {
        try {
            String[] parts1 = schedule1.split(" ");
            String[] parts2 = schedule2.split(" ");
            if (parts1.length < 2 || parts2.length < 2) {
                return false;
            }
            String day1 = parts1[0];
            String day2 = parts2[0];
            if (!day1.equals(day2)) {
                return false; // Different days, no conflict
            }
            String[] timeRange1 = parts1[1].split("-");
            String[] timeRange2 = parts2[1].split("-");
            if (timeRange1.length < 2 || timeRange2.length < 2) {
                return false;
            }
            int start1 = Integer.parseInt(timeRange1[0]);
            int end1 = Integer.parseInt(timeRange1[1]);
            int start2 = Integer.parseInt(timeRange2[0]);
            int end2 = Integer.parseInt(timeRange2[1]);

            // Check for overlap
            return start1 < end2 && start2 < end1;
        } catch (Exception e) {
            // In case of parsing errors, assume no conflict
            return false;
        }
    }

    // ✅ Admin: Approve or Reject Registration
    public Registration updateRegistrationStatus(Long registrationId, RegistrationStatus status) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        registration.setStatus(status);
        Registration updated = registrationRepository.save(registration);

        // Publish status update event
        eventPublisher.publishEvent(new RegistrationEvent(this, updated, "STATUS_UPDATED"));
        logger.info("Registration {} status updated to {}", updated.getRegistrationId(), status);

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
                .collect(Collectors.toList());
    }

    // ✅ Batch Registration
    public List<Registration> batchRegister(List<Registration> registrations) {
        return registrations.stream()
                .map(reg -> {
                    Registration newReg = new Registration();
                    newReg.setStudent(reg.getStudent());
                    newReg.setCourse(reg.getCourse());
                    newReg.setSemester(reg.getSemester());
                    newReg.setStatus(RegistrationStatus.PENDING);
                    newReg.setRegistrationDate(LocalDateTime.now());
                    return registrationRepository.save(newReg);
                })
                .collect(Collectors.toList());
    }

    // ✅ Cancel Registration
    public Registration cancelRegistration(Long registrationId, String cancelledBy) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setStatusUpdateDate(LocalDateTime.now());
        registration.setUpdatedBy(cancelledBy);

        Registration cancelled = registrationRepository.save(registration);

        // Publish cancellation event
        eventPublisher.publishEvent(new RegistrationEvent(this, cancelled, "CANCELLED"));
        logger.info("Registration {} cancelled by {}", cancelled.getRegistrationId(), cancelledBy);

        return cancelled;
    }

    // ✅ Get Registration History
    public List<Registration> getRegistrationHistory(Long studentId) {
        return registrationRepository.findByStudentStudentId(studentId);
    }

    // ✅ Get Current Registration Period
    public RegistrationPeriod getCurrentRegistrationPeriod() {
        return registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()
                .orElseThrow(() -> new RuntimeException("No active registration period found"));
    }
}
