import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/Register.css';
import logo from './assets/images/School-Logo.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'etudiant', // Valeur par défaut
    image: '',
    niveau: '',
    groupe: '',
    matieres: '',
    nombreEnfants: 1,
    enfants: []
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      // Réinitialiser les champs spécifiques au rôle lors du changement de rôle
      setFormData({
        ...formData,
        role: value,
        image: '',
        niveau: '',
        groupe: '',
        matieres: '',
        nombreEnfants: 1,
        enfants: []
      });
      setImagePreview(null);
    } else if (name === 'nombreEnfants') {
      const numEnfants = parseInt(value, 10);
      // Ajuster le tableau des enfants en fonction du nombre
      const newEnfants = Array(numEnfants).fill().map((_, i) => 
        formData.enfants[i] ? formData.enfants[i] : { username: '' }
      );
      
      setFormData({
        ...formData,
        nombreEnfants: numEnfants,
        enfants: newEnfants
      });
    } else if (name.startsWith('enfant-')) {
      const index = parseInt(name.split('-')[1], 10);
      const newEnfants = [...formData.enfants];
      newEnfants[index] = { username: value };
      
      setFormData({
        ...formData,
        enfants: newEnfants
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Vérification de la correspondance des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      // Préparer les données à envoyer selon le rôle
      const dataToSend = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Ajouter les champs spécifiques au rôle
      if (formData.role === 'etudiant') {
        dataToSend.niveau = formData.niveau;
        dataToSend.groupe = formData.groupe;
        dataToSend.image = formData.image;
      } else if (formData.role === 'enseignant') {
        dataToSend.matieres = formData.matieres;
        dataToSend.image = formData.image;
      } else if (formData.role === 'parent') {
        dataToSend.nombreEnfants = formData.nombreEnfants;
        dataToSend.enfants = formData.enfants;
      }

      // Appel à l'API pour l'inscription
      const response = await axios.post('http://localhost:5001/api/auth/register', dataToSend);
      
      // Redirection vers la page de connexion après inscription réussie
      alert('Inscription réussie! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="site-logo">
      <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="register-form-container">
        <h2>Créer un compte</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          
          {/* Champs spécifiques pour les étudiants */}
          {formData.role === 'etudiant' && (
            <>
              <div className="form-group">
                <label htmlFor="niveau">Niveau</label>
                <select
                  id="niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="4ème">4ème</option>
                  <option value="3ème">3ème</option>
                  <option value="2ème">2ème</option>
                  <option value="1ère">1ère</option>
                  <option value="Terminale">Terminale</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Photo de profil</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://exemple.com/image.jpg"
                  required
                />
                {formData.image && (
                 <div className="image-preview">
                   <img src={formData.image} alt="Aperçu" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                 </div>
                )}
              </div>
            </>
          )}
          
          {/* Champs spécifiques pour les enseignants */}
          {formData.role === 'enseignant' && (
            <>
              <div className="form-group">
                <label htmlFor="matieres">Matières enseignées</label>
                <input
                  type="text"
                  id="matieres"
                  name="matieres"
                  value={formData.matieres}
                  onChange={handleChange}
                  placeholder="Ex: Mathématiques, Physique"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Photo de profil</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://exemple.com/image.jpg"
                  required
                />
                {formData.image && (
                 <div className="image-preview">
                   <img src={formData.image} alt="Aperçu" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                 </div>
                )}
              </div>
            </>
          )}
          
          {/* Champs spécifiques pour les parents */}
          {formData.role === 'parent' && (
            <>
              <div className="form-group">
                <label htmlFor="nombreEnfants">Nombre d'enfants</label>
                <input
                  type="number"
                  id="nombreEnfants"
                  name="nombreEnfants"
                  value={formData.nombreEnfants}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              
              {Array.from({ length: formData.nombreEnfants }).map((_, index) => (
                <div className="form-group" key={index}>
                  <label htmlFor={`enfant-${index}`}>
                    Nom d'utilisateur de l'enfant {index + 1}
                  </label>
                  <input
                    type="text"
                    id={`enfant-${index}`}
                    name={`enfant-${index}`}
                    value={formData.enfants[index]?.username || ''}
                    onChange={handleChange}
                    required
                    placeholder="Nom d'utilisateur de l'étudiant"
                  />
                </div>
              ))}
            </>
          )}
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>
        
        <div className="login-link">
          Déjà inscrit? <a href="/login">Se connecter</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
