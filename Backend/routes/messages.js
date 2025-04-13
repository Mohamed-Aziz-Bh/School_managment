const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');


const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé : admin uniquement' });
    }
    next();
};

// Configuration de Nodemailer pour l'envoi d'email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST : Créer un message
router.post('/', auth, isAdmin, async (req, res) => {
  const { title, image, text, type, target } = req.body;

  try {
    // Créer le message
    const newMessage = new Message({ title, image, text, type, target });
    await newMessage.save();

    // Trouver les utilisateurs selon le groupe cible
    let users;
    if (target === 'tous') {
      users = await User.find({ role: { $ne: 'admin' } }); // tous sauf admin
    } else {
      users = await User.find({ role: target }); // Cibler un rôle spécifique
    }

    // Envoyer un email à chaque utilisateur ciblé
    const mailPromises = users.map(user => {
      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Nouveau message dans votre boîte de réception',
        text: `Bonjour ${user.username},\n\nIl y a un nouveau message de la part de l'administration.\n\nMerci Merci de vérifier votre boîte de réception pour plus de détails.\n\nCordialement,\nL'équipe de gestion de l'établissement`,
      });
    });

    // Attendre que tous les emails soient envoyés
    await Promise.all(mailPromises);

    res.status(201).json({ message: 'Message créé et email envoyé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET : Récupérer tous les messages
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET : Récupérer les messages par cible (target)
router.get('/target/:target', auth, isAdmin, async (req, res) => {
  try {
    const { target } = req.params;
    const messages = await Message.find({ target }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET : Récupérer les messages pour les enseignants
router.get('/for-teachers', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    // Récupérer les messages destinés aux enseignants ou à tous
    const messages = await Message.find({
      $or: [
        { target: 'enseignants' },
        { target: 'tous' }
      ]
    }).sort({ date: -1 });
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
