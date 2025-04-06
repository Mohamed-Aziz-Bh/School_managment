const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const UserSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true, trim: true, lowercase: true },
email:{type: String, required: true, unique: true, validate: {validator: (value) => validator.isEmail(value), message: 'Veuillez fournir une adresse email valide'} },
password: { type: String, required: true, unique: true, minlength: [6, 'le mot de passe doit contenir au moins 6 caractères'] },
role: { type: String, enum: ['admin', 'enseignant','etudiant','parent'], default: 'etudiant' },
image: {type: String, required: function(){return this.role === 'etudiant'|| this.role === 'enseignant';}},
niveau:{type: String, required: function(){return this.role === 'etudiant';}},
groupe:{type: String, required: function(){return this.role === 'etudiant';}},
matieres:{type: String, required: function(){return this.role === 'enseignant';}},
nombreEnfants:{type: Number, required: function(){return this.role === 'parent';}, min:[1, 'Un parent doit avoir au moins un enfant']},
enfants: {
    type: [{
      username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
          validator: async function(username) {
            const user = await mongoose.model('User').findOne({ 
              username: username,
              role: 'etudiant'
            });
            return user !== null;
          },
          message: 'Aucun étudiant trouvé avec ce username'
        }
      }
    }],
    required: function() { return this.role === 'parent'; },
    validate: {
      validator: function(enfants) {
        return this.role !== 'parent' || enfants.length === this.nombreEnfants;
      },
      message: 'Le nombre d\'enfants doit correspondre à la déclaration'
    }
},

  // Métadonnées
  dateInscription: {
    type: Date,
    default: Date.now
  },
  actif: {
    type: Boolean,
    default: true
  }
});

// Validation des enfants avant sauvegarde
UserSchema.pre('save', async function(next) {
    if (this.role === 'parent' && this.enfants) {
      // Vérification des doublons
      const usernames = this.enfants.map(e => e.username);
      const hasDuplicates = new Set(usernames).size !== usernames.length;
      if (hasDuplicates) {
        throw new Error('Vous ne pouvez pas déclarer le même enfant plusieurs fois');
      }
  
      // Vérification de l'existence des étudiants
      for (const enfant of this.enfants) {
        const studentExists = await mongoose.model('User').exists({
          username: enfant.username,
          role: 'etudiant'
        });
        if (!studentExists) {
          throw new Error(`L'étudiant ${enfant.username} n'existe pas`);
        }
      }
    }
    next();
  });
// Hash password before saving
UserSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
});
// Compare password
UserSchema.methods.comparePassword = async function (password) {
return await bcrypt.compare(password, this.password);
};
module.exports = mongoose.model('User', UserSchema);