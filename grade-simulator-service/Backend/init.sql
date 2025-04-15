SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS simulator_db;
USE simulator_db;

CREATE TABLE `CoursePrerequisites` (
  `course_id` varchar(10) NOT NULL,
  `prerequisite_course_id` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Courses` (
  `course_id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `credits` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `GPA_Rules` (
  `rule_id` int(11) NOT NULL AUTO_INCREMENT,
  `letter_grade` varchar(2) NOT NULL,
  `gpa_points` decimal(3,1) NOT NULL,
  `min_percentage` int(11) NOT NULL,
  `max_percentage` int(11) NOT NULL,
  PRIMARY KEY (`rule_id`),
  UNIQUE KEY `letter_grade` (`letter_grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Grades` (
  `grade_id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` varchar(10) NOT NULL,
  `course_id` varchar(10) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `grade` varchar(2) DEFAULT NULL,
  `percentage` int(11) DEFAULT NULL,
  `course_grade_points` decimal(4,1) DEFAULT NULL,
  PRIMARY KEY (`grade_id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  KEY `semester_id` (`semester_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Graduation_Requirements` (
  `program_id` varchar(10) NOT NULL,
  `min_gpa` decimal(3,1) NOT NULL,
  `min_credits` int(11) NOT NULL,
  `course_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`program_id`),
  KEY `course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Program_Plans` (
  `plan_id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` varchar(10) NOT NULL,
  `course_id` varchar(10) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`plan_id`),
  KEY `course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Semesters` (
  `semester_id` int(11) NOT NULL,
  `semester_name` varchar(15) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`semester_id`),
  UNIQUE KEY `semester_name` (`semester_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Students` (
  `student_id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `program_id` varchar(10) NOT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert data into CoursePrerequisites
INSERT INTO `CoursePrerequisites` (`course_id`, `prerequisite_course_id`) VALUES
('CSE015', 'CSE014'),
('CSE111', 'CSE015'),
('CSE132', 'CSE131'),
('CSE211', 'CSE015'),
('CSE221', 'CSE111'),
('CSE233', 'CSE132'),
('CSE261', 'CSE132'),
('CSE323', 'CSE221'),
('CSE454', 'CSE251'),
('CSE494', 'CSE323'),
('CSE494', 'CSE454'),
('MAT112', 'MAT111');

-- Insert data into Courses
INSERT INTO `Courses` (`course_id`, `name`, `credits`, `category`) VALUES
('CSE014', 'Structured Programming', 3, 'Core'),
('CSE015', 'Object Oriented Programming', 3, 'Core'),
('CSE111', 'Data Structures', 3, 'Core'),
('CSE131', 'Logic Design', 3, 'Core'),
('CSE132', 'Computer Architecture', 3, 'Core'),
('CSE211', 'Web Programming', 3, 'Core'),
('CSE221', 'Database Systems', 3, 'Core'),
('CSE233', 'Operating Systems', 3, 'Core'),
('CSE251', 'Software Engineering', 3, 'Core'),
('CSE261', 'Computer Networks', 3, 'Core'),
('CSE315', 'Discrete Mathematics', 3, 'Core'),
('CSE323', 'Advanced Databases', 3, 'Core'),
('CSE352', 'Systems Analysis & Design', 3, 'Core'),
('CSE454', 'Advanced Software Engineering', 3, 'Core'),
('CSE494', 'Graduation Project 2', 3, 'Core'),
('MAT111', 'Mathematics I', 3, 'Core'),
('MAT112', 'Mathematics II', 3, 'Core'),
('MAT131', 'Probability & Statistics I', 3, 'Core'),
('PHY211', 'Physics II', 3, 'Core');

-- Insert data into GPA_Rules
INSERT INTO `GPA_Rules` (`rule_id`, `letter_grade`, `gpa_points`, `min_percentage`, `max_percentage`) VALUES
(1, 'A+', 4.0, 97, 100),
(2, 'A', 4.0, 93, 96),
(3, 'A-', 3.7, 89, 92),
(4, 'B+', 3.3, 84, 88),
(5, 'B', 3.0, 80, 83),
(6, 'B-', 2.7, 76, 79),
(7, 'C+', 2.3, 73, 75),
(8, 'C', 2.0, 70, 72),
(9, 'C-', 1.7, 67, 69),
(10, 'D+', 1.3, 64, 66),
(11, 'D', 1.0, 60, 63),
(12, 'F', 0.0, 0, 59);

-- Insert data into Grades
INSERT INTO `Grades` (`grade_id`, `student_id`, `course_id`, `semester_id`, `grade`, `percentage`, `course_grade_points`) VALUES
(1, '21100001', 'MAT111', 211, 'A', 95, 12.0),
(2, '21100001', 'CSE014', 211, 'B+', 87, 9.9),
(3, '21100002', 'PHY211', 211, 'A-', 90, 11.1),
(4, '21200001', 'CSE015', 222, 'B', 82, 9.0),
(5, '21200001', 'CSE111', 222, 'C+', 74, 6.9),
(6, '21100002', 'MAT131', 211, 'B-', 78, 8.1);

-- Insert data into Graduation_Requirements
INSERT INTO `Graduation_Requirements` (`program_id`, `min_gpa`, `min_credits`, `course_id`) VALUES
('SWE', 2.0, 133, NULL);

-- Insert data into Program_Plans
INSERT INTO `Program_Plans` (`plan_id`, `program_id`, `course_id`, `category`) VALUES
(1, 'SWE', 'MAT111', 'Core'),
(2, 'SWE', 'PHY211', 'Core'),
(3, 'SWE', 'CSE014', 'Core'),
(4, 'SWE', 'MAT112', 'Core'),
(5, 'SWE', 'MAT131', 'Core'),
(6, 'SWE', 'CSE015', 'Core'),
(7, 'SWE', 'CSE315', 'Core'),
(8, 'SWE', 'CSE111', 'Core'),
(9, 'SWE', 'CSE131', 'Core'),
(10, 'SWE', 'CSE132', 'Core'),
(11, 'SWE', 'CSE211', 'Core'),
(12, 'SWE', 'CSE221', 'Core'),
(13, 'SWE', 'CSE251', 'Core'),
(14, 'SWE', 'CSE233', 'Core'),
(15, 'SWE', 'CSE261', 'Core'),
(16, 'SWE', 'CSE352', 'Core'),
(17, 'SWE', 'CSE323', 'Core'),
(18, 'SWE', 'CSE454', 'Core'),
(19, 'SWE', 'CSE494', 'Core');

-- Insert data into Semesters
INSERT INTO `Semesters` (`semester_id`, `semester_name`, `academic_year`, `start_date`, `end_date`) VALUES
(211, 'Fall 2021', '2021-2022', '2021-09-01', '2021-12-31'),
(222, 'Spring 2022', '2021-2022', '2022-01-15', '2022-05-15');

-- Insert data into Students
INSERT INTO `Students` (`student_id`, `name`, `email`, `program_id`) VALUES
('21100001', 'Ali', 'Ali@example.com', 'SWE'),
('21100002', 'Ahmed', 'Ahmed@example.com', 'SWE'),
('21200001', 'Mohamed', 'Mohamed@example.com', 'SWE');

-- Add foreign key constraints
ALTER TABLE `CoursePrerequisites`
  ADD CONSTRAINT `courseprerequisites_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `Courses` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courseprerequisites_ibfk_2` FOREIGN KEY (`prerequisite_course_id`) REFERENCES `Courses` (`course_id`) ON DELETE CASCADE;

ALTER TABLE `Grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `Students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `Courses` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grades_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `Semesters` (`semester_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Graduation_Requirements`
  ADD CONSTRAINT `graduation_requirements_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `Courses` (`course_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Program_Plans`
  ADD CONSTRAINT `program_plans_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `Courses` (`course_id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT; 