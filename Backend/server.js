const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

// Import models
const Semester = require('./models/Semester');
const Course = require('./models/Course');
const Grade = require('./models/Grade');
const ProgramPlan = require('./models/ProgramPlan');
const GraduationRequirement = require('./models/GraduationRequirement');
const Student = require('./models/Student');
const Prerequisite = require('./models/Prerequisite');

// Import routes
const semesterRoutes = require('./routes/semesterRoutes');
const studentRoutes = require('./routes/studentRoutes');
const gpaRuleRoutes = require('./routes/gpaRuleRoutes');
const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const programPlanRoutes = require('./routes/programPlanRoutes');
const graduationRequirementRoutes = require('./routes/graduationRequirementRoutes');
const gpaCalculatorRoutes = require('./routes/gpaCalculatorRoutes');
const graduationRoutes = require('./routes/graduationRoutes');

const app = express();
app.use(express.json());
app.use(cors());

// ======================
// Model Associations
// ======================

// Student-Grade relationships
Student.hasMany(Grade, {
  foreignKey: 'student_id',
  as: 'grades'
});
Grade.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

// Course-Grade relationships
Course.hasMany(Grade, {
  foreignKey: 'course_id',
  as: 'grades'
});
Grade.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course' // Lowercase alias
});

// Semester-Grade relationships
Semester.hasMany(Grade, {
  foreignKey: 'semester_id',
  as: 'grades'
});
Grade.belongsTo(Semester, {
  foreignKey: 'semester_id',
  as: 'semester'
});

// ProgramPlan relationship
ProgramPlan.belongsTo(Course, { 
  foreignKey: 'course_id',
  as: 'course'
});

// Prerequisite relationships (using actual table name)
// In your main file
Course.belongsToMany(Course, {
  as: 'prerequisites',
  through: Prerequisite, // Reference the model directly
  foreignKey: 'course_id',
  otherKey: 'prerequisite_course_id'
});

Course.belongsToMany(Course, {
  as: 'dependentCourses',
  through: Prerequisite,
  foreignKey: 'prerequisite_course_id',
  otherKey: 'course_id'
});

// Graduation Requirements
GraduationRequirement.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// ======================
// Database Setup
// ======================
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL database'))
  .catch(err => console.error('Connection error:', err));

sequelize.sync({ 
  force: false,
  alter: true
})
.then(() => console.log('Database synchronized'))
.catch(err => console.error('Sync error:', err));

// ======================
// Route Mounting
// ======================
app.use('/api/', studentRoutes);
app.use('/api/', courseRoutes);
app.use('/api/', gradeRoutes);
app.use('/api/', semesterRoutes);
app.use('/api/', gpaRuleRoutes);
app.use('/api/', programPlanRoutes);
app.use('/api/', graduationRequirementRoutes);
app.use('/api/', gpaCalculatorRoutes);
app.use('/api/', graduationRoutes);

// ======================
// Error Handling Middleware
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ======================
// Server Start
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});