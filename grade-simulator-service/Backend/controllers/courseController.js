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

exports.getAllCourses = async (req, res) => {
  try {
    const response = await axios.get(endpoints.courses);
    const courses = response.data;
    res.json(courses);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const response = await axios.get(endpoints.course(req.params.id));
    const course = response.data;
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    handleApiError(err, res);
  }
};