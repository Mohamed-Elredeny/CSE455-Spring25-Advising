const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        index: true
    },
    receiverId: {
        type: String,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    fileUrl: {
        type: String
    },
    fileName: {
        type: String
    },
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Create compound index for faster queries
messageSchema.index({ senderId: 1, receiverId: 1 });

const messageModel = mongoose.model('Message', messageSchema);

module.exports = messageModel;