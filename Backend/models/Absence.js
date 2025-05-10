const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enseignant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matiere: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duree: {
    type: Number, // Durée en heures
    required: true,
    default: 1
  },
  justifiee: {
    type: Boolean,
    default: false
  },
  motif: {
    type: String
  },
  niveau: {
    type: String,
    required: true
  },
  groupe: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Absence', absenceSchema);
