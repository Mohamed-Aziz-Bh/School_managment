const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  valeur: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  type: {
    type: String,
    enum: ['devoir', 'examen', 'controle', 'autre'],
    default: 'devoir'
  },
  titre: {
    type: String,
    required: true
  },
  commentaire: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
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

module.exports = mongoose.model('Note', noteSchema);
