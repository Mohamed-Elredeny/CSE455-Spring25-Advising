const Group = require('../models/groupModel');
const User = require('../models/userModel');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !Array.isArray(members) || members.length < 2) {
      return res.status(400).json({ message: 'Group name and at least 2 members required' });
    }
    // Ensure creator is a member and admin
    const creatorId = req.user._id;
    const allMembers = Array.from(new Set([...members, creatorId.toString()]));
    const group = new Group({
      name,
      members: allMembers,
      admins: [creatorId],
      createdBy: creatorId
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

// Assign or remove admin (admin only)
const updateAdmins = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Only admins can assign/remove admins' });
    }
    const { userId, action } = req.body; // action: 'add' or 'remove'
    if (!userId || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    if (action === 'add' && !group.admins.map(String).includes(String(userId))) {
      group.admins.push(userId);
    } else if (action === 'remove') {
      group.admins = group.admins.filter(a => String(a) !== String(userId));
      // Prevent removing last admin
      if (group.admins.length === 0) {
        return res.status(400).json({ message: 'At least one admin required' });
      }
    }
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error updating admins', error: error.message });
  }
};

// Leave group (any member)
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const userId = req.user._id;
    // Remove from members
    group.members = group.members.filter(m => String(m) !== String(userId));
    // Remove from admins
    group.admins = group.admins.filter(a => String(a) !== String(userId));
    // If no members left, delete the group
    if (group.members.length === 0) {
      await group.deleteOne();
      return res.json({ message: 'Group deleted (no members left)' });
    }
    // Prevent leaving if last admin and members remain
    if (group.admins.length === 0 && group.members.length > 0) {
      // Assign first member as new admin
      group.admins = [group.members[0]];
    }
    await group.save();
    res.json({ message: 'Left group', group });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving group', error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only admins can rename
    if (!group.admins.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ message: 'Only admins can rename group' });
    }
    if (req.body.name) group.name = req.body.name;
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error renaming group', error: error.message });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroup,
  addMembers,
  removeMembers,
  updateAdmins,
  leaveGroup,
  updateGroup
}; 