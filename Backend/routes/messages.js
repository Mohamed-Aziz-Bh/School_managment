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

module.exports = router;
