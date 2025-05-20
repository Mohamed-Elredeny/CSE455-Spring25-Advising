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

exports.getAllSemesters = async (req, res) => {
  try {
    console.log('Fetching all semesters from:', endpoints.semesters);
    const response = await axios.get(endpoints.semesters);
    const semesters = response.data;
    res.json(semesters);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getSemesterById = async (req, res) => {
  try {
    console.log('Fetching semester with ID:', req.params.id);
    const response = await axios.get(endpoints.semester(req.params.id));
    const semester = response.data;
    if (!semester) return res.status(404).json({ error: 'Semester not found' });
    res.json(semester);
  } catch (err) {
    handleApiError(err, res);
  }
};