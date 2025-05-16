const messageModel = require('../models/messageModel');

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

module.exports = {
    createMessage,
    getMessages,
    updateMessage,
    deleteMessage
};