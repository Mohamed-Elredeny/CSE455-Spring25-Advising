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

exports.getAllGraduationRequirements = async (req, res) => {
  try {
    const response = await axios.get(`${endpoints.PYTHON_API_BASE_URL}/graduation-requirements`);
    const requirements = response.data;
    res.json(requirements);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getGraduationRequirementById = async (req, res) => {
  try {
    const response = await axios.get(`${endpoints.PYTHON_API_BASE_URL}/graduation-requirements/${req.params.id}`);
    const requirement = response.data;
    if (!requirement) return res.status(404).json({ error: 'Graduation requirement not found' });
    res.json(requirement);
  } catch (err) {
    handleApiError(err, res);
  }
};