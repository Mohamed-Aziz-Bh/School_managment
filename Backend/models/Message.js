const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: false },
  text: { type: String, required: true },
  type: { type: String, enum: ['event', 'absence', 'announcement'], required: true },
  target: {
    type: String,
    enum: ['enseignants', 'etudiants'&&'parents', 'tous'],
    required: true,
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);