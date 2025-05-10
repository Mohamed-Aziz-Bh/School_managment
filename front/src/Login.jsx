import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './styles/Login.css';
import logo from './assets/images/School-Logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appel à l'API pour la connexion
      const response = await api.post('/auth/login', formData);
      
      // Vérifier si la réponse contient les données attendues
      if (!response.data || !response.data.user) {
        setError('Réponse du serveur invalide');
        return;
      }
      
      // Vérifier si l'utilisateur est activé
      if (response.data.user.actif === false) {
        setError('Votre compte n\'est pas encore activé. Veuillez contacter l\'administrateur.');
        return;
      }
      
      // Stocker le token et les informations utilisateur dans localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirection basée sur le rôle de l'utilisateur
      redirectBasedOnRole(response.data.user.role);
      
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      // Gestion des différents types d'erreurs
      if (err.response) {
        // Le serveur a répondu avec un code d'erreur
        setError(err.response.data?.message || `Erreur ${err.response.status}: ${err.response.statusText}`);
      } else if (err.request) {
        // La requête a été faite mais pas de réponse reçue
        setError('Aucune réponse du serveur. Veuillez vérifier votre connexion internet.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        setError('Erreur lors de la connexion: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
    
  // Fonction de redirection basée sur le rôle
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'enseignant':
        navigate('/dashboard/enseignant');
        break;
      case 'etudiant':
        navigate('/dashboard/etudiant');
        break;
      case 'parent':
        navigate('/dashboard/parent');
        break;
      default:
        navigate('/');
        break;
    }
  };

  return (
    <div className="login-container">
      <div className="site-logo">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="login-form-container">
        <h2>Connexion</h2>
        
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
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <div className="register-link">
          Pas encore de compte ? <a href="/register">S'inscrire</a>
        </div>
        
        <div className="forgot-password">
          <a href="/forgot-password">Mot de passe oublié ?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
