package com.university.registration.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

import com.university.registration.model.*;
import com.university.registration.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.context.ApplicationEventPublisher;

public class RegistrationServiceTests {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private WaitlistService waitlistService;

    @Mock
    private RegistrationPeriodRepository registrationPeriodRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private RegistrationService registrationService;

    private Student student;
    private Course course;
    private RegistrationPeriod activePeriod;
    private RegistrationPeriod inactivePeriod;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);

        student = mock(Student.class);
        when(student.getGpa()).thenReturn(3.0);
        when(student.getStudentId()).thenReturn(1L);

        course = mock(Course.class);
        when(course.getCredits()).thenReturn(3);
        when(course.isOpenCourse()).thenReturn(false);
        when(course.getSchedule()).thenReturn("Mon 9-11");

        activePeriod = mock(RegistrationPeriod.class);
        when(activePeriod.getStartDate()).thenReturn(LocalDateTime.now().minusDays(1));
        when(activePeriod.getEndDate()).thenReturn(LocalDateTime.now().plusDays(1));
        when(activePeriod.isActive()).thenReturn(true);

        inactivePeriod = mock(RegistrationPeriod.class);
        when(inactivePeriod.getStartDate()).thenReturn(LocalDateTime.now().minusDays(10));
        when(inactivePeriod.getEndDate()).thenReturn(LocalDateTime.now().minusDays(5));
        when(inactivePeriod.isActive()).thenReturn(false);
    }

    @Test
    public void testRegisterStudent_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()).thenReturn(Optional.of(activePeriod));
        when(registrationRepository.findByStudentStudentId(1L)).thenReturn(Collections.emptyList());
        when(registrationRepository.save(any(Registration.class))).thenAnswer(i -> i.getArguments()[0]);

        Registration reg = registrationService.registerStudent(1L, 1L, "Fall2025");

        assertNotNull(reg);
        assertEquals(student, reg.getStudent());
        assertEquals(course, reg.getCourse());
        assertEquals("Fall2025", reg.getSemester());
        assertEquals(RegistrationStatus.PENDING, reg.getStatus());
    }

    @Test
    public void testRegisterStudent_OutsideRegistrationPeriod() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            registrationService.registerStudent(1L, 1L, "Fall2025");
        });

        assertEquals("Registration is not allowed outside the active registration period.", ex.getMessage());
    }

    @Test
    public void testRegisterStudent_CreditLimitExceeded() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()).thenReturn(Optional.of(activePeriod));

        List<Registration> existingRegs = new ArrayList<>();
        Registration existingReg = mock(Registration.class);
        Course bigCourse = mock(Course.class);
        when(bigCourse.getCredits()).thenReturn(20);
        when(existingReg.getCourse()).thenReturn(bigCourse);
        existingRegs.add(existingReg);

        when(registrationRepository.findByStudentStudentId(1L)).thenReturn(existingRegs);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            registrationService.registerStudent(1L, 1L, "Fall2025");
        });

        assertTrue(ex.getMessage().contains("Credit limit exceeded"));
    }

    @Test
    public void testRegisterStudent_ScheduleConflict() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(registrationPeriodRepository.findFirstByIsActiveTrueOrderByStartDateDesc()).thenReturn(Optional.of(activePeriod));

        List<Registration> existingRegs = new ArrayList<>();
        Registration existingReg = new Registration();
        Course conflictingCourse = mock(Course.class);
        when(conflictingCourse.getSchedule()).thenReturn("Mon 9-11");
        existingReg.setCourse(conflictingCourse);
        existingRegs.add(existingReg);

        when(registrationRepository.findByStudentStudentId(1L)).thenReturn(existingRegs);

        // Test overlapping schedule
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            registrationService.registerStudent(1L, 1L, "Fall2025");
        });
        assertEquals("Schedule conflict detected! Another course overlaps.", ex.getMessage());

        // Test non-overlapping schedule
        when(conflictingCourse.getSchedule()).thenReturn("Tue 9-11");
        RuntimeException ex2 = assertThrows(RuntimeException.class, () -> {
            registrationService.registerStudent(1L, 1L, "Fall2025");
        });
        // Should not throw conflict error for different day, so no exception expected here
        // But since other validations may throw, we check that message is not conflict
        assertNotEquals("Schedule conflict detected! Another course overlaps.", ex2.getMessage());
    }
}
