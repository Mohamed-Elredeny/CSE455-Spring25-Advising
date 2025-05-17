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

// Update message
router.put('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.content = req.body.content;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;