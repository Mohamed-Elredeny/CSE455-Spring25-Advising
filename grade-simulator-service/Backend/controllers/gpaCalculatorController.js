const Grade = require('../models/Grade');
const GPARule = require('../models/GPARule');
const Course = require('../models/Course');
const Student = require('../models/Student');
const ProgramPlan = require('../models/ProgramPlan');

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
    // Fetch student
    console.log('Fetching student:', student_id);
    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch course
    console.log('Fetching course:', course_id);
    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Check if the course is in student's program plan
    const programPlan = await ProgramPlan.findOne({
      where: {
        program_id: student.program_id,
        course_id: course_id
      }
    });

    if (!programPlan) {
      return res.status(400).json({ error: 'Course is not in student\'s program plan' });
    }

    // Fetch GPA rule for the new grade
    console.log('Fetching GPA rule for grade:', new_grade);
    const gpaRule = await GPARule.findOne({ where: { letter_grade: new_grade } });
    if (!gpaRule) return res.status(400).json({ error: 'Invalid grade' });
    const newGradePoints = gpaRule.gpa_points * course.credits;
    console.log('New grade points:', newGradePoints);

    // Fetch all student's grades
    console.log('Fetching grades for student:', student_id);
    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Course, as: 'course' }],
    });
    console.log('Grades:', grades);

    let totalCredits = 0;
    let totalGradePoints = 0;

    // Calculate current totals
    for (const grade of grades) {
      if (!grade.course) continue;
      totalCredits += grade.course.credits;
      totalGradePoints += parseFloat(grade.course_grade_points) || 0;
    }

    // Check if the course is already taken
    const existingGrade = grades.find(grade => grade.course_id === course_id);
    
    if (existingGrade) {
      // If retaking, subtract old grade points and add new ones
      totalGradePoints = totalGradePoints - (parseFloat(existingGrade.course_grade_points) || 0) + newGradePoints;
    } else {
      // If taking for the first time, add new credits and grade points
      totalCredits += course.credits;
      totalGradePoints += newGradePoints;
    }

    const simulated_cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
    console.log('Simulated CGPA:', simulated_cgpa);

    res.json({ 
      student_id, 
      simulated_cgpa,
      is_new_course: !existingGrade,
      course_name: course.name,
      credits: course.credits,
      grade_points: newGradePoints
    });
  } catch (err) {
    console.error('Error in simulateCourseRetake:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentProgramCourses = async (req, res) => {
  const { student_id } = req.params;

  try {
    // Fetch student
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch program plan courses with course details
    const programPlanCourses = await ProgramPlan.findAll({
      where: { program_id: student.program_id },
      include: [{
        model: Course,
        as: 'Course',
        required: true
      }]
    });

    // Fetch student's existing grades
    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Course, as: 'course' }]
    });

    // Map program plan courses with grade information if available
    const courses = programPlanCourses.map(planCourse => {
      const existingGrade = grades.find(grade => grade.course_id === planCourse.course_id);
      return {
        course_id: planCourse.course_id,
        course_name: planCourse.Course.name,
        credits: planCourse.Course.credits,
        category: planCourse.category,
        current_grade: existingGrade ? existingGrade.grade : null,
        is_taken: !!existingGrade
      };
    });

    res.json({
      student_id,
      program_id: student.program_id,
      courses
    });
  } catch (err) {
    console.error('Error in getStudentProgramCourses:', err);
    res.status(500).json({ error: err.message });
  }
};