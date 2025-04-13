const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const auth = require('../middleware/auth'); // middleware auth

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé : admin uniquement' });
    }
    next();
};
// Route accessible uniquement à l'admin
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const { day, start_time, end_time, groupe, niveau, matiere, enseignant, salle } = req.body;
    
        const schedule = new Schedule({ day, start_time, end_time, groupe, niveau, matiere, enseignant, salle });
        await schedule.save();
    
        res.status(201).json({ message: 'Emploi du temps créé avec succès', schedule });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
});
// Modifier un emploi du temps
router.put('/:id', auth, isAdmin, async (req, res) => {
    try {
      const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedSchedule) return res.status(404).json({ message: "Emploi du temps introuvable" });
  
      res.status(200).json({ message: 'Modifié avec succès', schedule: updatedSchedule });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // Supprimer un emploi du temps
  router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
      const deleted = await Schedule.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Emploi du temps introuvable" });
  
      res.status(200).json({ message: 'Supprimé avec succès' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
// Emploi du temps par groupe et niveau
router.get('/groupe/:groupe/niveau/:niveau', async (req, res) => {
    const { groupe, niveau } = req.params;
    const schedule = await Schedule.find({ groupe, niveau });
    res.json(schedule);
  });
  
  // Emploi du temps d’un enseignant
  router.get('/enseignant/:enseignant', async (req, res) => {
    const schedule = await Schedule.find({ enseignant: req.params.enseignant });
    res.json(schedule);
  });


module.exports = router;
