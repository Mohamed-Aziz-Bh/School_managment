const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();
const router = express.Router();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});
// Register
router.post('/register', async (req, res) => {
try {
const { username, email, password, role, image, niveau, groupe, matieres, nombreEnfants, enfants } = req.body;
const userData = {
    username,
    email,
    password,
    role,
    ...(role === 'etudiant' && { niveau, groupe, image }),
    ...(role === 'enseignant' && { matieres, image }),
    ...(role === 'parent' && { nombreEnfants, enfants })
  };
const user = new User(userData);
await user.save();
res.status(201).json({ message: 'User created successfully' });
} catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ 
          message: 'Username or email already exists' 
        });
    }
    res.status(400).json({ message: 'Error creating user', error: err.message });
}
});
// Login
router.post('/login', async (req, res) => {
try {
const { username, password } = req.body;
const user = await User.findOne({ username });
if (!user) return res.status(404).json({ message: 'User not found' });
const isMatch = await user.comparePassword(password);
if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn:
'6h' });
res.json({ 
    token,
    user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        actif: user.actif,
        ...(user.role === 'etudiant' && { niveau: user.niveau, groupe: user.groupe, image: user.image }),
        ...(user.role === 'enseignant' && { matieres: user.matieres, image: user.image }),
        ...(user.role === 'parent' && { nombreEnfants: user.nombreEnfants, enfants: user.enfants })
    } 
});
} catch (err) {
res.status(400).json({ message: 'Error logging in', error: err.message });
}
});

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});
// GET user by username
router.get('/users/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
});

// GET user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
});

// Modify user
router.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { username, email, role, image, niveau, groupe, matieres, nombreEnfants, enfants } = req.body;
        user.username = username;
        user.email = email;
        user.role = role;
        if (role === 'etudiant') {
            user.niveau = niveau;
            user.groupe = groupe;
            user.image = image;
            user.matieres = undefined;
            user.nombreEnfants = undefined;
            user.enfants = undefined;
        } else if (role === 'enseignant') {
            user.matieres = matieres;
            user.image = image;
            user.niveau = undefined;
            user.groupe = undefined;
            user.nombreEnfants = undefined;
            user.enfants = undefined;
        } else if (role === 'parent') {
            user.nombreEnfants = nombreEnfants;
            user.enfants = enfants;
            user.image = undefined;
            user.niveau = undefined;
            user.groupe = undefined;
            user.matieres = undefined;
        }

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(400).json({ 
            message: 'Error updating user', 
            error: err.message 
        });
    }
});
//DELETE user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

// Route pour récupérer tous les enseignants
router.get('/enseignants', async (req, res) => {
    try {
      const enseignants = await User.find({ role: 'enseignant',actif: true });
      res.json(enseignants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// Route pour activer/désactiver un utilisateur (admin seulement)
router.put('/users/:id/toggle-status', async (req, res) => {
    try {
      // Vérifier si l'utilisateur est un admin
      //if (req.user && req.user.role !== 'admin') {
        //return res.status(403).json({ message: 'Accès refusé: admin uniquement' });
      //}
      
      const { actif } = req.body;
      
      // Trouver l'utilisateur
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Vérifier si le statut change réellement
      const statusChanged = user.actif !== actif;
      
      // Mettre à jour le statut de l'utilisateur
      user.actif = actif;
      await user.save();
      
      // Envoyer un email si l'utilisateur est activé et le statut a changé
      if (actif && statusChanged) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Activation de votre compte - École',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Activation de votre compte</h2>
                <p>Bonjour <strong>${user.username}</strong>,</p>
                <p>Nous avons le plaisir de vous informer que votre compte a été <strong style="color: #27ae60;">activé</strong> par l'administration.</p>
                <p>Vous pouvez maintenant accéder à la plateforme avec vos identifiants définis lors de l'inscription</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Connectez-vous dès maintenant pour accéder à tous les services de l'établissement.</strong></p>
                </div>
                <p>Si vous avez des questions, n'hésitez pas à contacter l'administration.</p>
                <p>Cordialement,<br>L'équipe de l'établissement</p>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          console.log(`Email d'activation envoyé à ${user.email}`);
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
          // Ne pas faire échouer la requête si l'email ne peut pas être envoyé
        }
      }
      
      res.status(200).json({ 
        message: `Utilisateur ${actif ? 'activé' : 'désactivé'} avec succès${actif && statusChanged ? ' - Email de notification envoyé' : ''}`, 
        user 
      });
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
      res.status(500).json({ message: err.message || 'Erreur serveur' });
    }
});

  // Route pour assigner un groupe à un étudiant (admin seulement)
router.put('/users/:id/assign-group', async (req, res) => {
    try {
      console.log('User from token:', req.user); // Log pour déboguer
      console.log('Request body:', req.body); // Log pour déboguer
      
      // Vérifier si l'utilisateur est un admin
      //if (req.user.role !== 'admin') {
        //return res.status(403).json({ message: 'Accès refusé: admin uniquement' });
     // }
      
      const { groupe } = req.body;
      console.log('Groupe à assigner:', groupe); // Log pour déboguer
      
      // Vérifier si le groupe est valide
      if (!['A', 'B', 'C', 'D'].includes(groupe)) {
        return res.status(400).json({ message: 'Groupe invalide' });
      }
      
      // Trouver l'utilisateur et vérifier s'il est un étudiant
      const user = await User.findById(req.params.id);
      console.log('Utilisateur trouvé:', user ? user.username : 'non trouvé'); // Log pour déboguer
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      if (user.role !== 'etudiant') {
        return res.status(400).json({ message: 'Seuls les étudiants peuvent être assignés à un groupe' });
      }
      
      // Mettre à jour le groupe de l'étudiant
      user.groupe = groupe;
      await user.save();
      
      console.log('Groupe assigné avec succès'); // Log pour déboguer
      res.status(200).json({ message: 'Groupe assigné avec succès', user });
    } catch (err) {
      console.error('Erreur lors de l\'assignation du groupe:', err);
      res.status(500).json({ message: err.message || 'Erreur serveur' });
    }
  });

  // Dans routes/auth.js
router.get('/verify', (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
  });
  
  


// GET: Récupérer les informations d'un étudiant par son nom d'utilisateur
router.get('/student/:username', async (req, res) => {
  try {
    const student = await User.findOne({
      username: req.params.username,
      role: 'etudiant'
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    // Return all necessary fields that the frontend needs
    res.json({
      _id: student._id,
      username: student.username,
      email: student.email,
      niveau: student.niveau,
      groupe: student.groupe,
      image: student.image || null,
      role: student.role,
      actif: student.actif
    });
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: err.message });
  }
});

  
  
  
module.exports = router;