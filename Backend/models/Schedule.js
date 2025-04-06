const mongoose = require('mongoose');
const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  },
  start_time: {
    type: String,
    required: true // format : "08:00"
  },
  end_time: {
    type: String,
    required: true // format : "10:00"
  },
  groupe: {
    type: String, // même format que `user.groupe`
    required: true
  },
  niveau: {
    type: String, // même format que `user.niveau`
    required: true
  },
  matiere: {
    type: String,
    required: true
  },
  enseignant: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
