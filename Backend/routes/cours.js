const express = require('express');
const Cours = require('../models/Cours');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/cours');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cours-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: function (req, file, cb) {
    // Liste des types MIME autorisés
    const allowedMimeTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.presentation'
    ];
    
    const extname = path.extname(file.originalname).toLowerCase(); // Extension du fichier
    const mimetype = file.mimetype; // MIME type du fichier

    // Vérification de l'extension et du MIME type
    if (allowedMimeTypes.includes(mimetype) && ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.odt'].includes(extname)) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, Word, PowerPoint et OpenDocument sont autorisés!'));
    }
  }
});


// Créer un cours (enseignant seulement)
router.post('/', [auth, upload.single('file')], async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      // Supprimer le fichier uploadé si l'utilisateur n'est pas enseignant
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ 
        message: 'Seuls les enseignants peuvent créer des cours' 
      });
    }

    const { title, description, matiere, niveau, enseignant} = req.body;
  
    const cours = new Cours({
      title,
      description,
      matiere,
      niveau,
      file: {
        name: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      enseignant
    });

    await cours.save();
    res.status(201).json(cours);
  } catch (err) {
    // Supprimer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ 
      message: 'Erreur lors de la création du cours', 
      error: err.message 
    });
  }
});

// Lister tous les cours
router.get('/', async (req, res) => {
  try {
    const cours = await Cours.find();
    res.json(cours);
  } catch (err) {
    res.status(400).json({ 
      message: 'Erreur lors de la récupération des cours', 
      error: err.message 
    });
  }
});

// Lister les cours par matière
router.get('/matiere/:matiere', async (req, res) => {
  try {
    const cours = await Cours.find({ matiere: req.params.matiere });
    res.json(cours);
  } catch (err) {
    res.status(400).json({ 
      message: 'Erreur lors de la récupération des cours par matière', 
      error: err.message 
    });
  }
});

// Lister les cours par niveau
router.get('/niveau/:niveau', async (req, res) => {
  try {
    const cours = await Cours.find({ niveau: req.params.niveau });
    res.json(cours);
  } catch (err) {
    res.status(400).json({ 
      message: 'Erreur lors de la récupération des cours par niveau', 
      error: err.message 
    });
  }
});

// Lister les cours par enseignant
router.get('/enseignant/:enseignant', async (req, res) => {
  try {
    const cours = await Cours.find({ enseignant: req.params.enseignant });
    res.json(cours);
  } catch (err) {
    res.status(400).json({ 
      message: 'Erreur lors de la récupération des cours par enseignant', 
      error: err.message 
    });
  }
});

// Modifier un cours (enseignant seulement)
router.put('/:id', [auth, upload.single('file')], async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ 
        message: 'Seuls les enseignants peuvent modifier des cours' 
      });
    }

    const cours = await Cours.findById(req.params.id);
    if (!cours) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Mise à jour des données
    const { title, description, matiere, niveau, enseignant } = req.body;
    cours.title = title || cours.title;
    cours.description = description || cours.description;
    cours.matiere = matiere || cours.matiere;
    cours.niveau = niveau || cours.niveau;
    cours.enseignant = enseignant || cours.enseignant;

    // Si nouveau fichier est fourni
    if (req.file) {
      // Supprimer l'ancien fichier
      if (fs.existsSync(cours.file.path)) {
        fs.unlinkSync(cours.file.path);
      }
      // Mettre à jour avec le nouveau fichier
      cours.file = {
        name: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      };
    }

    await cours.save();
    res.json(cours);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ 
      message: 'Erreur lors de la modification du cours', 
      error: err.message 
    });
  }
});

// Supprimer un cours (enseignant seulement)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({ 
        message: 'Seuls les enseignants peuvent supprimer des cours' 
      });
    }

    const cours = await Cours.findById(req.params.id);
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Supprimer le fichier associé
    if (fs.existsSync(cours.file.path)) {
      fs.unlinkSync(cours.file.path);
    }

    await Cours.deleteOne({ _id: req.params.id });
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ 
      message: 'Erreur lors de la suppression du cours', 
      error: err.message 
    });
  }
});

module.exports = router;