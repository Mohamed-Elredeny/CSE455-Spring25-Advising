const express = require('express');
const cors = require('cors');




// Import routes
const semesterRoutes = require('./routes/semesterRoutes');
const studentRoutes = require('./routes/studentRoutes');
const gpaRuleRoutes = require('./routes/gpaRuleRoutes');
const courseRoutes = require('./routes/courseRoutes');
const programPlanRoutes = require('./routes/programPlanRoutes');
const graduationRequirementRoutes = require('./routes/graduationRequirementRoutes');
const gpaCalculatorRoutes = require('./routes/gpaCalculatorRoutes');
const graduationRoutes = require('./routes/graduationRoutes');

const app = express();

app.use(express.json());
// ... existing code ...

app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 



// ======================
// Route Mounting
// ======================
app.use('/simulator/', studentRoutes);
app.use('/simulator/', courseRoutes);
app.use('/simulator/', semesterRoutes);
app.use('/simulator/', gpaRuleRoutes);
app.use('/simulator/', programPlanRoutes);
app.use('/simulator/', graduationRequirementRoutes);
app.use('/simulator/', gpaCalculatorRoutes);
app.use('/simulator/', graduationRoutes);

// ======================
// Health Check Endpoint
// ======================
app.get('/simulator/health', (req, res) => {
  const podName = process.env.HOSTNAME || 'unknown-pod';
  console.log(`Health check received by pod: ${podName}`);
  res.status(200).json({ 
    status: 'healthy',
    pod: podName 
  });
});

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