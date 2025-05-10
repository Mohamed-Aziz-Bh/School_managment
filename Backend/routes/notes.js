const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware pour vérifier si l'utilisateur est un enseignant
const isEnseignant = (req, res, next) => {
  if (req.user.role !== 'enseignant') {
    return res.status(403).json({ message: 'Accès refusé: enseignant uniquement' });
  }
  next();
};

// Récupérer toutes les notes d'un enseignant
router.get('/enseignant/:enseignantId', auth, async (req, res) => {
  try {
    const notes = await Note.find({ enseignant: req.params.enseignantId })
      .populate('etudiant', 'username niveau groupe')
      .sort({ date: -1 });
    
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer les notes par niveau et groupe
router.get('/niveau/:niveau/groupe/:groupe', auth, isEnseignant, async (req, res) => {
  try {
    const { niveau, groupe } = req.params;
    
    const notes = await Note.find({ 
      niveau, 
      groupe,
      enseignant: req.user.id 
    })
    .populate('etudiant', 'username niveau groupe')
    .sort({ date: -1 });
    
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer les étudiants d'un niveau et groupe
router.get('/etudiants/niveau/:niveau/groupe/:groupe', auth, isEnseignant, async (req, res) => {
  try {
    const { niveau, groupe } = req.params;
    
    const etudiants = await User.find({ 
      role: 'etudiant',
      niveau,
      groupe,
      actif: true
    }).select('_id username niveau groupe');
    
    res.json(etudiants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ajouter une note
router.post('/', auth, isEnseignant, async (req, res) => {
  try {
    const { etudiant, matiere, valeur, type, titre, commentaire, niveau, groupe } = req.body;
    
    // Vérifier si l'étudiant existe
    const etudiantExists = await User.findOne({ 
      _id: etudiant, 
      role: 'etudiant',
      niveau,
      groupe
    });
    
    if (!etudiantExists) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    const note = new Note({
      etudiant,
      enseignant: req.user.id,
      matiere,
      valeur,
      type,
      titre,
      commentaire,
      niveau,
      groupe
    });
    
    const savedNote = await note.save();
    
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Modifier une note
router.put('/:id', auth, isEnseignant, async (req, res) => {
  try {
    const { valeur, commentaire } = req.body;
    
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    // Vérifier que l'enseignant est bien celui qui a créé la note
    if (note.enseignant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette note' });
    }
    
    note.valeur = valeur;
    note.commentaire = commentaire;
    
    const updatedNote = await note.save();
    
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une note
router.delete('/:id', auth, isEnseignant, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note non trouvée' });
    }
    
    // Vérifier que l'enseignant est bien celui qui a créé la note
    if (note.enseignant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette note' });
    }
    
    await note.remove();
    
    res.json({ message: 'Note supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Récupérer toutes les notes d'un étudiant
router.get('/etudiant/:etudiantId', async (req, res) => {
    try {
      const notes = await Note.find({ etudiant: req.params.etudiantId })
        .sort({ date: -1 })
        .populate('enseignant', 'username');
      
      res.json(notes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
