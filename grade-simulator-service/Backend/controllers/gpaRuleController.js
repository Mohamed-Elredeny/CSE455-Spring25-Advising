const GPARule = require('../models/GPARule');

exports.getAllGPARules = async (req, res) => {
  try {
    const gpaRules = await GPARule.findAll();
    res.json(gpaRules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGPARuleByGrade = async (req, res) => {
  try {
    const gpaRule = await GPARule.findOne({ where: { letter_grade: req.params.grade } });
    if (!gpaRule) return res.status(404).json({ error: 'GPA rule not found' });
    res.json(gpaRule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};