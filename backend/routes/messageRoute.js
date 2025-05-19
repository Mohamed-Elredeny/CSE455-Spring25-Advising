const express = require('express');
const { createMessage, getMessages, updateMessage, deleteMessage, createGroupMessage, getGroupMessages, updateGroupMessage, deleteGroupMessage } = require('../controllers/messageController');
const auth = require('../middleware/auth');
const Message = require('../models/messageModel');

const router = express.Router();

router.post('/', auth, createMessage);
router.get('/', auth, getMessages);
router.put('/:messageId', auth, updateMessage);
router.delete('/:messageId', auth, deleteMessage);

// Group message routes
router.post('/group', auth, createGroupMessage);
router.get('/group/:groupId', auth, getGroupMessages);
router.put('/group/:messageId', auth, updateGroupMessage);
router.delete('/group/:messageId', auth, deleteGroupMessage);

module.exports = router;