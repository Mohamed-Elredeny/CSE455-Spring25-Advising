-- Database schema for Course Registration Service



CREATE TABLE students (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    gpa DOUBLE
);

CREATE TABLE course_offerings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    semester VARCHAR(255) NOT NULL,
    instructor VARCHAR(255),
    schedule VARCHAR(255),
    capacity INT,
    available_seats INT DEFAULT 0,
    CONSTRAINT fk_course_offering_course FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE registrations (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT,
    course_id BIGINT,
    semester VARCHAR(255),
    status VARCHAR(50),
    registration_date DATETIME,
    status_update_date DATETIME,
    updated_by VARCHAR(255),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id)
);
