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

exports.getAllGPARules = async (req, res) => {
  try {
    const response = await axios.get(endpoints.gpaRules);
    const gpaRules = response.data;
    res.json(gpaRules);
  } catch (err) {
    handleApiError(err, res);
  }
};

exports.getGPARuleByGrade = async (req, res) => {
  try {
    const response = await axios.get(endpoints.gpaRule(req.params.grade));
    const gpaRule = response.data;
    if (!gpaRule) return res.status(404).json({ error: 'GPA rule not found' });
    res.json(gpaRule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};