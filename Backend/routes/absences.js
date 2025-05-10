const express = require('express');
const router = express.Router();
const Absence = require('../models/Absence');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware pour vérifier si l'utilisateur est un enseignant
const isEnseignant = (req, res, next) => {
  if (req.user.role !== 'enseignant') {
    return res.status(403).json({ message: 'Accès refusé: enseignant uniquement' });
  }
  next();
};

// Récupérer toutes les absences d'un enseignant
router.get('/enseignant/:enseignantId', auth, async (req, res) => {
  try {
    const absences = await Absence.find({ enseignant: req.params.enseignantId })
      .populate('etudiant', 'username niveau groupe')
      .sort({ date: -1 });
    
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer les absences par niveau et groupe
router.get('/niveau/:niveau/groupe/:groupe', auth, isEnseignant, async (req, res) => {
  try {
    const { niveau, groupe } = req.params;
    
    const absences = await Absence.find({ 
      niveau, 
      groupe,
      enseignant: req.user.id 
    })
    .populate('etudiant', 'username niveau groupe')
    .sort({ date: -1 });
    
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ajouter une absence
router.post('/', auth, isEnseignant, async (req, res) => {
  try {
    const { etudiant, matiere, date, duree, motif, niveau, groupe } = req.body;
    
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
    
    const absence = new Absence({
      etudiant,
      enseignant: req.user.id,
      matiere,
      date,
      duree,
      motif,
      niveau,
      groupe
    });
    
    const savedAbsence = await absence.save();
    
    res.status(201).json(savedAbsence);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Modifier une absence
router.put('/:id', auth, isEnseignant, async (req, res) => {
  try {
    const { justifiee, motif } = req.body;
    
    const absence = await Absence.findById(req.params.id);
    
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }
    
    // Vérifier que l'enseignant est bien celui qui a créé l'absence
    if (absence.enseignant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette absence' });
    }
    
    absence.justifiee = justifiee;
    absence.motif = motif;
    
    const updatedAbsence = await absence.save();
    
    res.json(updatedAbsence);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une absence
router.delete('/:id', auth, isEnseignant, async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id);
    
    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }
    
    // Vérifier que l'enseignant est bien celui qui a créé l'absence
    if (absence.enseignant.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette absence' });
    }
    
    await absence.remove();
    
    res.json({ message: 'Absence supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Récupérer toutes les absences d'un étudiant
router.get('/etudiant/:etudiantId', async (req, res) => {
    try {
      const absences = await Absence.find({ etudiant: req.params.etudiantId })
        .sort({ date: -1 })
        .populate('enseignant', 'username');
      
      res.json(absences);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
