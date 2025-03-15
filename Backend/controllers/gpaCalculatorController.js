const Grade = require('../models/Grade');
const GPARule = require('../models/GPARule');
const Course = require('../models/Course');
const Student = require('../models/Student');

exports.calculateCGPA = async (req, res) => {
  const { student_id } = req.params;
  console.log("Student ID for CGPA calculation:", student_id);

  try {
    const student = await Student.findByPk(student_id);
    if (!student) {
      console.log("Student not found:", student_id);
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log("Found student:", student.student_id);

    // Check if any grades exist for this student without include
    const gradeCount = await Grade.count({ where: { student_id } });
    console.log("Grade count for student:", gradeCount);
    
    if (gradeCount === 0) {
      console.log("No grades found in database for student:", student_id);
      return res.status(404).json({ error: 'No grades found for this student' });
    }
    
    // Fetch grades with the correct alias
    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Course, as: 'course' }], // Corrected alias
    });
    console.log("Grades with include:", grades.length);
    
    if (!grades.length) {
      return res.status(404).json({ error: 'No grades found for this student with course information' });
    }

    let totalCredits = 0;
    let totalGradePoints = 0;

    for (const grade of grades) {
      if (!grade.course) { // Updated to use correct alias
        console.log("Warning: Course association missing for grade:", grade.grade_id);
        continue;
      }
      
      const credits = grade.course.credits; // Updated to use correct alias
      const gradePoints = parseFloat(grade.course_grade_points) || 0;
      
      console.log(`Adding: ${credits} credits, ${gradePoints} grade points for course ${grade.course_id}`);
      
      totalCredits += credits;
      totalGradePoints += gradePoints;
    }
    
    console.log("Total credits:", totalCredits);
    console.log("Total grade points:", totalGradePoints);

    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
    console.log("Calculated CGPA:", cgpa);
    
    res.json({ student_id, cgpa });
  } catch (err) {
    console.error("Error calculating CGPA:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.simulateCourseRetake = async (req, res) => {
  const { student_id } = req.params;
  const { course_id, new_grade } = req.body;

  console.log('simulateCourseRetake - Input:', { student_id, course_id, new_grade });

  if (!student_id || !course_id || !new_grade) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('Fetching student:', student_id);
    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    console.log('Fetching course:', course_id);
    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    console.log('Fetching GPA rule for grade:', new_grade);
    const gpaRule = await GPARule.findOne({ where: { letter_grade: new_grade } });
    if (!gpaRule) return res.status(400).json({ error: 'Invalid grade' });
    const newGradePoints = gpaRule.gpa_points * course.credits;
    console.log('New grade points:', newGradePoints);

    console.log('Fetching grades for student:', student_id);
    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Course, as: 'course' }], // Corrected alias
    });
    console.log('Grades:', grades);

    if (!grades.length) return res.status(404).json({ error: 'No grades found for this student' });

    let totalCredits = 0;
    let totalGradePoints = 0;

    // Calculate original totals
    for (const grade of grades) {
      totalCredits += grade.course.credits; // Updated to use correct alias
      totalGradePoints += parseFloat(grade.course_grade_points) || 0;
    }

    // Adjust for the retake
    let courseFound = false;
    for (const grade of grades) {
      if (grade.course_id === course_id) {
        totalGradePoints = totalGradePoints - (parseFloat(grade.course_grade_points) || 0) + newGradePoints;
        courseFound = true;
      }
    }

    if (!courseFound) return res.status(404).json({ error: "Course not found in student's grades" });

    const simulated_cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
    console.log('Simulated CGPA:', simulated_cgpa);

    res.json({ student_id, simulated_cgpa });
  } catch (err) {
    console.error('Error in simulateCourseRetake:', err);
    res.status(500).json({ error: err.message });
  }
};