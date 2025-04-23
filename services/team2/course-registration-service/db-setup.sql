-- SQL script to create MySQL database and user for Course Registration Service
CREATE DATABASE IF NOT EXISTS university_advising;
CREATE USER IF NOT EXISTS 'registration_user' @'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON university_advising.* TO 'registration_user' @'localhost';
FLUSH PRIVILEGES;
-- Add tables for Course Registration Service
-- Table to store course registrations
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL,
    FOREIGN KEY (course_id) REFERENCES catalog_service.courses(course_id),
    FOREIGN KEY (student_id) REFERENCES profile_service.students(id)
);
-- Table to manage student schedules
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    schedule_time TIMESTAMP NOT NULL,
    FOREIGN KEY (course_id) REFERENCES catalog_service.courses(course_id),
    FOREIGN KEY (student_id) REFERENCES profile_service.students(id)
);
-- Table to handle waitlisted students
CREATE TABLE IF NOT EXISTS waitlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    waitlist_position INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES catalog_service.courses(course_id),
    FOREIGN KEY (student_id) REFERENCES profile_service.students(id)
);
