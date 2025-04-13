const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const router = express.Router();
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
'1h' });
res.json({ 
    token,
    user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
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
      const enseignants = await User.find({ role: 'enseignant' });
      res.json(enseignants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
module.exports = router;