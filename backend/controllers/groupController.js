const Group = require('../models/groupModel');
const User = require('../models/userModel');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ message: 'Group name and at least 2 members required' });
    }
    const group = new Group({
      name,
      members,
      admins: [req.user._id],
      createdBy: req.user._id
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};

// Get all groups for a user
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
};

// Get group details
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members admins createdBy', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group', error: error.message });
  }
};

// Add member(s) to group (admin only)
const addMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }
    const { members } = req.body;
    if (!Array.isArray(members)) return res.status(400).json({ message: 'Members must be an array' });
    group.members = Array.from(new Set([...group.members.map(String), ...members.map(String)]));
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error adding members', error: error.message });
  }
};

// Remove member(s) from group (admin only)
const removeMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }
    const { members } = req.body;
    if (!Array.isArray(members)) return res.status(400).json({ message: 'Members must be an array' });
    group.members = group.members.filter(m => !members.map(String).includes(String(m)));
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error removing members', error: error.message });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroup,
  addMembers,
  removeMembers
}; 