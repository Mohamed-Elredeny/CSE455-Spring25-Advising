const axios = require('axios');
const { endpoints } = require('../config/pythonApi');

// Helper function to handle API errors
const handleApiError = (err, res) => {
  console.error('API Error:', err);
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return res.status(err.response.status).json(err.response.data);
  } else if (err.request) {
    // The request was made but no response was received
    return res.status(503).json({ 
      error: 'Python API service unavailable',
      details: err.message
    });
  } else {
    // Something happened in setting up the request that triggered an Error
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: err.message
    });
  }
};

exports.calculateCGPA = async (req, res) => {
  const { student_id } = req.params;
  console.log("Student ID for CGPA calculation:", student_id);

  try {
    // Check if student exists
    const studentResponse = await axios.get(`${endpoints.students}/${student_id}`);
    const student = studentResponse.data;
    console.log("Found student:", student.student_id);

    // Fetch grades from Python API
    const gradesResponse = await axios.get(endpoints.studentGrades(student_id));
    const grades = gradesResponse.data;
    
    if (!grades.length) {
      return res.status(404).json({ error: 'No grades found for this student' });
    }

    let totalCredits = 0;
    let totalGradePoints = 0;

    for (const grade of grades) {
      if (!grade.course) {
        console.log("Warning: Course association missing for grade:", grade.grade_id);
        continue;
      }
      
      const credits = grade.course.credits;
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
    handleApiError(err, res);
  }
};

exports.simulateCourseRetake = async (req, res) => {
  const { student_id } = req.params;
  const { course_id, new_grade, courses } = req.body;

  console.log('simulateCourseRetake - Input:', { student_id, course_id, new_grade, courses });

  // Handle multiple courses simulation
  if (courses && Array.isArray(courses) && courses.length > 0) {
    if (!student_id) {
      return res.status(400).json({ error: 'Missing student_id' });
    }

    try {
      // Fetch student from Python API
      const studentResponse = await axios.get(`${endpoints.students}/${student_id}`);
      const student = studentResponse.data;

      // Fetch all courses in the simulation
      const courseIds = courses.map(c => c.course_id);
      const courseMap = new Map();
      
      for (const courseId of courseIds) {
        const courseResponse = await axios.get(endpoints.course(courseId));
        courseMap.set(courseId, courseResponse.data);
      }

      // Check if all courses are in student's program plan
      const programPlansResponse = await axios.get(endpoints.programPlan(student.program_id));
      const programPlans = programPlansResponse.data;
      
      const validCourseIds = new Set(programPlans.map(plan => plan.course_id));
      const invalidCourses = courseIds.filter(id => !validCourseIds.has(id));
      
      if (invalidCourses.length > 0) {
        return res.status(400).json({ 
          error: 'Some courses are not in student\'s program plan',
          invalid_courses: invalidCourses
        });
      }

      // Fetch GPA rules for all grades
      const grades = new Set(courses.map(c => c.new_grade));
      const gpaRulesResponse = await axios.get(endpoints.gpaRules);
      const gpaRules = gpaRulesResponse.data;
      const gpaRuleMap = new Map(gpaRules.map(rule => [rule.letter_grade, rule]));

      // Validate all grades
      const invalidGrades = Array.from(grades).filter(grade => !gpaRuleMap.has(grade));
      if (invalidGrades.length > 0) {
        return res.status(400).json({ 
          error: 'Invalid grades provided',
          invalid_grades: invalidGrades
        });
      }

      // Fetch all student's grades from Python API
      const gradesResponse = await axios.get(endpoints.studentGrades(student_id));
      const studentGrades = gradesResponse.data;

      let totalCredits = 0;
      let totalGradePoints = 0;

      // Calculate current totals
      for (const grade of studentGrades) {
        if (!grade.course) continue;
        totalCredits += grade.course.credits;
        totalGradePoints += parseFloat(grade.course_grade_points) || 0;
      }

      // Process each course in the simulation
      const simulationResults = [];
      for (const courseSim of courses) {
        const course = courseMap.get(courseSim.course_id);
        const gpaRule = gpaRuleMap.get(courseSim.new_grade);
        const newGradePoints = gpaRule.gpa_points * course.credits;

        // Check if the course is already taken
        const existingGrade = studentGrades.find(grade => grade.course_id === courseSim.course_id);
        
        if (existingGrade) {
          // If retaking, subtract old grade points and add new ones
          totalGradePoints = totalGradePoints - (parseFloat(existingGrade.course_grade_points) || 0) + newGradePoints;
        } else {
          // If taking for the first time, add new credits and grade points
          totalCredits += course.credits;
          totalGradePoints += newGradePoints;
        }

        simulationResults.push({
          course_id: courseSim.course_id,
          course_name: course.name,
          credits: course.credits,
          new_grade: courseSim.new_grade,
          grade_points: newGradePoints,
          is_new_course: !existingGrade
        });
      }

      const simulated_cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
      console.log('Simulated CGPA:', simulated_cgpa);

      res.json({ 
        student_id, 
        simulated_cgpa,
        simulation_results: simulationResults
      });
    } catch (err) {
      handleApiError(err, res);
    }
    return;
  }

  // Handle single course simulation
  if (!student_id || !course_id || !new_grade) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Fetch student from Python API
    const studentResponse = await axios.get(`${endpoints.students}/${student_id}`);
    const student = studentResponse.data;

    // Fetch course from Python API
    const courseResponse = await axios.get(endpoints.course(course_id));
    const course = courseResponse.data;

    // Check if the course is in student's program plan
    const programPlansResponse = await axios.get(endpoints.programPlan(student.program_id));
    const programPlans = programPlansResponse.data;
    
    const programPlan = programPlans.find(plan => plan.course_id === course_id);
    if (!programPlan) {
      return res.status(400).json({ error: 'Course is not in student\'s program plan' });
    }

    // Fetch GPA rule for the new grade
    const gpaRuleResponse = await axios.get(endpoints.gpaRule(new_grade));
    const gpaRule = gpaRuleResponse.data;
    const newGradePoints = gpaRule.gpa_points * course.credits;

    // Fetch all student's grades from Python API
    const gradesResponse = await axios.get(endpoints.studentGrades(student_id));
    const grades = gradesResponse.data;

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
    handleApiError(err, res);
  }
};

exports.getStudentProgramCourses = async (req, res) => {
  const { student_id } = req.params;

  try {
    // Fetch student from Python API
    const studentResponse = await axios.get(`${endpoints.students}/${student_id}`);
    const student = studentResponse.data;

    // Fetch program plan courses with course details from Python API
    const programPlansResponse = await axios.get(endpoints.programPlan(student.program_id));
    const programPlanCourses = programPlansResponse.data;

    // Fetch student's existing grades from Python API
    const gradesResponse = await axios.get(endpoints.studentGrades(student_id));
    const grades = gradesResponse.data;

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
    handleApiError(err, res);
  }
};

