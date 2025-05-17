const express = require('express');
const auth = require('../middleware/auth');
const {
  createGroup,
  getUserGroups,
  getGroup,
  addMembers,
  removeMembers
} = require('../controllers/groupController');

const router = express.Router();

// Create a group
router.post('/', auth, createGroup);
// List user's groups
router.get('/', auth, getUserGroups);
// Get group details
router.get('/:groupId', auth, getGroup);
// Add members
router.put('/:groupId/add', auth, addMembers);
// Remove members
router.put('/:groupId/remove', auth, removeMembers);

module.exports = router; 