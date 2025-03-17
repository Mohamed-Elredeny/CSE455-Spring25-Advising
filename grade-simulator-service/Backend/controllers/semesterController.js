const Semester = require('../models/Semester');

exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.findAll();
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSemesterById = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);
    if (!semester) return res.status(404).json({ error: 'Semester not found' });
    res.json(semester);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};