const messageModel = require('../models/messageModel');
const Group = require('../models/groupModel');

const createMessage = async (req, res) => {
    const { senderId, receiverId, content, fileUrl, fileName } = req.body;
    
    if (!senderId || !receiverId || (!content && !fileUrl)) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const message = new messageModel({
            senderId,
            receiverId,
            content: content || 'Sent an attachment',
            type: 'out',
            ...(fileUrl && { fileUrl, fileName })
        });
        
        const savedMessage = await message.save();
        console.log('Message saved successfully:', savedMessage);
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ message: 'Error creating message', error: error.message });
    }
};

const getMessages = async (req, res) => {
    const { userId, currentUserId } = req.query;

    if (!userId || !currentUserId) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        console.log('Fetching messages between:', userId, 'and', currentUserId);
        
        const messages = await messageModel.find({
            $or: [
                { senderId: userId, receiverId: currentUserId },
                { senderId: currentUserId, receiverId: userId }
            ]
        })
        .sort({ createdAt: 1 })
        .lean();

        // Mark messages as 'in' or 'out' based on the current user
        const formattedMessages = messages.map(msg => ({
            ...msg,
            type: msg.senderId === currentUserId ? 'out' : 'in'
        }));

        console.log('Found messages:', formattedMessages.length);
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

const updateMessage = async (req, res) => {
    try {
        const message = await messageModel.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if message is deleted
        if (message.deleted) {
            return res.status(400).json({ message: 'Cannot edit a deleted message' });
        }

        // Check if the user is the sender of the message
        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }

        message.content = req.body.content;
        message.edited = true;
        await message.save();

        res.json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    
    try {
        const message = await messageModel.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if message is older than 3 hours
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        if (message.createdAt < threeHoursAgo) {
            return res.status(400).json({ message: 'Cannot delete messages older than 3 hours' });
        }

        // Update message as deleted
        message.deleted = true;
        await message.save();
        
        res.json(message);
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
};

// Send a message to a group
const createGroupMessage = async (req, res) => {
    const { groupId, content, fileUrl, fileName } = req.body;
    const senderId = req.user._id;
    if (!groupId || (!content && !fileUrl)) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.members.map(String).includes(String(senderId))) {
            return res.status(403).json({ message: 'Not a group member' });
        }
        const message = new messageModel({
            senderId,
            groupId,
            content: content || 'Sent an attachment',
            type: 'out',
            ...(fileUrl && { fileUrl, fileName })
        });
        const savedMessage = await message.save();
        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending group message', error: error.message });
    }
};

// Get all messages for a group
const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;
    try {
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (!group.members.map(String).includes(String(userId))) {
            return res.status(403).json({ message: 'Not a group member' });
        }
        const messages = await messageModel.find({ groupId }).sort({ createdAt: 1 }).lean();
        res.json(messages.map(msg => ({ ...msg, type: msg.senderId == userId ? 'out' : 'in' })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching group messages', error: error.message });
    }
};

// Edit a group message (sender or admin only)
const updateGroupMessage = async (req, res) => {
    try {
        const message = await messageModel.findById(req.params.messageId);
        if (!message || !message.groupId) {
            return res.status(404).json({ message: 'Group message not found' });
        }
        const group = await Group.findById(message.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (
            message.senderId.toString() !== req.user._id.toString() &&
            !group.admins.map(String).includes(String(req.user._id))
        ) {
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }
        message.content = req.body.content;
        message.edited = true;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error updating group message', error: error.message });
    }
};

// Delete a group message (sender or admin only)
const deleteGroupMessage = async (req, res) => {
    try {
        const message = await messageModel.findById(req.params.messageId);
        if (!message || !message.groupId) {
            return res.status(404).json({ message: 'Group message not found' });
        }
        const group = await Group.findById(message.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (
            message.senderId.toString() !== req.user._id.toString() &&
            !group.admins.map(String).includes(String(req.user._id))
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }
        message.deleted = true;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting group message', error: error.message });
    }
};

module.exports = {
    createMessage,
    getMessages,
    updateMessage,
    deleteMessage,
    createGroupMessage,
    getGroupMessages,
    updateGroupMessage,
    deleteGroupMessage
};