const Grade = require('../models/Grade');
const GraduationRequirement = require('../models/GraduationRequirement');
const Student = require('../models/Student');
const Course = require('../models/Course');

exports.checkGraduationRequirements = async (req, res) => {
  const { student_id } = req.params;
  console.log('Received student_id:', student_id);

  try {
    console.log('Fetching student with ID:', student_id);
    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const graduationRequirement = await GraduationRequirement.findByPk(student.program_id);
    if (!graduationRequirement) return res.status(404).json({ error: 'Graduation requirements not found for this program' });

    const grades = await Grade.findAll({
      where: { student_id },
      include: [{ model: Course, as: 'course', required: false }], // Updated alias to 'course'
    });
    console.log('Grades fetched:', grades.map(grade => grade.toJSON()));

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
    console.error('Error in checkGraduationRequirements:', err);
    res.status(500).json({ error: err.message });
  }
};