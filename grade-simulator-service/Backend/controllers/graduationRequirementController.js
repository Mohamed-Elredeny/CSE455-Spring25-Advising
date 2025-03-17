const GraduationRequirement = require('../models/GraduationRequirement');

exports.getAllGraduationRequirements = async (req, res) => {
  try {
    const requirements = await GraduationRequirement.findAll();
    res.json(requirements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGraduationRequirementById = async (req, res) => {
  try {
    const requirement = await GraduationRequirement.findByPk(req.params.id);
    if (!requirement) return res.status(404).json({ error: 'Graduation requirement not found' });
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};