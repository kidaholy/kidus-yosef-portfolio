const express = require('express');
const rateLimit = require('express-rate-limit');
const Message = require('../models/Message');
const mongoose = require('mongoose');

const router = express.Router();

// In-memory store when MongoDB is unavailable (dev convenience only)
const memoryMessages = [];

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' },
});

const dbOn = () => mongoose.connection.readyState === 1;

// @route   POST /api/messages
// @desc    Receive contact-form submissions
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }
    if (dbOn()) {
      const created = await Message.create({ name, email, message });
      return res.status(201).json({ ok: true, id: created._id, stored: 'database' });
    }
    const id = `mem_${Date.now()}`;
    memoryMessages.unshift({ _id: id, name, email, message, read: false, createdAt: new Date() });
    res.status(201).json({ ok: true, id, stored: 'memory' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
    }
    console.error(`message error: ${err.message}`);
    res.status(500).json({ message: 'Could not save your message. Please try again.' });
  }
});

// --- Admin (Basic Auth) ---

const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  // NOTE: no WWW-Authenticate header here on purpose — sending it makes the
  // browser pop its native Basic-Auth login dialog. Admin login is handled
  // exclusively by the in-page form on /messages.
  if (scheme !== 'Basic' || !encoded) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const [user, pass] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'kidus2026';
  if (user === expectedUser && pass === expectedPass) return next();
  res.status(401).json({ message: 'Unauthorized' });
};

// @route   GET /api/messages
// @desc    List all messages (newest first)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const messages = dbOn()
      ? await Message.find().sort({ createdAt: -1 }).lean()
      : memoryMessages;
    // Client shows a persistence warning when the store is memory-only
    res.set('X-Store-Mode', dbOn() ? 'database' : 'memory');
    res.json(messages);
  } catch (err) {
    console.error(`list messages error: ${err.message}`);
    res.status(500).json({ message: 'Failed to load messages' });
  }
});

// @route   PATCH /api/messages/:id
// @desc    Mark message read/unread
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { read } = req.body;
    if (dbOn()) {
      const updated = await Message.findByIdAndUpdate(req.params.id, { read: !!read }, { new: true }).lean();
      if (!updated) return res.status(404).json({ message: 'Message not found' });
      return res.json(updated);
    }
    const msg = memoryMessages.find((m) => m._id === req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    msg.read = !!read;
    res.json(msg);
  } catch (err) {
    console.error(`update message error: ${err.message}`);
    res.status(500).json({ message: 'Failed to update message' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (dbOn()) {
      const deleted = await Message.findByIdAndDelete(req.params.id).lean();
      if (!deleted) return res.status(404).json({ message: 'Message not found' });
      return res.json({ ok: true });
    }
    const idx = memoryMessages.findIndex((m) => m._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Message not found' });
    memoryMessages.splice(idx, 1);
    res.json({ ok: true });
  } catch (err) {
    console.error(`delete message error: ${err.message}`);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

module.exports = router;
