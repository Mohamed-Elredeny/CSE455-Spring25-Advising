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

exports.checkGraduationRequirements = async (req, res) => {
  const { student_id } = req.params;
  console.log('Received student_id:', student_id);

  try {
    console.log('Fetching student with ID:', student_id);
    const studentResponse = await axios.get(`${endpoints.students}/${student_id}`);
    const student = studentResponse.data;

    // Get graduation requirements directly by program ID
    console.log('Fetching graduation requirements for program ID:', student.program_id);
    const graduationRequirementResponse = await axios.get(endpoints.graduationRequirement(student.program_id));
    const graduationRequirement = graduationRequirementResponse.data;

    if (!graduationRequirement) {
      return res.status(404).json({ error: 'Graduation requirements not found for this program' });
    }

    const gradesResponse = await axios.get(endpoints.studentGrades(student_id));
    const grades = gradesResponse.data;
    
    console.log('Grades fetched:', grades);

    let totalCreditsEarned = 0;
    let totalGradePoints = 0;

    for (const grade of grades) {
      if (!grade.course) {
        console.warn(`Course not found for grade with course_id: ${grade.course_id}`);
        continue; // Skip grades with missing course data
      }

      const credits = parseInt(grade.course.credits, 10) || 0;
      const gradePoints = parseFloat(grade.course_grade_points) || 0;

      totalCreditsEarned += credits;
      totalGradePoints += gradePoints;
    }

    console.log('Total Credits Earned:', totalCreditsEarned);
    console.log('Total Grade Points:', totalGradePoints);

    const currentGPA = totalCreditsEarned > 0 ? (totalGradePoints / totalCreditsEarned).toFixed(2) : 0;
    console.log('Current GPA:', currentGPA);

    const meetsGPA = parseFloat(currentGPA) >= parseFloat(graduationRequirement.min_gpa);
    const meetsCredits = totalCreditsEarned >= parseInt(graduationRequirement.min_credits);

    res.json({
      student_id,
      current_gpa: currentGPA,
      total_credits_earned: totalCreditsEarned,
      min_gpa_required: parseFloat(graduationRequirement.min_gpa),
      min_credits_required: parseInt(graduationRequirement.min_credits),
      meets_gpa: meetsGPA,
      meets_credits: meetsCredits,
      can_graduate: meetsGPA && meetsCredits,
    });
  } catch (err) {
    handleApiError(err, res);
  }
};