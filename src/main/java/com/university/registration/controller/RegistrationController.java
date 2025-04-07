package com.university.registration.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.university.registration.model.Registration;
import com.university.registration.model.RegistrationStatus;
import com.university.registration.service.RegistrationService;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    // ✅ Student Course Registration
    @PostMapping("/register")
    public Registration registerStudent(@RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam String semester) {
        return registrationService.registerStudent(studentId, courseId, semester);
    }

    // ✅ Admin: Approve or Reject a Registration
    @PutMapping("/{registrationId}/status")
    public Registration updateRegistrationStatus(@PathVariable Long registrationId,
            @RequestParam RegistrationStatus status) {
        return registrationService.updateRegistrationStatus(registrationId, status);
    }

    // ✅ Generate Student Timetable
    @GetMapping("/{studentId}/timetable")
    public List<Registration> getStudentTimetable(@PathVariable Long studentId) {
        return registrationService.generateTimetable(studentId);
    }
}
