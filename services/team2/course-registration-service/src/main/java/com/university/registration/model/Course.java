package com.university.registration.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String catalogId; // Matches Catalog Service course_id
    private String title;
    private String description;
    private String instructor;
    private int credits;
    private String department;
    private boolean isCore;
    private Integer level;
    private boolean isOpenCourse;
    private Integer availableSeats = 0;
    private Integer totalSeats = 0;
    private Integer waitlistCapacity = 20;
    private boolean requiresPrerequisiteCheck = true;
    private boolean requiresDepartmentApproval = false;
    private boolean allowOverrides = false;

    // Transient fields for catalog data
    @Transient
    private List<String> prerequisites;

    @Transient
    private List<Section> sections;

    @Transient
    private List<String> categories;

    public String getSchedule() {
        if (sections == null || sections.isEmpty()) {
            return "No schedule available";
        }
        return sections.stream()
                .map(s -> {
                    return s.getScheduleDay() + " " + s.getScheduleTime();
                })
                .findFirst()
                .orElse("No schedule available");
    }

    public Long getCourseId() {
        return id;
    }

    public void setCourseId(Long courseId) {
        if (courseId != null) {
            this.id = courseId;
        }
    }

    @Getter
    @Setter
    public static class Section {

        private String sectionId;
        private String instructor;
        private int capacity;
        private String scheduleDay;
        private String scheduleTime;

        public String getScheduleDay() {
            return scheduleDay;
        }

        public String getScheduleTime() {
            return scheduleTime;
        }
    }
}
