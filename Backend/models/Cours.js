const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const CoursSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  file: {
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    }
  },
  matiere: {
    type: String,
    required: true
  },
  niveau: {
    type: String,
    required: true
  },
  enseignant: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware pour supprimer le fichier physique quand le cours est supprimé
CoursSchema.pre('remove', function(next) {
  const filePath = path.join(__dirname, '..', this.file.path);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Erreur lors de la suppression du fichier:", err);
    });
  }
  next();
});

// Mise à jour automatique de la date de modification
CoursSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cours', CoursSchema);