const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all chat rooms for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const chats = await Chat.find({ participants: userId })
      .populate('doctorId', 'firstName lastName displayName role')
      .populate('patientId', 'firstName lastName displayName role')
      .sort({ lastMessageTime: -1 });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new chat room
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;
    if (!doctorId || !patientId) return res.status(400).json({ error: 'doctorId and patientId required' });
    // Check if chat already exists
    let chat = await Chat.findOne({ doctorId, patientId });
    if (!chat) {
      chat = new Chat({
        participants: [doctorId, patientId],
        doctorId,
        patientId,
        createdAt: new Date(),
      });
      await chat.save();
    }
    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages in a chat
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text } = req.body;
    if (!senderId || !text) return res.status(400).json({ error: 'senderId and text required' });
    const message = new Message({ chatId, senderId, text });
    await message.save();
    // Update chat with last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: text, lastMessageTime: new Date() });
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
